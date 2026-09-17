"use client";

import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { RippleButton } from '@/components/magicui/ripple-button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { CartItem } from '@/contexts/CartContext';

interface AddToCartButtonProps {
    product: Omit<CartItem, 'quantity'>;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();

    // Find if the product is already in cart
    const cartItem = items.find(item => item.id === product.id);

    if (cartItem) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <RippleButton
                        onClick={() => {
                            if (cartItem.quantity === 1) {
                                removeItem(product.id);
                            } else {
                                updateQuantity(product.id, cartItem.quantity - 1);
                            }
                        }}
                        rippleColor="#9c40ff"
                        className="size-10 rounded-xl p-0"
                    >
                        <Minus className="w-4 h-4" />
                    </RippleButton>
                    <span className="w-8 text-center text-lg font-medium">
                        {cartItem.quantity}
                    </span>
                    <RippleButton
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        rippleColor="#9c40ff"
                        className="size-10 rounded-xl p-0"
                    >
                        <Plus className="w-4 h-4" />
                    </RippleButton>
                </div>
                <Button
                    variant="destructive"
                    onClick={() => removeItem(product.id)}
                    className="flex-1"
                >
                    Remove from Cart
                </Button>
            </div>
        );
    }

    return (
        <ShimmerButton
            className="w-full py-6 text-lg font-semibold"
            onClick={() => addItem(product)}
            shimmerColor="#ffaa40"
            background="rgba(156, 64, 255, 1)"
        >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
        </ShimmerButton>
    );
}
