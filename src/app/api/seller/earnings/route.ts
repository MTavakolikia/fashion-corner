import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/earnings?range=30d — payout summary for the seller's orders.
 */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const url = new URL(req.url);
        const range = url.searchParams.get("range") ?? "30d";
        const start = new Date();
        const days = range === "today" ? 0 : range === "yesterday" ? 1 : range === "7d" ? 7 : range === "90d" ? 90 : range === "year" ? 365 : 30;
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);

        const [paid, refunded, byStatus] = await Promise.all([
            prisma.$queryRaw<Array<{ total: number; count: number }>>`
                SELECT COALESCE(SUM(oi.price * oi.quantity), 0)::float AS "total",
                       COUNT(DISTINCT oi."orderId")::int AS "count"
                FROM "orderitem" oi
                JOIN "product" p ON p.id = oi."productId"
                JOIN "order" o ON o.id = oi."orderId"
                WHERE p."sellerId" = ${authed.user.id}
                  AND o."paymentStatus" = 'PAID'
                  AND o.status <> 'CANCELLED'
                  AND oi."createdAt" >= ${start}
            `,
            prisma.refund.aggregate({
                where: {
                    status: { in: ["APPROVED", "COMPLETED"] },
                    order: { items: { some: { product: { sellerId: authed.user.id } } }, createdAt: { gte: start } },
                },
                _sum: { amount: true },
            }),
            prisma.order.groupBy({
                by: ["status"],
                where: { items: { some: { product: { sellerId: authed.user.id } } } },
                _count: { id: true },
            }),
        ]);

        const gross = paid[0]?.total ?? 0;
        const refunds = refunded._sum.amount ?? 0;
        return ok({
            gross,
            refunds,
            net: Math.max(gross - refunds, 0),
            orders: paid[0]?.count ?? 0,
            byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
            currency: "USD",
        });
    } catch (e) {
        return toResponse(e, "[seller.earnings]");
    }
}
