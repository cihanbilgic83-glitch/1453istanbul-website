'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Mac, PuanTablosu, MacOlay, MacKart, MacDegisiklik, KadroOyuncu } from '@/lib/types';
import type { TakimTanimi } from '@/lib/takimlar';
import { bizimTakimMi } from '@/lib/takim';
import { bugununTarihi } from '@/lib/tarih';
import SayfaBasligi from '@/components/ui/SayfaBasligi';
import Etiket from '@/components/ui/Etiket';

const tarihYaz = (d: string) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tarih belirlenmedi');
const kucukBaslik = 'text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase';

type Sonuc = 'G' | 'B' | 'M';
const SONUC_STILI: Record<Sonuc, { sinif: string; ad: string }> = {
  G: { sinif: 'bg-zumrut text-white', ad: 'Galibiyet' },
  B: { sinif: 'bg-mat text-gece', ad: 'Beraberlik' },
  M: { sinif: 'bg-al text-white', ad: 'Mağlubiyet' },
};

function SonucRozeti({ sonuc }: { sonuc: Sonuc }) {
  return (
    <span title={SONUC_STILI[sonuc].ad} aria-label={SONUC_STILI[sonuc].ad}
      className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold ${SONUC_STILI[sonuc].sinif}`}>{sonuc}</span>
  );
}

function OlayListesi({ goller, asistler, kartlar, degisiklikler, kadro }: { goller: MacOlay[]; asistler: MacOlay[]; kartlar: MacKart[]; degisiklikler: MacDegisiklik[]; kadro: KadroOyuncu[] }) {
  const ilk11 = kadro.filter((o) => o.ilk11);
  const yedek = kadro.filter((o) => !o.ilk11);
  const bos = goller.length + kartlar.length + degisiklikler.length + kadro.length === 0;
  return (
    <div className="space-y-1.5 text-sm text-[#2A302D]">
      {bos && <p className="text-kursun text-xs">Olay kaydı yok.</p>}
      {[...goller].sort((a, b) => a.dakika - b.dakika).map((g, i) => {
        const asist = asistler.find((a) => a.dakika === g.dakika);
        return (
          <div key={`g${i}`} className="flex gap-2">
            <span className="w-9 shrink-0 text-kursun rakam">{g.dakika}&apos;</span>
            <span><b className="font-semibold">{g.oyuncu}</b> <span className="text-kursun">gol{asist ? ` · asist ${asist.oyuncu}` : ''}</span></span>
          </div>
        );
      })}
      {[...kartlar].sort((a, b) => a.dakika - b.dakika).map((k, i) => (
        <div key={`k${i}`} className="flex gap-2 items-center">
          <span className="w-9 shrink-0 text-kursun rakam">{k.dakika}&apos;</span>
          <span aria-label={k.tur === 'sari' ? 'Sarı kart' : 'Kırmızı kart'} className={`w-2.5 h-3.5 shrink-0 ${k.tur === 'sari' ? 'bg-yellow-400' : 'bg-red-600'}`} />
          <span>{k.oyuncu}</span>
        </div>
      ))}
      {[...degisiklikler].sort((a, b) => a.dakika - b.dakika).map((d, i) => (
        <div key={`d${i}`} className="flex gap-2">
          <span className="w-9 shrink-0 text-kursun rakam">{d.dakika}&apos;</span>
          <span><span className="text-zumrut" aria-label="Giren">▲</span> {d.giren} <span className="text-al ml-1" aria-label="Çıkan">▼</span> <span className="text-kursun">{d.cikan}</span></span>
        </div>
      ))}
      {kadro.length > 0 && (
        <div className="pt-3 mt-2 border-t border-cizgi/70 grid grid-cols-1 gap-3">
          <div>
            <div className={`${kucukBaslik} mb-1.5`}>İlk 11</div>
            <ul className="text-[13px] leading-6">{ilk11.map((o, i) => <li key={i}><span className="inline-block w-6 text-kursun rakam">{o.no}</span>{o.ad}</li>)}</ul>
          </div>
          {yedek.length > 0 && (
            <div>
              <div className={`${kucukBaslik} mb-1.5`}>Yedekler</div>
              <ul className="text-[13px] leading-6 text-kursun">{yedek.map((o, i) => <li key={i}><span className="inline-block w-6 rakam">{o.no}</span>{o.ad}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MacSatiri({ mac, bugun }: { mac: Mac; bugun: string }) {
  const [acik, setAcik] = useState(false);
  const evBiz = bizimTakimMi(mac.ev_sahibi);
  const depBiz = bizimTakimMi(mac.misafir);
  const sonucBekleniyor = mac.durum === 'gelecek' && !!mac.tarih && mac.tarih < bugun;

  let sonuc: Sonuc | null = null;
  if (mac.durum === 'tamamlandi' && mac.ev_gol !== null && mac.mis_gol !== null && (evBiz || depBiz)) {
    const biz = evBiz ? mac.ev_gol : mac.mis_gol;
    const rakip = evBiz ? mac.mis_gol : mac.ev_gol;
    sonuc = biz > rakip ? 'G' : biz === rakip ? 'B' : 'M';
  }

  const ayrinti = mac.durum === 'tamamlandi' && ((mac.goller?.length ?? 0) > 0 || (mac.kartlar?.length ?? 0) > 0
    || (mac.degisiklikler?.length ?? 0) > 0 || (mac.kadro?.ev.length ?? 0) > 0);
  const taraf = (ad: string, kadro: KadroOyuncu[] = []) => ({
    goller: mac.goller?.filter((g) => g.takim === ad) ?? [],
    asistler: mac.asistler?.filter((a) => a.takim === ad) ?? [],
    kartlar: mac.kartlar?.filter((k) => k.takim === ad) ?? [],
    degisiklikler: mac.degisiklikler?.filter((d) => d.takim === ad) ?? [],
    kadro,
  });

  const icerik = (
    <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[150px_1fr_auto_1fr_130px] items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-4">
      <div className="col-span-3 sm:col-span-1 text-xs text-kursun">
        <span className="font-semibold text-murekkep">{tarihYaz(mac.tarih)}</span>{mac.saat ? ` · ${mac.saat}` : ''}
        {mac.hafta ? <span className="block sm:mt-0.5 text-[11px] tracking-wide">{mac.hafta}. hafta</span> : null}
      </div>
      <span className={`text-right font-baslik font-bold uppercase text-base sm:text-lg leading-tight ${evBiz ? 'text-zumrut' : 'text-[#3A423E]'}`}>{mac.ev_sahibi}</span>
      {mac.durum === 'tamamlandi' ? (
        <span className="bg-gece text-mat font-baslik font-extrabold text-xl px-3 py-1 rakam min-w-[64px] text-center">{mac.ev_gol}–{mac.mis_gol}</span>
      ) : (
        <span className="border border-al/40 text-al text-xs font-bold px-3 py-1.5 min-w-[64px] text-center">{mac.durum === 'ertelendi' ? '–' : mac.saat || 'vs'}</span>
      )}
      <span className={`font-baslik font-bold uppercase text-base sm:text-lg leading-tight ${depBiz ? 'text-zumrut' : 'text-[#3A423E]'}`}>{mac.misafir}</span>
      <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-2 text-xs">
        {sonuc && <SonucRozeti sonuc={sonuc} />}
        {mac.durum === 'gelecek' && !sonucBekleniyor && <span className="border border-zumrut/30 text-zumrut px-2 py-1">Gelecek</span>}
        {sonucBekleniyor && <span className="border border-cizgi text-kursun px-2 py-1 whitespace-nowrap">Sonuç bekleniyor</span>}
        {mac.durum === 'ertelendi' && <span className="border border-mat text-[#7A6414] px-2 py-1">Ertelendi</span>}
        {ayrinti && <span aria-hidden="true" className={`text-kursun transition-transform ${acik ? 'rotate-180' : ''}`}>▾</span>}
      </div>
    </div>
  );

  return (
    <li className={`bg-white border ${mac.onemli ? 'border-mat' : 'border-cizgi'}`}>
      {ayrinti ? (
        <button type="button" onClick={() => setAcik((a) => !a)} aria-expanded={acik} className="w-full text-left hover:bg-fildisi transition-colors">
          {icerik}
        </button>
      ) : icerik}
      {acik && ayrinti && (
        <div className="border-t border-cizgi bg-fildisi px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div><div className={`${kucukBaslik} mb-2`}>{mac.ev_sahibi}</div><OlayListesi {...taraf(mac.ev_sahibi, mac.kadro?.ev)} /></div>
            <div><div className={`${kucukBaslik} mb-2`}>{mac.misafir}</div><OlayListesi {...taraf(mac.misafir, mac.kadro?.mis)} /></div>
          </div>
          <div className="mt-4 pt-3 border-t border-cizgi text-xs text-kursun">
            {[mac.stadyum, mac.lig, mac.hakem ? `Hakem: ${mac.hakem}` : ''].filter(Boolean).join(' · ')}
            {mac.kaynak === 'tff' && <span className="block mt-1 text-[11px]">Kaynak: TFF İstanbul İl Temsilciliği</span>}
          </div>
        </div>
      )}
    </li>
  );
}

type Sekme = TakimTanimi & { sayi: number };

export default function FiksturClient({ takim, sekmeler, maclar, puanTablosu, sezon }: { takim: TakimTanimi; sekmeler: Sekme[]; maclar: Mac[]; puanTablosu: PuanTablosu[]; sezon?: string }) {
  const bugun = bugununTarihi();
  const sirali = [...maclar].sort((a, b) => (b.tarih || '9999').localeCompare(a.tarih || '9999') || (b.saat || '').localeCompare(a.saat || ''));
  // Gelecek: tarihi bugün ya da sonra olanlar (yakından uzağa), sonra tarihi belirlenmemiş olanlar
  const gelecek = [
    ...sirali.filter((m) => m.durum === 'gelecek' && m.tarih && m.tarih >= bugun).reverse(),
    // Tarihi henüz belirlenmemiş ya da ertelenip yeni tarihi verilmemiş maçlar
    ...sirali.filter((m) => (m.durum === 'gelecek' || m.durum === 'ertelendi') && !m.tarih).sort((a, b) => (a.hafta ?? 0) - (b.hafta ?? 0)),
  ];
  // Tamamlanan maçlar + tarihli ertelenenler + tarihi geçtiği hâlde skoru girilmemiş maçlar
  const gecmis = sirali.filter((m) => m.durum === 'tamamlandi' || (m.durum === 'ertelendi' && !!m.tarih) || (m.durum === 'gelecek' && !!m.tarih && m.tarih < bugun));
  const formuOlanlar = puanTablosu.slice(0, 5).filter((t) => (t.form?.length ?? 0) > 0);
  const ligAdi = sirali.find((m) => m.lig)?.lig;

  return (
    <div className="bg-fildisi min-h-screen">
      <SayfaBasligi etiket={sezon || 'Fikstür'} baslik="Fikstür ve puan durumu" aciklama="A takım ve altyapı takımlarımızın maç takvimi, sonuçları ve lig tabloları." />

      <nav aria-label="Takımlar" className="bg-white border-b border-cizgi sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex gap-1 overflow-x-auto">
          {sekmeler.map((t) => {
            const aktif = t.kod === takim.kod;
            return (
              <Link key={t.kod} href={t.kod === 'a' ? '/fikstur' : `/fikstur?takim=${t.kod}`} scroll={false} aria-current={aktif ? 'page' : undefined}
                className={`relative px-4 sm:px-6 py-4 font-baslik font-bold uppercase tracking-wide text-base sm:text-lg whitespace-nowrap transition-colors ${aktif ? 'text-zumrut' : 'text-kursun hover:text-murekkep'}`}>
                {t.ad}
                {aktif && <span aria-hidden="true" className="absolute left-3 right-3 sm:left-5 sm:right-5 bottom-0 h-[3px] bg-mat" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <Etiket>Gelecek maçlar</Etiket>
            {gelecek.length > 0 ? (
              <ul className="mt-5 space-y-2">{gelecek.map((m) => <MacSatiri key={m.id} mac={m} bugun={bugun} />)}</ul>
            ) : (
              <div className="mt-5 bg-white border border-cizgi px-6 py-8">
                <div className="font-baslik font-bold uppercase text-2xl text-zumrut">Fikstür yakında</div>
                <p className="mt-2 text-sm text-kursun">{takim.uzunAd} için yeni maç programı TFF İstanbul&apos;da yayınlandığında burada kendiliğinden yer alacak.</p>
              </div>
            )}
          </section>

          {gecmis.length > 0 && (
            <section>
              <Etiket>Sonuçlar</Etiket>
              <p className="mt-2 text-xs text-kursun">Gol ve kart bilgisi olan maçlara tıklayarak ayrıntıları görebilirsiniz.</p>
              <ul className="mt-5 space-y-2">{gecmis.map((m) => <MacSatiri key={m.id} mac={m} bugun={bugun} />)}</ul>
            </section>
          )}
        </div>

        <aside>
          <Etiket>Puan durumu</Etiket>
          {ligAdi && <p className="mt-2 text-xs text-kursun">{takim.uzunAd} · {ligAdi}</p>}
          {puanTablosu.length === 0 ? (
            <div className="mt-5 bg-white border border-cizgi px-5 py-6 text-sm text-kursun">Puan tablosu lig başladığında burada yer alacak.</div>
          ) : (
          <div className="mt-5 bg-white border border-cizgi overflow-x-auto">
            <table className="w-full text-[13px] sm:text-sm rakam">
              <caption className="sr-only">Puan durumu</caption>
              <thead>
                <tr className="bg-gece text-krem text-xs">
                  <th scope="col" className="text-left pl-2.5 pr-1 sm:px-3 py-3 font-semibold">#</th>
                  <th scope="col" className="text-left px-1.5 sm:px-2 py-3 font-semibold">Takım</th>
                  <th scope="col" className="px-1 sm:px-1.5 py-3 font-semibold" title="Oynanan">O</th>
                  <th scope="col" className="px-1 sm:px-1.5 py-3 font-semibold" title="Galibiyet">G</th>
                  <th scope="col" className="px-1 sm:px-1.5 py-3 font-semibold" title="Beraberlik">B</th>
                  <th scope="col" className="px-1 sm:px-1.5 py-3 font-semibold" title="Mağlubiyet">M</th>
                  <th scope="col" className="px-1 sm:px-1.5 py-3 font-semibold" title="Averaj">Av</th>
                  <th scope="col" className="pl-1.5 pr-2.5 sm:px-3 py-3 font-semibold text-mat" title="Puan">P</th>
                </tr>
              </thead>
              <tbody>
                {puanTablosu.map((t, i) => {
                  const biz = bizimTakimMi(t.takim);
                  return (
                    <tr key={t.id} className={`border-b border-cizgi/70 ${biz ? 'bg-mat/15 font-semibold' : ''}`}>
                      <td className={`pl-2.5 pr-1 sm:px-3 py-2.5 ${biz ? 'border-l-2 border-mat text-zumrut' : 'text-kursun'}`}>{i + 1}</td>
                      <td className="px-1.5 sm:px-2 py-2.5 text-murekkep leading-snug [overflow-wrap:anywhere]">{t.takim}</td>
                      <td className="px-1 sm:px-1.5 py-2.5 text-center text-kursun">{t.o}</td>
                      <td className="px-1 sm:px-1.5 py-2.5 text-center">{t.g}</td>
                      <td className="px-1 sm:px-1.5 py-2.5 text-center">{t.b}</td>
                      <td className="px-1 sm:px-1.5 py-2.5 text-center">{t.m}</td>
                      <td className="px-1 sm:px-1.5 py-2.5 text-center text-kursun">{t.av > 0 ? `+${t.av}` : t.av}</td>
                      <td className="pl-1.5 pr-2.5 sm:px-3 py-2.5 text-center font-bold text-zumrut">{t.puan}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {formuOlanlar.length > 0 && (
            <div className="mt-6 bg-white border border-cizgi p-5">
              <h3 className="text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase mb-3">Son 5 maç formu</h3>
              <ul className="space-y-2">
                {formuOlanlar.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm truncate">{t.takim}</span>
                    <span className="flex gap-1">
                      {t.form.map((f, i) => (f === 'G' || f === 'B' || f === 'M') ? <SonucRozeti key={i} sonuc={f} /> : null)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
