import { prisma } from "@/lib/prisma";
import type { order, orderitem, product, coupon } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";
import { evaluateCoupon, computeTotals, type PriceItem } from "@/lib/services/pricing";
import { reserveStock, releaseStock, type PrismaTx } from "@/lib/services/inventory";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { NOTIFICATION_TYPES, notify } from "@/lib/services/notifications";
import { emailTemplates } from "@/lib/services/email";

type Tx = PrismaTx;

export interface CreateOrderInput {
    userId: string;
    userEmail: string;
    items: { productId: string; quantity: number }[];
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
    };
    notes?: string;
    couponCode?: string;
    /** Client-generated idempotency token. Prevents duplicate orders on retries. */
    clientOrderId?: string;
}

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function qtyFor(items: { productId: string; quantity: number }[], productId: string): number {
    return items.reduce((sum, i) => (i.productId === productId ? sum + i.quantity : sum), 0);
}

/**
 * Create an order with server-side pricing, coupon validation, atomic stock
 * reservation, idempotency, status history, notifications, email and audit.
 * All money values come from the database — never the client.
 */
export async function createOrder(input: CreateOrderInput): Promise<order> {
    // Idempotency: a replayed request returns the original order.
    if (input.clientOrderId) {
        const existing = await prisma.order.findUnique({ where: { clientOrderId: input.clientOrderId } });
        if (existing) return existing;
    }

    // Revalidate everything server-side.
    const products = await prisma.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) }, status: "PUBLISHED" },
        select: { id: true, title: true, price: true, stock: true, sellerId: true, lowStockThreshold: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of input.items) {
        const p = productMap.get(item.productId);
        if (!p) {
            throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND, "One or more products are no longer available.", 409);
        }
        if (item.quantity > 99) {
            throw new ApiError(ERROR_CODES.VALIDATION_ERROR, "Quantity per item is limited to 99.", 400);
        }
    }

    // Coupon (optional, validated against current subtotal only).
    let discount = 0;
    let couponUsed: coupon | null = null;
    if (input.couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
        const userUsage = await prisma.order.count({
            where: { userId: input.userId, couponCode: coupon?.code, status: { not: "CANCELLED" } },
        });
        const subtotal = products.reduce(
            (sum, p) => sum + p.price * qtyFor(input.items, p.id),
            0
        );
        const result = evaluateCoupon(coupon, { currentDate: new Date(), userUsage, subtotal });
        if (!result.isValid) {
            const messages: Record<string, string> = {
                EXPIRED: "Coupon has expired.",
                INACTIVE: "Coupon is not active.",
                USAGE_LIMIT_REACHED: "Coupon usage limit reached.",
                PER_USER_LIMIT_REACHED: "You have used this coupon the maximum number of times.",
                MIN_ORDER_NOT_MET: `Coupon requires a minimum order of $${coupon?.minOrderAmount?.toFixed(2)}.`,
                NOT_FOUND: "Invalid coupon code.",
            };
            throw new ApiError(
                ERROR_CODES.INVALID_COUPON,
                messages[result.reason ?? "NOT_FOUND"] ?? "Coupon cannot be used.",
                400
            );
        }
        discount = result.discount;
        couponUsed = coupon!;
    }

    const priceItems: PriceItem[] = products.map((p) => ({ price: p.price, quantity: qtyFor(input.items, p.id) }));
    const totals = computeTotals({ items: priceItems, discount });

    const order = await prisma.$transaction(async (tx: Tx) => {
        await reserveStock(
            tx,
            input.items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                title: productMap.get(i.productId)!.title,
            })),
            { actorId: input.userId, reason: "ORDER" }
        );

        const address = await tx.address.create({
            data: {
                id: `addr_${crypto.randomUUID()}`,
                userId: input.userId,
                ...input.shippingAddress,
                isDefault: false,
                updatedAt: new Date(),
            },
        });

        const created = await tx.order.create({
            data: {
                id: `order_${crypto.randomUUID()}`,
                clientOrderId: input.clientOrderId ?? null,
                userId: input.userId,
                status: "PENDING",
                paymentStatus: "PENDING",
                total: totals.total,
                subtotal: totals.subtotal,
                shippingCost: totals.shipping,
                tax: totals.tax,
                discount: totals.discount,
                couponCode: couponUsed?.code ?? null,
                notes: input.notes ?? null,
                addressId: address.id,
                estimatedDeliveryAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
                updatedAt: new Date(),
            },
        });

        await tx.orderitem.createMany({
            data: input.items.map((i) => ({
                id: `item_${crypto.randomUUID()}`,
                orderId: created.id,
                productId: i.productId,
                quantity: i.quantity,
                price: productMap.get(i.productId)!.price,
                updatedAt: new Date(),
            })),
        });

        if (couponUsed) {
            await tx.coupon.update({
                where: { code: couponUsed.code },
                data: { timesUsed: { increment: 1 } },
            });
        }

        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: created.id,
                status: "PENDING",
                paymentStatus: "PENDING",
                actorId: input.userId,
                note: "Order created",
            },
        });

        // Low-stock alerts to affected sellers.
        const lowStockProducts = products.filter(
            (p) => p.sellerId && p.stock - qtyFor(input.items, p.id) <= (p.lowStockThreshold ?? 5)
        );
        for (const p of lowStockProducts) {
            await tx.notification.create({
                data: {
                    id: `ntf_${crypto.randomUUID()}`,
                    userId: p.sellerId!,
                    type: "LOW_STOCK",
                    title: "Low stock alert",
                    message: `“${p.title}” is at or below its low-stock threshold.`,
                    link: "/dashboard/seller/products",
                },
            });
        }

        return created;
    });

    // Post-transaction side effects (best effort, never block the order).
    void notify(
        input.userId,
        NOTIFICATION_TYPES.ORDER_CONFIRMED,
        "Order confirmed",
        `Your order #${order.id.slice(-8)} (${input.items.length} item${input.items.length === 1 ? "" : "s"}, $${totals.total.toFixed(2)}) is being processed.`,
        `/account/orders/${order.id}`
    );
    void emailTemplates.orderConfirmation(order.id, input.userEmail, totals.total, input.items.length);
    auditLog(input.userId, AUDIT_ACTIONS.ORDER_CREATED, "order", order.id, {
        total: totals.total,
        items: input.items.length,
    });
    void notifyAdminsOfNewOrder(order.id, totals.total);

    return order;
}

