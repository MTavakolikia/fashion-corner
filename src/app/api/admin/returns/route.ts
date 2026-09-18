import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/returns?status= — all return requests. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;
        const where = status ? { status: status as never } : {};
        const [returns, total] = await Promise.all([
            prisma.return_request.findMany({
                where,
                orderBy: { requestedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    order: {
                        select: { id: true, total: true, status: true, createdAt: true, user: { select: { name: true, email: true } } },
                    },
                },
            }),
            prisma.return_request.count({ where }),
        ]);
        return ok({ returns, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.returns]");
    }
}
