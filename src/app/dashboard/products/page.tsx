import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { MagicCard } from '@/components/magicui/magic-card';

interface ProductRow {
    id: string;
    title: string;
    category: string;
    price: number;
    stock: number;
    rating: number;
}

async function getProducts(page = 1): Promise<{ products: ProductRow[]; total: number }> {
    const skip = (page - 1) * 20;
    const [products, total] = await Promise.all([
        prisma.product.findMany({ skip, take: 20, orderBy: { createdAt: 'desc' } }),
        prisma.product.count(),
    ]);
    return { products: products as ProductRow[], total };
}

export default async function DashboardProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page = '1' } = await searchParams;
    const { products, total } = await getProducts(Number(page));
    const totalPages = Math.ceil(total / 20);

    return (
        <DashboardShell title="Products">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                        Products ({total})
                    </AnimatedGradientText>
                </h1>
            </div>
            {products.length === 0 ? (
                <p className="text-muted-foreground">No products found. <Link href="/dashboard/import-products" className="text-primary underline">Import products</Link></p>
            ) : (
                <>
                    <MagicCard
                        mode="gradient"
                        gradientFrom="#ffaa40"
                        gradientTo="#9c40ff"
                        gradientOpacity={0.06}
                        gradientSize={420}
                        className="bg-card rounded-lg border overflow-hidden"
                    >
                        <table className="w-full text-sm">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="text-left px-4 py-2">Title</th>
                                    <th className="text-left px-4 py-2">Category</th>
                                    <th className="text-right px-4 py-2">Price</th>
                                    <th className="text-right px-4 py-2">Stock</th>
                                    <th className="text-center px-4 py-2">Rating</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-t hover:bg-accent/50">
                                        <td className="px-4 py-2 font-medium">{p.title}</td>
                                        <td className="px-4 py-2 capitalize text-muted-foreground">{p.category}</td>
                                        <td className="px-4 py-2 text-right">${p.price.toFixed(2)}</td>
                                        <td className={`px-4 py-2 text-right ${p.stock <= 5 ? 'text-destructive font-semibold' : ''}`}>{p.stock}</td>
                                        <td className="px-4 py-2 text-center">★ {p.rating.toFixed(1)}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/products/${p.id}`} className="text-primary underline text-xs">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </MagicCard>
                    <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <Link key={n} href={`/dashboard/products?page=${n}`} className={`px-3 py-1 rounded border text-sm ${n === Number(page) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>{n}</Link>
                        ))}
                    </div>
                </>
            )}
        </DashboardShell>
    );
}
