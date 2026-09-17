import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, toResponse } from "@/lib/http";
import { z } from "zod";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/sellers — list with filter + performance. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const q = url.searchParams.get("q");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const where: any = { role: "SELLER" };
        if (status) where.sellerStatus = status;
        if (q) where.OR = [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }];

        const [sellers, total] = await Promise.all([
            prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, picture: true, role: true, status: true, sellerStatus: true, createdAt: true } }),
            prisma.user.count({ where }),
        ]);

        const ids = sellers.map((s: any) => s.id);
        const perf = ids.length ? await prisma.$queryRaw<Array<{ sellerId: string; revenue: number; orders: number; products: number }>>`
            SELECT p."sellerId" AS "sellerId",
                   COALESCE(SUM(oi.price * oi.quantity) FILTER (WHERE o."paymentStatus" = 'PAID' AND o.status <> 'CANCELLED'), 0)::float AS "revenue",
                   COUNT(DISTINCT CASE WHEN o."paymentStatus" = 'PAID' AND o.status <> 'CANCELLED' THEN o.id END)::int AS "orders",
                   COUNT(DISTINCT p.id)::int AS "products"
            FROM "product" p LEFT JOIN "orderitem" oi ON oi."productId" = p.id LEFT JOIN "order" o ON o.id = oi."orderId"
            WHERE p."sellerId" = ANY(${ids}) GROUP BY p."sellerId"
        ` : [];
        const perfMap = new Map<string, { sellerId: string; revenue: number; orders: number; products: number }>(
            perf.map((r: any) => [r.sellerId, r])
        );

        return ok({
            sellers: sellers.map((s: any) => ({
                ...s,
                products: perfMap.get(s.id)?.products ?? 0,
                revenue: perfMap.get(s.id)?.revenue ?? 0,
                orders: perfMap.get(s.id)?.orders ?? 0,
            })),
            total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    } catch (e) {
        return toResponse(e, "[admin.sellers]");
    }
}

/** PATCH /api/admin/sellers/[id] — approve / reject / suspend seller. */
export async function PATCH(req: Request, context: any) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await context.params;
        const body = z.object({ sellerStatus: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]) }).parse(await req.json());

        const updated = await prisma.user.update({ where: { id }, data: { sellerStatus: body.sellerStatus, updatedAt: new Date() } });
        auditLog(authed.user.id, AUDIT_ACTIONS.SELLER_APPROVED, "seller", id, { sellerStatus: body.sellerStatus });
        return ok({ seller: updated });
    } catch (e) {
        return toResponse(e, "[admin.sellers.patch]");
    }
}
