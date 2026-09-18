import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listProducts } from "@/lib/services/products";
import Link from "next/link";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; sellerId?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);

    const result = await listProducts({
        q: params.q ?? undefined,
        status: params.status as any,
        sellerId: params.sellerId || undefined,
        page,
        limit: 20,
        sort: "newest",
    }, true);

    const allSellers = await prisma.user.findMany({ where: { role: "SELLER" }, select: { id: true, name: true, email: true } });
    const sellerMap = new Map<string, { id: string; name: string | null; email: string | null }>(
        allSellers.map((s) => [s.id, s])
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h2>
            <AdminFilterBar sellers={allSellers} currentQ={params.q} currentStatus={params.status} currentSellerId={params.sellerId} />
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {result.products.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products found.</td></tr>
                        ) : result.products.map((p) => {
                            const seller = sellerMap.get(p.sellerId ?? "");
                            return (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image ?? p.mainImage ?? ""} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                                            <div>
                                                <Link href={`/products/${p.slug || p.id}`} target="_blank" className="font-medium text-gray-900 dark:text-white hover:text-primary line-clamp-1 block">{p.title}</Link>
                                                <p className="text-xs text-muted-foreground">{p.category} · {p.brand ?? "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{seller?.name ?? "—"}</td>
                                    <td className="px-4 py-3 text-right font-medium">${p.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{p.stock}</td>
                                    <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${p.status === "PUBLISHED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : p.status === "DRAFT" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>{p.status.toLowerCase()}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/dashboard/admin/products/${p.id}`} className="text-sm text-primary hover:underline">Edit</Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && <Link href={`?q=${params.q ?? ""}&status=${params.status ?? ""}&sellerId=${params.sellerId ?? ""}&page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
                    {page < result.totalPages && <Link href={`?q=${params.q ?? ""}&status=${params.status ?? ""}&sellerId=${params.sellerId ?? ""}&page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}

function AdminFilterBar({ sellers, currentQ, currentStatus, currentSellerId }: { sellers: any[]; currentQ?: string; currentStatus?: string; currentSellerId?: string }) {
    return (
        <form method="GET" className="flex flex-wrap gap-3">
            <input name="q" defaultValue={currentQ} placeholder="Search..." className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            <select name="status" defaultValue={currentStatus} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option value="">All Status</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <select name="sellerId" defaultValue={currentSellerId} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option value="">All Sellers</option>
                {sellers.map((s) => <option key={s.id} value={s.id}>{s.name ?? s.email}</option>)}
            </select>
            <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
        </form>
    );
}
