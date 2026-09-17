import { getAuthedUser } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/notifications/[id] — mark one notification as read (owner only). */
export async function PATCH(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { id } = await params;
        const n = await prisma.notification.findFirst({ where: { id, userId: authed.user.id } });
        if (!n) return ok({ notFound: true });
        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true, readAt: new Date() },
        });
        return ok(updated);
    } catch (e) {
        return toResponse(e, "[notifications.read]");
    }
}
