import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CareersPage from "./page";

describe("CareersPage", () => {
    it("renders the hero heading", () => {
        render(<CareersPage />);
        expect(screen.getByRole("heading", { name: /careers/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /open roles/i })).toBeInTheDocument();
    });

    it("lists every open role with its type and tags", () => {
        render(<CareersPage />);
        expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
        expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
        expect(screen.getByText("UI/UX Designer")).toBeInTheDocument();
        expect(screen.getByText("E-commerce Growth Marketer")).toBeInTheDocument();
        expect(screen.getAllByText("Full-time · Remote").length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Next\.js/).length).toBeGreaterThan(0);
        expect(screen.getByText("Prisma")).toBeInTheDocument();
    });

    it("provides apply buttons and a get-in-touch CTA", () => {
        render(<CareersPage />);
        expect(screen.getAllByRole("button", { name: "Apply now" }).length).toBeGreaterThan(0);
        expect(screen.getByRole("link", { name: /get in touch/i })).toHaveAttribute("href", "/contact");
        expect(screen.getByRole("link", { name: /learn about us/i })).toHaveAttribute("href", "/about");
    });

    it("never misses a role blog section", () => {
        render(<CareersPage />);
        expect(screen.getByText(/don't see your role/i)).toBeInTheDocument();
    });
});