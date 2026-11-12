import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { tffSenkronla } from '@/lib/tff/senkron';
import { takimKoduMu } from '@/lib/takimlar';

// TFF İstanbul'dan puan tablosu, fikstür, skor ve maç detaylarını çeker.
// Panelden (oturum) ya da zamanlanmış görevden (x-cron-secret) çağrılır.
export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await getSession();
  const cronSecret = req.headers.get('x-cron-secret');
  const cronGecerli = !!process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;
  if (!session.isLoggedIn && !cronGecerli) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  let govde: { takim?: unknown; tumSezon?: unknown } = {};
  try { govde = await req.json(); } catch { /* gövdesiz çağrı: hepsini güncelle */ }

  try {
    const durum = await tffSenkronla({
      takim: takimKoduMu(govde.takim) ? govde.takim : undefined,
      tumSezon: govde.tumSezon === true,
    });
    const basarili = Object.values(durum.takimlar).every((t) => t?.basarili !== false);
    return NextResponse.json({ success: basarili, durum });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
