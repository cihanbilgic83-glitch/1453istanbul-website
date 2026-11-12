'use client';

import { useEffect, useState } from 'react';

type Props = { tarih: string; saat: string };

function kalaniHesapla(hedef: number) {
  const fark = Math.max(0, hedef - Date.now());
  return {
    gun: Math.floor(fark / 86_400_000),
    saat: Math.floor((fark / 3_600_000) % 24),
    dakika: Math.floor((fark / 60_000) % 60),
    saniye: Math.floor((fark / 1000) % 60),
  };
}

// Maç saatine geri sayım. Saat İstanbul saati (+03:00) kabul edilir.
export default function GeriSayim({ tarih, saat }: Props) {
  const hedef = new Date(`${tarih}T${(saat || '00:00').slice(0, 5)}:00+03:00`).getTime();
  const [kalan, setKalan] = useState<ReturnType<typeof kalaniHesapla> | null>(null);

  useEffect(() => {
    setKalan(kalaniHesapla(hedef));
    const zamanlayici = setInterval(() => setKalan(kalaniHesapla(hedef)), 1000);
    return () => clearInterval(zamanlayici);
  }, [hedef]);

  const hucreler: [string, number | undefined][] = [
    ['GÜN', kalan?.gun], ['SAAT', kalan?.saat], ['DAK', kalan?.dakika], ['SN', kalan?.saniye],
  ];

  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Maça kalan süre">
      {hucreler.map(([etiket, deger]) => (
        <div key={etiket} className="bg-zumrut text-white text-center py-2.5">
          <div className="font-baslik font-bold text-2xl rakam">{deger === undefined ? '--' : String(deger).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.16em] text-mat">{etiket}</div>
        </div>
      ))}
    </div>
  );
}
