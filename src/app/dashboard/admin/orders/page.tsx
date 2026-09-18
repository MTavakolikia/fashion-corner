import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    RETURN_REQUESTED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.q) where.OR = [{ id: { contains: params.q } }, { user: { email: { contains: params.q, mode: "insensitive" } } }];

    const [orders, total] = await Promise.all([
        prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { user: { select: { name: true, email: true } } } }),
        prisma.order.count({ where }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders</h2>
            <AdminFilterBar currentQ={params.q} currentStatus={params.status} />
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No orders found.</td></tr>
                        ) : orders.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(-8)}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 dark:text-white">{o.user?.name ?? "—"}</p>
                                    <p className="text-xs text-muted-foreground">{o.user?.email ?? o.userId}</p>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status]}`}>{o.status.replace("_", " ")}</span></td>
                                <td className="px-4 py-3 text-right font-semibold">${o.total.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/dashboard/admin/orders/${o.id}`} className="text-sm text-primary hover:underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {total > limit && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?q=${params.q ?? ""}&status=${params.status ?? ""}&page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?q=${params.q ?? ""}&status=${params.status ?? ""}&page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}

function AdminFilterBar({ currentQ, currentStatus }: { currentQ?: string; currentStatus?: string }) {
    return (
        <form method="GET" className="flex flex-wrap gap-3">
            <input name="q" defaultValue={currentQ} placeholder="Search order ID or customer..." className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            <select name="status" defaultValue={currentStatus} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option value="">All Status</option>
                {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
        </form>
    );
}
