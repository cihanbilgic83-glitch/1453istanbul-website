import type { Metadata } from 'next';
import { getMaclar, getPuanTablosu, getSiteAyarlari } from '@/lib/data';
import FiksturClient from './FiksturClient';

export const metadata: Metadata = {
  title: 'Fikstür & Puan Durumu',
  description: 'Maç takvimi, sonuçlar ve puan durumu.',
};

export const dynamic = 'force-dynamic';

export default async function FiksturPage() {
  const [maclar, puanTablosu, ayarlar] = await Promise.all([getMaclar(), getPuanTablosu(), getSiteAyarlari()]);
  return <FiksturClient maclar={maclar} puanTablosu={puanTablosu} sezon={ayarlar.hero.sezon} />;
}