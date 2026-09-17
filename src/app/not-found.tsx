"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    const router = useRouter();
    useEffect(() => { router.refresh(); }, [router]);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">404</p>
            <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <Button size="lg">Back to Home</Button>
                </Link>
                <Button size="lg" variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        </div>
    );
}
