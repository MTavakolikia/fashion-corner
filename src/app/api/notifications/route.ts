import { getAuthedUser } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/notifications — the caller's notifications + unread count. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser();
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 30;
        const where = { userId: authed.user.id };
        const [items, total, unread] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { ...where, read: false } }),
        ]);
        return ok({ notifications: items, total, unread, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[notifications.list]");
    }
}

/** PATCH /api/notifications — mark all as read. */
export async function PATCH() {
    try {
        const authed = await getAuthedUser();
        await prisma.notification.updateMany({
            where: { userId: authed.user.id, read: false },
            data: { read: true, readAt: new Date() },
        });
        return ok({ marked: true });
    } catch (e) {
        return toResponse(e, "[notifications.readAll]");
    }
}
