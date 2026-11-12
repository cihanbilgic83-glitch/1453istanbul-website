import Link from 'next/link';
import YildizDeseni from '@/components/ui/YildizDeseni';

export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] bg-gece text-krem overflow-hidden flex items-center">
      <YildizDeseni kimlik="bulunamadi-deseni" />
      <div className="relative max-w-3xl mx-auto px-5 text-center pt-28 pb-16">
        <div className="font-zarif italic font-semibold text-mat text-[120px] md:text-[180px] leading-none">404</div>
        <h1 className="mt-2 font-baslik font-bold uppercase text-white text-4xl md:text-5xl">Aradığınız sayfa bulunamadı</h1>
        <p className="mt-4 text-[#B9C2B8]">Sayfa taşınmış ya da kaldırılmış olabilir.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-mat text-gece px-7 py-3.5 font-semibold hover:bg-krem">Anasayfaya dön</Link>
          <Link href="/haberler" className="border border-krem/50 text-white px-7 py-3.5 font-medium hover:border-white">Haberler</Link>
        </div>
      </div>
    </section>
  );
}
