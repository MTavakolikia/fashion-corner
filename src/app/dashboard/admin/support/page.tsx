import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;
    const where: any = {};
    if (params.q) where.OR = [{ subject: { contains: params.q, mode: "insensitive" } }, { message: { contains: params.q, mode: "insensitive" } }];
    if (params.status) where.status = params.status;

    const [tickets, total] = await Promise.all([
        prisma.support_ticket.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { user: { select: { name: true, email: true } } } }),
        prisma.support_ticket.count({ where }),
    ]);

    const statusColors: Record<string, string> = {
        OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
            <form method="GET" className="flex gap-3 flex-wrap">
                <input name="q" defaultValue={params.q} placeholder="Search..." className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                <select name="status" defaultValue={params.status} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="">All Status</option>
                    {["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
            </form>
            {tickets.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"><p className="text-muted-foreground">No tickets found.</p></div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{t.subject}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        #{t.id.slice(-6)} · {t.user?.name ?? t.userId} · {new Date(t.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{t.message}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span>
                                    <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{t.category}</span>
                                    <UpdateTicketButton ticketId={t.id} currentStatus={t.status} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

async function UpdateTicketButton({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
    const transitions: Array<{ label: string; value: string }> = [];
    if (currentStatus === "OPEN") transitions.push({ label: "Start", value: "IN_PROGRESS" });
    if (currentStatus === "IN_PROGRESS") { transitions.push({ label: "Wait for Customer", value: "WAITING_FOR_CUSTOMER" }); transitions.push({ label: "Resolve", value: "RESOLVED" }); }
    if (currentStatus === "WAITING_FOR_CUSTOMER") transitions.push({ label: "Resolve", value: "RESOLVED" });
    if (currentStatus === "RESOLVED") transitions.push({ label: "Close", value: "CLOSED" });

    if (transitions.length === 0) return null;
    return (
        <details>
            <summary className="text-xs text-primary hover:underline cursor-pointer">Update status</summary>
            <div className="mt-1 space-y-1">
                {transitions.map((t) => (
                    <form key={t.value} action={async () => {
                        await fetch("/api/admin/support", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ticketId, status: t.value as any }),
                        });
                    }}>
                        <button type="submit" className="block w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-primary py-0.5">{t.label}</button>
                    </form>
                ))}
            </div>
        </details>
    );
}
