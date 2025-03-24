"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: {
        name: string;
        slug: string;
    };
    images: string[];
    rating?: {
        rate: number;
        count: number;
    };
}

export default function ImportProducts() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setMessage(null);

            const fileContent = await file.text();
            const products = JSON.parse(fileContent);

            // Validate the structure
            if (!Array.isArray(products)) {
                throw new Error('The JSON file must contain an array of products');
            }

            // Basic validation of product structure
            const isValidProduct = (product: Product) => {
                return (
                    product.id &&
                    product.title &&
                    product.price &&
                    product.description &&
                    product.category?.name &&
                    Array.isArray(product.images)
                );
            };

            if (!products.every(isValidProduct)) {
                throw new Error('Some products in the file do not match the required structure');
            }

            // Send to API
            const response = await fetch('/api/import-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(products),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to import products');
            }

            setMessage({
                type: 'success',
                text: `Successfully imported ${data.count} products`
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to import products'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Import Products</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Upload JSON File</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Upload a JSON file containing an array of products. Each product should have:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <li>id (number)</li>
                            <li>title (string)</li>
                            <li>slug (string)</li>
                            <li>price (number)</li>
                            <li>description (string)</li>
                            <li>category (object with name and slug)</li>
                            <li>images (array of strings)</li>
                        </ul>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            disabled={isLoading}
                            className="relative"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            {isLoading ? 'Importing...' : 'Select File'}
                        </Button>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                        />
                    </div>

                    {message && (
                        <div
                            className={`mt-4 p-4 rounded ${message.type === 'success'
                                ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'
                                : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 