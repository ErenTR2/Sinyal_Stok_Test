# 📘 Sinyal Stok Sistemi

Sinyal Stok, firmamızın stok takibini yapmak için geliştirdiğimiz web tabanlı sistemdir.  
Amaç; Paraşüt benzeri programların stok bölümündeki eksikliklerini gidermek ve tamamen kendi kontrolümüzde, daha esnek bir çözüm sunmaktır.  

---

## 🔐 Hesap Sistemi

- **Kayıt Olma:**
  - Mail adresi otomatik **@sinyalizasyon.com** uzantılıdır. Kullanıcı yalnızca baş kısmını yazar (`ad.soyad` gibi).
  - Kullanıcı adı alanı vardır.
  - Şifre 2 kez girilir.
  - Kayıt tamamlandığında kullanıcı otomatik giriş yapar ve ana sayfaya yönlendirilir.


- **Giriş Yapma:**
  - Sadece e-posta (tam adres) ve şifre ile giriş yapılır. Kullanıcı adı ile giriş yoktur.
  - Aynı cihazdan 1 kere giriş yapılması yeterlidir. Sürekli şifre istemez.

- **Roller:**
  - **Kullanıcı:** Sadece stokları görüntüleyebilir.
  - **Depocu:** Depolar arası transfer, gelen/giden irsaliye ve stok işlemleri yapabilir.
  - **Yönetici:** Ayarları ve tüm sistemi kontrol eder, kullanıcıların rollerini düzenler.
  - İlk kayıt olanlar otomatik **Kullanıcı** rolünde olur, yönetici isterse depocuya yükseltir.

---

## 🏠 Ana Sayfa (Dashboard)

- Ana sayfada **kritik stok seviyesine düşen ürünler** listelenir.
- Kritik stok sınırları hem genel stok bazında hem de depo bazında tanımlanabilir.
- Depocu rolündekilere kendi deposundaki kritik ürünler e-posta ile gider.  
  Yöneticiler tüm kritik stokların bilgisini alır.

---

## 📦 Hizmetler ve Ürünler

- Ürünler listelenirken şu sütunlar bulunur:  
  **Malzeme Adı | Genel Stok | [Depo1] | [Depo2] | ...**
- Depo kolonları **sürükle-bırak** yöntemiyle sola/sağa kaydırılabilir.  
  Örn: Ar-Ge deposu kullanıcısı kendi deposunu en öne alabilir.
- Kullanıcı hangi cihazdan girerse girsin, kendi depo sıralaması sabit kalır.
- Ürün kartında şu bilgiler yer alır:
  - Malzeme adı  
  - Bulunduğu yer (raf vb.)  
  - Barkod  
  - Stok kodları (birden fazla olabilir)  
  - Kritik stok ayarları (hem genel hem depo bazlı)  
- Ürün geçmişinde **kim, ne zaman, hangi değişikliği yaptı** bilgisi tutulur.

---

## 🏢 Depolar

- Depo listesi görüntülenir, içine girildiğinde depo içindeki ürünler aranabilir.
- Yeni depo oluşturulurken:
  - **Genel stoğa dahil olsun mu?** (varsayılan: evet) seçeneği vardır.  
    - Örn: Sevk deposu genel stoğa dahil edilmez.
  - Depo için **kısaltma kodu** girilir. (Örn: Ar-Ge → AD)  
    - Bu kod irsaliye ve transferlerde de görünür.
- Bütün depocular tüm ürünleri görebilir.  
  Ama bir ürün kartında depo adı kendi deposuyla eşleşiyorsa, yanında **depo kısaltması** gösterilir.

---

## 🔄 Depo Hareketleri

- **Gelen İrsaliye:** Mal kabul edilen ürünler girilir.  
- **Giden İrsaliye:** Çıkışı yapılan ürünler kaydedilir.  
- **Depolar Arası Transfer:** Bir depodan diğerine ürün aktarılır.  
  - Paraşüt’te olduğu gibi iki tarih yoktur.  
  - Tek tarih/saat kaydı yeterlidir.  
- **Stok Düzeltme:** Depodaki miktar manuel güncellenebilir.  
  - Her düzeltme log’a kaydedilir: kim yaptı, ne zaman yaptı.

---

## 📝 Log Sistemi

- Her ürün ve depo için geçmiş kayıtları tutulur:  
  - Kim oluşturdu  
  - Ne zaman oluşturuldu  
  - Kim hangi değişikliği yaptı  
  - Ne şekilde değişiklik yapıldı  
- Bu sayede sistemde yapılan tüm işlemler izlenebilir.

---

## 📧 Kritik Stok Bildirimleri

- Ürün kritik seviyeye düşünce otomatik e-posta gider.  
- **Depocu rolündekiler:** yalnızca kendi deposunun kritiklerini alır.  
- **Yöneticiler:** tüm kritik stokların bilgisini alır.

---

## 👥 Roller ve Yetkiler

- **Kullanıcı:**  
  - Stokları sadece görüntüleyebilir.  
- **Depocu:**  
  - Depolar arası transfer yapabilir.  
  - Gelen/Giden irsaliye ekleyebilir.  
  - Kendi deposunun kritik stok uyarılarını alır.  
- **Yönetici:**  
  - Tüm yetkilere sahiptir.  
  - Kullanıcıların rollerini değiştirebilir.  
  - Depoları ve sistem ayarlarını düzenleyebilir.  

---

## 📌 Özet

- Kullanıcı kayıt olurken sadece `@sinyalizasyon.com` e-posta adresleri kabul edilir.
- Kayıt olan kullanıcı ana sayfaya yönlendirilir ve oturumu açık kalır.
- Ana sayfada kritik stoklar görüntülenir.  
- Ürünler bölümünde sürükle-bırak ile depo kolon sırası kişiselleştirilebilir.  
- Depo detaylarında arama yapılabilir, kritik stok seviyeleri tanımlanabilir.  
- Depo hareketleri (gelen, giden, transfer, düzeltme) loglanır.  
- Roller sayesinde kullanıcıya göre yetki sınırlandırması yapılır.  

## 🛠️ Geliştirme ve Çalıştırma

- `npm install` ile bağımlılıkları kurun.
- `node index.js` komutu ile sunucuyu başlatın.
- **GET /** – Oturum açık değilse `/giris` sayfasına yönlendirir, aksi halde karşılama sayfasını gösterir.
- **GET /giris** – Giriş formunu gösterir.
- **POST /giris** – `email` ve `password` ile oturum açar, başarılı olursa ana sayfaya yönlendirir.
- **GET /kayit** – Kayıt formunu gösterir.
- **POST /kayit** – `emailPrefix`, `username`, `password`, `confirmPassword` bilgileriyle yeni kullanıcı oluşturur, oturumu açar ve ana sayfaya yönlendirir.
- **GET /cikis** – Oturumu kapatır ve `/giris` sayfasına yönlendirir.
