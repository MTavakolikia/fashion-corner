import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, toResponse } from "@/lib/http";
import { z } from "zod";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { NOTIFICATION_TYPES, notify } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/users/[id] — user detail with orders count, reviews count. */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, name: true, email: true, picture: true, role: true,
                status: true, sellerStatus: true, phone: true, createdAt: true, updatedAt: true,
                _count: { select: { orders: true, reviews: true, wishlists: true } },
            },
        });
        if (!user) return fail(ERROR_CODES.NOT_FOUND, "User not found.", 404);
        return ok({ user });
    } catch (e) {
        return toResponse(e, "[admin.users.get]");
    }
}

/** PATCH /api/admin/users/[id] — update role, status, suspend/activate. */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const body = z.object({
            role: z.enum(["USER", "SELLER", "ADMIN"]).optional(),
            status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]).optional(),
            sellerStatus: z.enum(["NONE", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]).optional(),
            note: z.string().max(500).optional(),
        }).parse(await req.json());

        const updated = await prisma.user.update({ where: { id }, data: { ...body, updatedAt: new Date() } });

        if (body.status === "SUSPENDED") {
            void notify(id, NOTIFICATION_TYPES.SYSTEM, "Account suspended", "Your account has been suspended. Contact support for assistance.");
        }
        if (body.status === "ACTIVE") {
            void notify(id, NOTIFICATION_TYPES.SYSTEM, "Account activated", "Your account has been reactivated.");
        }
        auditLog(authed.user.id, AUDIT_ACTIONS.USER_ROLE_CHANGED, "user", id, { role: body.role, status: body.status });
        return ok({ user: updated });
    } catch (e) {
        return toResponse(e, "[admin.users.patch]");
    }
}
