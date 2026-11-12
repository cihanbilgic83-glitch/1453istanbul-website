import Image from 'next/image';
import { gorselAdresi, optimizeEdilemez } from '@/lib/gorsel';

type Props = {
  gorsel?: string;
  baslik: string;
  sizes: string;
  className?: string;
  oncelikli?: boolean;
};

// Haber kapağı: görsel yoksa kırık resim yerine kulüp logolu yedek kapak gösterir.
export default function HaberKapak({ gorsel, baslik, sizes, className = '', oncelikli = false }: Props) {
  if (!gorsel) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zumrut to-gece ${className}`}>
        <div className="relative w-[28%] max-w-[88px] aspect-square opacity-90">
          <Image src="/logo.png" alt="" fill className="object-contain drop-shadow-lg" sizes="80px" />
        </div>
      </div>
    );
  }
  return (
    <Image
      src={gorselAdresi(gorsel)}
      alt={baslik}
      fill
      sizes={sizes}
      priority={oncelikli}
      unoptimized={optimizeEdilemez(gorsel)}
      className={`object-cover ${className}`}
    />
  );
}
