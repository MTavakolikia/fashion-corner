/**
 * scripts/fetch-unsplash-images.ts
 *
 * Per-product-name Unsplash image resolver (docs: unsplash.com/documentation#search-photos).
 * Run with:
 *   npm run unsplash:images                # process 20 products
 *   npm run unsplash:images -- --limit 80  # process up to 80 products
 *   npm run unsplash:images -- --reset     # clear cache and re-fetch all
 *
 * Rate-limit aware — respects X-Ratelimit-Remaining; pauses when the key is nearly
 * exhausted and exits cleanly so the script can be re-run to continue.
 * Requires:
 *   UNSPLASH_ACCESS_KEY = <your app key from https://unsplash.com/oauth/applications>
 *   DATABASE_URL        = postgres connection string
 *
 * Docs: GET /search/photos?query=<name>&orientation=portrait&order_by=relevant
 * Hotlinking rules: https://unsplash.com/documentation#dynamically-resizable-images
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { searchUnsplashPhotos, readNameImageIndex, writeNameImageIndex, DATA_DIR } from '../prisma/lib/unsplash-images';
import * as fs from 'node:fs';

function parseArgs() {
    const args = process.argv.slice(2);
    const opts: Record<string, number | string | boolean> = {};
    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--reset') { opts.reset = true; continue; }
        if (arg === '--dry-run') { opts.dryRun = true; continue; }
        if (arg === '--limit' && args[i + 1]) { opts.limit = Number(args[++i]); continue; }
        if (arg === '--delay' && args[i + 1]) { opts.delay = Number(args[++i]); continue; }
        if (arg === '--category' && args[i + 1]) { opts.category = args[++i]; continue; }
        if (arg.startsWith('--')) { opts[arg.slice(2)] = true; }
    }
    return opts;
}

const PAUSE_THRESHOLD = 3;
const EXHAUSTED_EXIT_CODE = 0;

async function main() {
    const opts = parseArgs();
    const limit = typeof opts.limit === 'number' ? opts.limit : 20;
    const delayMs = typeof opts.delay === 'number' ? opts.delay : 1200;
    const categoryFilter = typeof opts.category === 'string' ? opts.category : undefined;
    const dryRun = Boolean(opts.dryRun);
    const reset = Boolean(opts.reset);

    if (!process.env.UNSPLASH_ACCESS_KEY) {
        console.error('❌ UNSPLASH_ACCESS_KEY is not set. Create a dev app at https://unsplash.com/oauth/applications and add it to your .env.');
        process.exit(1);
    }
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set — cannot read products.');
        process.exit(1);
    }

    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });

    fs.mkdirSync(DATA_DIR, { recursive: true });
    const index = reset ? {} : readNameImageIndex();
    const processedIds = new Set(Object.keys(index));
    console.log(`📸 Unsplash per-product-name image resolver (docs: unsplash.com/documentation#search-photos)`);
    console.log(`   Resumed from ${processedIds.size} previously saved results`);

    const products = await prisma.product.findMany({
        where: categoryFilter ? { category: categoryFilter } : {},
        select: { id: true, title: true, category: true, image: true },
        orderBy: { id: 'asc' },
    });
    const pending = products.filter(p => !processedIds.has(p.id)).slice(0, limit);
    console.log(`   ${products.length} products total — processing ${pending.length} (limit: ${limit})\n`);

    let processed = 0;
    for (const product of pending) {
        const query = product.title.trim();
        console.log(`🔍 [${processed + 1}/${pending.length}] "${query}" (${product.category})`);

        try {
            const { results, rateLimitRemaining } = await searchUnsplashPhotos(query, 6);

            if (rateLimitRemaining !== null && rateLimitRemaining <= PAUSE_THRESHOLD) {
                const retryAfter = 3600;
                console.warn(`\n⏳ Rate limit almost exhausted (remaining: ${rateLimitRemaining}). Pausing for ${retryAfter}s. Re-run to continue.\n`);
                break;
            }

            const ranked = results.map(r => ({
                ...r,
                _score: r.keywords.filter(kw =>
                    query.toLowerCase().includes(kw) || kw.includes(product.category.replace('-', ' ').split(' ')[0])
                ).length,
            })).sort((a, b) => b._score - a._score);

            const winner = ranked[0] ?? null;
            if (!winner) {
                console.log('   ⚠️  No results — skipping');
                processed++;
                continue;
            }

            index[product.id] = {
                id: product.id,
                name: product.title,
                category: product.category,
                photoId: winner.photoId,
                image: winner.image,
                mainImage: winner.mainImage,
                thumb: winner.thumb,
                alt: winner.alt,
                photographer: winner.photographer,
                photoPage: winner.photoPage,
            };
            writeNameImageIndex(index);

            if (!dryRun) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        image: winner.mainImage,
                        mainImage: winner.mainImage,
                        updatedAt: new Date(),
                    },
                });
            }

            console.log(`   ✅ ${winner.alt ?? winner.photoId} (by ${winner.photographer}) — remaining: ${rateLimitRemaining ?? '?'}`);
        } catch (err) {
            console.error(`   ❌ API error: ${(err as Error).message}`);
            break;
        }

        processed++;
        if (processed < pending.length) {
            await new Promise(r => setTimeout(r, delayMs));
        }
    }

    console.log(`\n✅ Done — processed ${processed} products this run (${Object.keys(index).length} total indexed)`);
    await prisma.$disconnect();
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});