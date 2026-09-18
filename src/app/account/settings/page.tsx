import { AccountShell } from "@/components/account/AccountShell";
import { getAuthedUser } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";

export default async function SettingsPage() {
    const authed = await getAuthedUser();
    const clerkUser = await currentUser();

    return (
        <AccountShell title="Settings">
            <div className="max-w-xl space-y-6">
                {/* Profile */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input defaultValue={clerkUser?.firstName ?? ""} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input defaultValue={clerkUser?.lastName ?? ""} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input defaultValue={clerkUser?.emailAddresses[0]?.emailAddress ?? ""} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <p className="text-xs text-muted-foreground">Manage your profile at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Clerk Dashboard</a></p>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                        <PrefToggle type="ORDER_CONFIRMED" label="Order confirmations" defaultChecked={true} />
                        <PrefToggle type="ORDER_SHIPPED" label="Shipping updates" defaultChecked={true} />
                        <PrefToggle type="ORDER_DELIVERED" label="Delivery confirmations" defaultChecked={true} />
                        <PrefToggle type="ORDER_CANCELLED" label="Cancellation alerts" defaultChecked={true} />
                        <PrefToggle type="LOW_STOCK" label="Low stock alerts" defaultChecked={false} />
                        <PrefToggle type="PROMOTION" label="Promotions & offers" defaultChecked={false} />
                    </div>
                </div>
            </div>
        </AccountShell>
    );
}

async function PrefToggle({ type, label, defaultChecked }: { type: string; label: string; defaultChecked: boolean }) {
    "use client";
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            <button
                type="button"
                data-pref-type={type}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${defaultChecked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${defaultChecked ? "translate-x-6" : "translate-x-1"}`} />
            </button>
        </div>
    );
}
