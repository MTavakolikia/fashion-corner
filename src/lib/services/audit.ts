import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const AUDIT_ACTIONS = {
    // users & sellers
    USER_SUSPENDED: "USER_SUSPENDED",
    USER_ACTIVATED: "USER_ACTIVATED",
    USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
    SELLER_APPROVED: "SELLER_APPROVED",
    SELLER_REJECTED: "SELLER_REJECTED",
    SELLER_SUSPENDED: "SELLER_SUSPENDED",
    // products
    PRODUCT_CREATED: "PRODUCT_CREATED",
    PRODUCT_UPDATED: "PRODUCT_UPDATED",
    PRODUCT_DELETED: "PRODUCT_DELETED",
    PRODUCT_STATUS_CHANGED: "PRODUCT_STATUS_CHANGED",
    // orders & money
    ORDER_CREATED: "ORDER_CREATED",
    ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
    ORDER_CANCELLED: "ORDER_CANCELLED",
    PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
    RETURN_REQUESTED: "RETURN_REQUESTED",
    RETURN_STATUS_CHANGED: "RETURN_STATUS_CHANGED",
    REFUND_CREATED: "REFUND_CREATED",
    REFUND_COMPLETED: "REFUND_COMPLETED",
    // catalog
    COUPON_CREATED: "COUPON_CREATED",
    COUPON_UPDATED: "COUPON_UPDATED",
    COUPON_DELETED: "COUPON_DELETED",
    CATEGORY_CREATED: "CATEGORY_CREATED",
    CATEGORY_UPDATED: "CATEGORY_UPDATED",
    CATEGORY_DELETED: "CATEGORY_DELETED",
    BRAND_CREATED: "BRAND_CREATED",
    BRAND_UPDATED: "BRAND_UPDATED",
    BRAND_DELETED: "BRAND_DELETED",
    // platform
    SETTINGS_CHANGED: "SETTINGS_CHANGED",
    REVIEW_HIDDEN: "REVIEW_HIDDEN",
    REVIEW_RESTORED: "REVIEW_RESTORED",
    REVIEW_DELETED: "REVIEW_DELETED",
    REVIEW_RESPONDED: "REVIEW_RESPONDED",
    TICKET_STATUS_CHANGED: "TICKET_STATUS_CHANGED",
    NOTIFICATION_BROADCAST: "NOTIFICATION_BROADCAST",
    INVENTORY_ADJUSTED: "INVENTORY_ADJUSTED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/**
 * Write an audit log entry (fire-and-forget; failures are logged, never fatal).
 * Never store passwords, secrets, or PII beyond resource identifiers.
 */
export function auditLog(
    actorId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Prisma.InputJsonValue
): void {
    prisma.audit_log
        .create({
            data: {
                id: `audit_${crypto.randomUUID()}`,
                actorId,
                action,
                resource,
                resourceId: resourceId ?? null,
                metadata: metadata ?? {},
            },
        })
        .catch((err) => console.error("[audit_log] failed to write entry", err));
}
