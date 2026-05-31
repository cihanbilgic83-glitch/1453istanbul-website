import { getGaleri } from '@/lib/data';
import GaleriClient from './GaleriClient';

export const metadata = {
  title: 'Galeri',
  description: 'Maçlar, etkinlikler ve özel anlar.',
};

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const galeri = await getGaleri();
  return <GaleriClient galeri={galeri} />;
}