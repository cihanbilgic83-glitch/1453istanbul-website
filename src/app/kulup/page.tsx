import type { Metadata } from 'next';
import Image from 'next/image';
import { getSiteAyarlari, getYonetim } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Kulüp',
  description: '1453 İstanbul AS Spor Kulübü hakkında bilgiler.',
};

export const dynamic = 'force-dynamic';

export default function KulupPage() {
  const ayarlar = getSiteAyarlari();
  const yonetim = getYonetim();

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A4D2E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Kulübümüz <span className="text-[#D4AF37]">Hakkında</span>
          </h1>
          <p className="text-green-200 text-sm">1453 İstanbul AS Spor Kulübü</p>
        </div>
      </div>
      <div className="h-1 bg-[#C0392B]" />

      {/* Vizyon & Misyon */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-[#1A4D2E] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vizyonumuz</h3>
              <p className="text-gray-600 leading-relaxed">{ayarlar.vizyon}</p>
            </div>
            <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-[#C0392B] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Misyonumuz</h3>
              <p className="text-gray-600 leading-relaxed">{ayarlar.misyon}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarihçe */}
      {ayarlar.tarihce.length > 0 && (
        <section className="py-16 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Kulüp <span className="text-[#C0392B]">Tarihçesi</span>
              </h2>
              <div className="mt-2 w-12 h-1 bg-[#1A4D2E] mx-auto rounded" />
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-0.5 h-full w-0.5 bg-[#1A4D2E]/20 hidden md:block" />
              <div className="space-y-8">
                {ayarlar.tarihce.map((madde, idx) => (
                  <div key={madde.yil} className={`flex flex-col md:flex-row gap-6 md:gap-0 items-start ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100 hover:border-[#1A4D2E]/30 transition-colors">
                        <div className="text-[#C0392B] font-black text-xl mb-1">{madde.yil}</div>
                        <h3 className="font-bold text-gray-900 mb-2">{madde.baslik}</h3>
                        <p className="text-gray-600 text-sm">{madde.icerik}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex w-0 items-center justify-center relative">
                      <div className="w-4 h-4 rounded-full bg-[#1A4D2E] border-4 border-white shadow-md absolute" />
                    </div>
                    <div className="md:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Başkan Mesajı */}
      {ayarlar.baskan_mesaj && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Başkan <span className="text-[#C0392B]">Mesajı</span>
              </h2>
              <div className="mt-2 w-12 h-1 bg-[#1A4D2E] mx-auto rounded" />
            </div>
            <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
              {ayarlar.baskan_gorsel && (
                <div className="relative w-28 h-28 rounded-full overflow-hidden flex-shrink-0 card-shadow border-4 border-[#1A4D2E]">
                  <Image src={ayarlar.baskan_gorsel} alt="Başkan" fill className="object-cover" sizes="112px" unoptimized />
                </div>
              )}
              <div>
                <blockquote className="text-gray-600 text-base leading-relaxed italic mb-4">
                  &ldquo;{ayarlar.baskan_mesaj}&rdquo;
                </blockquote>
                {yonetim.length > 0 && (
                  <div>
                    <div className="font-bold text-gray-900">{yonetim[0].isim}</div>
                    <div className="text-[#1A4D2E] text-sm font-medium">{yonetim[0].gorev}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Yönetim Kurulu */}
      {yonetim.length > 0 && (
        <section className="py-16 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Yönetim <span className="text-[#C0392B]">Kurulu</span>
              </h2>
              <div className="mt-2 w-12 h-1 bg-[#1A4D2E] mx-auto rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {yonetim.map((kisi) => (
                <div key={kisi.id} className="text-center group">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 card-shadow border-4 border-white group-hover:border-[#1A4D2E] transition-colors">
                    {kisi.gorsel ? (
                      <Image src={kisi.gorsel} alt={kisi.isim} fill className="object-cover" sizes="96px" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-[#1A4D2E]/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#1A4D2E]">{kisi.isim.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{kisi.isim}</div>
                  <div className="text-[#1A4D2E] text-xs font-medium mt-0.5">{kisi.gorev}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}