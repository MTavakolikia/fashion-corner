import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { RainbowButton } from '@/components/magicui/rainbow-button';

interface BrandPageProps {
    params: Promise<{ brand: string }>;
}

async function getBrandProducts(brand: string) {
    try {
        const products = await prisma.product.findMany({
            where: { brand: { equals: decodeURIComponent(brand), mode: 'insensitive' } },
            orderBy: { createdAt: 'desc' },
        });
        return products;
    } catch {
        return [];
    }
}

export default async function BrandPage({ params }: BrandPageProps) {
    const { brand } = await params;
    const products = await getBrandProducts(brand);
    const displayBrand = decodeURIComponent(brand).replace(/-/g, ' ');

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
                        <span className="text-foreground font-medium capitalize">{displayBrand}</span>
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b bg-card/30 relative overflow-hidden">
                <DotPattern
                    width={20}
                    height={20}
                    className="opacity-30 [mask-image:radial-gradient(400px_circle_at_80%_50%,white,transparent)]"
                />
                <div className="container mx-auto px-4 py-8 relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 mb-2 text-xs text-blue-600 dark:text-blue-300">
                            <AnimatedShinyText className="mx-0 max-w-none">Official brand collection</AnimatedShinyText>
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
                            <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                                {displayBrand}
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {products.length} product{products.length !== 1 ? 's' : ''}
                        </p>
                    </BlurFade>
                </div>
            </div>

            {/* Products */}
            <div className="container mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">No products found</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            There are no products from {displayBrand} available yet.
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
