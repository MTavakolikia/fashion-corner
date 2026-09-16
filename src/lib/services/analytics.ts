/**
 * Analytics abstraction. Events are typed and routed through a single
 * provider so a real vendor (Segment/PostHog/Amplitude) can be swapped in
 * via env without touching call sites.
 *
 * Today: LocalAnalyticsProvider mirrors events to the server console.
 */

export const AnalyticsEvents = {
    PRODUCT_VIEWED: "PRODUCT_VIEWED",
    PRODUCT_SEARCHED: "PRODUCT_SEARCHED",
    PRODUCT_ADDED_TO_CART: "PRODUCT_ADDED_TO_CART",
    PRODUCT_REMOVED_FROM_CART: "PRODUCT_REMOVED_FROM_CART",
    CHECKOUT_STARTED: "CHECKOUT_STARTED",
    ORDER_CREATED: "ORDER_CREATED",
    WISHLIST_ADDED: "WISHLIST_ADDED",
    WISHLIST_REMOVED: "WISHLIST_REMOVED",
    REVIEW_CREATED: "REVIEW_CREATED",
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsProvider {
    track(event: AnalyticsEvent, properties?: AnalyticsProperties, context?: { userId?: string; sessionId?: string }): void;
}

class LocalAnalyticsProvider implements AnalyticsProvider {
    track(event: AnalyticsEvent, properties: AnalyticsProperties = {}, context: { userId?: string } = {}): void {
        if (process.env.NODE_ENV !== "production" || process.env.ANALYTICS_DEBUG === "1") {
            console.log(`[analytics] ${event}`, context.userId ? { userId: context.userId, ...properties } : properties);
        }
    }
}

let provider: AnalyticsProvider | null = null;

export function getAnalytics(): AnalyticsProvider {
    if (!provider) {
        // A future vendor adapter would be selected here from env.
        provider = new LocalAnalyticsProvider();
    }
    return provider;
}
