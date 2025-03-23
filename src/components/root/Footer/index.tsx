"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react"
import Visa from "./images/visa.svg"
import Mastercard from "./images/mastercard.svg"
import Paypal from "./images/paypal.svg"
import ApplePay from "./images/apple-pay.svg"
import GooglePay from "./images/google-pay.svg"
const footerLinks = {
    shop: [
        { name: "Women's Fashion", href: "/categories/womens" },
        { name: "Men's Fashion", href: "/categories/mens" },
        { name: "Kids & Baby", href: "/categories/kids" },
        { name: "Accessories", href: "/categories/accessories" },
        { name: "New Arrivals", href: "/new-arrivals" },
        { name: "Sale", href: "/sale" },
    ],
    help: [
        { name: "Customer Service", href: "/help/customer-service" },
        { name: "Track Order", href: "/help/track-order" },
        { name: "Return & Exchange", href: "/help/returns" },
        { name: "Shipping Info", href: "/help/shipping" },
        { name: "FAQ", href: "/help/faq" },
        { name: "Size Guide", href: "/help/size-guide" },
    ],
    about: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
        { name: "Contact Us", href: "/contact" },
    ],
}

const paymentMethods = [
    { name: "Visa", image: Visa },
    { name: "Mastercard", image: Mastercard },
    { name: "PayPal", image: Paypal },
    { name: "Apple Pay", image: ApplePay },
    { name: "Google Pay", image: GooglePay },
]

export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900/50 border-t">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Fashion Corner</h3>
                        <p className="text-sm text-muted-foreground">
                            Your one-stop destination for trendy fashion and accessories.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>123 Fashion Street, Style City</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>+1 234 567 890</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>contact@fashioncorner.com</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Shop</h3>
                        <ul className="space-y-2">
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Help</h3>
                        <ul className="space-y-2">
                            {footerLinks.help.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">About</h3>
                        <ul className="space-y-2">
                            {footerLinks.about.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Payment Methods:</span>
                            <div className="flex gap-2">
                                {paymentMethods.map((method) => (
                                    <div key={method.name} className="relative w-12 h-8 bg-white rounded-md">
                                        <Image
                                            src={method.image}
                                            alt={method.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>© 2025 Fashion Corner. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
} 