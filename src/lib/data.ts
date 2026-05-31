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

function writeJSON<T>(filename: string, data: T[]): void {
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