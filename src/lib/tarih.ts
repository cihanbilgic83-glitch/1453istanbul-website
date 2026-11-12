// İstanbul saatine göre bugünün tarihi: "2026-11-12"
export function bugununTarihi(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function tarihSirala<T extends { tarih: string }>(liste: T[], yon: 'yeni' | 'eski' = 'yeni'): T[] {
  const carpan = yon === 'yeni' ? -1 : 1;
  return [...liste].sort((a, b) => carpan * (a.tarih || '').localeCompare(b.tarih || ''));
}
