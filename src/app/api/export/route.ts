import { NextResponse } from 'next/server';
import { getMaclar, getHaberler, getPuanTablosu, getGaleri, getMesajlar, getSiteAyarlari, getYonetim, getSponsorlar } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const [maclar, haberler, puan, galeri, mesajlar, siteAyarlari, yonetim, sponsorlar] = await Promise.all([
    getMaclar(), getHaberler(), getPuanTablosu(), getGaleri(),
    getMesajlar(), getSiteAyarlari(), getYonetim(), getSponsorlar(),
  ]);

  return NextResponse.json({
    maclar,
    haberler,
    'puan-tablosu': puan,
    galeri,
    mesajlar,
    'site-ayarlari': siteAyarlari,
    yonetim,
    sponsorlar,
    exportedAt: new Date().toISOString(),
  });
}