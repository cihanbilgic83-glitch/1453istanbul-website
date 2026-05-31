import { NextRequest, NextResponse } from 'next/server';
import { getHaberler, saveHaberler } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(await getHaberler());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await saveHaberler(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const yeniHaber = await req.json();
  const haberler = await getHaberler();
  yeniHaber.id = Date.now().toString();
  if (!yeniHaber.slug) {
    yeniHaber.slug = yeniHaber.baslik
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  haberler.unshift(yeniHaber);
  await saveHaberler(haberler);
  return NextResponse.json(yeniHaber, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const haberler = (await getHaberler()).filter((h) => h.id !== id);
  await saveHaberler(haberler);
  return NextResponse.json({ success: true });
}