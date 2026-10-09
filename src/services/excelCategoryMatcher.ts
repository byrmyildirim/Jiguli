import excelMappingsData from '../../data/excel_category_mappings.json';
import resaleCatalogData from '../../data/resale_products_catalog.json';
import allowedCategoriesData from '../../data/emag_bg_allowed_categories.json';

export interface CategoryMatchResult {
  categoryId: number;
  categoryName: string;
  source: 'EXCEL_SKU' | 'EXCEL_URL' | 'EXCEL_TYPE' | 'EMAG_TAXONOMY' | 'FALLBACK';
  matchDetail?: string;
  characteristics?: { id: number | string; value: string }[];
}

export interface ProductInput {
  name?: string;
  title?: string;
  sku?: string;
  url?: string;
  websiteUrl?: string;
  sourceUrl?: string;
  productType?: string;
  categoryCode?: string | number;
  categoryName?: string;
}

export interface CategoryRequirementDefinition {
  id: string | number;
  label: string;
  trLabel: string;
  isMandatory: boolean;
  type: 'STRING' | 'DICTIONARY' | 'NUMBER';
  options?: string[];
  placeholder?: string;
  description?: string;
  defaultVal?: string;
}

// Full requirement rules per category for validation
export const CATEGORY_REQUIREMENTS_SCHEMA: Record<number, CategoryRequirementDefinition[]> = {
  3426: [ // House Cleaning/Organisation and storage (Banyo, Mutfak, Raf, Düzenleyici)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic', placeholder: 'Generic' },
    { id: 'emag-material', label: 'Material', trLabel: 'Malzeme / Materyal', isMandatory: true, type: 'DICTIONARY', options: ['Metal & Plastik', 'Paslanmaz Çelik', 'Demir Tel', 'Plastik (ABS)', 'Bambu & Ahşap'], defaultVal: 'Metal & Plastik' },
    { id: 'emag-mounting', label: 'Mounting Type', trLabel: 'Montaj Tipi', isMandatory: false, type: 'DICTIONARY', options: ['Asılı / Kapı Üstü (Deliksiz)', 'Duvara Monte', 'Vantuzlu', 'Masaüstü Ayaklı'] },
    { id: 'emag-color', label: 'Color', trLabel: 'Renk', isMandatory: false, type: 'STRING', defaultVal: 'Siyah' }
  ],
  3523: [ // Lighting & Electrical/LED strips
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 5464, label: 'Location', trLabel: 'Kullanım Alanı', isMandatory: true, type: 'DICTIONARY', options: ['Indoor', 'Outdoor'], defaultVal: 'Indoor' },
    { id: 5704, label: 'Product Type', trLabel: 'Ürün Tipi', isMandatory: true, type: 'DICTIONARY', options: ['LED strip', 'COB strip', 'Neon strip'], defaultVal: 'LED strip' },
    { id: 6862, label: 'Length', trLabel: 'Şerit Uzunluğu', isMandatory: true, type: 'DICTIONARY', options: ['1 m', '2 m', '3 m', '5 m', '10 m'], defaultVal: '5 m' }
  ],
  3690: [ // Home Textiles/Duvet covers (Nevresim & Yatak)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 6160, label: 'Set Type', trLabel: 'Nevresim Türü', isMandatory: true, type: 'DICTIONARY', options: ['Double', 'Single', 'King Size'], defaultVal: 'Double' },
    { id: 5661, label: 'Material', trLabel: 'Kumaş Türü', isMandatory: true, type: 'DICTIONARY', options: ['Microfiber', '100% Cotton', 'Satin'], defaultVal: 'Microfiber' },
    { id: 8025, label: 'Dimensions', trLabel: 'Ölçü / Ebat', isMandatory: true, type: 'DICTIONARY', options: ['160 x 200', '200 x 220', '140 x 200', '220 x 240'], defaultVal: '160 x 200' },
    { id: 'emag-pieces', label: 'Pieces Count', trLabel: 'Parça Sayısı', isMandatory: false, type: 'DICTIONARY', options: ['3 Piese (3 Parça)', '2 Piese', '4 Piese'], defaultVal: '3 Piese (3 Parça)' }
  ],
  1344: [ // For pets/Pet beds, pillows and mattresses
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 5704, label: 'Product Type', trLabel: 'Ürün Türü', isMandatory: true, type: 'DICTIONARY', options: ['Bed', 'House', 'Mat', 'Pillow'], defaultVal: 'Bed' },
    { id: 7266, label: 'Intended For', trLabel: 'Hayvan Türü', isMandatory: true, type: 'DICTIONARY', options: ['Dogs', 'Cats', 'Dogs & Cats'], defaultVal: 'Dogs' },
    { id: 'emag-material', label: 'Material', trLabel: 'Kumaş / Materyal', isMandatory: false, type: 'DICTIONARY', options: ['Oxford Su Geçirmez & Peluş', 'Peluş & Pamuk', 'Visco Sünger'], defaultVal: 'Oxford Su Geçirmez & Peluş' }
  ],
  2677: [ // Women's jackets (Deri & Kışlık Ceketler)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-color', label: 'Color', trLabel: 'Renk', isMandatory: true, type: 'STRING', defaultVal: 'Siyah' },
    { id: 'emag-size', label: 'Size', trLabel: 'Beden', isMandatory: true, type: 'DICTIONARY', options: ['S', 'M', 'L', 'XL', 'XXL', 'Universal'], defaultVal: 'M' }
  ],
  2679: [ // Women's sweaters (Kadın Kazak / Hırka)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-color', label: 'Color', trLabel: 'Renk', isMandatory: true, type: 'STRING', defaultVal: 'Siyah' },
    { id: 'emag-size', label: 'Size', trLabel: 'Beden', isMandatory: true, type: 'DICTIONARY', options: ['S', 'M', 'L', 'XL', 'Universal'], defaultVal: 'M' }
  ],
  2673: [ // Women's trousers (Kadın Pantolon / Tayt)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-color', label: 'Color', trLabel: 'Renk', isMandatory: true, type: 'STRING', defaultVal: 'Siyah' },
    { id: 'emag-size', label: 'Size', trLabel: 'Beden', isMandatory: true, type: 'DICTIONARY', options: ['S', 'M', 'L', 'XL', 'Universal'], defaultVal: 'M' }
  ],
  2410: [ // Smart Home Modules (Akıllı Perde, Röle, Tuya)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Tuya' },
    { id: 'emag-protocol', label: 'Protocol', trLabel: 'Protokol', isMandatory: true, type: 'DICTIONARY', options: ['Tuya WiFi 2.4GHz', 'Zigbee 3.0', 'RF 433MHz'], defaultVal: 'Tuya WiFi 2.4GHz' },
    { id: 'emag-app', label: 'Compatible App', trLabel: 'Desteklenen Uygulama', isMandatory: true, type: 'STRING', defaultVal: 'Tuya Smart & Smart Life' }
  ],
  2920: [ // Smartwatch (Akıllı Saatler)
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-compat', label: 'Compatibility', trLabel: 'Sistem Uyumu', isMandatory: true, type: 'DICTIONARY', options: ['Android & iOS', 'Tylko Android', 'Tylko iOS'], defaultVal: 'Android & iOS' },
    { id: 'emag-color', label: 'Color', trLabel: 'Renk', isMandatory: true, type: 'STRING', defaultVal: 'Siyah' }
  ],
  320: [ // Wireless CarPlay / Oto Elektronik
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-compat', label: 'Compatibility', trLabel: 'Uyumluluk', isMandatory: true, type: 'DICTIONARY', options: ['Apple CarPlay & Android Auto', 'CarPlay Kablosuz', 'Android Auto'], defaultVal: 'Apple CarPlay & Android Auto' }
  ],
  2799: [ // Aromatherapy Diffuser
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-power', label: 'Power', trLabel: 'Güç / Besleme', isMandatory: true, type: 'DICTIONARY', options: ['USB 5V', '220V Adaptör', 'Dahili Şarjlı'], defaultVal: 'USB 5V' }
  ],
  582: [ // Gamepads / Konsol Kolu
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-conn', label: 'Connectivity', trLabel: 'Bağlantı Türü', isMandatory: true, type: 'DICTIONARY', options: ['Bluetooth & 2.4G Kablosuz', 'USB Kablolu', 'Bluetooth'], defaultVal: 'Bluetooth & 2.4G Kablosuz' }
  ],
  407: [ // IP Kamera / Güvenlik
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-type', label: 'Camera Type', trLabel: 'Kamera Türü', isMandatory: true, type: 'DICTIONARY', options: ['WiFi IP Kamera', 'Dış Mekan PTZ Kamera', 'Mini Güvenlik Kamerası'], defaultVal: 'WiFi IP Kamera' }
  ],
  2789: [ // Tablet Stylus Pen / Aksesuar
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic' },
    { id: 'emag-compat', label: 'Compatibility', trLabel: 'Tablet Uyumu', isMandatory: true, type: 'DICTIONARY', options: ['iPad iOS & Android', 'iPad Pro/Air/Mini', 'Evrensel Kapasitif'], defaultVal: 'iPad iOS & Android' }
  ]
};

