import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getHaberler, haberiBul } from '@/lib/data';
import HaberKapak from '@/components/haber/HaberKapak';
import { gorselAdresi, optimizeEdilemez } from '@/lib/gorsel';

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

  return (
    <div className="pt-20 bg-[#f8f9fa] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A4D2E] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/haberler" className="inline-flex items-center gap-1 text-green-200 hover:text-white text-sm mb-4 transition-colors">
            ← Haberlere Dön
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#C0392B] text-white text-xs px-2.5 py-1 rounded-full font-semibold">{haber.kategori}</span>
            <span className="text-green-200 text-xs">{formatDate(haber.tarih)}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{haber.baslik}</h1>
          {haber.yazar && <p className="text-green-200 text-sm mt-2">Yazar: {haber.yazar}</p>}
        </div>
      </div>
      <div className="h-1 bg-[#C0392B]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {haber.gorsel && (
          <div className="relative aspect-video rounded-xl overflow-hidden card-shadow mb-8">
            <Image src={gorselAdresi(haber.gorsel)} alt={haber.baslik} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" priority unoptimized={optimizeEdilemez(haber.gorsel)} />
          </div>
        )}

        <div className="bg-white rounded-xl card-shadow border border-gray-100 p-6 md:p-8 mb-10">
          {haber.ozet && (
            <p className="text-gray-600 text-base leading-relaxed italic mb-6 pb-6 border-b border-gray-100">
              {haber.ozet}
            </p>
          )}
          <div className="prose prose-gray max-w-none">
            {haber.icerik.split('\n\n').map((paragraf: string, i: number) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraf}</p>
            ))}
          </div>
        </div>

        {diger.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Diğer <span className="text-[#C0392B]">Haberler</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {diger.map((h) => (
                <Link key={h.id} href={`/haberler/${h.slug}`}
                  className="group bg-white rounded-xl overflow-hidden card-shadow border border-gray-100 hover:border-[#1A4D2E]/30 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="relative h-36 overflow-hidden">
                    <HaberKapak gorsel={h.gorsel} baslik={h.baslik} className="group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 280px" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 group-hover:text-[#1A4D2E] text-sm line-clamp-2 transition-colors">{h.baslik}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(h.tarih)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}