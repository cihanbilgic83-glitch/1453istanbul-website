'use client';

import { useState } from 'react';

export default function IletisimPage() {
  const [form, setForm] = useState({ ad: '', email: '', telefon: '', konu: '', mesaj: '' });
  const [durum, setDurum] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setDurum('loading');
    try {
      const res = await fetch('/api/mesajlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDurum('success');
        setForm({ ad: '', email: '', telefon: '', konu: '', mesaj: '' });
      } else {
        setDurum('error');
      }
    } catch {
      setDurum('error');
    }
  };

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A4D2E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Bize <span className="text-[#D4AF37]">Ulaşın</span>
          </h1>
          <p className="text-green-200 text-sm">Sorularınız için bizimle iletişime geçin</p>
        </div>
      </div>
      <div className="h-1 bg-[#C0392B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* İletişim Bilgileri */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
                icon2: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
                baslik: 'Adres', deger: 'Sultanmurat Mahallesi 1.Cami Sokak No:6/1 Küçükçekmece/İstanbul'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                baslik: 'E-posta', deger: '1453istanbulspor@gmail.com'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
                baslik: 'Telefon', deger: '0541 439 1453'
              },
            ].map((item) => (
              <div key={item.baslik} className="bg-white rounded-xl p-5 card-shadow border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1A4D2E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#1A4D2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                    {item.icon2}
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">{item.baslik}</div>
                  <div className="text-gray-800 font-semibold text-sm">{item.deger}</div>
                </div>
              </div>
            ))}

            {/* Çalışma Saatleri */}
            <div className="bg-[#1A4D2E] rounded-xl p-5 text-white">
              <h3 className="font-bold mb-3 text-sm">Çalışma Saatleri</h3>
              {[
                { gun: 'Pazartesi - Cuma', saat: '09:00 - 18:00' },
                { gun: 'Cumartesi', saat: '10:00 - 14:00' },
                { gun: 'Pazar', saat: 'Kapalı' },
              ].map((s) => (
                <div key={s.gun} className="flex justify-between text-sm py-1.5 border-b border-white/10 last:border-0">
                  <span className="text-green-200">{s.gun}</span>
                  <span className={s.saat === 'Kapalı' ? 'text-red-300' : 'text-white font-medium'}>{s.saat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönderin</h2>

              {durum === 'success' ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Mesajınız İletildi!</p>
                  <p className="text-gray-500 text-sm">En kısa sürede size geri döneceğiz.</p>
                  <button onClick={() => setDurum('idle')}
                    className="mt-6 bg-[#1A4D2E] hover:bg-[#163d24] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                    Yeni Mesaj
                  </button>
                </div>
              ) : (
                <form onSubmit={gonder} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Ad Soyad *</label>
                      <input required value={form.ad} onChange={e => set('ad', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-[#f8f9fa] focus:bg-white transition-colors"
                        placeholder="Adınız Soyadınız" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">E-posta *</label>
                      <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-[#f8f9fa] focus:bg-white transition-colors"
                        placeholder="ornek@email.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Telefon</label>
                      <input value={form.telefon} onChange={e => set('telefon', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-[#f8f9fa] focus:bg-white transition-colors"
                        placeholder="+90 5XX XXX XX XX" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Konu *</label>
                      <select required value={form.konu} onChange={e => set('konu', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-[#f8f9fa] focus:bg-white transition-colors">
                        <option value="">Konu seçin</option>
                        {['Genel Bilgi', 'Sponsorluk', 'Transfer', 'Altyapı', 'Basın', 'Diğer'].map(k => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Mesajınız *</label>
                    <textarea required rows={5} value={form.mesaj} onChange={e => set('mesaj', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-[#f8f9fa] focus:bg-white transition-colors resize-none"
                      placeholder="Mesajınızı buraya yazın..." />
                  </div>
                  {durum === 'error' && (
                    <p className="text-red-500 text-sm">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                  )}
                  <button type="submit" disabled={durum === 'loading'}
                    className="w-full bg-[#C0392B] hover:bg-[#96281B] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {durum === 'loading' ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}