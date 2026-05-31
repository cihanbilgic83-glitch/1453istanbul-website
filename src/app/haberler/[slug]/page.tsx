import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHaberler } from '@/lib/data';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getHaberler().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const haber = getHaberler().find((h) => h.slug === slug);
  if (!haber) return { title: 'Haber Bulunamadı' };
  return { title: haber.baslik, description: haber.ozet };
}

export default async function HaberDetayPage({ params }: Props) {
  const { slug } = await params;
  const haber = getHaberler().find((h) => h.slug === slug);
  if (!haber) notFound();

  const diger = getHaberler().filter((h) => h.slug !== slug).slice(0, 3);
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
        {/* Ana Görsel */}
        {haber.gorsel && (
          <div className="relative aspect-video rounded-xl overflow-hidden card-shadow mb-8">
            <Image src={haber.gorsel} alt={haber.baslik} fill className="object-cover" unoptimized />
          </div>
        )}

        {/* İçerik */}
        <div className="bg-white rounded-xl card-shadow border border-gray-100 p-6 md:p-8 mb-10">
          <p className="text-gray-600 text-base leading-relaxed italic mb-6 pb-6 border-b border-gray-100">
            {haber.ozet}
          </p>
          <div className="prose prose-gray max-w-none">
            {haber.icerik.split('\n\n').map((paragraf: string, i: number) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraf}</p>
            ))}
          </div>
        </div>

        {/* Diğer Haberler */}
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
                    <Image src={h.gorsel} alt={h.baslik} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="200px" unoptimized />
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