"use client";

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ShippingDetails {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCart();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
        fullName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-8">Your Cart is Empty</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Add some items to your cart before proceeding to checkout.
                </p>
                <Link href="/dashboard/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Here you would typically:
        // 1. Validate shipping details
        // 2. Create order in database
        // 3. Process payment (skipped for this demo)
        // 4. Send confirmation email

        // For demo purposes, we'll just simulate an order completion
        const orderId = Math.random().toString(36).substring(2, 15);

        // Clear the cart
        clearCart();

        // Redirect to order confirmation
        router.push(`/checkout/confirmation/${orderId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shipping Details Form */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Shipping Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                                Full Name
                            </label>
                            <Input
                                id="fullName"
                                name="fullName"
                                value={shippingDetails.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={shippingDetails.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium mb-1">
                                Address
                            </label>
                            <Input
                                id="address"
                                name="address"
                                value={shippingDetails.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium mb-1">
                                    City
                                </label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={shippingDetails.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium mb-1">
                                    State
                                </label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={shippingDetails.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                                    ZIP Code
                                </label>
                                <Input
                                    id="zipCode"
                                    name="zipCode"
                                    value={shippingDetails.zipCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                    Phone
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={shippingDetails.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.title}</h3>
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

                        <Button
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                            onClick={handleSubmit}
                        >
                            Place Order
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 