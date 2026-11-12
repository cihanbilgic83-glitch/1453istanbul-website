'use client';

import { useState } from 'react';
import type { Mac, PuanTablosu, MacOlay, MacKart } from '@/lib/types';
import { bizimTakimMi } from '@/lib/takim';
import { bugununTarihi } from '@/lib/tarih';
import SayfaBasligi from '@/components/ui/SayfaBasligi';
import Etiket from '@/components/ui/Etiket';

const tarihYaz = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

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

function OlayListesi({ goller, asistler, kartlar }: { goller: MacOlay[]; asistler: MacOlay[]; kartlar: MacKart[] }) {
  return (
    <div className="space-y-1.5 text-sm text-[#2A302D]">
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
    </div>
  );
}

function MacSatiri({ mac, bugun }: { mac: Mac; bugun: string }) {
  const [acik, setAcik] = useState(false);
  const evBiz = bizimTakimMi(mac.ev_sahibi);
  const depBiz = bizimTakimMi(mac.misafir);
  const sonucBekleniyor = mac.durum === 'gelecek' && mac.tarih < bugun;

  let sonuc: Sonuc | null = null;
  if (mac.durum === 'tamamlandi' && mac.ev_gol !== null && mac.mis_gol !== null && (evBiz || depBiz)) {
    const biz = evBiz ? mac.ev_gol : mac.mis_gol;
    const rakip = evBiz ? mac.mis_gol : mac.ev_gol;
    sonuc = biz > rakip ? 'G' : biz === rakip ? 'B' : 'M';
  }

  const ayrinti = mac.durum === 'tamamlandi' && ((mac.goller?.length ?? 0) > 0 || (mac.kartlar?.length ?? 0) > 0);
  const taraf = (ad: string) => ({
    goller: mac.goller?.filter((g) => g.takim === ad) ?? [],
    asistler: mac.asistler?.filter((a) => a.takim === ad) ?? [],
    kartlar: mac.kartlar?.filter((k) => k.takim === ad) ?? [],
  });

  const icerik = (
    <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[150px_1fr_auto_1fr_130px] items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-4">
      <div className="col-span-3 sm:col-span-1 text-xs text-kursun">
        <span className="font-semibold text-murekkep">{tarihYaz(mac.tarih)}</span> · {mac.saat}
      </div>
      <span className={`text-right font-baslik font-bold uppercase text-base sm:text-lg leading-tight ${evBiz ? 'text-zumrut' : 'text-[#3A423E]'}`}>{mac.ev_sahibi}</span>
      {mac.durum === 'tamamlandi' ? (
        <span className="bg-gece text-mat font-baslik font-extrabold text-xl px-3 py-1 rakam min-w-[64px] text-center">{mac.ev_gol}–{mac.mis_gol}</span>
      ) : (
        <span className="border border-al/40 text-al text-xs font-bold px-3 py-1.5 min-w-[64px] text-center">{mac.saat}</span>
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
            <div><div className="text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase mb-2">{mac.ev_sahibi}</div><OlayListesi {...taraf(mac.ev_sahibi)} /></div>
            <div><div className="text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase mb-2">{mac.misafir}</div><OlayListesi {...taraf(mac.misafir)} /></div>
          </div>
          <div className="mt-4 pt-3 border-t border-cizgi text-xs text-kursun">{mac.stadyum}{mac.lig ? ` · ${mac.lig}` : ''}</div>
        </div>
      )}
    </li>
  );
}

export default function FiksturClient({ maclar, puanTablosu, sezon }: { maclar: Mac[]; puanTablosu: PuanTablosu[]; sezon?: string }) {
  const bugun = bugununTarihi();
  const sirali = [...maclar].sort((a, b) => b.tarih.localeCompare(a.tarih) || (b.saat || '').localeCompare(a.saat || ''));
  const gelecek = sirali.filter((m) => m.durum === 'gelecek' && m.tarih >= bugun).reverse();
  // Tamamlanan maçlar + tarihi geçtiği hâlde skoru girilmemiş maçlar
  const gecmis = sirali.filter((m) => m.durum === 'tamamlandi' || m.durum === 'ertelendi' || (m.durum === 'gelecek' && m.tarih < bugun));
  const formuOlanlar = puanTablosu.slice(0, 5).filter((t) => (t.form?.length ?? 0) > 0);

  return (
    <div className="bg-fildisi min-h-screen">
      <SayfaBasligi etiket={sezon || 'Fikstür'} baslik="Fikstür ve puan durumu" aciklama="Maç takvimi, sonuçlar ve lig tablosu." />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <Etiket>Gelecek maçlar</Etiket>
            {gelecek.length > 0 ? (
              <ul className="mt-5 space-y-2">{gelecek.map((m) => <MacSatiri key={m.id} mac={m} bugun={bugun} />)}</ul>
            ) : (
              <div className="mt-5 bg-white border border-cizgi px-6 py-8">
                <div className="font-baslik font-bold uppercase text-2xl text-zumrut">Fikstür yakında</div>
                <p className="mt-2 text-sm text-kursun">Yeni sezonun maç programı açıklandığında burada yer alacak.</p>
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
          <div className="mt-5 bg-white border border-cizgi overflow-x-auto">
            <table className="w-full text-sm rakam">
              <caption className="sr-only">Puan durumu</caption>
              <thead>
                <tr className="bg-gece text-krem text-xs">
                  <th scope="col" className="text-left px-3 py-3 font-semibold">#</th>
                  <th scope="col" className="text-left px-2 py-3 font-semibold">Takım</th>
                  <th scope="col" className="px-1.5 py-3 font-semibold" title="Oynanan">O</th>
                  <th scope="col" className="px-1.5 py-3 font-semibold" title="Galibiyet">G</th>
                  <th scope="col" className="px-1.5 py-3 font-semibold" title="Beraberlik">B</th>
                  <th scope="col" className="px-1.5 py-3 font-semibold" title="Mağlubiyet">M</th>
                  <th scope="col" className="px-1.5 py-3 font-semibold" title="Averaj">Av</th>
                  <th scope="col" className="px-3 py-3 font-semibold text-mat" title="Puan">P</th>
                </tr>
              </thead>
              <tbody>
                {puanTablosu.map((t, i) => {
                  const biz = bizimTakimMi(t.takim);
                  return (
                    <tr key={t.id} className={`border-b border-cizgi/70 ${biz ? 'bg-mat/15 font-semibold' : ''}`}>
                      <td className={`px-3 py-2.5 ${biz ? 'border-l-2 border-mat text-zumrut' : 'text-kursun'}`}>{i + 1}</td>
                      <td className="px-2 py-2.5 text-murekkep">{t.takim}</td>
                      <td className="px-1.5 py-2.5 text-center text-kursun">{t.o}</td>
                      <td className="px-1.5 py-2.5 text-center">{t.g}</td>
                      <td className="px-1.5 py-2.5 text-center">{t.b}</td>
                      <td className="px-1.5 py-2.5 text-center">{t.m}</td>
                      <td className="px-1.5 py-2.5 text-center text-kursun">{t.av > 0 ? `+${t.av}` : t.av}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-zumrut">{t.puan}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
