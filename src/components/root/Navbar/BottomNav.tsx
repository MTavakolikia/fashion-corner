"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Heart, ShoppingBag, User } from "lucide-react";

interface BottomNavProps {
    userId: string | null;
}

export default function BottomNav({ userId }: BottomNavProps) {
    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/98 dark:bg-gray-950/98 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
            <div className="flex items-center justify-around py-1.5 px-2">
                {[
                    { href: "/",              label: "Home",  active: false },
                    { href: "/products",      label: "Browse", active: false },
                    { href: "/account/wishlist", label: "Wishlist", active: false },
                    { href: userId ? "/account" : "/sign-in", label: "Account", active: false },
                ].map(item => (
                    <Link key={item.label} href={item.href}
                        className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors">
                        {item.label === "Home" && <div className="w-5 h-5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>}
                        {item.label === "Browse" && <ShoppingBag className="w-5 h-5" />}
                        {item.label === "Wishlist" && <Heart className="w-5 h-5" />}
                        {item.label === "Account" && <User className="w-5 h-5" />}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
