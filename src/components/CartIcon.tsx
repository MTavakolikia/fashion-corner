"use client";

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export function CartIcon() {
    const { totalItems } = useCart();

    return (
        <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                </span>
            )}
        </Link>
    );
} 