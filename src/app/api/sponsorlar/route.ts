import { NextRequest, NextResponse } from 'next/server';
import { getSponsorlar, saveSponsorlar } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  return NextResponse.json(getSponsorlar());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  saveSponsorlar(data);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sponsor = await req.json();
  const liste = getSponsorlar();
  sponsor.id = Date.now().toString();
  liste.push(sponsor);
  saveSponsorlar(liste);
  return NextResponse.json(sponsor, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const liste = getSponsorlar().filter((s) => s.id !== id);
  saveSponsorlar(liste);
  return NextResponse.json({ success: true });
}