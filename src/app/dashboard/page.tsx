import Link from "next/link";
import { Package, ShoppingCart, FileText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MagicCard } from "@/components/magicui/magic-card";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function DashboardPage() {
    const shortcuts = [
        { href: "/dashboard/products", label: "Products", description: "Browse and manage the catalog", icon: Package },
        { href: "/dashboard/orders", label: "Orders", description: "Review recent customer orders", icon: ShoppingCart },
        { href: "/dashboard/import-products", label: "Import Products", description: "Populate the catalog from FakeStoreAPI", icon: FileText },
    ];

    return (
        <DashboardShell title="Dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortcuts.map((item, i) => (
                    <BlurFade key={item.href} delay={0.08 * i} inView>
                        <Link href={item.href} className="block h-full">
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.1}
                                gradientSize={220}
                                className="bg-card border rounded-xl p-5 h-full"
                            >
                                <item.icon className="w-6 h-6 text-primary mb-3" />
                                <h2 className="font-semibold text-foreground">{item.label}</h2>
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </MagicCard>
                        </Link>
                    </BlurFade>
                ))}
            </div>
        </DashboardShell>
    );
}
