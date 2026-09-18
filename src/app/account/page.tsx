import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

async function getData(userId: string) {
    const [orders, wishlistCount, addresses] = await Promise.all([
        prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                items: { take: 3, include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true } } } },
            },
        }),
        prisma.wishlist.count({ where: { userId } }),
        prisma.address.count({ where: { userId } }),
    ]);
    return { orders, wishlistCount, addresses };
}

export default async function AccountPage() {
    const { userId } = await auth();
    if (!userId) return null;
    const clerkUser = await currentUser();
    const data = await getData(userId);

    const recentOrders = data.orders.map((o) => ({
        ...o,
        itemPreview: o.items.map((i) => i.product),
    }));

    return (
        <AccountShell title="My Account">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                            {clerkUser?.firstName?.[0] ?? "U"}{clerkUser?.lastName?.[0] ?? ""}
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                {clerkUser?.firstName} {clerkUser?.lastName}
                            </h2>
                            <p className="text-sm text-muted-foreground">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <StatQuick href="/account/orders" label="Orders" value={data.orders.length} />
                        <StatQuick href="/account/wishlist" label="Wishlist" value={data.wishlistCount} />
                        <StatQuick href="/account/addresses" label="Addresses" value={data.addresses} />
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link href="/account/orders" className="text-sm text-primary hover:underline">View all</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground mb-3">No orders yet</p>
                            <Link href="/products" className="text-sm text-primary hover:underline">Start shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <OrderRow key={order.id} order={order} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AccountShell>
    );
}

function StatQuick({ href, label, value }: { href: string; label: string; value: number }) {
    return (
        <Link href={href} className="flex items-center justify-between py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 rounded-md transition-colors">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
        </Link>
    );
}

function OrderRow({ order }: { order: any }) {
    const statusColors: Record<string, string> = {
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
        <Link href={`/account/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item: any) => (
                        <img key={item.product.id} src={item.product.image ?? item.product.mainImage} alt="" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 object-cover" />
                    ))}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} آ· {order.items.reduce((s: number, i: any) => s + i.quantity, 0)} item(s)
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[order.status]}`}>{order.status.replace("_", " ")}</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
            </div>
        </Link>
    );
}
