import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    UNDER_REVIEW: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    RECEIVED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    REFUND_PENDING: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    REFUNDED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default async function AdminReturnsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;
    const where: any = {};
    if (params.status) where.status = params.status;

    const [returns, total] = await Promise.all([
        prisma.return_request.findMany({ where, orderBy: { requestedAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { order: { select: { id: true, total: true, status: true } } } }),
        prisma.return_request.count({ where }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Return Requests</h2>
            <form method="GET" className="flex gap-3">
                <select name="status" defaultValue={params.status} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="">All Status</option>
                    {["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "RECEIVED", "REFUND_PENDING", "REFUNDED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
            </form>
            <div className="space-y-3">
                {returns.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <p className="text-muted-foreground">No return requests.</p>
                    </div>
                ) : returns.map((ret) => (
                    <div key={ret.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Return #{ret.id.slice(-6)}</p>
                                <p className="text-xs text-muted-foreground">Order #{ret.orderId.slice(-6)}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">{ret.reason}</p>
                                {ret.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{ret.description}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[ret.status]}`}>{ret.status.replace("_", " ")}</span>
                                <span className="font-semibold">${ret.refundAmount.toFixed(2)}</span>
                                <ManageReturnButtons ret={ret} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {total > limit && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?status=${params.status ?? ""}&page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?status=${params.status ?? ""}&page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}

async function ManageReturnButtons({ ret }: { ret: any }) {
    return (
        <div className="flex gap-1">
            {ret.status === "REQUESTED" || ret.status === "UNDER_REVIEW" ? (
                <>
                    <form action={async () => { await fetch(`/api/admin/returns/${ret.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: "APPROVED" }) }); }}>
                        <button type="submit" className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Approve</button>
                    </form>
                    <form action={async () => { await fetch(`/api/admin/returns/${ret.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: "REJECTED" }) }); }}>
                        <button type="submit" className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Reject</button>
                    </form>
                </>
            ) : ret.status === "RECEIVED" ? (
                <form action={async () => { await fetch(`/api/admin/returns/${ret.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: "REFUND_PENDING" }) }); }}>
                    <button type="submit" className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Process Refund</button>
                </form>
            ) : null}
        </div>
    );
}
