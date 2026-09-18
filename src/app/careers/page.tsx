import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Briefcase, Heart, Rocket, TrendingUp, Users } from "lucide-react";

const perks = [
    { icon: Heart, title: "Wellness & balance", desc: "Flexible working hours and remote-friendly culture." },
    { icon: TrendingUp, title: "Growth opportunities", desc: "Dedicated budgets for learning, courses and conferences." },
    { icon: Rocket, title: "Impact from day one", desc: "Ship to real customers on a platform built with modern React & Next.js." },
    { icon: Users, title: "Great teammates", desc: "A small, senior team that cares about craft and culture." },
];

const openRoles = [
    { title: "Senior Frontend Engineer", type: "Full-time · Remote", tags: ["React", "Next.js", "TypeScript"] },
    { title: "Full-Stack Developer", type: "Full-time · Remote", tags: ["Next.js", "PostgreSQL", "Prisma"] },
    { title: "UI/UX Designer", type: "Contract · Remote", tags: ["Figma", "Design Systems", "Tailwind CSS"] },
    { title: "E-commerce Growth Marketer", type: "Full-time · Remote", tags: ["SEO", "Content", "CRM"] },
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title="Careers"
                subtitle="Build the future of fashion e-commerce with us"
                badge="We're hiring"
                crumb="Careers"
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Intro */}
                <BlurFade inView>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-2xl font-bold tracking-tight">Do what you do best, with people who care</h2>
                        <p className="text-muted-foreground mt-3">
                            We&apos;re a small team building a fast, delightful shopping experience.
                            If you love clean code, great design, and happy customers — you&apos;ll feel right at home.
                        </p>
                    </div>
                </BlurFade>

                {/* Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {perks.map((perk, i) => (
                        <BlurFade key={perk.title} delay={0.05 * i} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.08}
                                gradientSize={180}
                                className="bg-card border rounded-lg p-5 h-full"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                    <perk.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">{perk.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{perk.desc}</p>
                            </MagicCard>
                        </BlurFade>
                    ))}
                </div>

                {/* Open roles */}
                <BlurFade inView>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Open roles
                    </h2>
                </BlurFade>
                <div className="space-y-3 mb-12">
                    {openRoles.map((role, i) => (
                        <BlurFade key={role.title} delay={0.05 * i} inView>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border rounded-lg p-4">
                                <div>
                                    <h3 className="font-semibold text-foreground">{role.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">{role.type}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {role.tags.map(t => (
                                            <span key={t} className="text-[11px] font-medium bg-primary/10 text-primary rounded-full px-2.5 py-0.5">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <ShimmerButton
                                    className="px-4 py-2 text-sm font-medium whitespace-nowrap"
                                    shimmerColor="#ffaa40"
                                    background="rgba(156, 64, 255, 1)"
                                >
                                    Apply now
                                </ShimmerButton>
                            </div>
                        </BlurFade>
                    ))}
                </div>

                {/* CTA */}
                <BlurFade inView>
                    <div className="text-center bg-card border rounded-lg p-8">
                        <h3 className="text-xl font-bold tracking-tight">Don&apos;t see your role?</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            We&apos;re always on the lookout for talented people. Send us your story.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center mt-5">
                            <RainbowButton asChild>
                                <Link href="/contact">Get in touch</Link>
                            </RainbowButton>
                            <Link href="/about" className="inline-flex items-center px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                                Learn about us
                            </Link>
                        </div>
                    </div>
                </BlurFade>
            </div>
        </div>
    );
}