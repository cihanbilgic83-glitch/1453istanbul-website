// Tarayıcıda, yüklemeden önce görseli küçültür: uzun kenar en fazla 1920 px, JPEG %85.
// Telefon fotoğrafları (3-8 MB) böylece ~300-600 KB'a iner. Okunamayan dosya olduğu gibi döner.

const UZUN_KENAR = 1920;
const KALITE = 0.85;
const KUCULTME_ESIGI = 600 * 1024;

function resmiOku(dosya: File): Promise<HTMLImageElement> {
  return new Promise((coz, reddet) => {
    const adres = URL.createObjectURL(dosya);
    const resim = new Image();
    resim.onload = () => { URL.revokeObjectURL(adres); coz(resim); };
    resim.onerror = () => { URL.revokeObjectURL(adres); reddet(new Error('Görsel okunamadı')); };
    resim.src = adres;
  });
}

export async function gorseliKucult(dosya: File): Promise<File> {
  if (!dosya.type.startsWith('image/') || dosya.type === 'image/gif' || dosya.type === 'image/svg+xml') return dosya;
  try {
    const resim = await resmiOku(dosya);
    const oran = Math.min(1, UZUN_KENAR / Math.max(resim.naturalWidth, resim.naturalHeight));
    if (oran === 1 && dosya.size <= KUCULTME_ESIGI) return dosya;

    const tuval = document.createElement('canvas');
    tuval.width = Math.round(resim.naturalWidth * oran);
    tuval.height = Math.round(resim.naturalHeight * oran);
    const ciz = tuval.getContext('2d');
    if (!ciz) return dosya;
    ciz.fillStyle = '#ffffff';
    ciz.fillRect(0, 0, tuval.width, tuval.height);
    ciz.drawImage(resim, 0, 0, tuval.width, tuval.height);

    const blob = await new Promise<Blob | null>((coz) => tuval.toBlob(coz, 'image/jpeg', KALITE));
    if (!blob || blob.size >= dosya.size) return dosya;
    const ad = dosya.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], ad, { type: 'image/jpeg' });
  } catch {
    return dosya;
  }
}
