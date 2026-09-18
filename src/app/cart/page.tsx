'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { MagicCard } from '@/components/magicui/magic-card';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                    Looks like you haven&apos;t added any items to your cart yet.
                </p>
                <RainbowButton asChild size="lg">
                    <Link href="/products" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </RainbowButton>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-foreground font-medium">Cart</span>
            </nav>

            <h1 className="text-2xl font-bold tracking-tight mb-8">
                <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                    Shopping Cart
                </AnimatedGradientText>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-3">
                    {items.map((item, index) => (
                        <BlurFade key={item.id} delay={0.05 * (index % 6)} inView>
                            <MagicCard
                                mode="gradient"
                                gradientFrom="#ffaa40"
                                gradientTo="#9c40ff"
                                gradientOpacity={0.08}
                                gradientSize={220}
                                className="bg-card border rounded-lg p-4"
                            >
                                <div className="flex gap-4">
                                    <div className="relative w-20 h-20 shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="80px"
                                            className="object-cover rounded-md"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <Link href={`/products/${item.id}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate block">
                                                    {item.title}
                                                </Link>
                                                <p className="text-sm text-muted-foreground mt-0.5">{item.category}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-1 border rounded-md">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => {
                                                        if (item.quantity === 1) {
                                                            removeItem(item.id);
                                                        } else {
                                                            updateQuantity(item.id, item.quantity - 1);
                                                        }
                                                    }}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <p className="font-bold text-foreground inline-flex items-center">
                                                <span>$</span>
                                                <NumberTicker value={item.price * item.quantity} decimalPlaces={2} className="font-bold text-foreground" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </MagicCard>
                        </BlurFade>
                    ))}

                    <div className="pt-2">
                        <button
                            onClick={clearCart}
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Clear cart
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <MagicCard
                        mode="gradient"
                        gradientFrom="#ffaa40"
                        gradientTo="#9c40ff"
                        gradientOpacity={0.12}
                        gradientSize={260}
                        className="bg-card border rounded-lg p-5 sticky top-24"
                    >
                        <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-600 dark:text-green-400">Free</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold text-foreground">
                                <span>Total</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <Link href="/checkout" className="block">
                            <ShimmerButton
                                className="w-full py-3 text-sm font-semibold"
                                shimmerColor="#ffaa40"
                                background="rgba(156, 64, 255, 1)"
                            >
                                Proceed to Checkout
                            </ShimmerButton>
                        </Link>
                        <Link href="/products" className="block text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Continue Shopping
                        </Link>
                    </MagicCard>
                </div>
            </div>
        </div>
    );
}
