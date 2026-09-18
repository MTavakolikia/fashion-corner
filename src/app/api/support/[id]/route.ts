import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/support/[id] — a ticket (owner or admin). */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        const { id } = await params;
        const ticket = await prisma.support_ticket.findFirst({
            where: { id, OR: [{ userId: authed.user.id }, { status: "RESOLVED" }] },
        });
        if (!ticket || (ticket.userId !== authed.user.id && authed.user.role !== "ADMIN")) {
            return fail(ERROR_CODES.NOT_FOUND, "Ticket not found.", 404);
        }
        return ok(ticket);
    } catch (e) {
        return toResponse(e, "[support.get]");
    }
}

const updateSchema = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"]),
    note: z.string().max(1000).optional(),
});

/** PATCH /api/support/[id] — admin status transitions. */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser();
        requireAdmin(authed);
        const { id } = await params;
        let body: z.infer<typeof updateSchema>;
        try {
            body = updateSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }
        const ticket = await prisma.support_ticket.findUniqueOrThrow({ where: { id } });
        const updated = await prisma.support_ticket.update({
            where: { id },
            data: {
                status: body.status,
                resolvedAt: body.status === "RESOLVED" ? new Date() : null,
                resolvedBy: body.status === "RESOLVED" ? authed.user.id : ticket.resolvedBy,
            },
        });
        // Notify the customer of resolution.
        if (body.status === "RESOLVED" || body.status === "CLOSED") {
            void prisma.notification.create({
                data: {
                    id: `ntf_${crypto.randomUUID()}`,
                    userId: ticket.userId,
                    type: "SYSTEM",
                    title: "Your support ticket was updated",
                    message: `Ticket “${ticket.subject}” is now ${body.status.replace("_", " ").toLowerCase()}.`,
                    link: "/account/support",
                },
            }).catch(() => {});
        }
        auditLog(authed.user.id, AUDIT_ACTIONS.TICKET_STATUS_CHANGED, "support_ticket", id, { to: body.status });
        return ok(updated);
    } catch (e) {
        return toResponse(e, "[support.update]");
    }
}
