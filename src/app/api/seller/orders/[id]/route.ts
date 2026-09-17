import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/seller/orders/[id] — seller order detail (only their items shown). */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                shippingAddress: true,
                items: {
                    where: { product: { sellerId: authed.user.id } },
                    include: {
                        product: { select: { id: true, title: true, image: true, mainImage: true, slug: true, sellerId: true } },
                    },
                },
                statusHistory: { orderBy: { createdAt: "asc" }, take: 50 },
            },
        });

        if (!order) throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
        if (authed.user.role === "SELLER" && order.items.length === 0) {
            throw new Error(ERROR_CODES.FORBIDDEN);
        }
        return ok({ order });
    } catch (e) {
        return toResponse(e, "[seller.orders.get]");
    }
}

/** PATCH /api/seller/orders/[id] — update order status (ship, confirm). */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const { id } = await params;
        const body = z
            .object({
                status: z.enum(["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]),
                trackingNumber: z.string().max(100).optional(),
                note: z.string().max(1000).optional(),
            })
            .parse(await req.json());

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { where: { product: { sellerId: authed.user.id } }, select: { productId: true, quantity: true } } },
        });
        if (!order || order.items.length === 0) throw new Error(ERROR_CODES.ORDER_NOT_FOUND);

        const updated = await prisma.$transaction(async (tx) => {
            const o = await tx.order.update({
                where: { id },
                data: { status: body.status, ...(body.trackingNumber ? { trackingNumber: body.trackingNumber } : {}) },
            });
            await tx.order_status_history.create({
                data: {
                    id: `osh_${crypto.randomUUID()}`,
                    orderId: id,
                    status: body.status,
                    previousStatus: order.status,
                    actorId: authed.user.id,
                    note: body.note ?? `Status changed to ${body.status}`,
                },
            });
            return o;
        });

        if (body.status === "SHIPPED" || body.status === "DELIVERED") {
            const user = await prisma.user.findUnique({ where: { id: updated.userId }, select: { email: true } });
            void prisma.notification.create({
                data: {
                    id: `ntf_${crypto.randomUUID()}`,
                    userId: updated.userId,
                    type: body.status === "SHIPPED" ? "ORDER_SHIPPED" : "ORDER_DELIVERED",
                    title: body.status === "SHIPPED" ? "Order shipped" : "Order delivered",
                    message: `Your order #${id.slice(-8)} has been ${body.status.replace("_", " ").toLowerCase()}.`,
                    link: `/account/orders/${id}`,
                },
            }).catch(() => {});
        }

        return ok({ order: updated });
    } catch (e) {
        return toResponse(e, "[seller.orders.update]");
    }
}
