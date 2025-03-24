import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
                <nav className="space-y-2">
                    <Link
                        href="/dashboard"
                        className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/products"
                        className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        Products
                    </Link>
                    <Link
                        href="/dashboard/import-products"
                        className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        Import Products
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                {children}
            </main>
        </div>
    );
}
