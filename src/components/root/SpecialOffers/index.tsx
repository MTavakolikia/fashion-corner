"use client"

import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import { ShineBorder } from "@/components/magicui/shine-border"
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
        colorFrom: "#ff6b35",
        colorTo: "#f7931e"
    },
    {
        title: "New Season",
        description: "Check out our latest arrivals",
        image: NewSeason,
        buttonText: "Discover More",
        href: "/new-arrivals",
        colorFrom: "#3b82f6",
        colorTo: "#8b5cf6"
    }
]

export function SpecialOffers() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <BlurFade inView>
                    <span className="inline-block rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1 mb-4 text-orange-600 dark:text-orange-300">
                        <AnimatedShinyText>Limited time only</AnimatedShinyText>
                    </span>
                </BlurFade>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <AnimatedGradientText
                        colorFrom="#ffaa40"
                        colorTo="#9c40ff"
                        speed={1.5}
                    >
                        Special Offers
                    </AnimatedGradientText>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Limited time deals on our most popular collections
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {offers.map((offer, index) => (
                    <BlurFade key={index} delay={0.1 * index} inView>
                        <Link href={offer.href} className="block h-full">
                            <div className="relative overflow-hidden rounded-2xl group aspect-[16/9] h-full">
                                <ShineBorder
                                    borderWidth={2}
                                    duration={10}
                                    shineColor={[offer.colorFrom, offer.colorTo]}
                                    className="rounded-2xl"
                                />
                                <div className="relative aspect-[16/9]">
                                    <Image
                                        src={offer.image}
                                        alt={offer.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div
                                        className="absolute inset-0 opacity-80"
                                        style={{
                                            backgroundImage: `linear-gradient(to right, ${offer.colorFrom}, ${offer.colorTo})`,
                                        }}
                                    />
                                </div>
                                <BorderBeam
                                    colorFrom={offer.colorFrom}
                                    colorTo={offer.colorTo}
                                    duration={6}
                                    size={50}
                                    borderWidth={2}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                                    <h3 className="text-3xl md:text-4xl font-bold mb-2">{offer.title}</h3>
                                    <p className="text-lg mb-6 max-w-md">{offer.description}</p>
                                    <ShimmerButton
                                        className="px-8 py-3 text-base font-medium text-gray-900"
                                        shimmerColor="#ffffff"
                                        background="rgba(255, 255, 255, 0.9)"
                                    >
                                        {offer.buttonText}
                                    </ShimmerButton>
                                </div>
                            </div>
                        </Link>
                    </BlurFade>
                ))}
            </div>
        </section>
    )
}
