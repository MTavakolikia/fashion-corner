import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
    REQUESTED: "Requested",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    RECEIVED: "Received",
    REFUND_PENDING: "Refund Pending",
    REFUNDED: "Refunded",
};

const STATUS_COLORS: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    UNDER_REVIEW: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    RECEIVED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    REFUND_PENDING: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    REFUNDED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default async function ReturnsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const returns = await prisma.return_request.findMany({
        where: { userId },
        orderBy: { requestedAt: "desc" },
        include: { order: { select: { id: true, total: true, status: true, createdAt: true } } },
        take: 20,
    });

    return (
        <AccountShell title="My Returns">
            {returns.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {returns.map((ret) => (
                        <div key={ret.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Return for Order #{ret.orderId.slice(-6)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Requested {new Date(ret.requestedAt).toLocaleDateString()}
                                        {ret.refundAmount > 0 && ` آ· Refund: $${ret.refundAmount.toFixed(2)}`}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[ret.status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                                    {STATUS_LABELS[ret.status] ?? ret.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ret.reason}</p>
                            {ret.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{ret.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </AccountShell>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-muted-foreground mb-3">No return requests yet</p>
            <Link href="/account/orders" className="text-primary hover:underline text-sm">View Orders</Link>
        </div>
    );
}
