import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { optimizeEdilemez } from '@/lib/gorsel';
import { getSiteAyarlari, getYonetim } from '@/lib/data';
import SayfaBasligi from '@/components/ui/SayfaBasligi';
import Etiket from '@/components/ui/Etiket';
import YildizDeseni from '@/components/ui/YildizDeseni';

export const metadata: Metadata = {
  title: 'Kulüp',
  description: '1453 İstanbul AS Spor Kulübü: vizyon, misyon, tarihçe, başkan mesajı ve yönetim kurulu.',
};

export const dynamic = 'force-dynamic';

const basHarfler = (isim: string) =>
  isim.split(/\s+/).filter(Boolean).slice(0, 2).map((k) => k.charAt(0).toLocaleUpperCase('tr-TR')).join('');

// "Cihan BİLGİÇ" / "DAVUT ERDAL" gibi karışık yazımları tek biçime getirir: "Cihan Bilgiç".
const adDuzelt = (metin: string) =>
  metin.split(/\s+/).filter(Boolean).map((k) => k.charAt(0).toLocaleUpperCase('tr-TR') + k.slice(1).toLocaleLowerCase('tr-TR')).join(' ');

const gorevDuzelt = (gorev: string) => adDuzelt(gorev.replace(/\bKuru\b/gi, 'Kurulu'));

// Fotoğraf yerine yüklenmiş kulüp logosu, gerçek portre sayılmaz (baş harfli kutu gösterilir).
const portreMi = (adres?: string) => Boolean(adres) && !/logo/i.test(adres ?? '');

export default async function KulupPage() {
  const [ayarlar, yonetim] = await Promise.all([getSiteAyarlari(), getYonetim()]);
  const baskan = yonetim[0];

  return (
    <div className="bg-fildisi">
      <SayfaBasligi etiket="Kulüp" baslik="1453 İstanbul AS" aciklama="İstanbul'un fethinden ilham alan bir futbol geleneği." />

      {/* Vizyon & misyon */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <Etiket>Vizyonumuz</Etiket>
          <p className="mt-5 font-zarif italic text-[26px] md:text-[32px] leading-snug text-zumrut">{ayarlar.vizyon || 'Vizyon bilgisi yakında eklenecek.'}</p>
        </div>
        <div className="md:border-l md:border-cizgi md:pl-16">
          <Etiket>Misyonumuz</Etiket>
          <p className="mt-5 font-zarif italic text-[26px] md:text-[32px] leading-snug text-zumrut">{ayarlar.misyon || 'Misyon bilgisi yakında eklenecek.'}</p>
        </div>
      </section>

      {/* Tarihçe */}
      {ayarlar.tarihce.length > 0 && (
        <section className="relative bg-gece text-krem overflow-hidden">
          <YildizDeseni kimlik="tarihce-deseni" />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 md:py-24">
            <Etiket renk="mat" ortali>Tarihçe</Etiket>
            <h2 className="mt-4 text-center font-baslik font-bold uppercase text-white text-4xl md:text-[56px] leading-none">Yıllar içinde 1453</h2>
            <ol className="mt-14 relative">
              <span aria-hidden="true" className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-mat/40" />
              {ayarlar.tarihce.map((madde, i) => (
                <li key={`${madde.yil}-${i}`} className={`relative pl-14 md:pl-0 pb-12 last:pb-0 md:flex ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
                  <span aria-hidden="true" className="absolute left-[13px] md:left-1/2 md:-translate-x-1/2 top-3 w-[13px] h-[13px] rotate-45 bg-mat" />
                  <div className={`md:w-1/2 ${i % 2 ? 'md:pl-14' : 'md:pr-14 md:text-right'}`}>
                    <div className="font-zarif italic font-semibold text-mat text-5xl md:text-6xl leading-none">{madde.yil}</div>
                    <h3 className="mt-3 font-baslik font-bold uppercase text-white text-2xl">{madde.baslik}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#B9C2B8]">{madde.icerik}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Başkan mesajı */}
      {ayarlar.baskan_mesaj && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-4">
            <div className="relative aspect-[4/5] bg-krem overflow-hidden border-b-[3px] border-mat">
              {portreMi(ayarlar.baskan_gorsel) ? (
                <Image src={ayarlar.baskan_gorsel} alt={baskan ? adDuzelt(baskan.isim) : 'Kulüp başkanı'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" unoptimized={optimizeEdilemez(ayarlar.baskan_gorsel)} />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-baslik font-bold text-6xl text-kursun">{baskan ? basHarfler(baskan.isim) : '1453'}</span>
              )}
            </div>
          </div>
          <div className="md:col-span-8">
            <Etiket>Başkan mesajı</Etiket>
            <blockquote className="mt-6 font-zarif italic text-[28px] md:text-[38px] leading-[1.25] text-zumrut">“{ayarlar.baskan_mesaj}”</blockquote>
            {baskan && (
              <div className="mt-8">
                <div className="font-baslik font-bold uppercase text-2xl text-murekkep">{adDuzelt(baskan.isim)}</div>
                <div className="text-sm text-kursun mt-1">{gorevDuzelt(baskan.gorev)}, 1453 İstanbul AS</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Yönetim kurulu */}
      {yonetim.length > 0 && (
        <section className="border-t border-cizgi">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 md:py-24">
            <Etiket ortali>Yönetim</Etiket>
            <h2 className="mt-4 text-center font-baslik font-bold uppercase text-zumrut text-4xl md:text-[56px] leading-none">Yönetim ve denetim kurulu</h2>
            <ul className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
              {yonetim.map((kisi) => (
                <li key={kisi.id} className="group text-center">
                  <div className="relative mx-auto w-full max-w-[180px] aspect-square overflow-hidden bg-krem">
                    {portreMi(kisi.gorsel) ? (
                      <Image src={kisi.gorsel} alt={adDuzelt(kisi.isim)} fill sizes="180px" unoptimized={optimizeEdilemez(kisi.gorsel)}
                        className="object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-baslik font-bold text-4xl text-kursun">{basHarfler(kisi.isim)}</span>
                    )}
                  </div>
                  <div className="mt-4 font-baslik font-bold uppercase text-lg leading-tight text-murekkep">{adDuzelt(kisi.isim)}</div>
                  <div className="mt-1 text-[13px] text-kursun">{gorevDuzelt(kisi.gorev)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-14 text-center">
              <Link href="/iletisim?konu=%C3%9Cyelik" className="inline-block bg-zumrut text-white px-7 py-3.5 font-semibold hover:bg-gece transition-colors">Kulübümüze katılın</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
