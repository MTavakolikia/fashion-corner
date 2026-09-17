import { getAuthedUser } from "@/lib/auth";
import { notFound } from "next/navigation";

export type DashboardRole = "customer" | "seller" | "admin";

export async function getDashboardRole(): Promise<DashboardRole> {
    const authed = await getAuthedUser();
    if (authed.user.role === "ADMIN") return "admin";
    if (authed.user.role === "SELLER" && authed.user.sellerStatus === "ACTIVE") return "seller";
    return "customer";
}

export const DASHBOARD_ROUTES: Record<string, { href: string; label: string; badge?: string }> = {
    overview: { href: "/", label: "Overview" },
    orders: { href: "/account/orders", label: "Orders" },
    wishlist: { href: "/account/wishlist", label: "Wishlist" },
    addresses: { href: "/account/addresses", label: "Addresses" },
    reviews: { href: "/account/reviews", label: "Reviews" },
    returns: { href: "/account/returns", label: "Returns" },
    notifications: { href: "/account/notifications", label: "Notifications" },
    support: { href: "/account/support", label: "Support" },
    settings: { href: "/account/settings", label: "Settings" },
    products: { href: "/dashboard/seller/products", label: "Products" },
    sellerOrders: { href: "/dashboard/seller/orders", label: "Orders" },
    customers: { href: "/dashboard/seller/customers", label: "Customers" },
    sellerReviews: { href: "/dashboard/seller/reviews", label: "Reviews" },
    analytics: { href: "/dashboard/seller/analytics", label: "Analytics" },
    earnings: { href: "/dashboard/seller/earnings", label: "Earnings" },
    sellerNotifications: { href: "/dashboard/seller/notifications", label: "Notifications" },
    sellerSettings: { href: "/dashboard/seller/settings", label: "Settings" },
    users: { href: "/dashboard/admin/users", label: "Users" },
    sellers: { href: "/dashboard/admin/sellers", label: "Sellers" },
    adminProducts: { href: "/dashboard/admin/products", label: "Products" },
    adminOrders: { href: "/dashboard/admin/orders", label: "Orders" },
    categories: { href: "/dashboard/admin/categories", label: "Categories" },
    brands: { href: "/dashboard/admin/brands", label: "Brands" },
    coupons: { href: "/dashboard/admin/coupons", label: "Coupons" },
    returnsAdmin: { href: "/dashboard/admin/returns", label: "Returns" },
    refunds: { href: "/dashboard/admin/refunds", label: "Refunds" },
    reviewsAdmin: { href: "/dashboard/admin/reviews", label: "Reviews" },
    supportAdmin: { href: "/dashboard/admin/support", label: "Support" },
    analyticsAdmin: { href: "/dashboard/admin/analytics", label: "Analytics" },
    reports: { href: "/dashboard/admin/reports", label: "Reports" },
    auditLogs: { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
    settingsAdmin: { href: "/dashboard/admin/settings", label: "Settings" },
};
