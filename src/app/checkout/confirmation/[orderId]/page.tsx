"use client";

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />

                <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>

                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Thank you for your purchase. Your order has been confirmed.
                </p>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Order ID: <span className="font-medium">{params.orderId}</span>
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
                    <h2 className="font-semibold mb-4">What's Next?</h2>
                    <ul className="text-left text-sm space-y-2">
                        <li>• You will receive an order confirmation email shortly</li>
                        <li>• We will notify you when your order ships</li>
                        <li>• You can track your order status in your account</li>
                        <li>• For any questions, contact our customer support</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <Link href="/dashboard/products">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Continue Shopping
                        </Button>
                    </Link>
                    <Link href="/orders">
                        <Button variant="outline" className="w-full">
                            View Order History
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 