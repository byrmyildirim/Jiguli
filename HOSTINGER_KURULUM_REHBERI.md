# Hostinger Node.js Dağıtım ve 503 Hatası Çözüm Rehberi

Bu rehber, **Jiguli Hub** projesini Hostinger (hPanel / LiteSpeed / cPanel veya VPS) ortamına yüklerken karşılaşılan **503 Service Unavailable** hatasını çözmek ve sorunsuz yayına almak için hazırlanmıştır.

---

### 1. 503 Hatasının Temel Nedenleri ve Yapılan Düzeltmeler

| Neden | Açıklama | Çözümümüz |
| :--- | :--- | :--- |
| **Derleme Eksikliği (`dist` klasörü)** | Sunucuda yalnızca kaynak kod yüklü olup `npm run build` çalıştırılmadığında Node.js frontend dosyalarını bulamayıp hata verir. | Sunucuya `dist/` klasörü derlenip eklendi ve `dist/index.html` yoksa bile çökmeyi önleyen bilgilendirme ekranı eklendi. |
| **Vite Modülü Hatası** | Üretim modunda `vite` geliştirici paketinin yüklenmeye çalışması. | Üretim ortamında (`NODE_ENV=production`) Vite statik import'u kaldırıldı, dinamik hale getirildi. |
| **Port & Unix Socket Uyuşmazlığı** | Hostinger / LiteSpeed Node.js uygulamalarında `PORT` bir soket yolu (`/tmp/lshttpd/...sock`) olabilir. | Port dinleme motoru hem sayısal portları hem de Unix soketlerini çökmeksizin yönetecek şekilde güncellendi. |
| **Giriş Dosyası Adı (Startup File)** | Hostinger varsayılan olarak `server.js`, `app.js` veya `index.js` arar. | Kök dizinde `server.js`, `app.js` ve `index.js` dosyaları oluşturuldu. |
| **Uncaught Exception (Çökme)** | Veritabanı veya ağ kesintilerinde Node sürecinin aniden sonlanması. | Süreç seviyesinde `uncaughtException` ve `unhandledRejection` koruyucuları eklendi. |

---

### 2. Hostinger hPanel Adım Adım Kurulum (Paylaşımlı / Cloud Hosting)

1. **Hostinger hPanel** > **Web Siteleri** > **Yönet** seçeneğine tıklayın.
2. Sol menüden **Gelişmiş** > **Node.js** bölümüne gidin.
3. Ayarları şu şekilde yapılandırın:
   - **Node.js Sürümü**: `20.x` veya `22.x` (React 19 için en az 18+ gereklidir).
   - **Uygulama Modu (Application Mode)**: `Production`
   - **Uygulama Kök Dizini (Application Root)**: `public_html` (veya panel klasörünüz)
   - **Uygulama Başlangıç Dosyası (Startup File)**: `server.js` (veya `app.js`)
4. **Dosyaları Yükleme**:
   - `server.js`
   - `dist` klasörü (tüm içeriğiyle)
   - `package.json`
   - `.htaccess`
   - `.env`
5. hPanel ekranındaki **NPM Install** butonuna tıklayın veya SSH terminalinde:
   ```bash
   npm install --production
   ```
6. **Uygulamayı Yeniden Başlat (Restart)** butonuna tıklayın.
7. Tarayıcınızda sitenizi açın veya sağlık kontrolünü test edin:
   `https://siteniz.com/api/health`

---

### 3. Hostinger VPS / Ubuntu Kurulumu (PM2 ile)

Hostinger VPS kullanıyorsanız:
```bash
# 1. Proje dizinine gidin
cd /var/www/jiguli

# 2. Bağımlılıkları yükleyin ve derleyin
npm install
npm run build

# 3. PM2 ile başlatın
pm2 start ecosystem.config.cjs

# 4. Yeniden başlatmalarda otomatik çalışması için kaydedin
pm2 save
pm2 startup
```

---

### 4. Allegro OAuth "Invalid Refresh Token" Çözümü

Allegro'da daha önce oluşturulan oturum anahtarının süresi dolduğunda veya yetki yenilenmesi gerektiğinde:
1. Panelde **Ayarlar > Allegro** sekmesine gidin.
2. **"OAuth ile Bağlan (charsioutlet Girişi)"** butonuna tıklayarak mağazanıza izin verin.
3. Veya [Allegro Developer Portal](https://apps.developer.allegro.pl) üzerinden aldığınız taze Bearer Token'ı **Access Token** alanına yapıştırıp **Kaydet**'e basın.
4. Token'ınız anında doğrulanır ve yayına alma işlemleri hemen aktif olur.
