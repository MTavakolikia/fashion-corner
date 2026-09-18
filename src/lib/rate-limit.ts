import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";

interface Bucket {
    tokens: number;
    updatedAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function envInt(name: string, fallback: number) {
    const raw = process.env[name];
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * In-memory sliding token bucket, keyed per (ip + group).
 * Suitable for single-instance deployments; on serverless platforms
 * the bucket is per-function-instance (best effort).
 * Window/limit are tunable via RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX
 * with per-group overrides via <GROUP>_LIMIT env vars.
 */
export function rateLimit(req: Request, group: string): void {
    const now = Date.now();
    const windowMs = envInt("RATE_LIMIT_WINDOW_MS", 60_000);
    const defaultLimit = envInt("RATE_LIMIT_MAX", 100);
    const override = process.env[`${group.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_LIMIT`];
    const parsedOverride = override ? parseInt(override, 10) : NaN;
    const limit = Number.isFinite(parsedOverride) && parsedOverride > 0 ? parsedOverride : defaultLimit;

    const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
    const key = `${ip}:${group}`;

    if (buckets.size > MAX_BUCKETS) {
        const cutoff = now - windowMs;
        for (const [k, b] of buckets) {
            if (b.updatedAt < cutoff) buckets.delete(k);
        }
    }

    let bucket = buckets.get(key);
    if (!bucket) {
        bucket = { tokens: limit, updatedAt: now };
        buckets.set(key, bucket);
    }

    const elapsed = now - bucket.updatedAt;
    if (elapsed >= windowMs) {
        bucket = { tokens: limit, updatedAt: now };
        buckets.set(key, bucket);
    }

    bucket.tokens -= 1;
    if (bucket.tokens < 0) {
        const retryAfterSec = Math.ceil((windowMs - elapsed) / 1000);
        throw new ApiError(ERROR_CODES.RATE_LIMITED, "Too many requests. Please slow down.", 429, {
            retryAfter: retryAfterSec,
        });
    }
}
