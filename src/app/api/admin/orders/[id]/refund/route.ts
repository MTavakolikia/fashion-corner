import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { z } from "zod";
import { createRefund } from "@/lib/services/returns";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const refundSchema = z.object({
    amount: z.number().positive(),
    note: z.string().max(500).optional(),
});

/** POST /api/admin/orders/[id]/refund — issue a refund for an order (admin only). */
export async function POST(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        let body: z.infer<typeof refundSchema>;
        try {
            body = refundSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }
        await createRefund({ orderId: id, amount: body.amount, actorId: authed.user.id, note: body.note });
        return ok({ refunded: true, amount: body.amount });
    } catch (e) {
        return toResponse(e, "[admin.order.refund]");
    }
}
