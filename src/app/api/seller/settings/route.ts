import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    picture: z.string().url().optional(),
    defaultLowStockThreshold: z.number().int().min(0).max(1000).optional(),
});

/** PUT /api/seller/settings — update the seller's store profile. */
export async function PUT(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"] });
        requireActiveSeller(authed);
        let body: z.infer<typeof bodySchema>;
        try {
            body = bodySchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }

        const user = await prisma.user.update({
            where: { id: authed.user.id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.picture !== undefined ? { picture: body.picture } : {}),
            },
        });

        // Apply default low-stock threshold across the seller's products.
        if (body.defaultLowStockThreshold !== undefined) {
            await prisma.product.updateMany({
                where: { sellerId: authed.user.id, status: { not: "ARCHIVED" } },
                data: { lowStockThreshold: body.defaultLowStockThreshold },
            });
        }
        auditLog(authed.user.id, AUDIT_ACTIONS.SETTINGS_CHANGED, "seller_settings", user.id, {
            fields: Object.keys(body).filter((k) => body[k as keyof typeof body] !== undefined),
        });
        return ok({ user: { id: user.id, name: user.name, picture: user.picture } });
    } catch (e) {
        return toResponse(e, "[seller.settings]");
    }
}
