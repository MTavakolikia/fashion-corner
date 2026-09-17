import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;

    const where: any = {};
    if (params.q) where.OR = [{ email: { contains: params.q, mode: "insensitive" } }, { name: { contains: params.q, mode: "insensitive" } }];
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;

    const [users, total] = await Promise.all([
        prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, picture: true, role: true, status: true, sellerStatus: true, createdAt: true, _count: { select: { orders: true, reviews: true } } } }),
        prisma.user.count({ where }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
            <AdminFilterBar />
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Orders</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Joined</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No users found.</td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">{u.name?.[0] ?? "U"}</div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{u.name ?? "—"}</p>
                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3"><span className="text-xs capitalize bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{u.role.toLowerCase()}</span></td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.status === "SUSPENDED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>{u.status?.toLowerCase()}</span>
                                    {u.sellerStatus !== "NONE" && <span className="ml-1 text-xs text-muted-foreground capitalize">{u.sellerStatus.toLowerCase()}</span>}
                                </td>
                                <td className="px-4 py-3 text-right">{u._count.orders}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/dashboard/admin/users/${u.id}`} className="text-sm text-primary hover:underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {total > limit && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?q=${params.q ?? ""}&role=${params.role ?? ""}&status=${params.status ?? ""}&page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?q=${params.q ?? ""}&role=${params.role ?? ""}&status=${params.status ?? ""}&page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}

function AdminFilterBar() {
    return (
        <form method="GET" className="flex flex-wrap gap-3">
            <input name="q" placeholder="Search by email or name..." className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            <select name="role" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option value="">All Roles</option>
                <option value="USER">USER</option>
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
            </select>
            <select name="status" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option value="">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="CLOSED">CLOSED</option>
            </select>
            <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
            <Link href="/dashboard/admin/users" className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Clear</Link>
        </form>
    );
}
