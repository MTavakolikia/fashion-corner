import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ApiError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/error-codes";
import { AUDIT_ACTIONS, auditLog } from "@/lib/services/audit";
import { adjustStock, type PrismaTx } from "@/lib/services/inventory";

// ─── Schemas (exported for reuse by API routes) ─────────────────────────

export const variantSchema = z.object({
    id: z.string().optional(),
    sku: z.string().min(1).max(60),
    size: z.string().max(40).optional(),
    color: z.string().max(40).optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative().default(0),
    image: z.string().url().optional().or(z.literal("")),
});

export const createProductSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().max(200).optional().or(z.literal("")),
    description: z.string().min(1),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    costPrice: z.number().nonnegative().optional(),
    category: z.string().min(1),
    brand: z.string().max(100).optional().or(z.literal("")),
    sku: z.string().max(60).optional().or(z.literal("")),
    stock: z.number().int().nonnegative().default(0),
    lowStockThreshold: z.number().int().nonnegative().default(5),
    weight: z.number().nonnegative().optional(),
    images: z.array(z.union([z.string().url(), z.literal("")])).min(1).max(12),
    specifications: z.record(z.string(), z.string()).optional(),
    tags: z.array(z.string().max(50)).max(30).optional(),
    seoTitle: z.string().max(200).optional(),
    seoDescription: z.string().max(500).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    isFeatured: z.boolean().default(false),
    variants: z.array(variantSchema).max(24).optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ status: true }).extend({
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const productListQuerySchema = z.object({
    q: z.string().max(200).optional(),
    category: z.string().max(100).optional(),
    brand: z.string().max(100).optional(),
    sellerId: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    inStock: z.coerce.boolean().optional(),
    onSale: z.coerce.boolean().optional(),
    sort: z.enum(["newest", "price_asc", "price_desc", "rating", "trending"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(60).default(20),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

// ─── Public listing / search ──────────────────────────────────────────────

export interface ProductFilterOptions {
    categories: { value: string; label: string; count: number }[];
    brands: { value: string; label: string; count: number }[];
}

export async function listProducts(query: ProductListQuery, includeDrafts = false) {
    const where: Prisma.productWhereInput = {};
    if (includeDrafts) {
        where.status = query.status ?? "PUBLISHED";
    } else {
        where.status = "PUBLISHED";
    }

    if (query.q) {
        where.OR = [
            { title: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
            { sku: { contains: query.q, mode: "insensitive" } },
            { brand: { contains: query.q, mode: "insensitive" } },
            { tags: { contains: query.q, mode: "insensitive" } },
        ];
    }
    if (query.category) where.category = { equals: query.category, mode: "insensitive" };
    if (query.brand) where.brand = { equals: query.brand, mode: "insensitive" };
    if (query.sellerId) where.sellerId = query.sellerId;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.price = {};
        if (query.minPrice !== undefined) where.price.gte = query.minPrice;
        if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }
    if (query.minRating !== undefined) where.rating = { gte: query.minRating };
    if (query.inStock) where.stock = { gt: 0 };
    // "On sale" = a compare-at (original) price is set. Prisma cannot express a
    // cross-column comparison (price < compareAtPrice) in a single where clause,
    // so we key off the presence of compareAtPrice — the practical, indexable
    // definition of "has a discount".
    if (query.onSale) where.compareAtPrice = { not: null };

    const orderBy: Prisma.productOrderByWithRelationInput =
        query.sort === "price_asc" ? { price: "asc" }
        : query.sort === "price_desc" ? { price: "desc" }
        : query.sort === "rating" ? { rating: "desc" }
        : query.sort === "trending" ? { views: "desc" }
        : { createdAt: "desc" };

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
}

export async function getProductDetail(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: true,
            _count: { select: { reviews: true, orderItems: true } },
        },
    });
    if (!product) return null;

    const ratingAgg = await prisma.review.aggregate({
        where: { productId: id, isHidden: false },
        _avg: { rating: true },
        _count: true,
    });

    // Record the view (fire-and-forget, not part of the critical path).
    void prisma.product.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    return {
        ...product,
        rating: ratingAgg._avg.rating ?? product.rating,
        ratingCount: ratingAgg._count ?? product.ratingCount,
    };
}

export async function getRelatedProducts(productId: string, limit = 8) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { category: true, brand: true },
    });
    if (!product) return [];
    return prisma.product.findMany({
        where: {
            status: "PUBLISHED",
            id: { not: productId },
            OR: [{ category: product.category }, ...(product.brand ? [{ brand: product.brand }] : [])],
        },
        orderBy: { rating: "desc" },
        take: limit,
    });
}

