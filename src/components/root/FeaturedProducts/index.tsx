
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getProducts } from "@/app/dashboard/products/page"



export async function FeaturedProducts() {
    const products = await getProducts();
    const lastFourProducts = products?.slice(-4);

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <Link href="/products">
                    <Button variant="outline">View All</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {lastFourProducts?.map((product) => (
                    <Card key={product.id} className="group">
                        <Link href={`dashboard/products/${product.id}`}>
                            <CardContent className="p-4">
                                <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    {/* {product.discount && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md">
                                            -{product.discount}%
                                        </div>
                                    )} */}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                    <h3 className="font-semibold">{product.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">${product.price}</span>
                                        {/* {product.discount && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                ${(product.price * (1 + product.discount / 100)).toFixed(2)}
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            </CardContent>
                        </Link>
                        <CardFooter className="p-4">
                            <Link href={`dashboard/products/${product.id}`}>
                                <Button className="w-full">More Details</Button>
                            </Link>
                        </CardFooter>

                    </Card>
                ))}
            </div>
        </section>
    )
} 