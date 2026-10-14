# Jiguli Canlı Ortam & MySQL Veritabanı Dağıtım Kılavuzu

Bu belge, Jiguli E-Ticaret Entegrasyon Suite'inin AI Studio ortamından bağımsızlaştırılarak canlı sunucuda (VPS, Docker, Cloud veya Dedicated Server) **MySQL Veritabanı** ile çalıştırılması için gerekli tüm yönergeleri içerir.

---

## 1. Geri Dönüş Noktası (Rollback Safety)

Veritabanı mimarisi ve canlı entegrasyon öncesi durum GitHub ve yerel depoda kilitlenmiştir:

- **Yedek Dal (Branch):** `backup/pre-database-migration`
- **Etiket (Tag):** `rollback-pre-db-v1`

Eski sürüme dönmek isterseniz:
```bash
# Dal üzerinden geri dönme:
git checkout backup/pre-database-migration

# Veya mevcut dalı tam etiket anına sıfırlama:
git reset --hard rollback-pre-db-v1
```

---

## 2. İlk Kurulum Sihirbazı (Onboarding Wizard)

Sistem canlı ortamda ilk defa ayağa kalktığında (`http://SUNUCU_IP_VEYA_DOMAIN:3000`):

1. **Otomatik Algılama:** Sistem `GET /api/system/status` sorgulayarak veritabanının ve yönetici hesabının mevcut olup olmadığını kontrol eder.
2. **Kurulum Ekranı:** Eğer veritabanı henüz bağlanmamış veya kullanıcı açılmamışsa, kullanıcı doğrudan **Jiguli İlk Kurulum Sihirbazı** ekranına yönlendirilir.
3. **Adımlar:**
   - **Adım 1:** Hoş geldiniz ve mimari tanıtımı.
   - **Adım 2 (MySQL Bağlantısı):** Sunucu Adresi (Host), Port (3306), Veritabanı Adı, Kullanıcı Adı ve Şifre girilir. "Bağlantıyı Test Et" butonu ile canlı ping ve sürüm testi yapılır.
   - **Adım 3 (Tablolar & Şema):** 11 adet kurumsal MySQL tablosu otomatik oluşturulur:
     - `jiguli_users` (Yöneticiler & Personel)
     - `jiguli_db_config` (Sistem parametreleri)
     - `jiguli_api_credentials` (Allegro, eMAG, BaseLinker API anahtarları & tokenlar)
     - `jiguli_products` (Master ürün kataloğu)
     - `jiguli_offers` (Pazaryeri listeleri, fiyatlar, stoklar, senkronizasyon durumları)
     - `jiguli_orders` (Pazaryeri siparişleri, alıcı bilgileri, kargo, ödeme)
     - `jiguli_order_items` (Sipariş kalemleri)
     - `jiguli_categories` (Kategori eşlemeleri)
     - `jiguli_repricer_rules` (BuyBox ve dinamik fiyatlandırma kuralları)
     - `jiguli_automations` (İş akışı otomasyonları)
     - `jiguli_sync_logs` (Canlı API istek/yanıt kayıtları)
   - **Adım 4 (Yönetici Hesabı):** İlk Süper Yönetici için Kullanıcı Adı, E-Posta, İsim Soyisim ve Giriş Şifresi belirlenir. Şifre PBKDF2/SHA-512 ile güvenli şekilde hash'lenerek `jiguli_users` tablosuna kaydedilir.
   - **Adım 5 (Tamamlandı):** Veritabanı ayarları sunucudaki `data/db_config.json` ve `.env` dosyalarına kalıcı olarak işlenir. Panele otomatik giriş yapılır.

---

## 3. Canlı Sunucuya Kurulum Yöntemleri

### Yöntem A: Docker Compose ile Tek Tıkla Kurulum (Önerilen)

Sunucunuzda Docker ve Docker Compose kuruluysa:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/byrmyildirim/Jiguli.git
cd Jiguli

# 2. Docker container'larını başlatın (MySQL 8.0 + Jiguli Node 22)
docker compose up -d --build

# 3. Logları takip edin
docker compose logs -f
```

Bu yöntemle MySQL 8.0 otomatik ayağa kalkar, `jiguli_db` veritabanı oluşturulur ve `http://SUNUCU_IP:3000` adresinden sisteminiz yayına başlar.

---

### Yöntem B: Doğrudan VPS / Ubuntu / Debian Üzerinde Çalıştırma

```bash
# 1. Bağımlılıkları yükleyin
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server git

# 2. MySQL veritabanı ve kullanıcısını oluşturun
sudo mysql
CREATE DATABASE jiguli_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jiguli_user'@'localhost' IDENTIFIED BY 'GucluSifre2026!';
GRANT ALL PRIVILEGES ON jiguli_db.* TO 'jiguli_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 3. Projeyi klonlayın ve kurun
git clone https://github.com/byrmyildirim/Jiguli.git
cd Jiguli
npm install

# 4. Frontend derleyin
npm run build

# 5. PM2 ile arka planda 7/24 çalıştırın
sudo npm install -g pm2 tsx
pm2 start server.ts --name jiguli --interpreter tsx
pm2 save
pm2 startup
```

---

## 4. Nginx Reverse Proxy & SSL (HTTPS) Yapılandırması

Canlı alan adınız için (`ornek: app.jiguli.pro`):

```nginx
server {
    listen 80;
    server_name app.jiguli.pro;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL sertifikası için:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d app.jiguli.pro
```

---

## 5. API ve Veritabanı Uç Noktaları

| Uç Nokta | Metot | Açıklama |
|---|---|---|
| `/api/system/status` | GET | Sistemin kurulum durumunu ve DB sağlığını döndürür |
| `/api/system/install` | POST | DB bağlantısını kaydeder, tabloları ve admin hesabını açar |
| `/api/auth/login` | POST | `jiguli_users` tablosundan şifre doğrular ve giriş yapar |
| `/api/db/offers` | GET / POST | Teklifleri veritabanından çeker / veritabanına kaydeder |
| `/api/db/offers/:id` | DELETE | Teklifi veritabanından kalıcı olarak siler |
| `/api/db/orders` | GET / POST | Siparişleri veritabanından çeker / kaydeder |
| `/api/db/credentials` | GET / POST | Allegro/eMAG/BaseLinker API anahtarlarını DB'den yönetir |
| `/api/db/categories` | GET / POST | Kategori eşlemelerini DB'den yönetir |
| `/api/db/repricer` | GET / POST | BuyBox kurallarını DB'den yönetir |
| `/api/db/automations` | GET / POST | İş akışı otomasyonlarını DB'den yönetir |
| `/api/db/logs` | GET / POST | Canlı API loglarını DB'ye işler |
