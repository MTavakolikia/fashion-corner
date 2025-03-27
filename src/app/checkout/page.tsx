"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { toast } from 'react-hot-toast';
import { CreateOrderInput } from '@/lib/validations/order';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items, router]);

    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleSubmit = async (formData: CreateOrderInput['shippingAddress']) => {
        try {
            setIsSubmitting(true);

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    shippingAddress: formData,
                    total: totalPrice,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const order = await response.json();
            clearCart();
            router.push(`/orders/${order.id}`);
            toast.success('Order placed successfully!');
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                    <ShippingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </div>

                <OrderSummary
                    items={items}
                    totalPrice={totalPrice}
                    onSubmit={() => { }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
} 