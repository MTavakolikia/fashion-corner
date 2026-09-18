import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCategoriesPage() {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categories</h2>
                <AddCategoryButton />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Products</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {categories.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
                                <td className="px-4 py-3 text-right">{c._count.products}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AddCategoryButton() {
    return (
        <form action="/api/admin/categories" method="POST" className="flex gap-2">
            <input name="name" required maxLength={100} placeholder="Category name" className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Add</button>
        </form>
    );
}
