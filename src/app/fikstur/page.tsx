import type { Metadata } from 'next';
import { getMaclar, getPuanTablosu, getSiteAyarlari } from '@/lib/data';
import { TAKIMLAR, macTakimi, takimKoduMu, takimTanimi } from '@/lib/takimlar';
import FiksturClient from './FiksturClient';

export const metadata: Metadata = {
  title: 'Fikstür & Puan Durumu',
  description: 'A takım, U17 ve U14 maç takvimi, sonuçlar ve puan durumu.',
};

export const dynamic = 'force-dynamic';

export default async function FiksturPage({ searchParams }: { searchParams: Promise<{ takim?: string }> }) {
  const { takim: istenen } = await searchParams;
  const takim = takimKoduMu(istenen) ? istenen : 'a';
  const [hepsi, puanTablosu, ayarlar] = await Promise.all([getMaclar(), getPuanTablosu(takim), getSiteAyarlari()]);
  const maclar = hepsi.filter((m) => macTakimi(m) === takim);
  const sekmeler = TAKIMLAR.map((t) => ({ ...t, sayi: hepsi.filter((m) => macTakimi(m) === t.kod).length }));
  return (
    <FiksturClient
      takim={takimTanimi(takim)}
      sekmeler={sekmeler}
      maclar={maclar}
      puanTablosu={puanTablosu}
      sezon={ayarlar.hero.sezon}
    />
  );
}
