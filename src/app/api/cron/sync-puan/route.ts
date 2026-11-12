import { NextRequest, NextResponse, after } from 'next/server';
import { tffSenkronla } from '@/lib/tff/senkron';

// cron-job.org bu adresi çağırır (günde 2 kez: 08:00 ve 20:00).
// Güncelleme 30-60 saniye sürebildiği için yanıt hemen döner, iş arka planda tamamlanır.
// Render'da CRON_SECRET ortam değişkeni tanımlı olmalıdır.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  after(async () => {
    try { await tffSenkronla(); }
    catch (err) { console.error('TFF zamanlanmış güncelleme hatası:', err); }
  });

  return NextResponse.json({ basladi: true, cron: true, timestamp: new Date().toISOString() });
}
