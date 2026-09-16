import { prisma } from "@/lib/prisma";

export const NOTIFICATION_TYPES = {
    ORDER_CONFIRMED: "ORDER_CONFIRMED",
    ORDER_SHIPPED: "ORDER_SHIPPED",
    ORDER_DELIVERED: "ORDER_DELIVERED",
    ORDER_CANCELLED: "ORDER_CANCELLED",
    RETURN_UPDATE: "RETURN_UPDATE",
    REFUND_UPDATE: "REFUND_UPDATE",
    LOW_STOCK: "LOW_STOCK",
    PRICE_DROP: "PRICE_DROP",
    PROMOTION: "PROMOTION",
    SYSTEM: "SYSTEM",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_PREFERENCE_TYPES: NotificationType[] = [
    "ORDER_CONFIRMED",
    "ORDER_SHIPPED",
    "ORDER_DELIVERED",
    "ORDER_CANCELLED",
    "RETURN_UPDATE",
    "REFUND_UPDATE",
    "LOW_STOCK",
    "PRICE_DROP",
    "PROMOTION",
];

/** Create a notification for a user, honoring their preferences. Fire-and-forget safe. */
export async function notify(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    try {
        const pref = await prisma.notification_preference.findUnique({
            where: { userId_type: { userId, type } },
        });
        if (pref && !pref.enabled) return;

        await prisma.notification.create({
            data: {
                id: `ntf_${crypto.randomUUID()}`,
                userId,
                type,
                title,
                message,
                link: link ?? null,
            },
        });
    } catch (err) {
        console.error("[notifications] failed to create notification", err);
    }
}

/** Notify every user with a given role (used for admin/seller broadcasts). */
export async function notifyRoles(
    roles: ("USER" | "SELLER" | "ADMIN")[],
    type: NotificationType,
    title: string,
    message: string,
    link?: string
): Promise<number> {
    const users = await prisma.user.findMany({
        where: { role: { in: roles } },
      select: { id: true },
    });
    await Promise.all(
        users.map((u) =>
            prisma.notification
                .create({
                    data: {
                        id: `ntf_${crypto.randomUUID()}`,
                        userId: u.id,
                        type,
                        title,
                        message,
                        link: link ?? null,
                    },
                })
                .catch((err) => console.error("[notifications] broadcast failed", err))
        )
    );
    return users.length;
}
