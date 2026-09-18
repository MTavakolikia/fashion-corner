import Link from "next/link";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

interface PageHeroProps {
    title: string;
    subtitle?: string;
    badge?: string;
    crumb?: string;
    colorFrom?: string;
    colorTo?: string;
    className?: string;
}

export function PageHero({
    title,
    subtitle,
    badge,
    crumb,
    colorFrom = "#ffaa40",
    colorTo = "#9c40ff",
    className,
}: PageHeroProps) {
    return (
        <>
            <div
                className={cn(
                    "relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-orange-500 text-white",
                    className
                )}
            >
                <DotPattern
                    width={22}
                    height={22}
                    className="opacity-30 text-white [mask-image:radial-gradient(500px_circle_at_50%_50%,white,transparent)]"
                />
                <div className="container mx-auto px-4 py-14 text-center relative">
                    <BlurFade inView>
                        {badge && (
                            <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1 mb-4 text-sm text-white/90">
                                <AnimatedShinyText className="text-white/90 dark:text-white/90 mx-0 max-w-none">
                                    {badge}
                                </AnimatedShinyText>
                            </span>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">
                            <AnimatedGradientText colorFrom={colorFrom} colorTo={colorTo} speed={1.5}>
                                {title}
                            </AnimatedGradientText>
                        </h1>
                        {subtitle && <p className="text-white/80 max-w-xl mx-auto">{subtitle}</p>}
                    </BlurFade>
                </div>
            </div>

            {crumb && (
                <div className="border-b bg-card/50">
                    <div className="container mx-auto px-4 py-3">
                        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                            <span className="text-muted-foreground/50">/</span>
                            <span className="text-foreground font-medium">{crumb}</span>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
