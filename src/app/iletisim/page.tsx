import type { Metadata } from 'next';
import { getSiteAyarlari } from '@/lib/data';
import IletisimClient from './IletisimClient';
import SayfaBasligi from '@/components/ui/SayfaBasligi';

export const metadata: Metadata = {
  title: 'İletişim',
  description: '1453 İstanbul AS Spor Kulübü ile iletişime geçin: altyapı seçmeleri, üyelik ve sponsorluk.',
};

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ konu?: string }> };

export default async function IletisimPage({ searchParams }: Props) {
  const [ayarlar, { konu }] = await Promise.all([getSiteAyarlari(), searchParams]);
  return (
    <div className="bg-fildisi min-h-screen">
      <SayfaBasligi etiket="İletişim" baslik="Bize ulaşın" aciklama="Kapımız 1453'lü olmak isteyen herkese açık." />
      <IletisimClient ayarlar={ayarlar} baslangicKonusu={konu} />
    </div>
  );
}
