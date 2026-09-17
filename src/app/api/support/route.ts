import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { NOTIFICATION_TYPES, notify } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

const ticketSchema = z.object({
    subject: z.string().min(2).max(200),
    message: z.string().min(10).max(5000),
    category: z.enum(["ORDER", "PRODUCT", "SHIPPING", "RETURN", "BILLING", "OTHER"]),
});

/** POST /api/support — customer creates a support ticket. */
export async function POST(req: Request) {
    try {
        rateLimit(req, "support");
        const authed = await getAuthedUser();
        let body: z.infer<typeof ticketSchema>;
        try {
            body = ticketSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid ticket payload.", 400, (e as { issues?: unknown }).issues);
        }

        const ticket = await prisma.support_ticket.create({
            data: {
                id: `tkt_${crypto.randomUUID()}`,
                userId: authed.user.id,
                subject: body.subject,
                message: body.message,
                category: body.category,
                priority: "MEDIUM",
                status: "OPEN",
            },
        });

        void notify(authed.user.id, NOTIFICATION_TYPES.SYSTEM, "Support ticket created", `Your ticket "${body.subject}" has been received.`, `/account/support`);

        const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
        for (const a of admins) {
            void prisma.notification.create({
                data: {
                    id: `ntf_${crypto.randomUUID()}`,
                    userId: a.id,
                    type: "SYSTEM",
                    title: "New support ticket",
                    message: `Ticket ${ticket.id.slice(-6)}: "${body.subject}" — ${body.category}`,
                    link: "/dashboard/admin/support",
                },
            }).catch(() => {});
        }

        auditLog(authed.user.id, AUDIT_ACTIONS.TICKET_STATUS_CHANGED, "support_ticket", ticket.id, { subject: body.subject, category: body.category });
        return ok({ ticket }, { status: 201 });
    } catch (e) {
        return toResponse(e, "[support.create]");
    }
}

/** GET /api/support — customer's own tickets. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser();
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const [tickets, total] = await Promise.all([
            prisma.support_ticket.findMany({
                where: { userId: authed.user.id },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.support_ticket.count({ where: { userId: authed.user.id } }),
        ]);

        return ok({ tickets, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[support.list]");
    }
}
