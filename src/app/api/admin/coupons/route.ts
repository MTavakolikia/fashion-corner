import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { z } from "zod";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<Record<string, string>> };

/** GET /api/admin/coupons — list all coupons. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;
        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
            prisma.coupon.count(),
        ]);
        return ok({ coupons, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.coupons]");
    }
}

/** POST /api/admin/coupons — create coupon. */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const body = z.object({
            code: z.string().min(1).max(20).toUpperCase(),
            type: z.enum(["PERCENTAGE", "FIXED"]),
            value: z.number().positive(),
            minOrderAmount: z.number().nonnegative().default(0),
            maxDiscount: z.number().nonnegative().nullable().optional(),
            usageLimit: z.number().int().nonnegative().nullable().optional(),
            perUserLimit: z.number().int().nonnegative().nullable().optional(),
            startDate: z.string().datetime().optional(),
            endDate: z.string().datetime().optional(),
            isActive: z.boolean().default(true),
        }).parse(await req.json());

        const coupon = await prisma.coupon.create({
            data: {
                ...body,
                code: body.code.toUpperCase(),
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                updatedAt: new Date(),
            },
        });
        auditLog(authed.user.id, AUDIT_ACTIONS.COUPON_CREATED, "coupon", coupon.id, { code: coupon.code });
        return ok({ coupon }, { status: 201 });
    } catch (e) {
        if (e instanceof z.ZodError) return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid coupon payload.", 400, e.issues);
        return toResponse(e, "[admin.coupons.create]");
    }
}

/** DELETE /api/admin/coupons/[id] */
export async function DELETE(_req: Request, context: any) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await context.params;
        await prisma.coupon.delete({ where: { id } });
        auditLog(authed.user.id, AUDIT_ACTIONS.COUPON_DELETED, "coupon", id);
        return ok({ deleted: true });
    } catch (e) {
        return toResponse(e, "[admin.coupons.delete]");
    }
}
