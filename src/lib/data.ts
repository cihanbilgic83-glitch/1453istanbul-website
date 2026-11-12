import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';
import type { Mac, Haber, PuanTablosu, GaleriOge, Mesaj, TakimKodu, TffKaynak, TffDurum } from './types';
import { adresiCoz, slugify } from './slug';
import { tarihSirala } from './tarih';

// Redis istemcisi
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const dataDir = path.join(process.cwd(), 'data');

// JSON dosyasından oku (fallback/seed için)
function readJSONFile<T>(filename: string): T[] {
  try {
    const raw = fs.readFileSync(path.join(dataDir, filename), 'utf-8');
    return JSON.parse(raw) as T[];
  } catch { return []; }
}

function readJSONObjFile<T>(filename: string, defaultVal: T): T {
  try {
    const raw = fs.readFileSync(path.join(dataDir, filename), 'utf-8');
    return JSON.parse(raw) as T;
  } catch { return defaultVal; }
}

// Redis'ten liste oku — boşsa JSON'dan seed et
async function getList<T>(key: string, jsonFile: string): Promise<T[]> {
  try {
    const data = await redis.get<T[]>(key);
    if (data !== null && data !== undefined) return data;
    // İlk kullanım: JSON'dan yükle
    const fromFile = readJSONFile<T>(jsonFile);
    if (fromFile.length > 0) await redis.set(key, fromFile);
    return fromFile;
  } catch {
    return readJSONFile<T>(jsonFile);
  }
}

// Redis'ten obje oku — boşsa JSON'dan seed et
async function getObj<T>(key: string, jsonFile: string, defaultVal: T): Promise<T> {
  try {
    const data = await redis.get<T>(key);
    if (data !== null && data !== undefined) return data;
    const fromFile = readJSONObjFile<T>(jsonFile, defaultVal);
    await redis.set(key, fromFile);
    return fromFile;
  } catch {
    return readJSONObjFile<T>(jsonFile, defaultVal);
  }
}

// Redis'e kaydet
async function setList<T>(key: string, data: T[]): Promise<void> {
  await redis.set(key, data);
}

async function setObj<T>(key: string, data: T): Promise<void> {
  await redis.set(key, data);
}

// ---- MAÇLAR ----
export async function getMaclar(): Promise<Mac[]> {
  return getList<Mac>('maclar', 'maclar.json');
}
export async function saveMaclar(data: Mac[]): Promise<void> {
  await setList('maclar', data);
}

// ---- HABERLER ----
// Haberler her zaman yeniden eskiye, tarihe göre sıralı döner.
export async function getHaberler(): Promise<Haber[]> {
  const haberler = await getList<Haber>('haberler', 'haberler.json');
  return tarihSirala(haberler.filter((h) => h && h.slug && h.baslik));
}

export type HaberArama = { haber: Haber; yonlendir: boolean } | null;

// Adres parametresine göre haberi bulur. Eski (bozuk) adresler için yönlendirme ister.
export async function haberiBul(parametre: string): Promise<HaberArama> {
  const slug = adresiCoz(parametre);
  const haberler = await getHaberler();
  const tam = haberler.find((h) => h.slug === slug);
  if (tam) return { haber: tam, yonlendir: false };
  const eski = haberler.find((h) => h.eskiSluglar?.includes(slug));
  if (eski) return { haber: eski, yonlendir: true };
  const duzeltilmis = slugify(slug);
  const benzer = haberler.find((h) => h.slug === duzeltilmis);
  if (benzer) return { haber: benzer, yonlendir: true };
  return null;
}
export async function saveHaberler(data: Haber[]): Promise<void> {
  await setList('haberler', data);
}

// ---- PUAN TABLOSU ----
// A takımın tablosu eski anahtarda durur; altyapı takımlarının ayrı anahtarı vardır.
const puanAnahtari = (takim: TakimKodu) => (takim === 'a' ? 'puan-tablosu' : `puan-tablosu-${takim}`);

export async function getPuanTablosu(takim: TakimKodu = 'a'): Promise<PuanTablosu[]> {
  return getList<PuanTablosu>(puanAnahtari(takim), takim === 'a' ? 'puan-tablosu.json' : `puan-tablosu-${takim}.json`);
}
export async function savePuanTablosu(data: PuanTablosu[], takim: TakimKodu = 'a'): Promise<void> {
  await setList(puanAnahtari(takim), data);
}

// ---- TFF OTOMATİK GÜNCELLEME ----
export const VARSAYILAN_TFF_KAYNAKLARI: TffKaynak[] = [
  { takim: 'a', adres: '' },
  { takim: 'u17', adres: '/puantaj-ve-fikstur/2026-2027/u17-b-ligi/30/178/6069' },
  { takim: 'u14', adres: '/puantaj-ve-fikstur/2026-2027/u14-b-ligi/30/181/6154' },
];

