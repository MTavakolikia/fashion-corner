"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { RippleButton } from '@/components/magicui/ripple-button';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
    productId: string;
}

export function WishlistButton({ productId }: WishlistButtonProps) {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [isWished, setIsWished] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        fetch(`/api/wishlist`)
            .then(r => r.json())
            .then(data => {
                setIsWished(data.some((w: any) => w.productId === productId));
            });
    }, [isLoaded, isSignedIn, productId]);

    const toggle = async () => {
        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }
        setLoading(true);
        if (isWished) {
            await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
            setIsWished(false);
        } else {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });
            setIsWished(true);
        }
        setLoading(false);
    };

    return (
        <RippleButton
            onClick={toggle}
            disabled={loading}
            rippleColor="#ef4444"
            title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="h-14 w-14 shrink-0 rounded-xl p-0"
        >
            <Heart className={cn('h-5 w-5', isWished && 'fill-red-500 text-red-500')} />
        </RippleButton>
    );
}
