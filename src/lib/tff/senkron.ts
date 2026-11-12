// TFF İstanbul'dan puan tablosu, fikstür, skor ve maç detaylarını çekip siteye işler.
// Sayfalar iki yoldan gelebilir:
//  - doğrudan: sunucu TFF'ye kendisi bağlanır (TFF sunucumuzu engellediği için şu an çalışmıyor)
//  - köprü: Türkiye'deki bilgisayarda çalışan program sayfaları okuyup gönderir (onbellekGetirici)

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type { Mac, PuanTablosu, TakimKodu, TffDurum, TffTakimDurumu } from '../types';
import { bizimTakimMi } from '../takim';
import { macTakimi } from '../takimlar';
import {
  getMaclar, saveMaclar, savePuanTablosu,
  getTffKaynaklari, saveTffKaynaklari, getTffDurum, saveTffDurum,
} from '../data';
import {
  grupSayfasiniAyristir, macSayfasiniAyristir, grupListesi, duzgunAd,
  type TffGrupSayfasi, type TffMacOzeti,
} from './ayristir';

const TFF_KOK = 'https://tffistanbul.org';
const BIZIM_AD = '1453 İstanbul AS';
/** İstekler arasında bekleme: TFF sunucusunu yormamak için */
const BEKLEME_MS = 800;
/** A takımın ligi (2. Amatör Lig). Lig değişirse panelden grup adresi girilir. */
const A_TAKIM_LIGI = { yol: '2-amator-lig', no: '3' };

const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** "fetch failed" yerine asıl nedeni (bağlantı kesilmesi, zaman aşımı, sertifika...) okunur hâle getirir. */
function baglantiHatasi(hata: unknown, adres: string): Error {
  const e = hata as { message?: string; name?: string; cause?: { code?: string; message?: string; cause?: { code?: string } } };
  const kod = e?.cause?.code || e?.cause?.cause?.code || e?.name || '';
  const ayrinti = e?.cause?.message || e?.message || String(hata);
  const aciklama: Record<string, string> = {
    ECONNRESET: 'TFF sunucusu bağlantıyı kesti (sunucumuz engelleniyor olabilir)',
    ECONNREFUSED: 'TFF sunucusu bağlantıyı reddetti',
    ETIMEDOUT: 'TFF sunucusu yanıt vermedi (zaman aşımı)',
    UND_ERR_CONNECT_TIMEOUT: 'TFF sunucusuna bağlanılamadı (zaman aşımı)',
    UND_ERR_SOCKET: 'TFF sunucusu bağlantıyı kapattı',
    TimeoutError: 'TFF sayfası 20 saniyede yanıt vermedi',
    ENOTFOUND: 'TFF alan adı çözülemedi',
    UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'TFF sitesinin güvenlik sertifikası zinciri eksik',
    UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 'TFF sitesinin güvenlik sertifikası zinciri eksik',
    CERT_HAS_EXPIRED: 'TFF sitesinin güvenlik sertifikasının süresi dolmuş',
  };
  return new Error(`${aciklama[kod] ?? 'TFF sayfasına ulaşılamadı'} [${kod || 'bilinmiyor'}: ${ayrinti}] (${adres})`);
}

/** Sayfa getirme yöntemi: doğrudan TFF'den ya da köprünün gönderdiği paketten */
export type Getirici = (yol: string) => Promise<CheerioAPI>;

/** Köprü paketinde bulunmayan sayfalar: program bunları okuyup bir sonraki turda gönderir */
export class EksikSayfa extends Error {
  constructor(public yollar: string[]) { super(`TFF sayfası bekleniyor: ${yollar.join(', ')}`); }
}

/** Köprünün gönderdiği sayfalardan okur. Boş metin = program o sayfayı TFF'den alamadı. */
export function onbellekGetirici(sayfalar: Record<string, string>): Getirici {
  return async (yol) => {
    if (!(yol in sayfalar)) throw new EksikSayfa([yol]);
    const html = sayfalar[yol];
    if (!html) throw new Error(`Bilgisayardaki program bu TFF sayfasını alamadı: ${yol}`);
    return cheerio.load(html);
  };
}

/** Eksik sayfa hatalarını toplar, işe devam eder; diğer hataları olduğu gibi fırlatır */
async function topluca<T>(eksikler: string[], is: () => Promise<T>): Promise<T | null> {
  try { return await is(); }
  catch (hata) {
    if (hata instanceof EksikSayfa) { eksikler.push(...hata.yollar); return null; }
    throw hata;
  }
}

async function sayfaGetir(yol: string): Promise<CheerioAPI> {
  const adres = yol.startsWith('http') ? yol : TFF_KOK + yol;
  const yanit = await fetch(adres, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'tr-TR,tr;q=0.9',
      Referer: TFF_KOK + '/',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  }).catch((hata) => { throw baglantiHatasi(hata, adres); });
  if (!yanit.ok) throw new Error(`TFF sayfası açılamadı (${yanit.status}): ${yol}`);
  const html = await yanit.text();
  await bekle(BEKLEME_MS);
  return cheerio.load(html);
}

