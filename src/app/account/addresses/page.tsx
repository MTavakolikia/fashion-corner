import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function AddressesPage() {
    const { userId } = await auth();
    if (!userId) return null;
    const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: "desc", createdAt: "desc" },
    });

    return (
        <AccountShell title="My Addresses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 relative">
                        {addr.isDefault && (
                            <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>
                        )}
                        <p className="font-medium text-gray-900 dark:text-white">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{addr.address}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                    </div>
                ))}
            </div>
            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground mb-3">No saved addresses</p>
                </div>
            ) : null}
            <p className="text-sm text-muted-foreground mt-4">Address management is available at checkout. Saved addresses appear here for reference.</p>
        </AccountShell>
    );
}
