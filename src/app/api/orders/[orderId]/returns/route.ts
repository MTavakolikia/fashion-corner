import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { requestReturn } from "@/lib/services/returns";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ orderId: string }> };

const itemSchema = z.object({ itemId: z.string().min(1), quantity: z.number().int().min(1).max(99) });
const bodySchema = z.object({
    items: z.array(itemSchema).min(1),
    reason: z.string().min(5).max(500),
    description: z.string().max(1000).optional(),
});

/** POST /api/orders/[orderId]/returns — request a return for eligible items. */
export async function POST(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { orderId } = await params;
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid return request.", 400, (e as { issues?: unknown }).issues);
        }
        const ret = await requestReturn({
            orderId,
            userId: authed.user.id,
            items: body.items,
            reason: body.reason,
            description: body.description,
        });
        return ok({ returnId: ret.id, status: ret.status, refundAmount: ret.refundAmount });
    } catch (e) {
        return toResponse(e, "[order.returns]");
    }
}
