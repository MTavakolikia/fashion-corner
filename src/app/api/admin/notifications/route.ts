import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyRoles, NOTIFICATION_TYPES, type NotificationType } from "@/lib/services/notifications";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
    audience: z.enum(["ALL", "USERS", "SELLERS", "ADMINS"]),
    type: z.enum(Object.keys(NOTIFICATION_TYPES) as [string, ...string[]]).default("PROMOTION"),
    title: z.string().min(1).max(120),
    message: z.string().min(5).max(500),
    link: z.string().max(300).optional(),
});

/** POST /api/admin/notifications — broadcast a notification to an audience (admin). */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }
        const roles =
            body.audience === "ALL" ? (["USER", "SELLER", "ADMIN"] as const)
            : body.audience === "USERS" ? (["USER"] as const)
            : body.audience === "SELLERS" ? (["SELLER"] as const)
            : (["ADMIN"] as const);
        const count = await notifyRoles([...roles], body.type as NotificationType, body.title, body.message, body.link);
        auditLog(authed.user.id, AUDIT_ACTIONS.NOTIFICATION_BROADCAST, "notification", undefined, {
            audience: body.audience,
            count,
        });
        return ok({ sent: count });
    } catch (e) {
        return toResponse(e, "[admin.notifications.broadcast]");
    }
}
