import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/** GET /api/categories — public category list (with product counts for the filter UI). */
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                parentId: true,
                _count: { select: { products: true } },
            },
        });
        return ok({ categories });
    } catch (e) {
        return toResponse(e, "[categories.list]");
    }
}
