import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";

export type InventoryReason =
    | "ORDER"
    | "ORDER_CANCELLED"
    | "RETURN_APPROVED"
    | "ADJUSTMENT"
    | "IMPORT";

/**
 * Atomically reserve stock for the given quantities.
 * Uses a conditional UPDATE (stock >= qty) so two concurrent buyers of the
 * last unit can never both succeed. Must run inside a transaction.
 *
 * @returns the products that had insufficient stock (empty when all ok)
 */
export async function reserveStock(
    tx: PrismaTx,
    items: { productId: string; quantity: number; title: string }[],
    context: { orderId?: string; actorId?: string; reason?: InventoryReason; note?: string }
): Promise<void> {
    for (const item of items) {
        const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
            // Distinguish "product gone" from "not enough stock" for the caller's message.
            const product = await tx.product.findUnique({
                where: { id: item.productId },
                select: { title: true, stock: true },
            });
            if (!product) {
                throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND, `Product no longer available: ${item.title}`, 409);
            }
            await logStockMovement(tx, {
                productId: item.productId,
                delta: 0,
                reason: context.reason ?? "ORDER",
                orderId: context.orderId,
                actorId: context.actorId,
                note: "RESERVED_BLOCKED",
            });
            throw new ApiError(
                ERROR_CODES.INSUFFICIENT_STOCK,
                `Not enough stock for ${product.title} (available: ${product.stock}).`,
                409
            );
        }
        await logStockMovement(tx, {
            productId: item.productId,
            delta: -item.quantity,
            reason: context.reason ?? "ORDER",
            orderId: context.orderId,
            actorId: context.actorId,
            note: context.note,
        });
    }
}

/** Restock previously reserved/ordered quantities (cancellations, returns, adjustments). */
export async function releaseStock(
    tx: PrismaTx,
    items: { productId: string; quantity: number }[],
    context: { orderId?: string; actorId?: string; reason?: InventoryReason; note?: string }
): Promise<void> {
    for (const item of items) {
        await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
        });
        await logStockMovement(tx, {
            productId: item.productId,
            delta: item.quantity,
            reason: context.reason ?? "ORDER_CANCELLED",
            orderId: context.orderId,
            actorId: context.actorId,
            note: context.note,
        });
    }
}

export async function adjustStock(
    tx: PrismaTx,
    params: { productId: string; delta: number; reason: InventoryReason; actorId: string; note?: string }
): Promise<number> {
    const result = await tx.product.update({
        where: { id: params.productId },
        data: { stock: { increment: params.delta } },
    });
    if (result.stock < 0) {
        // Keep stock floored at zero rather than going negative.
        await tx.product.update({ where: { id: params.productId }, data: { stock: 0 } });
    }
    await logStockMovement(tx, {
        productId: params.productId,
        delta: params.delta,
        reason: params.reason,
        actorId: params.actorId,
        note: params.note,
    });
    return (await tx.product.findUniqueOrThrow({ where: { id: params.productId }, select: { stock: true } })).stock;
}

export interface StockMovement {
    productId: string;
    delta: number;
    reason: InventoryReason;
    orderId?: string | null;
    actorId?: string | null;
    note?: string | null;
}

export async function logStockMovement(tx: Prisma.TransactionClient, m: StockMovement): Promise<void> {
    await tx.inventory_log.create({
        data: {
            id: `inv_${crypto.randomUUID()}`,
            productId: m.productId,
            orderId: m.orderId ?? null,
            actorId: m.actorId ?? null,
            delta: m.delta,
            reason: m.reason,
            note: m.note ?? null,
        },
    });
}

/** Prisma interactive-transaction client. */
export type PrismaTx = Prisma.TransactionClient;

