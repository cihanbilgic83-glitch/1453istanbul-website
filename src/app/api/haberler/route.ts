import { NextRequest, NextResponse } from 'next/server';
import { getHaberler, saveHaberler } from '@/lib/data';
import { getSession } from '@/lib/session';
import { benzersizSlug, slugify } from '@/lib/slug';
import type { Haber } from '@/lib/types';

const VARSAYILAN_YAZAR = '1453 İstanbul AS Basın';

const yetkisiz = () => NextResponse.json({ error: 'Oturum süresi doldu, lütfen tekrar giriş yapın.' }, { status: 401 });
const hatali = (mesaj: string) => NextResponse.json({ error: mesaj }, { status: 400 });

const metin = (deger: unknown) => (typeof deger === 'string' ? deger.trim() : '');

function haberiDogrula(veri: Partial<Haber>): string | null {
  if (!metin(veri.baslik)) return 'Başlık zorunlu.';
  if (!metin(veri.icerik)) return 'İçerik zorunlu.';
  if (!metin(veri.tarih)) return 'Tarih zorunlu.';
  const gorsel = metin(veri.gorsel);
  if (gorsel && !/^https:\/\//i.test(gorsel) && !gorsel.startsWith('/')) return 'Kapak görseli adresi https:// ile başlamalı.';
  return null;
}

export async function GET() {
  return NextResponse.json(await getHaberler());
}

// Tüm listeyi kaydeder (düzenleme). Değişen adresler eskiSluglar'a eklenir, böylece eski linkler yönlenir.
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return yetkisiz();
  const gelen: unknown = await req.json();
  if (!Array.isArray(gelen)) return hatali('Geçersiz veri.');

  const mevcut = new Map((await getHaberler()).map((h) => [h.id, h]));
  const kullanilan = new Set<string>();
  const temiz: Haber[] = [];

  for (const ham of gelen as Partial<Haber>[]) {
    if (!ham || typeof ham !== 'object' || !ham.id) continue;
    const hata = haberiDogrula(ham);
    if (hata) return hatali(`"${metin(ham.baslik) || ham.id}": ${hata}`);
    const onceki = mevcut.get(ham.id);
    const istenen = slugify(metin(ham.slug) || metin(ham.baslik));
    const slug = benzersizSlug(istenen, kullanilan);
    kullanilan.add(slug);
    const eskiSluglar = new Set([...(onceki?.eskiSluglar ?? []), ...(ham.eskiSluglar ?? [])]);
    if (onceki && onceki.slug !== slug) eskiSluglar.add(onceki.slug);
    eskiSluglar.delete(slug);
    temiz.push({
      ...(ham as Haber),
      slug,
      baslik: metin(ham.baslik),
      ozet: metin(ham.ozet),
      yazar: metin(ham.yazar) || VARSAYILAN_YAZAR,
      eskiSluglar: [...eskiSluglar],
    });
  }

  await saveHaberler(temiz);
  return NextResponse.json({ success: true, haberler: temiz });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return yetkisiz();
  const veri = (await req.json()) as Partial<Haber>;
  const hata = haberiDogrula(veri);
  if (hata) return hatali(hata);

  const haberler = await getHaberler();
  const kullanilan = haberler.flatMap((h) => [h.slug, ...(h.eskiSluglar ?? [])]);
  const yeniHaber: Haber = {
    id: Date.now().toString(),
    slug: benzersizSlug(slugify(metin(veri.slug) || metin(veri.baslik)), kullanilan),
    baslik: metin(veri.baslik),
    ozet: metin(veri.ozet),
    icerik: metin(veri.icerik),
    gorsel: metin(veri.gorsel),
    kategori: metin(veri.kategori) || 'Kulüp',
    tarih: metin(veri.tarih),
    yazar: metin(veri.yazar) || VARSAYILAN_YAZAR,
    eskiSluglar: [],
  };
  await saveHaberler([yeniHaber, ...haberler]);
  return NextResponse.json(yeniHaber, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return yetkisiz();
  const { id } = await req.json();
  const haberler = (await getHaberler()).filter((h) => h.id !== id);
  await saveHaberler(haberler);
  return NextResponse.json({ success: true });
}
