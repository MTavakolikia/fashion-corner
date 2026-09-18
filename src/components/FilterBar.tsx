'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface FilterBarProps {
    categories: { category: string }[];
}

export function FilterBar({ categories }: FilterBarProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const updateUrl = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        }
        router.push(`/products?${params.toString()}`);
    }, [searchParams, router]);

    const handleClear = useCallback(() => {
        router.push('/products');
    }, [router]);

    const hasActiveFilters = searchParams.get('q') || searchParams.get('category');

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <form method="GET" action="/products" className="flex gap-2 flex-1 min-w-[220px] max-w-sm">
                <input
                    name="q"
                    defaultValue={searchParams.get('q') || ''}
                    placeholder="Search products..."
                    className="px-3 py-1.5 border rounded-md text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                    Search
                </button>
            </form>

            <select
                name="category"
                value={searchParams.get('category') || ''}
                onChange={e => updateUrl({ category: e.target.value })}
                className="px-3 py-1.5 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[160px]"
            >
                <option value="">All Categories</option>
                {categories.map(c => (
                    <option key={c.category} value={c.category}>{c.category}</option>
                ))}
            </select>

            <select
                name="sort"
                value={searchParams.get('sort') || ''}
                onChange={e => updateUrl({ sort: e.target.value })}
                className="px-3 py-1.5 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[160px]"
            >
                <option value="">Latest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
            </select>

            {hasActiveFilters && (
                <button
                    onClick={handleClear}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