/**
 * Panelden yapıştırılan adresi grup sayfası yoluna çevirir.
 * https://tffistanbul.org/puantaj-ve-fikstur/2026-2027/u14-b-ligi/30/181/6154/3 -> /puantaj-ve-fikstur/2026-2027/u14-b-ligi/30/181/6154
 */
export function grupYolu(adres: string): string | null {
  const yol = adres.trim().replace(/^https?:\/\/[^/]+/i, '').replace(/[?#].*$/, '');
  const p = yol.split('/').filter(Boolean);
  if (p[0] !== 'puantaj-ve-fikstur' || p.length < 6) return null;
  if (!/^\d{4}-\d{4}$/.test(p[1]) || !/^\d+$/.test(p[3]) || !/^\d+$/.test(p[4]) || !/^\d+$/.test(p[5])) return null;
  return '/' + p.slice(0, 6).join('/');
}

function takimAdi(ham: string): string {
  return bizimTakimMi(ham) ? BIZIM_AD : duzgunAd(ham);
}

function sade(ad: string): string {
  return ad.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

function ayniTakim(a: string, b: string): boolean {
  if (bizimTakimMi(a) || bizimTakimMi(b)) return bizimTakimMi(a) && bizimTakimMi(b);
  const x = sade(a), y = sade(b);
  return !!x && !!y && (x.startsWith(y.slice(0, 8)) || y.startsWith(x.slice(0, 8)));
}

const simdi = () => new Date().toISOString();

// ---------------- A takımın grubunu bulma ----------------

/** Sezon bilgisini kayıtlı herhangi bir grup adresinden çıkarır: { sezon: '2026-2027', no: '30' } */
function sezonBilgisi(adresler: string[]): { sezon: string; no: string } | null {
  for (const a of adresler) {
    const yol = grupYolu(a);
    if (!yol) continue;
    const p = yol.split('/').filter(Boolean);
    return { sezon: p[1], no: p[3] };
  }
  return null;
}

async function aTakiminGrubunuBul(sezon: { sezon: string; no: string }, getir: Getirici): Promise<string | null> {
  const kok = `/puantaj-ve-fikstur/${sezon.sezon}/${A_TAKIM_LIGI.yol}/${sezon.no}/${A_TAKIM_LIGI.no}`;
  const $tum = await getir(`${kok}/0`);
  const bizVar = $tum('.team-meta__name, .widget-results__team-name').toArray().some((e) => bizimTakimMi($tum(e).text()));
  const gruplar = grupListesi($tum);
  if (!bizVar || gruplar.length === 0) return null; // fikstür henüz yayınlanmamış
  const eksikler: string[] = [];
  for (const g of gruplar) {
    const $g = await topluca(eksikler, () => getir(`${kok}/${g.id}`));
    if (!$g) continue;
    const puan = grupSayfasiniAyristir($g).puan;
    if (puan.some((s) => bizimTakimMi(s.takim))) return `${kok}/${g.id}`;
  }
  if (eksikler.length) throw new EksikSayfa(eksikler);
  return null;
}

// ---------------- Bir takımı güncelleme ----------------

interface TakimSonucu {
  durum: TffTakimDurumu;
  puan: PuanTablosu[];
  maclar: Mac[];
}

function durumBelirle(oz: TffMacOzeti, aktifHafta: number | null, onceki?: Mac): Mac['durum'] {
  if (oz.evGol !== null && oz.misGol !== null) return 'tamamlandi';
  // Tarihi belirlenmemiş ve haftası geçmiş maç ertelenmiştir
  if (!oz.tarih && oz.hafta !== null && aktifHafta !== null && oz.hafta <= aktifHafta) return 'ertelendi';
  if (!oz.tarih && onceki?.durum === 'ertelendi') return 'ertelendi';
  return 'gelecek';
}

async function takimiGuncelle(
  takim: TakimKodu, yol: string, mevcut: Mac[],
  secenek: { tumSezon: boolean; detayLimiti: number },
  getir: Getirici,
): Promise<TakimSonucu> {
  const ana = grupSayfasiniAyristir(await getir(yol));
  const eksikler: string[] = [];
  const lig = [duzgunAd(ana.lig), duzgunAd(ana.grup)].filter(Boolean).join(' · ');

  const ozetler = new Map<string, TffMacOzeti>();
  const topla = (g: TffGrupSayfasi) => g.maclar.forEach((m) => {
    if (bizimTakimMi(m.ev) || bizimTakimMi(m.mis)) ozetler.set(m.tffId, m);
  });
  topla(ana);

  if (secenek.tumSezon) {
    // Her hafta sayfası o haftayı ve bir sonrakini gösterir: 1, 3, 5... yeterli
    for (let h = 1; h <= ana.haftaSayisi; h += 2) {
      if (h === ana.aktifHafta) continue;
      const $h = await topluca(eksikler, () => getir(`${yol}/${h}`));
      if ($h) topla(grupSayfasiniAyristir($h));
    }
  } else if (ana.aktifHafta && ana.aktifHafta > 1) {
    // Geç girilen skorlar için bir önceki hafta
    const $h = await topluca(eksikler, () => getir(`${yol}/${ana.aktifHafta! - 1}`));
    if ($h) topla(grupSayfasiniAyristir($h));
  }
  // Bütün haftalar gelmeden birleştirme yapılmaz (yarım veri yazılmasın)
  if (eksikler.length) throw new EksikSayfa(eksikler);

  // Maçları mevcut kayıtlarla birleştir (elle girilmiş aynı maç varsa ona bağlanır)
  const sonuc: Mac[] = [];
  for (const oz of ozetler.values()) {
    const ev = takimAdi(oz.ev);
    const mis = takimAdi(oz.mis);
    const onceki = mevcut.find((m) => m.tffId === oz.tffId)
      ?? mevcut.find((m) => !m.tffId && macTakimi(m) === takim && !!oz.tarih && m.tarih === oz.tarih
        && ayniTakim(m.ev_sahibi, ev) && ayniTakim(m.misafir, mis));
    const durum = durumBelirle(oz, ana.aktifHafta, onceki);
    const skorVar = durum === 'tamamlandi';
    const skorDegisti = !onceki || onceki.ev_gol !== (skorVar ? oz.evGol : null) || onceki.mis_gol !== (skorVar ? oz.misGol : null);
    sonuc.push({
      goller: [], asistler: [], kartlar: [], degisiklikler: [], onemli: false,
      ...onceki,
      id: onceki?.id ?? `tff-${oz.tffId}`,
      takim,
      tffId: oz.tffId,
      tffAdres: oz.adres,
      hafta: oz.hafta ?? onceki?.hafta,
      kaynak: 'tff',
      ev_sahibi: ev,
      misafir: mis,
      tarih: oz.tarih ?? (durum === 'ertelendi' ? onceki?.tarih ?? '' : ''),
      saat: oz.saat || onceki?.saat || '',
      stadyum: duzgunAd(oz.stadyum) || onceki?.stadyum || '',
      lig: lig || onceki?.lig || '',
      durum,
      ev_gol: skorVar ? oz.evGol : null,
      mis_gol: skorVar ? oz.misGol : null,
      detayAlindi: skorDegisti ? false : onceki?.detayAlindi,
    });
  }

  // Oynanmış maçların detayları (gol, kart, değişiklik, kadro, hakem)
  const bugunMs = Date.now();
  const detayBekleyen = sonuc
    .filter((m) => m.durum === 'tamamlandi' && !m.detayAlindi && m.tffAdres)
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .slice(0, secenek.detayLimiti);
  for (const mac of detayBekleyen) {
    const $d = await topluca(eksikler, () => getir(mac.tffAdres!));
    if (!$d) continue;
    const d = macSayfasiniAyristir($d);
    const ad = (taraf: 'ev' | 'mis') => (taraf === 'ev' ? mac.ev_sahibi : mac.misafir);
    const toplamGol = (mac.ev_gol ?? 0) + (mac.mis_gol ?? 0);
    const olayVar = d.goller.length > 0 || d.kartlar.length > 0 || d.kadro.ev.length > 0;
    if (olayVar) {
      mac.goller = d.goller.map((g) => ({ oyuncu: g.oyuncu, dakika: g.dakika, takim: ad(g.taraf) }));
      mac.kartlar = d.kartlar.map((k) => ({ oyuncu: k.oyuncu, dakika: k.dakika, takim: ad(k.taraf), tur: k.tur }));
      mac.degisiklikler = d.degisiklikler.map((x) => ({ giren: x.giren, cikan: x.cikan, dakika: x.dakika, takim: ad(x.taraf) }));
      mac.kadro = d.kadro;
    }
    if (d.hakem) mac.hakem = d.hakem;
    // Goller tam girilmişse ya da maç 10 günden eskiyse bir daha sorma
    const eski = mac.tarih && bugunMs - new Date(mac.tarih).getTime() > 10 * 86400000;
    mac.detayAlindi = (olayVar && d.goller.length >= toplamGol) || !!eski;
  }

  if (eksikler.length) throw new EksikSayfa(eksikler);

  const puan: PuanTablosu[] = ana.puan.map((s, i) => ({
    id: `tff-${takim}-${i + 1}`,
    takim: takimAdi(s.takim),
    o: s.o, g: s.g, b: s.b, m: s.m, ag: s.ag, yg: s.yg, av: s.av, puan: s.puan,
    form: [],
  }));

  return {
    puan,
    maclar: sonuc,
    durum: {
      zaman: simdi(),
      basarili: true,
      mesaj: `${secenek.tumSezon ? 'Tüm sezon' : 'Son iki hafta'}: ${sonuc.length} maç kontrol edildi, puan tablosu (${puan.length} takım) güncellendi`,
      macSayisi: sonuc.length,
      takimSayisi: puan.length,
      tumSezonAlindi: true,
    },
  };
}

// ---------------- Dışa açık giriş noktası ----------------

export interface SenkronSecenekleri {
  /** Yalnızca bu takım (boşsa hepsi) */
  takim?: TakimKodu;
  /** Sezonun bütün haftalarını yeniden çek */
  tumSezon?: boolean;
  /** Sayfaların nereden okunacağı (varsayılan: doğrudan TFF) */
  getirici?: Getirici;
  /** Durum kaydında görünecek kaynak */
  kaynak?: TffTakimDurumu['kaynak'];
}

export type SenkronSonucu = TffDurum & { eksik?: string[] };

export async function tffSenkronla(secenek: SenkronSecenekleri = {}): Promise<SenkronSonucu> {
  const getir = secenek.getirici ?? sayfaGetir;
  const kaynaklar = await getTffKaynaklari();
  const durum = await getTffDurum();
  const anlik = await getMaclar();
  const guncellenen: Mac[] = [];
  const bekleyenPuan: [TakimKodu, PuanTablosu[]][] = [];
  const eksik: string[] = [];

  // A takım en sona: grubunu bulmak için diğer takımların sezon bilgisi kullanılır
  const sira: TakimKodu[] = secenek.takim ? [secenek.takim] : ['u17', 'u14', 'a'];
  for (const takim of sira) {
    const kaynak = kaynaklar.find((k) => k.takim === takim);
    try {
      let yol = kaynak?.adres ? grupYolu(kaynak.adres) : null;
      if (kaynak?.adres && !yol) throw new Error('Kayıtlı TFF adresi bir grup sayfası değil. Panelden düzeltin.');
      if (!yol && takim === 'a') {
        const sezon = sezonBilgisi(kaynaklar.map((k) => k.adres));
        yol = sezon ? await aTakiminGrubunuBul(sezon, getir) : null;
        if (yol && kaynak) {
          kaynak.adres = yol;
          await saveTffKaynaklari(kaynaklar);
        }
        if (!yol) {
          durum.takimlar.a = { zaman: simdi(), basarili: true, kaynak: secenek.kaynak, mesaj: 'A takım fikstürü TFF\'de henüz yayınlanmamış. Yayınlanınca kendiliğinden bulunacak.' };
          continue;
        }
      }
      if (!yol) {
        durum.takimlar[takim] = { zaman: simdi(), basarili: false, mesaj: 'TFF grup adresi girilmemiş.' };
        continue;
      }
      const ilkKez = !durum.takimlar[takim]?.tumSezonAlindi;
      const tumSezon = !!secenek.tumSezon || ilkKez;
      const sonuc = await takimiGuncelle(takim, yol, anlik, { tumSezon, detayLimiti: tumSezon ? 30 : 4 }, getir);
      if (sonuc.puan.length) bekleyenPuan.push([takim, sonuc.puan]);
      guncellenen.push(...sonuc.maclar);
      durum.takimlar[takim] = { ...sonuc.durum, kaynak: secenek.kaynak };
    } catch (hata) {
      if (hata instanceof EksikSayfa) { eksik.push(...hata.yollar); continue; }
      durum.takimlar[takim] = {
        ...durum.takimlar[takim],
        zaman: simdi(),
        basarili: false,
        kaynak: secenek.kaynak,
        mesaj: hata instanceof Error ? hata.message : String(hata),
      };
    }
  }

  // Köprü henüz bütün sayfaları göndermediyse hiçbir şey yazılmaz; eksikler istenir
  if (eksik.length) return { ...durum, eksik: [...new Set(eksik)] };

  for (const [takim, puan] of bekleyenPuan) await savePuanTablosu(puan, takim);

  if (guncellenen.length) {
    // Bu arada panelden yapılmış değişiklikleri ezmemek için güncel listeye işle
    const guncel = await getMaclar();
    for (const m of guncellenen) {
      const i = guncel.findIndex((x) => x.id === m.id);
      if (i >= 0) guncel[i] = { ...guncel[i], ...m, onemli: guncel[i].onemli, asistler: guncel[i].asistler };
      else guncel.push(m);
    }
    await saveMaclar(guncel);
  }

  durum.sonCalisma = simdi();
  await saveTffDurum(durum);
  return durum;
}
