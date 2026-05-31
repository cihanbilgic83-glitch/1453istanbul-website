import { NextRequest, NextResponse } from 'next/server';
import { getSiteAyarlari, saveSiteAyarlari } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(getSiteAyarlari());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  saveSiteAyarlari(data);
  return NextResponse.json({ success: true });
}