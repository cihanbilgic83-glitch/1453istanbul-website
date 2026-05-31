import fs from 'fs';
import path from 'path';
import type { Mac, Haber, PuanTablosu, GaleriOge, Mesaj } from './types';

const dataDir = path.join(process.cwd(), 'data');

function readJSON<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function readJSONObj<T>(filename: string, defaultVal: T): T {
  const filePath = path.join(dataDir, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function writeJSONObj<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- MAÇLAR ----
export function getMaclar(): Mac[] {
  return readJSON<Mac>('maclar.json');
}

export function saveMaclar(data: Mac[]): void {
  writeJSON('maclar.json', data);
}

// ---- HABERLER ----
export function getHaberler(): Haber[] {
  return readJSON<Haber>('haberler.json');
}

export function getHaberBySlug(slug: string): Haber | undefined {
  return getHaberler().find((h) => h.slug === slug);
}

export function saveHaberler(data: Haber[]): void {
  writeJSON('haberler.json', data);
}

// ---- PUAN TABLOSU ----
export function getPuanTablosu(): PuanTablosu[] {
  return readJSON<PuanTablosu>('puan-tablosu.json');
}

export function savePuanTablosu(data: PuanTablosu[]): void {
  writeJSON('puan-tablosu.json', data);
}

// ---- GALERİ ----
export function getGaleri(): GaleriOge[] {
  return readJSON<GaleriOge>('galeri.json');
}

export function saveGaleri(data: GaleriOge[]): void {
  writeJSON('galeri.json', data);
}

// ---- MESAJLAR ----
export function getMesajlar(): Mesaj[] {
  return readJSON<Mesaj>('mesajlar.json');
}

export function saveMesajlar(data: Mesaj[]): void {
  writeJSON('mesajlar.json', data);
}

export function addMesaj(mesaj: Omit<Mesaj, 'id' | 'tarih' | 'okundu'>): Mesaj {
  const mesajlar = getMesajlar();
  const yeni: Mesaj = {
    ...mesaj,
    id: Date.now().toString(),
    tarih: new Date().toISOString(),
    okundu: false,
  };
  mesajlar.unshift(yeni);
  saveMesajlar(mesajlar);
  return yeni;
}

// ---- SİTE AYARLARI ----
export interface SiteAyarlari {
  iletisim: { adres: string; email: string; telefon: string; harita_link: string };
  calisma_saatleri: { gun: string; saat: string }[];
  sosyal_medya: { instagram: string; twitter: string; facebook: string; youtube: string };
  hero: { baslik: string; altyazi: string; aciklama: string };
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
  hero: { baslik: '1453 İSTANBUL AS', altyazi: "İstanbul'un Kalbi Biziz", aciklama: '' },
  footer_aciklama: '',
  vizyon: '',
  misyon: '',
  baskan_mesaj: '',
  baskan_gorsel: '',
  tarihce: [],
};

export function getSiteAyarlari(): SiteAyarlari {
  return readJSONObj<SiteAyarlari>('site-ayarlari.json', defaultAyarlar);
}

export function saveSiteAyarlari(data: SiteAyarlari): void {
  writeJSONObj('site-ayarlari.json', data);
}

// ---- YÖNETİM KURULU ----
export interface YonetimUye {
  id: string;
  isim: string;
  gorev: string;
  gorsel: string;
}

export function getYonetim(): YonetimUye[] {
  return readJSON<YonetimUye>('yonetim.json');
}

export function saveYonetim(data: YonetimUye[]): void {
  writeJSON('yonetim.json', data);
}

// ---- SPONSORLAR ----
export interface Sponsor {
  id: string;
  isim: string;
  logo: string;
  web: string;
  kategori: string;
}

export function getSponsorlar(): Sponsor[] {
  return readJSON<Sponsor>('sponsorlar.json');
}

export function saveSponsorlar(data: Sponsor[]): void {
  writeJSON('sponsorlar.json', data);
}