import type { Metadata } from 'next';

// Yönetim paneli arama motorlarında görünmesin.
export const metadata: Metadata = {
  title: 'Yönetim Paneli',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
