"use client";

import { Button } from '@/components/ui/button';
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
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            if (cartItem.quantity === 1) {
                                removeItem(product.id);
                            } else {
                                updateQuantity(product.id, cartItem.quantity - 1);
                            }
                        }}
                        className="h-10 w-10"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center text-lg font-medium">
                        {cartItem.quantity}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="h-10 w-10"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
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
        <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            onClick={() => addItem(product)}
        >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
        </Button>
    );
} 