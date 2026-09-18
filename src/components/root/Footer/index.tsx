"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
    MapPin, Phone, Mail, Globe,
    Truck, ShieldCheck, RotateCcw, ArrowUp,
} from "lucide-react";
import Visa from "./images/visa.svg";
import Mastercard from "./images/mastercard.svg";
import Paypal from "./images/paypal.svg";
import ApplePay from "./images/apple-pay.svg";
import GooglePay from "./images/google-pay.svg";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DotPattern } from "@/components/magicui/dot-pattern";

const footerLinks = {
    shop: [
        { name: "Women's Fashion", href: "/categories/womens" },
        { name: "Men's Fashion",   href: "/categories/mens" },
        { name: "Kids & Baby",     href: "/categories/kids" },
        { name: "Accessories",     href: "/categories/accessories" },
        { name: "New Arrivals",    href: "/new-arrivals" },
        { name: "Sale",            href: "/sale" },
    ],
    help: [
        { name: "FAQ",                 href: "/faq" },
        { name: "Shipping Info",       href: "/shipping" },
        { name: "Returns & Exchanges", href: "/returns" },
        { name: "Size Guide",          href: "/size-guide" },
        { name: "Track Your Order",    href: "/account/orders" },
        { name: "Contact Us",          href: "/contact" },
    ],
    company: [
        { name: "About Us",          href: "/about" },
        { name: "Privacy Policy",    href: "/privacy" },
        { name: "Terms of Service",  href: "/terms" },
        { name: "Careers",           href: "/careers" },
    ],
};

const paymentMethods = [
    { name: "Visa",        image: Visa },
    { name: "Mastercard",  image: Mastercard },
    { name: "PayPal",      image: Paypal },
    { name: "Apple Pay",   image: ApplePay },
    { name: "Google Pay",  image: GooglePay },
];

const socialLinks = [
    { label: "GitHub",         href: "https://github.com/MTavakolikia" },
    { label: "LinkedIn",       href: "https://linkedin.com/in/mohammad-tavakolikia" },
    { label: "Twitter",        href: "https://twitter.com/webdev_mohammad" },
    { label: "Instagram",      href: "https://instagram.com/mtavakolikia" },
];

export function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) setSubscribed(true);
    };

    return (
        <footer className="bg-gray-950 text-white">
            {/* Features strip */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Truck,  label: "Free Shipping", sub: "On orders over $50" },
                            { icon: ShieldCheck, label: "Secure Payment", sub: "100% protected checkout" },
                            { icon: RotateCcw, label: "Easy Returns", sub: "30-day return policy" },
                            { icon: Globe,  label: "Worldwide", sub: "Ship to 50+ countries" },
                        ].map(f => (
                            <div key={f.label} className="flex items-center gap-2.5">
                                <f.icon className="w-5 h-5 text-primary shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">{f.label}</p>
                                    <p className="text-[11px] text-white/50">{f.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <BlurFade inView>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <Image src="/images/fashion-corner.png" alt="logo" width={36} height={33} />
                            <span className="text-xl font-bold tracking-tight">Fashion Corner</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                            Your premium destination for trendy, timeless fashion. Curated collections from the world&apos;s most iconic brands and emerging designers.
                        </p>
                        <a
                            href="https://mohammadtavakolikia.ir"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            mohammadtavakolikia.ir
                        </a>
                        <div className="space-y-2 text-sm text-white/60">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /><span>mohammadtavakolikia66@gmail.com</span></div>
                        </div>
                        {/* Social */}
                        <div className="flex gap-2 pt-1">
                            {socialLinks.map(s => (
                                <a key={s.label} href={s.href} aria-label={s.label} title={s.label}
                                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white/70 hover:text-white">
                                    <span className="text-xs font-bold">{s.label[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Shop</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.shop.map(l => (
                                <li key={l.name}>
                                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Help</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.help.map(l => (
                                <li key={l.name}>
                                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Company</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map(l => (
                                <li key={l.name}>
                                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                </BlurFade>
            </div>
            <div className="border-t border-white/10 relative overflow-hidden">
                <DotPattern
                    width={24}
                    height={24}
                    className="opacity-20 text-white [mask-image:radial-gradient(500px_circle_at_50%_50%,white,transparent)]"
                />
                <div className="max-w-7xl mx-auto px-4 py-8 relative">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-0.5 mb-2 text-xs text-white/70">
                                <AnimatedShinyText className="text-white/70 dark:text-white/70">
                                    Never miss a drop
                                </AnimatedShinyText>
                            </span>
                            <h3 className="font-semibold text-base">Stay in the loop</h3>
                            <p className="text-sm text-white/50 mt-0.5">Get updates on new arrivals, exclusive offers, and more.</p>
                        </div>
                        {subscribed ? (
                            <p className="text-sm text-green-400 font-medium">Thanks for subscribing! 🎉</p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                                <input type="email" required placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
                                    className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/50 outline-none focus:border-primary transition-colors"
                                />
                                <ShimmerButton
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium whitespace-nowrap"
                                    shimmerColor="#ffaa40"
                                    background="rgba(156, 64, 255, 1)"
                                >
                                    Subscribe
                                </ShimmerButton>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-white/60">© {new Date().getFullYear()} Fashion Corner · Built by <a href="https://mohammadtavakolikia.ir" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mohammad Tavakoli Kia</a>.</p>

                        <div className="flex items-center gap-4">
                            {/* Payment icons */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white/50">Pay with:</span>
                                <div className="flex gap-1.5">
                                    {paymentMethods.map(m => (
                                        <div key={m.name} className="relative w-10 h-6 bg-white rounded overflow-hidden">
                                            <Image src={m.image} alt={m.name} fill className="object-contain p-0.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 text-xs text-white/60">
                                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to top */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-20 md:bottom-6 right-6 w-10 h-10 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all z-40">
                <ArrowUp className="w-5 h-5" />
            </button>
        </footer>
    );
}