async function notifyAdminsOfNewOrder(orderId: string, total: number): Promise<void> {
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true },
    });
    for (const a of admins) {
        void prisma.notification
            .create({
                data: {
                    id: `ntf_${crypto.randomUUID()}`,
                    userId: a.id,
                    type: "ORDER_CONFIRMED",
                    title: "New order received",
                    message: `New order #${orderId.slice(-8)} for $${total.toFixed(2)} is awaiting processing.`,
                    link: "/dashboard/admin/orders",
                },
            })
            .catch(() => {});
    }
}

/** Cancel an order before fulfillment leaves processing. Restocks atomically. */
export async function cancelOrder(params: {
    orderId: string;
    userId: string;
    actorRole: "USER" | "ADMIN";
    note?: string;
}): Promise<order> {
    const result = await prisma.$transaction(async (tx: Tx) => {
        const order = await tx.order.findUnique({ where: { id: params.orderId }, include: { items: true } });
        if (!order) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
        if (params.actorRole === "USER" && order.userId !== params.userId) {
            throw new ApiError(ERROR_CODES.NOT_FOUND, "Order not found.", 404); // do not leak existence
        }
        if (!CANCELLABLE_STATUSES.has(order.status)) {
            throw new ApiError(
                ERROR_CODES.ORDER_NOT_CANCELLABLE,
                "This order can no longer be cancelled.",
                409
            );
        }

        await releaseStock(
            tx,
            order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            { orderId: order.id, actorId: params.userId, reason: "ORDER_CANCELLED" }
        );

        const updated = await tx.order.update({
            where: { id: order.id },
            data: {
                status: "CANCELLED",
                paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
            },
        });
        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: order.id,
                status: "CANCELLED",
                previousStatus: order.status,
                actorId: params.userId,
                note: params.note ?? "Order cancelled",
            },
        });
        return updated;
    });

    const user = await prisma.user.findUnique({ where: { id: result.userId }, select: { email: true } });
    void notify(
        result.userId,
        NOTIFICATION_TYPES.ORDER_CANCELLED,
        "Order cancelled",
        `Your order #${result.id.slice(-8)} has been cancelled.`,
        `/account/orders/${result.id}`
    );
    void emailTemplates.orderCancelled(result.id, user?.email ?? "customer", params.note);
    auditLog(params.userId, AUDIT_ACTIONS.ORDER_CANCELLED, "order", result.id, { note: params.note });
    return result;
}

