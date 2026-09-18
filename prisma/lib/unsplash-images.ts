import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
    bestEntryByScore,
    pickUnsplashForProduct,
    buildUnsplashImageUrl,
    UNSPLASH_CATALOG,
} from '../../src/lib/unsplash-images';

export const DATA_DIR = path.resolve(__dirname, '..', 'data');
export const NAME_INDEX_PATH = path.join(DATA_DIR, 'unsplash-images.json');
export const CATEGORY_POOL_PATH = path.join(DATA_DIR, 'category-images.json');

export interface UnsplashPhotoResult {
    id: string;
    photoId: string;
    image: string;
    mainImage: string;
    thumb: string;
    alt: string;
    photographer: string;
    photoPage: string;
    keywords: string[];
}

const CDN_PARAMS = 'auto=format&fit=crop&q=80';

/** Append documented imgix params to a `raw` CDN URL (preserves ixid for attribution). */
export function toProductImageSet(rawUrl: string): { image: string; mainImage: string; thumb: string } {
    const sep = rawUrl.includes('?') ? '&' : '?';
    return {
        image: `${rawUrl}${sep}${CDN_PARAMS}&w=800&h=1000`,
        mainImage: `${rawUrl}${sep}${CDN_PARAMS}&w=800&h=1000`,
        thumb: `${rawUrl}${sep}${CDN_PARAMS}&w=300&h=375`,
    };
}

export interface SearchResult {
    results: UnsplashPhotoResult[];
    rateLimitRemaining: number | null;
    rateLimitLimit: number | null;
    retryAfter: number | null;
}

/** GET /search/photos — docs: unsplash.com/documentation#search-photos */
export async function searchUnsplashPhotos(query: string, perPage = 30): Promise<SearchResult> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) {
        throw new Error('UNSPLASH_ACCESS_KEY is not set — create a dev app at https://unsplash.com/oauth/applications');
    }
    const url = `https://api.unsplash.com/search/photos?client_id=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait&order_by=relevant`;
    const res = await fetch(url, { headers: { 'Accept-Version': 'v1' } });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Unsplash /search/photos failed ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
        results?: Array<{
            id: string;
            alt_description?: string | null;
            description?: string | null;
            urls?: { raw?: string };
            user?: { name?: string | null };
            links?: { html?: string };
            tags?: Array<{ title?: string }>;
        }>;
    };

    const remainingRaw = res.headers.get('x-ratelimit-remaining');
    const limitRaw = res.headers.get('x-ratelimit-limit');
    const retryRaw = res.headers.get('retry-after');

    const keywordTokens = (...parts: Array<string | null | undefined>): string[] => {
        const tokens = parts
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2);
        return Array.from(new Set(tokens));
    };

    const results: UnsplashPhotoResult[] = (data.results ?? []).map((photo) => {
        const raw = photo.urls?.raw ?? '';
        const set = toProductImageSet(raw);
        return {
            id: photo.id,
            photoId: photo.id,
            ...set,
            alt: photo.alt_description ?? photo.description ?? query,
            photographer: photo.user?.name ?? '',
            photoPage: photo.links?.html ?? '',
            keywords: keywordTokens(photo.alt_description, photo.description, ...(photo.tags ?? []).map((t) => t.title)),
        };
    });

    return {
        results,
        rateLimitRemaining: remainingRaw ? parseInt(remainingRaw, 10) : null,
        rateLimitLimit: limitRaw ? parseInt(limitRaw, 10) : null,
        retryAfter: retryRaw ? parseInt(retryRaw, 10) : null,
    };
}

// ── on-disk caches (resume-friendly) ──────────────────────────────

export type NameImageEntry = {
    id: string;
    name: string;
    category?: string;
    photoId: string;
    image: string;
    mainImage: string;
    thumb: string;
    alt: string;
    photographer: string;
    photoPage: string;
};

export type NameImageIndex = Record<string, NameImageEntry>;

export function readNameImageIndex(): NameImageIndex {
    if (!fs.existsSync(NAME_INDEX_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(NAME_INDEX_PATH, 'utf8')) as NameImageIndex;
    } catch {
        return {};
    }
}

