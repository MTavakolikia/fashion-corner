import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 50;
        const skip = (page - 1) * limit;

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            take: limit,
            skip,
            select: { id: true, name: true, slug: true },
        });
        const brands = await prisma.brand.findMany({
            orderBy: { name: "asc" },
            take: limit,
            skip,
            select: { id: true, name: true, slug: true },
        });
        const totalCategories = await prisma.category.count();
        const totalBrands = await prisma.brand.count();

        return NextResponse.json({
            success: true,
            data: {
                categories,
                brands,
                pagination: { page, limit, totalPages: Math.ceil((page - 1) * limit + categories.length + brands.length > (totalCategories + totalBrands) ? 1 : (totalCategories + totalBrands) / limit) },
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch catalog" } }, { status: 500 });
    }
}
