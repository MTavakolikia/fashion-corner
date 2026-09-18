import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** GET /api/admin/audit-logs?resource=&action=&q=&page= — audit trail (admin). */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const resource = url.searchParams.get("resource");
        const action = url.searchParams.get("action");
        const q = url.searchParams.get("q");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 30;

        const where: Prisma.audit_logWhereInput = {
            ...(resource ? { resource } : {}),
            ...(action ? { action } : {}),
            ...(q ? { resourceId: { contains: q, mode: "insensitive" } } : {}),
        };
        const [entries, total] = await Promise.all([
            prisma.audit_log.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: { actor: { select: { name: true, email: true } } },
            }),
            prisma.audit_log.count({ where }),
        ]);
        return ok({ entries, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.audit-logs]");
    }
}
