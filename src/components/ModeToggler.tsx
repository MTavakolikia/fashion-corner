"use client"

import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler"
import { cn } from "@/lib/utils"

interface ModeTogglerProps {
    /** Render for an always-dark surface (e.g. black navbar) where theme tokens don't apply. */
    onDark?: boolean;
}

export function ModeToggler({ onDark = false }: ModeTogglerProps) {
    return (
        <AnimatedThemeToggler
            variant="circle"
            duration={450}
            className={cn(
                "p-2 transition-colors rounded-full [&_svg]:w-5 [&_svg]:h-5",
                onDark
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-label="Toggle theme"
        />
    )
}
