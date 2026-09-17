import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import {
    respondToReview,
    moderateReview,
    deleteReview,
    voteReview,
    respondReviewSchema,
} from "@/lib/services/reviews";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/reviews/[id] — seller responds, or admin moderates ({ action: respond|hide|unhide|delete }). */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { id } = await params;
        const raw = await req.json().catch(() => ({}));
        const action = raw.action;

        if (action === "respond") {
            const body = respondReviewSchema.parse(raw);
            const updated = await respondToReview(id, authed.user.id, body);
            return ok({ reviewId: updated.id, sellerResponse: updated.sellerResponse });
        }
        if (action === "hide" || action === "unhide" || action === "delete") {
            requireAdmin(authed);
            if (action === "delete") {
                await deleteReview(id, authed.user.id);
                return ok({ deleted: true });
            }
            const updated = await moderateReview(id, authed.user.id, action === "hide");
            return ok({ reviewId: updated.id, isHidden: updated.isHidden });
        }
        return fail(ERROR_CODES.VALIDATION_ERROR, "Unsupported action.", 400);
    } catch (e) {
        if (e instanceof z.ZodError) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, e.issues);
        }
        return toResponse(e, "[reviews.patch]");
    }
}

/** DELETE /api/reviews/[id] — author deletes own review, or admin deletes. */
export async function DELETE(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { id } = await params;
        await deleteReview(id, authed.user.id);
        return ok({ deleted: true });
    } catch (e) {
        return toResponse(e, "[reviews.delete]");
    }
}

/** POST /api/reviews/[id]/vote — toggle helpful vote (authed). Body: { vote: boolean } */
export async function POST(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { id } = await params;
        const raw = await req.json().catch(() => ({}));
        const vote = typeof raw.vote === "boolean" ? raw.vote : true;
        const helpful = await voteReview(id, authed.user.id, vote);
        return ok({ helpful });
    } catch (e) {
        return toResponse(e, "[reviews.vote]");
    }
}
