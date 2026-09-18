"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Confetti } from '@/components/magicui/confetti';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { BlurFade } from '@/components/magicui/blur-fade';
import { MagicCard } from '@/components/magicui/magic-card';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        title: string;
        image: string;
    };
}

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: {
        fullName: string;
        email: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
    };
}

export default function OrderConfirmationPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                setError('Failed to load order details. Please try again later.');
                console.error('Error fetching order:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
                <Link href="/products">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Confetti
                className="pointer-events-none fixed inset-0 z-50 h-full w-full"
                options={{ particleCount: 160, spread: 100, origin: { y: 0.6 } }}
            />
            <div className="max-w-3xl mx-auto">
                <BlurFade inView className="text-center mb-8">
                    <span className="inline-block rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1 mb-4 text-sm text-green-600 dark:text-green-300">
                        <AnimatedShinyText className="text-green-600 dark:text-green-300 mx-0 max-w-none">
                            Your order is being prepared
                        </AnimatedShinyText>
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        <AnimatedGradientText colorFrom="#22c55e" colorTo="#9c40ff" speed={1.5}>
                            Order Confirmed!
                        </AnimatedGradientText>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Thank you for your order. We&apos;ll send you a confirmation email shortly.
                    </p>
                </BlurFade>

                <MagicCard
                    mode="gradient"
                    gradientFrom="#22c55e"
                    gradientTo="#9c40ff"
                    gradientOpacity={0.1}
                    gradientSize={320}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">Status</p>
                            <p className="text-green-600 font-semibold capitalize">{order.status}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <h3 className="font-semibold mb-4">Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.product.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Quantity: {item.quantity}
                                        </p>
                                        <p className="font-medium">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <h3 className="font-semibold mb-4">Shipping Address</h3>
                        <div className="text-sm">
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                {order.shippingAddress.zipCode}
                            </p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                            <p>Email: {order.shippingAddress.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Subtotal</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-700 pt-4">
                            <span>Total</span>
                            <span className="inline-flex items-center">
                                <span>$</span>
                                <NumberTicker value={order.total} decimalPlaces={2} className="text-lg font-semibold text-foreground" />
                            </span>
                        </div>
                    </div>
                </MagicCard>

                <div className="text-center">
                    <Link href="/products" className="inline-block">
                        <ShimmerButton
                            className="px-8 py-3 text-sm font-semibold"
                            shimmerColor="#ffaa40"
                            background="rgba(156, 64, 255, 1)"
                        >
                            Continue Shopping
                        </ShimmerButton>
                    </Link>
                </div>
            </div>
        </div>
    );
} 