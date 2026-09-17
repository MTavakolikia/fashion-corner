"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import Image from "next/image";
import type { CartItem } from "@/contexts/CartContext";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

interface CheckoutFlowProps {
    initialStep: string;
    savedAddresses: { id: string; fullName: string; address: string; city: string; state: string; zipCode: string; phone: string; isDefault: boolean }[];
    defaultAddressId?: string;
    userId: string;
    userEmail: string;
    userName?: string;
}

type Step = "cart" | "address" | "payment" | "review" | "confirmation";

export default function CheckoutFlow({
    initialStep,
    savedAddresses,
    defaultAddressId,
    userId,
    userEmail,
    userName,
}: CheckoutFlowProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<Step>(initialStep as Step || "cart");
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddressId ?? "");
    const [newAddress, setNewAddress] = useState({
        fullName: userName ?? "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
    });
    const [payMethod, setPayMethod] = useState("cod");
    const [orderNote, setOrderNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number; status: string } | null>(null);
    const [addressError, setAddressError] = useState("");
    const [newAddrError, setNewAddrError] = useState("");
    const [showAddAddress, setShowAddAddress] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("cart");
            // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate cart from localStorage after mount
            setItems(saved ? JSON.parse(saved) : []);
        } catch {
            setItems([]);
        }
        setLoading(false);
    }, []);

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingCost = totalPrice >= 50 ? 0 : 5.99;
    const grandTotal = totalPrice + shippingCost;

    const updateUrl = useCallback((s: Step) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", s);
        router.replace(`/checkout?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const gotoStep = useCallback((s: Step) => {
        setStep(s);
        updateUrl(s);
    }, [updateUrl]);

    // Sync step from URL
    useEffect(() => {
        const s = searchParams.get("step") as Step;
        if (s && ["cart", "address", "payment", "review"].includes(s)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sync step with URL search param
            setStep(s);
        }
    }, [searchParams]);

    const handleAddNewAddress = async () => {
        const required: Record<string, string> = {};
        if (!newAddress.fullName.trim()) required.fullName = "Full name is required";
        if (!newAddress.address.trim()) required.address = "Address is required";
        if (!newAddress.city.trim()) required.city = "City is required";
        if (!newAddress.state.trim()) required.state = "State is required";
        if (!newAddress.zipCode.trim()) required.zipCode = "ZIP code is required";
        if (!newAddress.phone.trim()) required.phone = "Phone is required";

        if (Object.keys(required).length > 0) {
            setNewAddrError(Object.values(required)[0]!);
            return;
        }

        setNewAddrError("");
        try {
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newAddress, isDefault: true }),
            });
            const data = await res.json();
            if (!res.ok) {
                setNewAddrError(data.message ?? "Failed to save address");
                return;
            }
            setShowAddAddress(false);
            setSelectedAddressId(data.data?.id ?? "");
        } catch {
            setNewAddrError("Network error. Please try again.");
        }
    };

    const handlePlaceOrder = async () => {
        setSubmitting(true);
        setAddressError("");

        const address = savedAddresses.find(a => a.id === selectedAddressId);
        if (!address) {
            setAddressError("Please select a shipping address.");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientOrderId: `order_${crypto.randomUUID()}`,
                    items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                    shippingAddress: {
                        fullName: address.fullName,
                        address: address.address,
                        city: address.city,
                        state: address.state,
                        zipCode: address.zipCode,
                        phone: address.phone,
                    },
                    notes: orderNote || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setAddressError(data.message ?? "Failed to place order. Please try again.");
                setSubmitting(false);
                return;
            }

            // Clear cart from localStorage
            localStorage.removeItem("cart");

            setPlacedOrder(data.data ?? { id: `order_${Date.now()}`, total: grandTotal, status: "PENDING" });
            gotoStep("confirmation");
        } catch {
            setAddressError("Network error. Please check your connection and try again.");
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Progress Header */}
            <div className="bg-card border-b sticky top-16 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to cart
                    </Link>
                    <div className="flex items-center gap-0">
                        {(["cart", "address", "payment", "review"] as Step[]).map((s, i) => {
                            const order = ["cart", "address", "payment", "review"];
                            const idx = order.indexOf(s);
                            const currentIdx = order.indexOf(step);
                            const isActive = idx <= currentIdx;
                            const isCurrent = s === step;
                            return (
                                <div key={s} className="flex items-center flex-1 last:flex-none">
                                    <button
                                        onClick={() => { if (isActive) gotoStep(s); }}
                                        disabled={!isActive}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                            isCurrent ? "text-primary bg-primary/10" :
                                            isActive ? "text-foreground hover:bg-muted cursor-pointer" :
                                            "text-muted-foreground/50 cursor-not-allowed"
                                        }`}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                            isCurrent ? "bg-primary text-primary-foreground" :
                                            isActive ? "bg-primary/20 text-primary" :
                                            "bg-muted text-muted-foreground"
                                        }`}>{i + 1}</span>
                                        <span className="hidden sm:inline capitalize">{s}</span>
                                    </button>
                                    {i < 3 && <div className={`flex-1 h-px mx-1 ${idx < currentIdx ? "bg-primary" : "bg-muted"}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {step === "cart" && (
                    <CartStep
                        items={items}
                        totalItems={totalItems}
                        totalPrice={totalPrice}
                        shippingCost={shippingCost}
                        grandTotal={grandTotal}
                        onProceed={() => gotoStep("address")}
                        onBack={() => router.push("/cart")}
                    />
                )}

                {step === "address" && (
                    <AddressStep
                        savedAddresses={savedAddresses}
                        defaultAddressId={selectedAddressId}
                        onSelect={setSelectedAddressId}
                        showAddAddress={showAddAddress}
                        onToggleAdd={() => setShowAddAddress(v => !v)}
                        newAddress={newAddress}
                        onAddressChange={(field, value) => setNewAddress(prev => ({ ...prev, [field]: value }))}
                        onAddNew={handleAddNewAddress}
                        addressError={addressError}
                        newAddrError={newAddrError}
                        onNext={() => gotoStep("payment")}
                        onBack={() => gotoStep("cart")}
                    />
                )}

                {step === "payment" && (
                    <PaymentStep
                        payMethod={payMethod}
                        onPayMethodChange={setPayMethod}
                        onNext={() => gotoStep("review")}
                        onBack={() => gotoStep("address")}
                    />
                )}

                {step === "review" && (
                    <ReviewStep
                        items={items}
                        totalPrice={totalPrice}
                        shippingCost={shippingCost}
                        grandTotal={grandTotal}
                        selectedAddress={savedAddresses.find(a => a.id === selectedAddressId)}
                        payMethod={payMethod}
                        orderNote={orderNote}
                        onNoteChange={setOrderNote}
                        onSubmit={handlePlaceOrder}
                        submitting={submitting}
                        error={addressError}
                        onBack={() => gotoStep("payment")}
                    />
                )}

                {step === "confirmation" && placedOrder && (
                    <ConfirmationStep order={placedOrder} grandTotal={grandTotal} />
                )}

                {step === "confirmation" && !placedOrder && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground mb-4">Something went wrong. Please try again.</p>
                        <Link href="/products" className="text-primary hover:underline">Continue Shopping</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Sub-steps ─────────────────────────────────────────── */

function CartStep({ items, totalItems, totalPrice, shippingCost, grandTotal, onProceed, onBack }: {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    shippingCost: number;
    grandTotal: number;
    onProceed: () => void;
    onBack: () => void;
}) {
    const updateQty = (id: string, qty: number) => {
        const saved = JSON.parse(localStorage.getItem("cart") ?? "[]") as CartItem[];
        const updated = saved.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i).filter(i => i.quantity > 0);
        localStorage.setItem("cart", JSON.stringify(updated));
        window.location.reload();
    };
    const removeItem = (id: string) => {
        const saved = JSON.parse(localStorage.getItem("cart") ?? "[]") as CartItem[];
        localStorage.setItem("cart", JSON.stringify(saved.filter(i => i.id !== id)));
        window.location.reload();
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6 text-sm">Add some products before checking out.</p>
                <button onClick={onBack} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
                <h2 className="text-lg font-semibold mb-4">Your Cart ({totalItems} item{totalItems !== 1 ? "s" : ""})</h2>
                {items.map(item => (
                    <div key={item.id} className="flex gap-4 bg-card border rounded-lg p-4">
                        <div className="relative w-20 h-20 shrink-0">
                            <Image src={item.image} alt={item.title} fill className="object-cover rounded-md" sizes="80px" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <Link href={`/products/${item.id}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block">{item.title}</Link>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1 border rounded-md">
                                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 hover:bg-muted rounded-l-md transition-colors"><Minus className="w-3 h-3" /></button>
                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 hover:bg-muted rounded-r-md transition-colors"><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="lg:col-span-1">
                <MagicCard
                    mode="gradient"
                    gradientFrom="#ffaa40"
                    gradientTo="#9c40ff"
                    gradientOpacity={0.1}
                    gradientSize={260}
                    className="bg-card border rounded-lg p-5 sticky top-24"
                >
                    <h3 className="font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between text-muted-foreground"><span>Subtotal ({totalItems})</span><span>${totalPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className={shippingCost === 0 ? "text-green-600 dark:text-green-400" : ""}>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
                        {shippingCost > 0 && <p className="text-xs text-muted-foreground">Free shipping on orders over $50</p>}
                        <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                    </div>
                    <ShimmerButton
                        onClick={onProceed}
                        className="w-full py-2.5 text-sm font-medium"
                        shimmerColor="#ffaa40"
                        background="rgba(156, 64, 255, 1)"
                    >
                        Proceed to Shipping
                    </ShimmerButton>
                    <button onClick={onBack} className="block w-full text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to Cart
                    </button>
                </MagicCard>
            </div>
        </div>
    );
}

function AddressStep({ savedAddresses, defaultAddressId, onSelect, showAddAddress, onToggleAdd, newAddress, onAddressChange, onAddNew, addressError, newAddrError, onNext, onBack }: {
    savedAddresses: { id: string; fullName: string; address: string; city: string; state: string; zipCode: string; phone: string; isDefault: boolean }[];
    defaultAddressId: string;
    onSelect: (id: string) => void;
    showAddAddress: boolean;
    onToggleAdd: () => void;
    newAddress: { fullName: string; address: string; city: string; state: string; zipCode: string; phone: string };
    onAddressChange: (f: string, v: string) => void;
    onAddNew: () => void;
    addressError: string;
    newAddrError: string;
    onNext: () => void;
    onBack: () => void;
}) {
    return (
        <div className="max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            {addressError && <p className="text-sm text-destructive mb-3 bg-destructive/10 rounded-md px-3 py-2">{addressError}</p>}

            {savedAddresses.length > 0 && (
                <div className="space-y-2 mb-4">
                    {savedAddresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${addr.id === defaultAddressId ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                            <input type="radio" name="address" value={addr.id} checked={defaultAddressId === addr.id} onChange={() => onSelect(addr.id)} className="mt-1" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{addr.fullName}</span>
                                    {addr.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Default</span>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{addr.address}, {addr.city}, {addr.state} {addr.zipCode}</p>
                                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                            </div>
                        </label>
                    ))}
                </div>
            )}

            {!showAddAddress ? (
                <button onClick={onToggleAdd} className="text-sm text-primary hover:underline mb-4">+ Add new address</button>
            ) : (
                <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
                    <h3 className="font-medium text-sm">New Address</h3>
                    {newAddrError && <p className="text-sm text-destructive">{newAddrError}</p>}
                    <input placeholder="Full Name" value={newAddress.fullName} onChange={e => onAddressChange("fullName", e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-background" />
                    <input placeholder="Address" value={newAddress.address} onChange={e => onAddressChange("address", e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-background" />
                    <div className="grid grid-cols-2 gap-2">
                        <input placeholder="City" value={newAddress.city} onChange={e => onAddressChange("city", e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-background" />
                        <input placeholder="State" value={newAddress.state} onChange={e => onAddressChange("state", e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-background" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input placeholder="ZIP Code" value={newAddress.zipCode} onChange={e => onAddressChange("zipCode", e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-background" />
                        <input placeholder="Phone" value={newAddress.phone} onChange={e => onAddressChange("phone", e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-background" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onAddNew} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">Save & Use</button>
                        <button onClick={onToggleAdd} className="px-3 py-1.5 border rounded-md text-sm hover:bg-muted">Cancel</button>
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button onClick={onBack} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Back</button>
                <ShimmerButton
                    onClick={onNext}
                    disabled={!defaultAddressId}
                    className="px-5 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    shimmerColor="#ffaa40"
                    background="rgba(156, 64, 255, 1)"
                >
                    Continue to Payment
                </ShimmerButton>
            </div>
        </div>
    );
}

function PaymentStep({ payMethod, onPayMethodChange, onNext, onBack }: {
    payMethod: string;
    onPayMethodChange: (v: string) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const methods = [
        { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order" },
        { id: "card", label: "Credit / Debit Card", desc: "Coming soon — placeholder for Stripe integration" },
        { id: "paypal", label: "PayPal", desc: "Coming soon — placeholder for PayPal integration" },
    ];

    return (
        <div className="max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3 mb-6">
                {methods.map(m => (
                    <label key={m.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${payMethod === m.id ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                        <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => onPayMethodChange(m.id)} className="mt-1" />
                        <div>
                            <p className="font-medium text-sm">{m.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
            {payMethod !== "cod" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4 text-xs text-yellow-800 dark:text-yellow-300">
                    Note: Only Cash on Delivery is available in the current version. Card and PayPal integrations are coming soon.
                </div>
            )}
            <div className="flex gap-3">
                <button onClick={onBack} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Back</button>
                <ShimmerButton
                    onClick={onNext}
                    className="px-5 py-2.5 text-sm font-medium"
                    shimmerColor="#ffaa40"
                    background="rgba(156, 64, 255, 1)"
                >
                    Continue to Review
                </ShimmerButton>
            </div>
        </div>
    );
}

function ReviewStep({ items, totalPrice, shippingCost, grandTotal, selectedAddress, payMethod, orderNote, onNoteChange, onSubmit, submitting, error, onBack }: {
    items: CartItem[];
    totalPrice: number;
    shippingCost: number;
    grandTotal: number;
    selectedAddress: { fullName: string; address: string; city: string; state: string; zipCode: string; phone: string } | undefined;
    payMethod: string;
    orderNote: string;
    onNoteChange: (v: string) => void;
    onSubmit: () => void;
    submitting: boolean;
    error: string;
    onBack: () => void;
}) {
    const methodLabel = payMethod === "cod" ? "Cash on Delivery" : payMethod === "card" ? "Credit / Debit Card" : "PayPal";

    return (
        <div className="max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">Review Your Order</h2>
            {error && <p className="text-sm text-destructive mb-3 bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

            <div className="space-y-4 mb-6">
                {/* Items */}
                <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium text-sm mb-3">Items ({items.length})</h3>
                    <div className="space-y-2">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground truncate mr-2">{item.title} × {item.quantity}</span>
                                <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping */}
                {selectedAddress && (
                    <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-medium text-sm mb-2">Shipping Address</h3>
                        <p className="text-sm text-muted-foreground">{selectedAddress.fullName}</p>
                        <p className="text-sm text-muted-foreground">{selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
                        <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
                    </div>
                )}

                {/* Payment */}
                <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium text-sm mb-1">Payment</h3>
                    <p className="text-sm text-muted-foreground">{methodLabel}</p>
                </div>

                {/* Totals */}
                <div className="bg-card border rounded-lg p-4 space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className={shippingCost === 0 ? "text-green-600 dark:text-green-400" : ""}>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
                    <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                </div>

                {/* Note */}
                <div>
                    <label className="text-sm font-medium block mb-1">Order note (optional)</label>
                    <textarea value={orderNote} onChange={e => onNoteChange(e.target.value)} rows={2} placeholder="Any special instructions..." className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-none" />
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Back</button>
                <ShimmerButton
                    onClick={onSubmit}
                    disabled={submitting}
                    className="flex-1 py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    shimmerColor="#4ade80"
                    background="rgba(22, 163, 74, 1)"
                >
                    {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                    ) : (
                        <>Place Order — ${grandTotal.toFixed(2)}</>
                    )}
                </ShimmerButton>
            </div>
        </div>
    );
}

function ConfirmationStep({ order, grandTotal }: { order: { id: string; total: number; status: string }; grandTotal: number }) {
    const router = useRouter();

    return (
        <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
                <AnimatedGradientText colorFrom="#22c55e" colorTo="#9c40ff" speed={1.5}>
                    Order Placed!
                </AnimatedGradientText>
            </h1>
            <p className="text-muted-foreground mb-1">
                <AnimatedShinyText className="mx-0 max-w-none">Thank you for your purchase.</AnimatedShinyText>
            </p>
            <p className="text-sm text-muted-foreground mb-6">Order ID: <span className="font-mono font-medium text-foreground">{order.id}</span></p>

            <MagicCard
                mode="gradient"
                gradientFrom="#22c55e"
                gradientTo="#9c40ff"
                gradientOpacity={0.08}
                gradientSize={220}
                className="bg-card border rounded-lg p-4 mb-6 text-left space-y-1 text-sm"
            >
                <div className="flex justify-between"><span className="text-muted-foreground">Amount paid</span><span className="font-semibold">${grandTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{order.status?.toLowerCase().replace("_", " ")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated delivery</span><span className="font-medium">5–7 business days</span></div>
            </MagicCard>

            <div className="flex flex-col sm:flex-row gap-3">
                <RainbowButton
                    onClick={() => router.push("/account/orders")}
                    className="flex-1 py-2.5 text-sm font-medium"
                >
                    View My Orders
                </RainbowButton>
                <button onClick={() => router.push("/products")} className="flex-1 py-2.5 border rounded-md text-sm font-medium hover:bg-muted">
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}
