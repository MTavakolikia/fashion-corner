import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

async function getOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                items: {
                    include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true, brand: true } } },
                },
            },
        }),
        prisma.order.count({ where: { userId } }),
    ]);
    return { orders, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { userId } = await auth();
    if (!userId) return null;
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const { orders, total, totalPages } = await getOrders(userId, page);

    return (
        <AccountShell title="My Orders">
            {orders.length === 0 ? (
                <EmptyState message="You haven&apos;t placed any orders yet." href="/products" />
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                    <Pagination current={page} total={totalPages} />
                </>
            )}
        </AccountShell>
    );
}

function OrderCard({ order }: { order: any }) {
    const statusStyles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        RETURN_REQUESTED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return (
        <Link href={`/account/orders/${order.id}`} className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        {" آ· "}
                        {order.items.reduce((s: number, i: any) => s + i.quantity, 0)} item{order.items.reduce((s: number, i: any) => s + i.quantity, 0) > 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[order.status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {order.status.replace("_", " ")}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex -space-x-2 mt-3">
                {order.items.slice(0, 4).map((item: any) => (
                    <img key={item.product.id} src={item.product.image ?? item.product.mainImage} alt="" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 object-cover" />
                ))}
                {order.items.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-muted-foreground">
                        +{order.items.length - 4}
                    </div>
                )}
            </div>
        </Link>
    );
}

function EmptyState({ message, href }: { message: string; href: string }) {
    return (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-muted-foreground mb-4">{message}</p>
            <Link href={href} className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Browse Products
            </Link>
        </div>
    );
}

function Pagination({ current, total }: { current: number; total: number }) {
    if (total <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Link
                href={`?page=${current - 1}`}
                className={`px-3 py-1.5 rounded-md text-sm border ${current <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                scroll={false}
            >
                Previous
            </Link>
            <span className="text-sm text-muted-foreground">Page {current} of {total}</span>
            <Link
                href={`?page=${current + 1}`}
                className={`px-3 py-1.5 rounded-md text-sm border ${current >= total ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                scroll={false}
            >
                Next
            </Link>
        </div>
    );
}
