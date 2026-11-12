import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const AZAMI_BOYUT = 10 * 1024 * 1024;
const CLOUDINARY_KLASOR = '1453istanbul';

type YuklemeSonucu = { url: string; thumb: string };

const hata = (mesaj: string, durum: number) => NextResponse.json({ error: mesaj }, { status: durum });

function cloudinaryAyarli(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function cloudinaryYukle(dosya: File): Promise<YuklemeSonucu> {
  const bulut = process.env.CLOUDINARY_CLOUD_NAME!;
  const anahtar = process.env.CLOUDINARY_API_KEY!;
  const gizli = process.env.CLOUDINARY_API_SECRET!;
  const zaman = Math.floor(Date.now() / 1000).toString();
  const imza = crypto.createHash('sha1').update(`folder=${CLOUDINARY_KLASOR}&timestamp=${zaman}${gizli}`).digest('hex');

  const form = new FormData();
  form.append('file', dosya);
  form.append('api_key', anahtar);
  form.append('timestamp', zaman);
  form.append('folder', CLOUDINARY_KLASOR);
  form.append('signature', imza);

  const cevap = await fetch(`https://api.cloudinary.com/v1_1/${bulut}/image/upload`, { method: 'POST', body: form });
  const veri = await cevap.json();
  if (!cevap.ok || !veri.secure_url) throw new Error(veri?.error?.message || 'Cloudinary yüklemesi başarısız.');
  return { url: veri.secure_url, thumb: veri.secure_url };
}

async function imgbbYukle(dosya: File): Promise<YuklemeSonucu> {
  const anahtar = process.env.IMGBB_API_KEY;
  if (!anahtar) throw new Error('Görsel servisi ayarlanmamış (IMGBB_API_KEY).');
  const base64 = Buffer.from(await dosya.arrayBuffer()).toString('base64');
  const form = new FormData();
  form.append('key', anahtar);
  form.append('image', base64);
  form.append('name', dosya.name.replace(/\.[^.]+$/, ''));

  const cevap = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const veri = await cevap.json();
  if (!veri.success) throw new Error('ImgBB yüklemesi başarısız.');
  return { url: veri.data.url, thumb: veri.data.thumb?.url ?? veri.data.url };
}

// Yalnızca panele giriş yapmış kullanıcılar görsel yükleyebilir.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return hata('Oturum süresi doldu, lütfen tekrar giriş yapın.', 401);

  try {
    const formData = await req.formData();
    const dosya = formData.get('image');
    if (!(dosya instanceof File)) return hata('Dosya bulunamadı.', 400);
    if (!dosya.type.startsWith('image/')) return hata('Yalnızca görsel dosyası yüklenebilir.', 400);
    if (dosya.size > AZAMI_BOYUT) return hata('Dosya 10 MB\'dan büyük olamaz.', 400);

    const sonuc = cloudinaryAyarli() ? await cloudinaryYukle(dosya) : await imgbbYukle(dosya);
    return NextResponse.json(sonuc);
  } catch (err) {
    console.error('Görsel yükleme hatası:', err);
    return hata(err instanceof Error ? err.message : 'Sunucu hatası.', 502);
  }
}
