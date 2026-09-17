import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title="Shipping Info"
                subtitle="Delivery options and timelines"
                badge="Fast & tracked delivery"
                crumb="Shipping"
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-6">
                    {[
                        { title: "Standard Shipping", desc: "5-7 business days. Free on orders over $50.", price: "Free / $5.99" },
                        { title: "Express Shipping", desc: "2-3 business days. Priority handling.", price: "$12.99" },
                        { title: "International Shipping", desc: "7-14 business days. Duties and taxes apply.", price: "Varies by location" },
                    ].map((option, i) => (
                        <BlurFade key={option.title} delay={0.08 * i} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.08}
                                gradientSize={220}
                                className="bg-card border rounded-lg p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-3">
                                            <h2 className="font-semibold text-foreground">{option.title}</h2>
                                            <span className="text-sm font-medium text-primary">{option.price}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>
                    ))}
                </div>

                <p className="text-center text-muted-foreground mt-8 text-sm">
                    Questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
                </p>
            </div>
        </div>
    );
}
