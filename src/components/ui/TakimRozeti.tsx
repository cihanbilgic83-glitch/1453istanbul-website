import Image from 'next/image';
import { bizimTakimMi } from '@/lib/takim';

// Bizim takım için arma, rakip için baş harfli yuvarlak rozet.
export default function TakimRozeti({ ad, boyut = 56 }: { ad: string; boyut?: number }) {
  if (bizimTakimMi(ad)) {
    return (
      <span className="relative inline-block shrink-0" style={{ width: boyut, height: boyut }}>
        <Image src="/logo.png" alt="" fill sizes={`${boyut}px`} className="object-contain" />
      </span>
    );
  }
  const basHarfler = ad.split(/\s+/).filter(Boolean).slice(0, 2).map((k) => k.charAt(0).toLocaleUpperCase('tr-TR')).join('');
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-full bg-krem text-kursun font-baslik font-bold"
      style={{ width: boyut, height: boyut, fontSize: boyut * 0.36 }}>
      {basHarfler}
    </span>
  );
}
