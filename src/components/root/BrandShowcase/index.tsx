"use client"

import Image from "next/image"
import { Marquee } from "@/components/magicui/marquee"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import Nike from "./images/nike.svg"
import Adidas from "./images/adidas.svg"
import Gucci from "./images/gucci.svg"
import Zara from "./images/zara.svg"
import Hm from "./images/hm.svg"
import Puma from "./images/puma.svg"
import LouisVuitton from "./images/louis-vuitton.svg"
import Uniqlo from "./images/uniqlo.svg"


const brands = [
    {
        name: "Nike",
        logo: Nike,
        href: "/brands/nike"
    },
    {
        name: "Adidas",
        logo: Adidas,
        href: "/brands/adidas"
    },
    {
        name: "Gucci",
        logo: Gucci,
        href: "/brands/gucci"
    },
    {
        name: "Zara",
        logo: Zara,
        href: "/brands/zara"
    },
    {
        name: "H&M",
        logo: Hm,
        href: "/brands/hm"
    },
    {
        name: "Puma",
        logo: Puma,
        href: "/brands/puma"
    },
    {
        name: "Louis Vuitton",
        logo: LouisVuitton,
        href: "/brands/louis-vuitton"
    },
    {
        name: "Uniqlo",
        logo: Uniqlo,
        href: "/brands/uniqlo"
    }
]

export function BrandShowcase() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <BlurFade inView>
                    <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 mb-4 text-blue-600 dark:text-blue-300">
                        <AnimatedShinyText>Trusted by trendsetters</AnimatedShinyText>
                    </span>
                </BlurFade>
                <h2 className="text-3xl md:text-4xl font-bold text-center">
                    <AnimatedGradientText
                        colorFrom="#ffaa40"
                        colorTo="#9c40ff"
                        speed={1.5}
                    >
                        Our Featured Brands
                    </AnimatedGradientText>
                </h2>
            </div>
            <BlurFade inView delay={0.15}>
                <div className="relative border-t border-b border-border/50 py-8">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24 bg-gradient-to-r from-background to-transparent" />
                    <Marquee
                        className="items-center [--duration:30s]"
                        pauseOnHover
                        repeat={3}
                    >
                        {brands.map((brand, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-center w-48 md:w-56 lg:w-64 h-24 md:h-28 px-4"
                            >
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    width={120}
                                    height={60}
                                    className="opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 filter"
                                />
                            </div>
                        ))}
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24 bg-gradient-to-l from-background to-transparent" />
                </div>
            </BlurFade>
        </section>
    )
}
