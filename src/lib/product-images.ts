/* ─────────────────────────────────────────────
   IMAGE UTILITIES — works in both client & server
──────────────────────────────────────────── */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    womens: ["women fashion", "woman dress", "female outfit", "lady clothing", "girl style"],
    mens: ["men fashion", "man outfit", "male clothing", "men style", "guy outfit"],
    "kids-baby": ["kids clothes", "baby fashion", "children outfit", "toddler", "kid style"],
    accessories: ["fashion accessory", "handbag jewelry", "watch bag", "jewelry"],
    shoes: ["shoes sneakers", "footwear fashion", "sneakers", "shoes", "boots fashion"],
    sportswear: ["sportswear", "fitness outfit", "athletic wear", "gym clothing", "workout"],
    luxury: ["luxury fashion", "designer outfit", "premium clothing", "luxury style", "high fashion"],
    bags: ["handbag fashion", "leather bag", "bag accessory", "shoulder bag", "purse"],
    swimwear: ["swimsuit bikini", "beachwear", "swimwear fashion", "summer beach", "bikini"],
    lingerie: ["lingerie fashion", "intimates", "sleepwear", "fashion lingerie", "nightwear"],
    "formal-wear": ["formal wear", "evening gown", "suit fashion", "formal outfit", "tuxedo"],
    outerwear: ["coat jacket", "outerwear fashion", "winter coat", "jacket", "blazer"],
};

export function getProductSeed(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    return Math.abs(hash);
}

export function getProductImages(category: string, seed: number): string[] {
    const keywords = CATEGORY_KEYWORDS[category] ?? CATEGORY_KEYWORDS.womens;
    const count = 6;
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
        const kw = keywords[(seed + i) % keywords.length];
        const w = 400 + ((seed * (i + 1)) % 200);
        const h = 500 + ((seed * (i + 2)) % 300);
        urls.push(`https://loremflickr.com/${w}/${h}/${kw.replace(/ /g, ",")}?lock=${seed + i * 100}`);
    }
    return urls;
}

export function getFallbackImage(): string {
    return `https://loremflickr.com/600/800/fashion?lock=${Date.now()}`;
}
