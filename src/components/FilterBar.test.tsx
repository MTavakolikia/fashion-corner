import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";

const mockPush = vi.fn();
let mockQuery = "from=test";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => new URLSearchParams(mockQuery),
}));

const categories = [{ category: "womens" }, { category: "mens" }, { category: "kids-baby" }];

describe("FilterBar", () => {
    beforeEach(() => {
        mockQuery = "";
        mockPush.mockClear();
    });

    it("renders a search box and category options", () => {
        render(<FilterBar categories={categories} />);
        expect(screen.getByRole("textbox")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
        expect(screen.getAllByRole("combobox")[0].querySelectorAll("option")).toHaveLength(4);
    });

    it("prefills the search query from URL params", () => {
        mockQuery = "q=denim";
        render(<FilterBar categories={categories} />);
        expect(screen.getByRole("textbox")).toHaveValue("denim");
    });

    it("navigates to /products when a category is selected", async () => {
        const user = userEvent.setup();
        render(<FilterBar categories={categories} />);
        await user.selectOptions(screen.getAllByRole("combobox")[0], "mens");
        expect(mockPush).toHaveBeenCalledWith("/products?category=mens");
    });

    it("emits a sort update", async () => {
        const user = userEvent.setup();
        render(<FilterBar categories={categories} />);
        await user.selectOptions(screen.getAllByRole("combobox")[1], "price_asc");
        expect(mockPush).toHaveBeenCalledWith("/products?sort=price_asc");
    });
});