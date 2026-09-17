import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rangeFor } from "@/lib/services/products";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const range = (params.range ?? "30d") as any;
    const { start, end } = rangeFor(range);

    const [topProducts, topSellers, categoryBreakdown] = await Promise.all([
        prisma.$queryRaw<Array<{ productId: string; title: string; quantity: number; revenue: number }>>`
            SELECT p.id AS "productId", p.title, SUM(oi.quantity)::int AS "quantity", COALESCE(SUM(oi.price * oi.quantity), 0)::float AS "revenue"
            FROM "orderitem" oi JOIN "product" p ON p.id = oi."productId"
            JOIN "order" o ON o.id = oi."orderId"
            WHERE o.status <> 'CANCELLED' AND oi."createdAt" >= ${start} AND oi."createdAt" < ${end}
            GROUP BY p.id, p.title ORDER BY "revenue" DESC LIMIT 10
        `,
        prisma.$queryRaw<Array<{ sellerId: string; revenue: number; orders: number }>>`
            SELECT p."sellerId", COALESCE(SUM(oi.price * oi.quantity), 0)::float AS "revenue", COUNT(DISTINCT o.id)::int AS "orders"
            FROM "product" p JOIN "orderitem" oi ON oi."productId" = p.id JOIN "order" o ON o.id = oi."orderId"
            WHERE p."sellerId" IS NOT NULL AND o.status <> 'CANCELLED' AND oi."createdAt" >= ${start} AND oi."createdAt" < ${end}
            GROUP BY p."sellerId" ORDER BY "revenue" DESC LIMIT 5
        `,
        prisma.$queryRaw<Array<{ category: string; revenue: number; orders: number }>>`
            SELECT p.category, COALESCE(SUM(oi.price * oi.quantity), 0)::float AS "revenue", COUNT(DISTINCT o.id)::int AS "orders"
            FROM "product" p JOIN "orderitem" oi ON oi."productId" = p.id JOIN "order" o ON o.id = oi."orderId"
            WHERE o.status <> 'CANCELLED' AND oi."createdAt" >= ${start} AND oi."createdAt" < ${end}
            GROUP BY p.category ORDER BY "revenue" DESC
        `,
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reports</h2>
                <select defaultValue={range} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="today">Today</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Products */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Products</h3>
                    {((topProducts as any[]).length === 0) ? (
                        <p className="text-sm text-muted-foreground">No sales data for this period.</p>
                    ) : (
                        <div className="space-y-2">
                            {(topProducts as any[]).map((p, i) => (
                                <div key={p.productId} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{i + 1}. {p.title}</span>
                                    <span className="font-semibold ml-4">${p.revenue.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
                    {((categoryBreakdown as any[]).length === 0) ? (
                        <p className="text-sm text-muted-foreground">No sales data for this period.</p>
                    ) : (
                        <div className="space-y-2">
                            {(categoryBreakdown as any[]).map((c: any) => (
                                <div key={c.category} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{c.category}</span>
                                    <span className="font-semibold ml-4">${c.revenue.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Sellers */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Seller Performance</h3>
                    {((topSellers as any[]).length === 0) ? (
                        <p className="text-sm text-muted-foreground">No sales data for this period.</p>
                    ) : (
                        <div className="space-y-2">
                            {(topSellers as any[]).map((s: any, i: number) => (
                                <div key={s.sellerId} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{i + 1}. Seller {s.sellerId.slice(-4)}</span>
                                    <div className="flex gap-6">
                                        <span>${s.revenue.toFixed(2)}</span>
                                        <span className="text-muted-foreground">{s.orders} orders</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
