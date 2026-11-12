import type { Metadata } from 'next';
import { getSiteAyarlari } from '@/lib/data';
import SayfaBasligi from '@/components/ui/SayfaBasligi';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: '1453 İstanbul AS Spor Kulübü kişisel verilerin korunması aydınlatma metni.',
};

export const dynamic = 'force-dynamic';

// 6698 sayılı KVKK'nın 10. maddesi kapsamında iletişim formu için aydınlatma metni.
export default async function KvkkPage() {
  const { iletisim } = await getSiteAyarlari();
  return (
    <div className="bg-fildisi">
      <SayfaBasligi etiket="Yasal" baslik="KVKK aydınlatma metni" />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 md:py-20 text-[16px] leading-[1.8] text-[#2A302D] space-y-6">
        <p>
          1453 İstanbul AS Spor Kulübü (&quot;Kulüp&quot;) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
          kapsamında veri sorumlusu sıfatıyla, internet sitemiz üzerinden bize ilettiğiniz kişisel verileri aşağıda açıklanan
          çerçevede işlemekteyiz.
        </p>
        <h2 className="font-baslik font-bold uppercase text-2xl text-zumrut pt-4">İşlenen kişisel veriler</h2>
        <p>İletişim formu aracılığıyla paylaştığınız ad soyad, e-posta adresi, telefon numarası, mesaj konusu ve mesaj içeriğiniz.</p>
        <h2 className="font-baslik font-bold uppercase text-2xl text-zumrut pt-4">İşleme amaçları</h2>
        <p>
          Talep, soru ve başvurularınızı (altyapı seçmeleri, üyelik, sponsorluk ve benzeri) değerlendirmek ve size dönüş
          yapmak. Verileriniz bu amaç dışında kullanılmaz ve pazarlama amacıyla üçüncü kişilerle paylaşılmaz.
        </p>
        <h2 className="font-baslik font-bold uppercase text-2xl text-zumrut pt-4">Hukuki sebep ve toplama yöntemi</h2>
        <p>
          Verileriniz, internet sitemizdeki iletişim formu aracılığıyla elektronik ortamda, KVKK&apos;nın 5. maddesinde
          belirtilen açık rızanız ve meşru menfaatimiz hukuki sebeplerine dayanılarak toplanır.
        </p>
        <h2 className="font-baslik font-bold uppercase text-2xl text-zumrut pt-4">Aktarım</h2>
        <p>
          Verileriniz, sitenin barındırma ve veri saklama hizmetlerini sağlayan iş ortaklarımızın sunucularında saklanır.
          Bu hizmet sağlayıcıların sunucuları yurt dışında bulunabilir.
        </p>
        <h2 className="font-baslik font-bold uppercase text-2xl text-zumrut pt-4">Haklarınız</h2>
        <p>
          KVKK&apos;nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme,
          düzeltilmesini ya da silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Başvurularınızı
          {iletisim.email ? <> <a href={`mailto:${iletisim.email}`} className="text-zumrut font-semibold underline">{iletisim.email}</a> adresine</> : ' kulübümüze'} iletebilirsiniz.
        </p>
        {iletisim.adres && <p className="text-sm text-kursun pt-4 border-t border-cizgi">Veri sorumlusu: 1453 İstanbul AS Spor Kulübü · {iletisim.adres}</p>}
      </div>
    </div>
  );
}
