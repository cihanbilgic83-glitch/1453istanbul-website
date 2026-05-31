import { NextRequest, NextResponse } from 'next/server';
import { getGaleri, saveGaleri } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(await getGaleri());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await saveGaleri(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const yeniOge = await req.json();
  const galeri = await getGaleri();
  yeniOge.id = Date.now().toString();
  galeri.unshift(yeniOge);
  await saveGaleri(galeri);
  return NextResponse.json(yeniOge, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const galeri = (await getGaleri()).filter((g) => g.id !== id);
  await saveGaleri(galeri);
  return NextResponse.json({ success: true });
}