"use client";

import { ModeToggler } from "@/components/ModeToggler";
import { UserButton } from "@clerk/nextjs";

export default function HomeClient() {


    return (
        <div className="p-5">
            <div className="w-100 flex gap-x-5 justify-end">
                <UserButton />
                <ModeToggler />
            </div>
        </div>
    );
}