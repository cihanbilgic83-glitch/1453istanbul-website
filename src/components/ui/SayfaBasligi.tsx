import Image from 'next/image';
import Etiket from './Etiket';
import YildizDeseni from './YildizDeseni';

type Props = { etiket: string; baslik: string; aciklama?: string };

// İç sayfaların başlığı: kulüp fotoğrafı üzerinde koyu yeşil ton, altın etiket, dar büyük başlık.
export default function SayfaBasligi({ etiket, baslik, aciklama }: Props) {
  return (
    <header className="relative overflow-hidden bg-gece">
      <Image src="/img/sayfa-basligi.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_30%] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-gece via-gece/90 to-gece/60" />
      <YildizDeseni kimlik="baslik-deseni" opaklik={0.06} />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-36 pb-14 md:pt-44 md:pb-20">
        <Etiket renk="mat">{etiket}</Etiket>
        <h1 className="mt-4 font-baslik font-extrabold uppercase text-white text-5xl sm:text-6xl md:text-7xl leading-[0.92]">{baslik}</h1>
        {aciklama && <p className="mt-4 max-w-2xl font-zarif italic text-xl md:text-2xl text-krem">{aciklama}</p>}
      </div>
      <div className="tezhip relative" />
    </header>
  );
}