export async function getTffKaynaklari(): Promise<TffKaynak[]> {
  try {
    const kayitli = await redis.get<TffKaynak[]>('tff-kaynaklar');
    if (Array.isArray(kayitli) && kayitli.length) {
      // Sonradan eklenen takımlar da listede olsun
      return VARSAYILAN_TFF_KAYNAKLARI.map((v) => kayitli.find((k) => k.takim === v.takim) ?? v);
    }
  } catch { /* Redis yoksa varsayılanlar */ }
  return VARSAYILAN_TFF_KAYNAKLARI;
}
export async function saveTffKaynaklari(data: TffKaynak[]): Promise<void> {
  await setObj('tff-kaynaklar', data);
}

export async function getTffDurum(): Promise<TffDurum> {
  try {
    const d = await redis.get<TffDurum>('tff-durum');
    if (d && typeof d === 'object') return { ...d, takimlar: d.takimlar ?? {} };
  } catch { /* yok */ }
  return { takimlar: {} };
}
export async function saveTffDurum(data: TffDurum): Promise<void> {
  await setObj('tff-durum', data);
}

// ---- GALERİ ----
export async function getGaleri(): Promise<GaleriOge[]> {
  return getList<GaleriOge>('galeri', 'galeri.json');
}
export async function saveGaleri(data: GaleriOge[]): Promise<void> {
  await setList('galeri', data);
}

// ---- MESAJLAR ----
export async function getMesajlar(): Promise<Mesaj[]> {
  return getList<Mesaj>('mesajlar', 'mesajlar.json');
}
export async function saveMesajlar(data: Mesaj[]): Promise<void> {
  await setList('mesajlar', data);
}
export async function addMesaj(mesaj: Omit<Mesaj, 'id' | 'tarih' | 'okundu'>): Promise<Mesaj> {
  const mesajlar = await getMesajlar();
  const yeni: Mesaj = {
    ...mesaj,
    id: Date.now().toString(),
    tarih: new Date().toISOString(),
    okundu: false,
  };
  mesajlar.unshift(yeni);
  await saveMesajlar(mesajlar);
  return yeni;
}

// ---- SİTE AYARLARI ----
export interface SiteAyarlari {
  iletisim: { adres: string; email: string; telefon: string; harita_link: string };
  calisma_saatleri: { gun: string; saat: string }[];
  sosyal_medya: { instagram: string; twitter: string; facebook: string; youtube: string };
  hero: { baslik: string; altyazi: string; aciklama: string; sezon: string };
  footer_aciklama: string;
  vizyon: string;
  misyon: string;
  baskan_mesaj: string;
  baskan_gorsel: string;
  tarihce: { yil: string; baslik: string; icerik: string }[];
}

const defaultAyarlar: SiteAyarlari = {
  iletisim: { adres: '', email: '', telefon: '', harita_link: '' },
  calisma_saatleri: [],
  sosyal_medya: { instagram: '', twitter: '', facebook: '', youtube: '' },
  hero: { baslik: '1453 İSTANBUL AS', altyazi: "İstanbul'un Kalbi Biziz", aciklama: '', sezon: '2025 — 2026 Sezonu' },
  footer_aciklama: '',
  vizyon: '',
  misyon: '',
  baskan_mesaj: '',
  baskan_gorsel: '',
  tarihce: [],
};

export async function getSiteAyarlari(): Promise<SiteAyarlari> {
  return getObj<SiteAyarlari>('site-ayarlari', 'site-ayarlari.json', defaultAyarlar);
}
export async function saveSiteAyarlari(data: SiteAyarlari): Promise<void> {
  await setObj('site-ayarlari', data);
}

// ---- YÖNETİM KURULU ----
export interface YonetimUye {
  id: string;
  isim: string;
  gorev: string;
  gorsel: string;
}
export async function getYonetim(): Promise<YonetimUye[]> {
  return getList<YonetimUye>('yonetim', 'yonetim.json');
}
export async function saveYonetim(data: YonetimUye[]): Promise<void> {
  await setList('yonetim', data);
}

// ---- SPONSORLAR ----
export interface Sponsor {
  id: string;
  isim: string;
  logo: string;
  web: string;
  kategori: string;
}
export async function getSponsorlar(): Promise<Sponsor[]> {
  return getList<Sponsor>('sponsorlar', 'sponsorlar.json');
}
export async function saveSponsorlar(data: Sponsor[]): Promise<void> {
  await setList('sponsorlar', data);
}