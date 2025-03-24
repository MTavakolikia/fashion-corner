import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    return product;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

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

                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                    // onClick={() => {/* TODO: Add to cart functionality */ }}
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
} 