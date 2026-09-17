import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { NOTIFICATION_TYPES, notify } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/support — all support tickets (admin). */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const q = url.searchParams.get("q");
        const status = url.searchParams.get("status");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const where: any = {
            ...(q ? { OR: [{ subject: { contains: q, mode: "insensitive" as const } }, { message: { contains: q, mode: "insensitive" as const } }] } : {}),
            ...(status ? { status: status as never } : {}),
        };

        const [tickets, total] = await Promise.all([
            prisma.support_ticket.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { id: true, name: true, email: true, picture: true } } },
            }),
            prisma.support_ticket.count({ where }),
        ]);

        return ok({ tickets, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.support]");
    }
}

/** PATCH /api/admin/support — admin updates ticket. */
export async function PATCH(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const body = z.object({
            ticketId: z.string().min(1),
            status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"]),
            note: z.string().max(2000).optional(),
        }).parse(await req.json());

        const ticket = await prisma.support_ticket.findUnique({ where: { id: body.ticketId } });
        if (!ticket) throw new Error(ERROR_CODES.TICKET_NOT_FOUND);

        const updated = await prisma.$transaction(async (tx) => {
            const t = await tx.support_ticket.update({
                where: { id: body.ticketId },
                data: {
                    status: body.status,
                    resolvedAt: body.status === "RESOLVED" ? new Date() : null,
                    resolvedBy: body.status === "RESOLVED" ? authed.user.id : null,
                },
            });
            if (body.note) {
                await tx.notification.create({
                    data: {
                        id: `ntf_${crypto.randomUUID()}`,
                        userId: ticket.userId,
                        type: "SYSTEM",
                        title: "Ticket update",
                        message: `Your ticket "${ticket.subject}" has been updated: ${body.note}`,
                        link: `/account/support`,
                    },
                });
            }
            return t;
        });

        auditLog(authed.user.id, AUDIT_ACTIONS.TICKET_STATUS_CHANGED, "support_ticket", body.ticketId, { status: body.status });
        return ok({ ticket: updated });
    } catch (e) {
        return toResponse(e, "[admin.support.update]");
    }
}
