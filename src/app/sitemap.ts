import type { MetadataRoute } from 'next';
import { getHaberler } from '@/lib/data';

const SITE_ADRESI = process.env.NEXT_PUBLIC_SITE_URL || 'https://1453istanbul.com.tr';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sabitSayfalar = ['', '/kulup', '/fikstur', '/haberler', '/galeri', '/iletisim'].map((yol) => ({
    url: `${SITE_ADRESI}${yol}`,
    changeFrequency: 'weekly' as const,
    priority: yol === '' ? 1 : 0.7,
  }));
  const haberler = (await getHaberler()).map((haber) => ({
    url: `${SITE_ADRESI}/haberler/${haber.slug}`,
    lastModified: haber.tarih ? new Date(haber.tarih) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  return [...sabitSayfalar, ...haberler];
}
