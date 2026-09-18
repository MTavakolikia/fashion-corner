import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountNav } from "./AccountNav";

vi.mock("next/navigation", () => ({
    usePathname: () => mockPathname,
}));

let mockPathname = "/account";

describe("AccountNav", () => {
    beforeEach(() => {
        mockPathname = "/account";
    });

    it("renders every account tab", () => {
        render(<AccountNav unreadNotifications={0} />);
        for (const label of ["Overview", "Orders", "Wishlist", "Addresses", "Reviews", "Returns", "Notifications", "Support", "Settings"]) {
            expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", expect.stringContaining("/account"));
        }
    });

    it("marks the active tab based on the current pathname", () => {
        mockPathname = "/account/orders";
        render(<AccountNav unreadNotifications={0} />);
        expect(screen.getByRole("link", { name: "Orders" })).toHaveClass("text-primary");
        expect(screen.getByRole("link", { name: "Overview" })).not.toHaveClass("text-primary");
    });

    it("treats the overview tab as active on the account root", () => {
        mockPathname = "/account";
        render(<AccountNav unreadNotifications={0} />);
        expect(screen.getByRole("link", { name: "Overview" })).toHaveClass("text-primary");
    });

    it("shows the unread notification badge only when there are unread notifications", () => {
        const { rerender } = render(<AccountNav unreadNotifications={3} />);
        expect(screen.getByText("3")).toBeInTheDocument();
        rerender(<AccountNav unreadNotifications={0} />);
        expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
});