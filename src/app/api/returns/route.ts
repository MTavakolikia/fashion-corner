import { getAuthedUser } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/returns — the caller's return requests. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser();
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;
        const status = url.searchParams.get("status");

        const where = { userId: authed.user.id, ...(status ? { status: status as never } : {}) };
        const [returns, total] = await Promise.all([
            prisma.return_request.findMany({
                where,
                orderBy: { requestedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: { order: { select: { id: true, total: true, status: true, createdAt: true } } },
            }),
            prisma.return_request.count({ where }),
        ]);
        return ok({ returns, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[returns.list]");
    }
}
