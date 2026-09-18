"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ChevronDown, X } from "lucide-react";
import { ModeToggler } from "../../ModeToggler";
import { BasketButton } from "@/components/BasketButton";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            {/* Top utility bar */}
            <div className="hidden md:flex items-center justify-between px-8 py-1.5 bg-muted text-foreground border-b border-border w-full max-w-full min-w-0 overflow-hidden">
                <a href="https://mohammadtavakolikia.ir" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    mohammadtavakolikia.ir — Portfolio
                </a>
                <span className="text-[11px] font-medium tracking-wide">
                    <AnimatedShinyText className="text-foreground mx-0 max-w-none">
                        Built by Mohammad Tavakoli Kia &nbsp;✦&nbsp; React & Next.js Developer
                    </AnimatedShinyText>
                </span>
            </div>

            {/* Main header */}
            <header className="flex items-center gap-6 px-8 py-3 bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-border w-full max-w-full min-w-0 overflow-hidden">
                <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                    <Image src="/images/fashion-corner.png" alt="logo" width={32} height={30} className="shrink-0 group-hover:scale-105 transition-transform" style={{ width: 'auto', height: '1.875rem' }} />
                    <span className="text-foreground font-bold text-lg tracking-tight hidden sm:block">Fashion Corner</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-0.5 ml-6">
                    {/* Categories dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="group flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                                Categories
                                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-72 fixed z-[9999]">
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop by Category</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {categories.map(c => (
                                <DropdownMenuItem key={c.href} asChild className="gap-3 py-2 font-medium">
                                    <Link href={c.href}>
                                        <span className="text-lg" aria-hidden="true">{c.icon}</span>
                                        <span>{c.label}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="text-primary font-medium">
                                <Link href="/products">View all categories →</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Brands dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="group flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                                Brands
                                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 fixed z-[9999]">
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular Brands</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {brands.map(b => (
                                <DropdownMenuItem key={b.href} asChild className="font-medium">
                                    <Link href={b.href}>{b.label}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {quickLinks.map(l => (
                        <Link key={l.href} href={l.href}
                            className={cn("px-3 py-2 text-sm font-medium transition-colors", l.href === "/sale" ? "text-red-700 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400" : "text-foreground hover:text-muted-foreground")}>
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex-1" />
                <div className="flex items-center gap-0.5">
                    <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </button>
                    {userId ? (
                        <Link href="/account" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted" title="Account">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        </Link>
                    ) : (
                        <RainbowButton asChild variant="outline" size="sm" className="hidden sm:inline-flex ml-1 dark:bg-transparent">
                            <Link href="/sign-in">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                Sign In
                            </Link>
                        </RainbowButton>
                    )}
                    <Link href="/account/wishlist" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted hidden sm:block" title="Wishlist">
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
