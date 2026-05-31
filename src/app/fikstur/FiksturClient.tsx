'use client';

import { useState } from 'react';
import type { Mac, PuanTablosu, MacOlay, MacKart } from '@/lib/types';

const BIZ = '1453 İstanbul AS';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function MacDetay({ mac }: { mac: Mac }) {
  const [acik, setAcik] = useState(false);
  const evBiz = mac.ev_sahibi === BIZ;

  let sonuc = null;
  if (mac.durum === 'tamamlandi' && mac.ev_gol !== null && mac.mis_gol !== null) {
    const bizGol = evBiz ? mac.ev_gol : mac.mis_gol;
    const rakipGol = evBiz ? mac.mis_gol : mac.ev_gol;
    sonuc = bizGol > rakipGol ? 'G' : bizGol === rakipGol ? 'B' : 'M';
  }

  const evGoller = mac.goller?.filter(g => g.takim === mac.ev_sahibi) ?? [];
  const depGoller = mac.goller?.filter(g => g.takim === mac.misafir) ?? [];
  const evKartlar = mac.kartlar?.filter(k => k.takim === mac.ev_sahibi) ?? [];
  const depKartlar = mac.kartlar?.filter(k => k.takim === mac.misafir) ?? [];
  const evAsistler = mac.asistler?.filter(a => a.takim === mac.ev_sahibi) ?? [];
  const depAsistler = mac.asistler?.filter(a => a.takim === mac.misafir) ?? [];

  const hasDetail = mac.durum === 'tamamlandi' && (
    (mac.goller?.length ?? 0) > 0 || (mac.kartlar?.length ?? 0) > 0
  );

  return (
    <div className={`rounded-xl border transition-all duration-200 bg-white ${
      mac.onemli ? 'border-[#C0392B]/30' : 'border-gray-100'
    } ${hasDetail ? 'cursor-pointer hover:border-[#1A4D2E]/40 hover:shadow-sm' : ''}`}
      onClick={() => hasDetail && setAcik(a => !a)}>

      {/* Maç satırı */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
        <div className="sm:w-36 text-xs text-gray-400">
          <div className="font-medium text-gray-600">{formatDate(mac.tarih)}</div>
          <div>{mac.saat}</div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className={`flex-1 text-right font-semibold text-sm ${evBiz ? 'text-[#1A4D2E]' : 'text-gray-700'}`}>
            {mac.ev_sahibi}
          </div>
          <div className="min-w-[70px] text-center">
            {mac.durum === 'tamamlandi' ? (
              <span className="bg-[#1A4D2E] text-white rounded-lg px-3 py-1 font-bold text-sm">
                {mac.ev_gol} - {mac.mis_gol}
              </span>
            ) : (
              <span className="bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-lg px-3 py-1 text-[#C0392B] text-xs font-bold">
                {mac.saat}
              </span>
            )}
          </div>
          <div className={`flex-1 text-left font-semibold text-sm ${!evBiz ? 'text-[#1A4D2E]' : 'text-gray-700'}`}>
            {mac.misafir}
          </div>
        </div>

        <div className="sm:w-28 flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[80px]">{mac.lig.split(' ').slice(0, 2).join(' ')}</span>
          {sonuc && (
            <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
              sonuc === 'G' ? 'bg-green-100 text-green-600' :
              sonuc === 'B' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-500'
            }`}>{sonuc}</span>
          )}
          {mac.durum === 'gelecek' && <span className="bg-blue-50 text-blue-500 text-xs px-2 py-0.5 rounded border border-blue-200">Gelecek</span>}
          {mac.durum === 'ertelendi' && <span className="bg-yellow-50 text-yellow-600 text-xs px-2 py-0.5 rounded border border-yellow-200">Ertelendi</span>}
          {hasDetail && (
            <span className="text-gray-400 text-xs">{acik ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

      {/* Detay Paneli */}
      {acik && hasDetail && (
        <div className="border-t border-gray-100 p-4 bg-[#f8f9fa] rounded-b-xl">
          <div className="grid grid-cols-2 gap-6">
            {/* Ev Sahibi */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">{mac.ev_sahibi}</div>

              {evGoller.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-400 mb-1.5">⚽ Goller</div>
                  {evGoller.sort((a,b)=>a.dakika-b.dakika).map((g: MacOlay, i: number) => {
                    const ast = evAsistler.find(a => a.dakika === g.dakika);
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                        <span className="text-gray-400 w-8 flex-shrink-0">{g.dakika}&apos;</span>
                        <div>
                          <span className="font-medium">{g.oyuncu}</span>
                          {ast && <span className="text-gray-400"> (Asist: {ast.oyuncu})</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {evKartlar.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1.5">Kartlar</div>
                  {evKartlar.sort((a,b)=>a.dakika-b.dakika).map((k: MacKart, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                      <span className="text-gray-400 w-8 flex-shrink-0">{k.dakika}&apos;</span>
                      <span className={`w-3 h-4 rounded-sm flex-shrink-0 ${k.tur === 'sari' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                      <span className="font-medium">{k.oyuncu}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Misafir */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">{mac.misafir}</div>

              {depGoller.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-400 mb-1.5">⚽ Goller</div>
                  {depGoller.sort((a,b)=>a.dakika-b.dakika).map((g: MacOlay, i: number) => {
                    const ast = depAsistler.find(a => a.dakika === g.dakika);
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                        <span className="text-gray-400 w-8 flex-shrink-0">{g.dakika}&apos;</span>
                        <div>
                          <span className="font-medium">{g.oyuncu}</span>
                          {ast && <span className="text-gray-400"> (Asist: {ast.oyuncu})</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {depKartlar.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1.5">Kartlar</div>
                  {depKartlar.sort((a,b)=>a.dakika-b.dakika).map((k: MacKart, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                      <span className="text-gray-400 w-8 flex-shrink-0">{k.dakika}&apos;</span>
                      <span className={`w-3 h-4 rounded-sm flex-shrink-0 ${k.tur === 'sari' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                      <span className="font-medium">{k.oyuncu}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 text-center text-xs text-gray-400">
            📍 {mac.stadyum}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FiksturClient({ maclar, puanTablosu }: { maclar: Mac[]; puanTablosu: PuanTablosu[] }) {
  const sirali = [...maclar].sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
  const gelecek = sirali.filter(m => m.durum === 'gelecek').reverse();
  const gecmis = sirali.filter(m => m.durum === 'tamamlandi');

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      <div className="bg-[#1A4D2E] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Fikstür & <span className="text-[#D4AF37]">Puan Durumu</span>
          </h1>
          <p className="text-green-200 text-sm">2025 — 2026 Sezonu · Tamamlanan maçlara tıklayarak detayları görüntüleyin</p>
        </div>
      </div>
      <div className="h-1 bg-[#C0392B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Maçlar */}
          <div className="lg:col-span-2 space-y-8">
            {gelecek.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" /> Gelecek Maçlar
                </h2>
                <div className="space-y-3">
                  {gelecek.map(m => <MacDetay key={m.id} mac={m} />)}
                </div>
              </div>
            )}
            {gecmis.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Geçmiş Maçlar
                  <span className="text-xs font-normal text-gray-400 ml-1">(detaylar için tıklayın)</span>
                </h2>
                <div className="space-y-3">
                  {gecmis.map(m => <MacDetay key={m.id} mac={m} />)}
                </div>
              </div>
            )}
          </div>

          {/* Puan Tablosu */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Puan Durumu
            </h2>
            <div className="bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1A4D2E] text-white">
                    <th className="text-left px-3 py-2.5">#</th>
                    <th className="text-left px-2 py-2.5">Takım</th>
                    <th className="text-center px-2 py-2.5">O</th>
                    <th className="text-center px-2 py-2.5">G</th>
                    <th className="text-center px-2 py-2.5">B</th>
                    <th className="text-center px-2 py-2.5">M</th>
                    <th className="text-center px-2 py-2.5">Av</th>
                    <th className="text-center px-2 py-2.5 font-bold">P</th>
                  </tr>
                </thead>
                <tbody>
                  {puanTablosu.map((t, idx) => (
                    <tr key={t.id} className={`border-b border-gray-100 table-row-hover ${t.takim === BIZ ? 'bg-[#1A4D2E]/8 border-l-2 border-l-[#1A4D2E] font-semibold' : ''}`}>
                      <td className="px-3 py-2.5 text-gray-400">{idx + 1}</td>
                      <td className="px-2 py-2.5 text-gray-800 truncate max-w-[80px]">{t.takim}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{t.o}</td>
                      <td className="px-2 py-2.5 text-center text-green-600 font-medium">{t.g}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{t.b}</td>
                      <td className="px-2 py-2.5 text-center text-red-500">{t.m}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{t.av > 0 ? `+${t.av}` : t.av}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-[#1A4D2E]">{t.puan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="mt-4 bg-white rounded-xl card-shadow border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Son 5 Maç Formu</h3>
              {puanTablosu.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-600 w-24 truncate font-medium">{t.takim.split(' ')[0]}</span>
                  <div className="flex gap-1">
                    {t.form.map((f: string, i: number) => (
                      <span key={i} className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${
                        f === 'G' ? 'bg-green-100 text-green-600' : f === 'B' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'
                      }`}>{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}