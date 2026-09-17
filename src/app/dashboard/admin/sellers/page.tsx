import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminSellersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;

    const where: any = { role: "SELLER" };
    if (params.q) where.OR = [{ email: { contains: params.q, mode: "insensitive" } }, { name: { contains: params.q, mode: "insensitive" } }];
    if (params.status) where.sellerStatus = params.status;

    const [sellers, total] = await Promise.all([
        prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, picture: true, role: true, status: true, sellerStatus: true, createdAt: true } }),
        prisma.user.count({ where }),
    ]);

    const ids = sellers.map((s: any) => s.id);
    const perf = ids.length ? await prisma.$queryRaw<Array<{ sellerId: string; revenue: number; orders: number; products: number }>>`
        SELECT p."sellerId" AS "sellerId",
               COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID' AND o.status <> 'CANCELLED'), 0)::float AS "revenue",
               COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' AND o.status <> 'CANCELLED' THEN o.id END)::int AS "orders",
               COUNT(DISTINCT p.id)::int AS "products"
        FROM "product" p LEFT JOIN "orderitem" oi ON oi."productId" = p.id LEFT JOIN "order" o ON o.id = oi."orderId"
        WHERE p."sellerId" = ANY(${ids}) GROUP BY p."sellerId"
    ` : [];
    const perfMap = new Map<string, { sellerId: string; revenue: number; orders: number; products: number }>(
        perf.map((r: any) => [r.sellerId, r])
    );

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        REJECTED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        NONE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sellers</h2>
            <AdminFilterBar currentQ={params.q} currentStatus={params.status} />
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Products</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Orders</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Revenue</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Joined</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sellers.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No sellers found.</td></tr>
                        ) : sellers.map((s: any) => {
                            const p = perfMap.get(s.id) ?? { revenue: 0, orders: 0, products: 0 };
                            return (
                                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">{s.name?.[0] ?? "S"}</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{s.name ?? "—"}</p>
                                                <p className="text-xs text-muted-foreground">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[s.sellerStatus]}`}>{s.sellerStatus?.toLowerCase()}</span></td>
                                    <td className="px-4 py-3 text-right">{p.products}</td>
                                    <td className="px-4 py-3 text-right">{p.orders}</td>
                                    <td className="px-4 py-3 text-right font-semibold">${p.revenue.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <details className="text-sm">
                                            <summary className="cursor-pointer text-primary hover:underline">Manage</summary>
                                            <div className="mt-1 space-y-1">
                                                {s.sellerStatus === "PENDING" && (
                                                    <form action={async () => {
                                                        await fetch(`/api/admin/sellers/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerStatus: "ACTIVE" }) });
                                                    }}>
                                                        <button type="submit" className="block w-full text-left text-xs text-green-600 hover:underline">Approve</button>
                                                    </form>
                                                )}
                                                {(s.sellerStatus === "ACTIVE" || s.sellerStatus === "PENDING") && (
                                                    <form action={async () => {
                                                        await fetch(`/api/admin/sellers/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerStatus: "SUSPENDED" }) });
                                                    }}>
                                                        <button type="submit" className="block w-full text-left text-xs text-red-600 hover:underline">Suspend</button>
                                                    </form>
                                                )}
                                            </div>
                                        </details>
                                    </td>
                                </tr>
                            );
                        })}
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
            <input name="q" defaultValue={currentQ} placeholder="Search seller..." className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            <select name="status" defaultValue={currentStatus} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option value="">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
            </select>
            <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
        </form>
    );
}
