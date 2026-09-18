import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateReview, listReviews } from "@/lib/services/reviews";
import { ok, fail, toResponse } from "@/lib/http";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** GET /api/admin/reviews — moderated review list. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const productId = url.searchParams.get("productId") ?? undefined;
        const limit = 20;
        const where: any = { ...(productId ? { productId } : {}) };
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { user: { select: { name: true, email: true } }, product: { select: { id: true, title: true } } } }),
            prisma.review.count({ where }),
        ]);
        return ok({ reviews, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.reviews]");
    }
}

/** PATCH /api/admin/reviews — hide/unhide or delete review. */
export async function PATCH(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const body = z.object({ reviewId: z.string().min(1), hidden: z.boolean().optional(), delete: z.boolean().optional() }).parse(await req.json());
        if (body.delete) {
            const { deleteReview } = await import("@/lib/services/reviews");
            await deleteReview(body.reviewId, authed.user.id);
        } else {
            await moderateReview(body.reviewId, authed.user.id, body.hidden ?? false);
        }
        return ok({ ok: true });
    } catch (e) {
        return toResponse(e, "[admin.reviews.patch]");
    }
}
