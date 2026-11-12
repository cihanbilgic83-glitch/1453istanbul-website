'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { optimizeEdilemez } from '@/lib/gorsel';
import type { GaleriOge } from '@/lib/types';
import SayfaBasligi from '@/components/ui/SayfaBasligi';

export default function GaleriClient({ galeri }: { galeri: GaleriOge[] }) {
  const kategoriler = ['Tümü', ...Array.from(new Set(galeri.map((g) => g.kategori)))];
  const [aktif, setAktif] = useState('Tümü');
  const [sira, setSira] = useState<number | null>(null);

  const liste = (aktif === 'Tümü' ? galeri : galeri.filter((g) => g.kategori === aktif)).filter((g) => g.gorsel);
  const secili = sira === null ? null : liste[sira];

  const kapat = useCallback(() => setSira(null), []);
  const git = useCallback((yon: 1 | -1) => setSira((s) => (s === null ? s : (s + yon + liste.length) % liste.length)), [liste.length]);

  useEffect(() => {
    if (sira === null) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') kapat();
      if (e.key === 'ArrowRight') git(1);
      if (e.key === 'ArrowLeft') git(-1);
    };
    window.addEventListener('keydown', tus);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', tus); document.body.style.overflow = ''; };
  }, [sira, kapat, git]);

  return (
    <div className="bg-fildisi min-h-screen">
      <SayfaBasligi etiket="Galeri" baslik="Fotoğraf galerisi" aciklama="Maçlar, törenler, altyapı ve kulüp hayatından kareler." />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 md:py-14">
        <div role="tablist" aria-label="Galeri kategorileri" className="flex gap-6 overflow-x-auto border-b border-cizgi">
          {kategoriler.map((kat) => (
            <button key={kat} type="button" role="tab" aria-selected={aktif === kat} onClick={() => { setAktif(kat); setSira(null); }}
              className={`shrink-0 pb-3 -mb-px border-b-2 text-sm font-semibold tracking-wide transition-colors ${aktif === kat ? 'border-al text-zumrut' : 'border-transparent text-kursun hover:text-zumrut'}`}>
              {kat}
            </button>
          ))}
        </div>

        {liste.length > 0 ? (
          <ul className="mt-10 columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 [&>li]:mb-3 md:[&>li]:mb-4">
            {liste.map((foto, i) => (
              <li key={foto.id} className="break-inside-avoid">
                <button type="button" onClick={() => setSira(i)} className="group relative block w-full overflow-hidden bg-gece" aria-label={`${foto.baslik} fotoğrafını büyüt`}>
                  <Image src={foto.gorsel} alt={foto.baslik} width={800} height={600}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" unoptimized={optimizeEdilemez(foto.gorsel)} />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-left bg-gradient-to-t from-gece/90 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                    <span className="block text-white text-sm font-semibold">{foto.baslik}</span>
                    <span className="block text-mat text-xs">{foto.kategori}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-20 text-center text-kursun">Bu kategoride fotoğraf yok.</p>
        )}
      </div>

      {secili && (
        <div role="dialog" aria-modal="true" aria-label={secili.baslik} className="fixed inset-0 z-[60] bg-gece/95 flex flex-col" onClick={kapat}>
          <div className="flex justify-between items-center px-5 py-4 text-krem text-sm" onClick={(e) => e.stopPropagation()}>
            <span className="rakam">{(sira ?? 0) + 1} / {liste.length}</span>
            <button type="button" onClick={kapat} className="w-11 h-11 border border-krem/40 hover:border-white text-white text-xl" aria-label="Kapat">×</button>
          </div>
          <div className="relative flex-1 mx-4 md:mx-20" onClick={(e) => e.stopPropagation()}>
            <Image src={secili.gorsel} alt={secili.baslik} fill className="object-contain" sizes="100vw" unoptimized={optimizeEdilemez(secili.gorsel)} />
          </div>
          <div className="px-5 py-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-white font-baslik font-bold uppercase text-xl">{secili.baslik}</p>
            {secili.aciklama && <p className="text-[#B9C2B8] text-sm mt-1">{secili.aciklama}</p>}
          </div>
          {liste.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); git(-1); }} aria-label="Önceki fotoğraf"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-gece/80 border border-krem/40 text-white text-2xl">‹</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); git(1); }} aria-label="Sonraki fotoğraf"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-gece/80 border border-krem/40 text-white text-2xl">›</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
