// Kendi takımımızın farklı yazımlarını ("1453 İSTANBUL", "1453 İstanbul AS") tek takım sayar.

const BIZIM_TAKIM_ANAHTARI = '1453istanbul';

function sadelestir(ad: string): string {
  return ad
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function bizimTakimMi(ad: string | undefined | null): boolean {
  if (!ad) return false;
  return sadelestir(ad).startsWith(BIZIM_TAKIM_ANAHTARI);
}
