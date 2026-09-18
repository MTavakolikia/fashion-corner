import { getAuthedUser } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** GET /api/wishlist — the caller's wishlist with product data (single join query, no N+1). */
export async function GET() {
    try {
        const authed = await getAuthedUser();
        const items = await prisma.wishlist.findMany({
            where: { userId: authed.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        compareAtPrice: true,
                        image: true,
                        mainImage: true,
                        stock: true,
                        status: true,
                        category: true,
                        rating: true,
                    },
                },
            },
        });
        return ok({
            items: items
                .filter((w) => w.product !== null)
                .map((w) => ({
                    id: w.id,
                    createdAt: w.createdAt,
                    product: w.product as Record<string, unknown>,
                    available: w.product.status === "PUBLISHED" && w.product.stock > 0,
                })),
        });
    } catch (e) {
        return toResponse(e, "[wishlist.list]");
    }
}

const bodySchema = z.object({ productId: z.string().min(1) });

/** POST /api/wishlist — add to wishlist (deduped, rate limited). */
export async function POST(req: Request) {
    try {
        rateLimit(req, "wishlist");
        const authed = await getAuthedUser();
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "productId is required.", 400, (e as { issues?: unknown }).issues);
        }

        const product = await prisma.product.findUnique({ where: { id: body.productId }, select: { id: true } });
        if (!product) return fail(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);

        const existing = await prisma.wishlist.findUnique({
            where: { userId_productId: { userId: authed.user.id, productId: body.productId } },
        });
        if (existing) return ok({ item: existing, alreadyInWishlist: true });

        const item = await prisma.wishlist.create({
            data: {
                id: `wish_${crypto.randomUUID()}`,
                userId: authed.user.id,
                productId: body.productId,
                updatedAt: new Date(),
            },
        });
        return ok({ item, alreadyInWishlist: false }, { status: 201 });
    } catch (e) {
        return toResponse(e, "[wishlist.add]");
    }
}

/** DELETE /api/wishlist?productId= — remove from wishlist (owner-only). */
export async function DELETE(req: Request) {
    try {
        rateLimit(req, "wishlist");
        const authed = await getAuthedUser();
        const url = new URL(req.url);
        const productId = url.searchParams.get("productId");
        if (!productId) return fail(ERROR_CODES.VALIDATION_ERROR, "productId is required (?productId=).", 400);
        await prisma.wishlist.deleteMany({ where: { userId: authed.user.id, productId } });
        return ok({ removed: true });
    } catch (e) {
        return toResponse(e, "[wishlist.remove]");
    }
}
