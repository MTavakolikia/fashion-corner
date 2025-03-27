import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const products = await request.json()

        if (!Array.isArray(products)) {
            return NextResponse.json(
                { error: 'Request body must be an array of products' },
                { status: 400 }
            )
        }

        let importedCount = 0

        for (const product of products) {
            // Check if product already exists
            const existingProduct = await prisma.product.findUnique({
                where: { externalId: product.id.toString() }
            })

            if (!existingProduct) {
                await prisma.product.create({
                    data: {
                        id: `prod_${product.id}`,
                        externalId: product.id.toString(),
                        title: product.title,
                        price: product.price,
                        description: product.description,
                        category: product.category.name,
                        image: product.images[0], // Use first image as main image
                        rating: product.rating?.rate || 0,
                        ratingCount: product.rating?.count || 0,
                        updatedAt: new Date(),
                    }
                })
                importedCount++
            }
        }

        return NextResponse.json({
            success: true,
            count: importedCount,
            message: `Successfully imported ${importedCount} products`
        })
    } catch (error) {
        console.error('Error importing products:', error)
        return NextResponse.json(
            { error: 'Failed to import products' },
            { status: 500 }
        )
    }
} 