"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useCart } from "@/contexts/CartContext"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function BasketButton() {
    const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

    return (
        <Sheet>
            <SheetTrigger asChild>

                <Button variant="outline" size="icon"> <span className="relative">
                    <ShoppingCart />
                    <span className="absolute -top-4 -right-4 rounded-full p-0 bg-purple-500 w-5 h-5">1</span>
                </span>
                </Button>

            </SheetTrigger>
            <SheetContent side={"left"}>
                <SheetHeader>
                    <SheetTitle>Your Basket</SheetTitle>
                    <SheetDescription>
                        If you are ready let&lsquo;s continue
                    </SheetDescription>
                </SheetHeader>
                {items.length === 0 ?
                    <div className="container mx-auto px-4 py-16 text-center">
                        <h1 className="text-3xl font-bold mb-8">Your Cart is Empty</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Looks like you haven&apos;t added any items to your cart yet.
                        </p>
                        <Link href="/dashboard/products">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                    :

                    <></>}

                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Go To Basket</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
