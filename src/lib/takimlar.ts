import type { Mac, TakimKodu } from './types';

export interface TakimTanimi {
  kod: TakimKodu;
  /** Sekmelerde ve rozetlerde görünen kısa ad */
  ad: string;
  /** Uzun ad (başlıklar) */
  uzunAd: string;
}

export const TAKIMLAR: TakimTanimi[] = [
  { kod: 'a', ad: 'A Takım', uzunAd: 'A Takım' },
  { kod: 'u17', ad: 'U17', uzunAd: 'U17 Takımı' },
  { kod: 'u14', ad: 'U14', uzunAd: 'U14 Takımı' },
];

export const TAKIM_KODLARI = TAKIMLAR.map((t) => t.kod);

export function takimKoduMu(deger: unknown): deger is TakimKodu {
  return typeof deger === 'string' && (TAKIM_KODLARI as string[]).includes(deger);
}

export function takimTanimi(kod: TakimKodu): TakimTanimi {
  return TAKIMLAR.find((t) => t.kod === kod) ?? TAKIMLAR[0];
}

/** Takım alanı boş olan (elle girilmiş eski) maçlar A takıma aittir. */
export function macTakimi(mac: Pick<Mac, 'takim'>): TakimKodu {
  return mac.takim ?? 'a';
}
