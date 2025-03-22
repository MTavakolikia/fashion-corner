import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard", "/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
    matcher: ["/((?!_next|.*\\.(?:png|jpg|jpeg|gif|ico|css|js|svg)).*)"],
};
