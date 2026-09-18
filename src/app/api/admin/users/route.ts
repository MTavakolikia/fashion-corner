import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** GET /api/admin/users?q=&role=&status=&page= — user management listing. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const q = url.searchParams.get("q");
        const role = url.searchParams.get("role");
        const status = url.searchParams.get("status");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const where: Prisma.userWhereInput = {
            ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
            ...(role ? { role: role as never } : {}),
            ...(status ? { status: status as never } : {}),
        };
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    picture: true,
                    role: true,
                    status: true,
                    sellerStatus: true,
                    createdAt: true,
                    _count: { select: { orders: true, reviews: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);
        return ok({ users, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.users]");
    }
}
