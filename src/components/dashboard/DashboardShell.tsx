import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardSidebarNav, type DashboardNavItem } from "@/components/dashboard/DashboardSidebarNav";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";

const NAV: DashboardNavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/dashboard/products", label: "Products", icon: "Package" },
    { href: "/dashboard/orders", label: "Orders", icon: "ShoppingCart" },
    { href: "/dashboard/import-products", label: "Import Products", icon: "FileText" },
];

interface DashboardShellProps {
    children: React.ReactNode;
    title?: string;
}

export function DashboardShell({ children, title = "Dashboard" }: DashboardShellProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            Fashion Corner
                        </AnimatedGradientText>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">Dashboard</p>
                </div>

                <DashboardSidebarNav items={NAV} />

                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center">
                    <h1 className="text-lg font-semibold">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            {title}
                        </AnimatedGradientText>
                    </h1>
                    <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
                        <AnimatedShinyText className="mx-0 max-w-none">Fashion Corner Console</AnimatedShinyText>
                    </span>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <BlurFade inView>{children}</BlurFade>
                </main>
            </div>
        </div>
    );
}
