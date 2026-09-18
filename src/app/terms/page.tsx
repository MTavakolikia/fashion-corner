import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title="Terms of Service"
                subtitle="Last updated: September 2025"
                badge="The fine print"
                crumb="Terms of Service"
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-8">
                    {[
                        { title: "1. Acceptance of Terms", content: "By accessing and using Fashion Corner, you agree to be bound by these Terms of Service." },
                        { title: "2. Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account." },
                        { title: "3. Orders", content: "All orders are subject to availability and acceptance. We reserve the right to refuse or cancel any order." },
                        { title: "4. Returns", content: "Please refer to our Return Policy for details on eligible returns and refunds." },
                        { title: "5. Intellectual Property", content: "All content on this site is the property of Fashion Corner and protected by intellectual property laws." },
                    ].map((section, i) => (
                        <BlurFade key={section.title} delay={0.06 * i} inView>
                            <div className="border-b last:border-0 pb-6 last:pb-0">
                                <h2 className="font-semibold text-foreground mb-2">{section.title}</h2>
                                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                            </div>
                        </BlurFade>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t text-sm text-muted-foreground">
                    <p>By using this website, you acknowledge that you have read and understand these terms.</p>
                </div>
            </div>
        </div>
    );
}
