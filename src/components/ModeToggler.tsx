"use client"

import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler"

export function ModeToggler() {
    return (
        <AnimatedThemeToggler
            variant="circle"
            duration={450}
            className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 [&_svg]:w-5 [&_svg]:h-5"
            aria-label="Toggle theme"
        />
    )
}
