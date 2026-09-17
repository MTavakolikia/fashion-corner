import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

/** GET /api/admin/products?q=&status=&sellerId=&page= — all products. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const q = url.searchParams.get("q");
        const status = url.searchParams.get("status");
        const sellerId = url.searchParams.get("sellerId");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const where: Prisma.productWhereInput = {
            ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {}),
            ...(status ? { status: status as never } : {}),
            ...(sellerId ? { sellerId } : {}),
        };
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sku: true,
                    price: true,
                    compareAtPrice: true,
                    stock: true,
                    status: true,
                    sellerId: true,
                    category: true,
                    brand: true,
                    createdAt: true,
                },
            }),
            prisma.product.count({ where }),
        ]);

        // Attach seller names for the visible page (single follow-up query).
        const sellerIds = [...new Set(products.map((p) => p.sellerId).filter((v): v is string => !!v))];
        const sellerMap = new Map(
            (await prisma.user.findMany({
                where: { id: { in: sellerIds } },
                select: { id: true, name: true, email: true },
            })).map((u) => [u.id, { name: u.name, email: u.email }])
        );
        const rows = products.map((p) => ({ ...p, seller: p.sellerId ? sellerMap.get(p.sellerId) ?? null : null }));

        return ok({ products: rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.products]");
    }
}

/**
 * POST /api/admin/products/bulk — bulk status change / delete (admin only).
 * Body: { ids: string[], action: "publish" | "unpublish" | "archive" | "delete" }
 */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const body = z
            .object({
                ids: z.array(z.string()).min(1).max(100),
                action: z.enum(["publish", "unpublish", "archive", "delete"]),
            })
            .parse(await req.json());

        const result = await prisma.$transaction(async (tx) => {
            switch (body.action) {
                case "publish":
                    return tx.product.updateMany({ where: { id: { in: body.ids } }, data: { status: "PUBLISHED", publishedAt: new Date() } });
                case "unpublish":
                    return tx.product.updateMany({ where: { id: { in: body.ids } }, data: { status: "DRAFT" } });
                case "archive":
                    return tx.product.updateMany({ where: { id: { in: body.ids } }, data: { status: "ARCHIVED" } });
                case "delete":
                    // Only delete products without order history; archive the rest.
                    const withHistory = await tx.product.findMany({
                        where: { id: { in: body.ids }, orderItems: { some: {} } },
                        select: { id: true },
                    });
                    const deletable = body.ids.filter((id) => !withHistory.some((w) => w.id === id));
                    await Promise.all([
                        deletable.length ? tx.product.deleteMany({ where: { id: { in: deletable } } }) : Promise.resolve(),
                        withHistory.length ? tx.product.updateMany({ where: { id: { in: withHistory.map((w) => w.id) } }, data: { status: "ARCHIVED" } }) : Promise.resolve(),
                    ]);
                    return { count: deletable.length + withHistory.length };
            }
        });

        auditLog(authed.user.id, AUDIT_ACTIONS.PRODUCT_UPDATED, "product_bulk", undefined, { action: body.action, ids: body.ids });
        return ok({ affected: "count" in (result as object) ? (result as { count: number }).count : body.ids.length });
    } catch (e) {
        if (e instanceof z.ZodError) return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, e.issues);
        return toResponse(e, "[admin.products.bulk]");
    }
}
