import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { RangeKey } from "@/lib/services/products";
import { rangeFor } from "@/lib/services/products";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics?range=30d — platform KPIs + revenue/orders series
 * + category & seller performance (admin only).
 */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const range = (url.searchParams.get("range") ?? "30d") as RangeKey;
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        const { start, end } = rangeFor(range, from ? new Date(from) : undefined, to ? new Date(to) : undefined);

        const money = await prisma.$queryRaw<Array<{ gross: number; refunds: number; orders: number; customers: number }>>`
            SELECT
              COALESCE(SUM(CASE WHEN o."paymentStatus" = 'PAID' THEN oi.price * oi.quantity END), 0)::float AS "gross",
              COALESCE((
                SELECT SUM(r.amount) FROM "refund" r
                WHERE r.status IN ('APPROVED','COMPLETED')
                  AND r."createdAt" >= ${start} AND r."createdAt" < ${end}
              ), 0)::float AS "refunds",
              COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' THEN o.id END)::int AS "orders",
              COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' THEN o."userId" END)::int AS "customers"
            FROM "orderitem" oi
            JOIN "order" o ON o.id = oi."orderId"
            WHERE o.status <> 'CANCELLED'
              AND oi."createdAt" >= ${start}
              AND oi."createdAt" < ${end}
        `;

        const [customers, sellers, products, pendingOrders, pendingReturns, series] = await Promise.all([
            prisma.user.count({ where: { role: "USER" } }),
            prisma.user.count({ where: { role: "SELLER" } }),
            prisma.product.count({ where: { status: "PUBLISHED" } }),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.return_request.count({ where: { status: "REQUESTED" } }),
            prisma.$queryRaw<Array<{ day: string; revenue: number; orders: number }>>`
                SELECT to_char(DATE_TRUNC('day', oi."createdAt"), 'YYYY-MM-DD') AS "day",
                       COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::float AS "revenue",
                       COUNT(DISTINCT o.id)::int AS "orders"
                FROM "orderitem" oi
                JOIN "order" o ON o.id = oi."orderId"
                WHERE o.status <> 'CANCELLED'
                  AND oi."createdAt" >= ${start}
                  AND oi."createdAt" < ${end}
                GROUP BY 1
                ORDER BY 1
            `,
        ]);

        const catPerf = await prisma.$queryRaw<Array<{ category: string; revenue: number; units: number }>>`
            SELECT p.category,
                   COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::float AS "revenue",
                   COALESCE(SUM(oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::int AS "units"
            FROM "product" p
            LEFT JOIN "orderitem" oi ON oi."productId" = p.id
            LEFT JOIN "order" o ON o.id = oi."orderId" AND o.status <> 'CANCELLED'
            WHERE oi."createdAt" >= ${start} OR oi."createdAt" IS NULL
            GROUP BY p.category
            ORDER BY "revenue" DESC
            LIMIT 8
        `;

        const sellerPerf = await prisma.$queryRaw<Array<{ sellerId: string; revenue: number; units: number }>>`
            SELECT p."sellerId",
                   COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::float AS "revenue",
                   COALESCE(SUM(oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::int AS "units"
            FROM "product" p
            LEFT JOIN "orderitem" oi ON oi."productId" = p.id
            LEFT JOIN "order" o ON o.id = oi."orderId" AND o.status <> 'CANCELLED'
            WHERE p."sellerId" IS NOT NULL
              AND (oi."createdAt" >= ${start} OR oi."createdAt" IS NULL)
            GROUP BY p."sellerId"
            ORDER BY "revenue" DESC
            LIMIT 8
        `;

        const m = money[0] ?? { gross: 0, refunds: 0, orders: 0, customers: 0 };
        const net = Math.max(m.gross - m.refunds, 0);
        const aov = m.orders > 0 ? m.gross / m.orders : 0;

        return ok({
            kpis: {
                gross: m.gross,
                net,
                refunds: m.refunds,
                orders: m.orders,
                customers,
                sellers,
                products,
                aov,
                pendingOrders,
                pendingReturns,
            },
            series,
            categoryPerformance: catPerf,
            sellerPerformance: sellerPerf,
        });
    } catch (e) {
        return toResponse(e, "[admin.analytics]");
    }
}
