import { getAuthedUser, requireActiveSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SellerReviewsPage() {
    const authed = await getAuthedUser({ roles: ["SELLER", "ADMIN"], requireSellerActive: true });

    const reviews = await prisma.review.findMany({
        where: { product: { sellerId: authed.user.id }, isHidden: false },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, picture: true } } },
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Reviews</h2>
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-muted-foreground">No reviews yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review }: { review: any }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {review.user?.name?.[0] ?? "U"}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{review.user?.name ?? "Anonymous"}</span>
                        {review.verified && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">Verified</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                    </div>
                    {review.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{review.comment}</p>}
                    {review.sellerResponse && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm">
                            <span className="font-medium text-blue-700 dark:text-blue-400">Seller response:</span>{" "}
                            <span className="text-gray-700 dark:text-gray-300">{review.sellerResponse}</span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
