import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rangeFor } from "@/lib/services/products";
import { ok } from "@/lib/http";
import { notFound } from "next/navigation";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const range = (params.range ?? "30d") as any;
    const from = params.from ? new Date(params.from) : undefined;
    const to = params.to ? new Date(params.to) : undefined;
    const { start, end } = rangeFor(range, from, to);

    const [kpis, series, catPerf, sellerPerf] = await Promise.all([
        prisma.$queryRaw<Array<{ gross: number; refunds: number; orders: number; customers: number }>>`
            SELECT
              COALESCE(SUM(CASE WHEN o."paymentStatus" = 'PAID' THEN oi.price * oi.quantity END), 0)::float AS "gross",
              COALESCE((SELECT SUM(r.amount) FROM "refund" r WHERE r.status IN ('APPROVED','COMPLETED') AND r."createdAt" >= ${start} AND r."createdAt" < ${end}), 0)::float AS "refunds",
              COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' THEN o.id END)::int AS "orders",
              COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' THEN o."userId" END)::int AS "customers"
            FROM "orderitem" oi JOIN "order" o ON o.id = oi."orderId"
            WHERE o.status <> 'CANCELLED' AND oi."createdAt" >= ${start} AND oi."createdAt" < ${end}
        `,
        prisma.$queryRaw<Array<{ day: string; revenue: number; orders: number }>>`
            SELECT to_char(DATE_TRUNC('day', oi."createdAt"), 'YYYY-MM-DD') AS "day",
                   COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::float AS "revenue",
                   COUNT(DISTINCT o.id)::int AS "orders"
            FROM "orderitem" oi JOIN "order" o ON o.id = oi."orderId"
            WHERE o.status <> 'CANCELLED' AND oi."createdAt" >= ${start} AND oi."createdAt" < ${end}
            GROUP BY 1 ORDER BY 1
        `,
        prisma.$queryRaw<Array<{ category: string; revenue: number; units: number }>>`
            SELECT p.category,
                   COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::float AS "revenue",
                   COALESCE(SUM(oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::int AS "units"
            FROM "product" p LEFT JOIN "orderitem" oi ON oi."productId" = p.id LEFT JOIN "order" o ON o.id = oi."orderId" AND o.status <> 'CANCELLED'
            WHERE oi."createdAt" >= ${start} OR oi."createdAt" IS NULL
            GROUP BY p.category ORDER BY "revenue" DESC LIMIT 8
        `,
        prisma.$queryRaw<Array<{ sellerId: string; revenue: number; units: number }>>`
            SELECT p."sellerId",
                   COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::float AS "revenue",
                   COALESCE(SUM(oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID'), 0)::int AS "units"
            FROM "product" p LEFT JOIN "orderitem" oi ON oi."productId" = p.id LEFT JOIN "order" o ON o.id = oi."orderId" AND o.status <> 'CANCELLED'
            WHERE p."sellerId" IS NOT NULL AND (oi."createdAt" >= ${start} OR oi."createdAt" IS NULL)
            GROUP BY p."sellerId" ORDER BY "revenue" DESC LIMIT 8
        `,
    ]);

    const m = kpis[0] ?? { gross: 0, refunds: 0, orders: 0, customers: 0 };
    const net = Math.max(m.gross - m.refunds, 0);
    const aov = m.orders > 0 ? m.gross / m.orders : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Analytics</h2>
                <RangeSelector current={range} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Gross Revenue" value={`$${m.gross.toFixed(2)}`} />
                <StatCard label="Net Revenue" value={`$${net.toFixed(2)}`} highlight />
                <StatCard label="Refunds" value={`$${m.refunds.toFixed(2)}`} alert />
                <StatCard label="Orders" value={m.orders.toString()} />
                <StatCard label="Customers" value={m.customers.toString()} />
                <StatCard label="AOV" value={`$${aov.toFixed(2)}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Timeline</h3>
                    <SeriesChart series={(series as any[]) || []} />
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category Performance</h3>
                    <div className="space-y-2">
                        {((catPerf as any[]) || []).map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{c.category}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">${c.revenue.toFixed(2)}</span>
                                    <span className="text-muted-foreground">{c.units} units</span>
                                </div>
                            </div>
                        ))}
                        {(!catPerf || (catPerf as any[]).length === 0) && <p className="text-sm text-muted-foreground">No data for this period.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, highlight, alert }: { label: string; value: string; highlight?: boolean; alert?: boolean }) {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : alert ? "border-red-200 dark:border-red-900/50" : "border-gray-200 dark:border-gray-800"}`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${alert ? "text-red-600" : highlight ? "text-primary" : "text-gray-900 dark:text-white"}`}>{value}</p>
        </div>
    );
}

function RangeSelector({ current }: { current: string }) {
    return (
        <select defaultValue={current} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
        </select>
    );
}

function SeriesChart({ series }: { series: { day: string; revenue: number; orders: number }[] }) {
    if (series.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
    const maxRev = Math.max(...series.map((s) => s.revenue), 1);
    return (
        <div className="flex items-end gap-0.5 h-40">
            {series.slice(-30).map((s, i) => {
                const height = Math.max(4, (s.revenue / maxRev) * 100);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary/70 hover:bg-primary rounded-t transition-colors min-h-[4px]" style={{ height: `${height}%` }} title={`${s.day}: $${s.revenue.toFixed(2)}`} />
                        {i % 5 === 0 && <span className="text-[10px] text-muted-foreground hidden sm:block">{s.day.slice(5)}</span>}
                    </div>
                );
            })}
        </div>
    );
}
