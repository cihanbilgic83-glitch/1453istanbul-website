import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConditionalFooter from '@/components/layout/ConditionalFooter';

export const metadata: Metadata = {
  title: {
    default: '1453 İstanbul AS Spor Kulübü',
    template: '%s | 1453 İstanbul AS',
  },
  description:
    '1453 İstanbul AS Spor Kulübü resmi web sitesi. Maç sonuçları, fikstür, haberler ve daha fazlası.',
  keywords: ['1453 İstanbul', 'spor kulübü', 'futbol', 'İstanbul', 'amatör lig'],
  openGraph: {
    title: '1453 İstanbul AS Spor Kulübü',
    description: '1453 İstanbul AS Spor Kulübü resmi web sitesi.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-[#f8f9fa] text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <ConditionalFooter><Footer /></ConditionalFooter>
      </body>
    </html>
  );
}