# 📦 Sinyal Stok Sistemi  

Sinyal Stok Sistemi, firmaların stoklarını kolayca yönetebilmesi için geliştirilmiş web tabanlı bir stok takip ve yönetim yazılımıdır.  
Bu sistemde kullanıcı rolleri, doğrulama mekanizmaları, depo bazlı yönetim ve detaylı raporlama özellikleri yer almaktadır.  

---

## 🔐 Kullanıcı Hesap Yönetimi  

### 📝 Kayıt Olma  
- Mail adresi **otomatik** `@sinyalizasyon.com` uzantılı olacak.  
- Kullanıcı sadece mailin baş kısmını yazacak.  
- Ad Soyad alanı olacak.  
- Şifre **2 kez** girilecek.  
- Kayıt sonrası kullanıcıya **e-posta doğrulama kodu** gönderilecek.  
- Doğrulama kodu girildiğinde hesap aktif olacak ve **ana sayfaya yönlendirme** yapılacak.  
- Kayıt ekranında:  
  - "Zaten hesabın var mı? Giriş Yap" butonu ile kolay geçiş olacak.  

### 🔑 Giriş Yapma  
- Mail adresi ve şifre ile giriş yapılacak.  
- Mail adresinde yine `@sinyalizasyon.com` otomatik olacak, kullanıcı sadece baş kısmı girecek.  
- "Hesabın yok mu? Kayıt Ol" butonu ile kayıt sayfasına geçilebilecek.  

### 👤 Profil Sayfası  
- Profil resmi, Ad Soyad ve Mail adresi gözükecek.  
- Kullanıcı **adını ve mailini değiştiremeyecek**.  
- **Yönetici rolü** kullanıcıların adı, maili ve rolünü düzenleyebilecek.  
- Profil resmi değiştirme özelliği olacak.  
- Şifre değiştirme:  
  - Mevcut şifre + 2 kez yeni şifre.  
  - Doğrulama kodu maile gelecek ve girildiğinde şifre değişecek.  

### 🚪 Oturum Yönetimi  
- Çıkış yapılmadığı sürece girişte **otomatik ana sayfaya yönlendirme** yapılacak.  
- Çıkış yapılırsa giriş ekranına yönlendirilecek.  

---

## 🏠 Ana Sayfa  

### 🔍 Arama  
- Üst kısımda arama çubuğu olacak.  
- Arama yapıldığında **Ürünler Sayfası** açılacak ve sonuçlar listelenecek.  

### 📊 Hızlı Kutular  
- Yan yana 3 kutu:  
  1. **Ürünler** → Ürünler sayfasına gider.  
  2. **Kritik Stok** → Kritik stok sayfasına gider. (Yazılar kırmızı)  
  3. **7 Günlük Hareket** → Son 7 gün raporları.  
- Kutuların altında sayılar olacak (ör: Kritik stok altında **30** yazacak).  

### 📉 İçerik Alanı  
- **Sağ taraf (2/3 ekran):** Kritik stok listesi + "Tümünü Görüntüle".  
- **Sol taraf (1/3 ekran):**  
  - **Hızlı İşlemler:**  
    - Kullanıcı: Depolar, Depolar Arası Transfer  
    - Depocu: Gelen Ürünler, Giden Ürünler, Stok Düzeltme  
  - **Raporlar:**  
    - Günlük Hareket Raporu  
    - Kritik Stok Raporu  
    - Depo Bazlı Envanter Raporu  

### 🕒 Son Hareketler  
- En son yapılan **10 işlem** listelenecek.  
- "Tümünü Görüntüle" ile geçmiş tüm hareketler açılacak.  

---

## 📦 Ürünler  

- Üstte **Arama**, **Filtre**, **Sıralama** butonları.  
- **Filtre:** Depolar listesi (tikli/kapalı yapılabilir).  
- **Sıralama:** A-Z, Z-A, Stok Artan/Azalan.  
- Liste:  
  - Resim  
  - Malzeme Adı  
  - Genel Stok  
  - Depo bazlı stoklar (sürükle-bırak sırası değiştirilebilir).  
