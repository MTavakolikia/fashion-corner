import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/orders — orders containing at least one of the seller's products.
 * Item list is scoped to the seller's products (multi-seller orders stay private).
 */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;
        const status = url.searchParams.get("status");

        const where = {
            items: { some: { product: { sellerId: authed.user.id } } },
            ...(status ? { status: status as never } : {}),
        };
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    items: {
                        where: { product: { sellerId: authed.user.id } },
                        include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true } } },
                    },
                    shippingAddress: {
                        select: { fullName: true, address: true, city: true, state: true, zipCode: true, phone: true },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return ok({
            orders,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    } catch (e) {
        return toResponse(e, "[seller.orders]");
    }
}
