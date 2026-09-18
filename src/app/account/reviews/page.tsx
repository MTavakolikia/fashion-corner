import { AccountShell } from "@/components/account/AccountShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function ReviewsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const reviews = await prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { product: { select: { id: true, title: true, image: true, mainImage: true, slug: true } } },
        take: 20,
    });

    return (
        <AccountShell title="My Reviews">
            {reviews.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </AccountShell>
    );
}

function ReviewCard({ review }: { review: any }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex gap-4">
                <Link href={`/products/${review.product.id}`} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={review.product.image ?? review.product.mainImage} alt="" className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <Link href={`/products/${review.product.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary line-clamp-1">
                                {review.product.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                {review.verified && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">Verified</span>}
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.comment && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{review.comment}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-muted-foreground mb-3">You haven&apos;t written any reviews yet</p>
            <Link href="/products" className="text-primary hover:underline text-sm">Browse Products</Link>
        </div>
    );
}
