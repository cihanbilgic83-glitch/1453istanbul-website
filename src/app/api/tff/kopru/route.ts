import { NextRequest, NextResponse } from 'next/server';
import { gunzipSync } from 'zlib';
import { timingSafeEqual } from 'crypto';
import { getTffKopruAnahtari } from '@/lib/data';
import { tffSenkronla, onbellekGetirici } from '@/lib/tff/senkron';

// Türkiye'deki bilgisayarda çalışan program TFF sayfalarını okuyup buraya gönderir.
// Site sayfaları ayrıştırır; eksik sayfa varsa listesini döner, program onları da okuyup tekrar gönderir.
// Bütün sayfalar tamamlanınca veriler tek seferde kaydedilir.
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

function anahtarDogruMu(gelen: string | null, kayitli: string): boolean {
  if (!gelen) return false;
  const a = Buffer.from(gelen), b = Buffer.from(kayitli);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Windows PowerShell 5.1 yanıtı doğru (Türkçe karakterlerle) çözsün diye karakter kümesi açıkça yazılır
const yanitla = (veri: unknown, status = 200) =>
  NextResponse.json(veri, { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const YOL_DESENI = /^\/(puantaj-ve-fikstur|mac)\/[A-Za-z0-9/_-]+$/;

export async function POST(req: NextRequest) {
  const kayitli = await getTffKopruAnahtari();
  if (!kayitli || !anahtarDogruMu(req.headers.get('x-kopru-anahtari'), kayitli)) {
    return yanitla({ durum: 'hata', hata: 'Program anahtarı geçersiz. Panelden programı yeniden indirin.' }, 401);
  }

  const govde = await req.json().catch(() => null) as { sayfalar?: Record<string, string> } | null;
  const gelen = govde?.sayfalar && typeof govde.sayfalar === 'object' ? govde.sayfalar : {};

  // Sayfalar gzip + base64 olarak gelir; boş değer = program o sayfayı alamadı
  const sayfalar: Record<string, string> = {};
  for (const [yol, veri] of Object.entries(gelen)) {
    if (!YOL_DESENI.test(yol) || typeof veri !== 'string') continue;
    if (!veri) { sayfalar[yol] = ''; continue; }
    try { sayfalar[yol] = gunzipSync(Buffer.from(veri, 'base64')).toString('utf8'); }
    catch { sayfalar[yol] = ''; }
  }

  try {
    const sonuc = await tffSenkronla({ getirici: onbellekGetirici(sayfalar), kaynak: 'bilgisayar' });
    if (sonuc.eksik?.length) return yanitla({ durum: 'eksik', eksik: sonuc.eksik });
    const ad: Record<string, string> = { a: 'A Takım', u17: 'U17', u14: 'U14' };
    const ozet = Object.entries(sonuc.takimlar).map(([k, d]) => `${ad[k] ?? k}: ${d?.basarili ? 'tamam' : 'HATA'} - ${d?.mesaj ?? ''}`);
    return yanitla({ durum: 'tamam', ozet });
  } catch (hata) {
    return yanitla({ durum: 'hata', hata: hata instanceof Error ? hata.message : String(hata) }, 500);
  }
}
