import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function OrdersDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return null;

    const [order, timeline] = await Promise.all([
        prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true, brand: true } } } },
                shippingAddress: true,
            },
        }),
        prisma.order_status_history.findMany({ where: { orderId: id }, orderBy: { createdAt: "asc" } }),
    ]);

    if (!order || order.userId !== userId) return <NotFound />;

    const statusSteps: { key: string; label: string }[] = [
        { key: "PENDING", label: "Order Placed" },
        { key: "CONFIRMED", label: "Confirmed" },
        { key: "PROCESSING", label: "Processing" },
        { key: "SHIPPED", label: "Shipped" },
        { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
        { key: "DELIVERED", label: "Delivered" },
        { key: "CANCELLED", label: "Cancelled" },
    ];

    const currentIdx = statusSteps.findIndex((s) => s.key === order.status);

    return (
        <AccountShell title={`Order #${order.id.slice(-6)}`}>
            <div className="space-y-6">
                {/* Timeline */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Status</h3>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                        {statusSteps.map((step, idx) => {
                            const done = idx <= currentIdx && order.status !== "CANCELLED";
                            const cancelled = order.status === "CANCELLED" && idx >= 0;
                            return (
                                <div key={step.key} className="flex items-center gap-1 shrink-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${done ? "bg-primary text-primary-foreground" : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"}`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-xs ml-1 hidden sm:block ${done ? "text-gray-900 dark:text-white font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                                    {idx < statusSteps.length - 1 && <div className={`w-6 h-0.5 mx-1 ${done ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />}
                                </div>
                            );
                        })}
                    </div>
                    {order.trackingNumber && (
                        <p className="mt-3 text-sm text-muted-foreground">Tracking: <span className="font-mono">{order.trackingNumber}</span></p>
                    )}
                    {order.estimatedDeliveryAt && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Est. delivery: {order.estimatedDeliveryAt.toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
                    <div className="space-y-3">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex gap-4">
                                <Link href={`/products/${item.product.id}`} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={item.product.image ?? item.product.mainImage} alt={item.product.title} className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/products/${item.product.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary line-clamp-1">
                                        {item.product.title}
                                    </Link>
                                    {item.product.brand && <p className="text-sm text-muted-foreground">{item.product.brand}</p>}
                                    <p className="text-sm text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                        {order.shippingCost > 0 && <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>${order.shippingCost.toFixed(2)}</span></div>}
                        {order.tax > 0 && <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>}
                        {order.discount > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                    <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.phone}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    {order.status === "PENDING" || order.status === "CONFIRMED" ? (
                        <CancelOrderButton orderId={order.id} />
                    ) : null}
                    {order.status === "DELIVERED" && (
                        <Link href={`/account/returns/new?orderId=${order.id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Request Return
                        </Link>
                    )}
                </div>
            </div>
        </AccountShell>
    );
}

function CancelOrderButton({ orderId }: { orderId: string }) {
    return (
        <form action={async () => {
            "use server";
            await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
        }}>
            <button type="submit" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Cancel Order
            </button>
        </form>
    );
}

function NotFound() {
    return (
        <AccountShell title="Order Not Found">
            <div className="text-center py-16">
                <p className="text-muted-foreground">This order could not be found.</p>
                <Link href="/account/orders" className="mt-4 inline-block text-primary hover:underline">Back to Orders</Link>
            </div>
        </AccountShell>
    );
}
