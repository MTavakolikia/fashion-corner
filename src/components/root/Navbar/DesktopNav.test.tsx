import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DesktopNav from "./DesktopNav";

vi.mock("@/components/BasketButton", () => ({
    BasketButton: () => <button type="button">Cart</button>,
}));

describe("DesktopNav", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("uses a theme-aware header (white in light mode, dark in dark mode)", () => {
        render(<DesktopNav userId={null} />);
        const header = document.querySelector("header");
        expect(header).not.toBeNull();
        const cls = header!.className;
        expect(cls).toContain("bg-background");
        expect(cls).not.toContain("bg-black");
    });

    it("renders quick links readable in light and dark mode", () => {
        render(<DesktopNav userId={null} />);
        for (const label of ["New Arrivals", "All Products"]) {
            const link = screen.getByRole("link", { name: label });
            const cls = link.getAttribute("class") ?? "";
            expect(cls).toContain("text-foreground");
            expect(cls).not.toContain("text-white");
        }
        const sale = screen.getByRole("link", { name: "Sale" });
        expect(sale.className).toContain("text-red-700"); // light mode
        expect(sale.className).toContain("dark:text-red-500"); // dark mode
        expect(sale.className).not.toContain("text-white");
    });

    it("links quick links to their routes", () => {
        render(<DesktopNav userId={null} />);
        expect(screen.getByRole("link", { name: "New Arrivals" })).toHaveAttribute("href", "/new-arrivals");
        expect(screen.getByRole("link", { name: "All Products" })).toHaveAttribute("href", "/products");
        expect(screen.getByRole("link", { name: "Sale" })).toHaveAttribute("href", "/sale");
    });

    describe("menu dropdowns", () => {
        it("opens the Categories dropdown on click and keeps it open while hovering the panel", async () => {
            const user = userEvent.setup();
            render(<DesktopNav userId={null} />);
            const trigger = screen.getByRole("button", { name: /categories/i });
            expect(trigger).toHaveAttribute("aria-expanded", "false");

            await user.click(trigger);
            expect(trigger).toHaveAttribute("aria-expanded", "true");
            expect(screen.getByRole("menu")).toBeInTheDocument();
            expect(screen.getByText("Shop by Category")).toBeInTheDocument();

            // Hovering a menu item must not close the panel (Radix keeps it open
            // until an item is selected or an outside click / Escape happens).
            await user.hover(screen.getByRole("menuitem", { name: "Women's Fashion" }));
            expect(screen.getByText("Shop by Category")).toBeInTheDocument();
        });

        it("closes the dropdown when Escape is pressed", async () => {
            const user = userEvent.setup();
            render(<DesktopNav userId={null} />);
            await user.click(screen.getByRole("button", { name: /categories/i }));
            expect(screen.getByText("Shop by Category")).toBeInTheDocument();

            await user.keyboard("{Escape}");
            expect(screen.queryByText("Shop by Category")).not.toBeInTheDocument();
        });

        it("opens and closes the Brands dropdown", async () => {
            const user = userEvent.setup();
            render(<DesktopNav userId={null} />);
            const trigger = screen.getByRole("button", { name: /brands/i });

            await user.click(trigger);
            expect(screen.getByText("Popular Brands")).toBeInTheDocument();

            await user.click(screen.getByRole("menuitem", { name: "Gucci" }));
            expect(screen.queryByText("Popular Brands")).not.toBeInTheDocument();
        });
    });

    it("links the categories drop-down items to real routes", async () => {
        const user = userEvent.setup();
        render(<DesktopNav userId={null} />);
        await user.click(screen.getByRole("button", { name: /categories/i }));
        expect(screen.getByRole("menuitem", { name: "Kids & Baby" })).toHaveAttribute("href", "/categories/kids");
    });
});