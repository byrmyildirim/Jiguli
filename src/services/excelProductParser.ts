import * as XLSX from 'xlsx';
import { AllegroOffer, MarketplaceId } from '../types/allegro';
import { autoDetectAttributesFromProduct } from './marketplaceAttributes';
import { matchProductToEmagCategory } from './excelCategoryMatcher';

export interface ParsedExcelRow {
  ean: string;
  eanAllegro: string;
  productGroup: string;
  marketplaceTitle: string; // Bulgarca emag veya Allegro lehçe başlık
  productName: string;      // Product name (English / descriptive)
  eurOriginalPrice: number; // EUR karşılığı
  discountPercent: string;  // Uygulanan indirim (e.g. 50%)
  discountedEurPrice: number; // İndirimli euro fiyatı (€)
  categoryName: string;     // Eşleşen Kategori Adı
  categoryCode: string;     // Eşleşen Kategori Kodu
  emagCategoryName?: string;
  emagCategoryCode?: string;
  allegroCategoryName?: string;
  allegroCategoryCode?: string;
  photoUrl: string;         // Product photo link
  sourceUrl: string;        // Website links (1688, Amazon, AliExpress)
  sku: string;              // SKU ID
  quantity: number;         // Qty of SKU
  declaredValue: string;    // Declared value
  currency: string;         // Currency (e.g. CNY)
  usedRate: number;         // Kullanılan kur (1 birim = €)
  costEur: number;          // İndirimsiz fiyat (€)
  declaredWeight: string;   // Declared weight
  orderNumber: string;      // number
  parcelNumber: string;     // Parcel number
  palletNumber: string;     // Pallet number
  condition: 'NEW' | 'USED';
  taxPercent: string;       // tax / tax yüzde
  detectedChannel: MarketplaceId; // 'allegro' | 'emag'
  rawRow: Record<string, any>;
}

// Clean and parse scientific EANs e.g. 6.12415E+11 -> clean string
export function cleanEanString(val: any): string {
  if (!val) return '';
  const str = String(val).trim().replace(',', '.');
  const num = Number(str);
  if (!isNaN(num) && str.toLowerCase().includes('e')) {
    // Scientific notation conversion
    return BigInt(Math.round(num)).toString();
  }
  const digits = String(val).replace(/[^0-9]/g, '');
  if (digits.length === 13) {
    return repairEan13(digits);
  }
  return digits;
}

// Validate EAN-13 Modulo 10 Checksum
export function isValidEan13(ean: string): boolean {
  if (!/^\d{13}$/.test(ean)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(ean[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(ean[12], 10);
}

// Calculate and repair EAN-13 checksum digit to prevent eMAG API rejection
export function repairEan13(ean: string): string {
  const digits = String(ean).replace(/\D/g, '');
  if (digits.length === 12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return digits + check;
  }
  if (digits.length === 13) {
    if (isValidEan13(digits)) return digits;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return digits.slice(0, 12) + check;
  }
  return digits;
}

// Clean currency/price string e.g. "119,94€" or "78,175" -> 119.94
export function parsePriceNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val)
    .replace('€', '')
    .replace('$', '')
    .replace('zł', '')
    .replace('₺', '')
    .trim()
    .replace(/\s/g, '');

  // Handle European comma decimal: e.g. "1.208,08" or "119,94"
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Format: 1.208,08 -> remove dot, replace comma with dot
    const normal = cleaned.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normal);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (cleaned.includes(',')) {
    const normal = cleaned.replace(',', '.');
    const parsed = parseFloat(normal);
    return isNaN(parsed) ? 0 : parsed;
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Check Cyrillic (Bulgarian / Russian) to identify eMAG Bulgaria
function isCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

// Normalize key to ease matching against messy headers
function normalizeKey(key: string): string {
  if (!key) return '';
  return String(key)
    .toLocaleLowerCase('tr')
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöçа-яё]/gi, '')
    .trim();
}

