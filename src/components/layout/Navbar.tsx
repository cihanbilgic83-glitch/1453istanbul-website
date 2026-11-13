'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const baglantilar = [
  { href: '/', label: 'Anasayfa' },
  { href: '/kulup', label: 'Kulüp' },
  { href: '/fikstur', label: 'Fikstür' },
  { href: '/haberler', label: 'Haberler' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/iletisim', label: 'İletişim' },
];

const aktifMi = (yol: string, href: string) => (href === '/' ? yol === '/' : yol.startsWith(href));

// Sayfanın üstünde şeffaf, kaydırınca koyu yeşile dönen menü. Mobilde tam ekran panel.
export default function Navbar() {
  const [acik, setAcik] = useState(false);
  const [kaydirildi, setKaydirildi] = useState(false);
  const yol = usePathname();

  useEffect(() => {
    const dinle = () => setKaydirildi(window.scrollY > 24);
    dinle();
    window.addEventListener('scroll', dinle, { passive: true });
    return () => window.removeEventListener('scroll', dinle);
  }, []);

  useEffect(() => { setAcik(false); }, [yol]);

  useEffect(() => {
    document.body.style.overflow = acik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [acik]);

  if (yol.startsWith('/admin')) return null;

  const dolu = kaydirildi || acik;

  return (
    <>
    <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${dolu ? 'bg-gece/95 backdrop-blur shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between transition-[height] duration-300 ${dolu ? 'h-[72px]' : 'h-[88px]'} border-b ${dolu ? 'border-transparent' : 'border-mat/30'}`}>
        <Link href="/" className="flex items-center gap-3" aria-label="1453 İstanbul AS anasayfa">
          <span className="relative w-11 h-11 md:w-12 md:h-12">
            <Image src="/logo.png" alt="" fill sizes="48px" className="object-contain" priority />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-baslik font-bold text-white text-xl md:text-2xl tracking-[0.04em]">1453 İSTANBUL</span>
            <span className="text-[9px] md:text-[10px] tracking-[0.24em] text-mat mt-1">AS SPOR KULÜBÜ</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
          {baglantilar.map((b) => (
            <Link key={b.href} href={b.href}
              className={`pb-1 border-b-2 transition-colors ${aktifMi(yol, b.href) ? 'text-white border-mat' : 'text-krem/85 border-transparent hover:text-white'}`}>
              {b.label}
            </Link>
          ))}
          <Link href="/iletisim?konu=%C3%9Cyelik" className="bg-mat text-gece px-5 py-3 text-sm font-semibold hover:bg-krem transition-colors">
            Kulübümüze Katıl
          </Link>
        </div>

        <button type="button" onClick={() => setAcik((a) => !a)} aria-label={acik ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={acik} aria-controls="mobil-menu"
          className="lg:hidden w-11 h-11 border border-krem/50 flex flex-col items-center justify-center gap-[5px]">
          <span className={`block w-[18px] h-0.5 bg-white transition-transform ${acik ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block w-[18px] h-0.5 bg-white transition-opacity ${acik ? 'opacity-0' : ''}`} />
          <span className={`block w-[18px] h-0.5 bg-mat transition-transform ${acik ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

    </nav>

      {/* Mobil menü çubuğun DIŞINDA durur: çubuktaki backdrop-blur, içindeki sabit konumlu
          öğeleri çubuğun 72px yüksekliğine hapsettiği için menü görünmüyordu. */}
      {acik && (
        <div id="mobil-menu" className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 z-50 bg-gece overflow-y-auto">
          <div className="px-5 py-6 flex flex-col">
            {baglantilar.map((b) => (
              <Link key={b.href} href={b.href}
                className={`py-4 border-b border-krem/10 font-baslik font-bold text-3xl uppercase ${aktifMi(yol, b.href) ? 'text-mat' : 'text-white'}`}>
                {b.label}
              </Link>
            ))}
            <Link href="/iletisim?konu=%C3%9Cyelik" className="mt-8 bg-mat text-gece text-center py-4 font-semibold">Kulübümüze Katıl</Link>
          </div>
        </div>
      )}
    </>
  );
}
