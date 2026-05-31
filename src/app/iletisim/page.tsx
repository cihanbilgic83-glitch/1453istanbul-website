import type { Metadata } from 'next';
import { getSiteAyarlari } from '@/lib/data';
import IletisimClient from './IletisimClient';

export const metadata: Metadata = {
  title: 'İletişim',
  description: '1453 İstanbul AS Spor Kulübü ile iletişime geçin.',
};

export const dynamic = 'force-dynamic';

export default function IletisimPage() {
  const ayarlar = getSiteAyarlari();

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A4D2E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Bize <span className="text-[#D4AF37]">Ulaşın</span>
          </h1>
          <p className="text-green-200 text-sm">Sorularınız için bizimle iletişime geçin</p>
        </div>
      </div>
      <div className="h-1 bg-[#C0392B]" />

      <IletisimClient ayarlar={ayarlar} />
    </div>
  );
}