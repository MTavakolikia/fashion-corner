import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sellerCustomers } from "@/lib/services/products";

export default async function SellerCustomersPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const params = await searchParams;
    const customers = await sellerCustomers(authed.user.id, (params.range ?? "30d") as any);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customers</h2>
            {customers.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground">No customers yet.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Orders</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Items</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {customers.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">{c.email}</p>
                                    </td>
                                    <td className="px-4 py-3">{c.orders}</td>
                                    <td className="px-4 py-3 text-right">{c.items}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
