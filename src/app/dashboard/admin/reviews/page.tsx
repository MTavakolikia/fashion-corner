import { getAuthedUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ productId?: string; page?: string }> }) {
    const authed = await getAuthedUser({ roles: ["ADMIN"] });
    requireAdmin(authed);
    const params = await searchParams;
    const page = parseInt(params.page ?? "1", 10);
    const limit = 20;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: { user: { select: { name: true, email: true } }, product: { select: { id: true, title: true, slug: true } } },
        }),
        prisma.review.count({ where: { isHidden: false } }),
    ]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews</h2>
            <form method="GET" className="flex gap-3">
                <input name="productId" placeholder="Filter by product ID..." defaultValue={params.productId} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Filter</button>
            </form>
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground">No reviews found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((r) => (
                        <ReviewCard key={r.id} review={r} />
                    ))}
                </div>
            )}
            {total > limit && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Previous</Link>}
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    {page * limit < total && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Next</Link>}
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review }: { review: any }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">{review.user?.name?.[0] ?? "U"}</div>
                    <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{review.user?.name ?? "Anonymous"}</p>
                        <Link href={`/products/${review.product.slug || review.product.id}`} className="text-sm text-primary hover:underline">{review.product.title}</Link>
                        <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        {review.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{review.comment}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <ModerateButtons reviewId={review.id} />
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
    );
}

function ModerateButtons({ reviewId }: { reviewId: string }) {
    return (
        <div className="flex gap-1">
            <form action={async () => {
                await fetch("/api/admin/reviews", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reviewId, hidden: true }),
                });
            }}>
                <button type="submit" className="text-xs text-red-600 hover:underline">Hide</button>
            </form>
        </div>
    );
}
