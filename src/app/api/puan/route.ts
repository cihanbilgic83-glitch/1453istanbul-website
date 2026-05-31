import { NextRequest, NextResponse } from 'next/server';
import { getPuanTablosu, savePuanTablosu } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(await getPuanTablosu());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await savePuanTablosu(data);
  return NextResponse.json({ success: true });
}