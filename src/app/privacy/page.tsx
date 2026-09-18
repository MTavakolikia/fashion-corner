import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title="Privacy Policy"
                subtitle="How we collect, use, and protect your data"
                badge="Your data, protected"
                crumb="Privacy Policy"
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-8">
                    {[
                        { title: "1. Information We Collect", content: "We collect information you provide directly (name, email, shipping address) and automatically (browser type, IP address, pages visited)." },
                        { title: "2. How We Use Your Information", content: "Your information is used to process orders, improve our services, send marketing communications (with consent), and comply with legal obligations." },
                        { title: "3. Data Sharing", content: "We share information with trusted service providers (payment processors, shipping partners) and only as required by law." },
                        { title: "4. Cookies", content: "We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content." },
                        { title: "5. Your Rights", content: "You may access, correct, or delete your personal data at any time by contacting us or through your account settings." },
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
                    <p>Questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link></p>
                </div>
            </div>
        </div>
    );
}
