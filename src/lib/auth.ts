import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { user } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";

export type UserRole = "USER" | "SELLER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type SellerStatus = "NONE" | "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

/** The DB user row. id === Clerk userId (kept stable for legacy FK writes). */
export type DbUser = user;

/** Authenticated user with resolved role + status, safe to use server-side. */
export interface AuthedUser {
    user: DbUser;
    clerkFirstName: string | null;
    clerkLastName: string | null;
    clerkImageUrl: string | null;
}

/**
 * Upsert the DB user row for a Clerk user.
 * Clerk remains the source of truth for identity; this row carries
 * application-level data (role, status, seller status, profile).
 */
export async function ensureUser(
    clerkId: string,
    profile?: { email?: string | null; name?: string | null; picture?: string | null }
): Promise<user> {
    try {
        return await prisma.user.upsert({
            where: { clerkId },
            update: {
                ...(profile?.email ? { email: profile.email } : {}),
                ...(profile?.name ? { name: profile.name } : {}),
                ...(profile?.picture ? { picture: profile.picture } : {}),
            },
            create: {
                id: clerkId,
                clerkId,
                email: profile?.email ?? clerkId,
                name: profile?.name ?? null,
                picture: profile?.picture ?? null,
            },
        });
    } catch (e) {
        // Unique email conflict (account reused by another Clerk user): fall back to existing row.
        const code = (e as { code?: string })?.code;
        if (code === "P2002") {
            const existing = await prisma.user.findUnique({ where: { clerkId } });
            if (existing) return existing;
            throw new ApiError(ERROR_CODES.CONFLICT, "Unable to initialize account. Please contact support.", 409);
        }
        throw e;
    }
}

/**
 * Resolve the authenticated user with role + account status.
 * Throws ApiError (401/403) — never returns null.
 *
 * @param opts.roles restrict to these roles
 * @param opts.requireSellerActive SELLER role additionally needs sellerStatus ACTIVE
 */
export async function getAuthedUser(
    opts: { roles?: UserRole[]; requireSellerActive?: boolean } = {}
): Promise<AuthedUser> {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw ApiError.unauthorized();

    const clerk = await currentUser();
    const profile = {
        email: clerk?.emailAddresses[0]?.emailAddress ?? null,
        name: [clerk?.firstName, clerk?.lastName].filter(Boolean).join(" ") || null,
        picture: clerk?.imageUrl ?? null,
    };

    const dbUser = await ensureUser(clerkId, profile);

    if (dbUser.status === "SUSPENDED" || dbUser.status === "CLOSED") {
        throw new ApiError(ERROR_CODES.ACCOUNT_SUSPENDED, "Your account is suspended. Contact support.", 403);
    }

    if (opts.roles && !opts.roles.includes(dbUser.role)) {
        throw ApiError.forbidden("You do not have permission to perform this action.");
    }

    if (opts.requireSellerActive && dbUser.role === "SELLER" && dbUser.sellerStatus !== "ACTIVE") {
        throw new ApiError(ERROR_CODES.SELLER_NOT_ACTIVE, "Your seller account is not active.", 403);
    }

    return {
        user: dbUser,
        clerkFirstName: clerk?.firstName ?? null,
        clerkLastName: clerk?.lastName ?? null,
        clerkImageUrl: clerk?.imageUrl ?? null,
    };
}

/** Assert the user is an ADMIN (or throw). */
export function requireAdmin(authed: AuthedUser): void {
    if (authed.user.role !== "ADMIN") {
        throw new ApiError(ERROR_CODES.ADMIN_ONLY, "Administrator access required.", 403);
    }
}

/** Assert the user is a SELLER with an active seller status (or throw). */
export function requireActiveSeller(authed: AuthedUser): void {
    if (authed.user.role !== "SELLER" && authed.user.role !== "ADMIN") {
        throw ApiError.forbidden("Seller account required.");
    }
    if (authed.user.role === "SELLER" && authed.user.sellerStatus !== "ACTIVE") {
        throw new ApiError(ERROR_CODES.SELLER_NOT_ACTIVE, "Your seller account is not active.", 403);
    }
}

/** Resource ownership guard: the resource's ownerId must be the user or an admin. */
export function assertOwner(ownerId: string | null | undefined, authed: AuthedUser, resource = "Resource"): void {
    if (authed.user.role === "ADMIN") return;
    if (!ownerId || ownerId !== authed.user.id) {
        throw ApiError.notFound(resource);
    }
}

/**
 * Verify a resource's seller owner. Sellers may only touch their own products;
 * admins may touch everything.
 */
export function assertSellerProductOwner(sellerId: string | null | undefined, authed: AuthedUser): void {
    if (authed.user.role === "ADMIN") return;
    if (!sellerId || sellerId !== authed.user.id) {
        throw new ApiError(ERROR_CODES.SELLER_NOT_OWNER, "This product belongs to another seller.", 403);
    }
}
