"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type Attribute = "class" | "data-theme"

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: Theme
}

const ThemeContext = React.createContext<ThemeContextValue>({
    theme: "system",
    setTheme: () => {},
    resolvedTheme: "light",
})

export function useTheme() {
    return React.useContext(ThemeContext)
}

function getSystemTheme(): Theme {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(attribute: Attribute, theme: Theme): void {
    const root = document.documentElement
    if (attribute === "class") {
        root.classList.remove("light", "dark")
        root.classList.add(theme)
    } else {
        root.setAttribute(attribute, theme)
    }
    if (theme === "light" || theme === "dark") {
        root.style.colorScheme = theme
    } else {
        root.style.colorScheme = ""
    }
}

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "system",
    enableSystem = true,
    themes = ["light", "dark"],
    disableTransitionOnChange = false,
}: {
    children: React.ReactNode
    attribute?: Attribute
    defaultTheme?: Theme
    enableSystem?: boolean
    themes?: Theme[]
    disableTransitionOnChange?: boolean
}) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window === "undefined") return defaultTheme
        try {
            const stored = localStorage.getItem("theme") as Theme | null
            if (stored && themes.includes(stored)) return stored
        } catch {}
        return defaultTheme
    })

    const resolvedTheme = React.useMemo(() => {
        if (theme === "system" && enableSystem) return getSystemTheme()
        return theme === "system" ? "light" : theme
    }, [theme, enableSystem])

    React.useEffect(() => {
        applyTheme(attribute, resolvedTheme)
    }, [attribute, resolvedTheme])

    const setTheme = React.useCallback((newTheme: Theme) => {
        setThemeState(newTheme)
        try {
            localStorage.setItem("theme", newTheme)
        } catch {}
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
