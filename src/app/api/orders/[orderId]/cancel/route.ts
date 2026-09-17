import { getAuthedUser } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { cancelOrder } from "@/lib/services/orders";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ orderId: string }> };

const bodySchema = z.object({ note: z.string().max(500).optional() });

/** POST /api/orders/[orderId]/cancel — cancel an eligible order (owner or admin). */
export async function POST(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { orderId } = await params;
        let note: string | undefined;
        try {
            note = bodySchema.parse(await req.json()).note;
        } catch {
            note = undefined;
        }
        const order = await cancelOrder({
            orderId,
            userId: authed.user.id,
            actorRole: authed.user.role === "ADMIN" ? "ADMIN" : "USER",
            note,
        });
        return ok({ orderId: order.id, status: order.status });
    } catch (e) {
        return toResponse(e, "[order.cancel]");
    }
}
