import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { kopruProgrami } from '@/lib/tff/kopruProgrami';

// Panel: TFF güncelleme programını (Windows .bat) anahtarıyla birlikte indirir
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Önce panele giriş yapın.' }, { status: 401 });
  const program = await kopruProgrami();
  return new NextResponse(program, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="1453-TFF-Guncelle.bat"',
      'Cache-Control': 'no-store',
    },
  });
}
