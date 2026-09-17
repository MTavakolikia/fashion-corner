import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Marquee } from '@/components/magicui/marquee';
import { BlurFade } from '@/components/magicui/blur-fade';
import { RainbowButton } from '@/components/magicui/rainbow-button';

interface ProductsPageProps {
    searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

async function getProducts(params: { q?: string; category?: string; sort?: string }) {
    const where: any = {};
    if (params.q) {
        where.OR = [
            { title: { contains: params.q, mode: 'insensitive' } },
            { description: { contains: params.q, mode: 'insensitive' } },
        ];
    }
    if (params.category) {
        where.category = { equals: params.category, mode: 'insensitive' };
    }

    const orderBy: any = params.sort === 'price_asc' ? { price: 'asc' } :
                    params.sort === 'price_desc' ? { price: 'desc' } :
                    params.sort === 'rating' ? { rating: 'desc' } :
                    { createdAt: 'desc' };

    const products = await prisma.product.findMany({ where, orderBy, take: 100 });
    return products;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;
    const products = await getProducts(params);
    const categories = await prisma.product.findMany({ select: { category: true }, distinct: ['category'], orderBy: { category: 'asc' } });

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: params.category ? params.category : 'All Products', href: '/products' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        {breadcrumbItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                {i > 0 && <span className="text-muted-foreground/50">/</span>}
                                {i === breadcrumbItems.length - 1 ? (
                                    <span className="text-foreground font-medium">{item.label}</span>
                                ) : (
                                    <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b bg-card/30">
                <div className="container mx-auto px-4 py-6">
                    <span className="inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-0.5 mb-2 text-xs text-purple-600 dark:text-purple-300">
                        <AnimatedShinyText className="mx-0 max-w-none">Curated for every style</AnimatedShinyText>
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <AnimatedGradientText
                            colorFrom="#ffaa40"
                            colorTo="#9c40ff"
                            speed={1.5}
                        >
                            {params.category ? params.category : 'All Products'}
                        </AnimatedGradientText>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {products.length} product{products.length !== 1 ? 's' : ''} found
                        {params.q && <> matching &quot;<span className="font-medium text-foreground">{params.q}</span>&quot;</>}
                        {params.category && <> in <span className="font-medium text-foreground">{params.category}</span></>}
                    </p>
                </div>
            </div>

            {/* Category Marquee */}
            {categories.length > 0 && (
                <div className="border-y border-border/50 py-4 bg-card/50 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
                    <Marquee
                        className="items-center [--duration:40s]"
                        pauseOnHover
                        repeat={2}
                    >
                        {categories.map((cat, i) => (
                            <Link
                                key={i}
                                href={`/products?category=${cat.category}`}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                            >
                                {cat.category}
                            </Link>
                        ))}
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
                </div>
            )}

            {/* Filters */}
            <div className="border-b bg-card/20 sticky top-16 z-40">
                <div className="container mx-auto px-4 py-3">
                    <FilterBar categories={categories} />
                </div>
            </div>

            {/* Products Grid */}
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
                            Try adjusting your filters or search terms to find what you&apos;re looking for.
                        </p>
                        <RainbowButton asChild variant="outline" size="lg" className="text-primary">
                            <Link href="/products">Clear all filters</Link>
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
                                />
                            </BlurFade>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}