- Ürün adına tıklayınca **Ürün Detay Sayfası** açılacak.  

### 📝 Ürün Detay Sayfası  
- Ürün adı  
- Genel stok miktarı  
- Depo bazlı stok  
- Malzeme yeri  
- Stok kodu  
- Barkod numarası  
- Stok hareketleri  
- **Düzenle butonu** (sadece yönetici)  
  - Malzeme adı  
  - Stok kodu  
  - Barkod  
  - Kritik stok miktarı  
  - Depo bazlı ayarlar  
  - Kategori seçimi  
  - Resim yükleme  

---

## 🏭 Depolar  

- Depo listesi olacak.  
- Sağ üstte **Depo Oluştur** butonu (sadece yöneticiler görecek).  
- Depo oluştururken:  
  - Depo adı  
  - "Genel stoğu etkilesin mi?" tiki (varsayılan açık, sadece yöneticiler kapatabilir).  
- Her deponun yanında **düzenle butonu** (sadece yöneticiler).  
- Depoya girince:  
  - Ürün arama  
  - Liste: Ürün resmi, adı, miktarı.  
  - Ürün adına tıklayınca ürün detayına gidilecek.  

---

## 🔄 Depolar Arası Transfer  

- Geçmiş transferler listesi:  
  - Transfer adı  
  - Çıkış deposu  
  - Giriş deposu  
  - Tarih / Saat  
- Sağ üstte **Yeni Transfer Fişi** butonu (sadece depocu).  
- Transfer fişi içeriği:  
  - Transfer adı  
  - Çıkış / Giriş deposu seçimi  
  - Teslim eden / Teslim alan bilgileri  
  - Tarih seçimi  
  - Malzeme ekleme (stoktan seç veya yeni oluştur)  
  - Kaydet / Vazgeç butonları  
- Transfer detayında:  
  - Düzenle, Yazdır, Sil butonları  
  - Yazdır: PDF oluşturma + özel not ekleme  

---

## 📥 Gelen Ürünler  

- Liste halinde gelen ürün fişleri.  
- Sol: Fiş adı + Firma, Sağ: Tarih/Saat.  
- Sağ üstte **Yeni Gelen Ürün Fişi** butonu (sadece depocu ve yönetici).  
- Detay:  
  - Fiş adı  
  - Firma  
  - Tarih  
  - Ürün listesi (Resim, Adı, Depo, Miktar, Birim)  
  - Düzenle, Yazdır, Sil butonları  

---

## 📤 Giden Ürünler  

- Liste halinde giden ürün fişleri.  
- Sol: Fiş adı + Firma, Sağ: Tarih/Saat.  
- Sağ üstte **Yeni Giden Ürün Fişi** butonu (sadece depocu ve yönetici).  
- Detay:  
  - Fiş adı  
  - Firma  
  - Tarih  
  - Ürün listesi (Resim, Adı, Depo, Miktar, Birim)  
  - Düzenle, Yazdır, Sil butonları  

---

## ⚙️ Stok Düzeltme  

- Liste:  
  - Malzeme adı  
  - Mevcut stok  
  - Depo  
  - Yeni stok / Artır / Azalt alanları  
- Filtre: Depolar seçilebilir.  
- Sıralama: A-Z, Z-A, Stok artan/azalan.  
- Kaydet → "Stok güncelleme başarılı" popup → Ana sayfaya dönüş.  
- Vazgeç → Ana sayfaya dönüş.  

---

## 🛠️ Yönetici Ayarları  

- Profil yanında **Ayarlar** butonu (sadece yönetici).  
- 3 sekme:  
  1. Genel Ayarlar (boş, ileride eklenecek).  
  2. Depo Ayarları  
     - Tüm depolar listelenir.  
     - "Genel stoğu etkilesin mi?" ayarı yapılabilir.  
  3. Kullanıcılar  
     - Tüm kullanıcılar listelenir.  
     - Üzerine tıklanınca profil sayfasına gider.  
     - Yönetici kullanıcı bilgilerini değiştirebilir.  

---
