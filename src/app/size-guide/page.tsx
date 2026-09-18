import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { Ruler, ShoppingBag, Shirt, Check } from "lucide-react";

const womensSizes = [
    { size: "XS", bust: "31-32", waist: "24-25", hip: "34-35" },
    { size: "S",  bust: "33-34", waist: "26-27", hip: "36-37" },
    { size: "M",  bust: "35-36", waist: "28-29", hip: "38-39" },
    { size: "L",  bust: "37-39", waist: "30-32", hip: "40-42" },
    { size: "XL", bust: "40-42", waist: "33-35", hip: "43-45" },
    { size: "XXL", bust: "43-46", waist: "36-39", hip: "46-49" },
];

const mensSizes = [
    { size: "S",  chest: "34-36", waist: "28-30", inseam: "30-31" },
    { size: "M",  chest: "38-40", waist: "32-34", inseam: "31-32" },
    { size: "L",  chest: "42-44", waist: "36-38", inseam: "32-33" },
    { size: "XL", chest: "46-48", waist: "40-42", inseam: "33-34" },
    { size: "XXL", chest: "50-52", waist: "44-46", inseam: "34-35" },
];

const kidsSizes = [
    { size: "2T",  height: "34-36",  chest: "20-21" },
    { size: "3T",  height: "36-38",  chest: "21-22" },
    { size: "4T",  height: "38-41",  chest: "22-23" },
    { size: "5",   height: "41-44",  chest: "23-24" },
    { size: "6",   height: "44-47",  chest: "24-25" },
    { size: "7",   height: "47-50",  chest: "25-26" },
    { size: "8",   height: "50-53",  chest: "26-27" },
];

function SizeTable({ title, icon: Icon, columns, rows }: {
    title: string;
    icon: typeof Shirt;
    columns: string[];
    rows: Array<Record<string, string>>;
}) {
    return (
        <BlurFade inView>
            <MagicCard
                mode="gradient"
                gradientFrom="#ffaa40"
                gradientTo="#9c40ff"
                gradientOpacity={0.08}
                gradientSize={200}
                className="bg-card border rounded-lg p-5 overflow-hidden"
            >
                <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                    {title}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {columns.map(c => (
                                    <th key={c} className="text-left font-medium text-muted-foreground py-2 pr-4 capitalize">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-b border-border/50 last:border-0">
                                    <td className="py-2.5 pr-4 font-medium text-foreground">{row.size}</td>
                                    {Object.values(row).slice(1).map((v, j) => (
                                        <td key={j} className="py-2.5 pr-4 text-muted-foreground">{v}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </MagicCard>
        </BlurFade>
    );
}

const measuringTips = [
    "Chest/Bust: Measure around the fullest part of your chest/bust, keeping the tape horizontal.",
    "Waist: Measure around your natural waistline — the narrowest point, usually above the belly button.",
    "Hips: Stand with feet together and measure around the fullest part of your hips.",
    "Inseam: Measure from the top of your inner thigh down to just above your ankle.",
];

export default function SizeGuidePage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHero
                title="Size Guide"
                subtitle="Find your perfect fit with our easy size charts"
                badge="Fit advice from our stylists"
                crumb="Size Guide"
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* How to measure */}
                <div className="mb-10">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Ruler className="w-5 h-5 text-primary" />
                        How to measure
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {measuringTips.map((tip, i) => (
                            <BlurFade key={tip} delay={0.05 * i} inView>
                                <div className="flex items-start gap-2.5 bg-card border rounded-lg p-4 text-sm text-muted-foreground h-full">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                    </span>
                                    {tip}
                                </div>
                            </BlurFade>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <SizeTable title="Women's sizes (inches)" icon={ShoppingBag} columns={["Size", "Bust", "Waist", "Hip"]} rows={womensSizes} />
                    <SizeTable title="Men's sizes (inches)" icon={ShoppingBag} columns={["Size", "Chest", "Waist", "Inseam"]} rows={mensSizes} />
                    <SizeTable title="Kids & baby sizes (inches)" icon={Shirt} columns={["Size", "Height", "Chest"]} rows={kidsSizes} />
                </div>

                <p className="text-center text-muted-foreground mt-8 text-sm">
                    Still unsure about your size?{" "}
                    <Link href="/contact" className="text-primary hover:underline">Contact us</Link>{" "}
                    or check our <Link href="/returns" className="text-primary hover:underline">easy returns</Link>.
                </p>
            </div>
        </div>
    );
}