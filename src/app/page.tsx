import Image from 'next/image';
import Link from 'next/link';
import { getMaclar, getHaberler, getPuanTablosu, getSiteAyarlari, getSponsorlar } from '@/lib/data';
import type { Mac, Haber, PuanTablosu } from '@/lib/types';

export const dynamic = 'force-dynamic';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function MacKarti({ mac }: { mac: Mac }) {
  const bizimTakim = '1453 İstanbul AS';
  const biz = mac.ev_sahibi === bizimTakim ? 'ev' : 'dep';

  return (
    <div className="bg-white rounded-xl p-5 card-shadow border border-gray-100 hover:border-[#1A4D2E]/30 transition-all duration-300">
      <div className="text-center text-xs text-gray-400 mb-3 font-medium">
        {formatDate(mac.tarih)} — {mac.saat}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <div className={`font-bold text-sm ${biz === 'ev' ? 'text-[#1A4D2E]' : 'text-gray-600'}`}>
            {mac.ev_sahibi}
          </div>
        </div>
        <div className="flex items-center gap-2 min-w-[80px] justify-center">
          {mac.durum === 'tamamlandi' ? (
            <div className="bg-[#1A4D2E] rounded-lg px-3 py-1 text-white font-bold text-lg">
              {mac.ev_gol} - {mac.mis_gol}
            </div>
          ) : (
            <div className="bg-[#C0392B]/10 border border-[#C0392B]/40 rounded-lg px-3 py-1 text-[#C0392B] font-bold text-sm">
              VS
            </div>
          )}
        </div>
        <div className="flex-1 text-left">
          <div className={`font-bold text-sm ${biz === 'dep' ? 'text-[#1A4D2E]' : 'text-gray-600'}`}>
            {mac.misafir}
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-2">{mac.stadyum}</div>
    </div>
  );
}

