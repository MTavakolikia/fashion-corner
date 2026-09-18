import Link from "next/link";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/queries/products";

export async function FeaturedProducts() {
    const products = await getProducts();
    const lastFourProducts = products?.slice(-4);

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <BlurFade inView>
                        <span className="inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 mb-3 text-purple-600 dark:text-purple-300">
                            <AnimatedShinyText>Hand-picked for you</AnimatedShinyText>
                        </span>
                    </BlurFade>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        <AnimatedGradientText
                            colorFrom="#ffaa40"
                            colorTo="#9c40ff"
                            speed={1.5}
                        >
                            Featured Products
                        </AnimatedGradientText>
                    </h2>
                    <p className="text-muted-foreground">Our hand-picked selection of the latest trends</p>
                </div>
                <Link href="/products">
                    <InteractiveHoverButton className="hidden md:flex">
                        View All
                    </InteractiveHoverButton>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {lastFourProducts?.map((product: any, index: number) => (
                    <BlurFade key={product.id} delay={0.08 * index} inView>
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
            <div className="mt-8 flex justify-center md:hidden">
                <Link href="/products">
                    <InteractiveHoverButton>View All</InteractiveHoverButton>
                </Link>
            </div>
        </section>
    );
}
