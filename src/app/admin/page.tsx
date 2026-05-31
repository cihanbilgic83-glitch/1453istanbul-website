'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [hata, setHata] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const girisYap = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setHata('Kullanıcı adı veya şifre hatalı.');
      }
    } catch {
      setHata('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src="/logo.png" alt="1453 İstanbul AS" fill className="object-contain" sizes="80px" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Girişi</h1>
          <p className="text-gray-500 text-sm mt-1">1453 İstanbul AS Yönetim Paneli</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-7">
          <form onSubmit={girisYap} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-[#f8f9fa] placeholder-gray-400"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Şifre
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-[#f8f9fa] placeholder-gray-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {hata && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {hata}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A4D2E] hover:bg-[#163d24] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-[#1A4D2E] transition-colors">
              ← Siteye Dön
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} 1453 İstanbul AS
        </p>
      </div>
    </div>
  );
}