"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface ReviewFormProps {
    productId: string;
    onSubmitted: () => void;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
    const { isSignedIn } = useUser();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating < 1) { toast.error('Please select a star rating'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, comment }),
            });
            if (res.status === 409) { toast.error('You already reviewed this product'); return; }
            if (!res.ok) throw new Error();
            toast.success('Review submitted!');
            setRating(0);
            setComment('');
            onSubmitted();
        } catch {
            toast.error('Failed to submit review');
        }
        setSubmitting(false);
    };

    if (!isSignedIn) {
        return <p className="text-sm text-muted-foreground">Please <Link href="/sign-in" className="text-primary underline">sign in</Link> to leave a review.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button type="button" key={n} onClick={() => setRating(n)} className="focus:outline-none">
                            <Star className={`h-6 w-6 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">Comment (optional)</label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Share your thoughts about this product..."
                />
            </div>
            <button
                type="submit"
                disabled={submitting || rating === 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
