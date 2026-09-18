import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/admin/refunds — all refunds (admin). */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;
        const where = status ? { status: status as never } : {};
        const [refunds, total] = await Promise.all([
            prisma.refund.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    order: { select: { id: true, total: true, user: { select: { name: true, email: true } } } },
                },
            }),
            prisma.refund.count({ where }),
        ]);
        return ok({ refunds, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.refunds]");
    }
}
