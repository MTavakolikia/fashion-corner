import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
    id: z.string().optional(),
    externalId: z.string().optional(),
    title: z.string().min(1).max(200),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    category: z.string().min(1),
    brand: z.string().optional(),
    sku: z.string().optional(),
    stock: z.number().int().nonnegative().default(0),
    image: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    tags: z.array(z.string()).optional(),
});

const bodySchema = z.object({
    items: z.array(itemSchema).min(1).max(200),
});

/**
 * POST /api/import-products — admin-only bulk import (upsert by externalId or id).
 * Rate limited and capped at 200 items per call.
 */
export async function POST(req: Request) {
    try {
        rateLimit(req, "import-products");
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid import payload.", 400, (e as { issues?: unknown }).issues);
        }

        const results = await prisma.$transaction(async (tx) => {
            const out: { imported: number; skipped: number; errors: string[] } = { imported: 0, skipped: 0, errors: [] };
            for (const item of body.items) {
                try {
                    const id = item.id ?? `ext_${item.externalId ?? crypto.randomUUID()}`;
                    const data = {
                        title: item.title,
                        slug: item.slug ?? undefined,
                        description: item.description ?? "",
                        price: item.price,
                        compareAtPrice: item.compareAtPrice ?? null,
                        category: item.category,
                        brand: item.brand ?? null,
                        sku: item.sku ?? null,
                        stock: item.stock,
                        image: item.image ?? item.images?.[0] ?? null,
                        mainImage: item.images?.[0] ?? null,
                        images: (item.images ?? (item.image ? [item.image] : [])) as Prisma.InputJsonValue,
                        status: item.status ?? "PUBLISHED",
                        tags: JSON.stringify(item.tags ?? []),
                        externalId: item.externalId ?? null,
                        updatedAt: new Date(),
                    };
                    if (item.externalId) {
                        await tx.product.upsert({
                            where: { externalId: item.externalId },
                            update: data,
                            create: { id, ...data, sellerId: authed.user.id },
                        });
                        out.imported++;
                    } else {
                        await tx.product.create({ data: { id, ...data, sellerId: authed.user.id } });
                        out.imported++;
                    }
                } catch (err) {
                    out.errors.push(`${item.externalId ?? item.id ?? "?"}: ${(err as Error).message?.slice(0, 200)}`);
                }
            }
            return out;
        });

        auditLog(authed.user.id, AUDIT_ACTIONS.PRODUCT_CREATED, "import", undefined, {
            imported: results.imported,
            errors: results.errors.length,
        });
        return ok(results, { status: 201 });
    } catch (e) {
        return toResponse(e, "[import-products]");
    }
}
