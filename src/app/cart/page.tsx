"use client";

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-8">Your Cart is Empty</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Looks like you haven&apos;t added any items to your cart yet.
                </p>
                <Link href="/dashboard/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="relative w-24 h-24">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{item.category}</p>
                                <p className="font-bold">${item.price.toFixed(2)}</p>

                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                if (item.quantity === 1) {
                                                    removeItem(item.id);
                                                } else {
                                                    updateQuantity(item.id, item.quantity - 1);
                                                }
                                            }}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Link href="/checkout">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
                                    Proceed to Checkout
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={clearCart}
                            >
                                Clear Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 