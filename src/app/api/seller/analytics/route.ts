import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import {
    sellerKpis,
    sellerSeries,
    topSellerProducts,
    type RangeKey,
} from "@/lib/services/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RangeParam = RangeKey;

function parseRange(req: Request): { range: RangeKey; from?: Date; to?: Date } {
    const url = new URL(req.url);
    const range = (url.searchParams.get("range") ?? "30d") as RangeKey;
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    return { range, from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined };
}

/**
 * GET /api/seller/analytics?range=30d — KPIs + revenue series + top products
 * scoped to the seller's own catalog.
 */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const { range, from, to } = parseRange(req);
        const [kpis, series, top] = await Promise.all([
            sellerKpis(authed.user.id, range, from, to),
            sellerSeries(authed.user.id, range, from, to),
            topSellerProducts(authed.user.id, range, from, to),
        ]);

        const [recentOrders, recentReviews] = await Promise.all([
            prisma.order.findMany({
                where: { items: { some: { product: { sellerId: authed.user.id } } } },
                orderBy: { createdAt: "desc" },
                take: 8,
                select: { id: true, total: true, status: true, createdAt: true },
            }),
            prisma.review.findMany({
                where: { product: { sellerId: authed.user.id } },
                orderBy: { createdAt: "desc" },
                take: 8,
                select: { id: true, rating: true, comment: true, createdAt: true, product: { select: { title: true } } },
            }),
        ]);

        return ok({ kpis, series, top, recentOrders, recentReviews });
    } catch (e) {
        return toResponse(e, "[seller.analytics]");
    }
}
