import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://mohammadtavakolikia.ir';
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/account', '/dashboard', '/checkout', '/api/'],
        },
        sitemap: `${base}/sitemap.xml`,
    };
}
