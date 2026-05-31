import type { Metadata } from 'next';
import { getMaclar, getPuanTablosu } from '@/lib/data';
import FiksturClient from './FiksturClient';

export const metadata: Metadata = {
  title: 'Fikstür & Puan Durumu',
  description: 'Maç takvimi, sonuçlar ve puan durumu.',
};

export default function FiksturPage() {
  const maclar = getMaclar();
  const puanTablosu = getPuanTablosu();
  return <FiksturClient maclar={maclar} puanTablosu={puanTablosu} />;
}