export default async function HomePage() {
  const [maclar, haberlerAll, puanAll, ayarlar, sponsorlar] = await Promise.all([
    getMaclar(),
    getHaberler(),
    getPuanTablosu(),
    getSiteAyarlari(),
    getSponsorlar(),
  ]);
  const haberler = haberlerAll.slice(0, 3);
  const puanTablosu = puanAll.slice(0, 5);

  const sonMac = maclar
    .filter((m: Mac) => m.durum === 'tamamlandi')
    .sort((a: Mac, b: Mac) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())[0];

  const gelecekMac = maclar
    .filter((m: Mac) => m.durum === 'gelecek')
    .sort((a: Mac, b: Mac) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime())[0];

  const bizimSira = puanAll.findIndex((t: PuanTablosu) => t.takim === '1453 İstanbul AS') + 1;
  const bizimPuan = puanAll.find((t: PuanTablosu) => t.takim === '1453 İstanbul AS');

  // Yaklaşan 3 maç
  const yaklasanMaclar = maclar
    .filter((m: Mac) => m.durum === 'gelecek')
    .sort((a: Mac, b: Mac) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime())
    .slice(0, 3);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80"
            alt="Futbol sahası"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-8">
            <Image
              src="/logo.png"
              alt="1453 İstanbul AS"
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="144px"
            />
          </div>

          <div className="inline-block bg-[#C0392B] text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-md">
            {ayarlar.hero.sezon || '2025 — 2026 Sezonu'}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-lg">
            {ayarlar.hero.baslik || '1453 İstanbul AS'}
            <br />
            <span className="text-2xl md:text-3xl font-light text-white/80">
              {ayarlar.hero.altyazi || 'Spor Kulübü'}
            </span>
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {ayarlar.hero.aciklama || "İstanbul'un fethinden ilham alan güç, azim ve tutku ile her maça çıkıyoruz."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fikstur"
              className="bg-[#C0392B] hover:bg-[#96281B] text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-900/40 hover:-translate-y-0.5">
              Fikstür & Sonuçlar
            </Link>
            <Link href="/haberler"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm">
              Son Haberler
            </Link>
          </div>

          {/* Stats bar */}
          {bizimPuan && (
            <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { label: 'Lig Sırası', value: `${bizimSira}.` },
                { label: 'Puan', value: bizimPuan.puan },
                { label: 'Galibiyet', value: bizimPuan.g },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-black text-[#D4AF37]">{stat.value}</div>
                  <div className="text-xs text-white/70 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== YAKLAŞAN MAÇLAR ===== */}
      {yaklasanMaclar.length > 0 && (
        <section className="bg-[#1A4D2E] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
                Yaklaşan Maçlar
              </h2>
              <Link href="/fikstur" className="text-green-200 hover:text-white text-xs transition-colors">
                Tüm fikstür →
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {yaklasanMaclar.map((mac: Mac) => (
                <div key={mac.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] max-w-md">
                  <div className="text-green-200 text-xs mb-2 text-center">
                    {formatDate(mac.tarih)} · {mac.saat}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`flex-1 text-right text-sm font-bold ${mac.ev_sahibi === '1453 İstanbul AS' ? 'text-[#D4AF37]' : 'text-white'}`}>
                      {mac.ev_sahibi}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${mac.durum === 'tamamlandi' ? 'bg-white text-[#1A4D2E]' : 'bg-[#C0392B] text-white'}`}>
                      {mac.durum === 'tamamlandi' ? `${mac.ev_gol} - ${mac.mis_gol}` : mac.saat}
                    </span>
                    <span className={`flex-1 text-left text-sm font-bold ${mac.misafir === '1453 İstanbul AS' ? 'text-[#D4AF37]' : 'text-white'}`}>
                      {mac.misafir}
                    </span>
                  </div>
                  <div className="text-green-300 text-xs text-center mt-1">{mac.stadyum}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SON MAÇ & GELECEK MAÇ ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Maç <span className="text-[#C0392B]">Bilgileri</span>
            </h2>
            <div className="mt-2 w-12 h-1 bg-[#1A4D2E] mx-auto rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sonMac && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Son Maç
                </div>
                <MacKarti mac={sonMac} />
              </div>
            )}
            {gelecekMac && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
                  Gelecek Maç
                </div>
                <MacKarti mac={gelecekMac} />
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <Link href="/fikstur"
              className="inline-flex items-center gap-2 text-[#1A4D2E] hover:text-[#C0392B] text-sm font-semibold transition-colors">
              Tüm fikstürü gör
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SON HABERLER ===== */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Son <span className="text-[#C0392B]">Haberler</span>
              </h2>
              <div className="mt-2 w-12 h-1 bg-[#1A4D2E] rounded" />
            </div>
            <Link href="/haberler" className="text-sm text-[#1A4D2E] hover:text-[#C0392B] font-semibold transition-colors">
              Tümünü gör →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {haberler.map((haber: Haber) => (
              <Link key={haber.id} href={`/haberler/${haber.slug}`}
                className="group bg-white rounded-xl overflow-hidden card-shadow hover:shadow-lg border border-gray-100 hover:border-[#1A4D2E]/30 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <Image src={haber.gorsel} alt={haber.baslik} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#C0392B] text-white text-xs px-2 py-1 rounded-md font-medium">
                      {haber.kategori}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#1A4D2E] transition-colors line-clamp-2 mb-2">
                    {haber.baslik}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{haber.ozet}</p>
                  <div className="text-xs text-gray-400 mt-3">{formatDate(haber.tarih)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PUAN TABLOSU ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Puan <span className="text-[#C0392B]">Durumu</span>
              </h2>
              <div className="mt-2 w-12 h-1 bg-[#1A4D2E] rounded" />
            </div>
            <Link href="/fikstur" className="text-sm text-[#1A4D2E] hover:text-[#C0392B] font-semibold transition-colors">
              Tam tablo →
            </Link>
          </div>
          <div className="bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1A4D2E] text-white">
                    <th className="text-left px-4 py-3 font-semibold w-8">#</th>
                    <th className="text-left px-4 py-3 font-semibold">Takım</th>
                    <th className="text-center px-3 py-3 font-semibold">O</th>
                    <th className="text-center px-3 py-3 font-semibold">G</th>
                    <th className="text-center px-3 py-3 font-semibold">B</th>
                    <th className="text-center px-3 py-3 font-semibold">M</th>
                    <th className="text-center px-3 py-3 font-semibold">P</th>
                  </tr>
                </thead>
                <tbody>
                  {puanTablosu.map((takim: PuanTablosu, idx: number) => (
                    <tr key={takim.id}
                      className={`border-b border-gray-100 table-row-hover ${
                        takim.takim === '1453 İstanbul AS'
                          ? 'bg-[#1A4D2E]/8 border-l-4 border-l-[#1A4D2E] font-semibold'
                          : ''
                      }`}>
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{takim.takim}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{takim.o}</td>
                      <td className="px-3 py-3 text-center text-green-600 font-medium">{takim.g}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{takim.b}</td>
                      <td className="px-3 py-3 text-center text-red-500">{takim.m}</td>
                      <td className="px-3 py-3 text-center font-bold text-[#1A4D2E]">{takim.puan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPONSORLAR ===== */}
      {sponsorlar.length > 0 && (
        <section className="py-10 bg-[#f8f9fa] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
              Sponsorlarımız
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {sponsorlar.map((s) => (
                <a key={s.id} href={s.web || '#'} target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity">
                  {s.logo ? (
                    <div className="relative h-12 w-32">
                      <Image src={s.logo} alt={s.isim} fill className="object-contain" sizes="128px" unoptimized />
                    </div>
                  ) : (
                    <div className="text-gray-400 font-bold text-lg tracking-wider hover:text-gray-600 transition-colors">
                      {s.isim}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}