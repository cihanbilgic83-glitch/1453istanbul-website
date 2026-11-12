'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SiteAyarlari } from '@/lib/data';
import Etiket from '@/components/ui/Etiket';

const KONULAR = ['Genel Bilgi', 'Üyelik', 'Altyapı', 'Sponsorluk', 'Transfer', 'Basın', 'Diğer'];
const BOS_FORM = { ad: '', email: '', telefon: '', konu: '', mesaj: '', web_adresi: '' };

const alanSinifi = 'w-full border border-cizgi bg-fildisi px-4 py-3 text-[15px] text-murekkep placeholder-[#8E988D] focus:border-zumrut';

export default function IletisimClient({ ayarlar, baslangicKonusu }: { ayarlar: SiteAyarlari; baslangicKonusu?: string }) {
  const [form, setForm] = useState({ ...BOS_FORM, konu: KONULAR.includes(baslangicKonusu ?? '') ? baslangicKonusu! : '' });
  const [onay, setOnay] = useState(false);
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'tamam' | 'hata'>('bos');

  const yaz = (alan: keyof typeof BOS_FORM, deger: string) => setForm((f) => ({ ...f, [alan]: deger }));

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setDurum('gonderiliyor');
    try {
      const cevap = await fetch('/api/mesajlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!cevap.ok) throw new Error();
      setDurum('tamam');
      setForm(BOS_FORM);
      setOnay(false);
    } catch {
      setDurum('hata');
    }
  };

  const { iletisim, calisma_saatleri } = ayarlar;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <aside className="lg:col-span-4 space-y-8">
        <div>
          <Etiket>İletişim bilgileri</Etiket>
          <dl className="mt-5 space-y-5 text-[15px]">
            {iletisim.adres && (<div><dt className="text-xs tracking-[0.16em] text-kursun font-semibold uppercase">Adres</dt><dd className="mt-1 text-murekkep">{iletisim.adres}</dd></div>)}
            {iletisim.telefon && (<div><dt className="text-xs tracking-[0.16em] text-kursun font-semibold uppercase">Telefon</dt><dd className="mt-1"><a href={`tel:${iletisim.telefon.replace(/\s/g, '')}`} className="text-zumrut font-semibold hover:text-al">{iletisim.telefon}</a></dd></div>)}
            {iletisim.email && (<div><dt className="text-xs tracking-[0.16em] text-kursun font-semibold uppercase">E-posta</dt><dd className="mt-1"><a href={`mailto:${iletisim.email}`} className="text-zumrut font-semibold hover:text-al break-all">{iletisim.email}</a></dd></div>)}
          </dl>
          {iletisim.harita_link && (
            <a href={iletisim.harita_link} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-sm font-semibold text-zumrut border-b border-zumrut pb-0.5 hover:text-al hover:border-al">Haritada aç</a>
          )}
        </div>

        {calisma_saatleri.length > 0 && (
          <div className="bg-gece text-krem p-6">
            <div className="text-[11px] tracking-[0.24em] text-mat font-semibold">ÇALIŞMA SAATLERİ</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {calisma_saatleri.map((s) => (
                <li key={s.gun} className="flex justify-between gap-4 border-b border-krem/10 pb-2.5 last:border-0 last:pb-0">
                  <span>{s.gun}</span><span className="text-white font-semibold rakam">{s.saat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="lg:col-span-8">
        <div className="bg-white border border-cizgi border-t-[3px] border-t-mat p-6 md:p-10">
          <h2 className="font-baslik font-bold uppercase text-zumrut text-3xl md:text-4xl leading-none">Bize yazın</h2>
          <p className="mt-2 text-sm text-kursun">Altyapı seçmeleri, üyelik, sponsorluk ve tüm sorularınız için.</p>

          {durum === 'tamam' ? (
            <div role="status" className="mt-8 py-10 text-center">
              <p className="font-zarif italic text-3xl text-zumrut">Mesajınız bize ulaştı.</p>
              <p className="mt-2 text-sm text-kursun">En kısa sürede size dönüş yapacağız.</p>
              <button type="button" onClick={() => setDurum('bos')} className="mt-6 bg-zumrut text-white px-6 py-3 font-semibold hover:bg-gece">Yeni mesaj</button>
            </div>
          ) : (
            <form onSubmit={gonder} className="mt-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="ad" className="block text-xs font-semibold text-kursun mb-1.5">Ad soyad *</label>
                  <input id="ad" required maxLength={100} autoComplete="name" value={form.ad} onChange={(e) => yaz('ad', e.target.value)} className={alanSinifi} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-kursun mb-1.5">E-posta *</label>
                  <input id="email" required type="email" maxLength={150} autoComplete="email" value={form.email} onChange={(e) => yaz('email', e.target.value)} className={alanSinifi} />
                </div>
                <div>
                  <label htmlFor="telefon" className="block text-xs font-semibold text-kursun mb-1.5">Telefon</label>
                  <input id="telefon" type="tel" maxLength={30} autoComplete="tel" value={form.telefon} onChange={(e) => yaz('telefon', e.target.value)} className={alanSinifi} placeholder="05XX XXX XX XX" />
                </div>
                <div>
                  <label htmlFor="konu" className="block text-xs font-semibold text-kursun mb-1.5">Konu *</label>
                  <select id="konu" required value={form.konu} onChange={(e) => yaz('konu', e.target.value)} className={alanSinifi}>
                    <option value="">Konu seçin</option>
                    {KONULAR.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="mesaj" className="block text-xs font-semibold text-kursun mb-1.5">Mesajınız *</label>
                <textarea id="mesaj" required rows={6} maxLength={3000} value={form.mesaj} onChange={(e) => yaz('mesaj', e.target.value)} className={`${alanSinifi} resize-y`} />
              </div>
              {/* Botlar için görünmez tuzak alan; insanlar doldurmaz */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="web_adresi">Web adresi</label>
                <input id="web_adresi" tabIndex={-1} autoComplete="off" value={form.web_adresi} onChange={(e) => yaz('web_adresi', e.target.value)} />
              </div>
              <label className="flex items-start gap-3 text-sm text-[#3A423E]">
                <input type="checkbox" required checked={onay} onChange={(e) => setOnay(e.target.checked)} className="mt-1 w-4 h-4 accent-[#0E3B24]" />
                <span><Link href="/kvkk" target="_blank" className="text-zumrut font-semibold underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum; kişisel verilerimin bu mesajı yanıtlamak amacıyla işlenmesini kabul ediyorum. *</span>
              </label>
              {durum === 'hata' && <p role="alert" className="text-al text-sm">Mesaj gönderilemedi. Lütfen tekrar deneyin ya da bizi telefonla arayın.</p>}
              <button type="submit" disabled={durum === 'gonderiliyor'} className="w-full sm:w-auto bg-al hover:bg-al-koyu text-white px-10 py-4 font-semibold transition-colors disabled:opacity-60">
                {durum === 'gonderiliyor' ? 'Gönderiliyor...' : 'Mesajı gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
