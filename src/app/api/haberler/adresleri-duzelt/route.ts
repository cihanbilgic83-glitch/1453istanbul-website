import { NextResponse } from 'next/server';
import { getHaberler, saveHaberler } from '@/lib/data';
import { getSession } from '@/lib/session';
import { benzersizSlug, slugify } from '@/lib/slug';

// Tek seferlik: tüm haber adreslerini başlıktan Türkçe uyumlu olarak yeniden üretir.
// Eski adresler eskiSluglar'da saklanır; eski linkler yeni adrese yönlenir.
export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Oturum süresi doldu, lütfen tekrar giriş yapın.' }, { status: 401 });
  }

  const haberler = await getHaberler();
  const kullanilan = new Set<string>();
  let degisen = 0;

  const guncel = haberler.map((haber) => {
    const yeni = benzersizSlug(slugify(haber.baslik), kullanilan);
    kullanilan.add(yeni);
    if (yeni === haber.slug) return haber;
    degisen += 1;
    const eskiler = new Set([...(haber.eskiSluglar ?? []), haber.slug]);
    eskiler.delete(yeni);
    return { ...haber, slug: yeni, eskiSluglar: [...eskiler] };
  });

  if (degisen > 0) await saveHaberler(guncel);
  return NextResponse.json({ success: true, degisen });
}