export function writeNameImageIndex(index: NameImageIndex): void {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(NAME_INDEX_PATH, JSON.stringify(index, null, 2));
}

/** Map of lowercase product-title → entry, so the seed can match by name. */
export function readNameToImageMap(): Record<string, NameImageEntry> {
    const map: Record<string, NameImageEntry> = {};
    for (const entry of Object.values(readNameImageIndex())) {
        const key = (entry.name ?? '').trim().toLowerCase();
        if (key) map[key] = entry;
    }
    return map;
}

export function readCategoryPool(): Record<string, UnsplashPhotoResult[]> {
    if (!fs.existsSync(CATEGORY_POOL_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(CATEGORY_POOL_PATH, 'utf8')) as Record<string, UnsplashPhotoResult[]>;
    } catch {
        return {};
    }
}

export function writeCategoryPool(pool: Record<string, UnsplashPhotoResult[]>): void {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CATEGORY_POOL_PATH, JSON.stringify(pool, null, 2));
}

export const SEARCH_QUERIES: Record<string, string> = {
    womens: 'women fashion dress top blouse skirt model',
    mens: 'men fashion shirt suit casual style',
    'kids-baby': 'kids baby clothing fashion children',
    accessories: 'fashion accessories jewelry sunglasses watch perfume',
    shoes: 'sneakers shoes footwear fashion running',
    sportswear: 'sportswear activewear fitness gym workout',
    luxury: 'luxury fashion designer elegant premium watch',
    bags: 'handbag leather bag fashion purse clutch',
    swimwear: 'swimsuit bikini beach summer swimwear',
    lingerie: 'lingerie intimates elegant woman fashion',
    'formal-wear': 'formal wear suit tuxedo evening attire',
    outerwear: 'coat jacket outerwear winter fashion',
};

/**
 * Ensure each category has a pool of real photos fetched via the API.
 * Only hits the network for categories that are not cached yet (demo
 * keys allow 50 req/hr; whole seed needs at most 12).
 */
export async function ensureCategoryPool(categories: string[]): Promise<Record<string, UnsplashPhotoResult[]>> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    const pool = readCategoryPool();
    if (!key) return pool;

    for (const cat of categories) {
        if (pool[cat] && pool[cat].length > 0) continue;
        try {
            const { results } = await searchUnsplashPhotos(SEARCH_QUERIES[cat] ?? 'fashion', 30);
            pool[cat] = results;
            writeCategoryPool(pool);
        } catch (err) {
            console.warn(`   ⚠️  Could not fetch Unsplash pool for "${cat}": ${(err as Error).message}`);
        }
    }
    return pool;
}

/** Deterministic seed used to vary image selection without randomness. */
export function hashSeed(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    return Math.abs(hash);
}

/**
 * Resolve the best Unsplash image for a product:
 *   1) exact title match from scripts/fetch-unsplash-images.ts output (name-matched)
 *   2) real photos in the per-category pool (API/cached) scored against the name
 *   3) curated keyless catalog of real photos (buildUnsplashImageUrl)
 */
export function resolveProductImage(
    title: string,
    category: string,
    seed: number,
    nameIndex: Record<string, NameImageEntry>,
    categoryPool: Record<string, UnsplashPhotoResult[]>,
): { image: string; mainImage: string; alt: string } {
    const exact = nameIndex[title.trim().toLowerCase()];
    if (exact) return { image: exact.image, mainImage: exact.mainImage, alt: exact.alt };

    const pool = categoryPool[category] ?? [];
    if (pool.length > 0) {
        const entry = bestEntryByScore(pool, title, seed);
        return { image: entry.image, mainImage: entry.mainImage, alt: entry.alt };
    }

    const curated = pickUnsplashForProduct(category, title, seed) ?? {
        id: UNSPLASH_CATALOG.womens?.[0]?.id ?? '',
        keywords: [],
    };
    const url = buildUnsplashImageUrl(curated.id, { w: 800, h: 1000 });
    return { image: url, mainImage: url, alt: title };
}