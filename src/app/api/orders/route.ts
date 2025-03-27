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

        // First, create the shipping address
        const address = await prisma.address.create({
            data: {
                id: `addr_${Date.now()}`,
                userId,
                ...validatedData.shippingAddress,
                isDefault: false,
                updatedAt: new Date(),
            },
        });

        // Then create the order with the address ID
        const order = await prisma.order.create({
            data: {
                id: `order_${Date.now()}`,
                userId,
                status: 'PENDING',
                total: validatedData.total,
                addressId: address.id,
                updatedAt: new Date(),
            },
        });

        // Create order items
        await Promise.all(
            validatedData.items.map(item =>
                prisma.orderitem.create({
                    data: {
                        id: `item_${Date.now()}_${item.productId}`,
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        updatedAt: new Date(),
                    },
                })
            )
        );

        // Fetch the complete order with items and address
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

        // Update product stock
        await Promise.all(
            validatedData.items.map(item =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 