import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeToggler } from "./ModeToggler";

describe("ModeToggler", () => {
    beforeEach(() => {
        document.documentElement.classList.remove("dark");
        window.localStorage.clear();
    });

    it("renders a toggle button with an accessible label", () => {
        render(<ModeToggler />);
        const button = screen.getByRole("button", { name: "Toggle theme" });
        expect(button).toBeInTheDocument();
    });

    it("uses theme-adaptive colors by default so it stays visible on light surfaces", () => {
        const { container } = render(<ModeToggler />);
        const className = container.querySelector("button")?.getAttribute("class") ?? "";
        expect(className).toContain("text-muted-foreground");
        expect(className).toContain("hover:text-foreground");
        expect(className).not.toContain("text-white/70");
    });

    it("uses white-on-dark colors when rendered on an always-dark surface", () => {
        const { container } = render(<ModeToggler onDark />);
        const className = container.querySelector("button")?.getAttribute("class") ?? "";
        expect(className).toContain("text-white/70");
        expect(className).toContain("hover:bg-white/10");
        expect(className).not.toContain("text-muted-foreground");
    });

    it("toggles the dark class on the document root when clicked", async () => {
        const user = userEvent.setup();
        render(<ModeToggler />);
        expect(document.documentElement.classList.contains("dark")).toBe(false);

        await user.click(screen.getByRole("button", { name: "Toggle theme" }));

        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(window.localStorage.getItem("theme")).toBe("dark");
    });
});