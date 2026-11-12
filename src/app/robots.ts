import type { MetadataRoute } from 'next';

const SITE_ADRESI = process.env.NEXT_PUBLIC_SITE_URL || 'https://1453istanbul.com.tr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${SITE_ADRESI}/sitemap.xml`,
  };
}
