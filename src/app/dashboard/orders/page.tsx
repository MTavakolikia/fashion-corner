import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { MagicCard } from '@/components/magicui/magic-card';

interface OrderRow {
    id: string;
    userId: string;
    status: string;
    total: number;
    createdAt: Date;
    itemCount: number;
    shippingName: string;
}

async function getOrders(page = 1): Promise<{ orders: OrderRow[]; total: number }> {
    const skip = (page - 1) * 20;
    const [ordersRaw, total] = await Promise.all([
        prisma.order.findMany({
            skip, take: 20, orderBy: { createdAt: 'desc' },
            include: { _count: { select: { items: true } }, shippingAddress: { select: { fullName: true } } },
        }),
        prisma.order.count(),
    ]);
    const orders = ordersRaw.map(o => ({
        id: o.id, userId: o.userId, status: o.status, total: o.total,
        createdAt: o.createdAt, itemCount: o._count.items, shippingName: o.shippingAddress?.fullName || 'N/A',
    })) as OrderRow[];
    return { orders, total };
}

export default async function DashboardOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page = '1' } = await searchParams;
    const { orders, total } = await getOrders(Number(page));
    const totalPages = Math.ceil(total / 20);

    return (
        <DashboardShell title="Orders">
            <h1 className="text-2xl font-bold mb-6">
                <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                    Orders ({total})
                </AnimatedGradientText>
            </h1>
            {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
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
                                    <th className="text-left px-4 py-2">Order ID</th>
                                    <th className="text-left px-4 py-2">Customer</th>
                                    <th className="text-left px-4 py-2">Date</th>
                                    <th className="text-center px-4 py-2">Items</th>
                                    <th className="text-center px-4 py-2">Status</th>
                                    <th className="text-right px-4 py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id} className="border-t hover:bg-accent/50">
                                        <td className="px-4 py-2 font-mono text-xs">{o.id.slice(-8)}</td>
                                        <td className="px-4 py-2">{o.shippingName}</td>
                                        <td className="px-4 py-2 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-center">{o.itemCount}</td>
                                        <td className="px-4 py-2 text-center"><StatusBadge status={o.status} /></td>
                                        <td className="px-4 py-2 text-right font-semibold">${o.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </MagicCard>
                    <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <Link key={n} href={`/dashboard/orders?page=${n}`} className={`px-3 py-1 rounded border text-sm ${n === Number(page) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>{n}</Link>
                        ))}
                    </div>
                </>
            )}
        </DashboardShell>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.toLowerCase()}
        </span>
    );
}
