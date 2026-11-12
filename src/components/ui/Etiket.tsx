// Bölüm üst etiketi: ince çizgi + aralıklı büyük harf ("HABERLER").
type Props = { children: React.ReactNode; renk?: 'al' | 'mat'; ortali?: boolean; className?: string };

export default function Etiket({ children, renk = 'al', ortali = false, className = '' }: Props) {
  const yazi = renk === 'al' ? 'text-al' : 'text-mat';
  const cizgi = renk === 'al' ? 'bg-al' : 'bg-mat';
  return (
    <div className={`flex items-center gap-3 ${ortali ? 'justify-center' : ''} ${className}`}>
      <span aria-hidden="true" className={`h-px w-10 ${cizgi}`} />
      <span className={`text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase ${yazi}`}>{children}</span>
      {ortali && <span aria-hidden="true" className={`h-px w-10 ${cizgi}`} />}
    </div>
  );
}
