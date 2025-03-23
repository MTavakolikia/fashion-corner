"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const featuredProducts = [
    {
        id: 1,
        name: "Designer Summer Dress",
        price: 129.99,
        image: "/images/products/summer-dress.jpg",
        category: "Women's Fashion",
        href: "/products/designer-summer-dress",
        discount: 20
    },
    {
        id: 2,
        name: "Classic Leather Jacket",
        price: 249.99,
        image: "/images/products/leather-jacket.jpg",
        category: "Men's Fashion",
        href: "/products/classic-leather-jacket"
    },
    {
        id: 3,
        name: "Premium Sneakers",
        price: 89.99,
        image: "/images/products/sneakers.jpg",
        category: "Shoes",
        href: "/products/premium-sneakers",
        discount: 15
    },
    {
        id: 4,
        name: "Luxury Handbag",
        price: 199.99,
        image: "/images/products/handbag.jpg",
        category: "Accessories",
        href: "/products/luxury-handbag"
    }
]

export function FeaturedProducts() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <Link href="/products">
                    <Button variant="outline">View All</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                    <Card key={product.id} className="group">
                        <Link href={product.href}>
                            <CardContent className="p-4">
                                <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    {product.discount && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md">
                                            -{product.discount}%
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">${product.price}</span>
                                        {product.discount && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                ${(product.price * (1 + product.discount / 100)).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Link>
                        <CardFooter className="p-4">
                            <Button className="w-full">Add to Cart</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    )
} 