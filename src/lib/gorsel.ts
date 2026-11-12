// Cloudinary adreslerine otomatik boyut/biçim dönüşümü ekler; diğer adresleri olduğu gibi bırakır.
const CLOUDINARY_YUKLEME = '/image/upload/';

export function gorselAdresi(adres: string, genislik?: number): string {
  if (!adres || !adres.includes('res.cloudinary.com') || !adres.includes(CLOUDINARY_YUKLEME)) return adres;
  const donusum = ['f_auto', 'q_auto', genislik ? `w_${genislik}` : ''].filter(Boolean).join(',');
  return adres.replace(CLOUDINARY_YUKLEME, `${CLOUDINARY_YUKLEME}${donusum}/`);
}

// next/image yalnızca bu alanlardaki görselleri küçültüp WebP'ye çevirebilir (next.config.ts ile aynı liste).
export const IZINLI_GORSEL_ALANLARI = ['i.ibb.co', 'res.cloudinary.com', 'picsum.photos', 'images.unsplash.com'];

// Listede olmayan bir adres (panelden elle yapıştırılmış) optimize edilmeden, olduğu gibi gösterilir.
export function optimizeEdilemez(adres: string): boolean {
  if (!adres || adres.startsWith('/')) return false;
  try {
    return !IZINLI_GORSEL_ALANLARI.includes(new URL(adres).hostname);
  } catch {
    return true;
  }
}
