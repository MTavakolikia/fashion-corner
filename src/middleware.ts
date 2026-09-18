import { clerkMiddleware, ClerkMiddlewareAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
    const { userId } = await auth();
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Redirect authenticated users away from auth pages
    if (userId && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // All other auth checks are handled resource-based via getAuthedUser() in
    // each page, layout, API route, or Server Function that accesses protected data.
    // Middleware-based path matching via createRouteMatcher is deprecated.
    return;
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
