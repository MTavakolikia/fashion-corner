import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import Link from "next/link";

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: true,
            _count: { select: { reviews: true } },
        },
    });

    if (!product || product.status !== "PUBLISHED") notFound();

    const ratingAgg = await prisma.review.aggregate({
        where: { productId: id, isHidden: false },
        _avg: { rating: true },
        _count: true,
    });

    return {
        ...product,
        rating: ratingAgg._avg.rating ?? product.rating,
        ratingCount: ratingAgg._count ?? product.ratingCount,
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    // Record view (fire-and-forget)
    void prisma.product.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    const relatedProducts = await prisma.product.findMany({
        where: { category: product.category, id: { not: id }, status: "PUBLISHED" },
        orderBy: { rating: "desc" },
        take: 8,
        select: { id: true, title: true, slug: true, price: true, compareAtPrice: true, image: true, mainImage: true, rating: true },
    });

    const reviews = await prisma.review.findMany({
        where: { productId: id, isHidden: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, picture: true } } },
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
                        {product.category && <>
                            <span className="text-muted-foreground/50">/</span>
                            <Link href={`/categories/${product.category}`} className="hover:text-foreground transition-colors capitalize">{product.category}</Link>
                        </>}
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
                    </nav>
                </div>
            </div>

            <ProductDetails
                product={{
                    ...product,
                    image: product.image ?? product.mainImage ?? "",
                    description: product.description ?? "",
                    slug: product.slug ?? undefined,
                    brand: product.brand ?? undefined,
                    specifications: product.specifications as any,
                    tags: product.tags ?? undefined,
                }}
                relatedProducts={relatedProducts.map(p => ({
                    ...p,
                    slug: p.slug ?? "",
                    image: p.image ?? p.mainImage ?? "",
                    mainImage: p.mainImage ?? p.image ?? "",
                }))}
                reviews={(reviews as any[]).map(r => ({
                    ...r,
                    comment: r.comment ?? undefined,
                    user: r.user ? { ...r.user, name: r.user.name ?? undefined, picture: r.user.picture ?? undefined } : undefined,
                }))}
            />
        </div>
    );
}
