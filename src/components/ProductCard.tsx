'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { GlareHover } from '@/components/magicui/glare-hover';
import { MagicCard } from '@/components/magicui/magic-card';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getProductImages, getProductSeed, getFallbackImage } from '@/lib/product-images';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    image?: string;
    category: string;
    rating?: number;
    compareAtPrice?: number | null;
}

export function ProductCard({ id, title, price, image, category, rating, compareAtPrice }: ProductCardProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const cartItem = items.find(item => item.id === id);
    const [loaded, setLoaded] = useState(false);
    const [imgErr, setImgErr] = useState(false);

    // Use LoremFlickr URLs from DB or generate fallbacks
    const seed = getProductSeed(id);
    const fallbackUrl = getProductImages(category, seed)[0];
    const displayImage = (!imgErr && image) ? image : (fallbackUrl ?? getFallbackImage());

    const handleAddToCart = () => {
        addItem({ id, title, price, image: displayImage, category });
    };

    return (
        <MagicCard
            mode="gradient"
            gradientFrom="#ffaa40"
            gradientTo="#9c40ff"
            gradientOpacity={0.1}
            gradientSize={250}
            className="group relative bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
        >
            <Link href={`/products/${id}`} className="block">
                <GlareHover
                    color="#ffaa40"
                    opacity={0.15}
                    angle={-30}
                    size={280}
                    duration={600}
                    playOnce
                    className="relative w-full aspect-[3/4] overflow-hidden bg-muted"
                >
                    {!loaded && !imgErr && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />}
                    <img
                        src={displayImage}
                        alt={title}
                        className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-700", loaded ? "block" : "hidden")}
                        loading="lazy"
                        onLoad={() => setLoaded(true)}
                        onError={() => { setImgErr(true); }}
                    />
                    {compareAtPrice && compareAtPrice > price && (
                        <span className="absolute top-2 left-2 z-10 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                            <AnimatedShinyText className="text-white">{`-${Math.round((1 - price / compareAtPrice) * 100)}% SALE`}</AnimatedShinyText>
                        </span>
                    )}
                </GlareHover>
            </Link>

            <div className="p-4 flex flex-col flex-1 relative z-10">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{category}</span>
                <Link href={`/products/${id}`}>
                    <h3 className="font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug">{title}</h3>
                </Link>

                {rating && rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-foreground inline-flex items-center">
                            <span>$</span>
                            <NumberTicker value={price} decimalPlaces={2} className="text-base font-bold text-foreground" />
                        </span>
                        {compareAtPrice && compareAtPrice > price && (
                            <span className="text-xs text-muted-foreground line-through">${compareAtPrice.toFixed(2)}</span>
                        )}
                    </div>

                    {cartItem ? (
                        <div className="flex items-center gap-1">
                            <ShimmerButton
                                borderRadius="9999px"
                                className="size-7 min-h-0 min-w-0 p-0"
                                onClick={() => { if (cartItem.quantity === 1) removeItem(id); else updateQuantity(id, cartItem.quantity - 1); }}
                                shimmerColor="#ffaa40"
                                background="rgba(156, 64, 255, 1)"
                            >
                                <Minus className="w-3 h-3" />
                            </ShimmerButton>
                            <span className="w-6 text-center text-sm font-medium">{cartItem.quantity}</span>
                            <ShimmerButton
                                borderRadius="9999px"
                                className="size-7 min-h-0 min-w-0 p-0"
                                onClick={() => updateQuantity(id, cartItem.quantity + 1)}
                                shimmerColor="#ffaa40"
                                background="rgba(156, 64, 255, 1)"
                            >
                                <Plus className="w-3 h-3" />
                            </ShimmerButton>
                        </div>
                    ) : (
                        <ShimmerButton
                            onClick={handleAddToCart}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                            shimmerColor="#ffaa40"
                            background="rgba(156, 64, 255, 1)"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add
                        </ShimmerButton>
                    )}
                </div>
            </div>
        </MagicCard>
    );
}
