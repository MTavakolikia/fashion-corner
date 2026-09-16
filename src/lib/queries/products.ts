import { prisma } from '@/lib/prisma';

export async function getProducts() {
    try {
        return await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch {
        return [];
    }
}
