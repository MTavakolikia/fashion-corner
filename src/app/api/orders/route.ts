import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validations/order';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const validatedData = createOrderSchema.parse(body);

        const productIds = validatedData.items.map(item => item.productId);
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true },
        });

        const existingProductIds = new Set(existingProducts.map(p => p.id));

        const invalidItems = validatedData.items.filter(item => !existingProductIds.has(item.productId));
        if (invalidItems.length > 0) {
            return NextResponse.json(
                { error: `Some products do not exist: ${invalidItems.map(i => i.productId).join(', ')}` },
                { status: 400 }
            );
        }

        const address = await prisma.address.create({
            data: {
                id: `addr_${crypto.randomUUID()}`,
                userId,
                ...validatedData.shippingAddress,
                isDefault: false,
                updatedAt: new Date(),
            },
        });

        const order = await prisma.order.create({
            data: {
                id: `order_${crypto.randomUUID()}`,
                userId,
                status: 'PENDING',
                total: validatedData.total,
                addressId: address.id,
                updatedAt: new Date(),
            },
        });

        await prisma.orderitem.createMany({
            data: validatedData.items.map(item => ({
                id: `item_${crypto.randomUUID()}`,
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                updatedAt: new Date(),
            })),
        });

        const completeOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
            },
        });

        if (!completeOrder) {
            throw new Error('Order not found after creation.');
        }

        await Promise.all(
            validatedData.items.map(item =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                })
            )
        );

        return NextResponse.json(completeOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const cleanedOrders = orders.map(order => ({
            ...order,
            items: order.items.filter(item => {
                if (!item.product) {
                    console.warn(`Warning: OrderItem with ID ${item.id} has a missing product.`);
                    return false;
                }
                return true;
            }),
        }));

        return NextResponse.json(cleanedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
