import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    createProductSchema,
    updateProductSchema,
    productListQuerySchema,
    listProducts,
} from "@/lib/services/products";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** GET /api/seller/products — the seller's own products (all statuses). */
export async function GET(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        const url = new URL(req.url);
        const query = productListQuerySchema.parse({
            q: url.searchParams.get("q") ?? undefined,
            status: url.searchParams.get("status") ?? undefined,
            sort: url.searchParams.get("sort") ?? "newest",
            page: url.searchParams.get("page") ?? "1",
            limit: url.searchParams.get("limit") ?? "20",
        });
        const result = await listProducts({ ...query, sellerId: authed.user.id }, true);
        return ok(result);
    } catch (e) {
        if (e instanceof z.ZodError) return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid query.", 400, e.issues);
        return toResponse(e, "[seller.products]");
    }
}

/** POST /api/seller/products — create a product (with optional variants). */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        let body: z.infer<typeof createProductSchema>;
        try {
            body = createProductSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid product payload.", 400, (e as { issues?: unknown }).issues);
        }
        const product = await createProduct(body, authed.user.id, authed.user.id);
        return ok({ product }, { status: 201 });
    } catch (e) {
        return toResponse(e, "[seller.products.create]");
    }
}
