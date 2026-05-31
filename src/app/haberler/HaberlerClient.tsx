'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Haber } from '@/lib/types';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HaberlerClient({ haberler }: { haberler: Haber[] }) {
  const kategoriler = ['Tümü', ...Array.from(new Set(haberler.map((h) => h.kategori)))];
  const [aktif, setAktif] = useState('Tümü');

  const filtrelenmis = aktif === 'Tümü' ? haberler : haberler.filter((h) => h.kategori === aktif);

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A4D2E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Son <span className="text-[#D4AF37]">Haberler</span>
          </h1>
          <p className="text-green-200 text-sm">Kulüpten son gelişmeler ve duyurular</p>
        </div>
      </div>
      <div className="h-1 bg-[#C0392B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Kategori filtreleri */}
        <div className="flex gap-2 flex-wrap mb-8">
          {kategoriler.map((kat) => (
            <button key={kat} onClick={() => setAktif(kat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                aktif === kat
                  ? 'bg-[#1A4D2E] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1A4D2E] hover:text-[#1A4D2E] card-shadow'
              }`}>
              {kat}
            </button>
          ))}
        </div>

        {/* Haber Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenmis.map((haber) => (
            <Link key={haber.id} href={`/haberler/${haber.slug}`}
              className="group bg-white rounded-xl overflow-hidden card-shadow border border-gray-100 hover:border-[#1A4D2E]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <Image src={haber.gorsel} alt={haber.baslik} fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#C0392B] text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                    {haber.kategori}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-bold text-gray-900 group-hover:text-[#1A4D2E] transition-colors line-clamp-2 mb-2 text-base">
                  {haber.baslik}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{haber.ozet}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(haber.tarih)}</span>
                  <span className="text-[#1A4D2E] font-semibold group-hover:text-[#C0392B] transition-colors">Devamını oku →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtrelenmis.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-medium">Bu kategoride haber bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}