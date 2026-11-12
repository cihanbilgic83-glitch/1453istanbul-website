import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// Teşhis: sunucunun TFF İstanbul'a ulaşıp ulaşamadığını, eski ve yeni istek biçimleriyle yan yana dener.
// Yalnızca giriş yapmış yönetici çağırabilir: /api/tff/tani
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const ESKI_BASLIKLAR = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'tr-TR,tr;q=0.9',
  Referer: 'https://tffistanbul.org/',
};
const YENI_BASLIKLAR = {
  ...ESKI_BASLIKLAR,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
};

async function dene(ad: string, adres: string, basliklar: Record<string, string>) {
  const bas = Date.now();
  try {
    const yanit = await fetch(adres, { headers: basliklar, cache: 'no-store', signal: AbortSignal.timeout(25000) });
    const metin = await yanit.text();
    return { ad, adres, basarili: yanit.ok, durum: yanit.status, sure_ms: Date.now() - bas, boyut: metin.length, puanTablosuVar: metin.includes('table-standings'), bizVar: /1453\s*İSTANBUL/i.test(metin) };
  } catch (hata) {
    const e = hata as { name?: string; message?: string; cause?: { code?: string; message?: string; errno?: number; syscall?: string; address?: string } };
    return { ad, adres, basarili: false, sure_ms: Date.now() - bas, hata: e?.message, tur: e?.name, neden_kodu: e?.cause?.code, neden: e?.cause?.message, adres_ip: e?.cause?.address, syscall: e?.cause?.syscall };
  }
}

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Önce panele giriş yapın.' }, { status: 401 });

  let cikisIp: string | null = null;
  try { cikisIp = (await (await fetch('https://api.ipify.org?format=json', { cache: 'no-store', signal: AbortSignal.timeout(8000) })).json()).ip; } catch { /* önemli değil */ }

  const sonuclar = [];
  sonuclar.push(await dene('1) Eski kod: eski adres + eski başlıklar', 'https://tffistanbul.org/puantaj-ve-fikstur/2025-2026/2-amator-lig/29/3/5892', ESKI_BASLIKLAR));
  sonuclar.push(await dene('2) Ana sayfa + eski başlıklar', 'https://tffistanbul.org/', ESKI_BASLIKLAR));
  sonuclar.push(await dene('3) U14 sayfası + eski başlıklar', 'https://tffistanbul.org/puantaj-ve-fikstur/2026-2027/u14-b-ligi/30/181/6154', ESKI_BASLIKLAR));
  sonuclar.push(await dene('4) U14 sayfası + yeni başlıklar', 'https://tffistanbul.org/puantaj-ve-fikstur/2026-2027/u14-b-ligi/30/181/6154', YENI_BASLIKLAR));
  sonuclar.push(await dene('5) Karşılaştırma: başka bir site', 'https://www.tff.org/', ESKI_BASLIKLAR));

  return NextResponse.json({ zaman: new Date().toISOString(), sunucuCikisIp: cikisIp, sonuclar }, { headers: { 'Cache-Control': 'no-store' } });
}
