import { NextRequest, NextResponse } from 'next/server';
import { getMaclar, saveMaclar } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(getMaclar());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  saveMaclar(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const yeniMac = await req.json();
  const maclar = getMaclar();
  yeniMac.id = Date.now().toString();
  maclar.unshift(yeniMac);
  saveMaclar(maclar);
  return NextResponse.json(yeniMac, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const maclar = getMaclar().filter((m) => m.id !== id);
  saveMaclar(maclar);
  return NextResponse.json({ success: true });
}