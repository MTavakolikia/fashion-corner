import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { ReactNode } from "react";
import { DashboardSidebarNav, type DashboardNavItem } from "@/components/dashboard/DashboardSidebarNav";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default async function SellerDashboardLayout({ children }: { children: ReactNode }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });

    // Quick stats
    const [products, pendingOrders, reviews] = await Promise.all([
        prisma.product.count({ where: { sellerId: authed.user.id } }),
        prisma.order.count({ where: { items: { some: { product: { sellerId: authed.user.id } } }, status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
        prisma.review.count({ where: { product: { sellerId: authed.user.id }, isHidden: false } }),
    ]);
    void products;
    void reviews;

    const navItems: DashboardNavItem[] = [
        { href: "/dashboard/seller", label: "Overview", icon: "LayoutDashboard" },
        { href: "/dashboard/seller/products", label: "Products", icon: "Package", badge: products },
        { href: "/dashboard/seller/orders", label: "Orders", icon: "ShoppingCart", badge: pendingOrders },
        { href: "/dashboard/seller/customers", label: "Customers", icon: "Users" },
        { href: "/dashboard/seller/reviews", label: "Reviews", icon: "MessageSquare", badge: reviews },
        { href: "/dashboard/seller/analytics", label: "Analytics", icon: "BarChart3" },
        { href: "/dashboard/seller/earnings", label: "Earnings", icon: "DollarSign" },
        { href: "/dashboard/seller/notifications", label: "Notifications", icon: "Bell" },
        { href: "/dashboard/seller/settings", label: "Settings", icon: "Settings" },
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
                    <p className="text-xs text-muted-foreground mt-0.5">Seller Dashboard</p>
                </div>

                <DashboardSidebarNav items={navItems} />

                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <Link href="/account" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Account
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-semibold">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            Store Overview
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
