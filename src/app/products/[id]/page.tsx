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

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);
    return <ProductDetails product={product} />;
} 