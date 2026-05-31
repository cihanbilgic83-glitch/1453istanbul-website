import { NextRequest, NextResponse } from 'next/server';
import { getGaleri, saveGaleri } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(getGaleri());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  saveGaleri(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const yeniOge = await req.json();
  const galeri = getGaleri();
  yeniOge.id = Date.now().toString();
  galeri.unshift(yeniOge);
  saveGaleri(galeri);
  return NextResponse.json(yeniOge, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const galeri = getGaleri().filter((g) => g.id !== id);
  saveGaleri(galeri);
  return NextResponse.json({ success: true });
}