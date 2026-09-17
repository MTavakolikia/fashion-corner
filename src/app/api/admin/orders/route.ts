import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/admin/orders?status=&paymentStatus=&page= — all orders. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const paymentStatus = url.searchParams.get("paymentStatus");
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = 20;

        const where = {
            ...(status ? { status: status as never } : {}),
            ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
        };
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    total: true,
                    discount: true,
                    status: true,
                    paymentStatus: true,
                    trackingNumber: true,
                    couponCode: true,
                    createdAt: true,
                    _count: { select: { items: true } },
                    user: { select: { name: true, email: true } },
                },
            }),
            prisma.order.count({ where }),
        ]);
        return ok({ orders, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) {
        return toResponse(e, "[admin.orders]");
    }
}
