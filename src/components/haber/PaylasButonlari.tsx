'use client';

import { useState } from 'react';

type Props = { adres: string; baslik: string; buyuk?: boolean };

// WhatsApp / X paylaşımı ve link kopyalama.
export default function PaylasButonlari({ adres, baslik, buyuk = false }: Props) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const metin = encodeURIComponent(`${baslik} ${adres}`);

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(adres);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      setKopyalandi(false);
    }
  };

  const temel = `border border-[#C8BFA6] text-zumrut font-medium hover:border-zumrut transition-colors text-center ${buyuk ? 'py-3.5' : 'px-4 py-2 text-sm'}`;
  return (
    <div className={buyuk ? 'grid grid-cols-3 gap-2' : 'flex flex-wrap justify-center gap-2'}>
      <a href={`https://wa.me/?text=${metin}`} target="_blank" rel="noopener noreferrer"
        className={buyuk ? 'bg-zumrut text-white font-semibold text-center py-3.5 hover:bg-gece transition-colors' : temel}>
        {buyuk ? 'WhatsApp' : "WhatsApp'ta paylaş"}
      </a>
      <a href={`https://x.com/intent/post?text=${metin}`} target="_blank" rel="noopener noreferrer" className={temel}>X</a>
      <button type="button" onClick={kopyala} className={temel} aria-live="polite">{kopyalandi ? 'Kopyalandı' : buyuk ? 'Kopyala' : 'Linki kopyala'}</button>
    </div>
  );
}
