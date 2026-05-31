import type { Metadata } from 'next';
import { getMaclar, getPuanTablosu } from '@/lib/data';
import FiksturClient from './FiksturClient';

export const metadata: Metadata = {
  title: 'Fikstür & Puan Durumu',
  description: 'Maç takvimi, sonuçlar ve puan durumu.',
};

export const dynamic = 'force-dynamic';

export default async function FiksturPage() {
  const [maclar, puanTablosu] = await Promise.all([getMaclar(), getPuanTablosu()]);
  return <FiksturClient maclar={maclar} puanTablosu={puanTablosu} />;
}