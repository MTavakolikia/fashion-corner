import { z } from "zod";

// ─── Product ─────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().optional(),
    description: z.string().min(1),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    category: z.string().min(1),
    brand: z.string().optional(),
    images: z.array(z.string()).min(1),
    stock: z.number().int().nonnegative().default(0),
    lowStockThreshold: z.number().int().nonnegative().default(5),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const updateProductSchema = createProductSchema.partial();

// ─── Order ───────────────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
    fullName: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(5),
    phone: z.string().min(10),
});

export const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().positive(),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    shippingAddress: shippingAddressSchema,
    total: z.number().positive(),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
});

// ─── Review ──────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(""),
});

// ─── Address ─────────────────────────────────────────────────────────────────

export const addressSchema = shippingAddressSchema.extend({
    isDefault: z.boolean().optional(),
});

// ─── Wishlist ────────────────────────────────────────────────────────────────

export const wishlistItemSchema = z.object({ productId: z.string() });

// ─── Coupon ──────────────────────────────────────────────────────────────────

export const createCouponSchema = z.object({
    code: z.string().min(1).max(50).toUpperCase(),
    description: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().positive(),
    minOrderAmount: z.number().nonnegative().default(0),
    maxDiscount: z.number().nonnegative().optional(),
    usageLimit: z.number().int().nonnegative().optional(),
    perUserLimit: z.number().int().nonnegative().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const applyCouponSchema = z.object({
    code: z.string().min(1),
    orderId: z.string().optional(),
});

// ─── Return ──────────────────────────────────────────────────────────────────

export const createReturnSchema = z.object({
    orderId: z.string(),
    items: z.array(z.object({ itemId: z.string(), quantity: z.number().int().min(1) })).min(1),
    reason: z.string().min(5),
    description: z.string().optional(),
});

// ─── Support Ticket ──────────────────────────────────────────────────────────

export const createTicketSchema = z.object({
    subject: z.string().min(1).max(200),
    message: z.string().min(10),
    category: z.enum(["order", "product", "shipping", "return", "other"]),
});

// ─── Category / Brand ────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().optional(),
    image: z.string().optional(),
});

export const createBrandSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().optional(),
    logo: z.string().optional(),
});

// ─── User ────────────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
});
