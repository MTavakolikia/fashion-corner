import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { DotPattern } from '@/components/magicui/dot-pattern';

interface CategoryPageProps {
    params: Promise<{ category: string }>;
}

async function getCategoryProducts(category: string) {
    const slug = category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    try {
        const products = await prisma.product.findMany({
            where: { category: { equals: slug, mode: 'insensitive' } },
            orderBy: { createdAt: 'desc' },
        });
        return products;
    } catch {
        return [];
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;
    const products = await getCategoryProducts(category);
    const displayCategory = decodeURIComponent(category).replace(/-/g, ' ');

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium capitalize">{displayCategory}</span>
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b bg-card/30 relative overflow-hidden">
                <DotPattern
                    width={20}
                    height={20}
                    className="opacity-30 [mask-image:radial-gradient(400px_circle_at_20%_50%,white,transparent)]"
                />
                <div className="container mx-auto px-4 py-8 relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-0.5 mb-2 text-xs text-purple-600 dark:text-purple-300">
                            <AnimatedShinyText className="mx-0 max-w-none">Explore the collection</AnimatedShinyText>
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
                            <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                                {displayCategory}
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {products.length} product{products.length !== 1 ? 's' : ''} in this category
                        </p>
                    </BlurFade>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">No products yet</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            There are no products in the {displayCategory} category yet. Check back later!
                        </p>
                        <RainbowButton asChild variant="outline" size="lg" className="text-primary">
                            <Link href="/products">Browse all products</Link>
                        </RainbowButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product, index) => (
                            <BlurFade key={product.id} delay={0.04 * (index % 8)} inView>
                                <ProductCard
                                    id={product.id}
                                    title={product.title}
                                    price={product.price}
                                    image={product.image ?? product.mainImage ?? ""}
                                    category={product.category}
                                    rating={product.rating}
                                    compareAtPrice={product.compareAtPrice}
                                />
                            </BlurFade>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
