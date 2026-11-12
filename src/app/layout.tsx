import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ConditionalFooter from '@/components/layout/ConditionalFooter';

const SITE_ADRESI = process.env.NEXT_PUBLIC_SITE_URL || 'https://1453istanbul.com.tr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ADRESI),
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
    siteName: '1453 İstanbul AS Spor Kulübü',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-fildisi text-murekkep min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <ConditionalFooter><Footer /></ConditionalFooter>
      </body>
    </html>
  );
}