import { NextRequest, NextResponse } from 'next/server';
import { getMaclar, saveMaclar } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(await getMaclar());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await saveMaclar(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const yeniMac = await req.json();
  const maclar = await getMaclar();
  yeniMac.id = Date.now().toString();
  maclar.unshift(yeniMac);
  await saveMaclar(maclar);
  return NextResponse.json(yeniMac, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const maclar = (await getMaclar()).filter((m) => m.id !== id);
  await saveMaclar(maclar);
  return NextResponse.json({ success: true });
}