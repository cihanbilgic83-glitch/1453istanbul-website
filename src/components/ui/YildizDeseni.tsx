// Sekiz köşeli yıldız (Osmanlı geometrisi) dokusu. Koyu zeminlerde çok düşük opaklıkla kullanılır.
type Props = { kimlik: string; boyut?: number; opaklik?: number };

export default function YildizDeseni({ kimlik, boyut = 72, opaklik = 0.07 }: Props) {
  const yarim = boyut / 2;
  const kenar = boyut * 0.42;
  const bas = yarim - kenar / 2;
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: opaklik }}>
      <defs>
        <pattern id={kimlik} width={boyut} height={boyut} patternUnits="userSpaceOnUse">
          <rect x={bas} y={bas} width={kenar} height={kenar} fill="none" stroke="#C9A227" strokeWidth="1.2" />
          <rect x={bas} y={bas} width={kenar} height={kenar} fill="none" stroke="#C9A227" strokeWidth="1.2" transform={`rotate(45 ${yarim} ${yarim})`} />
          <circle cx={yarim} cy={yarim} r={boyut * 0.055} fill="none" stroke="#C9A227" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${kimlik})`} />
    </svg>
  );
}
