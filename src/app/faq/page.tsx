import Link from "next/link";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function FAQPage() {
    const faqs = [
        { q: "How do I track my order?", a: "Once your order ships, you will receive a tracking number via email. You can also view order status in your account dashboard." },
        { q: "What is your return policy?", a: "We accept returns within 30 days of delivery. Items must be unused and in original packaging. See our Returns page for full details." },
        { q: "How do I become a seller?", a: "Apply through the seller registration page. Once approved, you will receive access to the seller dashboard to manage your products and orders." },
        { q: "Can I cancel my order?", a: "Orders can be cancelled while they are in PENDING or CONFIRMED status. Once shipped, cancellation is no longer possible." },
        { q: "Do you offer international shipping?", a: "Yes, we ship to select countries. International duties and taxes may apply and are the responsibility of the buyer." },
        { q: "How do I apply a coupon code?", a: "Enter your coupon code at checkout before completing your order. The discount will be applied automatically if the code is valid." },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-orange-500 text-white">
                <div className="container mx-auto px-4 py-14 text-center relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1 mb-4 text-sm text-white/90">
                            <AnimatedShinyText className="text-white/90 dark:text-white/90 mx-0 max-w-none">
                                Everything you need to know
                            </AnimatedShinyText>
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">
                            <AnimatedGradientText colorFrom="#ffffff" colorTo="#ffe4b5" speed={1.5}>
                                FAQ
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-white/80">Frequently asked questions</p>
                    </BlurFade>
                </div>
            </div>

            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium">FAQ</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <BlurFade key={i} delay={0.05 * (i % 6)} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.08}
                                gradientSize={200}
                                className="bg-card border rounded-lg p-5"
                            >
                                <h2 className="font-semibold text-foreground mb-2">{faq.q}</h2>
                                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                            </MagicCard>
                        </BlurFade>
                    ))}
                </div>

                <div className="text-center mt-10 space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Still have questions?
                    </p>
                    <RainbowButton asChild size="lg">
                        <Link href="/contact">Contact us</Link>
                    </RainbowButton>
                </div>
            </div>
        </div>
    );
}
