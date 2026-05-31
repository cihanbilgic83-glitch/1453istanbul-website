import type { Metadata } from 'next';
import { getHaberler } from '@/lib/data';
import HaberlerClient from './HaberlerClient';

export const metadata: Metadata = {
  title: 'Haberler',
  description: 'Kulüpten son haberler ve duyurular.',
};

export default function HaberlerPage() {
  const haberler = getHaberler();
  return <HaberlerClient haberler={haberler} />;
}