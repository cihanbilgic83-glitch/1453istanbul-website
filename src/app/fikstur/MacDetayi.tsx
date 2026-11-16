'use client';

// Fikstürde bir maça tıklanınca açılan detay: skor tabelası, maç akışı (zaman çizgisi) ve kadrolar.
// Telefonda "Maç akışı" ve "Kadrolar" sekmelerle, kadrolar da takım düğmesiyle değişir; masaüstünde hepsi görünür.

import { useState } from 'react';
import type { Mac, KadroOyuncu } from '@/lib/types';
import { bizimTakimMi } from '@/lib/takim';

type Taraf = 'ev' | 'mis';
type Olay =
  | { tur: 'gol'; dk: number; taraf: Taraf; oyuncu: string; asist?: string }
  | { tur: 'sari' | 'kirmizi'; dk: number; taraf: Taraf; oyuncu: string }
  | { tur: 'deg'; dk: number; taraf: Taraf; giren: string; cikan: string };

const YESIL = 'text-[#1F7A45]';

function TopIkonu({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.2l3.2 2.3-1.2 3.8h-4l-1.2-3.8z" fill="currentColor" />
      <path d="M12 2v5.2M15.2 9.5l4.6-1.8M14 13.3l2.8 4.1M10 13.3l-2.8 4.1M8.8 9.5L4.2 7.7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function DegisiklikIkonu() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M7 20V6m0 0l-3.5 3.5M7 6l3.5 3.5" stroke="#1F7A45" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M17 4v14m0 0l-3.5-3.5M17 18l3.5-3.5" stroke="#B3261E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
const Kart = ({ tur }: { tur: 'sari' | 'kirmizi' }) => (
  <i aria-hidden="true" className={`inline-block w-[11px] h-[15px] rounded-[2px] shrink-0 ${tur === 'sari' ? 'bg-[#F2C200]' : 'bg-al'}`} />
);
function OlayIkonu({ tur }: { tur: Olay['tur'] }) {
  if (tur === 'gol') return <TopIkonu />;
  if (tur === 'deg') return <DegisiklikIkonu />;
  return <Kart tur={tur} />;
}

const IKON = 'w-3.5 h-3.5 stroke-mat fill-none [stroke-width:1.8] shrink-0';

/** Olayları kadroya bakarak doğru takıma bağlar (TFF verisinde zaman zaman yanlış tarafa yazılıyor). */
function olaylariHazirla(mac: Mac): Olay[] {
  const evKadro = mac.kadro?.ev ?? [];
  const misKadro = mac.kadro?.mis ?? [];
  const taraf = (oyuncu: string, takim: string): Taraf => {
    if (evKadro.some((o) => o.ad === oyuncu)) return 'ev';
    if (misKadro.some((o) => o.ad === oyuncu)) return 'mis';
    return takim === mac.misafir ? 'mis' : 'ev';
  };
  const liste: Olay[] = [];
  for (const g of mac.goller ?? []) {
    const t = taraf(g.oyuncu, g.takim);
    const asist = (mac.asistler ?? []).find((a) => a.dakika === g.dakika && taraf(a.oyuncu, a.takim) === t)?.oyuncu;
    liste.push({ tur: 'gol', dk: g.dakika, taraf: t, oyuncu: g.oyuncu, asist });
  }
  for (const k of mac.kartlar ?? []) liste.push({ tur: k.tur, dk: k.dakika, taraf: taraf(k.oyuncu, k.takim), oyuncu: k.oyuncu });
  for (const d of mac.degisiklikler ?? []) liste.push({ tur: 'deg', dk: d.dakika, taraf: taraf(d.giren, d.takim), giren: d.giren, cikan: d.cikan });
  const oncelik = { gol: 0, sari: 1, kirmizi: 1, deg: 2 } as const;
  return liste.sort((a, b) => a.dk - b.dk || oncelik[a.tur] - oncelik[b.tur]);
}

export function macDetayiVarMi(mac: Mac): boolean {
  return mac.durum === 'tamamlandi' && ((mac.goller?.length ?? 0) > 0 || (mac.kartlar?.length ?? 0) > 0
    || (mac.degisiklikler?.length ?? 0) > 0 || (mac.kadro?.ev.length ?? 0) > 0 || (mac.kadro?.mis.length ?? 0) > 0);
}

export default function MacDetayi({ mac }: { mac: Mac }) {
  const olaylar = olaylariHazirla(mac);
  const bizTaraf: Taraf | null = bizimTakimMi(mac.ev_sahibi) ? 'ev' : bizimTakimMi(mac.misafir) ? 'mis' : null;
  const [sekme, setSekme] = useState<'akis' | 'kadro'>(olaylar.length ? 'akis' : 'kadro');
  const [kadroTaraf, setKadroTaraf] = useState<Taraf>(bizTaraf ?? 'ev');

  const evGol = mac.ev_gol ?? 0, misGol = mac.mis_gol ?? 0;
  let sonuc: { ad: string; renk: string } | null = null;
  if (bizTaraf) {
    const biz = bizTaraf === 'ev' ? evGol : misGol, rakip = bizTaraf === 'ev' ? misGol : evGol;
    sonuc = biz > rakip ? { ad: 'Galibiyet', renk: 'bg-[#1F7A45]' } : biz < rakip ? { ad: 'Mağlubiyet', renk: 'bg-al' } : { ad: 'Beraberlik', renk: 'bg-kursun' };
  }
  const girilmemisGol = mac.kaynak === 'tff' ? evGol + misGol - olaylar.filter((o) => o.tur === 'gol').length : 0;
  const kadroVar = (mac.kadro?.ev.length ?? 0) + (mac.kadro?.mis.length ?? 0) > 0;
  const tarih = mac.tarih ? new Date(mac.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }) : '';
  const ust = [mac.lig?.replace(/(\d+)\.\s*grup/i, '$1. Grup'), mac.hafta ? `${mac.hafta}. hafta` : ''].filter(Boolean).join(' · ');

  // Skor tabelasında takım adının altında golcüler (aynı oyuncunun golleri tek satırda)
  const golculer = (t: Taraf) => {
    const liste: { ad: string; dk: number[] }[] = [];
    for (const o of olaylar) {
      if (o.tur !== 'gol' || o.taraf !== t) continue;
      const v = liste.find((x) => x.ad === o.oyuncu);
      if (v) v.dk.push(o.dk); else liste.push({ ad: o.oyuncu, dk: [o.dk] });
    }
    return liste;
  };

  const takimBloku = (t: Taraf) => {
    const ad = t === 'ev' ? mac.ev_sahibi : mac.misafir;
    // Uzun kelimeli adlar ("Kocamustafapaşa") hecenin ortasından bölünmesin diye yazı boyutu,
    // en uzun kelime kutuya sığacak şekilde kutunun genişliğine göre (cqi) kendiliğinden küçülür
    const enUzun = Math.max(...ad.split(/\s+/).map((k) => k.length), 4);
    return (
      <div className={`flex flex-col gap-2 min-w-0 [container-type:inline-size] ${t === 'ev' ? 'items-end text-right' : 'items-start'}`}>
        <div style={{ '--uzun': enUzun } as React.CSSProperties}
          className={`font-baslik font-extrabold uppercase text-[min(17px,calc(100cqi/(var(--uzun)*0.5)))] sm:text-[min(28px,calc(100cqi/(var(--uzun)*0.5)))] leading-none max-w-full [overflow-wrap:anywhere] ${bizTaraf === t ? 'text-mat' : 'text-white'}`}>{ad}</div>
        {golculer(t).map((g) => (
          <div key={g.ad} className={`flex items-center gap-1.5 text-[11.5px] sm:text-[13px] text-krem ${t === 'ev' ? 'flex-row-reverse' : ''}`}>
            <span className="text-murekkep"><TopIkonu className="w-3.5 h-3.5" /></span>
            <span>{g.ad} <span className="text-krem/60 whitespace-nowrap rakam">{g.dk.map((d) => `${d}'`).join(', ')}</span></span>
          </div>
        ))}
      </div>
    );
  };

  // ---- Maç akışı satırları
  const satirlar: React.ReactNode[] = [];
  const ayrac = (metin: string) => (
    <div key={`a-${metin}`} className="relative z-[1] flex justify-center my-2.5">
      <span className="bg-fildisi border border-cizgi text-[11px] tracking-[0.18em] font-bold text-kursun uppercase px-3 py-1">{metin}</span>
    </div>
  );
  satirlar.push(ayrac('Başlama'));
  let anlikEv = 0, anlikMis = 0, devre = false;
  olaylar.forEach((o, i) => {
    if (!devre && o.dk > 45) { satirlar.push(ayrac('Devre arası')); devre = true; }
    let govde: React.ReactNode;
    if (o.tur === 'gol') {
      if (o.taraf === 'ev') anlikEv++; else anlikMis++;
      const skor = `${anlikEv}–${anlikMis}`;
      govde = (
        <>
          <OlayIkonu tur="gol" />
          <div className="leading-tight">
            <b className="font-semibold text-[13px] sm:text-[14.5px]">{o.oyuncu}</b>
            <small className="block text-xs text-kursun">Gol<span className="sm:hidden rakam"> · {skor}</span>{o.asist ? ` · Asist: ${o.asist}` : ''}</small>
          </div>
          <span className="hidden sm:inline font-baslik font-extrabold text-[15px] bg-fildisi border border-cizgi px-1.5 whitespace-nowrap rakam">{skor}</span>
        </>
      );
    } else if (o.tur === 'deg') {
      govde = (
        <>
          <OlayIkonu tur="deg" />
          <div className="leading-tight">
            <div className={`${YESIL} font-semibold text-[12.5px] sm:text-[13.5px]`}><span className="text-[10px]" aria-label="Giren">▲</span> {o.giren}</div>
            <div className="text-kursun text-xs sm:text-[13px]"><span className="text-[10px] text-al" aria-label="Çıkan">▼</span> {o.cikan}</div>
          </div>
        </>
      );
    } else {
      govde = (
        <>
          <OlayIkonu tur={o.tur} />
          <div className="leading-tight">
            <b className="font-semibold text-[13px] sm:text-[14.5px]">{o.oyuncu}</b>
            <small className="block text-xs text-kursun">{o.tur === 'sari' ? 'Sarı kart' : 'Kırmızı kart'}</small>
          </div>
        </>
      );
    }
    const gol = o.tur === 'gol';
    const dakikaStili = gol
      ? (o.taraf === bizTaraf ? 'bg-zumrut border-zumrut text-white' : 'bg-murekkep border-murekkep text-white')
      : 'bg-white border-cizgi';
    satirlar.push(
      <div key={i} className="grid grid-cols-[1fr_46px_1fr] sm:grid-cols-[1fr_54px_1fr] items-center min-h-[46px]">
        {/* Ev sahibi olayı solda: ters sırayla dizilir ki simge ortadaki dakikaya bitişik dursun */}
        <div className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-2.5 px-2 sm:px-3.5 py-1.5 text-right">
          {o.taraf === 'ev' && govde}
        </div>
        <div className={`relative z-[1] justify-self-center w-[38px] sm:w-[42px] h-7 grid place-items-center border-[1.5px] rounded-full text-xs sm:text-[13px] font-bold rakam ${dakikaStili}`}>{o.dk}&apos;</div>
        <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3.5 py-1.5">
          {o.taraf === 'mis' && govde}
        </div>
      </div>,
    );
  });
  if (!devre) satirlar.push(ayrac('Devre arası'));
  satirlar.push(ayrac(`Maç sonu · ${evGol}–${misGol}`));

  // ---- Kadrolar
  const oyuncuOlaylari = (ad: string) => (
    <span className="flex gap-2 items-center text-xs text-kursun whitespace-nowrap rakam">
      {olaylar.map((o, i) => {
        if (o.tur === 'gol' && o.oyuncu === ad) return <span key={i} className="inline-flex gap-0.5 items-center"><TopIkonu className="w-3.5 h-3.5" />{o.dk}&apos;</span>;
        if ((o.tur === 'sari' || o.tur === 'kirmizi') && o.oyuncu === ad) return <span key={i} className="inline-flex gap-1 items-center"><Kart tur={o.tur} />{o.dk}&apos;</span>;
        if (o.tur === 'deg' && o.cikan === ad) return <span key={i} className="text-al">▼ {o.dk}&apos;</span>;
        if (o.tur === 'deg' && o.giren === ad) return <span key={i} className={YESIL}>▲ {o.dk}&apos;</span>;
        return null;
      })}
    </span>
  );
  const kadroKutusu = (t: Taraf) => {
    const ad = t === 'ev' ? mac.ev_sahibi : mac.misafir;
    const liste: KadroOyuncu[] = (t === 'ev' ? mac.kadro?.ev : mac.kadro?.mis) ?? [];
    const biz = bizTaraf === t;
    const satir = (o: KadroOyuncu) => {
      const oyunaGirdi = !o.ilk11 && olaylar.some((x) => x.tur === 'deg' && x.giren === o.ad);
      return (
        <li key={`${o.no}-${o.ad}`} className="grid grid-cols-[30px_1fr_auto] items-center gap-2 px-3.5 py-1.5 text-sm border-b border-[#EFEADD] last:border-b-0">
          <span className="font-baslik font-bold text-[15px] text-kursun text-center rakam">{o.no}</span>
          <span className={o.ilk11 || oyunaGirdi ? 'text-murekkep' : 'text-kursun'}>{o.ad}</span>
          {oyuncuOlaylari(o.ad)}
        </li>
      );
    };
    if (!liste.length) return null;
    return (
      <div className={`border border-cizgi ${t !== kadroTaraf ? 'hidden md:block' : ''}`}>
        <h4 className={`flex justify-between items-center gap-3 px-3.5 py-2.5 font-baslik font-bold uppercase text-lg leading-tight border-b ${biz ? 'bg-zumrut text-white border-zumrut' : 'bg-fildisi border-cizgi'}`}>
          {ad}<small className={`font-sans text-[11px] tracking-[0.14em] font-semibold whitespace-nowrap ${biz ? 'text-mat' : 'text-kursun'}`}>{t === 'ev' ? 'EV SAHİBİ' : 'MİSAFİR'}</small>
        </h4>
        <div className="px-3.5 pt-2.5 pb-1 text-[10.5px] tracking-[0.2em] font-bold text-kursun uppercase">İlk 11</div>
        <ul>{liste.filter((o) => o.ilk11).map(satir)}</ul>
        {liste.some((o) => !o.ilk11) && <>
          <div className="px-3.5 pt-2.5 pb-1 text-[10.5px] tracking-[0.2em] font-bold text-kursun uppercase">Yedekler</div>
          <ul>{liste.filter((o) => !o.ilk11).map(satir)}</ul>
        </>}
      </div>
    );
  };

  const etiket = 'text-[11px] tracking-[0.2em] text-kursun font-semibold uppercase';
  const lejant = (ogeler: React.ReactNode[]) => <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[11.5px] text-kursun">{ogeler}</div>;

  return (
    <div className="border-t border-cizgi">
      {/* Skor tabelası */}
      <div className="relative overflow-hidden bg-gece text-white px-3.5 sm:px-6 pt-5 sm:pt-6">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(201,162,39,.18),transparent_60%)]" />
        <div className="relative">
          {ust && <div className="text-center text-mat text-[11px] tracking-[0.24em] font-semibold uppercase">{ust}</div>}
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2.5 sm:gap-5 mt-4">
            {takimBloku('ev')}
            <div className="flex flex-col items-center gap-2">
              <div className="font-baslik font-extrabold text-[42px] sm:text-[64px] leading-[.9] flex items-center gap-2 sm:gap-3 rakam">
                <span>{evGol}</span><span className="text-krem/35 text-[28px] sm:text-[40px]">–</span><span>{misGol}</span>
              </div>
              <span className="text-[11px] tracking-[0.12em] sm:tracking-[0.2em] text-krem/60 whitespace-nowrap">MAÇ SONU</span>
              {sonuc && <span className={`text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-bold px-2 py-1 text-white uppercase ${sonuc.renk}`}>{sonuc.ad}</span>}
            </div>
            {takimBloku('mis')}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-1.5 sm:gap-x-6 border-t border-mat/25 mt-5 py-3 text-xs sm:text-[12.5px] text-krem">
            {tarih && <span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className={IKON}><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>{tarih}{mac.saat ? ` · ${mac.saat}` : ''}</span>}
            {mac.stadyum && <span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className={IKON}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>{mac.stadyum}</span>}
            {mac.hakem && <span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className={IKON}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c.8-4.2 3.6-6.5 7-6.5s6.2 2.3 7 6.5" /></svg>Hakem: {mac.hakem}</span>}
          </div>
        </div>
      </div>

      {/* Telefonda sekmeler (masaüstünde iki bölüm alt alta görünür) */}
      {olaylar.length > 0 && kadroVar && (
        <div role="tablist" className="md:hidden flex bg-white border-b border-cizgi">
          {([['akis', 'Maç akışı'], ['kadro', 'Kadrolar']] as const).map(([k, ad]) => (
            <button key={k} type="button" role="tab" aria-selected={sekme === k} onClick={() => setSekme(k)}
              className={`relative flex-1 py-3.5 font-baslik font-bold uppercase text-[17px] ${sekme === k ? 'text-zumrut' : 'text-kursun'}`}>
              {ad}{sekme === k && <span aria-hidden="true" className="absolute left-[20%] right-[20%] -bottom-px h-[3px] bg-mat" />}
            </button>
          ))}
        </div>
      )}

      {olaylar.length > 0 && (
        <div className={`bg-white px-3 sm:px-6 py-5 sm:py-6 ${sekme !== 'akis' ? 'hidden md:block' : ''}`}>
          {girilmemisGol > 0 && (
            <p className="text-xs text-[#8A6D00] bg-[#FBF4DC] border border-[#EFE0A6] px-3 py-2 mb-4">TFF bu maçta {girilmemisGol} golün atanını henüz girmedi; girildiğinde burada görünecek.</p>
          )}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div className={etiket}>Maç akışı</div>
            {lejant([
              <span key="g" className="inline-flex gap-1.5 items-center"><TopIkonu className="w-3.5 h-3.5" />Gol</span>,
              <span key="s" className="inline-flex gap-1.5 items-center"><Kart tur="sari" />Sarı kart</span>,
              <span key="k" className="inline-flex gap-1.5 items-center"><Kart tur="kirmizi" />Kırmızı kart</span>,
              <span key="d" className="inline-flex gap-1.5 items-center"><DegisiklikIkonu />Oyuncu değişikliği</span>,
            ])}
          </div>
          <div className="grid grid-cols-[1fr_46px_1fr] sm:grid-cols-[1fr_54px_1fr] mb-2 font-baslik font-bold uppercase text-[13px] sm:text-[15px] text-kursun leading-tight">
            <div className="text-right px-2 sm:px-3.5">{mac.ev_sahibi}</div><span /><div className="px-2 sm:px-3.5">{mac.misafir}</div>
          </div>
          <div className="relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:-translate-x-px before:bg-cizgi">
            {satirlar}
          </div>
        </div>
      )}

      {kadroVar && (
        <div className={`bg-white px-3 sm:px-6 py-5 sm:py-6 md:border-t md:border-cizgi ${olaylar.length > 0 && sekme !== 'kadro' ? 'hidden md:block' : ''}`}>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div className={etiket}>Kadrolar</div>
            {lejant([
              <span key="g" className="inline-flex gap-1.5 items-center"><TopIkonu className="w-3.5 h-3.5" />Gol</span>,
              <span key="k" className="inline-flex gap-1.5 items-center"><Kart tur="sari" />Kart</span>,
              <span key="c" className="text-al">▼ Oyundan çıktı</span>,
              <span key="i" className={YESIL}>▲ Oyuna girdi</span>,
            ])}
          </div>
          <div className="md:hidden flex border border-cizgi mb-3">
            {(['ev', 'mis'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setKadroTaraf(t)} aria-pressed={kadroTaraf === t}
                className={`flex-1 px-2 py-2.5 font-baslik font-bold uppercase text-sm leading-tight ${kadroTaraf === t ? 'bg-zumrut text-white' : 'text-kursun'}`}>
                {t === 'ev' ? mac.ev_sahibi : mac.misafir}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{kadroKutusu('ev')}{kadroKutusu('mis')}</div>
        </div>
      )}

      <div className="bg-white border-t border-cizgi px-3.5 sm:px-6 py-3 text-[11.5px] text-kursun">
        {mac.kaynak === 'tff' ? 'Kaynak: TFF İstanbul İl Temsilciliği' : 'Maç bilgileri kulüp tarafından girilmiştir.'}
      </div>
    </div>
  );
}
