import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { listProducts } from "@/lib/services/products";

export default async function SellerProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; q?: string }> }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);

    const result = await listProducts({
        q: params.q ?? undefined,
        status: params.status as any,
        sellerId: authed.user.id,
        page,
        limit: 20,
        sort: "newest",
    }, true);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h2>
                <Link href="/dashboard/seller/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    <PackagePlus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            <ProductTable products={result.products} total={result.total} page={page} totalPages={result.totalPages} params={params} />
        </div>
    );
}

function ProductTable({ products, total, page, totalPages, params }: { products: any[]; total: number; page: number; totalPages: number; params: { q?: string; status?: string } }) {
    const statusColors: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        ARCHIVED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {products.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products found. <Link href="/dashboard/seller/products/new" className="text-primary hover:underline">Add one</Link></td></tr>
                        ) : products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={p.image ?? p.mainImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                                        <div>
                                            <Link href={`/products/${p.slug || p.id}`} target="_blank" className="font-medium text-gray-900 dark:text-white hover:text-primary line-clamp-1 block">{p.title}</Link>
                                            <p className="text-xs text-muted-foreground">{p.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku ?? "—"}</td>
                                <td className="px-4 py-3 text-right font-medium">${p.price.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={p.stock <= 3 ? "text-red-600 font-medium" : ""}>{p.stock}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[p.status]}`}>{p.status.toLowerCase()}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/dashboard/seller/products/${p.id}`} className="text-sm text-primary hover:underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?page=${page - 1}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}&${params.status ? `status=${params.status}` : ""}`} className="px-3 py-1.5 rounded-md text-sm border hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    {page < totalPages && <Link href={`?page=${page + 1}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}&${params.status ? `status=${params.status}` : ""}`} className="px-3 py-1.5 rounded-md text-sm border hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </>
    );
}
