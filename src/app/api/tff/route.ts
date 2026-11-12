import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTffKaynaklari, saveTffKaynaklari, getTffDurum } from '@/lib/data';
import { grupYolu } from '@/lib/tff/senkron';
import { takimKoduMu } from '@/lib/takimlar';
import type { TffKaynak } from '@/lib/types';

// Panel: TFF grup adresleri ve son güncelleme durumu
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Oturum süresi doldu.' }, { status: 401 });
  const [kaynaklar, durum] = await Promise.all([getTffKaynaklari(), getTffDurum()]);
  return NextResponse.json({ kaynaklar, durum });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Oturum süresi doldu.' }, { status: 401 });
  const gelen = await req.json().catch(() => null);
  if (!Array.isArray(gelen)) return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });

  const mevcut = await getTffKaynaklari();
  const yeni: TffKaynak[] = [];
  for (const k of mevcut) {
    const g = gelen.find((x: { takim?: unknown }) => takimKoduMu(x?.takim) && x.takim === k.takim);
    const ham = typeof g?.adres === 'string' ? g.adres.trim() : k.adres;
    if (!ham) { yeni.push({ takim: k.takim, adres: '' }); continue; }
    const yol = grupYolu(ham);
    if (!yol) {
      return NextResponse.json({ error: `${k.takim.toUpperCase()} için girilen adres bir TFF grup sayfası değil. Örnek: https://tffistanbul.org/puantaj-ve-fikstur/2026-2027/u14-b-ligi/30/181/6154` }, { status: 400 });
    }
    yeni.push({ takim: k.takim, adres: yol });
  }
  await saveTffKaynaklari(yeni);
  return NextResponse.json({ success: true, kaynaklar: yeni });
}
