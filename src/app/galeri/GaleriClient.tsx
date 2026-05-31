'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { GaleriOge } from '@/lib/types';

export default function GaleriClient({ galeri }: { galeri: GaleriOge[] }) {
  const kategoriler = ['Tümü', ...Array.from(new Set(galeri.map((g) => g.kategori)))];
  const [aktif, setAktif] = useState('Tümü');
  const [secili, setSecili] = useState<GaleriOge | null>(null);

  const filtrelenmis = aktif === 'Tümü' ? galeri : galeri.filter((g) => g.kategori === aktif);

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A4D2E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Fotoğraf <span className="text-[#D4AF37]">Galerisi</span>
          </h1>
          <p className="text-green-200 text-sm">Maçlar, etkinlikler ve özel anlar</p>
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtrelenmis.map((foto) => (
            <div key={foto.id} onClick={() => setSecili(foto)}
              className="group cursor-pointer relative aspect-square rounded-xl overflow-hidden card-shadow border border-gray-100 hover:border-[#1A4D2E]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <Image src={foto.gorsel} alt={foto.baslik} fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A4D2E]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-semibold">{foto.baslik}</p>
                  <p className="text-green-200 text-xs">{foto.kategori}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtrelenmis.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-medium">Bu kategoride fotoğraf yok.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {secili && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSecili(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSecili(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl font-bold transition-colors z-10">
              ✕
            </button>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image src={secili.gorsel} alt={secili.baslik} fill className="object-contain" unoptimized />
            </div>
            <div className="mt-4 text-center">
              <p className="text-white font-semibold">{secili.baslik}</p>
              <p className="text-gray-400 text-sm mt-1">{secili.aciklama}</p>
              <span className="inline-block mt-2 bg-[#C0392B] text-white text-xs px-2.5 py-1 rounded-full">{secili.kategori}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}