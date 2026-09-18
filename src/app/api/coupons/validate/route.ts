import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { evaluateCoupon } from "@/lib/services/pricing";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
    code: z.string().min(1).max(50),
    subtotal: z.number().nonnegative().optional(),
});

/**
 * POST /api/coupons/validate — server-side coupon validation.
 * Returns the computed discount; the checkout UI must re-send the code on order
 * creation so it is revalidated atomically inside the order transaction.
 */
export async function POST(req: Request) {
    try {
        rateLimit(req, "coupon-validate");
        const authed = await getAuthedUser();
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }

        const coupon = await prisma.coupon.findUnique({ where: { code: body.code.toUpperCase() } });
        const userUsage = await prisma.order.count({
            where: { userId: authed.user.id, couponCode: coupon?.code, status: { not: "CANCELLED" } },
        });
        const result = evaluateCoupon(coupon, {
            currentDate: new Date(),
            userUsage,
            subtotal: body.subtotal ?? 0,
        });
        if (!result.isValid) {
            return fail(ERROR_CODES.INVALID_COUPON, `Coupon is not usable (${result.reason}).`, 400, { reason: result.reason });
        }
        return ok({
            code: coupon!.code,
            type: coupon!.type,
            value: coupon!.value,
            discount: result.discount,
        });
    } catch (e) {
        return toResponse(e, "[coupons.validate]");
    }
}
