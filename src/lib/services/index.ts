import { prisma } from "@/lib/prisma";
import { ERROR_CODES } from "@/lib/error-codes";

type AnyObj = Record<string, unknown>;

// ─── Product Service ─────────────────────────────────────────────────────────

export class ProductService {
    static async list(filters: {
        search?: string; category?: string; brand?: string;
        minPrice?: number; maxPrice?: number; sort?: string;
        page?: number; limit?: number; inStock?: boolean;
    } = {}) {
        const { search, category, brand, minPrice, maxPrice, sort, page = 1, limit = 20, inStock } = filters;
        const where: AnyObj = { status: "PUBLISHED" };
        if (search) where.OR = [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
        ];
        if (category) where.category = { equals: category, mode: "insensitive" as const };
        if (brand) where.brand = { equals: brand, mode: "insensitive" as const };
        if (minPrice !== undefined) where.price = { ...(where.price as any), gte: minPrice };
        if (maxPrice !== undefined) where.price = { ...(where.price as any), lte: maxPrice };
        if (inStock) where.stock = { gt: 0 };

        const orderBy: AnyObj = sort === "price_asc" ? { price: "asc" as const } :
                            sort === "price_desc" ? { price: "desc" as const } :
                            sort === "rating" ? { rating: "desc" as const } :
                            { createdAt: "desc" as const };

        const [products, total] = await Promise.all([
            prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
            prisma.product.count({ where }),
        ]);
        return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    static async getById(id: string) {
        return prisma.product.findUnique({ where: { id } });
    }

    static async getRelated(productId: string, limit = 8) {
        const product = await this.getById(productId);
        if (!product) return [];
        return prisma.product.findMany({
            where: { category: product.category, id: { not: productId }, status: "PUBLISHED" },
            orderBy: { rating: "desc" as const },
            take: limit,
        });
    }
}

// ─── Order Service ───────────────────────────────────────────────────────────

export class OrderService {
    static async create(userId: string, data: {
        items: { productId: string; quantity: number; price: number }[];
        shippingAddress: AnyObj;
        total: number;
    }) {
        // Validate products and check stock
        const products = await prisma.product.findMany({
            where: { id: { in: data.items.map(i => i.productId) } },
            select: { id: true, title: true, price: true, stock: true },
        });
            const productMap = new Map((products as any[]).map(p => [p.id, p]));
            const missing = data.items.filter(i => !productMap.has(i.productId));
            if (missing.length > 0) throw { code: ERROR_CODES.PRODUCT_NOT_FOUND, message: "Some products not found" };
            for (const item of data.items) {
                const p = productMap.get(item.productId) as any;
                if (p.stock < item.quantity) throw { code: ERROR_CODES.INSUFFICIENT_STOCK, message: `Insufficient stock for ${p.title}` };
        }

        const address = await prisma.address.create({
            data: { id: `addr_${crypto.randomUUID()}`, userId, fullName: "Customer", address: "Address", city: "City", state: "State", zipCode: "00000", phone: "0000000000", ...data.shippingAddress, isDefault: false, updatedAt: new Date() },
        });

        const order = await prisma.order.create({
            data: { id: `order_${crypto.randomUUID()}`, userId, status: "PENDING", total: data.total, subtotal: data.total, shippingCost: 0, tax: 0, discount: 0, addressId: address.id, updatedAt: new Date() },
        });

        await prisma.orderitem.createMany({
            data: data.items.map(i => ({ id: `item_${crypto.randomUUID()}`, orderId: order.id, ...i, updatedAt: new Date() })),
        });
        await Promise.all(data.items.map(i =>
            prisma.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } })
        ));

        return prisma.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { product: true } }, shippingAddress: true },
        });
    }

    static async getUserOrders(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            prisma.order.findMany({ where: { userId }, skip, take: limit, orderBy: { createdAt: "desc" as const }, include: { items: { include: { product: true } }, shippingAddress: true } }),
            prisma.order.count({ where: { userId } }),
        ]);
        return { orders, total, page, limit };
    }

    static async getById(id: string, userId: string) {
        return prisma.order.findUnique({ where: { id, userId }, include: { items: { include: { product: true } }, shippingAddress: true } });
    }
}

// ─── Wishlist Service ────────────────────────────────────────────────────────

export class WishlistService {
    static async get(userId: string) {
        const items = await prisma.wishlist.findMany({ where: { userId }, orderBy: { createdAt: "desc" as const } });
        const withProducts = await Promise.all(items.map(async w => {
            const product = await prisma.product.findUnique({ where: { id: w.productId } });
            return product ? { ...w, product } : null;
        }));
        return withProducts.filter(Boolean);
    }

    static async add(userId: string, productId: string) {
        try {
            return prisma.wishlist.create({ data: { id: `wish_${crypto.randomUUID()}`, userId, productId, updatedAt: new Date() } });
        } catch { throw { code: ERROR_CODES.CONFLICT, message: "Already in wishlist" }; }
    }

    static async remove(userId: string, productId: string) {
        await prisma.wishlist.deleteMany({ where: { userId, productId } });
    }

    static async isInWishlist(userId: string, productId: string) {
        const w = await prisma.wishlist.findFirst({ where: { userId, productId } });
        return !!w;
    }
}

// ─── Review Service ──────────────────────────────────────────────────────────

export class ReviewService {
    static async getByProduct(productId: string) {
        return prisma.review.findMany({ where: { productId }, orderBy: { createdAt: "desc" as const }, take: 20 });
    }

    static async create(userId: string, productId: string, data: { rating: number; comment?: string }) {
        const existing = await prisma.review.findFirst({ where: { userId, productId } });
        if (existing) throw { code: ERROR_CODES.ALREADY_REVIEWED };
        const review = await prisma.review.create({ data: { id: `rev_${crypto.randomUUID()}`, userId, productId, ...data, updatedAt: new Date() } });
        const all = await prisma.review.findMany({ where: { productId } });
        const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
        await prisma.product.update({ where: { id: productId }, data: { rating: parseFloat(avg.toFixed(1)), ratingCount: all.length } });
        return review;
    }
}

// ─── Address Service ─────────────────────────────────────────────────────────

export class AddressService {
    static async list(userId: string) {
        return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" as const } });
    }

    static async create(userId: string, data: Record<string, unknown>) {
        return prisma.address.create({ data: { id: `addr_${crypto.randomUUID()}`, userId, fullName: "", address: "", city: "", state: "", zipCode: "", phone: "", ...data, isDefault: false, updatedAt: new Date() } } as any);
    }

    static async update(userId: string, id: string, data: AnyObj) {
        return prisma.address.update({ where: { id, userId }, data: { ...data, updatedAt: new Date() } });
    }

    static async delete(userId: string, id: string) {
        await prisma.address.delete({ where: { id, userId } });
    }
}

// ─── Category / Brand Service ────────────────────────────────────────────────

export class CategoryService {
    static async list() { return prisma.category.findMany({ orderBy: { name: "asc" } }); }
    static async getBySlug(slug: string) { return prisma.category.findFirst({ where: { slug } }); }
}

export class BrandService {
    static async list() { return prisma.brand.findMany({ orderBy: { name: "asc" } }); }
    static async getBySlug(slug: string) { return prisma.brand.findFirst({ where: { slug } }); }
}
