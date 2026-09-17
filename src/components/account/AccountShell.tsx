import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/AccountNav";
import { getAuthedUser } from "@/lib/auth";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";

interface AccountShellProps {
    children: React.ReactNode;
    title?: string;
}

export async function AccountShell({ children, title }: AccountShellProps) {
    const authed = await getAuthedUser();
    const unreadNotifications = await prisma.notification.count({ where: { userId: authed.user.id, read: false } });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <Link href="/" className="font-bold text-lg">
                            <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                                Fashion Corner
                            </AnimatedGradientText>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/account/notifications" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground">
                                <Bell className="w-5 h-5" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                )}
                            </Link>
                            <span className="text-sm text-muted-foreground hidden sm:block">{authed.user.name ?? authed.user.email}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-56 shrink-0">
                        <MagicCard
                            mode="gradient"
                            gradientFrom="#ffaa40"
                            gradientTo="#9c40ff"
                            gradientOpacity={0.08}
                            gradientSize={200}
                            className="rounded-xl border bg-card p-2"
                        >
                            <div className="px-3 py-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <AnimatedShinyText className="mx-0 max-w-none">My Account</AnimatedShinyText>
                                </span>
                            </div>
                            <AccountNav unreadNotifications={unreadNotifications} />
                        </MagicCard>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <BlurFade inView>
                            <h1 className="text-2xl font-bold mb-6">
                                <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                                    {title ?? "Account Overview"}
                                </AnimatedGradientText>
                            </h1>
                        </BlurFade>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
