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

export interface Mac {
  id: string;
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
  yazar: string;
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