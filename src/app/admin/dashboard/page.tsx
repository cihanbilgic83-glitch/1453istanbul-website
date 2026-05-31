'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Mac, Haber, PuanTablosu, GaleriOge, Mesaj } from '@/lib/types';

type Sekme = 'maclar' | 'haberler' | 'puan' | 'galeri' | 'mesajlar';

// ===== MODAL =====
function Modal({ baslik, onKapat, children }: { baslik: string; onKapat: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{baslik}</h3>
          <button onClick={onKapat} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ===== FORM HELPERS =====
function FI({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}{required && ' *'}</label>
      <input {...props} className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#1A4D2E] focus:outline-none transition-colors" />
    </div>
  );
}

function FS({ label, required, children, ...props }: { label: string; required?: boolean; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}{required && ' *'}</label>
      <select {...props} className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:border-[#1A4D2E] focus:outline-none transition-colors">{children}</select>
    </div>
  );
}

function FT({ label, required, ...props }: { label: string; required?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}{required && ' *'}</label>
      <textarea {...props} className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#1A4D2E] focus:outline-none transition-colors resize-none" />
    </div>
  );
}

// ===== GÖRSEL YÜKLEME BİLEŞENİ =====
function GorselYukle({ value, onChange, label = 'Görsel' }: {
  value: string; onChange: (url: string) => void; label?: string;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const dosyaSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    if (dosya.size > 10 * 1024 * 1024) { setHata('Dosya 10MB\'dan büyük olamaz.'); return; }
    setHata('');
    setYukleniyor(true);
    try {
      const fd = new FormData();
      fd.append('image', dosya);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setHata(data.error || 'Yükleme başarısız.');
      }
    } catch {
      setHata('Bağlantı hatası.');
    } finally {
      setYukleniyor(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>
      <div className="space-y-2">
        {/* Dosya yükleme butonu */}
        <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors w-full ${
          yukleniyor ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-[#1A4D2E]/30 bg-[#f8f9fa] hover:border-[#1A4D2E] hover:bg-green-50/30'
        }`}>
          <input type="file" accept="image/*" onChange={dosyaSec} disabled={yukleniyor} className="hidden" />
          {yukleniyor ? (
            <>
              <div className="w-4 h-4 border-2 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">ImgBB&apos;ye yükleniyor...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-[#1A4D2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-[#1A4D2E] font-medium">{value ? 'Değiştir' : 'Dosya Seç'}</span>
              <span className="text-xs text-gray-400 ml-auto">JPG, PNG, GIF · maks 10MB</span>
            </>
          )}
        </label>

        {/* URL alanı (manuel giriş alternatifi) */}
        <input value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-gray-700 text-xs placeholder-gray-400"
          placeholder="veya URL yapıştır: https://..." />

        {hata && <p className="text-red-500 text-xs">{hata}</p>}

        {/* Önizleme */}
        {value && (
          <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200">
            <Image src={value} alt="Önizleme" fill className="object-cover" unoptimized />
            <button type="button" onClick={() => onChange('')}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors">
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MAÇ FORMU =====
type OlayItem = { oyuncu: string; dakika: number; takim: string };
type KartItem = { oyuncu: string; dakika: number; takim: string; tur: 'sari' | 'kirmizi' };

function OlayListesi({ baslik, liste, takimlar, onChange }: {
  baslik: string; liste: OlayItem[]; takimlar: [string, string]; onChange: (l: OlayItem[]) => void;
}) {
  const ekle = () => onChange([...liste, { oyuncu: '', dakika: 1, takim: takimlar[0] }]);
  const sil = (i: number) => onChange(liste.filter((_, idx) => idx !== i));
  const guncelle = (i: number, k: keyof OlayItem, v: string | number) => {
    const y = [...liste]; y[i] = { ...y[i], [k]: v }; onChange(y);
  };
  return (
    <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">{baslik}</span>
        <button type="button" onClick={ekle} className="text-xs px-2 py-1 bg-[#1A4D2E] text-white rounded-lg">+ Ekle</button>
      </div>
      {liste.map((o, i) => (
        <div key={i} className="grid grid-cols-12 gap-1.5 mb-2 items-center">
          <div className="col-span-1">
            <input type="number" min="1" max="120" value={o.dakika} onChange={e => guncelle(i, 'dakika', Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-center text-gray-900" placeholder="dk" />
          </div>
          <div className="col-span-5">
            <input value={o.oyuncu} onChange={e => guncelle(i, 'oyuncu', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900" placeholder="Oyuncu adı" />
          </div>
          <div className="col-span-5">
            <select value={o.takim} onChange={e => guncelle(i, 'takim', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-gray-900">
              <option value={takimlar[0]}>{takimlar[0].split(' ').slice(0,2).join(' ')}</option>
              <option value={takimlar[1]}>{takimlar[1].split(' ').slice(0,2).join(' ')}</option>
            </select>
          </div>
          <div className="col-span-1">
            <button type="button" onClick={() => sil(i)} className="w-full text-red-400 hover:text-red-600 text-sm font-bold">×</button>
          </div>
        </div>
      ))}
      {liste.length === 0 && <p className="text-xs text-gray-400 text-center py-1">Kayıt yok</p>}
    </div>
  );
}

function KartListesi({ liste, takimlar, onChange }: {
  liste: KartItem[]; takimlar: [string, string]; onChange: (l: KartItem[]) => void;
}) {
  const ekle = () => onChange([...liste, { oyuncu: '', dakika: 1, takim: takimlar[0], tur: 'sari' }]);
  const sil = (i: number) => onChange(liste.filter((_, idx) => idx !== i));
  const guncelle = (i: number, k: keyof KartItem, v: string | number) => {
    const y = [...liste]; y[i] = { ...y[i], [k]: v }; onChange(y);
  };
  return (
    <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">🟨🟥 Kartlar</span>
        <button type="button" onClick={ekle} className="text-xs px-2 py-1 bg-[#1A4D2E] text-white rounded-lg">+ Ekle</button>
      </div>
      {liste.map((k, i) => (
        <div key={i} className="grid grid-cols-12 gap-1.5 mb-2 items-center">
          <div className="col-span-1">
            <input type="number" min="1" max="120" value={k.dakika} onChange={e => guncelle(i, 'dakika', Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-center text-gray-900" placeholder="dk" />
          </div>
          <div className="col-span-4">
            <input value={k.oyuncu} onChange={e => guncelle(i, 'oyuncu', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900" placeholder="Oyuncu adı" />
          </div>
          <div className="col-span-3">
            <select value={k.takim} onChange={e => guncelle(i, 'takim', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-gray-900">
              <option value={takimlar[0]}>{takimlar[0].split(' ').slice(0,2).join(' ')}</option>
              <option value={takimlar[1]}>{takimlar[1].split(' ').slice(0,2).join(' ')}</option>
            </select>
          </div>
          <div className="col-span-3">
            <select value={k.tur} onChange={e => guncelle(i, 'tur', e.target.value)}
              className={`w-full border rounded px-1.5 py-1.5 text-xs font-bold ${k.tur === 'sari' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
              <option value="sari">Sarı</option>
              <option value="kirmizi">Kırmızı</option>
            </select>
          </div>
          <div className="col-span-1">
            <button type="button" onClick={() => sil(i)} className="w-full text-red-400 hover:text-red-600 text-sm font-bold">×</button>
          </div>
        </div>
      ))}
      {liste.length === 0 && <p className="text-xs text-gray-400 text-center py-1">Kayıt yok</p>}
    </div>
  );
}

