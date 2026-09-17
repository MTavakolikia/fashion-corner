"use client";

import Image from 'next/image';
import { MagicCard } from '@/components/magicui/magic-card';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { NumberTicker } from '@/components/magicui/number-ticker';

interface OrderSummaryProps {
    items: Array<{
        id: string;
        title: string;
        image: string;
        quantity: number;
        price: number;
    }>;
    totalPrice: number;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function OrderSummary({ items, totalPrice, onSubmit, isSubmitting }: OrderSummaryProps) {
    return (
        <MagicCard
            mode="gradient"
            gradientFrom="#ffaa40"
            gradientTo="#9c40ff"
            gradientOpacity={0.1}
            gradientSize={260}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-4"
        >
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="80px"
                                className="object-cover rounded"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Quantity: {item.quantity}
                            </p>
                            <p className="font-medium inline-flex items-center">
                                <span>$</span>
                                <NumberTicker value={item.price * item.quantity} decimalPlaces={2} className="font-medium text-foreground" />
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            <ShimmerButton
                className="w-full mt-6 py-4 text-base font-semibold disabled:opacity-50"
                onClick={onSubmit}
                disabled={isSubmitting}
                shimmerColor="#ffaa40"
                background="rgba(156, 64, 255, 1)"
            >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </ShimmerButton>
        </MagicCard>
    );
}