// ─── Seller / admin product management ───────────────────────────────────

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 180) || `p-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createProduct(input: z.infer<typeof createProductSchema>, sellerId: string, actorId: string) {
    const result = await prisma.$transaction(async (tx: PrismaTx) => {
        const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
        const uniqueSlug = await makeSlugUnique(slug, tx);

        const product = await tx.product.create({
            data: {
                id: `prod_${crypto.randomUUID()}`,
                title: input.title,
                slug: uniqueSlug,
                description: input.description,
                price: input.price,
                compareAtPrice: input.compareAtPrice ?? null,
                costPrice: input.costPrice ?? null,
                category: input.category,
                brand: input.brand || null,
                sellerId,
                sku: input.sku || null,
                status: input.status,
                images: input.images as Prisma.InputJsonValue,
                mainImage: input.images[0] || null,
                image: input.images[0] || null,
                stock: input.stock,
                lowStockThreshold: input.lowStockThreshold,
                weight: input.weight ?? null,
                specifications: (input.specifications ?? {}) as Prisma.InputJsonValue,
                tags: JSON.stringify(input.tags ?? []),
                seoTitle: input.seoTitle ?? null,
                seoDescription: input.seoDescription ?? null,
                isFeatured: input.isFeatured,
                publishedAt: input.status === "PUBLISHED" ? new Date() : null,
                updatedAt: new Date(),
            },
        });

        if (input.variants?.length) {
            await tx.product_variant.createMany({
                data: input.variants.map((v) => ({
                    id: `var_${crypto.randomUUID()}`,
                    productId: product.id,
                    sku: v.sku,
                    size: v.size ?? null,
                    color: v.color ?? null,
                    price: v.price,
                    stock: v.stock,
                    image: v.image || null,
                })),
            });
        }

        if (input.stock > 0) {
            await tx.inventory_log.create({
                data: {
                    id: `inv_${crypto.randomUUID()}`,
                    productId: product.id,
                    actorId,
                    delta: input.stock,
                    reason: "IMPORT",
                    note: "Initial stock on product creation",
                },
            });
        }
        return product;
    });

    auditLog(actorId, AUDIT_ACTIONS.PRODUCT_CREATED, "product", result.id, { title: result.title, sellerId });
    return result;
}

export async function updateProduct(
    id: string,
    input: z.infer<typeof updateProductSchema>,
    actorId: string,
    opts: { isAdmin?: boolean } = {}
) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);
    if (!opts.isAdmin && current.sellerId && current.sellerId !== actorId) {
        throw new ApiError(ERROR_CODES.SELLER_NOT_OWNER, "This product belongs to another seller.", 403);
    }

    return prisma.$transaction(async (tx: PrismaTx) => {
        const data: Prisma.productUpdateInput = {};
        if (input.title !== undefined) data.title = input.title;
        if (input.description !== undefined) data.description = input.description;
        if (input.slug !== undefined) data.slug = input.slug ? slugify(input.slug) : null;
        if (input.price !== undefined) data.price = input.price;
        if (input.compareAtPrice !== undefined) data.compareAtPrice = input.compareAtPrice;
        if (input.costPrice !== undefined) data.costPrice = input.costPrice;
        if (input.category !== undefined) data.category = input.category;
        if (input.brand !== undefined) data.brand = input.brand || null;
        if (input.sku !== undefined) data.sku = input.sku || null;
        if (input.weight !== undefined) data.weight = input.weight;
        if (input.images !== undefined) {
            data.images = input.images as Prisma.InputJsonValue;
            data.mainImage = input.images[0] || null;
            data.image = input.images[0] || null;
        }
        if (input.specifications !== undefined) data.specifications = input.specifications as Prisma.InputJsonValue;
        if (input.tags !== undefined) data.tags = JSON.stringify(input.tags);
        if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle;
        if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription;
        if (input.lowStockThreshold !== undefined) data.lowStockThreshold = input.lowStockThreshold;
        if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;

        if (input.status !== undefined && input.status !== current.status) {
            data.status = input.status;
            data.publishedAt = input.status === "PUBLISHED" ? new Date() : current.publishedAt;
        }

        // Stock delta → inventory log
        if (input.stock !== undefined && input.stock !== current.stock) {
            const delta = input.stock - current.stock;
            data.stock = input.stock;
            if (delta < 0) {
                // Guard: cannot drop below zero.
                if (input.stock < 0) {
                    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, "Stock cannot be negative.", 400);
                }
            }
            await adjustStock(tx, {
                productId: id,
                delta,
                reason: "ADJUSTMENT",
                actorId,
                note: "Manual stock adjustment",
            });
            delete data.stock; // adjustStock already set it
        }

        const product = await tx.product.update({ where: { id }, data });

        if (input.variants) {
            // Sync variants: update existing, create new, delete removed.
            const existing = await tx.product_variant.findMany({ where: { productId: id } });
            const keepIds = new Set(input.variants.map((v) => v.id).filter(Boolean) as string[]);
            const toDelete = existing.filter((v) => !keepIds.has(v.id));
            if (toDelete.length) {
                await tx.product_variant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
            }
            for (const v of input.variants) {
                if (v.id) {
                    await tx.product_variant.update({
                        where: { id: v.id },
                        data: { sku: v.sku, size: v.size ?? null, color: v.color ?? null, price: v.price, stock: v.stock, image: v.image || null },
                    });
                } else {
                    await tx.product_variant.create({
                        data: {
                            id: `var_${crypto.randomUUID()}`,
                            productId: id,
                            sku: v.sku,
                            size: v.size ?? null,
                            color: v.color ?? null,
                            price: v.price,
                            stock: v.stock,
                            image: v.image || null,
                        },
                    });
                }
            }
        }
        return product;
    });
}

export async function deleteProduct(id: string, actorId: string, opts: { isAdmin?: boolean } = {}) {
    const product = await prisma.product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
    if (!product) throw new ApiError(ERROR_CODES.PRODUCT_NOT_FOUND, "Product not found.", 404);
    if (!opts.isAdmin && product.sellerId && product.sellerId !== actorId) {
        throw new ApiError(ERROR_CODES.SELLER_NOT_OWNER, "This product belongs to another seller.", 403);
    }

    // Never hard-delete products that are referenced by historical orders — archive instead.
    if (product._count.orderItems > 0) {
        const updated = await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
        auditLog(actorId, AUDIT_ACTIONS.PRODUCT_UPDATED, "product", id, { archived: true });
        return { archived: true, product: updated };
    }

    await prisma.product.delete({ where: { id } });
    auditLog(actorId, AUDIT_ACTIONS.PRODUCT_DELETED, "product", id);
    return { archived: false };
}

async function makeSlugUnique(base: string, tx: PrismaTx): Promise<string> {
    let slug = base;
    let i = 1;
    while (await tx.product.findUnique({ where: { slug } })) {
        slug = `${base}-${++i}`;
    }
    return slug;
}

// ─── Analytics (seller & admin) ──────────────────────────────────────────

export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "year" | "custom";

export function rangeFor(range: RangeKey, from?: Date, to?: Date): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end);
    switch (range) {
        case "today":
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case "yesterday": {
            const s = new Date(end);
            s.setDate(s.getDate() - 1);
            s.setHours(0, 0, 0, 0);
            const e = new Date(s);
            e.setDate(e.getDate() + 1);
            return { start: s, end: e };
        }
        case "7d":
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case "30d":
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case "90d":
            start.setDate(start.getDate() - 90);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case "year":
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case "custom":
            return { start: from ?? new Date(0), end: to ?? new Date() };
    }
}

export interface Kpis {
    revenue: number;
    netRevenue: number;
    orders: number;
    refunds: number;
    aov: number;
    products: number;
    customers: number;
    lowStock: number;
    pendingOrders: number;
}

export async function sellerKpis(sellerId: string, range: RangeKey, from?: Date, to?: Date): Promise<Kpis> {
    const { start, end } = rangeFor(range, from, to);

    // Revenue, refunds and distinct customers via one parameterized raw query —
    // Prisma aggregate cannot compute SUM(price * quantity) or cross-table distinct.
    const [money, refundsAgg, productCount, lowStock, pendingOrders, orderCount] = await Promise.all([
        prisma.$queryRaw<Array<{ revenue: number; customers: number }>>`
            SELECT COALESCE(SUM(oi.price * oi.quantity), 0)::float AS revenue,
                   COUNT(DISTINCT o."userId")::int AS customers
            FROM "orderitem" oi
            JOIN "product" p ON p.id = oi."productId"
            JOIN "order" o ON o.id = oi."orderId"
            WHERE p."sellerId" = ${sellerId}
              AND o.status <> 'CANCELLED'
              AND o."paymentStatus" = 'PAID'
              AND oi."createdAt" >= ${start}
              AND oi."createdAt" < ${end}
        `,
        prisma.refund.aggregate({
            where: {
                status: { in: ["APPROVED", "COMPLETED"] },
                order: { items: { some: { product: { sellerId } } }, createdAt: { gte: start, lt: end } },
            },
            _sum: { amount: true },
        }),
        prisma.product.count({ where: { sellerId } }),
        prisma.product.count({ where: { sellerId, stock: { lte: 5 } } }),
        prisma.order.count({ where: { status: "PENDING", items: { some: { product: { sellerId } } } } }),
        prisma.order.count({
            where: {
                paymentStatus: "PAID",
                status: { not: "CANCELLED" },
                items: { some: { product: { sellerId } } },
                createdAt: { gte: start, lt: end },
            },
        }),
    ]);

    const revenue = Math.round(money[0]?.revenue ?? 0);
    const customers = money[0]?.customers ?? 0;
    const refunds = refundsAgg._sum.amount ?? 0;
    const orders = orderCount;

    return {
        revenue: Math.round(revenue * 100) / 100,
        netRevenue: Math.max((Math.round(revenue * 100) / 100 - refunds), 0),
        orders,
        refunds,
        aov: orders > 0 ? Math.round(revenue / orders * 100) / 100 : 0,
        products: productCount,
        customers,
        lowStock,
        pendingOrders,
    };
}

export async function sellerSeries(sellerId: string, range: RangeKey, from?: Date, to?: Date) {
    const { start, end } = rangeFor(range, from, to);
    const days = Math.max(1, Math.min(92, Math.ceil((end.getTime() - start.getTime()) / 86_400_000)));
    // Daily revenue via raw SQL (parameterized, read-only).
    const rows = await prisma.$queryRaw<Array<{ day: string; revenue: number; orders: number }>>`
        SELECT to_char(DATE_TRUNC('day', oi."createdAt"), 'YYYY-MM-DD') AS day,
               COALESCE(SUM(oi.price * oi.quantity), 0)::float AS revenue,
               COUNT(DISTINCT oi."orderId")::int AS orders
        FROM "orderitem" oi
        JOIN "product" p ON p.id = oi."productId"
        JOIN "order" o ON o.id = oi."orderId"
        WHERE p."sellerId" = ${sellerId}
          AND o.status <> 'CANCELLED'
          AND o."paymentStatus" = 'PAID'
          AND oi."createdAt" >= ${start}
          AND oi."createdAt" < ${end}
        GROUP BY 1
        ORDER BY 1
    `;
    const map = new Map(rows.map((r) => [r.day, r]));
    const series: { day: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        series.push({ day: key, revenue: map.get(key)?.revenue ?? 0, orders: map.get(key)?.orders ?? 0 });
    }
    return series;
}

export async function topSellerProducts(sellerId: string, range: RangeKey, from?: Date, to?: Date, limit = 5) {
    const { start, end } = rangeFor(range, from, to);
    // Revenue per product requires SUM(price * quantity), so use raw SQL.
    const rows = await prisma.$queryRaw<Array<{ productId: string; quantity: number; revenue: number }>>`
        SELECT p.id AS "productId",
               SUM(oi.quantity)::int AS "quantity",
               COALESCE(SUM(oi.price * oi.quantity), 0)::float AS "revenue"
        FROM "orderitem" oi
        JOIN "product" p ON p.id = oi."productId"
        JOIN "order" o ON o.id = oi."orderId"
        WHERE p."sellerId" = ${sellerId}
          AND o.status <> 'CANCELLED'
          AND o."paymentStatus" = 'PAID'
          AND oi."createdAt" >= ${start}
          AND oi."createdAt" < ${end}
        GROUP BY p.id
        ORDER BY "quantity" DESC
        LIMIT ${limit}
    `;
    const products = await prisma.product.findMany({
        where: { id: { in: rows.map((r) => r.productId) } },
        select: { id: true, title: true, image: true, mainImage: true, slug: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    return rows.map((r) => ({
        product: byId.get(r.productId) ?? null,
        quantity: r.quantity,
        revenue: Math.round(r.revenue * 100) / 100,
    }));
}

export async function sellerCustomers(sellerId: string, range: RangeKey, from?: Date, to?: Date) {
    const { start, end } = rangeFor(range, from, to);
    // Distinct buyers of this seller's products in the range, with order counts.
    const rows = await prisma.$queryRaw<Array<{ userId: string; orders: number; items: number }>>`
        SELECT o."userId",
               COUNT(DISTINCT o.id)::int AS "orders",
               COALESCE(SUM(oi.quantity), 0)::int AS "items"
        FROM "order" o
        JOIN "orderitem" oi ON oi."orderId" = o.id
        JOIN "product" p ON p.id = oi."productId"
        WHERE p."sellerId" = ${sellerId}
          AND o.status <> 'CANCELLED'
          AND o."createdAt" >= ${start}
          AND o."createdAt" < ${end}
        GROUP BY o."userId"
        ORDER BY "orders" DESC
    `;
    const users = await prisma.user.findMany({
        where: { id: { in: rows.map((r) => r.userId) } },
        select: { id: true, name: true, email: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    return rows.map((r) => ({
        id: r.userId,
        name: byId.get(r.userId)?.name ?? "Customer",
        email: byId.get(r.userId)?.email ?? "",
        orders: r.orders,
        items: r.items,
    }));
}
