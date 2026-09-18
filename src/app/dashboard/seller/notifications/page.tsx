import { getAuthedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AnimatedList } from "@/components/magicui/animated-list";
import { MagicCard } from "@/components/magicui/magic-card";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

export default async function SellerNotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({ where: { userId: authed.user.id }, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma.notification.count({ where: { userId: authed.user.id } }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                    Notifications
                </AnimatedGradientText>
            </h2>
            {notifications.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground">No notifications.</p>
                </div>
            ) : (
                <AnimatedList delay={120} className="items-stretch">
                    {notifications.slice().reverse().map((n) => (
                        <MagicCard
                            key={n.id}
                            mode="gradient"
                            gradientFrom="#ffaa40"
                            gradientTo="#9c40ff"
                            gradientOpacity={0.08}
                            gradientSize={220}
                            className={`w-full bg-white dark:bg-gray-900 rounded-xl border p-4 ${n.read ? "border-gray-200 dark:border-gray-800" : "border-primary/30 bg-primary/5"}`}
                        >
                            <div className="flex items-start gap-3">
                                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse" />}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</p>
                                    <p className="text-sm text-muted-foreground">{n.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                                {n.link && <Link href={n.link} className="text-sm text-primary hover:underline shrink-0">View</Link>}
                            </div>
                        </MagicCard>
                    ))}
                </AnimatedList>
            )}
            {total > limit && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}
