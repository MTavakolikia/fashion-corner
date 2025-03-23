import { UserButton } from "@clerk/nextjs"
import { ModeToggler } from "../../ModeToggler"
import { Navigation } from "./Navigation"
import Image from "next/image"
import Link from "next/link"

function Navbar() {
    return (
        <header className="px-5 flex justify-between  border-b py-4 fixed w-full z-50 bg-black/50 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-x-2">
                <Image src="/images/fashion-corner.png" alt="logo" width={33} height={30} />
                <span className="text-white">Fashion Corner</span>
            </Link>

            <div className="flex gap-x-6 justify-end">
                <Navigation />
                <div className="flex gap-x-2 ms-3">
                    <UserButton />
                    <ModeToggler />
                </div>

            </div>
        </header>
    )
}

export default Navbar