import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { createOrder } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const orderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
});

const shippingAddressSchema = z.object({
    fullName: z.string().min(2).max(120),
    address: z.string().min(5).max(250),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    zipCode: z.string().min(3).max(20),
    phone: z.string().min(7).max(20),
});

const createOrderBodySchema = z.object({
    items: z.array(orderItemSchema).min(1).max(50),
    shippingAddress: shippingAddressSchema,
    notes: z.string().max(1000).optional(),
    couponCode: z.string().max(50).optional(),
    /** Idempotency token (client-generated UUID). Retried requests return the original order. */
    clientOrderId: z.string().max(100).optional(),
});

/**
 * POST /api/orders — create an order.
 * All prices/totals are recomputed server-side; stock is reserved atomically.
 */
export async function POST(req: Request) {
    try {
        rateLimit(req, "order-create");
        const authed = await getAuthedUser();
        let body: z.infer<typeof createOrderBodySchema>;
        try {
            body = createOrderBodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid order payload.", 400, (e as { issues?: unknown }).issues);
        }

        const order = await createOrder({
            userId: authed.user.id,
            userEmail: authed.user.email,
            items: body.items,
            shippingAddress: body.shippingAddress,
            notes: body.notes,
            couponCode: body.couponCode,
            clientOrderId: body.clientOrderId,
        });
        return ok({ orderId: order.id, status: order.status, total: order.total });
    } catch (e) {
        return toResponse(e, "[order.create]");
    }
}

/** GET /api/orders — the caller's orders, paginated. */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser();
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
        const status = url.searchParams.get("status");

        const where = { userId: authed.user.id, ...(status ? { status: status as never } : {}) };
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    items: { include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true, brand: true } } } },
                    shippingAddress: { select: { fullName: true, address: true, city: true, state: true, zipCode: true } },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return ok({
            orders,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    } catch (e) {
        return toResponse(e, "[order.list]");
    }
}
