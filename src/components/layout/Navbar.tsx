'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Anasayfa' },
  { href: '/kulup', label: 'Kulüp' },
  { href: '/fikstur', label: 'Fikstür' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/haberler', label: 'Haberler' },
  { href: '/iletisim', label: 'İletişim' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#1A4D2E] ${scrolled ? 'shadow-lg shadow-green-900/30' : ''}`}>
      {/* Üst kırmızı şerit */}
      <div className="h-1 bg-[#C0392B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-11 md:h-11 bg-white rounded-full p-1 shadow-md">
              <Image
                src="/logo.png"
                alt="1453 İstanbul AS"
                fill
                className="object-contain p-0.5"
                sizes="44px"
              />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">1453 İstanbul</div>
              <div className="text-green-200 text-xs">AS Spor Kulübü</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[#C0392B] text-white shadow-md'
                    : 'text-green-100 hover:text-white hover:bg-white/15'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-green-100 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Menü"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#163d24] border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-[#C0392B] text-white'
                  : 'text-green-100 hover:text-white hover:bg-white/15'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}