export function parseExcelProductData(fileBuffer: ArrayBuffer): {
  success: boolean;
  rows: ParsedExcelRow[];
  totalCount: number;
  error?: string;
} {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { success: false, rows: [], totalCount: 0, error: 'Excel dosyası boş veya çalışma sayfası bulunamadı.' };
    }

    const worksheet = workbook.Sheets[sheetName];
    // Check 2D rows to find the actual header row in case of title row at row 0
    const rawMatrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
    if (!rawMatrix || rawMatrix.length === 0) {
      return { success: false, rows: [], totalCount: 0, error: 'Çalışma sayfasında veri satırı bulunamadı.' };
    }

    // Locate header row: row with the most column keywords (EAN, product, sku, eur, vb.)
    let headerRowIdx = 0;
    const headerKeywords = ['ean', 'sku', 'product', 'urun', 'fiyat', 'eur', 'photo', 'resim', 'kategori', 'category'];
    for (let r = 0; r < Math.min(5, rawMatrix.length); r++) {
      const row = rawMatrix[r];
      if (Array.isArray(row)) {
        const matches = row.filter((c: any) => {
          const norm = normalizeKey(String(c || ''));
          return headerKeywords.some(kw => norm.includes(kw));
        }).length;
        if (matches >= 2) {
          headerRowIdx = r;
          break;
        }
      }
    }

    // Parse JSON starting from detected header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      range: headerRowIdx,
      defval: ''
    });

    if (!jsonData || jsonData.length === 0) {
      return { success: false, rows: [], totalCount: 0, error: 'Çalışma sayfasında veri satırı bulunamadı.' };
    }

    const parsedRows: ParsedExcelRow[] = [];

    jsonData.forEach((row, index) => {
      // Find matching keys dynamically
      const keys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        for (const k of keys) {
          const norm = normalizeKey(k);
          for (const kw of keywords) {
            const normKw = normalizeKey(kw);
            if (norm.includes(normKw)) {
              const v = row[k];
              if (v !== undefined && v !== null && String(v).trim() !== '') {
                return v;
              }
            }
          }
        }
        return '';
      };

      const eanRaw = findVal(['EAN', 'barkod', 'barcode', 'gtin']);
      const eanAllegroRaw = findVal(['Ean allegro', 'eanallegro', 'allegro ean']);
      const productGroupRaw = findVal(['Product', 'urungrubu', 'urun grubu', 'grup']);
      const marketplaceTitleRaw = findVal([
        'Bulgarca emag',
        'Allegro lehçe',
        'lehce',
        'emag',
        'baslik',
        'başlık',
        'Bulgarca emag(yeşil) veya Allegro lehçe(pembe) başlık'
      ]);
      const productNameRaw = findVal(['Product name', 'productname', 'urunadi', 'ürün adı', 'title', 'name']);
      const eurOriginalPriceRaw = findVal(['EUR karşılığı', 'eurkarsiligi', 'eurfiyati', 'eur karşılığı', 'eur']);
      const discountPercentRaw = findVal(['Uygulanan indirim', 'indirim', 'discount', 'indirim yuzdesi']);
      const discountedEurPriceRaw = findVal(['İndirimli euro fiyatı', 'indirimlieuro', 'indirimlifiyat', 'indirimli euro']);
      // eMAG Specific Category Columns (Highest Priority for eMAG)
      const emagCatCodeRaw = findVal([
        'emag kategori id',
        'emag kategori kodu',
        'emag kategorikodu',
        'emag kategoriid',
        'emag category id',
        'emag category code',
        'emag categoryid',
        'emag categorycode',
        'emag cat id',
        'emag_cat_id',
        'emag id',
        'emagid',
        'emag_id',
        'emag code',
        'emag kod',
        'emag_kategori_id',
        'emag_kategori_kodu',
        'emag_category_id',
        'emag_category_code',
        'kategori (emag)',
        'kategori kodu (emag)',
        'kategori id (emag)'
      ]);
      const emagCatNameRaw = findVal([
        'emag kategori adı',
        'emag kategori adi',
        'emag kategoriadi',
        'emag kategori',
        'emag category name',
        'emag category',
        'emag cat name',
        'emag_kategori_adi',
        'emag_kategori',
        'emag_category_name',
        'emag_category'
      ]);

      // Allegro Specific Category Columns
      const allegroCatCodeRaw = findVal([
        'allegro kategori id',
        'allegro kategori kodu',
        'allegro kategorikodu',
        'allegro kategoriid',
        'allegro category id',
        'allegro category code',
        'allegro_category_id',
        'allegro id',
        'allegroid',
        'kategori (allegro)',
        'kategori kodu (allegro)'
      ]);
      const allegroCatNameRaw = findVal([
        'allegro kategori adı',
        'allegro kategori adi',
        'allegro kategoriadi',
        'allegro kategori',
        'allegro category name',
        'allegro category',
        'allegro_category_name'
      ]);

      // General / Master Category Columns (Fallback)
      const categoryCodeRaw = findVal([
        'eşleşen kategori kodu',
        'eslesen kategori kodu',
        'eslesenkategorikodu',
        'kategori id',
        'kategoriid',
        'kategori kodu',
        'kategorikodu',
        'kategori no',
        'kategorino',
        'kategori_id',
        'kategori_kodu',
        'category id',
        'categoryid',
        'category code',
        'categorycode',
        'category_id',
        'category_code',
        'cat id',
        'catid',
        'id kategorii',
        'idkategorii',
        'kod kategorii',
        'kodkategorii',
        'hedef kategori id',
        'hedef kategori kodu'
      ]);
      const categoryNameRaw = findVal([
        'eşleşen kategori adı',
        'eslesen kategori adi',
        'eslesenkategoriadi',
        'kategori adı',
        'kategori adi',
        'kategoriadi',
        'kategori',
        'kategori_adi',
        'category name',
        'categoryname',
        'category',
        'category_name',
        'kategoria',
        'nazwa kategorii',
        'ürün kategorisi',
        'urun kategorisi'
      ]);
      const photoUrlRaw = findVal(['Product photo link', 'photolink', 'photo', 'resim', 'gorsel', 'görsel', 'image']);
      const sourceUrlRaw = findVal(['Website links', 'websitelinks', 'link', 'kaynak', '1688', 'website']);
      const skuRaw = findVal(['SKU ID', 'skuid', 'sku', 'stokkodu', 'stok kodu']);
      const qtyRaw = findVal(['Qty of SKU', 'qty', 'adet', 'stok', 'quantity', 'miktar']);
      const declaredValueRaw = findVal(['Declared value', 'declaredvalue', 'beyan']);
      const currencyRaw = findVal(['Currency', 'parabirimi', 'para birimi']) || 'CNY';
      const usedRateRaw = findVal(['Kullanılan kur', 'kullanilankur', 'kur', 'rate']);
      const costEurRaw = findVal(['İndirimsiz fiyat', 'indirimsizfiyat', 'maliyet', 'cost']);
      const declaredWeightRaw = findVal(['Declared weight', 'agirlik', 'ağırlık', 'weight']);
      const orderNumberRaw = findVal(['number', 'numara', 'siparisno', 'sipariş no']);
      const parcelNumberRaw = findVal(['Parcel number', 'parcelnumber', 'paketno', 'kolino', 'paket no']);
      const palletNumberRaw = findVal(['Pallet number', 'palletnumber', 'paletno', 'palet no']);
      const isUsedRaw = findVal(['used', 'ikinciel', 'ikinci el']);
      const taxPercentRaw = findVal(['tax yüzde', 'tax yuzde', 'tax', 'kdv']) || '20%';

      // Intelligent Fallbacks:
      // If photo is missing, scan row values for image URLs
      let photo = String(photoUrlRaw || '').trim();
      if (!photo) {
        for (const k of keys) {
          const valStr = String(row[k] || '').trim();
          if (
            valStr.startsWith('http') &&
            (/\.(jpg|jpeg|png|webp|gif)/i.test(valStr) || valStr.includes('alicdn') || valStr.includes('image'))
          ) {
            photo = valStr;
            break;
          }
        }
      }

      // If source link is missing, scan row values for 1688 / AliExpress / Amazon
      let sourceUrl = String(sourceUrlRaw || '').trim();
      if (!sourceUrl) {
        for (const k of keys) {
          const valStr = String(row[k] || '').trim();
          if (valStr.startsWith('http') && (valStr.includes('1688') || valStr.includes('aliexpress') || valStr.includes('amazon') || valStr.includes('detail'))) {
            sourceUrl = valStr;
            break;
          }
        }
      }

      // Title selection priority
      const title = (marketplaceTitleRaw || productNameRaw || productGroupRaw || `Ürün #${index + 1}`).trim();
      const sku = (skuRaw || parcelNumberRaw || `SKU-${Date.now()}-${index + 1}`).trim();
      let ean = cleanEanString(eanRaw || eanAllegroRaw);
      if (!ean) {
        // Fallback: check if any cell looks like 12-14 digit EAN
        for (const k of keys) {
          const cleaned = cleanEanString(row[k]);
          if (cleaned.length >= 12 && cleaned.length <= 14) {
            ean = cleaned;
            break;
          }
        }
      }

      const discountedEur = parsePriceNumber(discountedEurPriceRaw);
      const originalEur = parsePriceNumber(eurOriginalPriceRaw) || (discountedEur > 0 ? discountedEur * 2 : 49.99);
      const parsedQty = parseInt(String(qtyRaw ?? '').trim(), 10);
      const qty = isNaN(parsedQty) ? 10 : Math.max(0, parsedQty);

      // Detect destination marketplace based on language
      const isBg = isCyrillic(marketplaceTitleRaw) || isCyrillic(productNameRaw);
      const detectedChannel: MarketplaceId = isBg ? 'emag' : 'allegro';

      // Skip row if completely empty
      if (!title && !sku && !photo && discountedEur === 0) return;

      const cleanCode = (raw: any) => {
        if (!raw) return '';
        const s = String(raw).trim();
        // Remove .0 if parsed as float from excel
        return s.endsWith('.0') ? s.slice(0, -2) : s;
      };

      const finalCatCode = cleanCode(categoryCodeRaw) || cleanCode(emagCatCodeRaw) || cleanCode(allegroCatCodeRaw) || '0';
      const finalCatName = String(categoryNameRaw || emagCatNameRaw || allegroCatNameRaw || productGroupRaw || 'Genel / E-Ticaret').trim();

      parsedRows.push({
        ean,
        eanAllegro: String(eanAllegroRaw || ''),
        productGroup: String(productGroupRaw || ''),
        marketplaceTitle: String(marketplaceTitleRaw || ''),
        productName: String(productNameRaw || ''),
        eurOriginalPrice: originalEur,
        discountPercent: String(discountPercentRaw || '50%'),
        discountedEurPrice: discountedEur > 0 ? discountedEur : originalEur * 0.5,
        categoryName: finalCatName,
        categoryCode: finalCatCode,
        emagCategoryName: emagCatNameRaw ? String(emagCatNameRaw).trim() : undefined,
        emagCategoryCode: cleanCode(emagCatCodeRaw) || undefined,
        allegroCategoryName: allegroCatNameRaw ? String(allegroCatNameRaw).trim() : undefined,
        allegroCategoryCode: cleanCode(allegroCatCodeRaw) || undefined,
        photoUrl: photo,
        sourceUrl,
        sku,
        quantity: qty,
        declaredValue: String(declaredValueRaw || ''),
        currency: String(currencyRaw || 'CNY'),
        usedRate: parsePriceNumber(usedRateRaw) || 0.13,
        costEur: parsePriceNumber(costEurRaw),
        declaredWeight: String(declaredWeightRaw || ''),
        orderNumber: String(orderNumberRaw || ''),
        parcelNumber: String(parcelNumberRaw || ''),
        palletNumber: String(palletNumberRaw || ''),
        condition: isUsedRaw && String(isUsedRaw).toLowerCase() === 'x' ? 'USED' : 'NEW',
        taxPercent: String(taxPercentRaw || '20%'),
        detectedChannel,
        rawRow: row
      });
    });

    return {
      success: true,
      rows: parsedRows,
      totalCount: parsedRows.length
    };
  } catch (err: any) {
    console.error('Excel parse error:', err);
    return {
      success: false,
      rows: [],
      totalCount: 0,
      error: err?.message || 'Excel dosyası işlenirken bir hata oluştu.'
    };
  }
}

