import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { savePuanTablosu } from '@/lib/data';
import { getSession } from '@/lib/session';
import type { PuanTablosu } from '@/lib/types';

const TFF_URL = 'https://tffistanbul.org/puantaj-ve-fikstur/2025-2026/2-amator-lig/29/3/5892';

function toTitleCase(str: string): string {
  return str.toLocaleLowerCase('tr-TR').replace(/(?:^|\s)\S/g, ch => ch.toLocaleUpperCase('tr-TR'));
}

// TFF adı (küçük harf, normalize) → bizim kullandığımız ad
const DUZELTME: Record<string, string> = {
  '1453 istanbul as spor': '1453 İstanbul AS',
};

export async function POST(req: Request) {
  const session = await getSession();
  const cronSecret = req.headers.get('x-cron-secret');
  if (!session.isLoggedIn && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const html = await fetch(TFF_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Referer': 'https://tffistanbul.org/',
      },
      next: { revalidate: 0 },
    }).then(r => r.text());

    const $ = cheerio.load(html);
    const yeniPuan: PuanTablosu[] = [];
    let sira = 0;

    // Yeterli sütunlu tüm tr satırlarını tara
    $('table tr').each((_, el) => {
      const td = $(el).find('td');
      if (td.length < 8) return;

      // Türkçe harf içeren ilk hücreyi takım adı olarak al
      let takimHam = '';
      let nameCol = -1;
      for (let i = 0; i < Math.min(4, td.length); i++) {
        const txt = ($(td[i]).find('a').text() || $(td[i]).text()).replace(/\s+/g, ' ').trim();
        if (/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(txt) && txt.length > 2) {
          // "01 TAKIM ADI" → "TAKIM ADI" (sadece 1-2 haneli sayı + boşluk)
          takimHam = txt.replace(/^\d{1,2} /, '').trim();
          nameCol = i;
          break;
        }
      }
      if (!takimHam || nameCol < 0) return;

      // TFF adını normalize edip düzeltme tablosuna bak
      const key = takimHam.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
      const takim = DUZELTME[key] ?? toTitleCase(takimHam);

      // Sayısal sütunlar (takım adından sonra): O G B M A Y P AV E
      const b = nameCol + 1;
      const n = (off: number) => parseInt($(td[b + off]).text().trim()) || 0;
      const o = n(0), g = n(1), bVal = n(2), m = n(3);
      const ag = n(4), yg = n(5), puan = n(6);
      const av = ag - yg;

      if (o === 0 && g === 0 && puan === 0) return;

      sira++;
      yeniPuan.push({ id: `tff-${sira}`, takim, o, g, b: bVal, m, ag, yg, av, puan, form: [] });
    });

    if (yeniPuan.length === 0) {
      return NextResponse.json({ error: 'Satır parse edilemedi', html_preview: html.slice(0, 1500) }, { status: 422 });
    }

    yeniPuan.sort((a, b) => b.puan - a.puan || b.av - a.av);
    await savePuanTablosu(yeniPuan);

    return NextResponse.json({ success: true, count: yeniPuan.length, takimlar: yeniPuan.map(t => t.takim) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}