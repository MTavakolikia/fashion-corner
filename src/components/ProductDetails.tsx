"use client";

import Image from 'next/image';
import { Star } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';

interface ProductDetailsProps {
    product: {
        id: string;
        title: string;
        price: number;
        image: string;
        category: string;
        rating: number;
        ratingCount: number;
        description: string;
    };
}

export function ProductDetails({ product }: ProductDetailsProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {product.title}
                    </h1>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="ml-1 text-gray-600 dark:text-gray-300">
                                {product.rating}
                            </span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">
                            ({product.ratingCount} reviews)
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${product.price.toFixed(2)}
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Description
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {product.description}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Category
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 capitalize">
                            {product.category}
                        </p>
                    </div>

                    <AddToCartButton
                        product={{
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            image: product.image,
                            category: product.category
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 