import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function WishlistPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const wishlists = await prisma.wishlist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    const wishlistWithProducts = await Promise.all(
        wishlists.map(async (w) => {
            const product = await prisma.product.findUnique({ where: { id: w.productId } });
            return { ...w, product };
        })
    );

    const inStockItems = wishlistWithProducts.filter((w) => w.product?.stock && w.product.stock > 0);
    const outOfStockItems = wishlistWithProducts.filter((w) => !w.product || w.product.stock === 0);

    return (
        <AccountShell title="My Wishlist">
            {inStockItems.length === 0 && outOfStockItems.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {outOfStockItems.filter((w) => w.product).length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">Out of Stock</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {outOfStockItems.map((w) => w.product && <ProductTile key={w.id} product={w.product} />)}
                            </div>
                        </div>
                    )}
                    {inStockItems.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">In Stock</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inStockItems.map((w) => w.product && <ProductTile key={w.id} product={w.product} />)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </AccountShell>
    );
}

function ProductTile({ product }: { product: any }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden group">
            <Link href={`/products/${product.id}`} className="block aspect-square relative overflow-hidden">
                <img src={product.image ?? product.mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </Link>
            <div className="p-3">
                <p className="text-xs text-muted-foreground capitalize">{product.brand ?? product.category}</p>
                <Link href={`/products/${product.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary line-clamp-1 block">
                    {product.title}
                </Link>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
                        )}
                    </div>
                    {product.stock <= 3 && product.stock > 0 && (
                        <span className="text-xs text-orange-600">Only {product.stock} left</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-muted-foreground mb-3">Your wishlist is empty</p>
            <Link href="/products" className="text-primary hover:underline text-sm">Browse Products</Link>
        </div>
    );
}