// Convert parsed Excel rows into AllegroOffer drafts ready for marketplaceStore
export function convertExcelRowsToOffers(
  rows: ParsedExcelRow[],
  targetChannelOverride?: 'ALL' | 'allegro' | 'emag'
): Partial<AllegroOffer>[] {
  const EUR_TO_PLN = 4.29; // Reference Allegro conversion

  return rows.map((r, idx) => {
    const channel = targetChannelOverride && targetChannelOverride !== 'ALL'
      ? targetChannelOverride
      : r.detectedChannel;

    const isAllegro = channel === 'allegro' || (targetChannelOverride === 'ALL');
    const isEmag = channel === 'emag' || (targetChannelOverride === 'ALL');

    // Selling price in PLN (base currency for panel)
    const finalEurPrice = r.discountedEurPrice > 0 ? r.discountedEurPrice : (r.eurOriginalPrice > 0 ? r.eurOriginalPrice * 0.5 : 49.99);
    const amountInPln = (finalEurPrice * EUR_TO_PLN).toFixed(2);

    const displayName = r.marketplaceTitle || r.productName || r.productGroup || `İthal Ürün #${idx + 1}`;

    // Intelligent category matching backed by resale projesi-revize.xlsx and eMAG BG taxonomy
    const matchedCategory = matchProductToEmagCategory({
      title: displayName,
      name: displayName,
      sku: r.sku,
      url: r.sourceUrl,
      productType: r.productGroup,
      categoryCode: r.emagCategoryCode || (r.categoryCode && r.categoryCode !== '0' ? r.categoryCode : undefined),
      categoryName: r.emagCategoryName || r.categoryName
    });

    const finalEmagCatId = String(matchedCategory.categoryId);
    const finalEmagCatName = matchedCategory.categoryName;
    const finalAllegroCatId = r.allegroCategoryCode || (r.categoryCode && r.categoryCode !== '0' ? r.categoryCode : finalEmagCatId);

    const autoDetected = autoDetectAttributesFromProduct({
      title: displayName,
      name: displayName,
      sku: r.sku || `SKU-${Date.now()}-${idx}`,
      ean: r.ean || undefined,
      categoryCode: finalEmagCatId,
      categoryName: finalEmagCatName
    });

    const finalEmagPriceBgn = (finalEurPrice * 1.95).toFixed(2);

    return {
      id: `draft-xl-${Date.now()}-${idx}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: displayName,
      sku: r.sku || `SKU-${Date.now()}-${idx}`,
      ean: r.ean || undefined,
      primaryImage: r.photoUrl || '/products/no_image.svg',
      category: {
        id: finalEmagCatId || (r.categoryCode && r.categoryCode !== '0' ? r.categoryCode : 'other'),
        name: finalEmagCatName || r.categoryName || autoDetected.detectedCategory || r.productGroup || 'Genel Envanter'
      },
      sellingMode: {
        format: 'BUY_NOW' as const,
        price: {
          amount: amountInPln,
          currency: 'PLN'
        }
      },
      stock: {
        available: typeof r.quantity === 'number' && !isNaN(r.quantity) ? Math.max(0, r.quantity) : 0,
        unit: 'UNIT' as const
      },
      publication: {
        status: 'DRAFT' as const,
        marketplaces: {
          base: { id: isEmag ? 'emag-bg' : 'allegro-pl' },
          additional: isAllegro ? [{ id: 'allegro-cz' }] : []
        }
      },
      channelSync: {
        allegro: isAllegro ? 'pending' : 'unlinked',
        emag: isEmag ? 'pending' : 'unlinked',
        baselinker: 'unlinked'
      },
      channelData: {
        allegro: {
          title: r.marketplaceTitle || r.productName || displayName,
          categoryId: finalAllegroCatId,
          price: { amount: amountInPln, currency: 'PLN' },
          parameters: autoDetected.allegroParams
        },
        emag: {
          title: r.marketplaceTitle || r.productName || displayName,
          categoryId: finalEmagCatId,
          categoryName: finalEmagCatName,
          price: { amount: finalEmagPriceBgn, currency: 'BGN' },
          characteristics: matchedCategory.characteristics || autoDetected.emagCharacteristics
        }
      },
      isDraft: true,
      excelMetadata: {
        originalEurPrice: r.eurOriginalPrice,
        discountPercent: r.discountPercent,
        discountedEurPrice: r.discountedEurPrice,
        matchedCategoryName: r.categoryName,
        matchedCategoryCode: r.categoryCode,
        emagCategoryName: finalEmagCatName,
        emagCategoryCode: finalEmagCatId,
        allegroCategoryName: r.allegroCategoryName,
        allegroCategoryCode: r.allegroCategoryCode || (isAllegro ? r.categoryCode : undefined),
        websiteLinks: r.sourceUrl,
        eanAllegro: r.eanAllegro,
        parcelNumber: r.parcelNumber,
        palletNumber: r.palletNumber,
        declaredValue: r.declaredValue,
        currency: r.currency,
        exchangeRateUsed: r.usedRate,
        declaredWeight: r.declaredWeight,
        tax: r.taxPercent
      }
    };
  });
}

// Generate an exact matching sample .xlsx file based on user's image screenshot
export function generateSampleExcelFile(): Uint8Array {
  const sampleHeaders = [
    'EAN',
    'Ean allegro',
    'Product',
    'Bulgarca emag(yeşil) veya Allegro lehçe(pembe) başlık',
    'Product name',
    'EUR karşılığı',
    'Uygulanan indirim',
    'İndirimli euro fiyatı (€)',
    'Eşleşen Kategori Adı',
    'Eşleşen Kategori Kodu',
    'Product photo link',
    'Website links',
    'SKU ID',
    'Qty of SKU',
    'Declared value',
    'Currency',
    'Kullanılan kur (1 birim = €)',
    'İndirimsiz fiyat (€)',
    'Declared weight',
    'number',
    'Parcel number',
    'Pallet number',
    'new',
    'used',
    'distroid',
    'discription',
    'tax',
    'tax yüzde'
  ];

  const sampleRows = [
    [
      '612415000001',
      '',
      'Styling Accessories',
      'Сешоар с високоскоростен мотор, отрицателни йони, ултра тиха работа, ниско ниво на шум, силен въздушен поток, за домашна употреба',
      'Professional High-Speed Ionic Hair Dryer Ultra Quiet Strong Airflow',
      '239,87€',
      '50%',
      '119,94€',
      'Bags & Accessories/Handbags and accessories/Hair accessor',
      '3125',
      'https://ae04.alicdn.com/kf/A8fd7efe2336f46549aaef1b34dc22a51r.jpg',
      'https://detail.1688.com/offer/833589783871.html',
      '7825562',
      '1',
      '1.856,58',
      'CNY',
      '0,1292',
      '235,6',
      '0.35',
      '60000006650553203550763',
      'FS2025C5156717903062E',
      'PL-AE-Y1-003-C531',
      'x',
      '',
      '',
      '',
      '20%',
      '20'
    ],
    [
      '',
      '612415000002 yayında- kontrol ediniz',
      'Men Perfume',
      'ARMAF Club De Nuit Intense Man EDT Perfumy Męskie',
      'ARMAF Club De Nuit Intense Man EDT Armaf Club De Nuit For Women Eau de Parfum Spray Wysokiej jakości perfumy z feromonami przyciągające kobiety',
      '156,35€',
      '50%',
      '78,175€',
      'Perfumes/Perfumes',
      '1241',
      'https://ae04.alicdn.com/kf/A5d27a7bc61134d308003ea916946cd52o.jpg',
      'https://www.amazon.com.tr/Armaf-Club-nuit-Intense',
      '8595006',
      '1',
      '1.210,12',
      'CNY',
      '0,13',
      '1.535,64',
      '605',
      '60000026650553202011743',
      'FS2025C3151713221862E',
      'PL-AE-Y1-003-C512',
      'x',
      '',
      '',
      'different colour',
      '20%',
      '20'
    ],
    [
      '629782752374',
      '',
      'Rotary Tools',
      'HILDA електрическа права шлайфмашина 380W с 6 скорости машина за шлайфане',
      'HILDA płytki ceramiczne piękno narzędzie do szycia 380W elektryczna szlifierka prosta 6 zmiennych prędkości maszyna czyszcząca szlifierka polerka',
      '153,93€',
      '50%',
      '76,965€',
      'DIY/Electrical equipment/Multifunction tools and accessories',
      '642',
      'https://ae04.alicdn.com/kf/A125e881f17fc4487864e553d4986ccf5k.jpg',
      '',
      '5565813',
      '1',
      '1.191,39',
      'CNY',
      '0,13',
      '1.511,87',
      '1.124',
      '60000036650553202901387',
      'FS2025BN150712604634E',
      'PL-AE-Y1-003-C512',
      'x',
      '',
      '',
      '',
      '20%',
      '20'
    ],
    [
      '612415000003',
      'başka bir ürünle birleştiriyor olmadı',
      'DVR/Dash Camera',
      '',
      '10" Kamera samochodowa 4K 3840*2160P Rejestrator samochodowy Carplay Android Auto GPS 5G WIFI AUX Stream Lusterko wsteczne Kamera samochodowa Rejestrator FM',
      '123,00€',
      '50%',
      '61,50€',
      'Car Electronics/GPS Navigation Systems & Auto-Moto Electro',
      '631',
      'https://ae04.alicdn.com/kf/A0982522b7e3646e9ab7fd69a7a665dc6q.jpg',
      'https://tr.aliexpress.com/item/10050070099736',
      '2407104',
      '1',
      '951,99',
      'CNY',
      '0,13',
      '1.208,08',
      '971',
      '60000036650553201476920',
      'FS2025BT158722645796E',
      'PL-AE-Y1-003-C512',
      'x',
      '',
      '',
      '',
      '20%',
      '20'
    ],
    [
      '',
      '612415000004 yayında- kontrol ediniz',
      'Fingerprint Lock',
      'Inteligentny Zamek do Drzwi Tuya – Odcisk Palca, Kod, Karta Tuya APP Cylinder linii papilarnych Elektroniczny inteligentny zamek do drzwi Klawiatura cyfrowa Kod Klucz Karta Pilot Regulowany domowy apartament',
      'Tuya Smart Fingerprint Door Lock Digital Keypad RFID Key Waterproof Electronic Cylinder Lock',
      '122,67€',
      '50%',
      '61,335€',
      'Building materials/Feronery & accessories/Locks and secret lo',
      '110',
      'https://ae04.alicdn.com/kf/A0570e869a0874a07b6211ec856cff.jpg',
      '',
      '2790962',
      '1',
      '949,47',
      'CNY',
      '0,13',
      '1.204,88',
      '0.59',
      '60000095650553201956628',
      'FS2025C615271798173E',
      'PL-AE-Y1-003-C531',
      'x',
      '',
      '',
      '',
      '20%',
      '20'
    ],
    [
      '',
      '612415000005 yayında- kontrol ediniz',
      'Motherboards',
      'Płyta Główna MACHINIST B450 AM4 DDR4 M.2 NVME (Dla procesorów Ryzen 5500 5600 5600G)',
      'Płyta główna MACHINIST B450 Procesor AMD Dwukanałowa pamięć DDR4 AM4 Płyta główna M.2 NVME (obsługuje procesor Ryzen 5500 5600 5600G)',
      '122,61€',
      '50%',
      '61,305€',
      'PC components/components/Motherboards',
      '259',
      'https://ae04.alicdn.com/kf/A12af257cb6f54bf08ae8556149b88207s.jpg',
      'https://www.aliexpress.com/item/32568116784772',
      '1398571',
      '1',
      '949,00',
      'CNY',
      '0,13',
      '1.204,28',
      '692',
      '60000006650553201805943',
      'FS2025C6153714327323E',
      'PL-AE-Y1-003-C531',
      'x',
      '',
      '',
      '',
      '20%',
      '20'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ürünler Listesi');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(buffer);
}
