import Image from 'next/image';
import Link from 'next/link';
import { getMaclar, getHaberler, getPuanTablosu, getSiteAyarlari, getSponsorlar } from '@/lib/data';
import type { Mac, Haber, PuanTablosu, TakimKodu } from '@/lib/types';
import { macTakimi, takimTanimi } from '@/lib/takimlar';
import HaberKapak from '@/components/haber/HaberKapak';
import Etiket from '@/components/ui/Etiket';
import YildizDeseni from '@/components/ui/YildizDeseni';
import TakimRozeti from '@/components/ui/TakimRozeti';
import GeriSayim from '@/components/ui/GeriSayim';
import { bizimTakimMi } from '@/lib/takim';
import { bugununTarihi } from '@/lib/tarih';
import { gecerliWebAdresi } from '@/lib/link';
import { optimizeEdilemez } from '@/lib/gorsel';

export const dynamic = 'force-dynamic';

const tarihYaz = (tarih: string, ayrintili = false) =>
  new Date(tarih).toLocaleDateString('tr-TR', ayrintili
    ? { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }
    : { day: 'numeric', month: 'long', year: 'numeric' });

function SiradakiMacKarti({ mac, sezon }: { mac?: Mac; sezon: string }) {
  const altyapi = mac && macTakimi(mac) !== 'a';
  return (
    <div className="w-full lg:w-[400px] bg-fildisi text-murekkep p-6 md:p-8 border-t-[3px] border-mat shadow-2xl shadow-black/30">
      <div className="text-[11px] tracking-[0.24em] font-semibold text-kursun uppercase">Sıradaki maç · {altyapi ? takimTanimi(macTakimi(mac)).uzunAd : sezon}</div>
      {mac ? (
        <>
          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex flex-col items-center gap-2.5 w-[128px] text-center">
              <TakimRozeti ad={mac.ev_sahibi} boyut={60} />
              <span className="font-baslik font-bold text-lg leading-tight uppercase">{mac.ev_sahibi}</span>
            </div>
            <span className="font-zarif italic text-3xl text-kursun">vs</span>
            <div className="flex flex-col items-center gap-2.5 w-[128px] text-center">
              <TakimRozeti ad={mac.misafir} boyut={60} />
              <span className="font-baslik font-bold text-lg leading-tight uppercase">{mac.misafir}</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-cizgi flex justify-between gap-4 text-sm text-[#3A423E]">
            <span>{tarihYaz(mac.tarih)} · {mac.saat}</span>
            <span className="text-right">{mac.stadyum}</span>
          </div>
          <div className="mt-5"><GeriSayim tarih={mac.tarih} saat={mac.saat} /></div>
        </>
      ) : (
        <div className="mt-6">
          <div className="font-baslik font-bold text-3xl uppercase text-zumrut leading-none">Fikstür yakında</div>
          <p className="mt-3 text-sm text-[#3A423E] leading-relaxed">Yeni sezonun maç programı açıklandığında ilk maçımız ve geri sayım burada yer alacak.</p>
          <Link href="/fikstur" className="inline-block mt-5 text-sm font-semibold text-zumrut border-b border-zumrut pb-0.5 hover:text-al hover:border-al">Geçen sezonun sonuçları</Link>
        </div>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [tumMaclar, haberlerHepsi, puanHepsi, ayarlar, sponsorlar, puanU17, puanU14] = await Promise.all([
    getMaclar(), getHaberler(), getPuanTablosu('a'), getSiteAyarlari(), getSponsorlar(), getPuanTablosu('u17'), getPuanTablosu('u14'),
  ]);
  const maclar = tumMaclar.filter((m) => macTakimi(m) === 'a');
  const sezon = ayarlar.hero.sezon || '2026 – 2027 Sezonu';

  const bugun = bugununTarihi();
  const siradaki = (liste: Mac[]) => liste
    .filter((m) => m.durum === 'gelecek' && !!m.tarih && m.tarih >= bugun)
    .sort((a, b) => a.tarih.localeCompare(b.tarih) || (a.saat || '').localeCompare(b.saat || ''))[0];
  // A takımın maçı yoksa (sezon başı) sıradaki altyapı maçı gösterilir
  const gelecekMac = siradaki(maclar) ?? siradaki(tumMaclar);
  const sonMac = maclar
    .filter((m) => m.durum === 'tamamlandi')
    .sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
  const bizimGoller = sonMac?.goller?.filter((g) => bizimTakimMi(g.takim)).sort((a, b) => a.dakika - b.dakika) ?? [];

  const bizimSira = puanHepsi.findIndex((t: PuanTablosu) => bizimTakimMi(t.takim)) + 1;
  const bizimPuan = puanHepsi.find((t: PuanTablosu) => bizimTakimMi(t.takim));
  const ilkBes = puanHepsi.slice(0, 5);

  const altyapi = (['u17', 'u14'] as TakimKodu[]).map((kod) => {
    const liste = tumMaclar.filter((m) => macTakimi(m) === kod);
    const tablo = kod === 'u17' ? puanU17 : puanU14;
    const sira = tablo.findIndex((t) => bizimTakimMi(t.takim)) + 1;
    return {
      takim: takimTanimi(kod),
      son: liste.filter((m) => m.durum === 'tamamlandi').sort((a, b) => b.tarih.localeCompare(a.tarih))[0],
      sonraki: siradaki(liste),
      sira,
      puan: tablo[sira - 1],
      lig: liste.find((m) => m.lig)?.lig,
    };
  }).filter((a) => a.son || a.sonraki);

  const [mansetHaber, ...digerHaberler] = haberlerHepsi;
  const yanHaberler = digerHaberler.slice(0, 3);

  return (
    <div>
      {/* ===== AÇILIŞ ===== */}
      <section className="relative min-h-[720px] lg:min-h-[820px] flex items-end overflow-hidden bg-gece">
        <Image src="/img/anasayfa.jpg" alt="1453 İstanbul AS A takımı" fill priority sizes="100vw" className="object-cover object-[60%_40%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-gece via-gece/70 to-gece/40 lg:bg-gradient-to-r lg:from-gece lg:via-gece/80 lg:to-gece/20" />
        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-36 pb-12 lg:pb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="flex-1 min-w-0">
            <Etiket renk="mat">Küçükçekmece · İstanbul</Etiket>
            <h1 className="mt-5 font-baslik font-extrabold text-white uppercase leading-[0.9] text-[60px] sm:text-[88px] lg:text-[92px] xl:text-[104px]">
              {ayarlar.hero.baslik || '1453 İstanbul AS'}
            </h1>
            <p className="mt-4 font-zarif italic text-krem text-[28px] md:text-[40px]">Fethin ruhuyla, her maçta.</p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/fikstur" className="bg-al hover:bg-al-koyu text-white text-center px-8 py-4 font-semibold transition-colors">Fikstür ve Sonuçlar</Link>
              <Link href="/kulup" className="border border-krem/60 hover:border-white text-white text-center px-8 py-4 font-medium transition-colors">Kulübümüzü Tanıyın</Link>
            </div>
          </div>
          <SiradakiMacKarti mac={gelecekMac} sezon={sezon} />
        </div>
      </section>
      <div className="tezhip bg-gece" />

      {/* ===== MAÇ MERKEZİ ===== */}
      <section className="relative bg-gece text-krem overflow-hidden">
        <YildizDeseni kimlik="mac-merkezi-deseni" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          <div>
            <Etiket renk="mat">{sonMac ? `Son maç · ${tarihYaz(sonMac.tarih)}` : 'Son maç'}</Etiket>
            {sonMac ? (
              <>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className={`flex-1 min-w-0 font-baslik font-bold text-lg md:text-2xl uppercase leading-tight ${bizimTakimMi(sonMac.ev_sahibi) ? 'text-white' : 'text-krem/80'}`}>{sonMac.ev_sahibi}</span>
                  <span className="shrink-0 whitespace-nowrap font-baslik font-extrabold text-mat text-6xl md:text-[84px] leading-none rakam">{sonMac.ev_gol}–{sonMac.mis_gol}</span>
                  <span className={`flex-1 min-w-0 font-baslik font-bold text-lg md:text-2xl uppercase leading-tight text-right ${bizimTakimMi(sonMac.misafir) ? 'text-white' : 'text-krem/80'}`}>{sonMac.misafir}</span>
                </div>
                <div className="mt-4 text-sm text-[#B9C2B8]">{sonMac.stadyum}{sonMac.lig ? ` · ${sonMac.lig}` : ''}</div>
                {bizimGoller.length > 0 && (
                  <div className="mt-3 text-sm text-krem">Gollerimiz: {bizimGoller.map((g) => `${g.oyuncu} ${g.dakika}'`).join(', ')}</div>
                )}
                <Link href="/fikstur" className="inline-block mt-6 text-sm text-krem border-b border-mat pb-1 hover:text-white">Maç detayı ve kadro</Link>
              </>
            ) : <p className="mt-6 text-sm">Henüz oynanmış maç yok.</p>}
          </div>

          <div className="lg:border-l lg:border-mat/30 lg:pl-12 pt-10 lg:pt-0 border-t border-mat/30 lg:border-t-0">
            <Etiket renk="mat">Lig durumu</Etiket>
            {bizimPuan ? (
              <>
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="font-zarif italic font-semibold text-white text-[96px] md:text-[104px] leading-[0.9]">{bizimSira}.</span>
                  <span className="text-[#B9C2B8]">sıra · {bizimPuan.o} maçta {bizimPuan.puan} puan</span>
                </div>
                <div className="mt-7 grid grid-cols-3 gap-2 text-sm text-center">
                  <div className="border border-krem/25 py-2.5"><b className="text-white">{bizimPuan.g}</b> galibiyet</div>
                  <div className="border border-krem/25 py-2.5"><b className="text-white">{bizimPuan.b}</b> beraberlik</div>
                  <div className="border border-krem/25 py-2.5"><b className="text-white">{bizimPuan.m}</b> mağlubiyet</div>
                </div>
              </>
            ) : <p className="mt-6 text-sm">Puan tablosu yakında.</p>}
          </div>

          <div className="lg:border-l lg:border-mat/30 lg:pl-12 pt-10 lg:pt-0 border-t border-mat/30 lg:border-t-0">
            <Etiket renk="mat">Puan durumu</Etiket>
            <ol className="mt-4 text-[15px] rakam">
              {ilkBes.map((t, i) => {
                const biz = bizimTakimMi(t.takim);
                return (
                  <li key={t.id} className={`flex justify-between py-2.5 ${biz ? 'bg-mat/15 border-l-2 border-mat -mx-3 px-3 text-white font-semibold' : 'border-b border-krem/10'}`}>
                    <span><span className={`inline-block w-6 ${biz ? 'text-mat' : 'text-[#8E988D]'}`}>{i + 1}</span>{t.takim}</span>
                    <b className={biz ? 'text-mat' : 'text-white'}>{t.puan}</b>
                  </li>
                );
              })}
            </ol>
            <Link href="/fikstur" className="inline-block mt-5 text-sm text-krem border-b border-mat pb-1 hover:text-white">Tam tablo</Link>
          </div>
        </div>
      </section>

      {/* ===== ALTYAPIDA BU HAFTA ===== */}
      {altyapi.length > 0 && (
        <section className="bg-krem/60 border-b border-cizgi">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 md:py-12">
            <div className="flex items-end justify-between gap-6">
              <div>
                <Etiket>Altyapı</Etiket>
                <h2 className="mt-3 font-baslik font-bold uppercase text-zumrut text-3xl md:text-4xl leading-none">Altyapıda bu hafta</h2>
              </div>
              <Link href="/fikstur?takim=u17" className="hidden sm:inline-block text-sm font-semibold text-zumrut border-b border-zumrut pb-0.5 hover:text-al hover:border-al">Altyapı fikstürü</Link>
            </div>
            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              {altyapi.map(({ takim, son, sonraki, sira, puan, lig }) => (
                <Link key={takim.kod} href={`/fikstur?takim=${takim.kod}`} className="group bg-white border border-cizgi hover:border-mat transition-colors p-5 md:p-6 flex flex-col gap-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-baslik font-extrabold uppercase text-2xl text-zumrut">{takim.uzunAd}</span>
                    {sira > 0 && puan && <span className="text-xs text-kursun rakam">{sira}. sıra · {puan.puan} puan</span>}
                  </div>
                  {son && (
                    <div>
                      <div className="text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase">Son maç · {tarihYaz(son.tarih)}</div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className={`flex-1 min-w-0 text-right font-baslik font-bold uppercase leading-tight ${bizimTakimMi(son.ev_sahibi) ? 'text-zumrut' : 'text-[#3A423E]'}`}>{son.ev_sahibi}</span>
                        <span className="shrink-0 bg-gece text-mat font-baslik font-extrabold text-xl px-3 py-1 rakam">{son.ev_gol}–{son.mis_gol}</span>
                        <span className={`flex-1 min-w-0 font-baslik font-bold uppercase leading-tight ${bizimTakimMi(son.misafir) ? 'text-zumrut' : 'text-[#3A423E]'}`}>{son.misafir}</span>
                      </div>
                    </div>
                  )}
                  {sonraki && (
                    <div className="pt-3 border-t border-cizgi text-sm text-[#3A423E]">
                      <span className="text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase mr-2">Sıradaki</span>
                      {tarihYaz(sonraki.tarih)}{sonraki.saat ? ` · ${sonraki.saat}` : ''} · {bizimTakimMi(sonraki.ev_sahibi) ? sonraki.misafir : sonraki.ev_sahibi} <span className="text-kursun">({bizimTakimMi(sonraki.ev_sahibi) ? 'iç saha' : 'deplasman'})</span>
                    </div>
                  )}
                  {lig && <div className="text-xs text-kursun mt-auto">{lig}</div>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== HABERLER ===== */}
      {mansetHaber && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 md:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Etiket>Haberler</Etiket>
              <h2 className="mt-3 font-baslik font-bold uppercase text-zumrut text-4xl md:text-[56px] leading-none">Kulüpten son gelişmeler</h2>
            </div>
            <Link href="/haberler" className="hidden sm:inline-block font-semibold text-zumrut border-b border-zumrut pb-1 hover:text-al hover:border-al">Tüm haberler</Link>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Link href={`/haberler/${mansetHaber.slug}`} className="group lg:col-span-7 flex flex-col">
              <div className="relative aspect-[16/9] overflow-hidden bg-gece">
                <HaberKapak gorsel={mansetHaber.gorsel} baslik={mansetHaber.baslik} sizes="(max-width: 1024px) 100vw, 60vw"
                  className="transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <span className="mt-5 text-xs tracking-[0.2em] text-al font-semibold uppercase">{mansetHaber.kategori} · {tarihYaz(mansetHaber.tarih)}</span>
              <span className="mt-2 font-baslik font-bold text-zumrut text-3xl md:text-[40px] leading-[1.05] group-hover:text-al transition-colors">{mansetHaber.baslik}</span>
              {mansetHaber.ozet && <span className="mt-3 text-[#3A423E] leading-relaxed line-clamp-2">{mansetHaber.ozet}</span>}
            </Link>

            <div className="lg:col-span-5 flex flex-col">
              {yanHaberler.map((haber: Haber, i: number) => (
                <Link key={haber.id} href={`/haberler/${haber.slug}`}
                  className={`group flex gap-5 py-5 ${i === 0 ? 'pt-0 lg:pt-0' : ''} ${i < yanHaberler.length - 1 ? 'border-b border-cizgi' : ''}`}>
                  <div className="relative w-28 h-20 sm:w-36 sm:h-24 shrink-0 overflow-hidden bg-gece">
                    <HaberKapak gorsel={haber.gorsel} baslik={haber.baslik} sizes="150px" />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[11px] tracking-[0.2em] text-al font-semibold uppercase">{haber.kategori} · {tarihYaz(haber.tarih)}</span>
                    <span className="font-baslik font-bold text-zumrut text-xl md:text-2xl leading-tight line-clamp-3 group-hover:text-al transition-colors">{haber.baslik}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/haberler" className="sm:hidden mt-8 block text-center border border-zumrut py-3.5 font-semibold text-zumrut">Tüm haberler</Link>
        </section>
      )}

      {/* ===== ALTYAPI ===== */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-16 md:pb-24">
        <div className="flex flex-col-reverse md:flex-row bg-zumrut text-white overflow-hidden">
          <div className="flex-1 p-8 md:p-14 flex flex-col justify-center">
            <Etiket renk="mat">Altyapı</Etiket>
            <p className="mt-4 font-zarif italic font-semibold text-4xl md:text-5xl leading-[1.05]">Geleceğin 1453&apos;lüleri burada yetişiyor.</p>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href="/iletisim?konu=Altyap%C4%B1" className="bg-mat text-gece text-center px-6 py-3.5 font-semibold hover:bg-krem transition-colors">Seçmelere kayıt ol</Link>
              <span className="text-sm text-[#B9C2B8] text-center sm:text-left">U12 · U14 · U16 · U18</span>
            </div>
          </div>
          <div className="relative md:w-[46%] h-60 md:h-auto min-h-[260px]">
            <Image src="/img/altyapi.jpg" alt="1453 İstanbul AS altyapı takımı" fill sizes="(max-width: 768px) 100vw, 46vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* ===== SPONSORLAR ===== */}
      {sponsorlar.length > 0 && (
        <section className="border-t border-cizgi">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 text-center">
            <Etiket ortali>Sponsorlarımız</Etiket>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-10 md:gap-16">
              {sponsorlar.map((s) => {
                const icerik = s.logo ? (
                  <span className="relative block h-12 w-32 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition">
                    <Image src={s.logo} alt={s.isim} fill className="object-contain" sizes="128px" unoptimized={optimizeEdilemez(s.logo)} />
                  </span>
                ) : <span className="font-baslik font-bold text-2xl text-kursun">{s.isim}</span>;
                const web = gecerliWebAdresi(s.web);
                return web
                  ? <a key={s.id} href={web} target="_blank" rel="noopener noreferrer" aria-label={s.isim}>{icerik}</a>
                  : <div key={s.id}>{icerik}</div>;
              })}
            </div>
            <Link href="/iletisim?konu=Sponsorluk" className="inline-block mt-10 text-sm font-semibold text-zumrut border-b border-zumrut pb-0.5 hover:text-al hover:border-al">Sponsorumuz olun</Link>
          </div>
        </section>
      )}
    </div>
  );
}
