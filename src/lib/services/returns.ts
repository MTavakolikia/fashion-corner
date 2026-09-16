import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";
import { releaseStock, type PrismaTx } from "@/lib/services/inventory";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { NOTIFICATION_TYPES, notify } from "@/lib/services/notifications";
import { emailTemplates } from "@/lib/services/email";

const RETURNABLE_STATUSES = new Set(["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]);
type Tx = PrismaTx;

/** Customer requests a return for eligible order items. */
export async function requestReturn(params: {
    orderId: string;
    userId: string;
    items: { itemId: string; quantity: number }[];
    reason: string;
    description?: string;
}): Promise<Prisma.return_requestGetPayload<null>> {
    const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: { items: true },
    });
    if (!order) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
    if (order.userId !== params.userId) {
        throw new ApiError(ERROR_CODES.NOT_FOUND, "Order not found.", 404);
    }
    if (!RETURNABLE_STATUSES.has(order.status)) {
        throw new ApiError(ERROR_CODES.INVALID_RETURN, "This order is not eligible for a return.", 409);
    }
    if (order.status === "RETURN_REQUESTED") {
        throw new ApiError(ERROR_CODES.CONFLICT, "A return is already pending for this order.", 409);
    }

    const itemMap = new Map(order.items.map((i) => [i.id, i]));
    let refundAmount = 0;
    for (const req of params.items) {
        const item = itemMap.get(req.itemId);
        if (!item || item.orderId !== order.id) {
            throw new ApiError(ERROR_CODES.VALIDATION_ERROR, "One or more items do not belong to this order.", 400);
        }
        if (req.quantity > item.quantity) {
            throw new ApiError(ERROR_CODES.VALIDATION_ERROR, "Return quantity exceeds purchased quantity.", 400);
        }
        refundAmount += item.price * req.quantity;
    }

    const created = await prisma.$transaction(async (tx: Tx) => {
        const returnReq = await tx.return_request.create({
            data: {
                id: `ret_${crypto.randomUUID()}`,
                orderId: order.id,
                userId: params.userId,
                status: "REQUESTED",
                reason: params.reason,
                description: params.description ?? null,
                refundAmount: Math.round(refundAmount * 100) / 100,
            },
        });
        await tx.order.update({ where: { id: order.id }, data: { status: "RETURN_REQUESTED" } });
        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: order.id,
                status: "RETURN_REQUESTED",
                previousStatus: order.status,
                actorId: params.userId,
                note: params.reason,
            },
        });
        return returnReq;
    });

    void notifyAdminsOfReturn(order.id, refundAmount);
    auditLog(params.userId, AUDIT_ACTIONS.RETURN_REQUESTED, "return_request", created.id, { orderId: order.id });
    return created;
}

/** Admin/seller transition of a return request. */
export async function processReturn(params: {
    returnId: string;
    to: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUND_PENDING" | "REFUNDED";
    actorId: string;
    note?: string;
}): Promise<void> {
    const ret = await prisma.return_request.findUnique({
        where: { id: params.returnId },
        include: { order: { include: { items: true, user: { select: { email: true } } } } },
    });
    if (!ret) throw new ApiError(ERROR_CODES.NOT_FOUND, "Return request not found.", 404);

    const user = ret.order.user;

    await prisma.$transaction(async (tx: Tx) => {
        await tx.return_request.update({
            where: { id: params.returnId },
            data: {
                status: params.to,
                processedAt: new Date(),
                processedBy: params.actorId,
            },
        });

        if (params.to === "REFUNDED") {
            const refund = await tx.refund.create({
                data: {
                    id: `ref_${crypto.randomUUID()}`,
                    orderId: ret.orderId,
                    returnRequestId: ret.id,
                    amount: ret.refundAmount,
                    status: "COMPLETED",
                    method: "ORIGINAL",
                    processedBy: params.actorId,
                    processedAt: new Date(),
                },
            });

            // Restock returned items (once only).
            if (!ret.restocked) {
                const itemsToRestock = ret.order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
                await releaseStock(tx, itemsToRestock, {
                    orderId: ret.orderId,
                    actorId: params.actorId,
                    reason: "RETURN_APPROVED",
                });
                await tx.return_request.update({
                    where: { id: ret.id },
                    data: { restocked: true, refundId: refund.id },
                });
            }

            // Order-level money state: full refund vs partial.
            const fullAmount = Math.round(ret.order.items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
            const refundedSoFar = await tx.refund.aggregate({
                where: { orderId: ret.orderId, status: { in: ["APPROVED", "COMPLETED"] } },
                _sum: { amount: true },
            });
            const isFull = (refundedSoFar._sum.amount ?? 0) >= fullAmount - 0.01;
            await tx.order.update({
                where: { id: ret.orderId },
                data: {
                    status: isFull ? "REFUNDED" : "RETURNED",
                    paymentStatus: isFull ? "REFUNDED" : "PARTIALLY_REFUNDED",
                },
            });
            await tx.order_status_history.create({
                data: {
                    id: `osh_${crypto.randomUUID()}`,
                    orderId: ret.orderId,
                    status: isFull ? "REFUNDED" : "RETURNED",
                    previousStatus: ret.order.status,
                    paymentStatus: isFull ? "REFUNDED" : "PARTIALLY_REFUNDED",
                    actorId: params.actorId,
                    note: `Refund of $${ret.refundAmount.toFixed(2)} processed${params.note ? ` — ${params.note}` : ""}`,
                },
            });

            void notify(ret.userId, NOTIFICATION_TYPES.REFUND_UPDATE, "Refund processed",
                `A refund of $${ret.refundAmount.toFixed(2)} for order #${ret.orderId.slice(-8)} has been completed.`,
                `/account/returns`);
            void emailTemplates.refundConfirmed(ret.orderId, user.email, ret.refundAmount);
            auditLog(params.actorId, AUDIT_ACTIONS.REFUND_COMPLETED, "refund", refund.id, { orderId: ret.orderId, amount: ret.refundAmount });
            return;
        }

        // Non-final transitions
        if (params.to === "REJECTED") {
            // Order goes back to delivered.
            await tx.order.update({ where: { id: ret.orderId }, data: { status: "DELIVERED" } });
        }
        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: ret.orderId,
                status: ret.order.status,
                previousStatus: ret.order.status,
                actorId: params.actorId,
                note: `Return ${params.to.toLowerCase()}${params.note ? ` — ${params.note}` : ""}`,
            },
        });

        void notify(ret.userId, NOTIFICATION_TYPES.RETURN_UPDATE, "Return update",
            `Your return request for order #${ret.orderId.slice(-8)} is now ${params.to.replace("_", " ").toLowerCase()}.`,
            `/account/returns`);
        auditLog(params.actorId, AUDIT_ACTIONS.RETURN_STATUS_CHANGED, "return_request", ret.id, { to: params.to });
    });
}

