"use client"
import Autoplay from "embla-carousel-autoplay"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import { DotPattern } from "@/components/magicui/dot-pattern"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { slides } from "./sliderDetails"

export function Banner() {
    const [autoplayPlugin] = useState(() => Autoplay({ delay: 3000, stopOnInteraction: true }))
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])

    const handleMouseEnter = useCallback(() => { autoplayPlugin.stop(); }, [autoplayPlugin])
    const handleMouseLeave = useCallback(() => { if (mounted.current) autoplayPlugin.reset(); }, [autoplayPlugin])

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Carousel
                plugins={[autoplayPlugin]}
                className="w-full"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                opts={{
                    loop: true,
                    align: "start"
                }}
            >
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-orange-50/60 dark:from-purple-950/30 dark:via-gray-950/40 dark:to-orange-950/20">
                                <DotPattern
                                    className="opacity-40 [mask-image:radial-gradient(420px_circle_at_20%_50%,white,transparent)]"
                                    width={20}
                                    height={20}
                                    cr={1.2}
                                />
                                <BorderBeam
                                    colorFrom="rgba(255, 170, 64, 0.8)"
                                    colorTo="rgba(156, 64, 255, 0.8)"
                                    duration={8}
                                    size={60}
                                    borderWidth={2}
                                />
                                <div className="flex items-center gap-8 p-6 justify-between relative z-10">
                                    <BlurFade delay={0.1} inView className="text-center md:text-left space-y-6 w-96">
                                        <span className="inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 text-sm text-purple-600 dark:text-purple-300">
                                            <AnimatedShinyText>
                                                ✨ New season just dropped
                                            </AnimatedShinyText>
                                        </span>
                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                                            <AnimatedGradientText
                                                colorFrom="#ffaa40"
                                                colorTo="#9c40ff"
                                                speed={1.5}
                                            >
                                                {slide.title}
                                            </AnimatedGradientText>
                                        </h2>
                                        <p className="text-lg text-muted-foreground max-w-md">
                                            {slide.description}
                                        </p>
                                        <div>
                                            <ShimmerButton
                                                className="mt-4 px-8 py-3.5 text-base font-medium"
                                                onClick={() => { window.location.href = slide.ctaLink }}
                                                shimmerColor="#ffaa40"
                                                background="rgba(156, 64, 255, 1)"
                                            >
                                                {slide.cta}
                                            </ShimmerButton>
                                        </div>
                                    </BlurFade>
                                    <BlurFade delay={0.2} direction="left" inView className="relative w-[400px] h-[300px] shrink-0">
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            sizes="400px"
                                            className="object-cover rounded-2xl"
                                            priority={index === 0}
                                        />
                                    </BlurFade>
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
