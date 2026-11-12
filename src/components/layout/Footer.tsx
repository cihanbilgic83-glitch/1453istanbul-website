import Link from 'next/link';
import Image from 'next/image';
import { getSiteAyarlari } from '@/lib/data';
import { gecerliWebAdresi } from '@/lib/link';
import YildizDeseni from '@/components/ui/YildizDeseni';

const kulupBaglantilari = [
  { href: '/kulup', label: 'Tarihçe ve Yönetim' },
  { href: '/fikstur', label: 'Fikstür ve Puan Durumu' },
  { href: '/haberler', label: 'Haberler' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/iletisim?konu=Altyap%C4%B1', label: 'Altyapı Seçmeleri' },
  { href: '/iletisim?konu=Sponsorluk', label: 'Sponsorluk' },
];

export default async function Footer() {
  const yil = new Date().getFullYear();
  const { iletisim, sosyal_medya, footer_aciklama } = await getSiteAyarlari();

  const sosyal = [
    { ad: 'Instagram', adres: gecerliWebAdresi(sosyal_medya.instagram) },
    { ad: 'X', adres: gecerliWebAdresi(sosyal_medya.twitter) },
    { ad: 'Facebook', adres: gecerliWebAdresi(sosyal_medya.facebook) },
    { ad: 'YouTube', adres: gecerliWebAdresi(sosyal_medya.youtube) },
  ].filter((s): s is { ad: string; adres: string } => Boolean(s.adres));

  return (
    <footer className="relative mt-auto bg-gece text-[#B9C2B8] overflow-hidden">
      <div className="tezhip" />
      <YildizDeseni kimlik="altbilgi-deseni" opaklik={0.05} />
      <span aria-hidden="true" className="absolute -right-4 -bottom-16 md:-bottom-24 font-zarif italic font-semibold text-[160px] md:text-[300px] leading-none text-mat/[0.08] select-none">1453</span>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-sm leading-7">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative w-12 h-12"><Image src="/logo.png" alt="1453 İstanbul AS arması" fill sizes="48px" className="object-contain" /></span>
              <span className="font-baslik font-bold text-white text-xl tracking-[0.04em]">1453 İSTANBUL AS</span>
            </Link>
            <p className="mt-4 text-krem/90">
              {footer_aciklama || "İstanbul'un fethinden ilham alan güçlü bir futbol geleneği."}
            </p>
          </div>

          <div>
            <h2 className="text-mat text-xs font-semibold tracking-[0.2em] mb-3">KULÜP</h2>
            <ul>
              {kulupBaglantilari.map((b) => (
                <li key={b.href}><Link href={b.href} className="hover:text-white transition-colors">{b.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-mat text-xs font-semibold tracking-[0.2em] mb-3">TAKİP EDİN</h2>
            <ul>
              {sosyal.length > 0 ? sosyal.map((s) => (
                <li key={s.ad}><a href={s.adres} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{s.ad}</a></li>
              )) : <li>Sosyal medya hesaplarımız yakında.</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-mat text-xs font-semibold tracking-[0.2em] mb-3">İLETİŞİM</h2>
            <ul>
              {iletisim.adres && <li>{iletisim.adres}</li>}
              {iletisim.telefon && <li><a href={`tel:${iletisim.telefon.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{iletisim.telefon}</a></li>}
              {iletisim.email && <li><a href={`mailto:${iletisim.email}`} className="hover:text-white transition-colors break-all">{iletisim.email}</a></li>}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-krem/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {yil} 1453 İstanbul AS Spor Kulübü. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Yönetim Paneli</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