/** Admin/seller order workflow transition with history + notifications. */
export async function changeOrderStatus(params: {
    orderId: string;
    to: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED";
    actorId: string;
    trackingNumber?: string;
    note?: string;
}): Promise<order> {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: params.orderId } });

    const updated = await prisma.$transaction(async (tx: Tx) => {
        const o = await tx.order.update({
            where: { id: params.orderId },
            data: {
                status: params.to,
                ...(params.trackingNumber ? { trackingNumber: params.trackingNumber } : {}),
            },
        });
        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: params.orderId,
                status: params.to,
                previousStatus: order.status,
                actorId: params.actorId,
                note: params.note ?? `Status changed to ${params.to}`,
            },
        });
        if (params.to === "SHIPPED") {
            void notify(
                o.userId,
                NOTIFICATION_TYPES.ORDER_SHIPPED,
                "Order shipped",
                `Your order #${params.orderId.slice(-8)} is on the way.${params.trackingNumber ? ` Tracking: ${params.trackingNumber}` : ""}`,
                `/account/orders/${params.orderId}`
            );
        }
        if (params.to === "DELIVERED") {
            void notify(
                o.userId,
                NOTIFICATION_TYPES.ORDER_DELIVERED,
                "Order delivered",
                `Your order #${params.orderId.slice(-8)} has been delivered.`,
                `/account/orders/${params.orderId}`
            );
        }
        return o;
    });

    const user = await prisma.user.findUnique({ where: { id: updated.userId }, select: { email: true } });
    const emailTo = user?.email ?? "customer";
    if (params.to === "SHIPPED") void emailTemplates.orderShipped(params.orderId, emailTo, params.trackingNumber ?? null);
    if (params.to === "DELIVERED") void emailTemplates.orderDelivered(params.orderId, emailTo);
    auditLog(params.actorId, AUDIT_ACTIONS.ORDER_STATUS_CHANGED, "order", params.orderId, { to: params.to });
    return updated;
}

/** Confirm payment for an order (admin / payment provider callback). */
export async function confirmPayment(params: { orderId: string; actorId: string; note?: string }): Promise<order> {
    const order = await prisma.order.findUnique({ where: { id: params.orderId }, include: { items: true } });
    if (!order) throw new ApiError(ERROR_CODES.ORDER_NOT_FOUND, "Order not found.", 404);
    if (order.paymentStatus === "PAID") {
        throw new ApiError(ERROR_CODES.CONFLICT, "Payment is already confirmed for this order.", 409);
    }

    const updated = await prisma.$transaction(async (tx: Tx) => {
        const o = await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID", status: order.status === "PENDING" ? "CONFIRMED" : order.status },
        });
        await tx.order_status_history.create({
            data: {
                id: `osh_${crypto.randomUUID()}`,
                orderId: order.id,
                status: o.status,
                previousStatus: order.status,
                paymentStatus: "PAID",
                actorId: params.actorId,
                note: params.note ?? "Payment confirmed",
            },
        });
        return o;
    });

    void notify(updated.userId, NOTIFICATION_TYPES.ORDER_CONFIRMED, "Payment received",
        `Payment for order #${updated.id.slice(-8)} has been confirmed.`, `/account/orders/${updated.id}`);
    auditLog(params.actorId, AUDIT_ACTIONS.PAYMENT_CONFIRMED, "order", updated.id);
    return updated;
}

/** Fetch an order with its timeline + items (single-page view). */
export async function getOrderTimeline(orderId: string) {
    const [order, history, items] = await Promise.all([
        prisma.order.findUnique({
            where: { id: orderId },
            include: { shippingAddress: true, coupon: true, refunds: true },
        }),
        prisma.order_status_history.findMany({ where: { orderId }, orderBy: { createdAt: "asc" } }),
        prisma.orderitem.findMany({
            where: { orderId },
            include: {
                product: { select: { id: true, title: true, image: true, mainImage: true, slug: true, brand: true } },
            },
        }),
    ]);
    if (!order) return null;
    return { order, history, items: items as (orderitem & { product: product })[] };
}
