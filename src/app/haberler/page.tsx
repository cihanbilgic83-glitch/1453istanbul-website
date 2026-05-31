import type { Metadata } from 'next';
import { getHaberler } from '@/lib/data';
import HaberlerClient from './HaberlerClient';

export const metadata: Metadata = {
  title: 'Haberler',
  description: 'Kulüpten son haberler ve duyurular.',
};

export const dynamic = 'force-dynamic';

export default async function HaberlerPage() {
  const haberler = await getHaberler();
  return <HaberlerClient haberler={haberler} />;
}