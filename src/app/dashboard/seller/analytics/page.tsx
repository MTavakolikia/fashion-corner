import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { sellerKpis, sellerSeries } from "@/lib/services/products";
import { BarChart3, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";

export default async function SellerAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const params = await searchParams;
    const range = (params.range ?? "30d") as any;
    const kpis = await sellerKpis(authed.user.id, range);
    const series = await sellerSeries(authed.user.id, range);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Revenue" value={`$${kpis.revenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5 text-green-600" />} />
                <MetricCard label="Orders" value={kpis.orders.toString()} icon={<ShoppingCart className="w-5 h-5 text-blue-600" />} />
                <MetricCard label="Net Revenue" value={`$${kpis.netRevenue.toFixed(2)}`} icon={<TrendingUp className="w-5 h-5 text-green-700" />} />
                <MetricCard label="AOV" value={`$${kpis.aov.toFixed(2)}`} icon={<BarChart3 className="w-5 h-5 text-purple-600" />} />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Revenue</h3>
                <RevenueChart series={series} />
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="mb-2">{icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

function RevenueChart({ series }: { series: { day: string; revenue: number; orders: number }[] }) {
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
