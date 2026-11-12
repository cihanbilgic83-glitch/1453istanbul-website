import { NextRequest, NextResponse } from 'next/server';
import { getPuanTablosu, savePuanTablosu } from '@/lib/data';
import { getSession } from '@/lib/session';
import { takimKoduMu } from '@/lib/takimlar';

const takimSec = (req: NextRequest) => {
  const t = req.nextUrl.searchParams.get('takim');
  return takimKoduMu(t) ? t : 'a';
};

export async function GET(req: NextRequest) {
  return NextResponse.json(await getPuanTablosu(takimSec(req)));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  if (!Array.isArray(data)) return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
  await savePuanTablosu(data, takimSec(req));
  return NextResponse.json({ success: true });
}
