"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
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
            <h2 className="text-3xl font-bold text-center mb-8">Our Featured Brands</h2>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {brands.map((brand, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/6">
                            <Card className="border-none shadow-none">
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <div className="relative w-full h-full opacity-60 hover:opacity-100 transition-opacity">
                                        <Image
                                            src={brand.logo}
                                            alt={brand.name}
                                            width={100}
                                            height={100}
                                            className="bg-white rounded-md  p-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-4">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </Carousel>
        </section>
    )
} 