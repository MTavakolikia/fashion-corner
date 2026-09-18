import { getAuthedUser, assertOwner } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { getOrderTimeline } from "@/lib/services/orders";
import type { order } from "@prisma/client";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ orderId: string }> };

/** GET /api/orders/[orderId] — order + status timeline (owner or admin). */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { orderId } = await params;
        const result = await getOrderTimeline(orderId);
        if (!result) return fail(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
        assertOwner((result.order as order).userId, authed, "Order");
        return ok(result);
    } catch (e) {
        return toResponse(e, "[order.get]");
    }
}
