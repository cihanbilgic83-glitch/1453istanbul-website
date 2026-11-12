import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getHaberler, haberiBul } from '@/lib/data';
import HaberKapak from '@/components/haber/HaberKapak';
import { gorselAdresi, optimizeEdilemez } from '@/lib/gorsel';
import PaylasButonlari from '@/components/haber/PaylasButonlari';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sonuc = await haberiBul(slug);
  if (!sonuc) return { title: 'Haber Bulunamadı', robots: { index: false } };
  const { haber } = sonuc;
  const aciklama = haber.ozet || haber.icerik.slice(0, 160);
  const adres = `/haberler/${haber.slug}`;
  const gorseller = haber.gorsel ? [{ url: gorselAdresi(haber.gorsel, 1200), alt: haber.baslik }] : undefined;
  return {
    title: haber.baslik,
    description: aciklama,
    alternates: { canonical: adres },
    openGraph: {
      type: 'article',
      title: haber.baslik,
      description: aciklama,
      url: adres,
      publishedTime: haber.tarih,
      images: gorseller,
    },
    twitter: { card: haber.gorsel ? 'summary_large_image' : 'summary', title: haber.baslik, description: aciklama, images: gorseller?.map((g) => g.url) },
  };
}

export default async function HaberDetayPage({ params }: Props) {
  const { slug: parametre } = await params;
  const sonuc = await haberiBul(parametre);
  if (!sonuc) notFound();
  const { haber, yonlendir } = sonuc;
  if (yonlendir) permanentRedirect(`/haberler/${haber.slug}`);
  const slug = haber.slug;
  const haberler = await getHaberler();

  const diger = haberler.filter((h) => h.slug !== slug).slice(0, 3);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const siteAdresi = process.env.NEXT_PUBLIC_SITE_URL || 'https://1453istanbul.com.tr';
  const tamAdres = `${siteAdresi}/haberler/${haber.slug}`;
  const paragraflar = haber.icerik.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const okumaSuresi = Math.max(1, Math.round(haber.icerik.split(/\s+/).length / 200));

  return (
    <article className="bg-fildisi">
      <div className="h-[88px] bg-gece" />

      <header className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 md:pt-14 text-center">
        <nav aria-label="Konum" className="text-[13px] text-kursun">
          <Link href="/haberler" className="hover:text-zumrut">Haberler</Link>
          <span className="mx-2">/</span>
          <span>{haber.kategori}</span>
        </nav>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-al" />
          <span className="text-xs tracking-[0.28em] text-al font-semibold uppercase">{haber.kategori} · {formatDate(haber.tarih)}</span>
          <span aria-hidden="true" className="h-px w-10 bg-al" />
        </div>
        <h1 className="mt-5 font-baslik font-extrabold uppercase text-zumrut text-[44px] sm:text-6xl md:text-[80px] leading-[0.95]">{haber.baslik}</h1>
        {haber.ozet && <p className="mt-5 mx-auto max-w-3xl font-zarif italic text-[23px] md:text-[30px] leading-snug text-[#3A423E]">{haber.ozet}</p>}
        <div className="mt-7 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-kursun">
          <span>{haber.yazar || '1453 İstanbul AS Basın'} <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-mat align-middle mx-2" /> {okumaSuresi} dk okuma</span>
          <div className="hidden md:block"><PaylasButonlari adres={tamAdres} baslik={haber.baslik} /></div>
        </div>
      </header>

      {haber.gorsel && (
        <figure className="max-w-6xl mx-auto mt-10 md:mt-12 md:px-8">
          <div className="relative aspect-[16/9] bg-gece">
            <Image src={gorselAdresi(haber.gorsel)} alt={haber.baslik} fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1200px" priority unoptimized={optimizeEdilemez(haber.gorsel)} />
          </div>
          <figcaption className="px-5 md:px-0 mt-3 text-[13px] text-kursun">Fotoğraf: 1453 İstanbul AS</figcaption>
        </figure>
      )}

      <div className="max-w-[680px] mx-auto px-5 sm:px-0 mt-10 md:mt-14 text-[17px] md:text-[19px] leading-[1.75] text-[#2A302D]">
        {paragraflar.map((paragraf, i) => (
          <p key={i} className={i === 0 ? 'first-letter:float-left first-letter:font-zarif first-letter:italic first-letter:font-semibold first-letter:text-[72px] md:first-letter:text-[88px] first-letter:leading-[0.8] first-letter:text-zumrut first-letter:pr-3 first-letter:pt-2' : 'mt-6'}>
            {paragraf}
          </p>
        ))}
        <div className="mt-12 pt-6 border-t border-cizgi md:hidden">
          <div className="text-[11px] tracking-[0.24em] text-kursun font-semibold mb-3">PAYLAŞ</div>
          <PaylasButonlari adres={tamAdres} baslik={haber.baslik} buyuk />
        </div>
      </div>

      {diger.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-20">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-al" />
            <h2 className="text-xs tracking-[0.28em] text-al font-semibold">DİĞER HABERLER</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {diger.map((h) => (
              <Link key={h.id} href={`/haberler/${h.slug}`} className="group flex gap-4 py-4 md:py-0 border-t md:border-t-0 border-cizgi">
                <div className="relative w-28 h-20 md:w-36 md:h-24 shrink-0 overflow-hidden bg-gece">
                  <HaberKapak gorsel={h.gorsel} baslik={h.baslik} sizes="150px" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-[11px] tracking-[0.2em] text-al font-semibold uppercase">{h.kategori}</span>
                  <span className="font-baslik font-bold text-zumrut text-xl leading-tight line-clamp-3 group-hover:text-al transition-colors">{h.baslik}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
