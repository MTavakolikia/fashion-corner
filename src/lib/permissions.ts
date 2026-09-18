import type { UserRole } from "@/lib/auth";

/**
 * Central role/permission matrix (spec: role/permission matrix).
 * Server-side checks are the source of truth; UI only mirrors these.
 */
export const PERMISSIONS = {
    // storefront
    "browse.products": { desc: "Browse products" },
    "cart.manage": { desc: "Use cart" },
    "checkout.place": { desc: "Place orders" },
    "wishlist.manage": { desc: "Manage wishlist" },
    "reviews.create": { desc: "Create reviews" },
    // self-service
    "user.profile": { desc: "Manage own profile" },
    "user.orders": { desc: "View own orders" },
    "user.returns": { desc: "Request returns" },
    "user.support": { desc: "Open support tickets" },
    // sellers (own scope only)
    "seller.products": { desc: "Manage own products" },
    "seller.orders": { desc: "Manage own fulfillment" },
    "seller.analytics": { desc: "View own analytics" },
    "seller.earnings": { desc: "View own earnings" },
    "seller.reviews.respond": { desc: "Respond to reviews on own products" },
    // admins
    "admin.users": { desc: "Manage users" },
    "admin.sellers": { desc: "Manage sellers" },
    "admin.products": { desc: "Manage all products" },
    "admin.orders": { desc: "Manage all orders" },
    "admin.catalog": { desc: "Manage categories & brands" },
    "admin.coupons": { desc: "Manage coupons" },
    "admin.returns": { desc: "Process returns & refunds" },
    "admin.reviews": { desc: "Moderate reviews" },
    "admin.support": { desc: "Manage support tickets" },
    "admin.analytics": { desc: "View platform analytics" },
    "admin.audit": { desc: "View audit logs" },
    "admin.settings": { desc: "Manage platform settings" },
} as const;

export type Permission = keyof typeof PERMISSIONS;

const MATRIX: Record<Permission, Set<UserRole>> = {
    "browse.products": new Set(["USER", "SELLER", "ADMIN"]),
    "cart.manage": new Set(["USER", "SELLER", "ADMIN"]),
    "checkout.place": new Set(["USER", "SELLER", "ADMIN"]),
    "wishlist.manage": new Set(["USER", "SELLER", "ADMIN"]),
    "reviews.create": new Set(["USER", "SELLER", "ADMIN"]),
    "user.profile": new Set(["USER", "SELLER", "ADMIN"]),
    "user.orders": new Set(["USER", "SELLER", "ADMIN"]),
    "user.returns": new Set(["USER", "SELLER", "ADMIN"]),
    "user.support": new Set(["USER", "SELLER", "ADMIN"]),
    "seller.products": new Set(["SELLER", "ADMIN"]),
    "seller.orders": new Set(["SELLER", "ADMIN"]),
    "seller.analytics": new Set(["SELLER", "ADMIN"]),
    "seller.earnings": new Set(["SELLER", "ADMIN"]),
    "seller.reviews.respond": new Set(["SELLER", "ADMIN"]),
    "admin.users": new Set(["ADMIN"]),
    "admin.sellers": new Set(["ADMIN"]),
    "admin.products": new Set(["ADMIN"]),
    "admin.orders": new Set(["ADMIN"]),
    "admin.catalog": new Set(["ADMIN"]),
    "admin.coupons": new Set(["ADMIN"]),
    "admin.returns": new Set(["ADMIN"]),
    "admin.reviews": new Set(["ADMIN"]),
    "admin.support": new Set(["ADMIN"]),
    "admin.analytics": new Set(["ADMIN"]),
    "admin.audit": new Set(["ADMIN"]),
    "admin.settings": new Set(["ADMIN"]),
};

export function can(role: UserRole | null, permission: Permission): boolean {
    if (!role) return false;
    return MATRIX[permission]?.has(role) ?? false;
}
