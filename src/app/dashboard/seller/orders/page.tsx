import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where: { items: { some: { product: { sellerId: authed.user.id } } } },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                items: { where: { product: { sellerId: authed.user.id } }, select: { productId: true, quantity: true, price: true, product: { select: { id: true, title: true, image: true, mainImage: true, slug: true } } } },
                shippingAddress: { select: { fullName: true, address: true, city: true, zipCode: true } },
            },
        }),
        prisma.order.count({ where: { items: { some: { product: { sellerId: authed.user.id } } } } }),
    ]);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders ({total})</h2>
            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground">No orders yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link key={order.id} href={`/dashboard/seller/orders/${order.id}`} className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Order #{order.id.slice(-6)}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{order.shippingAddress.fullName} · {order.shippingAddress.city}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status]}`}>{order.status.replace("_", " ")}</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex -space-x-2 mt-3">
                                {order.items.slice(0, 4).map((item) => (
                                    <img key={item.productId} src={item.product.image ?? item.product.mainImage ?? ""} alt="" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 object-cover" />
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {total > limit && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}
