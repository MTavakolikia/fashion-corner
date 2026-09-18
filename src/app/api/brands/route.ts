import { ok, toResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/** GET /api/brands — public brand list (with product counts for the filter UI). */
export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                _count: { select: { products: true } },
            },
        });
        return ok({ brands });
    } catch (e) {
        return toResponse(e, "[brands.list]");
    }
}
