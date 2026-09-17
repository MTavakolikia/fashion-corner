import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { z } from "zod";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/coupons/[id] — update coupon (activate/deactivate). */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const body = z.object({ isActive: z.boolean().optional(), code: z.string().max(20).optional() }).parse(await req.json());
        const coupon = await prisma.coupon.update({ where: { id }, data: { ...body, updatedAt: new Date() } });
        auditLog(authed.user.id, AUDIT_ACTIONS.COUPON_UPDATED, "coupon", id);
        return ok({ coupon });
    } catch (e) {
        if (e instanceof z.ZodError) return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, e.issues);
        return toResponse(e, "[admin.coupons.patch]");
    }
}
