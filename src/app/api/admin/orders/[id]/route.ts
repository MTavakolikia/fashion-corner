import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ok, fail, toResponse } from "@/lib/http";
import { z } from "zod";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/orders/[id] — full order detail for admin. */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true, sellerId: true } } } },
                shippingAddress: true,
                user: { select: { id: true, name: true, email: true, phone: true } },
                statusHistory: { orderBy: { createdAt: "asc" } },
                refunds: true,
            },
        });
        if (!order) return fail(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
        return ok({ order });
    } catch (e) {
        return toResponse(e, "[admin.orders.get]");
    }
}

/** PATCH /api/admin/orders/[id] — update order status. */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const body = z.object({
            status: z.enum(["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
            trackingNumber: z.string().max(100).optional(),
            note: z.string().max(1000).optional(),
        }).parse(await req.json());

        const updated = await prisma.$transaction(async (tx) => {
            const o = await tx.order.update({ where: { id }, data: { status: body.status, ...(body.trackingNumber ? { trackingNumber: body.trackingNumber } : {}) } });
            await tx.order_status_history.create({ data: { id: `osh_${crypto.randomUUID()}`, orderId: id, status: body.status, actorId: authed.user.id, note: body.note ?? `Status changed to ${body.status}` } });
            return o;
        });

        auditLog(authed.user.id, AUDIT_ACTIONS.ORDER_STATUS_CHANGED, "order", id, { to: body.status });
        return ok({ order: updated });
    } catch (e) {
        return toResponse(e, "[admin.orders.patch]");
    }
}
