/* ─────────────────────────────────────────────────────────────
   UNSPLASH IMAGE CATALOG — keyless, hotlinkable CDN URLs
   Docs: https://unsplash.com/documentation#dynamically-resizable-images
   The ids below are real, curated Unsplash photos. When the
   UNSPLASH_ACCESS_KEY is available, scripts/fetch-unsplash-images.ts
   upgrades products to exact name-matched photos via /search/photos.
───────────────────────────────────────────────────────────── */

export interface UnsplashEntry {
    id: string;
    keywords: string[];
}

export const UNSPLASH_CATALOG: Record<string, UnsplashEntry[]> = {
    womens: [
        { id: "1445205170230-053b83016050", keywords: ["coat", "beige", "trench", "woman", "model", "autumn", "fashion"] },
        { id: "1490481651871-ab68de25d43d", keywords: ["hat", "yellow", "summer", "editorial", "straw", "dress"] },
        { id: "1515886657613-9f3515b0c78f", keywords: ["jacket", "street", "denim", "blue", "urban", "style"] },
        { id: "1524504388940-b1c1722653e1", keywords: ["top", "white", "portrait", "blonde", "minimal"] },
        { id: "1483985988355-763728e1935b", keywords: ["shopping", "boutique", "sale", "bags", "fashion"] },
        { id: "1441984904996-e0b6ba687e04", keywords: ["clothes", "rack", "store", "clothing", "boutique"] },
        { id: "1487222477894-8943e31ef7b2", keywords: ["dress", "yellow", "summer", "gown"] },
        { id: "1591369822096-ffd140ec948f", keywords: ["blouse", "shirt", "white", "office", "chic"] },
        { id: "1509637439643-72625f4a900b", keywords: ["editorial", "model", "blue", "portrait", "fashion"] },
        { id: "1515372039744-b8f02a3ae446", keywords: ["still", "fashion", "accessories", "flatlay"] },
    ],
    mens: [
        { id: "1507679799987-c73779587ccf", keywords: ["suit", "formal", "tie", "sharp", "business"] },
        { id: "1507003211169-0a1dd7228f2d", keywords: ["portrait", "shirt", "casual", "beard", "classic"] },
        { id: "1519085360753-af0119f7cbe7", keywords: ["suit", "office", "tie", "formal", "professional"] },
        { id: "1520975954732-35dd22299614", keywords: ["t-shirt", "tshirt", "shirt", "casual", "basic"] },
        { id: "1521572163474-6864f9cf17ab", keywords: ["t-shirt", "tshirt", "white", "tee", "casual"] },
        { id: "1560250097-0b93528c311a", keywords: ["business", "messenger", "briefcase", "leather", "bag"] },
        { id: "1594938298603-c8148c4dae35", keywords: ["shirt", "white", "jacket", "man"] },
        { id: "1617127365659-c46fa90ac9ab", keywords: ["suit", "formal", "black", "tie", "elegant"] },
        { id: "1516257984-b1b4d707412e", keywords: ["hoodie", "sweater", "beanie", "casual", "warm"] },
    ],
    "kids-baby": [
        { id: "1519689680058-324335c77eba", keywords: ["baby", "newborn", "feet", "tiny", "little"] },
        { id: "1503919545889-aef636e10ad4", keywords: ["kids", "children", "child", "play", "outdoor"] },
        { id: "1555685812-4b943f1cb0eb", keywords: ["baby", "infant", "sleep", "cute"] },
        { id: "1596464716127-f2a82984de30", keywords: ["baby", "clothes", "toddler", "kids", "fashion"] },
        { id: "1491013516836-7db643ba125b", keywords: ["baby", "kids", "adorable", "portrait"] },
    ],
    accessories: [
        { id: "1511499767150-a48a237f0083", keywords: ["sunglasses", "shades", "sun", "yellow", "summer"] },
        { id: "1572635196237-14b3f281503f", keywords: ["sunglasses", "shades", "black", "style"] },
        { id: "1515562141207-7a88fb7ce338", keywords: ["ring", "gold", "jewelry", "luxury", "elegant"] },
        { id: "1601121141461-9d6647bca1ed", keywords: ["jewelry", "earrings", "gold", "luxury", "flatlay"] },
        { id: "1523293182086-7651a899d37f", keywords: ["perfume", "fragrance", "bottle", "luxury", "cosmetic"] },
    ],
    shoes: [
        { id: "1549298916-b41d501d3772", keywords: ["sneaker", "red", "running", "sport", "nike"] },
        { id: "1560769629-975ec94e6a86", keywords: ["sneaker", "shoe", "sport", "nike", "orange"] },
        { id: "1525966222134-fcfa99b8ae77", keywords: ["sneakers", "white", "shoes", "casual", "street"] },
        { id: "1595950653106-6c9ebd614d3a", keywords: ["sneaker", "yellow", "dunk", "shoe", "street"] },
        { id: "1543163521-1bf539c55dd2", keywords: ["running", "shoes", "sport", "pair", "trainer"] },
    ],
    sportswear: [
        { id: "1541534741688-6078c6bfb5c5", keywords: ["workout", "gym", "activewear", "fitness", "woman"] },
        { id: "1518310383802-640c2de311b2", keywords: ["gym", "barbell", "fitness", "weights", "workout"] },
        { id: "1571019613454-1cb2f99b2d8b", keywords: ["workout", "fitness", "sport", "exercise", "stretch"] },
        { id: "1552674605-db6ffd4facb5", keywords: ["running", "run", "fitness", "sport", "marathon"] },
        { id: "1517836357463-d25dfeac3438", keywords: ["fitness", "sport", "training", "active", "exercise"] },
    ],
    luxury: [
        { id: "1601121141461-9d6647bca1ed", keywords: ["jewelry", "gold", "luxury", "elegant", "premium"] },
        { id: "1523275335684-37898b6baf30", keywords: ["watch", "chronograph", "luxury", "leather", "premium"] },
        { id: "1515562141207-7a88fb7ce338", keywords: ["ring", "gold", "diamond", "luxury", "premium"] },
        { id: "1490481651871-ab68de25d43d", keywords: ["editorial", "luxury", "fashion", "designer", "elegant"] },
        { id: "1523293182086-7651a899d37f", keywords: ["perfume", "luxury", "fragrance", "designer", "elegant"] },
    ],
    bags: [
        { id: "1548036328-c9fa89d128fa", keywords: ["handbag", "bag", "leather", "luxury", "woman"] },
        { id: "1584917865442-de89df76afd3", keywords: ["handbag", "bag", "leather", "fashion", "elegant"] },
        { id: "1590874103328-eac38a683ce7", keywords: ["bag", "pink", "handbag", "clutch", "woman"] },
        { id: "1585386959984-a4155224a1ad", keywords: ["bag", "flatlay", "fashion", "accessories", "travel"] },
    ],
    swimwear: [
        { id: "1502680390469-be75c86b636f", keywords: ["surfer", "beach", "wave", "summer", "swim", "sea"] },
        { id: "1519046904884-53103b34b206", keywords: ["beach", "umbrella", "summer", "vacation", "swim"] },
        { id: "1507525428034-b723cf961d3e", keywords: ["beach", "tropical", "palm", "summer", "vacation", "swim"] },
    ],
    lingerie: [
        { id: "1490481651871-ab68de25d43d", keywords: ["silk", "elegant", "soft", "feminine", "fashion"] },
        { id: "1445205170230-053b83016050", keywords: ["neutral", "soft", "woman", "minimal", "elegant"] },
        { id: "1601121141461-9d6647bca1ed", keywords: ["delicate", "lace", "luxury", "feminine"] },
        { id: "1524504388940-b1c1722653e1", keywords: ["comfort", "woman", "soft", "portrait", "casual"] },
    ],
    "formal-wear": [
        { id: "1507679799987-c73779587ccf", keywords: ["suit", "tuxedo", "formal", "black", "tie"] },
        { id: "1519085360753-af0119f7cbe7", keywords: ["suit", "formal", "office", "tie", "professional"] },
        { id: "1541643600914-78b084683601", keywords: ["suit", "black", "formal", "evening", "tie"] },
        { id: "1560179707-f14e90ef3623", keywords: ["suit", "man", "formal", "style", "elegant"] },
        { id: "1594938298603-c8148c4dae35", keywords: ["shirt", "white", "formal", "dress", "man"] },
        { id: "1507003211169-0a1dd7228f2d", keywords: ["shirt", "formal", "portrait", "man"] },
    ],
    outerwear: [
        { id: "1591047139829-d91aecb6caea", keywords: ["puffer", "jacket", "coat", "winter", "warm"] },
        { id: "1551028719-00167b16eac5", keywords: ["leather", "jacket", "biker", "woman", "edgy"] },
        { id: "1445205170230-053b83016050", keywords: ["coat", "beige", "trench", "winter", "autumn"] },
        { id: "1515886657613-9f3515b0c78f", keywords: ["jacket", "denim", "blue", "street", "style"] },
        { id: "1544025162-d76694265947", keywords: ["leather", "jacket", "biker", "black", "edgy"] },
    ],
};

