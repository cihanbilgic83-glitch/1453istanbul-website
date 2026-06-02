import { NextRequest, NextResponse } from 'next/server';

// Bu endpoint cron-job.org tarafından günde 2 kez çağrılır (08:00 ve 20:00)
// Render.com'a CRON_SECRET env değişkeni eklenmelidir

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-cron-secret');

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    // sync-puan route'unu dahili olarak çağır
    const baseUrl = req.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/sync-puan`, {
      method: 'POST',
      headers: {
        'x-cron-secret': secret,
      },
    });

    const data = await res.json();
    return NextResponse.json({ ...data, cron: true, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}