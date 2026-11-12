import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { kopruAnahtariniHazirla } from '@/lib/tff/kopruProgrami';

// Panel: program anahtarını yeniler; eski indirilen programlar artık çalışmaz
export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Oturum süresi doldu.' }, { status: 401 });
  await kopruAnahtariniHazirla(true);
  return NextResponse.json({ success: true });
}
