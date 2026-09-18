import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { ok, fail, toResponse } from "@/lib/http";
import { ERROR_CODES } from "@/lib/error-codes";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const upsertSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    image: z.string().url().optional(),
});

function slugify(input: string): string {
    return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

/** GET /api/admin/categories — list categories (admin). */
export async function GET() {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { products: true } } },
        });
        return ok({ categories });
    } catch (e) {
        return toResponse(e, "[admin.categories]");
    }
}

/** POST /api/admin/categories — create (admin). */
export async function POST(req: Request) {
    try {
        const authed = await getAuthedUser({ roles: ["ADMIN"] });
        requireAdmin(authed);
        let body: z.infer<typeof upsertSchema>;
        try {
            body = upsertSchema.parse(await req.json());
        } catch (e) {
            return fail(ERROR_CODES.VALIDATION_ERROR, "Invalid payload.", 400, (e as { issues?: unknown }).issues);
        }
        const category = await prisma.category.create({
            data: {
                name: body.name,
                slug: body.slug || slugify(body.name),
                description: body.description ?? null,
                image: body.image ?? null,
                updatedAt: new Date(),
            },
        });
        auditLog(authed.user.id, AUDIT_ACTIONS.CATEGORY_CREATED, "category", category.id, { name: body.name });
        return ok({ category }, { status: 201 });
    } catch (e) {
        return toResponse(e, "[admin.category.create]");
    }
}
