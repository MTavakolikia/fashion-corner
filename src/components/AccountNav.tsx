"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageSquare, MapPin, Settings, ShoppingCart, RotateCcw, Bell, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
    { href: "/account", label: "Overview", icon: ShoppingCart },
    { href: "/account/orders", label: "Orders", icon: ShoppingCart },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/reviews", label: "Reviews", icon: MessageSquare },
    { href: "/account/returns", label: "Returns", icon: RotateCcw },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
    { href: "/account/support", label: "Support", icon: HelpCircle },
    { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav({ unreadNotifications }: { unreadNotifications: number }) {
    const pathname = usePathname();

    return (
        <nav className="space-y-0.5">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.href === "/account"
                    ? pathname === "/account" || pathname === "/account/"
                    : pathname.startsWith(tab.href);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{tab.label}</span>
                        {tab.href === "/account/notifications" && unreadNotifications > 0 && (
                            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadNotifications}</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
