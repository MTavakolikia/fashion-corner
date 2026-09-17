import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminSettingsPage() {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const settingsRes = await fetch("/api/admin/settings", { cache: "no-store" });
    const settingsData = await settingsRes.json();
    const settings = settingsData.success ? settingsData.data.settings : {};

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Settings</h2>
            <form action="/api/admin/settings" method="POST" className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                <SettingField name="storeName" label="Store Name" defaultValue={settings.storeName ?? "Fashion Corner"} />
                <SettingField name="currency" label="Currency" defaultValue={settings.currency ?? "USD"} />
                <SettingField name="taxRate" label="Default Tax Rate (%)" type="number" step="0.01" defaultValue={settings.taxRate ?? "0"} />
                <SettingField name="freeShippingThreshold" label="Free Shipping Threshold ($)" type="number" step="0.01" defaultValue={settings.freeShippingThreshold ?? "50"} />
                <SettingField name="maintenanceMode" label="Maintenance Mode" defaultValue={settings.maintenanceMode ?? "false"} isBoolean />
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Save Settings</button>
            </form>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    ⚠️ Changing the maintenance mode will take the storefront offline. Use with caution.
                </p>
            </div>
        </div>
    );
}

function SettingField({ name, label, type = "text", step, defaultValue, isBoolean }: any) {
    if (isBoolean) {
        return (
            <div className="flex items-center justify-between">
                <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <select name={name} defaultValue={defaultValue} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="false">Off</option>
                    <option value="true">On</option>
                </select>
            </div>
        );
    }
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input id={name} name={name} type={type} step={step} defaultValue={defaultValue} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg白色 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
    );
}
