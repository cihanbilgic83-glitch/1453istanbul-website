import { NextRequest, NextResponse } from 'next/server';
import { getMesajlar, saveMesajlar, addMesaj } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(getMesajlar());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ad, email, telefon, konu, mesaj } = body;
  if (!ad || !email || !konu || !mesaj) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }
  const yeni = addMesaj({ ad, email, telefon, konu, mesaj });
  return NextResponse.json(yeni, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  saveMesajlar(data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const mesajlar = getMesajlar().filter((m) => m.id !== id);
  saveMesajlar(mesajlar);
  return NextResponse.json({ success: true });
}