import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: Promise<{ action?: string; resource?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 30;
    const where: any = {};
    if (params.action) where.action = params.action;
    if (params.resource) where.resource = params.resource;

    const [logs, total] = await Promise.all([
        prisma.audit_log.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { actor: { select: { id: true, name: true, email: true, role: true } } } }),
        prisma.audit_log.count({ where }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Logs</h2>
            <form method="GET" className="flex gap-3 flex-wrap">
                <input name="action" placeholder="Action..." defaultValue={params.action} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                <input name="resource" placeholder="Resource..." defaultValue={params.resource} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
            </form>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actor</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resource</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {logs.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No audit logs yet.</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 dark:text-white">{log.actor?.name ?? log.actorId.slice(-6)}</p>
                                    <p className="text-xs text-muted-foreground">{log.actor?.email ?? ""}</p>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-primary">{log.action}</td>
                                <td className="px-4 py-3 text-muted-foreground">{log.resource}{log.resourceId ? ` (#${log.resourceId.slice(-6)})` : ""}</td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {total > limit && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?action=${params.action ?? ""}&resource=${params.resource ?? ""}&page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?action=${params.action ?? ""}&resource=${params.resource ?? ""}&page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}
