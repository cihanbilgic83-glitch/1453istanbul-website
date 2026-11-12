// TFF İstanbul (tffistanbul.org) sayfalarını okuyan saf ayrıştırıcılar.
// Ağ isteği yapmaz; yalnızca cheerio ile yüklenmiş sayfayı çözer.
// Sayfa yapısı 2026-2027 sezonunda incelendi (puan tablosu, haftalık fikstür, maç detayı).

import type { CheerioAPI } from 'cheerio';

const AYLAR: Record<string, string> = {
  ocak: '01', 'şubat': '02', mart: '03', nisan: '04', 'mayıs': '05', haziran: '06',
  temmuz: '07', 'ağustos': '08', 'eylül': '09', ekim: '10', 'kasım': '11', 'aralık': '12',
};

const BUYUK_KALACAK = new Set(['AS', 'SK', 'FK', 'GSK', 'SK.', 'İBB', 'GOP', 'TFF', 'U14', 'U17', 'U19', 'II', 'III']);

/** "BAĞCILAR SPOR KULÜBÜ" -> "Bağcılar Spor Kulübü" (Türkçe kurallarıyla). */
export function duzgunAd(ham: string): string {
  return ham
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((kelime) => kelime.split('/').map((parca) => {
      const buyuk = parca.toLocaleUpperCase('tr-TR');
      // Kısaltmalar ve tek harfler ("U17/B", "U14 B") büyük kalır
      if (BUYUK_KALACAK.has(buyuk) || /^[A-ZÇĞİÖŞÜ]$/.test(buyuk)) return buyuk;
      const kucuk = parca.toLocaleLowerCase('tr-TR');
      return kucuk.replace(/^(\(?)(\S)/, (_t, p: string, h: string) => p + h.toLocaleUpperCase('tr-TR'));
    }).join('/'))
    .join(' ');
}

/** "7 Kasım 2026 Cumartesi" ya da "07 Kasım 2026" -> "2026-11-07" */
export function tarihCoz(metin: string): string | null {
  const m = metin.toLocaleLowerCase('tr-TR').match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})/);
  if (!m) return null;
  const ay = AYLAR[m[2]];
  if (!ay) return null;
  return `${m[3]}-${ay}-${m[1].padStart(2, '0')}`;
}

function sayi(metin: string): number | null {
  const t = metin.replace(/\s+/g, '').trim();
  if (!/^-?\d+$/.test(t)) return null;
  return parseInt(t, 10);
}

function temiz(metin: string | undefined | null): string {
  return (metin ?? '').replace(/\s+/g, ' ').trim();
}

/** "10 - BEYAZIT ÇINAR ŞAHİN" -> { no: "10", ad: "Beyazıt Çınar Şahin" } */
function formaVeAd(metin: string): { no: string; ad: string } {
  const t = temiz(metin);
  const m = t.match(/^(\d+)\s*-\s*(.+)$/);
  return m ? { no: m[1], ad: duzgunAd(m[2]) } : { no: '', ad: duzgunAd(t) };
}

// ===================== GRUP SAYFASI =====================

export interface TffPuanSatiri {
  takim: string;
  o: number; g: number; b: number; m: number;
  ag: number; yg: number; puan: number; av: number;
}

export interface TffMacOzeti {
  tffId: string;
  adres: string;
  hafta: number | null;
  tarih: string | null;
  saat: string;
  stadyum: string;
  ev: string;
  mis: string;
  evGol: number | null;
  misGol: number | null;
}

export interface TffGrupSayfasi {
  lig: string;
  grup: string;
  sezon: string;
  sezonNo: string;
  haftaSayisi: number;
  aktifHafta: number | null;
  puan: TffPuanSatiri[];
  maclar: TffMacOzeti[];
}

