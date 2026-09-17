import Link from "next/link";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { MagicCard } from "@/components/magicui/magic-card";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function ContactPage() {
    const channels = [
        {
            title: "Email",
            value: "support@fashioncorner.com",
            icon: (
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            title: "Phone",
            value: "+1 (234) 567-890",
            icon: (
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
        },
        {
            title: "Hours",
            value: "Monday-Friday, 9AM - 6PM EST",
            icon: (
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
                <DotPattern
                    width={22}
                    height={22}
                    className="opacity-30 text-white [mask-image:radial-gradient(500px_circle_at_50%_50%,white,transparent)]"
                />
                <div className="container mx-auto px-4 py-14 text-center relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1 mb-4 text-sm text-white/90">
                            <AnimatedShinyText className="text-white/90 dark:text-white/90 mx-0 max-w-none">
                                We reply within 24 hours
                            </AnimatedShinyText>
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">
                            <AnimatedGradientText colorFrom="#ffffff" colorTo="#dbeafe" speed={1.5}>
                                Contact Us
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-white/80">We&apos;d love to hear from you</p>
                    </BlurFade>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium">Contact</span>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="space-y-4">
                    {channels.map((channel, i) => (
                        <BlurFade key={channel.title} delay={0.08 * i} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#60a5fa"
                                gradientTo="#a855f7"
                                gradientOpacity={0.1}
                                gradientSize={220}
                                className="bg-card border rounded-xl p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        {channel.icon}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-foreground">{channel.title}</h2>
                                        <p className="text-muted-foreground mt-0.5">{channel.value}</p>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>
                    ))}
                </div>

                <BlurFade inView delay={0.25} className="text-center mt-10 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Prefer a ticket? Open one from your account dashboard for a faster response.
                    </p>
                    <RainbowButton asChild size="lg">
                        <Link href="/account/support">Open a support ticket</Link>
                    </RainbowButton>
                </BlurFade>
            </div>
        </div>
    );
}
