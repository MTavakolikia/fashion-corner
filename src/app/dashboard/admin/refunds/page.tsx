import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createRefund } from "@/lib/services/returns";

export default async function AdminRefundsPage({ searchParams }: { searchParams: Promise<{ orderId?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;

    const where: any = {};
    if (params.orderId) where.orderId = params.orderId;

    const [refunds, total] = await Promise.all([
        prisma.refund.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { order: { select: { id: true, total: true, status: true } } } }),
        prisma.refund.count({ where }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Refunds</h2>
            <form method="GET" className="flex gap-3">
                <input name="orderId" placeholder="Order ID..." defaultValue={params.orderId} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
            </form>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Refund</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {refunds.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No refunds yet.</td></tr>
                        ) : refunds.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id.slice(-8)}</td>
                                <td className="px-4 py-3">
                                    <Link href={`/dashboard/admin/orders/${r.orderId}`} className="text-sm text-primary hover:underline">#{r.orderId.slice(-6)}</Link>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold">${r.amount.toFixed(2)}</td>
                                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${r.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>{r.status.toLowerCase()}</span></td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
