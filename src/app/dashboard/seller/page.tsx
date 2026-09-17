import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { sellerKpis, sellerSeries, topSellerProducts } from "@/lib/services/products";
import { MagicCard } from "@/components/magicui/magic-card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default async function SellerDashboardPage() {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const kpis = await sellerKpis(authed.user.id, "30d");
    const series = await sellerSeries(authed.user.id, "30d");
    const topProducts = await topSellerProducts(authed.user.id, "30d", undefined, undefined, 5);

    // Recent orders for this seller
    const recentOrders = await prisma.order.findMany({
        where: { items: { some: { product: { sellerId: authed.user.id } } }, status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { where: { product: { sellerId: authed.user.id } }, select: { productId: true, quantity: true, price: true } } },
    });

    // Low stock products
    const lowStock = await prisma.product.findMany({
        where: { sellerId: authed.user.id, stock: { lte: 5 } },
        select: { id: true, title: true, stock: true },
        take: 5,
    });

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Revenue (30d)", value: `$${kpis.revenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-green-600" />, href: "/dashboard/seller/earnings" },
                    { label: "Orders (30d)", value: kpis.orders.toString(), icon: <ShoppingCart className="w-5 h-5 text-blue-600" />, href: "/dashboard/seller/orders" },
                    { label: "Products", value: kpis.products.toString(), icon: <Package className="w-5 h-5 text-purple-600" />, href: "/dashboard/seller/products" },
                    { label: "Net Revenue", value: `$${kpis.netRevenue.toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-green-700" /> },
                ].map((kpi, i) => (
                    <BlurFade key={kpi.label} delay={0.06 * i} inView>
                        <KPICard label={kpi.label} value={kpi.value} icon={kpi.icon} href={kpi.href} />
                    </BlurFade>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <MagicCard
                    mode="gradient"
                    gradientFrom="#ffaa40"
                    gradientTo="#9c40ff"
                    gradientOpacity={0.06}
                    gradientSize={420}
                    className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend (30 days)</h3>
                    <RevenueChart series={series} />
                </MagicCard>
                <MagicCard
                    mode="gradient"
                    gradientFrom="#ffaa40"
                    gradientTo="#9c40ff"
                    gradientOpacity={0.08}
                    gradientSize={260}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link href="/dashboard/seller/products/new" className="block w-full text-left px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
                            + Add New Product
                        </Link>
                        <Link href="/dashboard/seller/orders" className="block w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            View Orders ({kpis.pendingOrders} pending)
                        </Link>
                        <Link href="/dashboard/seller/analytics" className="block w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            View Analytics
                        </Link>
                    </div>
                </MagicCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link href="/dashboard/seller/orders" className="text-sm text-primary hover:underline">View all</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.map((o) => (
                                <Link key={o.id} href={`/dashboard/seller/orders/${o.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{o.id.slice(-6)}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-sm font-semibold">${o.total.toFixed(2)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" /> Low Stock
                        </h3>
                        <Link href="/dashboard/seller/products" className="text-sm text-primary hover:underline">Manage</Link>
                    </div>
                    {lowStock.length === 0 ? (
                        <p className="text-sm text-muted-foreground">All products are well stocked.</p>
                    ) : (
                        <div className="space-y-2">
                            {lowStock.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                                    <span className="text-sm text-gray-900 dark:text-white truncate max-w-[70%]">{p.title}</span>
                                    <span className={`text-xs font-medium ${p.stock === 0 ? "text-red-600" : "text-orange-600"}`}>{p.stock} left</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, icon, href }: { label: string; value: string; icon: React.ReactNode; href?: string }) {
    const inner = (
        <MagicCard
            mode="gradient"
            gradientFrom="#ffaa40"
            gradientTo="#9c40ff"
            gradientOpacity={0.1}
            gradientSize={180}
            className="h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
        >
            <div className="flex items-center justify-between mb-2">{icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
                <AnimatedShinyText className="mx-0 max-w-none">{label}</AnimatedShinyText>
            </p>
        </MagicCard>
    );
    return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

function RevenueChart({ series }: { series: { day: string; revenue: number; orders: number }[] }) {
    if (series.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
    const maxRev = Math.max(...series.map((s) => s.revenue), 1);
    return (
        <div className="flex items-end gap-1 h-40">
            {series.slice(-30).map((s, i) => {
                const height = Math.max(4, (s.revenue / maxRev) * 100);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full bg-primary/70 hover:bg-primary rounded-t transition-colors min-h-[4px]"
                            style={{ height: `${height}%` }}
                            title={`${s.day}: $${s.revenue.toFixed(2)}`}
                        />
                        {i % 5 === 0 && <span className="text-[10px] text-muted-foreground rotate-0 hidden sm:block">{s.day.slice(5)}</span>}
                    </div>
                );
            })}
        </div>
    );
}
