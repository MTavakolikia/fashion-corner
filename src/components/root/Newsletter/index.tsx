"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Newsletter() {
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement newsletter subscription
        console.log("Subscribe:", email)
        setEmail("")
    }

    return (
        <section className="w-full bg-gray-50 dark:bg-gray-900/50">
            <div className="w-full max-w-7xl mx-auto px-4 py-16">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold">Subscribe to Our Newsletter</h2>
                    <p className="text-muted-foreground">
                        Stay updated with our latest trends, fashion tips and exclusive offers.
                    </p>
                    <form onSubmit={handleSubmit} className="flex gap-4 mt-8 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1"
                        />
                        <Button type="submit">Subscribe</Button>
                    </form>
                    <p className="text-sm text-muted-foreground mt-4">
                        By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                    </p>
                </div>
            </div>
        </section>
    )
} 