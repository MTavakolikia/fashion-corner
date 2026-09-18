import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rangeFor } from "@/lib/services/products";
import Link from "next/link";
import { MagicCard } from "@/components/magicui/magic-card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const range = (params.range ?? "30d") as any;
    const { start, end } = rangeFor(range);

    const [kpis, pendingOrders, pendingReturns, recentOrders] = await Promise.all([
        prisma.$queryRaw<Array<{ gross: number; refunds: number; orders: number; customers: number; products: number; sellers: number }>>`
            SELECT
              COALESCE(SUM(CASE WHEN o."paymentStatus" = 'PAID' THEN oi.price * oi.quantity END), 0)::float AS "gross",
              COALESCE((SELECT SUM(r.amount) FROM "refund" r WHERE r.status IN ('APPROVED','COMPLETED') AND r."createdAt" >= ${start} AND r."createdAt" < ${end}), 0)::float AS "refunds",
              COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' THEN o.id END)::int AS "orders",
              COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' THEN o."userId" END)::int AS "customers",
              (SELECT count(*) FROM "product" WHERE "status" = 'PUBLISHED')::int AS "products",
              (SELECT count(*) FROM "user" WHERE "role" = 'SELLER')::int AS "sellers"
            FROM "orderitem" oi
            JOIN "order" o ON o.id = oi."orderId"
            WHERE o.status <> 'CANCELLED' AND oi."createdAt" >= ${start} AND oi."createdAt" < ${end}
        `,
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.return_request.count({ where: { status: "REQUESTED" } }),
        prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { name: true, email: true } } } }),
    ]);

    const m = kpis[0] ?? { gross: 0, refunds: 0, orders: 0, customers: 0, products: 0, sellers: 0 };
    const net = Math.max(m.gross - m.refunds, 0);
    const aov = m.orders > 0 ? m.gross / m.orders : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                        Overview
                    </AnimatedGradientText>
                </h2>
                <RangeSelector current={range} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                    { label: "Gross Revenue", value: `$${m.gross.toFixed(2)}` },
                    { label: "Net Revenue", value: `$${net.toFixed(2)}`, highlight: true },
                    { label: "Orders", value: m.orders.toString() },
                    { label: "Customers", value: m.customers.toString() },
                    { label: "Products", value: m.products.toString() },
                    { label: "Sellers", value: m.sellers.toString() },
                    { label: "AOV", value: `$${aov.toFixed(2)}` },
                    { label: "Pending Orders", value: pendingOrders.toString(), alert: pendingOrders > 0 },
                ] as { label: string; value: string; highlight?: boolean; alert?: boolean }[]).map((stat, i) => (
                    <BlurFade key={stat.label} delay={0.04 * i} inView>
                        <StatCard label={stat.label} value={stat.value} highlight={stat.highlight} alert={stat.alert} />
                    </BlurFade>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MagicCard
                    mode="gradient"
                    gradientFrom="#ffaa40"
                    gradientTo="#9c40ff"
                    gradientOpacity={0.06}
                    gradientSize={320}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link href="/dashboard/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.map((o) => (
                                <Link key={o.id} href={`/dashboard/admin/orders/${o.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">#{o.id.slice(-6)}</p>
                                        <p className="text-xs text-muted-foreground">{o.user?.name ?? o.userId} · {new Date(o.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-sm font-semibold">${o.total.toFixed(2)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </MagicCard>
                <QuickLinks />
            </div>
        </div>
    );
}

function StatCard({ label, value, highlight, alert }: { label: string; value: string; highlight?: boolean; alert?: boolean }) {
    return (
        <MagicCard
            mode="gradient"
            gradientFrom="#ffaa40"
            gradientTo="#9c40ff"
            gradientOpacity={0.1}
            gradientSize={180}
            className={`h-full rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : alert ? "border-red-200 dark:border-red-900/50" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"}`}
        >
            <p className="text-sm text-muted-foreground">
                <AnimatedShinyText className="mx-0 max-w-none">{label}</AnimatedShinyText>
            </p>
            <p className={`text-2xl font-bold mt-1 ${alert ? "text-red-600" : highlight ? "text-primary" : "text-gray-900 dark:text-white"}`}>{value}</p>
        </MagicCard>
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

function QuickLinks() {
    return (
        <MagicCard
            mode="gradient"
            gradientFrom="#ffaa40"
            gradientTo="#9c40ff"
            gradientOpacity={0.06}
            gradientSize={320}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
        >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
                {[
                    { href: "/dashboard/admin/users", label: "Manage Users" },
                    { href: "/dashboard/admin/sellers", label: "Manage Sellers" },
                    { href: "/dashboard/admin/products", label: "All Products" },
                    { href: "/dashboard/admin/orders", label: "All Orders" },
                    { href: "/dashboard/admin/reports", label: "Generate Report" },
                    { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
                ].map((link) => (
                    <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{link.label}</Link>
                ))}
            </div>
        </MagicCard>
    );
}
