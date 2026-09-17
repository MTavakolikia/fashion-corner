"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ChevronDown, X } from "lucide-react";
import { ModeToggler } from "../../ModeToggler";
import { BasketButton } from "@/components/BasketButton";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { cn } from "@/lib/utils";

interface DesktopNavProps {
    userId: string | null;
}

const categories = [
    { href: "/categories/womens", label: "Women's Fashion", icon: "👗" },
    { href: "/categories/mens",    label: "Men's Fashion",  icon: "🧥" },
    { href: "/categories/kids",    label: "Kids & Baby",    icon: "🧸" },
    { href: "/categories/accessories", label: "Accessories", icon: "👜" },
    { href: "/categories/shoes",   label: "Shoes",          icon: "👟" },
    { href: "/categories/bags",    label: "Bags",           icon: "💼" },
];

const brands = [
    { href: "/brands/louis-vuitton", label: "Louis Vuitton" },
    { href: "/brands/gucci",         label: "Gucci" },
    { href: "/brands/prada",         label: "Prada" },
    { href: "/brands/hermes",        label: "Hermès" },
    { href: "/brands/burberry",      label: "Burberry" },
    { href: "/brands/dior",          label: "Dior" },
    { href: "/brands/chanel",        label: "Chanel" },
    { href: "/brands/fendi",         label: "Fendi" },
];

const quickLinks = [
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/sale",         label: "Sale" },
    { href: "/products",     label: "All Products" },
];

interface DesktopNavProps {
    userId: string | null;
}

export default function DesktopNav({ userId }: DesktopNavProps) {
    const [openCat, setOpenCat] = useState(false);
    const [openBrands, setOpenBrands] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenCat(false); setOpenBrands(false); setSearchOpen(false); } };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            {/* Top utility bar */}
            <div className="hidden md:flex items-center justify-between px-8 py-1.5 bg-black border-b border-white/10">
                <div className="flex items-center gap-5 text-[11px] text-white/60">
                    <span className="hover:text-white/90 transition-colors cursor-pointer">+1 234 567 890</span>
                    <span className="hover:text-white/90 transition-colors cursor-pointer">support@fashioncorner.com</span>
                </div>
                <span className="text-[11px] font-medium tracking-wide">
                    <AnimatedShinyText className="text-white/80 dark:text-white/80 mx-0 max-w-none">
                        Free shipping on orders over $50 &nbsp;✦&nbsp; New season styles available
                    </AnimatedShinyText>
                </span>
            </div>

            {/* Main header */}
            <header className="flex items-center gap-6 px-8 py-3 bg-black/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                    <Image src="/images/fashion-corner.png" alt="logo" width={32} height={30} className="shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="text-white font-bold text-lg tracking-tight hidden sm:block">Fashion Corner</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-0.5 ml-6">
                    {/* Categories dropdown */}
                    <div className="relative">
                        <button
                            onMouseEnter={() => setOpenCat(true)}
                            onMouseLeave={() => setOpenCat(false)}
                            className="flex items-center gap-1 px-3 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                        >
                            Categories
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", openCat && "rotate-180")} />
                        </button>
                        {openCat && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenCat(false)} />
                                <div className="absolute top-full left-0 z-20 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop by Category</p>
                                    </div>
                                    {categories.map(c => (
                                        <Link key={c.href} href={c.href} onClick={() => setOpenCat(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-sm">
                                            <span className="text-lg">{c.icon}</span>
                                            <span className="font-medium">{c.label}</span>
                                        </Link>
                                    ))}
                                    <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <Link href="/products" onClick={() => setOpenCat(false)}
                                            className="block mx-4 text-xs text-primary font-medium hover:underline">View all categories →</Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Brands dropdown */}
                    <div className="relative">
                        <button
                            onMouseEnter={() => setOpenBrands(true)}
                            onMouseLeave={() => setOpenBrands(false)}
                            className="flex items-center gap-1 px-3 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                        >
                            Brands
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", openBrands && "rotate-180")} />
                        </button>
                        {openBrands && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenBrands(false)} />
                                <div className="absolute top-full left-0 z-20 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular Brands</p>
                                    </div>
                                    {brands.map(b => (
                                        <Link key={b.href} href={b.href} onClick={() => setOpenBrands(false)}
                                            className="block px-4 py-2.5 hover:bg-accent transition-colors text-sm font-medium">{b.label}</Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {quickLinks.map(l => (
                        <Link key={l.href} href={l.href}
                            className={cn("px-3 py-2 text-sm font-medium transition-colors hover:text-white", l.href === "/sale" && "text-red-400 hover:text-red-300")}>
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex-1" />
                <div className="flex items-center gap-0.5">
                    <button onClick={() => setSearchOpen(true)} className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </button>
                    {userId ? (
                        <Link href="/account" className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10" title="Account">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        </Link>
                    ) : (
                        <RainbowButton asChild variant="outline" size="sm" className="hidden sm:inline-flex ml-1 text-white/80 hover:text-white dark:bg-transparent dark:text-white/80">
                            <Link href="/sign-in">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                Sign In
                            </Link>
                        </RainbowButton>
                    )}
                    <Link href="/account/wishlist" className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10 hidden sm:block" title="Wishlist">
                        <Heart className="w-5 h-5" />
                    </Link>
                    <BasketButton />
                    <ModeToggler />
                </div>
            </header>

            {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
        </>
    );
}

function SearchModal({ onClose }: { onClose: () => void }) {
    const [q, setQ] = useState("");
    const submit = () => { if (q.trim()) { onClose(); window.location.href = `/products?q=${encodeURIComponent(q.trim())}`; } };
    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                    <input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                        placeholder="Search products, brands, categories..."
                        className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="text-[10px] text-muted-foreground border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 hidden sm:block">ESC</kbd>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-4 text-sm text-muted-foreground text-center">Press Enter to search</div>
            </div>
        </div>
    );
}
