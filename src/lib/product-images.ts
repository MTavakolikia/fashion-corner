/* ─────────────────────────────────────────────
   IMAGE UTILITIES — works in both client & server
   Builds real, hotlinkable Unsplash CDN URLs that
   relate to the product category / name.
──────────────────────────────────────────── */

import { pickUnsplashForProduct, buildUnsplashImageUrl, UNSPLASH_FALLBACK_ID } from "@/lib/unsplash-images";

export function getProductSeed(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    return Math.abs(hash);
}

function seededEntry(category: string, name: string, seed: number, index: number): string {
    const base = pickUnsplashForProduct(category, name, seed + index * 7);
    return buildUnsplashImageUrl(base.id, { w: 600 + (index % 3) * 100, h: 750 + (index % 2) * 50 });
}

export function getProductImages(category: string, seed: number, name?: string): string[] {
    const count = 6;
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
        urls.push(seededEntry(category, name ?? category, seed, i));
    }
    return urls;
}

export function getFallbackImage(): string {
    return buildUnsplashImageUrl(UNSPLASH_FALLBACK_ID, { w: 600, h: 800 });
}