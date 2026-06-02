'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import JSZip from 'jszip';
import type { Mac, Haber, PuanTablosu, GaleriOge, Mesaj } from '@/lib/types';
import type { SiteAyarlari, YonetimUye, Sponsor } from '@/lib/data';

type Sekme = 'maclar' | 'haberler' | 'puan' | 'galeri' | 'mesajlar' | 'siteayarlari' | 'yonetim' | 'sponsorlar';

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

// ===== GÖRSEL YÜKLEME =====
function GorselYukle({ value, onChange, label = 'Görsel' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const dosyaSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;
    if (dosya.size > 10 * 1024 * 1024) { setHata('Dosya 10MB\'dan büyük olamaz.'); return; }
    setHata(''); setYukleniyor(true);
    try {
      const fd = new FormData();
      fd.append('image', dosya);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) { onChange(data.url); } else { setHata(data.error || 'Yükleme başarısız.'); }
    } catch { setHata('Bağlantı hatası.'); }
    finally { setYukleniyor(false); e.target.value = ''; }
  };

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>
      <div className="space-y-2">
        <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors w-full ${yukleniyor ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-[#1A4D2E]/30 bg-[#f8f9fa] hover:border-[#1A4D2E]'}`}>
          <input type="file" accept="image/*" onChange={dosyaSec} disabled={yukleniyor} className="hidden" />
          {yukleniyor ? (
            <><div className="w-4 h-4 border-2 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" /><span className="text-xs text-gray-500">Yükleniyor...</span></>
          ) : (
            <><svg className="w-4 h-4 text-[#1A4D2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs text-[#1A4D2E] font-medium">{value ? 'Değiştir' : 'Dosya Seç'}</span>
              <span className="text-xs text-gray-400 ml-auto">JPG, PNG · maks 10MB</span></>
          )}
        </label>
        <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-gray-700 text-xs placeholder-gray-400" placeholder="veya URL yapıştır: https://..." />
        {hata && <p className="text-red-500 text-xs">{hata}</p>}
        {value && (
          <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200">
            <Image src={value} alt="Önizleme" fill className="object-cover" unoptimized />
            <button type="button" onClick={() => onChange('')} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MAÇ FORMU =====
type OlayItem = { oyuncu: string; dakika: number; takim: string };
type KartItem = { oyuncu: string; dakika: number; takim: string; tur: 'sari' | 'kirmizi' };

function OlayListesi({ baslik, liste, takimlar, onChange }: { baslik: string; liste: OlayItem[]; takimlar: [string, string]; onChange: (l: OlayItem[]) => void }) {
  const ekle = () => onChange([...liste, { oyuncu: '', dakika: 1, takim: takimlar[0] }]);
  const sil = (i: number) => onChange(liste.filter((_, idx) => idx !== i));
  const guncelle = (i: number, k: keyof OlayItem, v: string | number) => { const y = [...liste]; y[i] = { ...y[i], [k]: v }; onChange(y); };
  return (
    <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">{baslik}</span>
        <button type="button" onClick={ekle} className="text-xs px-2 py-1 bg-[#1A4D2E] text-white rounded-lg">+ Ekle</button>
      </div>
      {liste.map((o, i) => (
        <div key={i} className="grid grid-cols-12 gap-1.5 mb-2 items-center">
          <div className="col-span-1"><input type="number" min="1" max="120" value={o.dakika} onChange={e => guncelle(i, 'dakika', Number(e.target.value))} className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-center text-gray-900" placeholder="dk" /></div>
          <div className="col-span-5"><input value={o.oyuncu} onChange={e => guncelle(i, 'oyuncu', e.target.value)} className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900" placeholder="Oyuncu adı" /></div>
          <div className="col-span-5"><select value={o.takim} onChange={e => guncelle(i, 'takim', e.target.value)} className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-gray-900"><option value={takimlar[0]}>{takimlar[0].split(' ').slice(0,2).join(' ')}</option><option value={takimlar[1]}>{takimlar[1].split(' ').slice(0,2).join(' ')}</option></select></div>
          <div className="col-span-1"><button type="button" onClick={() => sil(i)} className="w-full text-red-400 hover:text-red-600 text-sm font-bold">×</button></div>
        </div>
      ))}
      {liste.length === 0 && <p className="text-xs text-gray-400 text-center py-1">Kayıt yok</p>}
    </div>
  );
}

function KartListesi({ liste, takimlar, onChange }: { liste: KartItem[]; takimlar: [string, string]; onChange: (l: KartItem[]) => void }) {
  const ekle = () => onChange([...liste, { oyuncu: '', dakika: 1, takim: takimlar[0], tur: 'sari' }]);
  const sil = (i: number) => onChange(liste.filter((_, idx) => idx !== i));
  const guncelle = (i: number, k: keyof KartItem, v: string | number) => { const y = [...liste]; y[i] = { ...y[i], [k]: v }; onChange(y); };
  return (
    <div className="bg-[#f8f9fa] rounded-xl p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">🟨🟥 Kartlar</span>
        <button type="button" onClick={ekle} className="text-xs px-2 py-1 bg-[#1A4D2E] text-white rounded-lg">+ Ekle</button>
      </div>
      {liste.map((k, i) => (
        <div key={i} className="grid grid-cols-12 gap-1.5 mb-2 items-center">
          <div className="col-span-1"><input type="number" min="1" max="120" value={k.dakika} onChange={e => guncelle(i, 'dakika', Number(e.target.value))} className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-center text-gray-900" placeholder="dk" /></div>
          <div className="col-span-4"><input value={k.oyuncu} onChange={e => guncelle(i, 'oyuncu', e.target.value)} className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900" placeholder="Oyuncu adı" /></div>
          <div className="col-span-3"><select value={k.takim} onChange={e => guncelle(i, 'takim', e.target.value)} className="w-full bg-white border border-gray-200 rounded px-1.5 py-1.5 text-xs text-gray-900"><option value={takimlar[0]}>{takimlar[0].split(' ').slice(0,2).join(' ')}</option><option value={takimlar[1]}>{takimlar[1].split(' ').slice(0,2).join(' ')}</option></select></div>
          <div className="col-span-3"><select value={k.tur} onChange={e => guncelle(i, 'tur', e.target.value)} className={`w-full border rounded px-1.5 py-1.5 text-xs font-bold ${k.tur === 'sari' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-red-100 text-red-700 border-red-300'}`}><option value="sari">Sarı</option><option value="kirmizi">Kırmızı</option></select></div>
          <div className="col-span-1"><button type="button" onClick={() => sil(i)} className="w-full text-red-400 hover:text-red-600 text-sm font-bold">×</button></div>
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
          <OlayListesi baslik="⚽ Goller" liste={form.goller || []} takimlar={takimlar} onChange={v => set('goller', v)} />
          <OlayListesi baslik="🎯 Asistler" liste={form.asistler || []} takimlar={takimlar} onChange={v => set('asistler', v)} />
          <KartListesi liste={form.kartlar || []} takimlar={takimlar} onChange={v => set('kartlar', v)} />
        </>
      )}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="onemli" checked={!!form.onemli} onChange={e => set('onemli', e.target.checked)} className="w-4 h-4 accent-[#C0392B]" />
        <label htmlFor="onemli" className="text-sm text-gray-700">Önemli maç (anasayfada öne çıkar)</label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onKapat} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">İptal</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#96281B] transition-colors">Kaydet</button>
      </div>
    </form>
  );
}

// ===== HABER FORMU =====
function HaberForm({ haber, onKaydet, onKapat }: { haber?: Haber; onKaydet: (d: Partial<Haber>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<Haber>>(haber || { baslik: '', icerik: '', ozet: '', gorsel: '', kategori: 'Kulüp', tarih: new Date().toISOString().split('T')[0], slug: '' });
  const set = (k: keyof Haber, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Başlık" required value={form.baslik || ''} onChange={e => set('baslik', e.target.value)} placeholder="Haber başlığı" />
      <FI label="Slug (URL)" value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="haber-basligi (boş bırakırsan otomatik)" />
      <div className="grid grid-cols-2 gap-3">
        <FI label="Tarih" required type="date" value={form.tarih || ''} onChange={e => set('tarih', e.target.value)} />
        <FS label="Kategori" value={form.kategori || 'Kulüp'} onChange={e => set('kategori', e.target.value)}>
          {['Kulüp', 'Maç', 'Transfer', 'Altyapı', 'Duyuru'].map(k => <option key={k}>{k}</option>)}
        </FS>
      </div>
      <GorselYukle label="Kapak Görseli" value={form.gorsel || ''} onChange={v => setForm(f => ({ ...f, gorsel: v }))} />
      <FT label="Özet" rows={2} value={form.ozet || ''} onChange={e => set('ozet', e.target.value)} placeholder="Kısa özet (liste görünümünde gösterilir)" />
      <FT label="İçerik" required rows={8} value={form.icerik || ''} onChange={e => set('icerik', e.target.value)} placeholder="Haber içeriği..." />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onKapat} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">İptal</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#96281B] transition-colors">Kaydet</button>
      </div>
    </form>
  );
}

// ===== PUAN FORMU =====
function PuanForm({ takim, onKaydet, onKapat }: { takim?: PuanTablosu; onKaydet: (d: Partial<PuanTablosu>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<PuanTablosu>>(takim || { takim: '', o: 0, g: 0, b: 0, m: 0, ag: 0, yg: 0, av: 0, puan: 0 });
  const set = (k: keyof PuanTablosu, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Takım Adı" required value={form.takim || ''} onChange={e => set('takim', e.target.value)} placeholder="Takım adı" />
      <div className="grid grid-cols-3 gap-3">
        {(['o', 'g', 'b', 'm', 'ag', 'yg', 'av', 'puan'] as const).map(k => (
          <FI key={k} label={k.toUpperCase()} type="number" value={form[k] ?? 0} onChange={e => set(k, Number(e.target.value))} />
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onKapat} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">İptal</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#96281B] transition-colors">Kaydet</button>
      </div>
    </form>
  );
}

// ===== GALERİ FORMU =====
function GaleriForm({ oge, onKaydet, onKapat }: { oge?: GaleriOge; onKaydet: (d: Partial<GaleriOge>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<GaleriOge>>(oge || { baslik: '', gorsel: '', kategori: 'Maç', tarih: new Date().toISOString().split('T')[0] });
  const set = (k: keyof GaleriOge, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Başlık" required value={form.baslik || ''} onChange={e => set('baslik', e.target.value)} placeholder="Fotoğraf başlığı" />
      <div className="grid grid-cols-2 gap-3">
        <FS label="Kategori" value={form.kategori || 'Maç'} onChange={e => set('kategori', e.target.value)}>
          {['Maç', 'Antrenman', 'Tesis', 'Etkinlik', 'Diğer'].map(k => <option key={k}>{k}</option>)}
        </FS>
        <FI label="Tarih" type="date" value={form.tarih || ''} onChange={e => set('tarih', e.target.value)} />
      </div>
      <GorselYukle label="Fotoğraf" value={form.gorsel || ''} onChange={v => setForm(f => ({ ...f, gorsel: v }))} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onKapat} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">İptal</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#96281B] transition-colors">Kaydet</button>
      </div>
    </form>
  );
}

// ===== YÖNETİM ÜYE FORMU =====
function YonetimForm({ uye, onKaydet, onKapat }: { uye?: YonetimUye; onKaydet: (d: Partial<YonetimUye>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<YonetimUye>>(uye || { isim: '', gorev: '', gorsel: '' });
  const set = (k: keyof YonetimUye, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="İsim Soyisim" required value={form.isim || ''} onChange={e => set('isim', e.target.value)} placeholder="Ad Soyad" />
      <FI label="Görev" required value={form.gorev || ''} onChange={e => set('gorev', e.target.value)} placeholder="Başkan, Genel Sekreter..." />
      <GorselYukle label="Fotoğraf (isteğe bağlı)" value={form.gorsel || ''} onChange={v => setForm(f => ({ ...f, gorsel: v }))} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onKapat} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">İptal</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#96281B] transition-colors">Kaydet</button>
      </div>
    </form>
  );
}

// ===== SPONSOR FORMU =====
function SponsorForm({ sponsor, onKaydet, onKapat }: { sponsor?: Sponsor; onKaydet: (d: Partial<Sponsor>) => void; onKapat: () => void }) {
  const [form, setForm] = useState<Partial<Sponsor>>(sponsor || { isim: '', logo: '', web: '', kategori: 'Ana Sponsor' });
  const set = (k: keyof Sponsor, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onKaydet(form); }} className="space-y-4">
      <FI label="Sponsor Adı" required value={form.isim || ''} onChange={e => set('isim', e.target.value)} placeholder="Şirket adı" />
      <FS label="Kategori" value={form.kategori || 'Ana Sponsor'} onChange={e => set('kategori', e.target.value)}>
        {['Ana Sponsor', 'Forma Sponsoru', 'Alt Sponsor', 'Teknik Sponsor', 'Medya Sponsoru'].map(k => <option key={k}>{k}</option>)}
      </FS>
      <FI label="Web Sitesi" value={form.web || ''} onChange={e => set('web', e.target.value)} placeholder="https://example.com" />
      <GorselYukle label="Logo" value={form.logo || ''} onChange={v => setForm(f => ({ ...f, logo: v }))} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onKapat} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">İptal</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#96281B] transition-colors">Kaydet</button>
      </div>
    </form>
  );
}

// ===== BÖLÜM BAŞLIĞI =====
function BolumBaslik({ title }: { title: string }) {
  return <div className="text-xs font-bold text-[#1A4D2E] uppercase tracking-wider bg-green-50 px-3 py-2 rounded-lg mb-3 mt-4 first:mt-0">{title}</div>;
}

// ===== ANA COMPONENT =====
export default function AdminDashboard() {
  const router = useRouter();
  const [aktifSekme, setAktifSekme] = useState<Sekme>('maclar');
  const [loading, setLoading] = useState(true);
  const [bildirim, setBildirim] = useState('');

  // Mevcut data states
  const [maclar, setMaclar] = useState<Mac[]>([]);
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [puanTablosu, setPuanTablosu] = useState<PuanTablosu[]>([]);
  const [galeri, setGaleri] = useState<GaleriOge[]>([]);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);

  // Yeni data states
  const [siteAyarlari, setSiteAyarlari] = useState<SiteAyarlari | null>(null);
  const [yonetim, setYonetim] = useState<YonetimUye[]>([]);
  const [sponsorlar, setSponsorlar] = useState<Sponsor[]>([]);

  // Modal states
  const [macModal, setMacModal] = useState<{ acik: boolean; mac?: Mac }>({ acik: false });
  const [haberModal, setHaberModal] = useState<{ acik: boolean; haber?: Haber }>({ acik: false });
  const [puanModal, setPuanModal] = useState<{ acik: boolean; takim?: PuanTablosu }>({ acik: false });
  const [galeriModal, setGaleriModal] = useState<{ acik: boolean; oge?: GaleriOge }>({ acik: false });
  const [yonetimModal, setYonetimModal] = useState<{ acik: boolean; uye?: YonetimUye }>({ acik: false });
  const [sponsorModal, setSponsorModal] = useState<{ acik: boolean; sponsor?: Sponsor }>({ acik: false });

  const goster = (mesaj: string) => { setBildirim(mesaj); setTimeout(() => setBildirim(''), 3000); };

  const veriYukle = useCallback(async () => {
    try {
      const [authRes] = await Promise.all([fetch('/api/auth/check')]);
      if (!authRes.ok) { router.push('/admin'); return; }

      const [macRes, haberRes, puanRes, galeriRes, mesajRes, ayarRes, yonetimRes, sponsorRes] = await Promise.all([
        fetch('/api/maclar'), fetch('/api/haberler'), fetch('/api/puan'),
        fetch('/api/galeri'), fetch('/api/mesajlar'),
        fetch('/api/site-ayarlari'), fetch('/api/yonetim'), fetch('/api/sponsorlar'),
      ]);

      setMaclar(await macRes.json());
      setHaberler(await haberRes.json());
      setPuanTablosu(await puanRes.json());
      setGaleri(await galeriRes.json());
      setMesajlar(await mesajRes.json());
      setSiteAyarlari(await ayarRes.json());
      setYonetim(await yonetimRes.json());
      setSponsorlar(await sponsorRes.json());
    } catch { router.push('/admin'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { veriYukle(); }, [veriYukle]);

  const cikisYap = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  };

  const zipVeIndir = async () => {
    goster('Veriler hazırlanıyor...');
    try {
      const res = await fetch('/api/export');
      if (!res.ok) { goster('Export başarısız.'); return; }
      const data = await res.json();
      const { exportedAt, ...dosyalar } = data;
      const zip = new JSZip();
      for (const [isim, icerik] of Object.entries(dosyalar)) {
        zip.file(`${isim}.json`, JSON.stringify(icerik, null, 2));
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const tarih = new Date(exportedAt).toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `1453istanbul-backup-${tarih}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
      goster('ZIP indirildi ✓');
    } catch { goster('Hata oluştu.'); }
  };

  // ===== MAÇ CRUD =====
  const macKaydet = async (data: Partial<Mac>) => {
    if (macModal.mac) {
      const yeni = maclar.map(m => m.id === macModal.mac!.id ? { ...m, ...data } : m);
      await fetch('/api/maclar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setMaclar(yeni); goster('Maç güncellendi');
    } else {
      const res = await fetch('/api/maclar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: Date.now().toString() }) });
      const yeni = await res.json();
      setMaclar(p => [yeni, ...p]); goster('Maç eklendi');
    }
    setMacModal({ acik: false });
  };

  const macSil = async (id: string) => {
    if (!confirm('Bu maçı silmek istediğinizden emin misiniz?')) return;
    const yeni = maclar.filter(m => m.id !== id);
    await fetch('/api/maclar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setMaclar(yeni); goster('Maç silindi');
  };

  // ===== HABER CRUD =====
  const haberKaydet = async (data: Partial<Haber>) => {
    if (haberModal.haber) {
      const yeni = haberler.map(h => h.id === haberModal.haber!.id ? { ...h, ...data } : h);
      await fetch('/api/haberler', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setHaberler(yeni); goster('Haber güncellendi');
    } else {
      const res = await fetch('/api/haberler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const yeni = await res.json();
      setHaberler(p => [yeni, ...p]); goster('Haber eklendi');
    }
    setHaberModal({ acik: false });
  };

  const haberSil = async (id: string) => {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return;
    await fetch('/api/haberler', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setHaberler(p => p.filter(h => h.id !== id)); goster('Haber silindi');
  };

  // ===== PUAN CRUD =====
  const puanKaydet = async (data: Partial<PuanTablosu>) => {
    if (puanModal.takim) {
      const yeni = puanTablosu.map(t => t.id === puanModal.takim!.id ? { ...t, ...data } : t);
      await fetch('/api/puan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setPuanTablosu(yeni); goster('Takım güncellendi');
    } else {
      const yeniTakim = { ...data, id: Date.now().toString() } as PuanTablosu;
      const yeni = [...puanTablosu, yeniTakim].sort((a, b) => b.puan - a.puan);
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

  // ===== GALERİ CRUD =====
  const galeriKaydet = async (data: Partial<GaleriOge>) => {
    if (galeriModal.oge) {
      const yeni = galeri.map(g => g.id === galeriModal.oge!.id ? { ...g, ...data } : g);
      await fetch('/api/galeri', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setGaleri(yeni); goster('Fotoğraf güncellendi');
    } else {
      const yeniOge = { ...data, id: Date.now().toString() } as GaleriOge;
      const yeni = [yeniOge, ...galeri];
      await fetch('/api/galeri', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setGaleri(yeni); goster('Fotoğraf eklendi');
    }
    setGaleriModal({ acik: false });
  };

  const galeriSil = async (id: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return;
    const yeni = galeri.filter(g => g.id !== id);
    await fetch('/api/galeri', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
    setGaleri(yeni); goster('Fotoğraf silindi');
  };

  // ===== MESAJ İŞLEMLERİ =====
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

  // ===== SİTE AYARLARI KAYDET =====
  const siteAyarlariKaydet = async () => {
    if (!siteAyarlari) return;
    await fetch('/api/site-ayarlari', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteAyarlari) });
    goster('Site ayarları kaydedildi');
  };

  const ayarSet = (path: string, value: string) => {
    if (!siteAyarlari) return;
    const keys = path.split('.');
    setSiteAyarlari(prev => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // ===== YÖNETİM CRUD =====
  const yonetimKaydet = async (data: Partial<YonetimUye>) => {
    if (yonetimModal.uye) {
      const yeni = yonetim.map(u => u.id === yonetimModal.uye!.id ? { ...u, ...data } : u);
      await fetch('/api/yonetim', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setYonetim(yeni); goster('Üye güncellendi');
    } else {
      const res = await fetch('/api/yonetim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const yeniUye = await res.json();
      setYonetim(p => [...p, yeniUye]); goster('Üye eklendi');
    }
    setYonetimModal({ acik: false });
  };

  const yonetimSil = async (id: string) => {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) return;
    await fetch('/api/yonetim', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setYonetim(p => p.filter(u => u.id !== id)); goster('Üye silindi');
  };

  // ===== SPONSOR CRUD =====
  const sponsorKaydet = async (data: Partial<Sponsor>) => {
    if (sponsorModal.sponsor) {
      const yeni = sponsorlar.map(s => s.id === sponsorModal.sponsor!.id ? { ...s, ...data } : s);
      await fetch('/api/sponsorlar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yeni) });
      setSponsorlar(yeni); goster('Sponsor güncellendi');
    } else {
      const res = await fetch('/api/sponsorlar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const yeniSponsor = await res.json();
      setSponsorlar(p => [...p, yeniSponsor]); goster('Sponsor eklendi');
    }
    setSponsorModal({ acik: false });
  };

  const sponsorSil = async (id: string) => {
    if (!confirm('Bu sponsoru silmek istediğinizden emin misiniz?')) return;
    await fetch('/api/sponsorlar', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setSponsorlar(p => p.filter(s => s.id !== id)); goster('Sponsor silindi');
  };

  const sekmeler = [
    { id: 'maclar' as Sekme, label: 'Maçlar', count: maclar.length, emoji: '⚽' },
    { id: 'haberler' as Sekme, label: 'Haberler', count: haberler.length, emoji: '📰' },
    { id: 'puan' as Sekme, label: 'Puan Tablosu', count: puanTablosu.length, emoji: '🏆' },
    { id: 'galeri' as Sekme, label: 'Galeri', count: galeri.length, emoji: '📸' },
    { id: 'mesajlar' as Sekme, label: 'Mesajlar', count: mesajlar.filter(m => !m.okundu).length, emoji: '✉️' },
    { id: 'siteayarlari' as Sekme, label: 'Site Ayarları', count: null, emoji: '⚙️' },
    { id: 'yonetim' as Sekme, label: 'Yönetim Kurulu', count: yonetim.length, emoji: '👥' },
    { id: 'sponsorlar' as Sekme, label: 'Sponsorlar', count: sponsorlar.length, emoji: '🤝' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
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
      {yonetimModal.acik && <Modal baslik={yonetimModal.uye ? 'Üye Düzenle' : 'Yeni Üye Ekle'} onKapat={() => setYonetimModal({ acik: false })}><YonetimForm uye={yonetimModal.uye} onKaydet={yonetimKaydet} onKapat={() => setYonetimModal({ acik: false })} /></Modal>}
      {sponsorModal.acik && <Modal baslik={sponsorModal.sponsor ? 'Sponsor Düzenle' : 'Yeni Sponsor Ekle'} onKapat={() => setSponsorModal({ acik: false })}><SponsorForm sponsor={sponsorModal.sponsor} onKaydet={sponsorKaydet} onKapat={() => setSponsorModal({ acik: false })} /></Modal>}

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
            <button onClick={zipVeIndir} className="text-yellow-200 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Tüm verileri ZIP olarak indir">📦 Yedekle</button>
            <a href="/" target="_blank" className="text-green-100 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Siteyi Görüntüle</a>
            <button onClick={cikisYap} className="text-green-100 hover:text-red-200 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 transition-colors">Çıkış</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Özet Kartlar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {sekmeler.slice(0, 4).map(s => (
            <button key={s.id} onClick={() => setAktifSekme(s.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 card-shadow ${aktifSekme === s.id ? 'bg-[#1A4D2E] border-[#1A4D2E]' : 'bg-white border-gray-100 hover:border-[#1A4D2E]/30'}`}>
              <div className={`text-2xl font-black mb-1 ${aktifSekme === s.id ? 'text-[#D4AF37]' : 'text-gray-900'}`}>{s.count}</div>
              <div className={`text-xs font-medium ${aktifSekme === s.id ? 'text-green-100' : 'text-gray-500'}`}>{s.emoji} {s.label}</div>
            </button>
          ))}
        </div>

        {/* Sekme Bar */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 flex-wrap">
          {sekmeler.map(s => (
            <button key={s.id} onClick={() => setAktifSekme(s.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${aktifSekme === s.id ? 'bg-[#1A4D2E] text-white' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'}`}>
              {s.emoji} {s.label}
              {s.id === 'mesajlar' && mesajlar.filter(m => !m.okundu).length > 0 && (
                <span className="ml-2 bg-[#C0392B] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{mesajlar.filter(m => !m.okundu).length}</span>
              )}
              {s.count !== null && s.id !== 'mesajlar' && <span className="ml-2 text-xs opacity-60">({s.count})</span>}
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
                  maclar.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()).map(mac => (
                    <div key={mac.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 text-sm font-semibold">{mac.ev_sahibi} <span className="text-gray-400 font-normal">vs</span> {mac.misafir}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{mac.tarih} {mac.saat} · {mac.lig}</div>
                        {mac.durum === 'tamamlandi' && <div className="text-[#1A4D2E] text-xs mt-0.5 font-bold">{mac.ev_gol} - {mac.mis_gol}</div>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mac.durum === 'tamamlandi' ? 'bg-green-100 text-green-700' : mac.durum === 'gelecek' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700'}`}>{mac.durum}</span>
                        <button onClick={() => setMacModal({ acik: true, mac })} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Düzenle</button>
                        <button onClick={() => macSil(mac.id)} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">Sil</button>
                      </div>
                    </div>
                  ))}
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
                  ))}
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
                      <tr key={t.id} className={`border-b border-gray-100 ${t.takim === '1453 İstanbul AS' ? 'bg-[#1A4D2E]/5 font-semibold' : ''}`}>
                        <td className="px-4 py-2.5 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-gray-900">{t.takim}</td>
                        <td className="px-2 py-2.5 text-center text-gray-500">{t.o}</td>
                        <td className="px-2 py-2.5 text-center text-green-600">{t.g}</td>
                        <td className="px-2 py-2.5 text-center text-gray-500">{t.b}</td>
                        <td className="px-2 py-2.5 text-center text-red-500">{t.m}</td>
                        <td className="px-2 py-2.5 text-center text-gray-500">{t.av > 0 ? `+${t.av}` : t.av}</td>
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
                    <p className="mt-1.5 text-xs font-medium text-gray-800 truncate">{foto.baslik}</p>
                    <p className="text-xs text-gray-400">{foto.kategori}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESAJLAR */}
          {aktifSekme === 'mesajlar' && (
            <div>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Mesajlar <span className="text-gray-400 font-normal text-sm">({mesajlar.filter(m => !m.okundu).length} okunmamış)</span></h2>
              </div>
              <div className="divide-y divide-gray-100">
                {mesajlar.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Henüz mesaj yok.</div> :
                  mesajlar.map(mesaj => (
                    <div key={mesaj.id} className={`p-4 ${!mesaj.okundu ? 'bg-green-50/50' : ''} hover:bg-gray-50`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900 font-semibold text-sm">{mesaj.ad}</span>
                            {!mesaj.okundu && <span className="w-2 h-2 rounded-full bg-[#C0392B]" />}
                            <span className="text-xs text-gray-400 ml-auto">{new Date(mesaj.tarih).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="text-gray-500 text-xs mb-1">{mesaj.email}{mesaj.telefon && ` · ${mesaj.telefon}`}</div>
                          <div className="text-[#1A4D2E] text-xs font-semibold mb-2">{mesaj.konu}</div>
                          <p className="text-gray-700 text-sm">{mesaj.mesaj}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!mesaj.okundu && <button onClick={() => mesajOkundu(mesaj.id)} className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors">Okundu</button>}
                          <button onClick={() => mesajSil(mesaj.id)} className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors">Sil</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SİTE AYARLARI */}
          {aktifSekme === 'siteayarlari' && siteAyarlari && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">⚙️ Site Ayarları</h2>
                <button onClick={siteAyarlariKaydet} className="bg-[#1A4D2E] hover:bg-[#163d24] text-white text-sm px-5 py-2 rounded-lg font-semibold transition-colors">💾 Kaydet</button>
              </div>

              <div className="space-y-6">
                {/* İletişim */}
                <div>
                  <BolumBaslik title="İletişim Bilgileri" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FI label="Adres" value={siteAyarlari.iletisim.adres} onChange={e => ayarSet('iletisim.adres', e.target.value)} placeholder="Tam adres" />
                    <FI label="E-posta" value={siteAyarlari.iletisim.email} onChange={e => ayarSet('iletisim.email', e.target.value)} placeholder="info@example.com" />
                    <FI label="Telefon" value={siteAyarlari.iletisim.telefon} onChange={e => ayarSet('iletisim.telefon', e.target.value)} placeholder="0541 439 1453" />
                    <FI label="Harita Linki" value={siteAyarlari.iletisim.harita_link} onChange={e => ayarSet('iletisim.harita_link', e.target.value)} placeholder="https://maps.google.com/..." />
                  </div>
                </div>

                {/* Çalışma Saatleri */}
                <div>
                  <BolumBaslik title="Çalışma Saatleri" />
                  <div className="space-y-2">
                    {siteAyarlari.calisma_saatleri.map((s, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input value={s.gun} onChange={e => {
                          const yeni = [...siteAyarlari.calisma_saatleri];
                          yeni[i] = { ...yeni[i], gun: e.target.value };
                          setSiteAyarlari(prev => prev ? { ...prev, calisma_saatleri: yeni } : prev);
                        }} className="flex-1 bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Gün" />
                        <input value={s.saat} onChange={e => {
                          const yeni = [...siteAyarlari.calisma_saatleri];
                          yeni[i] = { ...yeni[i], saat: e.target.value };
                          setSiteAyarlari(prev => prev ? { ...prev, calisma_saatleri: yeni } : prev);
                        }} className="flex-1 bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Saat" />
                        <button type="button" onClick={() => {
                          const yeni = siteAyarlari.calisma_saatleri.filter((_, idx) => idx !== i);
                          setSiteAyarlari(prev => prev ? { ...prev, calisma_saatleri: yeni } : prev);
                        }} className="text-red-400 hover:text-red-600 text-lg font-bold px-2">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setSiteAyarlari(prev => prev ? { ...prev, calisma_saatleri: [...prev.calisma_saatleri, { gun: '', saat: '' }] } : prev)}
                      className="text-xs px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-[#1A4D2E] hover:text-[#1A4D2E] transition-colors">
                      + Saat Ekle
                    </button>
                  </div>
                </div>

                {/* Sosyal Medya */}
                <div>
                  <BolumBaslik title="Sosyal Medya" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FI label="Instagram" value={siteAyarlari.sosyal_medya.instagram} onChange={e => ayarSet('sosyal_medya.instagram', e.target.value)} placeholder="https://instagram.com/..." />
                    <FI label="Twitter / X" value={siteAyarlari.sosyal_medya.twitter} onChange={e => ayarSet('sosyal_medya.twitter', e.target.value)} placeholder="https://twitter.com/..." />
                    <FI label="Facebook" value={siteAyarlari.sosyal_medya.facebook} onChange={e => ayarSet('sosyal_medya.facebook', e.target.value)} placeholder="https://facebook.com/..." />
                    <FI label="YouTube" value={siteAyarlari.sosyal_medya.youtube} onChange={e => ayarSet('sosyal_medya.youtube', e.target.value)} placeholder="https://youtube.com/..." />
                  </div>
                </div>

                {/* Hero Bölümü */}
                <div>
                  <BolumBaslik title="Anasayfa Hero Bölümü" />
                  <div className="space-y-3">
                    <FI label="Sezon Etiketi" value={siteAyarlari.hero.sezon || ''} onChange={e => ayarSet('hero.sezon', e.target.value)} placeholder="2025 — 2026 Sezonu" />
                    <FI label="Ana Başlık" value={siteAyarlari.hero.baslik} onChange={e => ayarSet('hero.baslik', e.target.value)} placeholder="1453 İSTANBUL AS" />
                    <FI label="Alt Yazı" value={siteAyarlari.hero.altyazi} onChange={e => ayarSet('hero.altyazi', e.target.value)} placeholder="İstanbul'un Kalbi Biziz" />
                    <FI label="Açıklama" value={siteAyarlari.hero.aciklama} onChange={e => ayarSet('hero.aciklama', e.target.value)} placeholder="Kısa slogan" />
                  </div>
                </div>

                {/* Footer */}
                <div>
                  <BolumBaslik title="Footer" />
                  <FT label="Footer Açıklaması" rows={3} value={siteAyarlari.footer_aciklama} onChange={e => setSiteAyarlari(prev => prev ? { ...prev, footer_aciklama: e.target.value } : prev)} placeholder="Kulüp hakkında kısa açıklama" />
                </div>

                {/* Vizyon & Misyon */}
                <div>
                  <BolumBaslik title="Vizyon & Misyon (Kulüp Sayfası)" />
                  <div className="space-y-3">
                    <FT label="Vizyon" rows={3} value={siteAyarlari.vizyon} onChange={e => setSiteAyarlari(prev => prev ? { ...prev, vizyon: e.target.value } : prev)} placeholder="Vizyonunuzu yazın..." />
                    <FT label="Misyon" rows={3} value={siteAyarlari.misyon} onChange={e => setSiteAyarlari(prev => prev ? { ...prev, misyon: e.target.value } : prev)} placeholder="Misyonunuzu yazın..." />
                  </div>
                </div>

                {/* Başkan Mesajı */}
                <div>
                  <BolumBaslik title="Başkan Mesajı" />
                  <div className="space-y-3">
                    <GorselYukle label="Başkan Fotoğrafı" value={siteAyarlari.baskan_gorsel} onChange={v => setSiteAyarlari(prev => prev ? { ...prev, baskan_gorsel: v } : prev)} />
                    <FT label="Mesaj" rows={4} value={siteAyarlari.baskan_mesaj} onChange={e => setSiteAyarlari(prev => prev ? { ...prev, baskan_mesaj: e.target.value } : prev)} placeholder="Başkanın mesajı..." />
                  </div>
                </div>

                {/* Tarihçe */}
                <div>
                  <BolumBaslik title="Kulüp Tarihçesi" />
                  <div className="space-y-3">
                    {siteAyarlari.tarihce.map((madde, i) => (
                      <div key={i} className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-200">
                        <div className="flex gap-2 mb-2">
                          <input value={madde.yil} onChange={e => {
                            const yeni = [...siteAyarlari.tarihce];
                            yeni[i] = { ...yeni[i], yil: e.target.value };
                            setSiteAyarlari(prev => prev ? { ...prev, tarihce: yeni } : prev);
                          }} className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-[#C0392B]" placeholder="Yıl" />
                          <input value={madde.baslik} onChange={e => {
                            const yeni = [...siteAyarlari.tarihce];
                            yeni[i] = { ...yeni[i], baslik: e.target.value };
                            setSiteAyarlari(prev => prev ? { ...prev, tarihce: yeni } : prev);
                          }} className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="Başlık" />
                          <button type="button" onClick={() => {
                            const yeni = siteAyarlari.tarihce.filter((_, idx) => idx !== i);
                            setSiteAyarlari(prev => prev ? { ...prev, tarihce: yeni } : prev);
                          }} className="text-red-400 hover:text-red-600 font-bold text-lg px-2">×</button>
                        </div>
                        <textarea value={madde.icerik} onChange={e => {
                          const yeni = [...siteAyarlari.tarihce];
                          yeni[i] = { ...yeni[i], icerik: e.target.value };
                          setSiteAyarlari(prev => prev ? { ...prev, tarihce: yeni } : prev);
                        }} rows={2} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm resize-none" placeholder="Açıklama" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setSiteAyarlari(prev => prev ? { ...prev, tarihce: [...prev.tarihce, { yil: '', baslik: '', icerik: '' }] } : prev)}
                      className="text-xs px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-[#1A4D2E] hover:text-[#1A4D2E] transition-colors">
                      + Dönem Ekle
                    </button>
                  </div>
                </div>

                {/* Kaydet butonu alt */}
                <div className="pt-2 flex justify-end">
                  <button onClick={siteAyarlariKaydet} className="bg-[#1A4D2E] hover:bg-[#163d24] text-white text-sm px-6 py-2.5 rounded-lg font-semibold transition-colors">💾 Tüm Ayarları Kaydet</button>
                </div>
              </div>
            </div>
          )}

          {/* YÖNETİM KURULU */}
          {aktifSekme === 'yonetim' && (
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">👥 Yönetim Kurulu <span className="text-gray-400 font-normal text-sm">({yonetim.length} üye)</span></h2>
                <button onClick={() => setYonetimModal({ acik: true })} className="bg-[#C0392B] hover:bg-[#96281B] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">+ Üye Ekle</button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {yonetim.map((uye) => (
                    <div key={uye.id} className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow">
                        {uye.gorsel ? (
                          <Image src={uye.gorsel} alt={uye.isim} fill className="object-cover" sizes="56px" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-[#1A4D2E]/10 flex items-center justify-center">
                            <span className="text-xl font-bold text-[#1A4D2E]">{uye.isim.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{uye.isim}</div>
                        <div className="text-xs text-[#1A4D2E] font-medium">{uye.gorev}</div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setYonetimModal({ acik: true, uye })} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors">Düzenle</button>
                          <button onClick={() => yonetimSil(uye.id)} className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors">Sil</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {yonetim.length === 0 && <div className="text-center text-gray-400 text-sm py-8">Henüz üye yok.</div>}
              </div>
            </div>
          )}

          {/* SPONSORLAR */}
          {aktifSekme === 'sponsorlar' && (
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">🤝 Sponsorlar <span className="text-gray-400 font-normal text-sm">({sponsorlar.length})</span></h2>
                <button onClick={() => setSponsorModal({ acik: true })} className="bg-[#C0392B] hover:bg-[#96281B] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">+ Sponsor Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {sponsorlar.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Henüz sponsor yok.</div> :
                  sponsorlar.map(sponsor => (
                    <div key={sponsor.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      {sponsor.logo && (
                        <div className="relative w-24 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white">
                          <Image src={sponsor.logo} alt={sponsor.isim} fill className="object-contain p-1" sizes="96px" unoptimized />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{sponsor.isim}</div>
                        <div className="text-xs text-[#C0392B] font-medium">{sponsor.kategori}</div>
                        {sponsor.web && <div className="text-xs text-gray-400 truncate">{sponsor.web}</div>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setSponsorModal({ acik: true, sponsor })} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Düzenle</button>
                        <button onClick={() => sponsorSil(sponsor.id)} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors">Sil</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}