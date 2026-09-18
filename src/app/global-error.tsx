"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError() {
    const router = useRouter();
    useEffect(() => { router.refresh(); }, [router]);
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                    <p className="text-sm font-medium text-destructive uppercase tracking-widest mb-4">Error</p>
                    <h1 className="text-5xl font-bold mb-4">Something Went Wrong</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        We encountered an unexpected error. Please try again later.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/">
                            <Button size="lg">Back to Home</Button>
                        </Link>
                        <Button size="lg" variant="outline" onClick={() => router.push("/")} >
                            Refresh
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
