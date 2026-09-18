import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://mohammadtavakolikia.ir';
    return [
        { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${base}/products`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${base}/new-arrivals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${base}/sale`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/shipping`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/returns`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/size-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${base}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ];
}
