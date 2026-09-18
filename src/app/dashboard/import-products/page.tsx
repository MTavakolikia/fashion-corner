"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MagicCard } from '@/components/magicui/magic-card';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

export default function ImportProductsPage() {
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<string>('');

    const handleImport = async () => {
        setImporting(true);
        setResult('');
        try {
            const res = await fetch('/api/import-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([]),
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data.message);
                toast.success(data.message);
            } else {
                const err = await res.json();
                setResult(err.error || 'Import failed');
                toast.error('Import failed');
            }
        } catch {
            setResult('Network error');
            toast.error('Network error');
        }
        setImporting(false);
    };

    return (
        <DashboardShell title="Import Products">
            <MagicCard
                mode="gradient"
                gradientFrom="#ffaa40"
                gradientTo="#9c40ff"
                gradientOpacity={0.1}
                gradientSize={260}
                className="bg-card border rounded-xl p-6 max-w-2xl"
            >
                <h2 className="text-lg font-semibold mb-2">Bulk import</h2>
                <p className="text-muted-foreground mb-6">Import products from FakeStoreAPI to populate your catalog.</p>
                <ShimmerButton
                    onClick={handleImport}
                    disabled={importing}
                    className="px-6 py-3 text-sm font-semibold disabled:opacity-50"
                    shimmerColor="#ffaa40"
                    background="rgba(156, 64, 255, 1)"
                >
                    {importing ? 'Importing...' : 'Import Products'}
                </ShimmerButton>
                {result && <p className="mt-4 text-sm text-muted-foreground">{result}</p>}
            </MagicCard>
        </DashboardShell>
    );
}
