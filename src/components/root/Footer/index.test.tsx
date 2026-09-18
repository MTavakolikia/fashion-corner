import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Footer } from "./index";

describe("Footer", () => {
    it("uses the original dark footer design (bg-gray-950 text-white)", () => {
        render(<Footer />);
        const footer = document.querySelector("footer");
        expect(footer).not.toBeNull();
        const cls = footer!.className;
        expect(cls).toContain("bg-gray-950");
        expect(cls).toContain("text-white");
        expect(cls).not.toContain("bg-card");
        expect(cls).not.toContain("text-foreground");

        // nav links use white-based text on the dark footer
        const shopLink = screen.getByRole("link", { name: "New Arrivals" });
        const linkCls = shopLink.className;
        expect(linkCls).toContain("text-white/60");
        expect(linkCls).toContain("hover:text-white");
        expect(linkCls).not.toContain("text-muted-foreground");
    });

    it("renders every Shop link to a real route", () => {
        render(<Footer />);
        const shopLinks: Array<[string, string]> = [
            ["Women's Fashion", "/categories/womens"],
            ["Men's Fashion", "/categories/mens"],
            ["Kids & Baby", "/categories/kids"],
            ["Accessories", "/categories/accessories"],
            ["New Arrivals", "/new-arrivals"],
            ["Sale", "/sale"],
        ];
        for (const [label, href] of shopLinks) {
            expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
        }
    });

    it("links all Help items to working pages", () => {
        render(<Footer />);
        const helpLinks: Array<[string, string]> = [
            ["FAQ", "/faq"],
            ["Shipping Info", "/shipping"],
            ["Returns & Exchanges", "/returns"],
            ["Size Guide", "/size-guide"],
            ["Track Your Order", "/account/orders"],
            ["Contact Us", "/contact"],
        ];
        for (const [label, href] of helpLinks) {
            expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
        }
    });

    it("links Company items to working pages", () => {
        render(<Footer />);
        const companyLinks: Array<[string, string]> = [
            ["About Us", "/about"],
            ["Privacy Policy", "/privacy"],
            ["Terms of Service", "/terms"],
            ["Careers", "/careers"],
        ];
        for (const [label, href] of companyLinks) {
            expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
        }
    });

    it("renders the social links", () => {
        render(<Footer />);
        const socials = [
            { label: "GitHub",          href: "https://github.com/MTavakolikia" },
            { label: "LinkedIn",        href: "https://linkedin.com/in/mohammad-tavakolikia" },
            { label: "Twitter",         href: "https://twitter.com/webdev_mohammad" },
            { label: "Instagram",       href: "https://instagram.com/mtavakolikia" },
        ];
        for (const { label, href } of socials) {
            expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
        }
    });

    it("shows a thank-you message after subscribing", async () => {
        const user = userEvent.setup();
        render(<Footer />);
        await user.type(screen.getByPlaceholderText("Enter your email"), "test@example.com");
        await user.click(screen.getByRole("button", { name: "Subscribe" }));
        expect(await screen.findByText(/Thanks for subscribing/i)).toBeInTheDocument();
    });
});