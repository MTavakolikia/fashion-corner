import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { Meteors } from '@/components/magicui/meteors';
import { RainbowButton } from '@/components/magicui/rainbow-button';

export default async function NewArrivalsPage() {
    let products: any[] = [];
    try {
        products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    } catch {}

    return (
        <div className="min-h-screen bg-background">
            {/* Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-600 to-orange-500 text-white">
                <DotPattern
                    width={22}
                    height={22}
                    className="opacity-30 text-white [mask-image:radial-gradient(500px_circle_at_50%_50%,white,transparent)]"
                />
                <Meteors number={16} className="opacity-70" />
                <div className="container mx-auto px-4 py-14 text-center relative">
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1 mb-4 text-sm text-white/90">
                            <AnimatedShinyText className="text-white/90 dark:text-white/90 mx-0 max-w-none">
                                Fresh drops every week
                            </AnimatedShinyText>
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-3">
                            <AnimatedGradientText colorFrom="#ffffff" colorTo="#ffe4b5" speed={1.5}>
                                New Arrivals
                            </AnimatedGradientText>
                        </h1>
                        <p className="text-white/80 max-w-xl mx-auto">The latest additions to our collection</p>
                    </BlurFade>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b bg-card/50">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-foreground font-medium">New Arrivals</span>
                    </nav>
                </div>
            </div>

            {/* Products */}
            <div className="container mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">No new arrivals yet</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            Check back soon for the newest styles, or browse our full collection.
                        </p>
                        <RainbowButton asChild variant="outline" size="lg" className="text-primary">
                            <Link href="/products">Browse all products</Link>
                        </RainbowButton>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground mb-6">{products.length} new arrival{products.length !== 1 ? 's' : ''}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {products.map((product, index) => (
                                <BlurFade key={product.id} delay={0.04 * (index % 8)} inView>
                                    <ProductCard
                                        id={product.id}
                                        title={product.title}
                                        price={product.price}
                                        image={product.image}
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