/** Admin-initiated refund directly on an order (no return request). */
export async function createRefund(params: {
    orderId: string;
    amount: number;
    actorId: string;
    note?: string;
}): Promise<void> {
    const order = await prisma.order.findUnique({ where: { id: params.orderId }, include: { user: { select: { email: true } } } });
    if (!order) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
    if (params.amount <= 0) throw new ApiError(ERROR_CODES.VALIDATION_ERROR, "Refund amount must be positive.", 400);
    if (params.amount > order.total + 0.01) {
        throw new ApiError(ERROR_CODES.VALIDATION_ERROR, "Refund exceeds order total.", 400);
    }

    await prisma.$transaction(async (tx: Tx) => {
        const refund = await tx.refund.create({
            data: {
                id: `ref_${crypto.randomUUID()}`,
                orderId: order.id,
                amount: params.amount,
                status: "COMPLETED",
                method: "ORIGINAL",
                note: params.note ?? null,
                processedBy: params.actorId,
                processedAt: new Date(),
            },
        });
        const sum = await tx.refund.aggregate({
            where: { orderId: order.id, status: { in: ["APPROVED", "COMPLETED"] } },
            _sum: { amount: true },
        });
        const isFull = (sum._sum.amount ?? 0) >= order.total - 0.01;
        await tx.order.update({
            where: { id: order.id },
            data: {
                status: isFull ? "REFUNDED" : order.status,
                paymentStatus: isFull ? "REFUNDED" : "PARTIALLY_REFUNDED",
            },
        });
        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: order.id,
                status: order.status,
                previousStatus: order.status,
                paymentStatus: isFull ? "REFUNDED" : "PARTIALLY_REFUNDED",
                actorId: params.actorId,
                note: `Refund of $${params.amount.toFixed(2)} processed by admin${params.note ? ` — ${params.note}` : ""}`,
            },
        });
        void notify(order.userId, NOTIFICATION_TYPES.REFUND_UPDATE, "Refund processed",
            `A refund of $${params.amount.toFixed(2)} for order #${order.id.slice(-8)} has been processed.`,
            `/account/orders/${order.id}`);
        void emailTemplates.refundConfirmed(order.id, order.user.email, params.amount);
        auditLog(params.actorId, AUDIT_ACTIONS.REFUND_CREATED, "refund", refund.id, { orderId: order.id, amount: params.amount });
    });
}

async function notifyAdminsOfReturn(orderId: string, amount: number): Promise<void> {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
    for (const a of admins) {
        void prisma.notification
            .create({
                data: {
                    id: `ntf_${crypto.randomUUID()}`,
                    userId: a.id,
                    type: "RETURN_UPDATE",
                    title: "New return request",
                    message: `Return request for order #${orderId.slice(-8)} ($${amount.toFixed(2)}) needs review.`,
                    link: "/dashboard/admin/returns",
                },
            })
            .catch(() => {});
    }
}
