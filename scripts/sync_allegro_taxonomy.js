import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'allegro_taxonomy.json');

const clientId = process.env.ALLEGRO_CLIENT_ID || 'f2aaccb04bc146e4a6832179f10a12c3';
const clientSecret = process.env.ALLEGRO_CLIENT_SECRET || 'YAaC1OJpbFLPYg7npUT8ZVuLIO0uxUiFmI7rZxQU4TwPCr1VTbSuNZ2qhmpZxTBl';
const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

// Common translations for Allegro categories
export const COMMON_TR_TRANSLATIONS = {
  'Dom i Ogród': 'Ev ve Bahçe',
  'Dziecko': 'Bebek ve Çocuk',
  'Elektronika': 'Elektronik',
  'Firma i usługi': 'İş ve Hizmetler',
  'Kolekcje i sztuka': 'Koleksiyon ve Sanat',
  'Kultura i rozrywka': 'Kültür ve Eğlence',
  'Moda': 'Moda ve Giyim',
  'Motoryzacja': 'Otomotiv ve Araç',
  'Nieruchomości': 'Emlak',
  'Sport i turystyka': 'Spor ve Doğa Sporları',
  'Supermarket': 'Süpermarket ve Petshop',
  'Uroda': 'Kozmetik ve Kişisel Bakım',
  'Zdrowie': 'Sağlık ve Medikal',
  'Budownictwo i Akcesoria': 'Yapı Market ve İnşaat',
  'Meble': 'Mobilya',
  'Narzędzia': 'El Aletleri ve Makineler',
  'Ogród': 'Bahçe ve Çevre Düzenleme',
  'Oświetlenie': 'Aydınlatma',
  'Wyposażenie': 'Ev Gereçleri ve Düzenleyiciler',
  'Artykuły dla zwierząt': 'Evcil Hayvan Ürünleri',
  'Dla psów': 'Köpek Ürünleri',
  'Dla kotów': 'Kedi Ürünleri',
  'Legowiska': 'Evcil Hayvan Yatakları ve Minderler',
  'Legowiska i budki': 'Kedi/Köpek Yatakları ve Kulübeleri',
  'Komputery': 'Bilgisayar ve Tablet',
  'Telefony i Akcesoria': 'Telefon ve GSM Aksesuarları',
  'Sprzęt audio': 'Ses Sistemleri ve Kulaklıklar',
  'Słuchawki': 'Kulaklıklar',
  'Bezprzewodowe': 'Kablosuz / Bluetooth Kulaklıklar',
  'Kable': 'Kablolar',
  'Ładowarki': 'Şarj Cihazları ve Adaptörler',
  'Smartwatche i opaski': 'Akıllı Saat ve Bileklikler',
  'Smartwatche': 'Akıllı Saatler',
  'Odzież męska': 'Erkek Giyim',
  'Odzież damska': 'Kadın Giyim',
  'Bielizna męska': 'Erkek İç Giyim',
  'Bokserki': 'Boxer ve Şort',
  'Obuwie': 'Ayakkabılar',
  'Czapki': 'Bere ve Şapkalar',
  'Zegarki': 'Kol Saatleri',
  'Biżuteria': 'Takı ve Mücevher',
  'Makijaż': 'Makyaj Ürünleri',
  'Pielęgnacja': 'Cilt ve Vücut Bakımı',
  'Zapachy': 'Parfüm ve Deodorant',
  'Akcesoria GSM': 'Telefon ve Tablet Aksesuarları',
  'Akcesoria samochodowe': 'Oto Aksesuar ve Elektronik',
  'Oświetlenie LED': 'LED Aydınlatma ve Şeritler'
};

export function translateCategoryName(namePl) {
  if (!namePl) return '';
  const trimmed = namePl.trim();
  if (COMMON_TR_TRANSLATIONS[trimmed]) return COMMON_TR_TRANSLATIONS[trimmed];
  return trimmed;
}

