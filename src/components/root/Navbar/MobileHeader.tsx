"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Heart, ShoppingBag } from "lucide-react";
import { ModeToggler } from "../../ModeToggler";
import { BasketButton } from "@/components/BasketButton";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    userId: string | null;
}

const quickLinks = [
    { href: "/new-arrivals", label: "New" },
    { href: "/sale", label: "Sale", cls: "text-red-400" },
    { href: "/categories/womens", label: "Women" },
    { href: "/categories/mens", label: "Men" },
    { href: "/categories/accessories", label: "Accessories" },
];

export default function MobileHeader({ userId }: MobileHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/fashion-corner.png" alt="logo" width={28} height={26} />
                        <span className="text-white font-bold text-base">Fashion Corner</span>
                    </Link>
                    <div className="flex items-center gap-0.5">
                        <Link href="/account/wishlist" className="p-2 text-white/70 hover:text-white transition-colors"><Heart className="w-5 h-5" /></Link>
                        <BasketButton />
                        <button onClick={() => setMenuOpen(true)} className="p-2 text-white/70 hover:text-white transition-colors ml-1">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {/* Quick link pills */}
                <div className="flex items-center gap-0 px-2 pb-2 overflow-x-auto scrollbar-hide">
                    {quickLinks.map(l => (
                        <Link key={l.href} href={l.href} className={cn("px-3 py-1 mr-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors", l.cls ?? "text-white/60 hover:text-white hover:bg-white/10")}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </header>

            {/* Slide-out menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-[55] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-950 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <span className="font-bold text-lg">Menu</span>
                            <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-2">
                            <div className="px-5 py-3">
                                <Link href="/products" onClick={() => setMenuOpen(false)} className="block py-2.5 text-base font-medium border-b border-gray-100 dark:border-gray-800">All Products</Link>
                                <Link href="/new-arrivals" onClick={() => setMenuOpen(false)} className="block py-2.5 text-base font-medium border-b border-gray-100 dark:border-gray-800">New Arrivals</Link>
                                <Link href="/sale" onClick={() => setMenuOpen(false)} className="block py-2.5 text-base font-medium border-b border-gray-100 dark:border-gray-800 text-red-500">Sale</Link>
                            </div>

                            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
                                {[
                                    { href: "/categories/womens", label: "Women's Fashion", icon: "👗" },
                                    { href: "/categories/mens", label: "Men's Fashion", icon: "🧥" },
                                    { href: "/categories/kids", label: "Kids & Baby", icon: "🧸" },
                                    { href: "/categories/accessories", label: "Accessories", icon: "👜" },
                                    { href: "/categories/shoes", label: "Shoes", icon: "👟" },
                                    { href: "/categories/bags", label: "Bags", icon: "💼" },
                                ].map(c => (
                                    <Link key={c.href} href={c.href} onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-900">
                                        <span className="text-xl">{c.icon}</span>
                                        <span className="text-sm font-medium">{c.label}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Brands</p>
                                <div className="flex flex-wrap gap-2">
                                    {["Louis Vuitton","Gucci","Prada","Hermès","Burberry","Dior","Chanel","Fendi"].map(b => (
                                        <Link key={b} href={`/brands/${b.toLowerCase().replace(/[^a-z]/g,'-')}`} onClick={() => setMenuOpen(false)}
                                            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                                            {b}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Help</p>
                                <Link href="/faq" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">FAQ</Link>
                                <Link href="/shipping" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">Shipping Info</Link>
                                <Link href="/returns" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">Returns</Link>
                                <Link href="/contact" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-muted-foreground">Contact Us</Link>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <ModeToggler />
                                {userId ? (
                                    <Link href="/account" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg">My Account</Link>
                                ) : (
                                    <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg">Sign In</Link>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <span>+1 234 567 890</span>
                                <span>support@fashioncorner.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
