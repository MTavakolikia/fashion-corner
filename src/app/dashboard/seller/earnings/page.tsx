import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { sellerKpis, sellerSeries } from "@/lib/services/products";

export default async function SellerEarningsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const params = await searchParams;
    const range = (params.range ?? "30d") as any;
    const kpis = await sellerKpis(authed.user.id, range);
    const series = await sellerSeries(authed.user.id, range);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EarningCard label="Gross Revenue" value={`$${kpis.revenue.toFixed(2)}`} sub="Total sales before refunds" />
                <EarningCard label="Refunds" value={`$${kpis.refunds.toFixed(2)}`} sub="Processed refunds" color="red" />
                <EarningCard label="Net Revenue" value={`$${kpis.netRevenue.toFixed(2)}`} sub="After refunds" color="green" highlight />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Timeline</h3>
                <RevenueChart series={series} />
            </div>
        </div>
    );
}

function EarningCard({ label, value, sub, color = "", highlight = false }: { label: string; value: string; sub: string; color?: string; highlight?: boolean }) {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-gray-200 dark:border-gray-800"}`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color === "red" ? "text-red-600" : color === "green" ? "text-green-600" : highlight ? "text-primary" : "text-gray-900 dark:text-white"}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
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
                        <div className="w-full bg-green-500/70 hover:bg-green-500 rounded-t transition-colors min-h-[4px]" style={{ height: `${height}%` }} title={`${s.day}: $${s.revenue.toFixed(2)}`} />
                        {i % 5 === 0 && <span className="text-[10px] text-muted-foreground hidden sm:block">{s.day.slice(5)}</span>}
                    </div>
                );
            })}
        </div>
    );
}
