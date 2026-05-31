import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ImgBB API anahtarı bulunamadı.' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    // Dosyayı base64'e çevir
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // ImgBB'ye yükle
    const imgbbForm = new FormData();
    imgbbForm.append('key', apiKey);
    imgbbForm.append('image', base64);
    imgbbForm.append('name', file.name.replace(/\.[^.]+$/, ''));

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm,
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ error: 'ImgBB yükleme başarısız.', detail: data }, { status: 500 });
    }

    return NextResponse.json({
      url: data.data.url,
      display_url: data.data.display_url,
      thumb: data.data.thumb?.url ?? data.data.url,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}