export function getCategoryRequirements(categoryId: number): CategoryRequirementDefinition[] {
  return CATEGORY_REQUIREMENTS_SCHEMA[categoryId] || [
    { id: 'emag-brand', label: 'Brand', trLabel: 'Marka', isMandatory: true, type: 'STRING', defaultVal: 'Generic', placeholder: 'Generic' }
  ];
}

// Characteristic templates known to be required by eMAG Bulgaria
export const KNOWN_CATEGORY_CHARACTERISTICS: Record<number, { id: number | string; value: string }[]> = {
  3426: [ // Storage & Organisation
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-material', value: 'Metal & Plastik' }
  ],
  3523: [ // LED strips
    { id: 5464, value: 'Indoor' },
    { id: 5704, value: 'LED strip' },
    { id: 6862, value: '5 m' }
  ],
  3690: [ // Duvet covers / Bedding
    { id: 6160, value: 'Double' },
    { id: 5661, value: 'Microfiber' },
    { id: 8025, value: '160 x 200' }
  ],
  1344: [ // Pet beds, pillows and mattresses
    { id: 5704, value: 'Bed' },
    { id: 7266, value: 'Dogs' }
  ],
  2410: [ // Smart home control panels and modules (Curtain motor, Zigbee modules)
    { id: 'emag-brand', value: 'Tuya' },
    { id: 'emag-protocol', value: 'Zigbee 3.0 / WiFi' },
    { id: 'emag-power', value: '220V AC / USB 5V' }
  ],
  2677: [ // Women's jackets
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-color', value: 'Siyah' },
    { id: 'emag-size', value: 'M' }
  ],
  2679: [ // Women's sweaters
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-color', value: 'Siyah' },
    { id: 'emag-size', value: 'M' }
  ],
  2673: [ // Women's trousers
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-color', value: 'Siyah' },
    { id: 'emag-size', value: 'M' }
  ],
  2920: [ // Smartwatch
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-compat', value: 'Android & iOS' },
    { id: 'emag-color', value: 'Black' }
  ],
  2804: [ // Sports watches
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-color', value: 'Black' }
  ],
  763: [ // Gaming console accessories / controllers
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-conn', value: 'Bluetooth / USB' }
  ],
  407: [ // Surveillance cameras
    { id: 'emag-brand', value: 'Generic' },
    { id: 'emag-type', value: 'IP WiFi Camera' },
    { id: 'emag-res', value: '1080P / 4K' }
  ]
};

