import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { getTffKopruAnahtari, saveTffKopruAnahtari } from '../data';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://1453istanbul.com.tr').replace(/\/+$/, '');

export async function kopruAnahtariniHazirla(yenile = false): Promise<string> {
  const mevcut = yenile ? null : await getTffKopruAnahtari();
  if (mevcut) return mevcut;
  const anahtar = randomBytes(32).toString('hex');
  await saveTffKopruAnahtari(anahtar);
  return anahtar;
}

/** Panelden indirilen Windows programı: anahtar ve site adresi içine yerleştirilmiş .bat */
export async function kopruProgrami(): Promise<string> {
  const anahtar = await kopruAnahtariniHazirla();
  const sablon = fs.readFileSync(path.join(process.cwd(), 'sablonlar', 'tff-guncelle.bat'), 'utf8');
  return sablon
    .replace(/^﻿/, '')
    .replace('__SITE__', SITE)
    .replace('__ANAHTAR__', anahtar)
    .replace(/\r?\n/g, '\r\n');
}
