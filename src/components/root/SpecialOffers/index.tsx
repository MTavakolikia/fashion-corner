"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import SummerSale from "./images/summer-sale.webp"
import NewSeason from "./images/new-season.webp"

const offers = [
    {
        title: "Summer Sale",
        description: "Up to 50% off on summer collection",
        image: SummerSale,
        buttonText: "Shop Now",
        href: "/sale/summer",
        color: "from-orange-500 to-pink-500"
    },
    {
        title: "New Season",
        description: "Check out our latest arrivals",
        image: NewSeason,
        buttonText: "Discover More",
        href: "/new-arrivals",
        color: "from-blue-500 to-purple-500"
    }
]

export function SpecialOffers() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {offers.map((offer, index) => (
                    <div key={index} className="relative overflow-hidden rounded-2xl group">
                        <div className="relative aspect-[16/9]">
                            <Image
                                src={offer.image}
                                alt={offer.title}
                                fill
                                className="object-cover"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-90`} />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                            <h3 className="text-3xl md:text-4xl font-bold mb-2">{offer.title}</h3>
                            <p className="text-lg mb-6">{offer.description}</p>
                            <Link href={offer.href}>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="bg-white text-gray-900 hover:bg-gray-100"
                                >
                                    {offer.buttonText}
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
} 