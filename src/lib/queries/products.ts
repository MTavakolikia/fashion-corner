import { prisma } from '@/lib/prisma';

export async function getProducts() {
    return await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
}