export async function getAccessToken() {
  const tokenRes = await fetch('https://allegro.pl/auth/oauth/token?grant_type=client_credentials', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  if (!tokenRes.ok) {
    throw new Error(`Allegro Token Error: ${tokenRes.status} ${tokenRes.statusText}`);
  }
  const data = await tokenRes.json();
  return data.access_token;
}

export async function fetchChildren(parentId, token, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const url = `https://api.allegro.pl/sale/categories?parent.id=${encodeURIComponent(parentId)}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.allegro.public.v1+json',
          'Accept-Language': 'pl-PL'
        }
      });
      if (res.status === 429) {
        const delay = (i + 1) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data.categories || [];
    } catch (err) {
      if (i === retries - 1) return [];
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return [];
}

export async function crawlAllegroCategories(maxDepth = 6) {
  console.log('[Allegro Sync] Token alınıyor...');
  const token = await getAccessToken();
  console.log('[Allegro Sync] Token başarıyla alındı. Kök kategoriler çekiliyor...');

  const rootRes = await fetch('https://api.allegro.pl/sale/categories', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.allegro.public.v1+json'
    }
  });
  const roots = (await rootRes.json()).categories || [];
  console.log(`[Allegro Sync] ${roots.length} adet ana kök kategori bulundu.`);

  const allCategories = [];
  const queue = [];

  // Initialize queue with roots
  for (const root of roots) {
    const item = {
      id: String(root.id),
      name: root.name,
      namePl: root.name,
      trName: translateCategoryName(root.name),
      parentId: null,
      path: root.name,
      depth: 0,
      leaf: Boolean(root.leaf),
      rootId: String(root.id),
      rootName: root.name
    };
    allCategories.push(item);
    if (!root.leaf) {
      queue.push(item);
    }
  }

  // Concurrency worker pool
  const CONCURRENCY = 8;
  let processed = 0;

  async function processQueueItem(item) {
    if (item.depth >= maxDepth) return;
    const children = await fetchChildren(item.id, token);
    for (const child of children) {
      const childItem = {
        id: String(child.id),
        name: child.name,
        namePl: child.name,
        trName: translateCategoryName(child.name),
        parentId: item.id,
        path: `${item.path} > ${child.name}`,
        depth: item.depth + 1,
        leaf: Boolean(child.leaf),
        rootId: item.rootId,
        rootName: item.rootName
      };
      allCategories.push(childItem);
      if (!child.leaf && childItem.depth < maxDepth) {
        queue.push(childItem);
      }
    }
  }

  console.log('[Allegro Sync] Alt kırılımlar taranıyor...');
  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENCY);
    await Promise.all(batch.map(item => processQueueItem(item)));
    processed += batch.length;
    if (processed % 80 === 0 || queue.length === 0) {
      console.log(`[Allegro Sync] İşlendi: ${processed} üst kategori, Toplam kategori: ${allCategories.length}, Kuyrukta kalan: ${queue.length}`);
    }
    // Small throttle
    await new Promise(r => setTimeout(r, 40));
  }

  console.log(`[Allegro Sync] Tarama tamamlandı! Toplam kategori sayısı: ${allCategories.length}`);
  const leafCount = allCategories.filter(c => c.leaf).length;
  console.log(`[Allegro Sync] Yaprak (Leaf - Teklife Açık) kategori sayısı: ${leafCount}`);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(TAXONOMY_FILE, JSON.stringify(allCategories, null, 2), 'utf-8');
  console.log(`[Allegro Sync] Veritabanı dosyasına kaydedildi: ${TAXONOMY_FILE}`);

  return {
    total: allCategories.length,
    leafCount,
    rootsCount: roots.length
  };
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('sync_allegro_taxonomy.js')) {
  crawlAllegroCategories()
    .then(res => {
      console.log('Tamamlandı:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('Hata:', err);
      process.exit(1);
    });
}
