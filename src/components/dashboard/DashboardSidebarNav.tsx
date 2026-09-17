"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingCart, Users, Tag, Percent, FileText,
    Shield, BarChart3, CreditCard, ClipboardList, AlertCircle, Search, Bell,
    Settings, RotateCcw, MessageSquare, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
    LayoutDashboard, Package, ShoppingCart, Users, Tag, Percent, FileText,
    Shield, BarChart3, CreditCard, ClipboardList, AlertCircle, Search, Bell,
    Settings, RotateCcw, MessageSquare, DollarSign,
} as const;

export type DashboardNavIcon = keyof typeof ICONS;

export interface DashboardNavItem {
    href: string;
    label: string;
    icon: DashboardNavIcon;
    badge?: number;
}

export function DashboardSidebarNav({ items }: { items: DashboardNavItem[] }) {
    const pathname = usePathname();

    return (
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {items.map((item) => {
                const Icon = ICONS[item.icon];
                const isActive = item.href === "/dashboard" || item.href === "/dashboard/seller" || item.href === "/dashboard/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
