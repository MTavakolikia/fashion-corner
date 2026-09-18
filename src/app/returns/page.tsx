import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title="Returns & Exchanges"
                subtitle="Hassle-free returns within 30 days"
                badge="30-day return policy"
                crumb="Returns"
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-6">
                    {[
                        { title: "Eligibility", content: "Items must be returned within 30 days of delivery, in original condition with tags attached and original packaging." },
                        { title: "How to Return", content: "Go to your account dashboard > Orders > Request Return. Select the item(s) and reason, then follow the instructions to print a return label." },
                        { title: "Refunds", content: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be issued to your original payment method." },
                        { title: "Exchanges", content: "Want a different size or color? Request an exchange from your order page. Available items will be sent once the return is received." },
                        { title: "Non-Returnable Items", content: "Intimates, swimwear, and final sale items cannot be returned for hygiene reasons unless defective." },
                    ].map((section, i) => (
                        <BlurFade key={section.title} delay={0.08 * i} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.08}
                                gradientSize={220}
                                className="bg-card border rounded-lg p-5"
                            >
                                <h2 className="font-semibold text-foreground mb-2">{section.title}</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                            </MagicCard>
                        </BlurFade>
                    ))}
                </div>

                <p className="text-center text-muted-foreground mt-8 text-sm">
                    Need help with a return? <Link href="/account/support" className="text-primary hover:underline">Open a support ticket</Link>
                </p>
            </div>
        </div>
    );
}
