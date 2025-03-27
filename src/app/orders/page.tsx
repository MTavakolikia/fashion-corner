"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { order_status } from '@prisma/client';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        title: string;
        image: string;
    };
}

interface Order {
    id: string;
    status: order_status;
    total: number;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-red-500">{error}</p>
                <Button
                    onClick={fetchOrders}
                    className="mt-4"
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-8">No Orders Yet</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    You haven&apos;t placed any orders yet.
                </p>
                <Link href="/dashboard/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

            <div className="space-y-8">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                    >
                        <div className="p-6 border-b dark:border-gray-700">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Order placed on {formatDate(order.createdAt)}
                                    </p>
                                    <p className="text-sm">
                                        Order ID: <span className="font-medium">{order.id}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">
                                        Total: ${order.total.toFixed(2)}
                                    </p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-b dark:border-gray-700">
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
                                        <div>
                                            <Link
                                                href={`/dashboard/products/${item.product.id}`}
                                                className="font-medium hover:text-blue-600"
                                            >
                                                {item.product.title}
                                            </Link>
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

                        <div className="p-6">
                            <h3 className="font-semibold mb-4">Shipping Address</h3>
                            <div className="text-sm">
                                <p>{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 