import { getGaleri } from '@/lib/data';
import GaleriClient from './GaleriClient';

export const metadata = {
  title: 'Galeri',
  description: 'Maçlar, etkinlikler ve özel anlar.',
};

export default function GaleriPage() {
  const galeri = getGaleri();
  return <GaleriClient galeri={galeri} />;
}