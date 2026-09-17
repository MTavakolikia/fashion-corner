import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/ProductDetails';

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    return product;
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const product = await getProduct(id);
    return <ProductDetails product={{ ...product, image: product.image ?? product.mainImage ?? "", description: product.description ?? "", slug: product.slug ?? undefined, brand: product.brand ?? undefined, specifications: product.specifications as any, stock: product.stock, tags: product.tags ?? undefined }} />;
} 