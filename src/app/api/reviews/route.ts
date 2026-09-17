import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import {
    createReview,
    listReviews,
    createReviewSchema,
    reviewListQuerySchema,
} from "@/lib/services/reviews";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** GET /api/reviews?productId=... — public reviews for a product (paginated + rating stats). */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const parsed = reviewListQuerySchema.safeParse({
            productId: url.searchParams.get("productId"),
            page: url.searchParams.get("page"),
            limit: url.searchParams.get("limit"),
        });
        if (!parsed.success) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "productId is required.", 400, parsed.error.issues);
        }
        const result = await listReviews({
            productId: parsed.data.productId,
            page: parsed.data.page,
            limit: parsed.data.limit,
        });
        return ok(result);
    } catch (e) {
        return toResponse(e, "[reviews.list]");
    }
}

/** POST /api/reviews — create a review (authed; verified-purchase derived server-side). */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser();
        let body: z.infer<typeof createReviewSchema>;
        try {
            body = createReviewSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid review payload.", 400, (e as { issues?: unknown }).issues);
        }
        const review = await createReview(req, authed.user.id, body);
        return ok({ reviewId: review.id, verified: review.verified });
    } catch (e) {
        return toResponse(e, "[reviews.create]");
    }
}
