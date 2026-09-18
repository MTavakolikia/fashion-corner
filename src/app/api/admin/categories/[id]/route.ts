import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    image: z.string().url().nullable().optional(),
});

/** PATCH /api/admin/categories/[id] — update a category (admin). */
export async function PATCH(req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        let body: z.infer<typeof updateSchema>;
        try {
            body = updateSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) return fail(ERROR_CODES.NOT_FOUND, "Category not found.", 404);
        const updated = await prisma.category.update({
            where: { id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.slug !== undefined ? { slug: body.slug } : {}),
                ...(body.description !== undefined ? { description: body.description } : {}),
                ...(body.image !== undefined ? { image: body.image } : {}),
                updatedAt: new Date(),
            },
        });
        auditLog(authed.user.id, AUDIT_ACTIONS.CATEGORY_UPDATED, "category", id);
        return ok({ category: updated });
    } catch (e) {
        return toResponse(e, "[admin.category.update]");
    }
}

/** DELETE /api/admin/categories/[id] — delete only when no products reference it (admin). */
export async function DELETE(_req: Request, { params }: Ctx) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const { id } = await params;
        const existing = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
        if (!existing) return fail(ERROR_CODES.NOT_FOUND, "Category not found.", 404);
        if (existing._count.products > 0) {
            return fail(ERROR_CODES.CONFLICT, "Category still has products. Move or archive them first.", 409);
        }
        await prisma.category.delete({ where: { id } });
        auditLog(authed.user.id, AUDIT_ACTIONS.CATEGORY_DELETED, "category", id);
        return ok({ deleted: true });
    } catch (e) {
        return toResponse(e, "[admin.category.delete]");
    }
}