// Clean and extract significant keywords
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !['dla', 'the', 'and', 'with', 'dla', 'nie', 'jest', 'set', 'pcs', 'nowa', 'nowy'].includes(w));
}

// Clean URL for comparison (extract domain and offer/item id)
function extractUrlSignature(url: string): string {
  if (!url) return '';
  try {
    const cleaned = url.toLowerCase().split('?')[0];
    const match = cleaned.match(/(?:offer|product|itm|dp|p-)[\/=-]?([a-z0-9_-]+)/i);
    if (match && match[1]) return match[1];
    return cleaned;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Automatically matches an incoming product against the Excel knowledge base
 * (resale projesi-revize.xlsx) and eMAG Bulgaria's 1,735 allowed categories.
 */
export function matchProductToEmagCategory(product: ProductInput): CategoryMatchResult {
  const title = (product.title || product.name || '').trim();
  const titleLower = title.toLowerCase();
  const rawSku = String(product.sku || '').trim().replace(/^SKU-/i, '');
  const url = (product.url || product.websiteUrl || product.sourceUrl || '').trim();
  const urlSig = extractUrlSignature(url);
  const prodType = (product.productType || '').trim().toLowerCase();

  // If already has an explicit, valid eMAG BG category code (> 0 and not Romanian/obsolete)
  const incomingCode = Number(product.categoryCode);
  if (incomingCode > 0 && incomingCode !== 6001 && incomingCode !== 257548 && incomingCode !== 3122) {
    const isAllowed = (allowedCategoriesData as any[]).some(c => Number(c.id) === incomingCode);
    if (isAllowed) {
      return {
        categoryId: incomingCode,
        categoryName: product.categoryName || `eMAG Kategori #${incomingCode}`,
        source: 'EXCEL_SKU',
        matchDetail: `Mevcut eMAG kategorisi (${incomingCode}) doğrulandı`,
        characteristics: KNOWN_CATEGORY_CHARACTERISTICS[incomingCode]
      };
    }
  }

  // PRIORITY 1: Match by exact or item ID in Website Link (1688, AliExpress, DHgate, Trendyol, Amazon)
  if (urlSig && urlSig.length > 5) {
    for (const item of (resaleCatalogData as any[])) {
      if (!item.websiteUrl) continue;
      const itemSig = extractUrlSignature(item.websiteUrl);
      if (itemSig && (itemSig === urlSig || item.websiteUrl.toLowerCase().includes(urlSig) || url.toLowerCase().includes(itemSig))) {
        const catCode = Number(item.categoryCode);
        return {
          categoryId: catCode,
          categoryName: item.categoryName,
          source: 'EXCEL_URL',
          matchDetail: `Tedarikçi URL eşleşmesi (${item.productType} -> #${catCode})`,
          characteristics: KNOWN_CATEGORY_CHARACTERISTICS[catCode]
        };
      }
    }
  }

  // PRIORITY 2: Match by SKU in Resale Catalog
  if (rawSku) {
    const matchedBySku = (resaleCatalogData as any[]).find(item => 
      String(item.sku).trim() === rawSku ||
      rawSku.includes(String(item.sku).trim())
    );
    if (matchedBySku) {
      const catCode = Number(matchedBySku.categoryCode);
      return {
        categoryId: catCode,
        categoryName: matchedBySku.categoryName,
        source: 'EXCEL_SKU',
        matchDetail: `Excel SKU #${matchedBySku.sku} (${matchedBySku.productType})`,
        characteristics: KNOWN_CATEGORY_CHARACTERISTICS[catCode]
      };
    }
  }

  // PRIORITY 3: Match by explicit productType or key phrases from Excel Knowledge Base
  const mappings = excelMappingsData as Record<string, { categoryCode: number; categoryName: string }>;
  
  if (prodType && mappings[prodType]) {
    const m = mappings[prodType];
    return {
      categoryId: m.categoryCode,
      categoryName: m.categoryName,
      source: 'EXCEL_TYPE',
      matchDetail: `Excel Ürün Tipi: ${prodType}`,
      characteristics: KNOWN_CATEGORY_CHARACTERISTICS[m.categoryCode]
    };
  }

  // Match key phrase patterns learned from resale projesi-revize.xlsx
  const rulePatterns: { keywords: string[]; categoryCode: number; categoryName: string }[] = [
    // LED Strip
    { keywords: ['led', 'strip', 'şerit', 'rgb', 'cob', 'lampki świąteczne', 'ws2812b'], categoryCode: 3523, categoryName: 'Lighting & Electrical/Light sources/LED strips' },
    // Duvet Cover Set / Bedding
    { keywords: ['pościel', 'poszewk', 'nevresim', 'kołdr', 'quilt', 'bedding', 'zestaw pościeli'], categoryCode: 3690, categoryName: 'Home Textiles/Carpets and bedroom sets/Duvet covers' },
    // Automatic Curtain & Motor Smart Home
    { keywords: ['curtain', 'shutter', 'roleta', 'motor', 'perde', 'electric shutter', 'silnik rolety'], categoryCode: 2410, categoryName: 'AC & Heating/Smart Home/Smart home control panels and modules' },
    // Pet Beds / Dog & Cat
    { keywords: ['psa', 'pies', 'kot', 'köpek', 'kedi', 'legowisk', 'pet bed', 'dom dla psa', 'mata dla psa'], categoryCode: 1344, categoryName: 'For pets/Furniture and transport for domestic animals/Pet beds, pillows and mattresses' },
    // Smart Watches
    { keywords: ['smartwatch', 'smart watch', 'zegarek', 'akıllı saat', 'watch10', 'gps track'], categoryCode: 2920, categoryName: 'Smart technology/Smartwatch' },
    // CarPlay & Car Adapters
    { keywords: ['carplay', 'mirror link', 'adapter samochod', 'oto teyp', 'car adapter'], categoryCode: 320, categoryName: 'Car Electronics/GPS Navigation Systems & Auto-Moto Electronics/Electronic car accessories' },
    // Diffuser & Aromatherapy
    { keywords: ['dyfuzor', 'diffuser', 'aromatherapy', 'olejków eterycznych', 'buhar'], categoryCode: 2799, categoryName: 'Apparatus for personal hygiene/Wellness articles/Aromatherapy and wellness appliances' },
    // Gamepads & Controllers
    { keywords: ['gamepad', 'kontroler gier', 'controller', 'oyun kolu', 'gra'], categoryCode: 582, categoryName: 'Consoles and Games/Controllers, steering wheels and gaming headsets' },
    // Media Player / TV Box / TV Stick
    { keywords: ['tv box', 'tv stick', 'media player', 'android tv', 'h20pro', 'mx10'], categoryCode: 75, categoryName: 'Audio-Video & HiFi/Home audio and video/Media players' },
    // Keyboards
    { keywords: ['klawiatura', 'keyboard', 'klavye', 'klawiatura mechaniczna'], categoryCode: 10, categoryName: 'PC Peripherals/Periphery/Keyboards' },
    // Mice
    { keywords: ['mysz', 'mouse', 'fare', 'mysz do gier', 'attack shark'], categoryCode: 11, categoryName: 'PC Peripherals/Periphery/Mice' },
    // IP Camera & Surveillance
    { keywords: ['kamera', 'camera', 'surveillance', 'ip camera', 'bezprzewodowa kamera'], categoryCode: 407, categoryName: 'Servers and Computer Accessories/Security and surveillance systems/Surveillance cameras' },
    // Power Drills / Electric Tools
    { keywords: ['wkrętarka', 'wiertarka', 'drill', 'matkap', 'makita'], categoryCode: 127, categoryName: 'DIY/Electrical equipment/Drills and screwdrivers' },
    // Storage Racks & Holders
    { keywords: ['stojak', 'storage', 'racks', 'organizer', 'półka', 'przechowywania'], categoryCode: 3426, categoryName: 'House Cleaning/Cleaning and maintenance/Organisation and storage' },
    // Shoes & Boots
    { keywords: ['botki', 'boots', 'snow boots', 'buty dziecięce', 'flats', 'hobibear', 'ayakkabı'], categoryCode: 4061, categoryName: "Sports clothing & footwear/Navigation & Canoeing/Women's sports boots" },
    { keywords: ['dance shoes', 'salsa', 'tango', 'ballroom', 'scarpe da ballo'], categoryCode: 4057, categoryName: "Sports clothing & footwear/Navigation & Canoeing/Women's sports shoes" },
    // Jackets & Leather
    { keywords: ['kurtka', 'jacket', 'ceket', 'skóra', 'faux leather', 'motocyklowy'], categoryCode: 2677, categoryName: "Apparel Woman/Women's clothing/Women's jackets" },
    // Sweaters & Knitwear
    { keywords: ['sukienka', 'sweater', 'sweter', 'wool', 'kazak', 'wełna'], categoryCode: 2679, categoryName: "Apparel Woman/Women's clothing/Women's sweaters" },
    // Trousers & Leggings
    { keywords: ['leggins', 'spodnie', 'trousers', 'pants', 'tayt', 'pantolon'], categoryCode: 2673, categoryName: "Apparel Woman/Women's clothing/Women's trousers" },
    // Scooter / Motorcycle Accessories
    { keywords: ['hulajnoga', 'scooter', 'podnóżki', 'ktm', 'xiaomi 4 lite'], categoryCode: 2936, categoryName: 'Parts for cars/Scooters, ATVs and other vehicles/Motorcycle Accessories' },
    // Car Testers & Diagnostic Tools
    { keywords: ['tester akumulatora', 'diagnostic', 'lexia', 'pp2000', 'diagbox', 'kw650'], categoryCode: 2572, categoryName: 'Car Accessories/Professional equipment/Car testers' },
    // Ceiling & Wall Lights
    { keywords: ['lampa sufitowa', 'ceiling light', 'tavan lambası', 'lampa do salonu'], categoryCode: 366, categoryName: 'Lighting & Electrical/Sconces and ceiling lights' },
    // Exhaust Fan
    { keywords: ['wentylator wyciągowy', 'exhaust fan', 'havalandırma fanı'], categoryCode: 2838, categoryName: 'Sanitation/Ventilation systems' }
  ];

  for (const rule of rulePatterns) {
    if (rule.keywords.some(k => titleLower.includes(k) || prodType.includes(k))) {
      return {
        categoryId: rule.categoryCode,
        categoryName: rule.categoryName,
        source: 'EXCEL_TYPE',
        matchDetail: `Katalog Kuralı: ${rule.categoryName}`,
        characteristics: KNOWN_CATEGORY_CHARACTERISTICS[rule.categoryCode]
      };
    }
  }

  // PRIORITY 4: Token scoring across all 1,735 eMAG Bulgaria allowed categories
  const words = extractKeywords(title);
  let bestMatch: any = null;
  let highestScore = 0;

  for (const cat of (allowedCategoriesData as any[])) {
    const catNameLower = (cat.name || '').toLowerCase();
    let score = 0;
    for (const w of words) {
      if (catNameLower.includes(w)) score += 3;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = cat;
    }
  }

  if (bestMatch && highestScore >= 3) {
    const catId = Number(bestMatch.id);
    return {
      categoryId: catId,
      categoryName: bestMatch.name,
      source: 'EMAG_TAXONOMY',
      matchDetail: `eMAG Taksonomi Eşleşmesi (Puan: ${highestScore})`,
      characteristics: KNOWN_CATEGORY_CHARACTERISTICS[catId] || [{ id: 'emag-brand', value: 'Generic' }]
    };
  }

  // PRIORITY 5: Safe fallback category (Organisation and storage - category 3426)
  return {
    categoryId: 3426,
    categoryName: 'House Cleaning/Cleaning and maintenance/Organisation and storage',
    source: 'FALLBACK',
    matchDetail: 'Genel ürün kategorisi',
    characteristics: [{ id: 'emag-brand', value: 'Generic' }]
  };
}
