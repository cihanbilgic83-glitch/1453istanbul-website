export interface MacOlay {
  oyuncu: string;
  dakika: number;
  takim: string;
}

export interface MacKart {
  oyuncu: string;
  dakika: number;
  takim: string;
  tur: 'sari' | 'kirmizi';
}

export interface MacDegisiklik {
  cikan: string;
  giren: string;
  dakika: number;
  takim: string;
}

// Kulübün takımları: A takım ve altyapı takımları
export type TakimKodu = 'a' | 'u17' | 'u14';

export interface KadroOyuncu {
  no: string;
  ad: string;
  ilk11: boolean;
}

export interface Mac {
  id: string;
  /** Hangi takımımızın maçı. Boşsa A takım sayılır. */
  takim?: TakimKodu;
  /** TFF İstanbul maç numarası (otomatik güncellenen maçlarda) */
  tffId?: string;
  /** TFF maç detay sayfasının yolu (/mac/...) */
  tffAdres?: string;
  hafta?: number;
  hakem?: string;
  kaynak?: 'tff' | 'elle';
  /** Maç detay sayfası (gol, kart, kadro) TFF'den alındı mı */
  detayAlindi?: boolean;
  kadro?: { ev: KadroOyuncu[]; mis: KadroOyuncu[] };
  ev_sahibi: string;
  misafir: string;
  tarih: string;
  saat: string;
  stadyum: string;
  lig: string;
  durum: 'gelecek' | 'tamamlandi' | 'ertelendi';
  ev_gol: number | null;
  mis_gol: number | null;
  onemli: boolean;
  goller?: MacOlay[];
  asistler?: MacOlay[];
  kartlar?: MacKart[];
  degisiklikler?: MacDegisiklik[];
}

export interface Haber {
  id: string;
  slug: string;
  baslik: string;
  ozet: string;
  icerik: string;
  gorsel: string;
  kategori: string;
  tarih: string;
  yazar?: string;
  eskiSluglar?: string[];
}

export interface PuanTablosu {
  id: string;
  takim: string;
  o: number;
  g: number;
  b: number;
  m: number;
  ag: number;
  yg: number;
  av: number;
  puan: number;
  form: string[];
}

export interface GaleriOge {
  id: string;
  baslik: string;
  aciklama: string;
  gorsel: string;
  kategori: string;
  tarih: string;
}

export interface Mesaj {
  id: string;
  ad: string;
  email: string;
  telefon?: string;
  konu: string;
  mesaj: string;
  tarih: string;
  okundu: boolean;
}
// TFF İstanbul'dan otomatik güncelleme ayarları
export interface TffKaynak {
  takim: TakimKodu;
  /** Grup sayfasının adresi. A takım için boş bırakılırsa grup kendiliğinden aranır. */
  adres: string;
}

export interface TffTakimDurumu {
  zaman: string;
  basarili: boolean;
  mesaj: string;
  macSayisi?: number;
  takimSayisi?: number;
  tumSezonAlindi?: boolean;
}

export interface TffDurum {
  sonCalisma?: string;
  takimlar: Partial<Record<TakimKodu, TffTakimDurumu>>;
}
