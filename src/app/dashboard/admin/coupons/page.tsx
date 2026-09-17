import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { prisma as db } from "@/lib/prisma";

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;
    const [coupons, total] = await Promise.all([
        db.coupon.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
        db.coupon.count(),
    ]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Coupons</h2>
                <AddCouponButton />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Value</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Times Used</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Active</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {coupons.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No coupons yet.</td></tr>
                        ) : coupons.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.type.toLowerCase()}</td>
                                <td className="px-4 py-3 text-right font-medium">{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value.toFixed(2)}`}</td>
                                <td className="px-4 py-3 text-right">{c.timesUsed}</td>
                                <td className="px-4 py-3 text-center">
                                    <ToggleCoupon couponId={c.id} current={c.isActive} />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <form action={async () => { await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" }); }}><button type="submit" className="text-sm text-red-600 hover:underline">Delete</button></form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {total > limit && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}

function ToggleCoupon({ couponId, current }: { couponId: string; current: boolean }) {
    return (
        <form action={async () => {
            await fetch(`/api/admin/coupons/${couponId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !current }),
            });
        }}>
            <button type="submit" className={`text-xs px-2 py-0.5 rounded-full ${current ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}>
                {current ? "Active" : "Inactive"}
            </button>
        </form>
    );
}

function AddCouponButton() {
    return (
        <details className="group">
            <summary className="cursor-pointer text-sm text-primary hover:underline">+ New Coupon</summary>
            <form action="/api/admin/coupons" method="POST" className="mt-2 space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                    <input name="code" required placeholder="Code (e.g. SUMMER20)" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
                    <select name="type" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FIXED">Fixed Amount</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input name="value" type="number" step="0.01" required placeholder="Value" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
                    <input name="minOrderAmount" type="number" step="0.01" placeholder="Min order ($)" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white" />
                </div>
                <button type="submit" className="w-full px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Create Coupon</button>
            </form>
        </details>
    );
}
