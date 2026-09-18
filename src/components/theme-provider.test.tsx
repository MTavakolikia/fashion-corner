import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./theme-provider";

function Probe() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="resolved">{resolvedTheme}</span>
            <button onClick={() => setTheme("dark")}>go-dark</button>
            <button onClick={() => setTheme("light")}>go-light</button>
        </div>
    );
}

describe("ThemeProvider", () => {
    beforeEach(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "";
        window.localStorage.clear();
    });

    it("defaults to the configured theme and mirrors it onto <html>", () => {
        render(
            <ThemeProvider defaultTheme="light">
                <Probe />
            </ThemeProvider>
        );
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
        expect(screen.getByTestId("resolved")).toHaveTextContent("light");
        expect(document.documentElement.classList.contains("dark")).toBe(false);
        expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("applies the dark class and persists the choice when switched to dark", async () => {
        const user = userEvent.setup();
        render(
            <ThemeProvider defaultTheme="light">
                <Probe />
            </ThemeProvider>
        );

        await user.click(screen.getByText("go-dark"));

        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
        expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.style.colorScheme).toBe("dark");
        expect(window.localStorage.getItem("theme")).toBe("dark");
    });

    it("re-hydrates the theme from localStorage", () => {
        window.localStorage.setItem("theme", "dark");
        render(
            <ThemeProvider>
                <Probe />
            </ThemeProvider>
        );
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
        expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    });

    it("resolves the system theme when set to system", () => {
        render(
            <ThemeProvider defaultTheme="system">
                <Probe />
            </ThemeProvider>
        );
        expect(screen.getByTestId("theme")).toHaveTextContent("system");
        expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    });
});