import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { rateLimit } from "@/lib/rate-limit";

export const createReviewSchema = z.object({
    productId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(""),
});

export const respondReviewSchema = z.object({
    sellerResponse: z.string().min(1).max(2000),
});

/**
 * Create a review. One review per (user, product).
 * "verified" is derived from the user's purchase history — never trusted from the client.
 */
export async function createReview(req: Request, userId: string, input: z.infer<typeof createReviewSchema>) {
    rateLimit(req, "review-create");

    const product = await prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true, title: true, sellerId: true, status: true },
    });
    if (!product) throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);

    const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId: input.productId } } });
    if (existing) throw new ApiError(ERROR_CODES.ALREADY_REVIEWED, "You have already reviewed this product.", 409);

    // Verified purchase: any non-cancelled order item for this product.
    const purchase = await prisma.orderitem.findFirst({
        where: { productId: input.productId, order: { userId, status: { not: "CANCELLED" } } },
        select: { id: true },
    });

    const review = await prisma.$transaction(async (tx) => {
        const created = await tx.review.create({
            data: {
                id: `rev_${crypto.randomUUID()}`,
                userId,
                productId: input.productId,
                rating: input.rating,
                comment: input.comment || null,
                verified: !!purchase,
                updatedAt: new Date(),
            },
        });
        // Refresh aggregates (visible reviews only, computed in one query).
        const agg = await tx.review.aggregate({
            where: { productId: input.productId, isHidden: false },
            _avg: { rating: true },
            _count: true,
        });
        await tx.product.update({
            where: { id: input.productId },
            data: {
                rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
                ratingCount: agg._count,
            },
        });
        return created;
    });

    // Seller gets notified of a new review on their product.
    if (product.sellerId) {
        void prisma.notification.create({
            data: {
                id: `ntf_${crypto.randomUUID()}`,
                userId: product.sellerId,
                type: "SYSTEM",
                title: "New product review",
                message: `“${product.title}” received a ${review.rating}-star review.`,
                link: "/dashboard/seller/reviews",
            },
        }).catch(() => {});
    }
    return review;
}

/** Seller (or admin) responds to a review on their product. */
export async function respondToReview(reviewId: string, actorId: string, input: z.infer<typeof respondReviewSchema>) {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { product: { select: { sellerId: true } } },
    });
    if (!review) throw new ApiError(ERROR_CODES.REVIEW_NOT_FOUND, "Review not found.", 404);

    const isOwner = review.product.sellerId && review.product.sellerId === actorId;
    const admin = await prisma.user.findUnique({ where: { id: actorId }, select: { role: true } });
    if (!isOwner && admin?.role !== "ADMIN") {
        throw new ApiError(ERROR_CODES.FORBIDDEN, "Only the product's seller can respond to this review.", 403);
    }

    const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { sellerResponse: input.sellerResponse, respondedAt: new Date() },
    });
    auditLog(actorId, AUDIT_ACTIONS.REVIEW_RESPONDED, "review", reviewId);
    return updated;
}

/** Admin hides/restores a review. */
export async function moderateReview(reviewId: string, actorId: string, hidden: boolean) {
    const review = await prisma.review.findUniqueOrThrow({ where: { id: reviewId } });
    const updated = await prisma.$transaction(async (tx) => {
        const r = await tx.review.update({ where: { id: reviewId }, data: { isHidden: hidden } });
        const agg = await tx.review.aggregate({
            where: { productId: review.productId, isHidden: false },
            _avg: { rating: true },
            _count: true,
        });
        await tx.product.update({
            where: { id: review.productId },
            data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count },
        });
        return r;
    });
    auditLog(actorId, hidden ? AUDIT_ACTIONS.REVIEW_HIDDEN : AUDIT_ACTIONS.REVIEW_RESTORED, "review", reviewId);
    return updated;
}

/** Delete a review (author or admin). */
export async function deleteReview(reviewId: string, actorId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new ApiError(ERROR_CODES.REVIEW_NOT_FOUND, "Review not found.", 404);
    const admin = await prisma.user.findUnique({ where: { id: actorId }, select: { role: true } });
    if (review.userId !== actorId && admin?.role !== "ADMIN") {
        throw new ApiError(ERROR_CODES.FORBIDDEN, "You can only delete your own reviews.", 403);
    }
    await prisma.$transaction(async (tx) => {
        await tx.review.delete({ where: { id: reviewId } });
        const agg = await tx.review.aggregate({
            where: { productId: review.productId, isHidden: false },
            _avg: { rating: true },
            _count: true,
        });
        await tx.product.update({
            where: { id: review.productId },
            data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count },
        });
    });
    auditLog(actorId, AUDIT_ACTIONS.REVIEW_DELETED, "review", reviewId);
}

/** Toggle a "helpful" vote (unique per user per review). */
export async function voteReview(reviewId: string, userId: string, vote: boolean) {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { helpful: true } });
    if (!review) throw new ApiError(ERROR_CODES.REVIEW_NOT_FOUND, "Review not found.", 404);

    const existing = await prisma.review_vote.findUnique({ where: { reviewId_userId: { reviewId, userId } } });
    if (vote && !existing) {
        await prisma.review_vote.create({
            data: { id: `rvote_${crypto.randomUUID()}`, reviewId, userId },
        });
        await prisma.review.update({ where: { id: reviewId }, data: { helpful: { increment: 1 } } });
        return review.helpful + 1;
    }
    if (!vote && existing) {
        await prisma.review_vote.delete({ where: { reviewId_userId: { reviewId, userId } } });
        await prisma.review.update({ where: { id: reviewId }, data: { helpful: { decrement: 1 } } });
        return Math.max(review.helpful - 1, 0);
    }
    return review.helpful;
}

export const reviewListQuerySchema = z.object({
    productId: z.string(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    includeHidden: z.coerce.boolean().optional(), // admin only
});

export async function listReviews(params: {
    productId: string;
    page: number;
    limit: number;
    includeHidden?: boolean;
}) {
    const where: Prisma.reviewWhereInput = {
        productId: params.productId,
        ...(params.includeHidden ? {} : { isHidden: false }),
    };
    const [reviews, total, aggregate] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (params.page - 1) * params.limit,
            take: params.limit,
            include: { user: { select: { name: true, picture: true } } },
        }),
        prisma.review.count({ where }),
        prisma.review.aggregate({
            where: { productId: params.productId, isHidden: false },
            _avg: { rating: true },
            _count: true,
        }),
    ]);
    return {
        reviews,
        total,
        page: params.page,
        limit: params.limit,
        avgRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
        count: aggregate._count,
    };
}
