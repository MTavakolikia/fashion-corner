import type { coupon } from "@prisma/client";

/** Round a currency value to 2 decimals (banker-safe enough for e-commerce). */
export function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface PriceItem {
    price: number;
    quantity: number;
}

export function subtotalOf(items: PriceItem[]): number {
    return round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}

export interface CouponEligibility {
    isValid: boolean;
    /** Reason code when invalid */
    reason?: "EXPIRED" | "INACTIVE" | "USAGE_LIMIT_REACHED" | "PER_USER_LIMIT_REACHED" | "MIN_ORDER_NOT_MET" | "NOT_FOUND";
    /** Computed discount amount (0 when invalid) */
    discount: number;
}

/**
 * Pure coupon eligibility + discount math. No DB access, fully unit-testable.
 *
 * @param coupon validated row (must exist; caller checks before calling)
 * @param ctx.currentDate "now" (injectable for tests)
 * @param ctx.userUsage how many times this user used the coupon
 * @param ctx.subtotal order subtotal for min-amount check
 */
export function evaluateCoupon(
    coupon: coupon | null | undefined,
    ctx: { currentDate: Date; userUsage: number; subtotal: number }
): CouponEligibility {
    if (!coupon || !coupon.isActive) return invalid("INACTIVE");
    const now = ctx.currentDate.getTime();
    if (coupon.startDate && coupon.startDate.getTime() > now) return invalid("EXPIRED");
    if (coupon.endDate && coupon.endDate.getTime() < now) return invalid("EXPIRED");
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.timesUsed >= coupon.usageLimit) {
        return invalid("USAGE_LIMIT_REACHED");
    }
    if (
        coupon.perUserLimit !== null &&
        coupon.perUserLimit !== undefined &&
        ctx.userUsage >= coupon.perUserLimit
    ) {
        return invalid("PER_USER_LIMIT_REACHED");
    }
    if (ctx.subtotal < (coupon.minOrderAmount ?? 0)) return invalid("MIN_ORDER_NOT_MET");

    let discount: number;
    if (coupon.type === "PERCENTAGE") {
        const pct = Math.min(Math.max(coupon.value, 0), 100);
        discount = (ctx.subtotal * pct) / 100;
    } else {
        discount = coupon.value;
    }
    if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(round2(discount), ctx.subtotal); // never exceeds subtotal
    return { isValid: true, discount: round2(discount) };
}

function invalid(reason: CouponEligibility["reason"]): CouponEligibility {
    return { isValid: false, reason, discount: 0 };
}

export interface Totals {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
}

export function computeTotals(params: {
    items: PriceItem[];
    discount?: number;
    taxRate?: number;
    shippingCost?: number;
    freeShippingThreshold?: number;
}): Totals {
    const { items, taxRate = 0, shippingCost = 0, freeShippingThreshold } = params;
    const subtotal = subtotalOf(items);
    const discount = Math.min(params.discount ?? 0, subtotal);
    const taxBase = subtotal - discount;
    const tax = round2((taxBase * taxRate) / 100);
    let shipping = shippingCost;
    if (freeShippingThreshold !== undefined && taxBase >= freeShippingThreshold) shipping = 0;
    shipping = round2(shipping);
    const total = round2(Math.max(taxBase + tax + shipping, 0));
    return { subtotal, discount: round2(discount), tax, shipping, total };
}
