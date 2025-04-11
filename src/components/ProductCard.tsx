'use client'

import Link from 'next/link';
import { Button } from './ui/button';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
}

export function ProductCard({ id, title, price, image, category }: ProductCardProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const cartItem = items.find(item => item.id === id);

    const handleAddToCart = () => {
        addItem({
            id,
            title,
            price,
            image,
            category
        });
    };

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
            <Link href={`/dashboard/products/${id}`} className="block">
                <div className="relative w-full aspect-square">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain bg-gray-100 dark:bg-gray-700 p-4"
                    />
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{category}</div>
                <Link href={`/dashboard/products/${id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
                        {title}
                    </h3>
                </Link>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${price.toFixed(2)}
                    </span>
                    {cartItem ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    if (cartItem.quantity === 1) {
                                        removeItem(id);
                                    } else {
                                        updateQuantity(id, cartItem.quantity - 1);
                                    }
                                }}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                                {cartItem.quantity}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(id, cartItem.quantity + 1)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
} 