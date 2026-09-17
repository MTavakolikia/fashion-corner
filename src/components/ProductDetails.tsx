"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
    Star, ChevronLeft, ChevronRight, Heart, ShoppingCart,
    Minus, Plus, Truck, ShieldCheck, RotateCcw, ArrowRight,
    X, Ruler, Info, Check, Scissors, ZoomIn, ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductImages, getProductSeed, getFallbackImage } from "@/lib/product-images";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import { ReviewForm } from "./ReviewForm";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { MagicCard } from "@/components/magicui/magic-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

/* ─────────────────────────────────────────────
   LIGHTBOX MODAL
──────────────────────────────────────────── */

function Lightbox({ images, initialIndex, onClose }: {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}) {
    const [index, setIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    const goNext = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length]);
    const goPrev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "+" || e.key === "=") setZoom(z => Math.min(4, z + 0.5));
            if (e.key === "-") setZoom(z => Math.max(1, z - 0.5));
            if (e.key === "0") { setZoom(1); setPos({ x: 0, y: 0 }); }
        };
        window.addEventListener("keydown", handler);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [onClose, goNext, goPrev]);

    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        if (Math.abs(dx) > 50) { dx > 0 ? goPrev() : goNext(); }
        touchStart.current = null;
    };

    const currentImg = images[index] ?? getFallbackImage();

    return (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95">
            <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">{index + 1} / {images.length}</span>
                    {zoom > 1 && <span className="text-white/40 text-xs bg-white/10 px-2 py-0.5 rounded-full">{Math.round(zoom * 100)}%</span>}
                </div>
                <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div
                className="flex-1 flex items-center justify-center relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={imgRef}
                    className="transition-transform duration-100 ease-out"
                    style={{
                        transform: `scale(${zoom}) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`,
                        cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
                    }}
                    onMouseDown={(e) => { if (zoom > 1) setIsPanning(true); }}
                    onMouseMove={(e) => { if (isPanning && zoom > 1) setPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY })); }}
                    onMouseUp={() => setIsPanning(false)}
                    onMouseLeave={() => setIsPanning(false)}
                >
                    <img
                        src={currentImg}
                        alt={`Product image ${index + 1}`}
                        className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl"
                        draggable={false}
                    />
                </div>

                {images.length > 1 && (
                    <>
                        <button onClick={goPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110">
                            <ChevronLeft className="w-7 h-7" />
                        </button>
                        <button onClick={goNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110">
                            <ChevronRight className="w-7 h-7" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex items-center gap-2 px-6 py-3 bg-black/50 overflow-x-auto scrollbar-hide">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => { setIndex(i); setZoom(1); setPos({ x: 0, y: 0 }); }}
                            className={cn(
                                "relative w-16 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all opacity-60 hover:opacity-100",
                                i === index ? "border-white opacity-100 ring-2 ring-white/50" : ""
                            )}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-center gap-2 pb-4">
                <button onClick={() => { setZoom(1); setPos({ x: 0, y: 0 }); }}
                    className="px-3 py-1.5 text-xs text-white/60 hover:text-white bg-white/10 rounded-full transition-colors">Reset</button>
                <button onClick={() => setZoom(z => Math.max(1, z - 0.5))}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-white/40 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(4, z + 0.5))}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
                <span className="text-white/30 text-xs ml-3">Arrows to navigate · Esc to close</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SIZE GUIDE DATA
──────────────────────────────────────────── */

const SIZE_GUIDES: Record<string, { label: string; sizes: { size: string; chest: string; waist: string; hips: string }[] }> = {
    womens: { label: "Women's Clothing", sizes: [
        { size: "XS", chest: "31–33\"", waist: "23–25\"", hips: "33–35\"" },
        { size: "S", chest: "34–35\"", waist: "26–27\"", hips: "36–37\"" },
        { size: "M", chest: "36–38\"", waist: "28–30\"", hips: "38–40\"" },
        { size: "L", chest: "39–41\"", waist: "31–33\"", hips: "41–43\"" },
        { size: "XL", chest: "42–44\"", waist: "34–36\"", hips: "44–46\"" },
        { size: "XXL", chest: "45–47\"", waist: "37–39\"", hips: "47–49\"" },
    ]},
    mens: { label: "Men's Clothing", sizes: [
        { size: "S", chest: "36–38\"", waist: "29–31\"", hips: "37–39\"" },
        { size: "M", chest: "39–41\"", waist: "32–34\"", hips: "40–42\"" },
        { size: "L", chest: "42–44\"", waist: "35–37\"", hips: "43–45\"" },
        { size: "XL", chest: "45–47\"", waist: "38–40\"", hips: "46–48\"" },
        { size: "XXL", chest: "48–50\"", waist: "41–43\"", hips: "49–51\"" },
        { size: "XXXL", chest: "51–53\"", waist: "44–46\"", hips: "52–54\"" },
    ]},
    kids: { label: "Kids & Baby", sizes: [
        { size: "2T", chest: "20\"", waist: "17\"", hips: "21\"" },
        { size: "3T", chest: "21\"", waist: "18\"", hips: "22\"" },
        { size: "4T", chest: "22\"", waist: "19\"", hips: "23\"" },
        { size: "5", chest: "23\"", waist: "20\"", hips: "24\"" },
        { size: "6", chest: "24\"", waist: "21\"", hips: "25\"" },
        { size: "7", chest: "25\"", waist: "22\"", hips: "26\"" },
        { size: "8", chest: "26\"", waist: "23\"", hips: "27\"" },
        { size: "10", chest: "28\"", waist: "24\"", hips: "29\"" },
        { size: "12", chest: "30\"", waist: "25\"", hips: "31\"" },
        { size: "14", chest: "32\"", waist: "27\"", hips: "33\"" },
    ]},
    shoes: { label: "Shoe Size Chart", sizes: [
        { size: "US 5", chest: "22.5 cm", waist: "", hips: "" },
        { size: "US 6", chest: "23 cm", waist: "", hips: "" },
        { size: "US 7", chest: "23.5 cm", waist: "", hips: "" },
        { size: "US 8", chest: "24 cm", waist: "", hips: "" },
        { size: "US 9", chest: "25 cm", waist: "", hips: "" },
        { size: "US 10", chest: "26 cm", waist: "", hips: "" },
        { size: "US 11", chest: "27 cm", waist: "", hips: "" },
        { size: "US 12", chest: "28 cm", waist: "", hips: "" },
        { size: "US 13", chest: "29 cm", waist: "", hips: "" },
    ]},
};

function getSizeGuideKey(category: string): string {
    if (category === "mens") return "mens";
    if (category.startsWith("kids")) return "kids";
    if (category === "shoes") return "shoes";
    return "womens";
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────── */

interface ProductDetailsProps {
    product: {
        id: string; title: string; price: number; image: string; category: string;
        rating: number; ratingCount: number; description: string;
        slug?: string; brand?: string; stock?: number;
        compareAtPrice?: number | null; specifications?: Record<string, string>;
        tags?: string; sku?: string;
        variants?: Array<{ id: string; size: string | null; color: string | null; price: number; stock: number; sku: string; image?: string }>;
        _count?: { reviews: number }; views?: number;
        images?: string | null;
    };
    relatedProducts?: Array<{ id: string; title: string; slug: string; price: number; compareAtPrice?: number | null; image: string; mainImage: string; rating: number }>;
    reviews?: Array<{ id: string; userId: string; rating: number; comment: string; verified: boolean; createdAt: Date; updatedAt: Date; user?: { name: string; picture: string } }>;
}

export function ProductDetails({ product, relatedProducts = [], reviews: serverReviews = [] }: ProductDetailsProps) {
    const [activeImage, setActiveImage] = useState(0);
    const [localReviews, setLocalReviews] = useState(serverReviews);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [qty, setQty] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Build gallery from DB images first, then fall back to generated LoremFlickr URLs
    const dbImages: string[] = product.images ? (() => { try { return JSON.parse(product.images).filter(Boolean) as string[]; } catch { return []; } })() : [];
    const fallbackImages = getProductImages(product.category, getProductSeed(product.id));
    const galleryImages = dbImages.length >= 2 ? dbImages : fallbackImages;
    const mainFallback = product.image || fallbackImages[0] || getFallbackImage();

    const fetchReviews = useCallback(async () => {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setLocalReviews(data.data);
    }, [product.id]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch updates reviews after resolution
        void fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (lightboxOpen) return;
            if (e.key === "ArrowLeft") setActiveImage(p => Math.max(0, p - 1));
            if (e.key === "ArrowRight") setActiveImage(p => Math.min(galleryImages.length - 1, p + 1));
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [galleryImages.length, lightboxOpen]);

    const sizeGuideKey = getSizeGuideKey(product.category);
    const sizeGuide = SIZE_GUIDES[sizeGuideKey] ?? SIZE_GUIDES.womens;

    const variantColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) as string[])];
    const variantSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) as string[])];
    const allSizes = variantSizes.length > 0 ? variantSizes : ["XS", "S", "M", "L", "XL", "XXL"].slice(0, 5);
    const allColors = variantColors.length > 0 ? variantColors : ["Black", "White", "Navy", "Beige"];
    const colorHexes: Record<string, string> = {
        Black: "#1a1a2e", White: "#f5f5f5", Navy: "#1e3a5f", Beige: "#d4b896",
        Red: "#c0392b", Blue: "#2980b9", Green: "#27ae60", Pink: "#e91e8c",
        Gray: "#6c757d", Brown: "#6f4e37", Burgundy: "#722f37", Olive: "#556b2f",
        Cream: "#fffdd0", Khaki: "#c3b091", Coral: "#ff7f50", Mint: "#98ff98",
        Lavender: "#e6e6fa", Mustard: "#dda606", Teal: "#008080", Charcoal: "#36454f",
    };
    const colorName = selectedColor || (allColors[0] ?? "");
    const colorHex = colorHexes[colorName] ?? "#6b7280";
    const selectedVariant = product.variants?.find(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor));
    const displayPrice = selectedVariant?.price ?? product.price;
    const displayStock = selectedVariant?.stock ?? product.stock;
    const displayCompare = selectedVariant ? (displayPrice < (product.compareAtPrice ?? Infinity) ? product.compareAtPrice : null) : product.compareAtPrice;

    const addToCart = () => {
        const cartItem = { id: product.id, title: product.title, price: displayPrice, image: galleryImages[activeImage] || mainFallback, category: product.category, ...(selectedSize ? { size: selectedSize } : {}), ...(selectedColor ? { color: selectedColor } : {}) };
        const existing = localStorage.getItem("cart");
        const items: any[] = existing ? JSON.parse(existing) : [];
        const found = items.find((i: any) => i.id === product.id && i.size === selectedSize && i.color === selectedColor);
        if (found) { found.quantity += qty; } else { items.push({ ...cartItem, quantity: qty }); }
        localStorage.setItem("cart", JSON.stringify(items));
    };

    const openLightbox = (idx: number) => { setLightboxIndex(idx); setLightboxOpen(true); };

    return (
        <>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                {/* ─── IMAGE GALLERY ─── */}
                <div className="space-y-3">
                    <button onClick={() => openLightbox(activeImage)}
                        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-gray-200 dark:border-gray-800 group block">
                        <BorderBeam
                            colorFrom="#ffaa40"
                            colorTo="#9c40ff"
                            duration={8}
                            size={70}
                            borderWidth={2}
                        />
                        <img
                            src={galleryImages[activeImage] || mainFallback}
                            alt={`${product.title} — view ${activeImage + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-900/90 rounded-full p-3 shadow-lg">
                                <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium pointer-events-none">
                            {activeImage + 1} / {galleryImages.length}
                        </div>
                        {galleryImages.length > 1 && activeImage > 0 && (
                            <span onClick={e => { e.stopPropagation(); setActiveImage(p => p - 1); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                                <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
                            </span>
                        )}
                        {galleryImages.length > 1 && activeImage < galleryImages.length - 1 && (
                            <span onClick={e => { e.stopPropagation(); setActiveImage(p => p + 1); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                                <ChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
                            </span>
                        )}
                    </button>

                    {galleryImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {galleryImages.map((img, i) => (
                                <button key={i} onClick={() => setActiveImage(i)}
                                    className={cn(
                                        "relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                        activeImage === i ? "border-primary ring-2 ring-primary/40" : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100"
                                    )}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── PRODUCT INFO ─── */}
                <div className="space-y-5 flex flex-col">
                    <p className="text-xs text-muted-foreground">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <span className="mx-1.5">/</span>
                        <Link href={`/categories/${product.category}`} className="hover:text-primary capitalize">{product.category}</Link>
                        <span className="mx-1.5">/</span>
                        <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
                    </p>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.title}</h1>
                        {product.brand && (
                            <Link href={`/brands/${product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors mt-1 inline-block">
                                by <span className="font-medium">{product.brand}</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {product.ratingCount > 0 ? `${product.rating.toFixed(1)} (${product.ratingCount} review${product.ratingCount !== 1 ? "s" : ""})` : "No reviews"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">· {product.views ?? 0} views</span>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <p className="text-3xl font-bold inline-flex items-center">
                            <span>$</span>
                            <NumberTicker value={displayPrice} decimalPlaces={2} className="text-3xl font-bold text-foreground" />
                        </p>
                        {displayCompare && displayCompare > displayPrice && (
                            <>
                                <span className="text-lg text-muted-foreground line-through">${displayCompare.toFixed(2)}</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                    Save ${(displayCompare - displayPrice).toFixed(2)}
                                </span>
                            </>
                        )}
                    </div>

                    {allColors.length > 1 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium">Color: <span className="text-muted-foreground font-normal">{colorName}</span></span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {allColors.map(c => (
                                    <button key={c} onClick={() => setSelectedColor(c)}
                                        className={cn("w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none", selectedColor === c ? "border-primary ring-2 ring-primary/40 scale-110" : "border-gray-200 dark:border-gray-700")}
                                        style={{ backgroundColor: colorHexes[c] ?? "#6b7280" }}
                                        aria-label={`Select ${c}`}>
                                        {selectedColor === c && <Check className="w-4 h-4 text-white mx-auto" />}
                                    </button>
                                ))}
                                <span className="text-xs text-muted-foreground ml-1 self-center">{allColors.length} colors</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Size: <span className="text-muted-foreground font-normal">{selectedSize ?? "Select a size"}</span></span>
                            <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                                <Ruler className="w-3 h-3" /> Size Guide
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allSizes.map(s => (
                                <button key={s} onClick={() => setSelectedSize(s)}
                                    disabled={(displayStock ?? 0) <= 0}
                                    className={cn("min-w-[44px] h-10 px-3 rounded-lg text-sm font-medium border-2 transition-all", selectedSize === s ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-foreground")}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center border rounded-lg">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-muted transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="w-10 text-center font-medium">{qty}</span>
                            <button onClick={() => setQty(Math.min(10, qty + 1))} className="px-3 py-2 hover:bg-muted transition-colors"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <p className={cn("text-sm font-medium", (displayStock ?? 0) > 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                        {(displayStock ?? 0) > 0 ? (
                            <AnimatedShinyText className="mx-0 max-w-none text-green-600 dark:text-green-400">
                                ✓ In stock ({displayStock} available)
                            </AnimatedShinyText>
                        ) : "✗ Out of stock"}
                        {selectedSize && <span className="font-normal text-muted-foreground ml-1">· Size {selectedSize}</span>}
                    </p>

                    <div className="flex gap-3 pt-1">
                        <ShimmerButton onClick={addToCart} disabled={(displayStock ?? 0) <= 0}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            shimmerColor="#ffaa40"
                            background="rgba(156, 64, 255, 1)">
                            <ShoppingCart className="w-5 h-5" />
                            {(displayStock ?? 0) > 0 ? "Add to Cart" : "Out of Stock"}
                        </ShimmerButton>
                        <WishlistButton productId={product.id} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                        {[
                            { icon: Truck, label: "Free shipping", sub: "Orders $50+" },
                            { icon: ShieldCheck, label: "Secure checkout", sub: "SSL encrypted" },
                            { icon: RotateCcw, label: "Easy returns", sub: "30-day policy" },
                        ].map(b => (
                            <MagicCard key={b.label} mode="gradient" gradientFrom="#ffaa40" gradientTo="#9c40ff" gradientOpacity={0.08} gradientSize={120}
                                className="text-center p-3 bg-muted/50 rounded-lg">
                                <b.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                                <p className="text-xs font-medium">{b.label}</p>
                                <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                            </MagicCard>
                        ))}
                    </div>

                    {product.sku && <p className="text-xs text-muted-foreground pt-1">SKU: {product.sku}</p>}
                </div>
            </div>

            {/* ─── TABS ─── */}
            <div className="mt-12 max-w-4xl">
                <div className="flex border-b gap-6">
                    {(["description", "specifications", "reviews"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={cn("pb-3 text-sm font-medium transition-colors capitalize border-b-2 -mb-px", activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                            {tab}
                            {tab === "reviews" && <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{localReviews.length}</span>}
                        </button>
                    ))}
                </div>
                <div className="py-6">
                    {activeTab === "description" && (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>{product.description || "No description available for this product."}</p>
                        </div>
                    )}
                    {activeTab === "specifications" && (
                        product.specifications && Object.keys(product.specifications).length > 0
                            ? <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="flex flex-col py-2 border-b border-gray-100 dark:border-gray-800">
                                        <dt className="text-muted-foreground text-xs uppercase tracking-wide">{key}</dt>
                                        <dd className="font-medium mt-0.5">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            : <p className="text-sm text-muted-foreground">No specifications available.</p>
                    )}
                    {activeTab === "reviews" && (
                        <div>
                            <div className="mb-6"><ReviewForm productId={product.id} onSubmitted={fetchReviews} /></div>
                            {localReviews.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
                            ) : (
                                <div className="space-y-4">
                                    {localReviews.map(rev => (
                                        <div key={rev.id} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                    {(rev.user?.name ?? "A")[0]}
                                                </div>
                                                <span className="font-medium text-sm">{rev.user?.name ?? "Anonymous"}</span>
                                                {rev.verified && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">Verified</span>}
                                                <div className="flex items-center ml-auto">
                                                    {[1, 2, 3, 4, 5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                                                </div>
                                                <span className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {rev.comment && <p className="text-sm text-muted-foreground ml-10">{rev.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── RELATED PRODUCTS ─── */}
            {relatedProducts.length > 0 && (
                <div className="mt-12 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff" speed={1.5}>
                            You may also like
                        </AnimatedGradientText>
                        <ArrowRight className="w-5 h-5 text-primary" />
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.slice(0, 4).map(rp => <RelatedCard key={rp.id} product={rp} />)}
                    </div>
                </div>
            )}
        </div>

        {lightboxOpen && <Lightbox images={galleryImages} initialIndex={activeImage} onClose={() => setLightboxOpen(false)} />}

        {showSizeGuide && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex items-center justify-between z-10">
                        <div>
                            <h2 className="font-bold text-lg flex items-center gap-2"><Ruler className="w-5 h-5 text-primary" />{sizeGuide.label}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Measurements in inches</p>
                        </div>
                        <button onClick={() => setShowSizeGuide(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2"><Info className="w-4 h-4" /> How to Measure</h3>
                            <div className="grid grid-cols-3 gap-3 text-xs text-blue-700 dark:text-blue-400">
                                {[{ label: "Chest", desc: "Around fullest part" }, { label: "Waist", desc: "Natural waistline" }, { label: "Hips", desc: "Widest part" }].map(m => (
                                    <div key={m.label} className="text-center">
                                        <div className="w-10 h-10 bg-white dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-1.5"><Scissors className="w-4 h-4" /></div>
                                        <p className="font-medium">{m.label}</p>
                                        <p className="opacity-75">{m.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                    {sizeGuide.sizes[0] ? Object.keys(sizeGuide.sizes[0]).map(k => (
                                        <th key={k} className="py-2 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {k === "size" ? "Size" : k === "chest" ? "Chest" : k === "waist" ? "Waist" : "Hips"}
                                        </th>
                                    )) : null}
                                </tr>
                            </thead>
                            <tbody>
                                {sizeGuide.sizes.map((s, i) => (
                                    <tr key={s.size} className={cn("border-b border-gray-100 dark:border-gray-800", i % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : "")}>
                                        <td className="py-2.5 px-2 font-semibold text-primary">{s.size}</td>
                                        <td className="py-2.5 px-2 text-muted-foreground">{s.chest}</td>
                                        {s.waist && <td className="py-2.5 px-2 text-muted-foreground">{s.waist}</td>}
                                        {s.hips && <td className="py-2.5 px-2 text-muted-foreground">{s.hips}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-muted-foreground text-center">Still unsure? <span className="text-primary font-medium">Contact us</span> and we&apos;ll help you find the perfect fit.</p>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

function RelatedCard({ product }: { product: { id: string; title: string; price: number; image: string; rating: number; compareAtPrice?: number | null } }) {
    const [loaded, setLoaded] = useState(false);
    const seed = getProductSeed(product.id);
    const fallbackUrls = getProductImages("", seed);
    const imgSrc = product.image || fallbackUrls[0];
    return (
        <Link href={`/products/${product.id}`} className="group block">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-2 border">
                {!loaded && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />}
                <img src={imgSrc} alt={product.title}
                    className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", loaded ? "block" : "hidden")}
                    onLoad={() => setLoaded(true)}
                    onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(); }}
                />
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">SALE</span>
                )}
            </div>
            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xs text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
                {product.rating > 0 && <span className="text-xs text-muted-foreground ml-auto">★ {product.rating.toFixed(1)}</span>}
            </div>
        </Link>
    );
}
