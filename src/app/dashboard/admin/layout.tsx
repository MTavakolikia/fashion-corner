import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { ReactNode } from "react";
import { DashboardSidebarNav, type DashboardNavItem } from "@/components/dashboard/DashboardSidebarNav";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);

    const [pendingOrders, pendingReturns, openTickets] = await Promise.all([
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.return_request.count({ where: { status: "REQUESTED" } }),
        prisma.support_ticket.count({ where: { status: "OPEN" } }),
    ]);

    const navItems: (DashboardNavItem & { badge?: number })[] = [
        { href: "/dashboard/admin", label: "Overview", icon: "LayoutDashboard" },
        { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
        { href: "/dashboard/admin/sellers", label: "Sellers", icon: "Tag" },
        { href: "/dashboard/admin/products", label: "Products", icon: "Package" },
        { href: "/dashboard/admin/orders", label: "Orders", icon: "ShoppingCart", badge: pendingOrders },
        { href: "/dashboard/admin/categories", label: "Categories", icon: "ClipboardList" },
        { href: "/dashboard/admin/brands", label: "Brands", icon: "Shield" },
        { href: "/dashboard/admin/coupons", label: "Coupons", icon: "Percent" },
        { href: "/dashboard/admin/returns", label: "Returns", icon: "RotateCcw", badge: pendingReturns },
        { href: "/dashboard/admin/refunds", label: "Refunds", icon: "CreditCard" },
        { href: "/dashboard/admin/reviews", label: "Reviews", icon: "MessageSquare" },
        { href: "/dashboard/admin/support", label: "Support", icon: "Search", badge: openTickets },
        { href: "/dashboard/admin/analytics", label: "Analytics", icon: "BarChart3" },
        { href: "/dashboard/admin/reports", label: "Reports", icon: "FileText" },
        { href: "/dashboard/admin/audit-logs", label: "Audit Logs", icon: "AlertCircle" },
        { href: "/dashboard/admin/settings", label: "Settings", icon: "Settings" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            Fashion Corner
                        </AnimatedGradientText>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">Admin Console</p>
                </div>

                <DashboardSidebarNav items={navItems} />

                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <Link href="/account" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-semibold">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            Admin Dashboard
                        </AnimatedGradientText>
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                            <AnimatedShinyText className="mx-0 max-w-none">{authed.user.name ?? authed.user.email}</AnimatedShinyText>
                        </span>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
