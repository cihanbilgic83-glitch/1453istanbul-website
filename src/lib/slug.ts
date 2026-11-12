// Türkçe uyumlu adres (slug) üretimi.
// "İş Birliğimiz Hayırlı Olsun!" -> "is-birligimiz-hayirli-olsun"

const TURKCE_HARFLER: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  â: 'a', Â: 'a', î: 'i', Î: 'i', û: 'u', Û: 'u',
};

const AZAMI_UZUNLUK = 80;

export function slugify(metin: string): string {
  return metin
    .replace(/[çÇğĞıIİöÖşŞüÜâÂîÎûÛ]/g, (harf) => TURKCE_HARFLER[harf] ?? harf)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’‘`´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, AZAMI_UZUNLUK)
    .replace(/-+$/g, '');
}

// Aynı adres varsa sonuna -2, -3 ... ekler.
export function benzersizSlug(taban: string, mevcut: Iterable<string>): string {
  const kullanilan = new Set(mevcut);
  const temel = taban || 'haber';
  let aday = temel;
  let sayac = 2;
  while (kullanilan.has(aday)) {
    aday = `${temel}-${sayac}`;
    sayac += 1;
  }
  return aday;
}

// URL'den gelen parametreyi güvenle çözer ("ma%C3%A7" -> "maç").
export function adresiCoz(parametre: string): string {
  try {
    return decodeURIComponent(parametre);
  } catch {
    return parametre;
  }
}
