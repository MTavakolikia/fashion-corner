import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { createOrder } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ orderId: string }> };

/** POST /api/orders/[orderId]/reorder — place a new order with the same items. */
export async function POST(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { orderId } = await params;
        const source = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true, shippingAddress: true },
        });
        if (!source || (source.userId !== authed.user.id && authed.user.role !== "ADMIN")) {
            return fail(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
        }

        const order = await createOrder({
            userId: authed.user.id,
            userEmail: authed.user.email,
            items: source.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            shippingAddress: {
                fullName: source.shippingAddress.fullName,
                address: source.shippingAddress.address,
                city: source.shippingAddress.city,
                state: source.shippingAddress.state,
                zipCode: source.shippingAddress.zipCode,
                phone: source.shippingAddress.phone,
            },
            clientOrderId: `reorder_${crypto.randomUUID()}`,
        });
        return ok({ orderId: order.id });
    } catch (e) {
        return toResponse(e, "[order.reorder]");
    }
}
