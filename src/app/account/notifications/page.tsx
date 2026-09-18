import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { userId } = await auth();
    if (!userId) return null;
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unread] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return (
        <AccountShell title="Notifications">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{total} notifications آ· {unread} unread</p>
            </div>
            {notifications.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <NotificationItem key={n.id} notification={n} />
                    ))}
                </div>
            )}
            {total > limit && (
                <Pagination current={page} total={Math.max(1, Math.ceil(total / limit))} />
            )}
        </AccountShell>
    );
}

function NotificationItem({ notification }: { notification: any }) {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl border p-4 ${notification.read ? "border-gray-200 dark:border-gray-800" : "border-primary/30 bg-primary/5"}`}>
            <div className="flex items-start gap-3">
                {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                {notification.read && <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                    </p>
                </div>
                {notification.link && (
                    <a href={notification.link} className="text-sm text-primary hover:underline shrink-0">View</a>
                )}
            </div>
        </div>
    );
}

function Pagination({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Link href={`?page=${current - 1}`} className={`px-3 py-1.5 rounded-md text-sm border ${current <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Previous
            </Link>
            <span className="text-sm text-muted-foreground">Page {current} of {total}</span>
            <Link href={`?page=${current + 1}`} className={`px-3 py-1.5 rounded-md text-sm border ${current >= total ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Next
            </Link>
        </div>
    );
}
