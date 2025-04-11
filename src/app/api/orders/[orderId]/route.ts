import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    _request: Request,
    {
        params,
    }: {
        params: Promise<{ orderId: string }>
    }
) {
    try {
        const { userId } = await auth();
        const { orderId } = await params
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                userId
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                title: true,
                                image: true
                            }
                        }
                    }
                },
                shippingAddress: true
            }
        });

        if (!order) {
            return new NextResponse('Order not found', { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('[ORDER_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
} 