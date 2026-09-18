import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { Meteors } from '@/components/magicui/meteors';
import { RainbowButton } from '@/components/magicui/rainbow-button';

export default async function SalePage() {
    let products: any[] = [];
    try {
        products = await prisma.product.findMany({
            where: { stock: { gt: 0 }, compareAtPrice: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    } catch {}

    return (
        <div className="min-h-screen bg-background">
            {/* Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 text-white">
                <Meteors number={18} className="opacity-70" />
                <div className="container mx-auto px-4 py-14 text-center relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1 mb-4 text-sm text-white/90">
                            <AnimatedShinyText className="text-white/90 dark:text-white/90 mx-0 max-w-none">
                                Up to 50% off — limited time
                            </AnimatedShinyText>
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">
                            <AnimatedGradientText colorFrom="#ffffff" colorTo="#ffe4b5" speed={1.5}>
                                Sale
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-white/80 max-w-xl mx-auto">Don&apos;t miss our current offers</p>
                    </BlurFade>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium">Sale</span>
                    </nav>
                </div>
            </div>

            {/* Products */}
            <div className="container mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">No sale items yet</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            Check back soon for amazing deals, or browse all products.
                        </p>
                        <RainbowButton asChild variant="outline" size="lg" className="text-primary">
                            <Link href="/products">Browse all products</Link>
                        </RainbowButton>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground mb-6">{products.length} sale item{products.length !== 1 ? 's' : ''}</p>
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
                    </>
                )}
            </div>
        </div>
    );
}
