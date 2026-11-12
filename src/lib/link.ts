// Yer tutucu ya da geçersiz web adreslerini (boş, "#", example.com) eler.
export function gecerliWebAdresi(adres?: string | null): string | null {
  if (!adres) return null;
  const temiz = adres.trim();
  if (!/^https?:\/\//i.test(temiz)) return null;
  try {
    const { hostname } = new URL(temiz);
    if (/(^|\.)example\.(com|org|net)$/i.test(hostname)) return null;
    return temiz;
  } catch {
    return null;
  }
}
