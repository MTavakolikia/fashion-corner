import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
    "/",
    "/products(.*)",
    "/categories/(.*)",
    "/brands/(.*)",
    "/new-arrivals",
    "/sale",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
    "/shipping",
    "/returns",
    "/sitemap.xml",
    "/robots.txt",
    "/api/products(.*)",
    "/api/reviews(.*)",
    "/api/wishlist(.*)",
    "/api/categories(.*)",
    "/api/brands(.*)",
    "/api/import-products",
    "/api/catalog(.*)",
    "/_next(.*)",
    "/favicon.ico",
    "/images(.*)",
    "/static(.*)",
]);

const isProtectedCustomer = createRouteMatcher(["/account(.*)", "/checkout(.*)"]);
const isProtectedSeller = createRouteMatcher(["/dashboard/seller(.*)"]);
const isProtectedAdmin = createRouteMatcher(["/dashboard/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const url = new URL(req.url);

    // Redirect authenticated users away from auth pages
    if (userId && (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up"))) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Public routes bypass protection
    if (isPublic(req)) return;

    // Customer routes require auth
    if (isProtectedCustomer(req)) {
        if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
        return;
    }

    // Seller routes require auth + seller role
    if (isProtectedSeller(req)) {
        if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
        // Role check happens in API routes; dashboard pages use server components
        return;
    }

    // Admin routes require auth + admin role
    if (isProtectedAdmin(req)) {
        if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
        return;
    }

    // All other routes under /dashboard and /account require auth
    if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