export const UNSPLASH_FALLBACK_ID = "1441984904996-e0b6ba687e04";

export function buildUnsplashImageUrl(photoId: string, opts?: { w?: number; h?: number; q?: number }): string {
    const { w = 800, h = 1000, q = 80 } = opts ?? {};
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;
}

const NAME_TOKENS = new Set<string>([
    "black", "white", "navy", "beige", "brown", "pink", "red", "blue", "green", "yellow",
    "purple", "gray", "burgundy", "olive", "cream", "khaki", "coral", "mint", "lavender",
    "mustard", "teal", "charcoal", "sage", "blush", "sky", "hot",
]);

function tokenize(name: string): string[] {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s/-]/g, " ")
        .split(/[\s/-]+/)
        .filter(Boolean);
}

function scoreEntry(entry: UnsplashEntry, tokens: string[]): number {
    let score = 0;
    for (const token of tokens) {
        for (const kw of entry.keywords) {
            if (kw === token || kw.includes(token) || token.includes(kw)) {
                score += NAME_TOKENS.has(token) ? 2 : 3;
            }
        }
    }
    return score;
}

/** Score any { id, keywords } entry (curated or API result) against a product name. */
export function bestEntryByScore<T extends { id: string; keywords: string[] }>(entries: T[], name: string, seed: number): T {
    const tokens = tokenize(name);
    let best: T = entries[seed % entries.length];
    let bestScore = -1;
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[(seed + i) % entries.length];
        const score = scoreEntry(entry, tokens);
        if (score > bestScore) {
            bestScore = score;
            best = entry;
        }
    }
    return best;
}

/** Pick the most relevant curated Unsplash photo for a product name+category. */
export function pickUnsplashForProduct(category: string, name: string, seed: number): UnsplashEntry {
    const pool = UNSPLASH_CATALOG[category] ?? [];
    if (pool.length === 0) return { id: UNSPLASH_FALLBACK_ID, keywords: ["fashion"] };
    return bestEntryByScore(pool, name, seed);
}