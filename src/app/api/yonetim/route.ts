import { NextRequest, NextResponse } from 'next/server';
import { getYonetim, saveYonetim } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(getYonetim());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  saveYonetim(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uye = await req.json();
  const liste = getYonetim();
  uye.id = Date.now().toString();
  liste.push(uye);
  saveYonetim(liste);
  return NextResponse.json(uye, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const liste = getYonetim().filter((u) => u.id !== id);
  saveYonetim(liste);
  return NextResponse.json({ success: true });
}