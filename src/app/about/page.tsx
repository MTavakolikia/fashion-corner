import Link from "next/link";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Highlighter } from "@/components/magicui/highlighter";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-orange-500 text-white">
                <DotPattern
                    width={22}
                    height={22}
                    className="opacity-30 text-white [mask-image:radial-gradient(500px_circle_at_50%_50%,white,transparent)]"
                />
                <div className="container mx-auto px-4 py-14 text-center relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1 mb-4 text-sm text-white/90">
                            <AnimatedShinyText className="text-white/90 dark:text-white/90 mx-0 max-w-none">
                                Our story
                            </AnimatedShinyText>
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">
                            <AnimatedGradientText colorFrom="#ffffff" colorTo="#ffe4b5" speed={1.5}>
                                About Us
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-white/80">Our story, mission, and what drives us</p>
                    </BlurFade>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium">About</span>
                    </nav>
                </div>
            </div>

            {/* Stats */}
            <div className="container mx-auto px-4 py-10 max-w-4xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { value: 1000, suffix: "+", label: "Curated products" },
                        { value: 50, suffix: "+", label: "Countries served" },
                        { value: 30, suffix: "-day", label: "Easy returns" },
                        { value: 24, suffix: "/7", label: "Customer support" },
                    ].map((stat, i) => (
                        <BlurFade key={stat.label} delay={0.08 * i} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.1}
                                gradientSize={160}
                                className="text-center p-5 rounded-2xl border bg-card"
                            >
                                <p className="text-2xl md:text-3xl font-bold inline-flex items-center justify-center text-foreground">
                                    <NumberTicker value={stat.value} className="text-2xl md:text-3xl font-bold text-foreground" />
                                    <span>{stat.suffix}</span>
                                </p>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </MagicCard>
                        </BlurFade>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 pb-12 max-w-3xl">
                <BlurFade inView>
                    <h2 className="text-2xl font-bold mb-4">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            Fashion Corner
                        </AnimatedGradientText>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Fashion Corner is a{" "}
                        <Highlighter action="highlight" color="#fde68a" isView animationDuration={800}>
                            premium online fashion marketplace
                        </Highlighter>{" "}
                        connecting discerning customers with curated styles from independent sellers and leading brands worldwide.
                    </p>
                </BlurFade>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <BlurFade inView delay={0.1}>
                        <p>
                            Our mission is to make quality fashion accessible while supporting independent creators and sellers. We believe in sustainable shopping practices and strive to build a community centered around style, quality, and authenticity.
                        </p>
                    </BlurFade>

                    <BlurFade inView delay={0.15}>
                        <div>
                            <h3 className="text-foreground font-semibold text-lg mb-3">What We Offer</h3>
                            <ul className="space-y-2 list-none pl-0">
                                {[
                                    "Curated collections across men's, women's, and kids' fashion",
                                    "Verified seller marketplace with quality assurance",
                                    "Secure checkout with multiple payment options",
                                    "Hassle-free returns and customer support",
                                    "Personalized recommendations based on your preferences",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </BlurFade>

                    <BlurFade inView delay={0.2} className="text-center pt-4">
                        <RainbowButton asChild size="lg">
                            <Link href="/contact">Get in touch</Link>
                        </RainbowButton>
                    </BlurFade>
                </div>
            </div>
        </div>
    );
}
