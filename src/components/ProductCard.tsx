'use client'
import Link from 'next/link';
import { Button } from './ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
}

export function ProductCard({ id, title, price, image, category }: ProductCardProps) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
            <Link href={`/dashboard/products/${id}`} className="block">
                <div className="relative w-full aspect-square">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain bg-gray-100 dark:bg-gray-700 p-4"
                    />
                </div>
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{category}</div>
                <Link href={`/dashboard/products/${id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
                        {title}
                    </h3>
                </Link>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${price.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {/* TODO: Add to cart functionality */ }}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                        </Button>
                        {/* <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button> */}
                    </div>
                </div>
            </div>
        </div>
    );
} 