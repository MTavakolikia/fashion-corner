import { getAuthedUser, assertSellerProductOwner } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { getProductDetail, deleteProduct } from "@/lib/services/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/products/[id] — public product detail (with variants + rating aggregates). */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const { id } = await params;
        const result = await getProductDetail(id);
        // Only published products are publicly reachable by id.
        if (!result || (result as { status: string }).status !== "PUBLISHED") {
            return fail(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);
        }
        return ok(result);
    } catch (e) {
        return toResponse(e, "[product.get]");
    }
}

/** DELETE /api/products/[id] — admin, or the owning active seller. Products with order
 *  history are archived (soft-deleted) instead of hard-deleted. */
export async function DELETE(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            select: { sellerId: true },
        });
        if (!product) return fail(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);
        if (authed.user.role === "SELLER") {
            assertSellerProductOwner(product.sellerId, authed);
        }
        const result = await deleteProduct(id, authed.user.id, { isAdmin: authed.user.role === "ADMIN" });
        return ok(result);
    } catch (e) {
        return toResponse(e, "[product.delete]");
    }
}
