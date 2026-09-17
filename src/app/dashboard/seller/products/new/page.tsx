import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SellerProductsNewPage() {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });
    const [categories, brands] = await Promise.all([
        prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
        prisma.brand.findMany({ select: { id: true, name: true, slug: true } }),
    ]);

    return (
        <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add New Product</h2>
            <form action="/api/seller/products" method="POST" className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Title *" name="title" placeholder="Product title" required />
                    <FormField label="Brand" name="brand" placeholder="e.g. Nike" />
                </div>
                <FormField label="Category *" name="category" placeholder="e.g. Men">
                    <select name="categoryId" className="hidden" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Price *" name="price" type="number" step="0.01" placeholder="0.00" required />
                    <FormField label="Compare at Price" name="compareAtPrice" type="number" step="0.01" placeholder="0.00" />
                </div>
                <FormField label="Description *" name="description" textarea rows={4} placeholder="Product description..." required />
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="SKU" name="sku" placeholder="e.g. NK-WHT-001" />
                    <FormField label="Stock *" name="stock" type="number" placeholder="0" required />
                </div>
                <FormField label="Images (JSON array of URLs)" name="images" textarea rows={2} placeholder='["https://..."]' />
                <div className="flex gap-3 pt-4">
                    <button name="status" value="DRAFT" type="submit" className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Save as Draft</button>
                    <button name="status" value="PUBLISHED" type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Publish</button>
                    <Link href="/dashboard/seller/products" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
                </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">This is a simplified form. For full variant support and image upload, use the API directly or expand this form.</p>
        </div>
    );
}

function FormField({ label, name, type = "text", placeholder, required, textarea, rows, children }: any) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {textarea ? (
                <textarea id={name} name={name} placeholder={placeholder} required={required} rows={rows} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-y" />
            ) : (
                <>
                    <input id={name} name={name} type={type} placeholder={placeholder} required={required} step={type === "number" ? "0.01" : undefined} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
                    {children}
                </>
            )}
        </div>
    );
}