export function grupSayfasiniAyristir($: CheerioAPI): TffGrupSayfasi {
  const baslik = temiz($('title').first().text());
  const lig = temiz(baslik.split(/\s+İstatistikleri/i)[0]);
  // Grup adı başlıklarda geçer ("U14 B LİGİ 23. GRUP - 5. HAFTA İSTATİSTİKLERİ"); ilk eşleşme bizim gruptur
  const grup = $('h1,h2,h3,h4,h5,h6').toArray()
    .map((e) => (temiz($(e).text()).match(/(\d+)\.\s*GRUP/i) || [])[0])
    .find(Boolean)?.replace(/\s+/g, ' ').toLocaleUpperCase('tr-TR') ?? '';

  const sezonSecili = $('#seasonselect option[selected]').first();
  const sezon = temiz(sezonSecili.attr('data-friendly-name') || sezonSecili.text());
  const sezonNo = temiz(sezonSecili.attr('value'));

  const haftalar = $('#weekselect option');
  const haftaSayisi = haftalar.length;
  const secili = $('#weekselect option[selected]').first();
  const aktifHafta = sayi(secili.attr('value') || secili.text() || '');

  // Puan tablosu: TAKIM O G B M A Y P Av E
  const puan: TffPuanSatiri[] = [];
  $('table.table-standings').first().find('tbody tr').each((_, tr) => {
    const td = $(tr).find('td');
    if (td.length < 9) return;
    const ad = temiz($(td[0]).find('.team-meta__name').text() || $(td[0]).text());
    if (!ad) return;
    const n = (i: number) => sayi($(td[i]).text()) ?? 0;
    puan.push({ takim: ad, o: n(1), g: n(2), b: n(3), m: n(4), ag: n(5), yg: n(6), puan: n(7), av: n(8) });
  });

  // Haftalık maçlar: tarih başlıkları ve maç bağlantıları sırayla gelir
  const maclar: TffMacOzeti[] = [];
  $('.widget-results__list').each((_, liste) => {
    let tarih: string | null = null;
    $(liste).children('li').each((_, li) => {
      const baslikEl = $(li).find('.widget-results__title');
      if (baslikEl.length && !$(li).find('a.widget-results__link').length) {
        tarih = tarihCoz(baslikEl.text());
        return;
      }
      const a = $(li).find('a.widget-results__link').first();
      if (!a.length) return;
      const adres = (a.attr('href') || '').replace(/\?.*$/, '');
      const tffId = adres.split('/').filter(Boolean).pop() || '';
      if (!/^\d+$/.test(tffId)) return;
      const hafta = sayi((adres.match(/\/(\d+)-haftasi\//) || [])[1] || '');
      const adlar = a.find('.widget-results__team-name').map((_, e) => temiz($(e).text())).get();
      // Oynanmamış maçta skor kutuları boştur (null)
      const skorHam = a.find('.widget-results__score span').toArray().map((e) => sayi($(e).text()));
      const stadyumHam = temiz(a.find('.widget-results__stadiumname').text());
      const saatM = stadyumHam.match(/-\s*(\d{1,2}[:.]\d{2})\s*$/);
      const saat = saatM ? saatM[1].replace('.', ':').padStart(5, '0') : '';
      const stadyum = temiz(stadyumHam.replace(/-\s*\d{1,2}[:.]\d{2}\s*$/, '').replace(/[\s-]+$/, ''));
      maclar.push({
        tffId, adres, hafta, tarih, saat, stadyum,
        ev: adlar[0] || '', mis: adlar[1] || '',
        evGol: skorHam[0] ?? null, misGol: skorHam[1] ?? null,
      });
    });
  });

  return { lig, grup, sezon, sezonNo, haftaSayisi, aktifHafta, puan, maclar };
}

// ===================== MAÇ DETAY SAYFASI =====================

export interface TffOlay { taraf: 'ev' | 'mis'; dakika: number; oyuncu: string }
export interface TffKart extends TffOlay { tur: 'sari' | 'kirmizi' }
export interface TffDegisiklik { taraf: 'ev' | 'mis'; dakika: number; giren: string; cikan: string }
export interface TffKadroOyuncu { no: string; ad: string; ilk11: boolean }

export interface TffMacDetayi {
  ev: string;
  mis: string;
  evGol: number | null;
  misGol: number | null;
  hakem: string;
  goller: TffOlay[];
  kartlar: TffKart[];
  degisiklikler: TffDegisiklik[];
  kadro: { ev: TffKadroOyuncu[]; mis: TffKadroOyuncu[] };
}

export function macSayfasiniAyristir($: CheerioAPI): TffMacDetayi {
  const adlar = $('.game-result__team-name').map((_, e) => temiz($(e).text())).get();
  const skor = $('.game-result__score-result').toArray().map((e) => sayi($(e).text()));

  let hakem = '';
  $('.game-result__referee').each((_, e) => {
    const etiket = temiz($(e).find('label').first().text());
    if (/^Hakem$/i.test(etiket) && !hakem) {
      const kopya = $(e).clone();
      kopya.find('label').remove();
      hakem = duzgunAd(temiz(kopya.text()));
    }
  });

  const goller: TffOlay[] = [];
  const kartlar: TffKart[] = [];
  const degisiklikler: TffDegisiklik[] = [];
  $('.df-timeline__event').each((_, ev) => {
    const olay = $(ev);
    const dakika = sayi(temiz(olay.find('.df-timeline__time').first().text()).replace(/[^\d]/g, ''));
    if (dakika === null) return;
    let taraf: 'ev' | 'mis' | null = null;
    if (olay.find('.df-timeline__team-1').length) taraf = 'ev';
    else if (olay.find('.df-timeline__team-2').length) taraf = 'mis';
    if (!taraf) return;
    const ikon = olay.find('.df-timeline__event-icon i').attr('class') || '';
    const adlar = olay.find('.df-timeline__event-name').toArray().map((e) => formaVeAd($(e).text()).ad).filter(Boolean);
    if (/soccer-ball/.test(ikon)) {
      adlar.slice(0, 1).forEach((oyuncu) => goller.push({ taraf: taraf!, dakika, oyuncu }));
    } else if (/yellow-card/.test(ikon)) {
      adlar.forEach((oyuncu) => kartlar.push({ taraf: taraf!, dakika, oyuncu, tur: 'sari' }));
    } else if (/red-card/.test(ikon)) {
      adlar.forEach((oyuncu) => kartlar.push({ taraf: taraf!, dakika, oyuncu, tur: 'kirmizi' }));
    } else if (/substitution/.test(ikon)) {
      // Aynı dakikadaki değişiklikler çift çift gelir: önce giren, sonra çıkan
      for (let i = 0; i + 1 < adlar.length; i += 2) {
        degisiklikler.push({ taraf: taraf!, dakika, giren: adlar[i], cikan: adlar[i + 1] });
      }
    }
  });

  // Kadrolar: her takım için ayrı kutu; "İlk 11", "Yedekler", "Teknik Kadro" bölümleri
  const kadrolar: TffKadroOyuncu[][] = [];
  $('aside').each((_, kutu) => {
    if (!$(kutu).find('.lineup__name').length) return;
    const liste: TffKadroOyuncu[] = [];
    let bolum = '';
    $(kutu).find('tr').each((_, tr) => {
      const alt = $(tr).find('.lineup__subheader');
      if (alt.length) { bolum = temiz(alt.text()).toLocaleLowerCase('tr-TR'); return; }
      if (/teknik/.test(bolum)) return;
      const ad = temiz($(tr).find('.lineup__name').text());
      if (!ad) return;
      liste.push({ no: temiz($(tr).find('.lineup__num').text()), ad: duzgunAd(ad), ilk11: /ilk/.test(bolum) });
    });
    kadrolar.push(liste);
  });

  return {
    ev: adlar[0] || '', mis: adlar[1] || '',
    evGol: skor[0] ?? null, misGol: skor[1] ?? null,
    hakem, goller, kartlar, degisiklikler,
    kadro: { ev: kadrolar[0] ?? [], mis: kadrolar[1] ?? [] },
  };
}

// ===================== GRUP BULMA =====================

/** "Tüm Gruplar" sayfasındaki grup bağlantıları: [{ id, ad }] */
export function grupListesi($: CheerioAPI): { id: string; ad: string }[] {
  const liste: { id: string; ad: string }[] = [];
  $('.fixture-group-filter').each((_, e) => {
    const id = temiz($(e).attr('data-id'));
    if (/^\d+$/.test(id) && id !== '0') liste.push({ id, ad: temiz($(e).text()) });
  });
  return liste;
}
