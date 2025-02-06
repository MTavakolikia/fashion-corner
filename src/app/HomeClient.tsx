"use client";

import { ModeToggler } from "@/components/ModeToggler";
import { UserButton } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HomeClient({ userId }: { userId: string | null }) {
    useEffect(() => {
        if (userId) {
            fetch("/api/auth/register", { method: "POST" })
                .catch((error) => console.error("Error syncing user:", error));
        }
    }, [userId]);

    return (
        <div className="p-5">
            <div className="w-100 flex gap-x-5 justify-end">
                <UserButton />
                <ModeToggler />
            </div>
        </div>
    );
}
