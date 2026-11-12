import { NextRequest, NextResponse } from 'next/server';
import { getMesajlar, saveMesajlar, addMesaj } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getMesajlar());
}

const kirp = (deger: unknown, uzunluk: number) => (typeof deger === 'string' ? deger.trim().slice(0, uzunluk) : '');

// Ziyaretçi iletişim formu. Görünmez "web_adresi" alanını dolduran botların mesajı sessizce atılır.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (kirp(body.web_adresi, 10)) return NextResponse.json({ success: true }, { status: 201 });

  const ad = kirp(body.ad, 100);
  const email = kirp(body.email, 150);
  const telefon = kirp(body.telefon, 30);
  const konu = kirp(body.konu, 50);
  const mesaj = kirp(body.mesaj, 3000);
  if (!ad || !email || !konu || !mesaj) {
    return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
  }
  const yeni = await addMesaj({ ad, email, telefon, konu, mesaj });
  return NextResponse.json(yeni, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await saveMesajlar(data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const mesajlar = (await getMesajlar()).filter((m) => m.id !== id);
  await saveMesajlar(mesajlar);
  return NextResponse.json({ success: true });
}