function MacForm({ mac, onKaydet, onKapat }: { mac?: Mac; onKaydet: (d: Partial<Mac>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<Mac>>(mac || { ev_sahibi: '', misafir: '', tarih: '', saat: '19:00', stadyum: '1453 İstanbul AS Stadı', lig: 'İstanbul Amatör Ligi', durum: 'gelecek', ev_gol: null, mis_gol: null, onemli: false, goller: [], asistler: [], kartlar: [] });
  const set = (k: keyof Mac, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const takimlar: [string, string] = [form.ev_sahibi || 'Ev Sahibi', form.misafir || 'Misafir'];
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FI label="Ev Sahibi" required value={form.ev_sahibi || ''} onChange={e => set('ev_sahibi', e.target.value)} placeholder="Takım adı" />
        <FI label="Misafir" required value={form.misafir || ''} onChange={e => set('misafir', e.target.value)} placeholder="Takım adı" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FI label="Tarih" required type="date" value={form.tarih || ''} onChange={e => set('tarih', e.target.value)} />
        <FI label="Saat" required value={form.saat || ''} onChange={e => set('saat', e.target.value)} />
      </div>
      <FI label="Stadyum" value={form.stadyum || ''} onChange={e => set('stadyum', e.target.value)} />
      <FI label="Lig" value={form.lig || ''} onChange={e => set('lig', e.target.value)} />
      <FS label="Durum" required value={form.durum || 'gelecek'} onChange={e => set('durum', e.target.value as Mac['durum'])}>
        <option value="gelecek">Gelecek</option>
        <option value="tamamlandi">Tamamlandı</option>
        <option value="ertelendi">Ertelendi</option>
      </FS>
      {form.durum === 'tamamlandi' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <FI label="Ev Sahibi Gol" type="number" min="0" value={form.ev_gol ?? ''} onChange={e => set('ev_gol', e.target.value === '' ? null : Number(e.target.value))} />
            <FI label="Misafir Gol" type="number" min="0" value={form.mis_gol ?? ''} onChange={e => set('mis_gol', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Maç Detayları</p>
            <div className="space-y-3">
              <OlayListesi baslik="⚽ Goller" liste={(form.goller as OlayItem[]) || []} takimlar={takimlar}
                onChange={l => set('goller', l)} />
              <OlayListesi baslik="🅰 Asistler" liste={(form.asistler as OlayItem[]) || []} takimlar={takimlar}
                onChange={l => set('asistler', l)} />
              <KartListesi liste={(form.kartlar as KartItem[]) || []} takimlar={takimlar}
                onChange={l => set('kartlar', l)} />
            </div>
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="onemli" checked={!!form.onemli} onChange={e => set('onemli', e.target.checked)} className="w-4 h-4 accent-[#1A4D2E]" />
        <label htmlFor="onemli" className="text-sm text-gray-600">Önemli maç (öne çıkar)</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-[#1A4D2E] hover:bg-[#163d24] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Kaydet</button>
        <button type="button" onClick={onKapat} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm transition-colors">İptal</button>
      </div>
    </form>
  );
}

// ===== HABER FORMU =====
function HaberForm({ haber, onKaydet, onKapat }: { haber?: Haber; onKaydet: (d: Partial<Haber>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<Haber>>(haber || { baslik: '', slug: '', ozet: '', icerik: '', gorsel: '', kategori: 'Kulüp', tarih: new Date().toISOString().split('T')[0], yazar: 'Kulüp Basın' });
  const set = (k: keyof Haber, v: string) => setForm(f => ({ ...f, [k]: v }));
  const slugOlustur = (s: string) => s.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Başlık" required value={form.baslik || ''} onChange={e => { set('baslik', e.target.value); if (!haber) set('slug', slugOlustur(e.target.value)); }} />
      <FI label="Slug (URL)" required value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="otomatik-olusturulur" />
      <FT label="Özet" required rows={2} value={form.ozet || ''} onChange={e => set('ozet', e.target.value)} />
      <FT label="İçerik" required rows={5} value={form.icerik || ''} onChange={e => set('icerik', e.target.value)} />
      <GorselYukle label="Görsel" value={form.gorsel || ''} onChange={url => set('gorsel', url)} />
      <div className="grid grid-cols-2 gap-3">
        <FS label="Kategori" value={form.kategori || 'Kulüp'} onChange={e => set('kategori', e.target.value)}>
          {['Kulüp','Maç Haberi','Transfer','Altyapı','Etkinlik'].map(k => <option key={k}>{k}</option>)}
        </FS>
        <FI label="Tarih" type="date" value={form.tarih || ''} onChange={e => set('tarih', e.target.value)} />
      </div>
      <FI label="Yazar" value={form.yazar || ''} onChange={e => set('yazar', e.target.value)} />
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-[#1A4D2E] hover:bg-[#163d24] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Kaydet</button>
        <button type="button" onClick={onKapat} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm transition-colors">İptal</button>
      </div>
    </form>
  );
}

// ===== PUAN FORMU =====
function PuanForm({ takim, onKaydet, onKapat }: { takim?: PuanTablosu; onKaydet: (d: Partial<PuanTablosu>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<PuanTablosu>>(takim || { takim: '', o: 0, g: 0, b: 0, m: 0, ag: 0, yg: 0, av: 0, puan: 0, form: ['G','G','G','G','G'] });
  const setN = (k: keyof PuanTablosu, v: number) => setForm(f => ({ ...f, [k]: v }));
  const hesapla = (g: number, b: number, m: number, ag: number, yg: number) => ({ o: g+b+m, puan: g*3+b, av: ag-yg });
  const guncelle = (k: 'g'|'b'|'m'|'ag'|'yg', v: number) => {
    const y = { ...form, [k]: v };
    setForm(f => ({ ...f, [k]: v, ...hesapla(y.g||0, y.b||0, y.m||0, y.ag||0, y.yg||0) }));
  };
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Takım Adı" required value={form.takim || ''} onChange={e => setForm(f => ({ ...f, takim: e.target.value }))} />
      <div className="grid grid-cols-3 gap-3">
        <FI label="Galibiyet" type="number" min="0" value={form.g ?? 0} onChange={e => guncelle('g', Number(e.target.value))} />
        <FI label="Beraberlik" type="number" min="0" value={form.b ?? 0} onChange={e => guncelle('b', Number(e.target.value))} />
        <FI label="Mağlubiyet" type="number" min="0" value={form.m ?? 0} onChange={e => guncelle('m', Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FI label="Attığı Gol" type="number" min="0" value={form.ag ?? 0} onChange={e => guncelle('ag', Number(e.target.value))} />
        <FI label="Yediği Gol" type="number" min="0" value={form.yg ?? 0} onChange={e => guncelle('yg', Number(e.target.value))} />
        <FI label="Puan (manuel)" type="number" value={form.puan ?? 0} onChange={e => setN('puan', Number(e.target.value))} />
      </div>
      <div className="bg-[#f8f9fa] rounded-xl p-3 text-sm text-gray-600 grid grid-cols-3 gap-2 border border-gray-100">
        <div>Oynadığı: <span className="text-gray-900 font-bold">{form.o}</span></div>
        <div>Averaj: <span className="text-gray-900 font-bold">{(form.av||0)>0?'+':''}{form.av}</span></div>
        <div>Puan: <span className="text-[#1A4D2E] font-bold">{form.puan}</span></div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-2 font-medium">Son 5 Maç Formu</label>
        <div className="flex gap-2">
          {(form.form||['G','G','G','G','G']).map((f, i) => (
            <select key={i} value={f} onChange={e => { const y=[...(form.form||[])]; y[i]=e.target.value; setForm(p=>({...p,form:y})); }}
              className={`w-12 py-1.5 text-center text-xs font-bold rounded border ${f==='G'?'bg-green-100 text-green-700 border-green-200':f==='B'?'bg-yellow-100 text-yellow-700 border-yellow-200':'bg-red-100 text-red-600 border-red-200'}`}>
              <option value="G">G</option><option value="B">B</option><option value="M">M</option>
            </select>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-[#1A4D2E] hover:bg-[#163d24] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Kaydet</button>
        <button type="button" onClick={onKapat} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm transition-colors">İptal</button>
      </div>
    </form>
  );
}

// ===== GALERİ FORMU =====
function GaleriForm({ oge, onKaydet, onKapat }: { oge?: GaleriOge; onKaydet: (d: Partial<GaleriOge>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<GaleriOge>>(oge || { baslik: '', aciklama: '', gorsel: '', kategori: 'Maç', tarih: new Date().toISOString().split('T')[0] });
  const set = (k: keyof GaleriOge, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Başlık" required value={form.baslik || ''} onChange={e => set('baslik', e.target.value)} />
      <FT label="Açıklama" rows={2} value={form.aciklama || ''} onChange={e => set('aciklama', e.target.value)} />
      <GorselYukle label="Görsel *" value={form.gorsel || ''} onChange={url => set('gorsel', url)} />
      <div className="grid grid-cols-2 gap-3">
        <FS label="Kategori" value={form.kategori || 'Maç'} onChange={e => set('kategori', e.target.value)}>
          {['Maç','Tören','Antrenman','Etkinlik','Altyapı','Transfer','Tesis'].map(k => <option key={k}>{k}</option>)}
        </FS>
        <FI label="Tarih" type="date" value={form.tarih || ''} onChange={e => set('tarih', e.target.value)} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-[#1A4D2E] hover:bg-[#163d24] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Kaydet</button>
        <button type="button" onClick={onKapat} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm transition-colors">İptal</button>
      </div>
    </form>
  );
}

// ===== ANA DASHBOARD =====
export default function AdminDashboard() {
  const router = useRouter();
  const [aktifSekme, setAktifSekme] = useState<Sekme>('maclar');
  const [maclar, setMaclar] = useState<Mac[]>([]);
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [puanTablosu, setPuanTablosu] = useState<PuanTablosu[]>([]);
  const [galeri, setGaleri] = useState<GaleriOge[]>([]);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [loading, setLoading] = useState(true);
  const [bildirim, setBildirim] = useState('');
  const [macModal, setMacModal] = useState<{ acik: boolean; mac?: Mac }>({ acik: false });
  const [haberModal, setHaberModal] = useState<{ acik: boolean; haber?: Haber }>({ acik: false });
  const [puanModal, setPuanModal] = useState<{ acik: boolean; takim?: PuanTablosu }>({ acik: false });
  const [galeriModal, setGaleriModal] = useState<{ acik: boolean; oge?: GaleriOge }>({ acik: false });

  const fetchAll = useCallback(async () => {
    try {
      const [m, h, p, g, mes] = await Promise.all([
        fetch('/api/maclar').then(r => r.json()),
        fetch('/api/haberler').then(r => r.json()),
        fetch('/api/puan').then(r => r.json()),
        fetch('/api/galeri').then(r => r.json()),
        fetch('/api/mesajlar').then(r => r.json()),
      ]);
      setMaclar(Array.isArray(m) ? m : []);
      setHaberler(Array.isArray(h) ? h : []);
      setPuanTablosu(Array.isArray(p) ? p : []);
      setGaleri(Array.isArray(g) ? g : []);
      setMesajlar(Array.isArray(mes) ? mes : []);
    } catch { console.error('Veri yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/auth/check').then(r => { if (!r.ok) router.push('/admin'); });
    fetchAll();
  }, [fetchAll, router]);

  const goster = (msg: string) => { setBildirim(msg); setTimeout(() => setBildirim(''), 3000); };
  const cikisYap = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/admin'); };

  const macKaydet = async (data: Partial<Mac>) => {
    if (macModal.mac) {
      const yeni = maclar.map(m => m.id === macModal.mac!.id ? { ...m, ...data } : m);
      await fetch('/api/maclar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setMaclar(yeni); goster('Maç güncellendi');
    } else {
      const res = await fetch('/api/maclar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const yeni = await res.json(); setMaclar(prev => [yeni, ...prev]); goster('Maç eklendi');
    }
    setMacModal({ acik: false });
  };
  const macSil = async (id: string) => {
    if (!confirm('Bu maçı silmek istediğinizden emin misiniz?')) return;
    const yeni = maclar.filter(m => m.id !== id);
    await fetch('/api/maclar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setMaclar(yeni); goster('Maç silindi');
  };

  const haberKaydet = async (data: Partial<Haber>) => {
    if (haberModal.haber) {
      const yeni = haberler.map(h => h.id === haberModal.haber!.id ? { ...h, ...data } : h);
      await fetch('/api/haberler', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setHaberler(yeni); goster('Haber güncellendi');
    } else {
      const res = await fetch('/api/haberler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const yeni = await res.json(); setHaberler(prev => [yeni, ...prev]); goster('Haber eklendi');
    }
    setHaberModal({ acik: false });
  };
  const haberSil = async (id: string) => {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return;
    const yeni = haberler.filter(h => h.id !== id);
    await fetch('/api/haberler', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setHaberler(yeni); goster('Haber silindi');
  };

  const puanKaydet = async (data: Partial<PuanTablosu>) => {
    if (puanModal.takim) {
      const yeni = puanTablosu.map(t => t.id === puanModal.takim!.id ? { ...t, ...data } : t).sort((a,b) => b.puan-a.puan||b.av-a.av);
      await fetch('/api/puan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setPuanTablosu(yeni); goster('Takım güncellendi');
    } else {
      const yeniT: PuanTablosu = { id: Date.now().toString(), takim:'', o:0, g:0, b:0, m:0, ag:0, yg:0, av:0, puan:0, form:[], ...data } as PuanTablosu;
      const yeni = [...puanTablosu, yeniT].sort((a,b) => b.puan-a.puan||b.av-a.av);
      await fetch('/api/puan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setPuanTablosu(yeni); goster('Takım eklendi');
    }
    setPuanModal({ acik: false });
  };
  const puanSil = async (id: string) => {
    if (!confirm('Bu takımı silmek istediğinizden emin misiniz?')) return;
    const yeni = puanTablosu.filter(t => t.id !== id);
    await fetch('/api/puan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setPuanTablosu(yeni); goster('Takım silindi');
  };

  const galeriKaydet = async (data: Partial<GaleriOge>) => {
    if (galeriModal.oge) {
      const yeni = galeri.map(g => g.id === galeriModal.oge!.id ? { ...g, ...data } : g);
      await fetch('/api/galeri', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setGaleri(yeni); goster('Fotoğraf güncellendi');
    } else {
      const res = await fetch('/api/galeri', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const yeni = await res.json(); setGaleri(prev => [yeni, ...prev]); goster('Fotoğraf eklendi');
    }
    setGaleriModal({ acik: false });
  };
  const galeriSil = async (id: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return;
    const yeni = galeri.filter(g => g.id !== id);
    await fetch('/api/galeri', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setGaleri(yeni); goster('Fotoğraf silindi');
  };

  const mesajOkundu = async (id: string) => {
    const yeni = mesajlar.map(m => m.id === id ? { ...m, okundu: true } : m);
    await fetch('/api/mesajlar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setMesajlar(yeni);
  };
  const mesajSil = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    const yeni = mesajlar.filter(m => m.id !== id);
    await fetch('/api/mesajlar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setMesajlar(yeni); goster('Mesaj silindi');
  };

  const sekmeler = [
    { id: 'maclar' as Sekme, label: 'Maçlar', count: maclar.length },
    { id: 'haberler' as Sekme, label: 'Haberler', count: haberler.length },
    { id: 'puan' as Sekme, label: 'Puan Tablosu', count: puanTablosu.length },
    { id: 'galeri' as Sekme, label: 'Galeri', count: galeri.length },
    { id: 'mesajlar' as Sekme, label: 'Mesajlar', count: mesajlar.filter(m => !m.okundu).length },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Bildirim */}
      {bildirim && (
        <div className="fixed top-4 right-4 z-50 bg-[#1A4D2E] text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          ✓ {bildirim}
        </div>
      )}

      {/* Modaller */}
      {macModal.acik && <Modal baslik={macModal.mac ? 'Maç Düzenle' : 'Yeni Maç Ekle'} onKapat={() => setMacModal({ acik: false })}><MacForm mac={macModal.mac} onKaydet={macKaydet} onKapat={() => setMacModal({ acik: false })} /></Modal>}
      {haberModal.acik && <Modal baslik={haberModal.haber ? 'Haber Düzenle' : 'Yeni Haber Ekle'} onKapat={() => setHaberModal({ acik: false })}><HaberForm haber={haberModal.haber} onKaydet={haberKaydet} onKapat={() => setHaberModal({ acik: false })} /></Modal>}
      {puanModal.acik && <Modal baslik={puanModal.takim ? 'Takım Düzenle' : 'Yeni Takım Ekle'} onKapat={() => setPuanModal({ acik: false })}><PuanForm takim={puanModal.takim} onKaydet={puanKaydet} onKapat={() => setPuanModal({ acik: false })} /></Modal>}
      {galeriModal.acik && <Modal baslik={galeriModal.oge ? 'Fotoğraf Düzenle' : 'Yeni Fotoğraf Ekle'} onKapat={() => setGaleriModal({ acik: false })}><GaleriForm oge={galeriModal.oge} onKaydet={galeriKaydet} onKapat={() => setGaleriModal({ acik: false })} /></Modal>}

      {/* Header */}
      <div className="bg-[#1A4D2E] border-b border-green-900/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-white rounded-full p-0.5">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" sizes="36px" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Admin Panel</div>
              <div className="text-green-200 text-xs">1453 İstanbul AS</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/" target="_blank" className="text-green-100 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Siteyi Görüntüle</a>
            <button onClick={cikisYap} className="text-green-100 hover:text-red-200 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 transition-colors">Çıkış</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Özet Kartlar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {sekmeler.map(s => (
            <button key={s.id} onClick={() => setAktifSekme(s.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 card-shadow ${aktifSekme === s.id ? 'bg-[#1A4D2E] border-[#1A4D2E]' : 'bg-white border-gray-100 hover:border-[#1A4D2E]/30'}`}>
              <div className={`text-2xl font-black mb-1 ${aktifSekme === s.id ? 'text-[#D4AF37]' : 'text-gray-900'}`}>{s.count}</div>
              <div className={`text-xs font-medium ${aktifSekme === s.id ? 'text-green-100' : 'text-gray-500'}`}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Sekme Bar */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {sekmeler.map(s => (
            <button key={s.id} onClick={() => setAktifSekme(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${aktifSekme === s.id ? 'bg-[#1A4D2E] text-white' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'}`}>
              {s.label}
              {s.id === 'mesajlar' && mesajlar.filter(m => !m.okundu).length > 0 && (
                <span className="ml-2 bg-[#C0392B] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{mesajlar.filter(m => !m.okundu).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden">

          {/* MAÇLAR */}
          {aktifSekme === 'maclar' && (
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Maç Listesi <span className="text-gray-400 font-normal text-sm">({maclar.length})</span></h2>
                <button onClick={() => setMacModal({ acik: true })} className="bg-[#C0392B] hover:bg-[#96281B] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">+ Maç Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {maclar.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Henüz maç yok.</div> :
                  maclar.sort((a,b) => new Date(b.tarih).getTime()-new Date(a.tarih).getTime()).map(mac => (
                    <div key={mac.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 text-sm font-semibold">{mac.ev_sahibi} <span className="text-gray-400 font-normal">vs</span> {mac.misafir}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{mac.tarih} {mac.saat} · {mac.lig}</div>
                        {mac.durum === 'tamamlandi' && <div className="text-[#1A4D2E] text-xs mt-0.5 font-bold">{mac.ev_gol} - {mac.mis_gol}</div>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mac.durum==='tamamlandi'?'bg-green-100 text-green-700':mac.durum==='gelecek'?'bg-blue-100 text-blue-600':'bg-yellow-100 text-yellow-700'}`}>{mac.durum}</span>
                        <button onClick={() => setMacModal({ acik: true, mac })} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Düzenle</button>
                        <button onClick={() => macSil(mac.id)} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">Sil</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* HABERLER */}
          {aktifSekme === 'haberler' && (
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Haberler <span className="text-gray-400 font-normal text-sm">({haberler.length})</span></h2>
                <button onClick={() => setHaberModal({ acik: true })} className="bg-[#C0392B] hover:bg-[#96281B] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">+ Haber Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {haberler.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Henüz haber yok.</div> :
                  haberler.map(haber => (
                    <div key={haber.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      {haber.gorsel && <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0"><Image src={haber.gorsel} alt={haber.baslik} fill className="object-cover" sizes="80px" unoptimized /></div>}
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 text-sm font-semibold truncate">{haber.baslik}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{haber.tarih} · <span className="text-[#C0392B]">{haber.kategori}</span></div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <a href={`/haberler/${haber.slug}`} target="_blank" className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors">Görüntüle</a>
                        <button onClick={() => setHaberModal({ acik: true, haber })} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Düzenle</button>
                        <button onClick={() => haberSil(haber.id)} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">Sil</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* PUAN TABLOSU */}
          {aktifSekme === 'puan' && (
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Puan Tablosu <span className="text-gray-400 font-normal text-sm">({puanTablosu.length} takım)</span></h2>
                <button onClick={() => setPuanModal({ acik: true })} className="bg-[#C0392B] hover:bg-[#96281B] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">+ Takım Ekle</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1A4D2E] text-white">
                      <th className="text-left px-4 py-2.5 font-medium w-8">#</th>
                      <th className="text-left px-4 py-2.5 font-medium">Takım</th>
                      <th className="text-center px-2 py-2.5 font-medium">O</th>
                      <th className="text-center px-2 py-2.5 font-medium">G</th>
                      <th className="text-center px-2 py-2.5 font-medium">B</th>
                      <th className="text-center px-2 py-2.5 font-medium">M</th>
                      <th className="text-center px-2 py-2.5 font-medium">Av</th>
                      <th className="text-center px-2 py-2.5 font-bold">P</th>
                      <th className="px-4 py-2.5 text-right font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {puanTablosu.map((t, idx) => (
                      <tr key={t.id} className={`border-b border-gray-100 table-row-hover ${t.takim==='1453 İstanbul AS'?'bg-[#1A4D2E]/5 font-semibold':''}`}>
                        <td className="px-4 py-2.5 text-gray-400">{idx+1}</td>
                        <td className="px-4 py-2.5 text-gray-900">{t.takim}</td>
                        <td className="px-2 py-2.5 text-center text-gray-500">{t.o}</td>
                        <td className="px-2 py-2.5 text-center text-green-600">{t.g}</td>
                        <td className="px-2 py-2.5 text-center text-gray-500">{t.b}</td>
                        <td className="px-2 py-2.5 text-center text-red-500">{t.m}</td>
                        <td className="px-2 py-2.5 text-center text-gray-500">{t.av>0?`+${t.av}`:t.av}</td>
                        <td className="px-2 py-2.5 text-center font-bold text-[#1A4D2E]">{t.puan}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setPuanModal({ acik: true, takim: t })} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">Düzenle</button>
                            <button onClick={() => puanSil(t.id)} className="text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors">Sil</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GALERİ */}
          {aktifSekme === 'galeri' && (
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Galeri <span className="text-gray-400 font-normal text-sm">({galeri.length} fotoğraf)</span></h2>
                <button onClick={() => setGaleriModal({ acik: true })} className="bg-[#C0392B] hover:bg-[#96281B] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">+ Fotoğraf Ekle</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
                {galeri.map(foto => (
                  <div key={foto.id} className="group relative">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {foto.gorsel && <Image src={foto.gorsel} alt={foto.baslik} fill className="object-cover" sizes="200px" unoptimized />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-center gap-2 pb-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setGaleriModal({ acik: true, oge: foto })} className="text-xs px-2 py-1 bg-white/90 text-gray-800 rounded transition-colors font-medium">Düzenle</button>
                        <button onClick={() => galeriSil(foto.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded transition-colors font-medium">Sil</button>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-gray-800 truncate px-0.5">{foto.baslik}</p>
                    <p className="text-xs text-gray-400 px-0.5">{foto.kategori}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESAJLAR */}
          {aktifSekme === 'mesajlar' && (
            <div>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Mesajlar <span className="text-gray-400 font-normal text-sm">({mesajlar.filter(m=>!m.okundu).length} okunmamış)</span></h2>
              </div>
              <div className="divide-y divide-gray-100">
                {mesajlar.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Henüz mesaj yok.</div> :
                  mesajlar.map(mesaj => (
                    <div key={mesaj.id} className={`p-4 ${!mesaj.okundu?'bg-green-50/50':''} hover:bg-gray-50`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900 font-semibold text-sm">{mesaj.ad}</span>
                            {!mesaj.okundu && <span className="w-2 h-2 rounded-full bg-[#C0392B]" />}
                            <span className="text-xs text-gray-400 ml-auto">{new Date(mesaj.tarih).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="text-gray-500 text-xs mb-1">{mesaj.email}{mesaj.telefon&&` · ${mesaj.telefon}`}</div>
                          <div className="text-[#1A4D2E] text-xs font-semibold mb-2">{mesaj.konu}</div>
                          <p className="text-gray-700 text-sm">{mesaj.mesaj}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!mesaj.okundu && <button onClick={() => mesajOkundu(mesaj.id)} className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors">Okundu</button>}
                          <button onClick={() => mesajSil(mesaj.id)} className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors">Sil</button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}