"use client"
import Autoplay from "embla-carousel-autoplay"
import slider1 from "./images/Slider(1).webp"
import slider2 from "./images/Slider(2).webp"
import slider3 from "./images/Slider(3).webp"
import slider4 from "./images/Slider(4).webp"
import slider5 from "./images/Slider(5).webp"
import slider6 from "./images/Slider(6).webp"

import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { useRef } from "react"
import { motion } from "framer-motion"

const slides = [
    {
        image: slider1,
        title: "Summer Collection 2024",
        description: "Discover our latest summer trends with fresh and vibrant pieces that will make you stand out.",
        cta: "Shop Summer Collection",
        ctaLink: "/collections/summer-2024"
    },
    {
        image: slider2,
        title: "Luxury Accessories",
        description: "Elevate your style with our premium collection of handbags, jewelry, and accessories.",
        cta: "Explore Accessories",
        ctaLink: "/collections/accessories"
    },
    {
        image: slider3,
        title: "Men's Fashion Week",
        description: "Step into sophistication with our curated selection of men's fashion essentials.",
        cta: "Shop Men's Collection",
        ctaLink: "/collections/mens"
    },
    {
        image: slider4,
        title: "Women's Empowerment",
        description: "Celebrate women's fashion with our empowering collection of contemporary styles.",
        cta: "Shop Women's Collection",
        ctaLink: "/collections/womens"
    },
    {
        image: slider5,
        title: "Sustainable Fashion",
        description: "Join the movement towards sustainable fashion with our eco-friendly collection.",
        cta: "Shop Sustainable",
        ctaLink: "/collections/sustainable"
    },
    {
        image: slider6,
        title: "Exclusive Designer Pieces",
        description: "Discover limited edition pieces from renowned designers around the world.",
        cta: "View Designer Collection",
        ctaLink: "/collections/designer"
    }
]

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

const fadeInLeft = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay: 0.2 }
}

const fadeInRight = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay: 0.4 }
}

export function Banner() {
    const plugin = useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                    loop: true,
                    align: "start"
                }}
            >
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <div className="flex items-center gap-8 p-4 justify-between">
                                {/* Text Content */}
                                <motion.div
                                    className="text-center md:text-left space-y-6 w-96"
                                    initial="initial"
                                    animate="animate"
                                    variants={fadeInLeft}
                                >
                                    <motion.h2
                                        className="text-3xl md:text-4xl font-bold tracking-tight"
                                        variants={fadeInUp}
                                    >
                                        {slide.title}
                                    </motion.h2>
                                    <motion.p
                                        className="text-lg text-muted-foreground"
                                        variants={fadeInUp}
                                    >
                                        {slide.description}
                                    </motion.p>
                                    <motion.div variants={fadeInUp}>
                                        <Button
                                            size="lg"
                                            className="mt-4"
                                            onClick={() => window.location.href = slide.ctaLink}
                                        >
                                            {slide.cta}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                                <motion.div
                                    className=""
                                    initial="initial"
                                    animate="animate"
                                    variants={fadeInRight}
                                >
                                    <div className="relative">
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            height={500}
                                            className="object-cover rounded-t-full"
                                            priority={index === 0}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-8">
                    <CarouselPrevious className="static" />
                    <CarouselNext className="static" />
                </div>
            </Carousel>
        </div>
    )
}
