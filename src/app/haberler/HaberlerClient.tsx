'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Haber } from '@/lib/types';
import HaberKapak from '@/components/haber/HaberKapak';
import SayfaBasligi from '@/components/ui/SayfaBasligi';

const tarihYaz = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function HaberlerClient({ haberler }: { haberler: Haber[] }) {
  const kategoriler = ['Tümü', ...Array.from(new Set(haberler.map((h) => h.kategori)))];
  const [aktif, setAktif] = useState('Tümü');
  const liste = aktif === 'Tümü' ? haberler : haberler.filter((h) => h.kategori === aktif);
  const [manset, ...digerleri] = liste;

  return (
    <div className="bg-fildisi min-h-screen">
      <SayfaBasligi etiket="Haberler" baslik="Kulüpten haberler" aciklama="Transferler, maçlar, altyapı ve kulüp duyuruları." />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 md:py-14">
        <div role="tablist" aria-label="Haber kategorileri" className="flex gap-6 overflow-x-auto border-b border-cizgi">
          {kategoriler.map((kat) => (
            <button key={kat} type="button" role="tab" aria-selected={aktif === kat} onClick={() => setAktif(kat)}
              className={`shrink-0 pb-3 -mb-px border-b-2 text-sm font-semibold tracking-wide transition-colors ${aktif === kat ? 'border-al text-zumrut' : 'border-transparent text-kursun hover:text-zumrut'}`}>
              {kat}
            </button>
          ))}
        </div>

        {manset ? (
          <>
            <Link href={`/haberler/${manset.slug}`} className="group mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              <div className="relative lg:col-span-7 aspect-[16/9] overflow-hidden bg-gece">
                <HaberKapak gorsel={manset.gorsel} baslik={manset.baslik} sizes="(max-width: 1024px) 100vw, 60vw" oncelikli
                  className="transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="lg:col-span-5">
                <span className="text-xs tracking-[0.2em] text-al font-semibold uppercase">{manset.kategori} · {tarihYaz(manset.tarih)}</span>
                <h2 className="mt-3 font-baslik font-bold text-zumrut text-4xl md:text-5xl leading-[1.02] group-hover:text-al transition-colors">{manset.baslik}</h2>
                {manset.ozet && <p className="mt-4 text-[#3A423E] text-lg leading-relaxed line-clamp-3">{manset.ozet}</p>}
                <span className="inline-block mt-5 text-sm font-semibold text-zumrut border-b border-zumrut pb-0.5">Haberi oku</span>
              </div>
            </Link>

            {digerleri.length > 0 && (
              <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {digerleri.map((haber) => (
                  <Link key={haber.id} href={`/haberler/${haber.slug}`} className="group flex flex-col">
                    <div className="relative aspect-[3/2] overflow-hidden bg-gece">
                      <HaberKapak gorsel={haber.gorsel} baslik={haber.baslik} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="transition-transform duration-500 group-hover:scale-[1.03]" />
                    </div>
                    <span className="mt-4 text-[11px] tracking-[0.2em] text-al font-semibold uppercase">{haber.kategori} · {tarihYaz(haber.tarih)}</span>
                    <span className="mt-2 font-baslik font-bold text-zumrut text-2xl leading-tight line-clamp-3 group-hover:text-al transition-colors">{haber.baslik}</span>
                    {haber.ozet && <span className="mt-2 text-[15px] text-[#3A423E] leading-relaxed line-clamp-2">{haber.ozet}</span>}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="py-20 text-center text-kursun">Bu kategoride haber bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
