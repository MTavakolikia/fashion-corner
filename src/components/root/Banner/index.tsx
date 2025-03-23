"use client"
import Autoplay from "embla-carousel-autoplay"
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
import { slides } from "./sliderDetails"

export function Banner() {
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
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
                                <div
                                    className="text-center md:text-left space-y-6 w-96"

                                >
                                    <h2
                                        className="text-3xl md:text-4xl font-bold tracking-tight"
                                    >
                                        {slide.title}
                                    </h2>
                                    <p
                                        className="text-lg text-muted-foreground"
                                    >
                                        {slide.description}
                                    </p>
                                    <div>
                                        <Button
                                            size="lg"
                                            className="mt-4"
                                            onClick={() => window.location.href = slide.ctaLink}
                                        >
                                            {slide.cta}
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        height={500}
                                        className="object-cover rounded-t-full"
                                        priority={index === 0}
                                    />
                                </div>
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
