import { getAuthedUser, requireActiveSeller, assertSellerProductOwner } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import {
    updateProduct,
    deleteProduct,
    updateProductSchema,
} from "@/lib/services/products";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function getOwnedProduct(id: string, authed: Awaited<ReturnType<typeof getAuthedUser>>) {
    const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!product) return null;
    if (authed.user.role === "SELLER") assertSellerProductOwner(product.sellerId, authed);
    return product;
}

/** GET /api/seller/products/[id] — full product with variants (owner or admin). */
export async function GET(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const { id } = await params;
        const product = await getOwnedProduct(id, authed);
        if (!product) return fail(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);
        return ok({ product });
    } catch (e) {
        return toResponse(e, "[seller.product.get]");
    }
}

/** PATCH /api/seller/products/[id] — update (fields + status + stock + variants). */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const { id } = await params;
        let body: z.infer<typeof updateProductSchema>;
        try {
            body = updateProductSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid product payload.", 400, (e as { issues?: unknown }).issues);
        }
        const updated = await updateProduct(id, body, authed.user.id, { isAdmin: authed.user.role === "ADMIN" });
        return ok({ product: updated });
    } catch (e) {
        return toResponse(e, "[seller.product.update]");
    }
}

/** DELETE /api/seller/products/[id] — delete or archive (owner or admin). */
export async function DELETE(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const { id } = await params;
        const result = await deleteProduct(id, authed.user.id, { isAdmin: authed.user.role === "ADMIN" });
        return ok(result);
    } catch (e) {
        return toResponse(e, "[seller.product.delete]");
    }
}
