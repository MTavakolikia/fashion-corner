import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { respondToReview } from "@/lib/services/reviews";

export const dynamic = "force-dynamic";

/** POST /api/seller/reviews — seller responds to a review on their product. */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        const body = z.object({ reviewId: z.string().min(1), sellerResponse: z.string().min(1).max(2000) }).parse(await req.json());
        await respondToReview(body.reviewId, authed.user.id, { sellerResponse: body.sellerResponse });
        return ok({ ok: true });
    } catch (e) {
        return toResponse(e, "[seller.reviews]");
    }
}
