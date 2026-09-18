import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardRole, DASHBOARD_ROUTES } from "@/lib/sessions";
import {
    LayoutDashboard, ShoppingCart, Heart, MapPin, MessageSquare, RotateCcw,
    Bell, Settings, Package, Users, Tag, Percent, FileText, Shield,
    BarChart3, CreditCard, ClipboardList, AlertCircle, Search, X, Menu,
    ChevronDown, ListFilter,
} from "lucide-react";
import { getAuthedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NAV_GROUPS: Record<string, { key: DashboardRole; label: string; items: (keyof typeof DASHBOARD_ROUTES)[] }> = {
    customer: {
        key: "customer",
        label: "My Account",
        items: ["orders", "wishlist", "addresses", "reviews", "returns", "notifications", "support", "settings"],
    },
    seller: {
        key: "seller",
        label: "Store",
        items: ["products", "sellerOrders", "customers", "sellerReviews", "analytics", "earnings", "sellerNotifications", "sellerSettings"],
    },
    admin: {
        key: "admin",
        label: "Administration",
        items: ["users", "sellers", "adminProducts", "adminOrders", "categories", "brands", "coupons", "returnsAdmin", "refunds", "reviewsAdmin", "supportAdmin", "analyticsAdmin", "reports", "auditLogs", "settingsAdmin"],
    },
};

async function getUnreadCounts(userId: string) {
    const [notifications, orders] = await Promise.all([
        prisma.notification.count({ where: { userId, read: false } }),
        prisma.order.count({ where: { userId, status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
    ]);
    return { notifications, orders };
}

interface DashboardLayoutProps {
    children: ReactNode;
    role: DashboardRole;
    title: string;
}

export default async function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
    const authed = await getAuthedUser();
    const counts = await getUnreadCounts(authed.user.id);

    const group = NAV_GROUPS[role];
    const navItems = group.items.map((k) => ({ key: k, ...DASHBOARD_ROUTES[k] })).filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">Fashion Corner</span>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{role} Dashboard</p>
                </div>

                {/* Profile snippet */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                            {authed.user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{authed.user.name ?? authed.user.email}</p>
                            <p className="text-xs text-muted-foreground capitalize">{authed.user.role.toLowerCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {group.label}
                    </div>
                    {navItems.map((item) => {
                        const isCurrent = item.href === "/account" || window.location.pathname.startsWith(item.href);
                        const Icon = NAV_ICONS[item.key as string] ?? LayoutDashboard;
                        return (
                            <Link
                                key={item.key}
                                href={role === "customer" ? item.href : `/dashboard${item.href}`}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                    isCurrent
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.key === "orders" && counts.orders > 0 && (
                                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{counts.orders}</span>
                                )}
                                {item.key === "notifications" && counts.notifications > 0 && (
                                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{counts.notifications}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to store */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
                    <div className="ml-auto flex items-center gap-3">
                        <Link href="/account/notifications" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground">
                            <Bell className="w-5 h-5" />
                            {counts.notifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </Link>
                        <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
                            My Account
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
    orders: ShoppingCart,
    wishlist: Heart,
    addresses: MapPin,
    reviews: MessageSquare,
    returns: RotateCcw,
    notifications: Bell,
    support: Search,
    settings: Settings,
    products: Package,
    sellerOrders: ShoppingCart,
    customers: Users,
    analytics: BarChart3,
    earnings: CreditCard,
    users: Users,
    sellers: Tag,
    categories: ListFilter,
    brands: Shield,
    coupons: Percent,
    refunds: FileText,
    reports: FileText,
    auditLogs: FileText,
    returnsAdmin: RotateCcw,
};
