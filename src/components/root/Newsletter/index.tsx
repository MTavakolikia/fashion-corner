"use client"

import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { Meteors } from "@/components/magicui/meteors"
import { Confetti, type ConfettiRef } from "@/components/magicui/confetti"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"

export function Newsletter() {
    const [email, setEmail] = useState("")
    const confettiRef = useRef<ConfettiRef>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        confettiRef.current?.fire({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.7 },
        })
        setEmail("")
    }

    return (
        <section className="w-full bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 relative overflow-hidden">
            <DotPattern
                width={22}
                height={22}
                className="opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
                glow
            />
            <Meteors number={14} className="opacity-60" />
            <Confetti
                ref={confettiRef}
                manualstart
                className="pointer-events-none fixed inset-0 z-50 h-full w-full"
            />
            <div className="w-full max-w-7xl mx-auto px-4 py-16 relative">
                <BlurFade inView className="text-center space-y-4 max-w-2xl mx-auto">
                    <span className="inline-block rounded-full border border-purple-500/20 bg-background/60 backdrop-blur-sm px-4 py-1 text-sm text-purple-600 dark:text-purple-300">
                        <AnimatedShinyText>Join 50,000+ fashion lovers</AnimatedShinyText>
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        <AnimatedGradientText
                            colorFrom="#ffaa40"
                            colorTo="#9c40ff"
                            speed={1.5}
                        >
                            Subscribe to Our Newsletter
                        </AnimatedGradientText>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Stay updated with our latest trends, fashion tips and exclusive offers.
                    </p>
                    <form onSubmit={handleSubmit} className="flex gap-3 mt-8 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-primary/20"
                        />
                        <ShimmerButton
                            type="submit"
                            className="px-6 py-3"
                            shimmerColor="#ffaa40"
                            background="rgba(156, 64, 255, 1)"
                        >
                            Subscribe
                        </ShimmerButton>
                    </form>
                    <p className="text-sm text-muted-foreground mt-4">
                        By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                    </p>
                </BlurFade>
            </div>
        </section>
    )
}
