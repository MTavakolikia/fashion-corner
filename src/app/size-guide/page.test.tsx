import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SizeGuidePage from "./page";

describe("SizeGuidePage", () => {
    it("renders the hero heading and breadcrumb", () => {
        render(<SizeGuidePage />);
        expect(screen.getByRole("heading", { name: /size guide/i })).toBeInTheDocument();
        expect(screen.getByText(/find your perfect fit/i)).toBeInTheDocument();
    });

    it("renders all three size tables with headings and sample rows", () => {
        render(<SizeGuidePage />);
        const headings = screen.getAllByRole("heading", { level: 2 }).map(h => h.textContent);
        expect(headings).toEqual(
            expect.arrayContaining([
                "Women's sizes (inches)",
                "Men's sizes (inches)",
                "Kids & baby sizes (inches)",
            ])
        );
        // sample data points
        expect(screen.getAllByText("XXL").length).toBeGreaterThan(0);
        expect(screen.getAllByText("34-36").length).toBeGreaterThan(0);
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("50-53")).toBeInTheDocument();
    });

    it("renders measuring tips", () => {
        render(<SizeGuidePage />);
        expect(screen.getByText(/fullest part of your chest/i)).toBeInTheDocument();
        expect(screen.getByText(/natural waistline/i)).toBeInTheDocument();
        expect(screen.getByText(/fullest part of your hips/i)).toBeInTheDocument();
    });

    it("links to contact and returns for extra help", () => {
        render(<SizeGuidePage />);
        expect(screen.getByRole("link", { name: /contact us/i })).toHaveAttribute("href", "/contact");
        expect(screen.getByRole("link", { name: /easy returns/i })).toHaveAttribute("href", "/returns");
    });
});