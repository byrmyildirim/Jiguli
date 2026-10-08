import { AllegroCategory } from '../types/allegro';

export interface EmagCharacteristicDef {
  id: string;
  name: string;
  trName: string;
  required: boolean;
  type: 'STRING' | 'DICTIONARY' | 'INTEGER' | 'FLOAT';
  options?: string[];
  unit?: string;
  placeholder?: string;
}

export interface EmagCategorySchema {
  id: string | number;
  numericId: number;
  name: string;
  trName: string;
  badge?: string;
  isRecommended?: boolean;
  characteristics: EmagCharacteristicDef[];
}

export const EMAG_CATEGORY_SCHEMAS: EmagCategorySchema[] = [
  {
    id: '257548',
    numericId: 257548,
    name: 'Taśmy LED, Oświetlenie Smart & Taśmy COB',
    trName: 'RGB LED Şerit, Akıllı Aydınlatma & COB Şeritler (İzinli)',
    badge: 'İzinli / LED',
    isRecommended: true,
    characteristics: [
      { id: 'emag-brand', name: 'Brand (Marka)', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic / Tuya / TitanTech' },
      { id: 'emag-color', name: 'Tip Lumina & Culoare', trName: 'Işık Rengi / Renk', required: true, type: 'DICTIONARY', options: ['RGB Multicolor + CCT (3500K-6000K)', 'RGB Multicolor (16 Milyon Renk)', 'Alb Cald (3000K-3500K)', 'Alb Neutru (4000K-5000K)', 'Alb Rece (6000K-6500K)', 'RGBW (RGB + Alb)'] },
      { id: 'emag-light-length', name: 'Lungime Banda (Uzunluk)', trName: 'Şerit Uzunluğu', required: true, type: 'DICTIONARY', options: ['2 m', '1 m', '3 m', '5 m', '10 m', 'Set 1/2/3/5M'] },
      { id: 'emag-voltage', name: 'Tensiune Alimentare (Voltaj)', trName: 'Besleme Voltajı', required: true, type: 'DICTIONARY', options: ['5V (USB Port)', '12V DC', '24V DC', '220V-240V AC'] },
      { id: 'emag-protocol', name: 'Protocol & Conectivitate', trName: 'Bağlantı & Protokol', required: true, type: 'DICTIONARY', options: ['Tuya Zigbee 3.0', 'Wi-Fi 2.4GHz (Tuya/Smart Life)', 'Bluetooth BLE Mesh', 'Telecomanda IR / RF 2.4GHz', 'USB Direct Plug & Play'] },
      { id: 'emag-smart-compat', name: 'Compatibilitate Smart Home', trName: 'Akıllı Ev Uyumluluğu', required: true, type: 'DICTIONARY', options: ['Tuya / Smart Life / Alexa / Google Home', 'Tuya Zigbee Gateway Gerektirir', 'Universal Wi-Fi (Hub Gerektirmez)', 'Home Assistant / Zigbee2MQTT'] },
      { id: 'emag-ip-rating', name: 'Grad de Protectie (IP)', trName: 'Su/Toz Geçirmezlik', required: false, type: 'DICTIONARY', options: ['IP20 (Interior)', 'IP65 (Silikon Kaplama Suya Dayanıklı)', 'IP67 / IP68 (Dış Mekan)'] },
      { id: 'emag-led-type', name: 'Tip Tehnologie LED', trName: 'LED Teknolojisi', required: false, type: 'DICTIONARY', options: ['COB Liniar (Pürüzsüz Noktasız Işık)', 'SMD 5050 RGB', 'SMD 2835 High Brightness', 'WS2812B Adreslenebilir Dijital'] }
    ]
  },
  {
    id: '6001',
    numericId: 257548,
    name: 'Iluminat Decorativ (Yetkisiz -> 257548 Eşlendi)',
    trName: 'Dekoratif LED Aydınlatma (257548 İzinli)',
    badge: 'Otomatik Eşleme',
    isRecommended: false,
    characteristics: [
      { id: 'emag-brand', name: 'Brand (Marka)', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic / Tuya' },
      { id: 'emag-color', name: 'Tip Lumina & Culoare', trName: 'Işık Rengi / Renk', required: true, type: 'DICTIONARY', options: ['RGB Multicolor (Çok Renkli)', 'RGB Multicolor + CCT', 'Alb Cald (3000K-3500K)', 'Alb Rece (6000K-6500K)'] },
      { id: 'emag-light-length', name: 'Lungime Banda (Uzunluk)', trName: 'Şerit Uzunluğu', required: true, type: 'DICTIONARY', options: ['2 m', '1 m', '3 m', '5 m'] },
      { id: 'emag-voltage', name: 'Tensiune Alimentare (Voltaj)', trName: 'Besleme Voltajı', required: true, type: 'DICTIONARY', options: ['5V (USB Port)', '12V DC', '220V AC'] },
      { id: 'emag-protocol', name: 'Protocol & Conectivitate', trName: 'Bağlantı & Protokol', required: true, type: 'DICTIONARY', options: ['Tuya WiFi & Bluetooth Çift Mod', 'Tuya Zigbee 3.0', 'Bluetooth App'] }
    ]
  },
  {
    id: '202',
    numericId: 202,
    name: 'Smart Home, Senzori & Intrerupatoare Zigbee/WiFi',
    trName: 'Akıllı Ev, Zigbee & Sensör Sistemleri',
    badge: 'Popüler',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Tuya / Smart Life / Sonoff' },
      { id: 'emag-protocol', name: 'Protocol Wireless', trName: 'Kablosuz Protokol', required: true, type: 'DICTIONARY', options: ['Zigbee 3.0', 'Wi-Fi 2.4 GHz', 'Bluetooth BLE', 'RF 433 MHz'] },
      { id: 'emag-voltage', name: 'Tip Alimentare', trName: 'Besleme Kaynağı', required: true, type: 'DICTIONARY', options: ['USB 5V 1A/2A', 'Baterie CR2032 / CR2450', '230V AC Faza + Nul', '230V AC Fara Nul'] },
      { id: 'emag-smart-compat', name: 'Compatibilitate Aplicatie', trName: 'Desteklenen Uygulama', required: true, type: 'DICTIONARY', options: ['Tuya Smart & Smart Life', 'Home Assistant', 'Amazon Alexa & Google Assistant', 'Apple HomeKit'] },
      { id: 'emag-color', name: 'Culoare Carcasa', trName: 'Gövde Rengi', required: true, type: 'DICTIONARY', options: ['Alb (Beyaz)', 'Negru (Siyah)', 'Gri (Gri)'] }
    ]
  },
  {
    id: '101',
    numericId: 101,
    name: 'Gadgeturi, Smartwatch & Wearables',
    trName: 'Akıllı Saatler & Giyilebilir Teknoloji',
    badge: 'Yetki Gerekebilir',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: TitanTech / Omni' },
      { id: 'emag-color', name: 'Culoare Carcasa / Curea', trName: 'Kasa / Kordon Rengi', required: true, type: 'DICTIONARY', options: ['Negru (Siyah)', 'Argintiu (Gümüş)', 'Auriu (Altın)', 'Gri (Gri)', 'Albastru (Mavi)'] },
      { id: 'emag-compat', name: 'Compatibilitate Sistem', trName: 'Sistem Uyumluluğu', required: true, type: 'DICTIONARY', options: ['Universal (Android & iOS)', 'Android', 'iOS'] },
      { id: 'emag-type', name: 'Tip Dispozitiv', trName: 'Cihaz Tipi', required: true, type: 'DICTIONARY', options: ['Smartwatch', 'Bratara Fitness', 'Ceas Hibrid'] },
      { id: 'emag-conn', name: 'Conectivitate', trName: 'Bağlantı', required: false, type: 'DICTIONARY', options: ['Bluetooth 5.3 + GPS', 'Bluetooth 5.2', 'Wi-Fi + Bluetooth', 'NFC'] },
      { id: 'emag-material', name: 'Material Carcasa', trName: 'Kasa Materyali', required: false, type: 'DICTIONARY', options: ['Aluminiu & Titan', 'Otel Inoxidabil', 'Plastic ABS & Silicon'] }
    ]
  },
  {
    id: '104',
    numericId: 104,
    name: 'TV, Audio-Video & Casti Wireless TWS',
    trName: 'Ses Sistemleri, Kulaklık & Hoparlörler',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic / SoundPro' },
      { id: 'emag-color', name: 'Culoare', trName: 'Renk', required: true, type: 'DICTIONARY', options: ['Negru (Siyah)', 'Alb (Beyaz)', 'Albastru (Mavi)', 'Roz (Pembe)'] },
      { id: 'emag-type', name: 'Tip Casti / Dispozitiv', trName: 'Kulaklık Türü', required: true, type: 'DICTIONARY', options: ['In-Ear TWS (Kulak İçi)', 'Over-Ear (Kulak Üstü)', 'Boxa Portabila Bluetooth'] },
      { id: 'emag-conn', name: 'Versiune Bluetooth', trName: 'Bluetooth Sürümü', required: true, type: 'DICTIONARY', options: ['Bluetooth 5.3', 'Bluetooth 5.2', 'Wireless 2.4GHz + Dongle'] },
      { id: 'emag-anc', name: 'Anulare Activa a Zgomotului (ANC)', trName: 'Aktif Gürültü Engelleme', required: false, type: 'DICTIONARY', options: ['Da (ANC + ENC)', 'Doar ENC Microfon', 'Nu'] }
    ]
  },
  {
    id: '124921',
    numericId: 124921,
    name: 'Accesorii Telefoane, Kable USB & Incarcatoare',
    trName: 'Telefon Aksesuarları, USB Kablolar & Şarj',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic / FastCharge' },
      { id: 'emag-color', name: 'Culoare', trName: 'Renk', required: true, type: 'DICTIONARY', options: ['Negru', 'Alb', 'Gri Metalic', 'Rosu'] },
      { id: 'emag-conntype', name: 'Tip Conector', trName: 'Kablo / Soket Tipi', required: true, type: 'DICTIONARY', options: ['USB Type-C', 'USB-A la USB-C', 'Lightning iPhone', '3 in 1 Universal (Type-C + Lightning + Micro-USB)'] },
      { id: 'emag-power', name: 'Putere Maxima / Curent', trName: 'Maksimum Güç', required: true, type: 'DICTIONARY', options: ['Fast Charge 5V/3A 15W-30W', 'Super Fast 65W-100W PD', 'Standard 5V/2A 10W'] }
    ]
  },
  {
    id: '106',
    numericId: 106,
    name: 'Casa, Gradina, Bricolaj & Iluminat Interior',
    trName: 'Ev, Yaşam, Bahçe & İç Mekan Aydınlatma',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: HomeSmart' },
      { id: 'emag-color', name: 'Culoare Principala', trName: 'Ana Renk', required: true, type: 'DICTIONARY', options: ['Alb', 'Negru', 'Argintiu', 'Multicolor'] },
      { id: 'emag-material', name: 'Material', trName: 'Materyal', required: true, type: 'DICTIONARY', options: ['Plastic ABS & Policarbonat', 'Metal / Aluminiu', 'Sticla', 'Lemn'] },
      { id: 'emag-use', name: 'Destinatie Utilizare', trName: 'Kullanım Alanı', required: true, type: 'DICTIONARY', options: ['Dormitor & Sufragerie (İç Mekan)', 'Bucatarie', 'Birou & Gaming Setup', 'Exterior'] }
    ]
  },
  {
    id: '3690',
    numericId: 3690,
    name: 'Textile Casa, Lenjerii de pat & Cuverturi',
    trName: 'Ev Tekstili, Nevresim Takımları & Yatak Örtüleri',
    badge: 'Ev & Yaşam',
    isRecommended: true,
    characteristics: [
      { id: 'emag-brand', name: 'Brand (Marka)', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic / HomeStyle' },
      { id: 'emag-product-type', name: 'Tip Produs (Ürün Türü)', trName: 'Ürün Türü', required: true, type: 'DICTIONARY', options: ['Set Lenjerie de pat (Nevresim Takımı)', 'Husa pilota (Yorgan Kılıfı)', 'Fete de perna (Yastık Kılıfı)', 'Cearsaf (Çarşaf)', 'Cuvertura (Yatak Örtüsü)'] },
      { id: 'emag-pieces', name: 'Numar Piese/Set (Parça Sayısı)', trName: 'Parça Sayısı', required: true, type: 'DICTIONARY', options: ['3 Piese (3 Parça)', '2 Piese (2 Parça)', '4 Piese (4 Parça)', '6 Piese (6 Parça)', '1 Piesa (Tekli)'] },
      { id: 'emag-material', name: 'Material (Kumaş/Materyal)', trName: 'Kumaş / Materyal', required: true, type: 'DICTIONARY', options: ['Microfibra (Mikrofiber)', '100% Bumbac (Pamuk)', 'Bumbac Satinat (Saten Pamuk)', 'Finet', 'Poliester', 'In (Keten)'] },
      { id: 'emag-color', name: 'Culoare Principala (Ana Renk)', trName: 'Renk', required: true, type: 'DICTIONARY', options: ['Rosu (Kırmızı)', 'Multicolor (Çok Renkli/Desenli)', 'Alb (Beyaz)', 'Gri (Gri)', 'Verde (Yeşil)', 'Albastru (Mavi)', 'Bej (Bej)'] },
      { id: 'emag-size', name: 'Dimensiuni (Ebat / Ölçü)', trName: 'Ölçü / Boyut', required: true, type: 'DICTIONARY', options: ['160x200 cm + 2x 70x80 cm', '200x220 cm + 2x 70x80 cm', '140x200 cm + 1x 70x80 cm', '220x240 cm (King Size)'] },
      { id: 'emag-theme', name: 'Stil & Tema (Tema/Stil)', trName: 'Stil & Tema', required: false, type: 'DICTIONARY', options: ['Craciun / Sarbatori (Yılbaşı/Noel)', 'Rustic / Wiejski (Kır/Rustik)', 'Modern / Geometric (Modern)', 'Floral (Çiçekli)', 'Clasic (Klasik)'] },
      { id: 'emag-closure', name: 'Tip Inchidere (Kapanış)', trName: 'Kapanış Türü', required: false, type: 'DICTIONARY', options: ['Fermoar (Fermuarlı)', 'Nasturi (Düğmeli)', 'Plic / Petrecut (Geçmeli)'] }
    ]
  },
  {
    id: '5342',
    numericId: 5342,
    name: 'Decoratiuni Casa & Ozdoby Świąteczne',
    trName: 'Ev Dekorasyonu, Yılbaşı Süsleri & Aksesuarlar',
    badge: 'Dekorasyon',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: HomeDecor' },
      { id: 'emag-color', name: 'Culoare', trName: 'Renk', required: true, type: 'DICTIONARY', options: ['Rosu (Kırmızı)', 'Auriu (Altın)', 'Argintiu (Gümüş)', 'Multicolor', 'Alb (Beyaz)'] },
      { id: 'emag-theme', name: 'Tema', trName: 'Tema', required: true, type: 'DICTIONARY', options: ['Craciun / Iarna (Yılbaşı/Kış)', 'Rustic / Vintage', 'Modern'] },
      { id: 'emag-material', name: 'Material', trName: 'Materyal', required: false, type: 'DICTIONARY', options: ['Textil / Bumbac', 'Lemn (Ahşap)', 'Ceramica (Seramik)', 'Plastic'] }
    ]
  },
  {
    id: '1454',
    numericId: 1454,
    name: 'Fashion, Imbracaminte & Accesorii',
    trName: 'Moda, Giyim & Aksesuar',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: OmniStyle' },
      { id: 'emag-size', name: 'Marime', trName: 'Beden', required: true, type: 'DICTIONARY', options: ['S', 'M', 'L', 'XL', 'XXL', 'Oversize', 'Universal'] },
      { id: 'emag-color', name: 'Culoare', trName: 'Renk', required: true, type: 'DICTIONARY', options: ['Negru', 'Alb', 'Gri', 'Bleumarin', 'Bej'] },
      { id: 'emag-material', name: 'Material', trName: 'Kumaş / Materyal', required: true, type: 'DICTIONARY', options: ['100% Bumbac (Pamuk)', 'Bumbac cu Elastan', 'Poliester', 'In'] },
      { id: 'emag-gender', name: 'Gen', trName: 'Cinsiyet', required: true, type: 'DICTIONARY', options: ['Unisex', 'Barbati (Erkek)', 'Femei (Kadın)'] }
    ]
  },
  {
    id: '3122',
    numericId: 3122,
    name: 'Pentru Animale > Caini > Culcusuri, perne & cosuri caini',
    trName: 'Evcil Hayvan & Köpek Yatakları, Minder ve Kulübeler',
    badge: 'Pet Shop',
    isRecommended: true,
    characteristics: [
      { id: 'emag-brand', name: 'Brand (Marka)', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic / PetComfort' },
      { id: 'emag-pet-type', name: 'Destinat Pentru (Evcil Hayvan)', trName: 'Hayvan Türü', required: true, type: 'DICTIONARY', options: ['Caini si Pisici (Köpek & Kedi)', 'Caini (Köpek)', 'Pisici (Kedi)'] },
      { id: 'emag-product-type', name: 'Tip Produs (Ürün Türü)', trName: 'Ürün Türü', required: true, type: 'DICTIONARY', options: ['Culcus & Saltea (Yatak & Minder)', 'Culcus tip Casuta (Ev / Kulübe)', 'Saltea Impermeabila (Su Geçirmez Mat)', 'Perna Calduroasa (Sıcak Minder)', 'Cos Textil (Sepet Yatak)'] },
      { id: 'emag-material', name: 'Material (Kumaş/Materyal)', trName: 'Kumaş / Materyal', required: true, type: 'DICTIONARY', options: ['Oxford Impermeabil & Plus Calduros', 'Plus Moale (Yumuşak Peluş)', 'Bumbac & Poliester', 'Spuma cu Memorie (Ortopedik Visco)', 'Textil Rezistent la Zgarieturi'] },
      { id: 'emag-color', name: 'Culoare Principala (Renk)', trName: 'Renk', required: true, type: 'DICTIONARY', options: ['Multicolor (Kare Desenli / Renkli)', 'Gri (Gri)', 'Maro (Kahverengi)', 'Negru (Siyah)', 'Albastru (Mavi)', 'Bej (Bej)'] },
      { id: 'emag-size', name: 'Talie / Dimensiuni (Büyüklük)', trName: 'Köpek / Kedi Ebadı', required: true, type: 'DICTIONARY', options: ['Toate Taliile (Tüm Irklar / Universal)', 'Mare (Büyük Irk)', 'Medie (Orta Irk)', 'Mica (Küçük Irk)'] },
      { id: 'emag-benefit', name: 'Beneficii / Proprietati (Özellikler)', trName: 'Öne Çıkan Özellikler', required: false, type: 'DICTIONARY', options: ['Impermeabil & Calduros de Iarna (Su Geçirmez & Kışlık Sıcak)', 'Husa Detasabila & Lavabila (Yıkanabilir Fermuarlı Kılıf)', 'Baza Antiderapanta (Kaymaz Taban)', 'Ortopedic (Eklem Destekli)'] }
    ]
  },
  {
    id: '3125',
    numericId: 3125,
    name: 'Pentru Animale > Pisici > Culcusuri, paturi & perne pisici',
    trName: 'Kedi Yatakları, Minderler & Kulübeler',
    badge: 'Pet Shop',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic' },
      { id: 'emag-product-type', name: 'Tip Produs', trName: 'Ürün Türü', required: true, type: 'DICTIONARY', options: ['Culcus Inchis (Kapalı Kedi Kulübesi)', 'Perna Termica (Sıcak Minder)', 'Culcus Pufos (Tüylü Yatak)'] },
      { id: 'emag-material', name: 'Material', trName: 'Malzeme', required: true, type: 'DICTIONARY', options: ['Plus Moale', 'Textil Calduros', 'Bumbac'] }
    ]
  },
  {
    id: '3120',
    numericId: 3120,
    name: 'Pentru Animale de Companie > Accesorii Generale',
    trName: 'Evcil Hayvan Genel Aksesuarları',
    characteristics: [
      { id: 'emag-brand', name: 'Brand', trName: 'Marka', required: true, type: 'STRING', placeholder: 'Örn: Generic' },
      { id: 'emag-use', name: 'Utilizare', trName: 'Kullanım Alanı', required: true, type: 'DICTIONARY', options: ['Interior', 'Exterior', 'Voiaj'] }
    ]
  }
];

/**
 * Intelligent Attribute Auto-Detection Engine:
 * Analyzes product title, SKU, EAN, description, and source category to extract marketplace characteristics.
 */
export function autoDetectAttributesFromProduct(product: {
  title?: string;
  name?: string;
  sku?: string;
  ean?: string;
  brand?: string;
  description?: string;
  categoryName?: string;
  categoryCode?: string;
}): {
  detectedCategory: string;
  emagCategoryId: string;
  allegroCategoryId: string;
  allegroParams: Record<string, string>;
  emagCharacteristics: Record<string, string>;
} {
  const rawCat = `${product.categoryCode || ''} ${product.categoryName || ''}`.toLowerCase();
  const titleText = `${product.title || product.name || ''} ${product.description || ''} ${product.sku || ''}`.toLowerCase();
  const text = `${titleText} ${rawCat}`.toLowerCase();
  const brand = product.brand || 'Generic';
  const ean = product.ean || '5901701699270';
  const sku = product.sku || 'SKU-3669756';

  // 0. PET ACCESSORIES & BEDS (Evcil Hayvan, Köpek/Kedi Yatakları, Legowiska dla psa/kota)
  const isPetProduct =
    rawCat.includes('3122') ||
    rawCat.includes('3125') ||
    rawCat.includes('3120') ||
    rawCat.includes('zwierz') ||
    rawCat.includes('pies') ||
    rawCat.includes('psa') ||
    rawCat.includes('kot') ||
    rawCat.includes('legowisk') ||
    rawCat.includes('culcus') ||
    rawCat.includes('pet') ||
    rawCat.includes('dog') ||
    rawCat.includes('cat') ||
    rawCat.includes('evcil') ||
    rawCat.includes('köpek') ||
    rawCat.includes('kedi') ||
    titleText.includes('dom dla psa') ||
    titleText.includes('mata dla psa') ||
    titleText.includes('łóżko dla kota') ||
    titleText.includes('łóżko dla psa') ||
    titleText.includes('legowisko') ||
    titleText.includes('dla psa') ||
    titleText.includes('dla kota') ||
    titleText.includes('psa') ||
    titleText.includes('pies') ||
    titleText.includes('kota') ||
    titleText.includes('kot') ||
    titleText.includes('köpek yatağı') ||
    titleText.includes('kedi yatağı') ||
    titleText.includes('evcil hayvan') ||
    titleText.includes('pet bed') ||
    titleText.includes('dog bed') ||
    titleText.includes('cat bed') ||
    titleText.includes('culcus');

  if (isPetProduct) {
    const size = titleText.includes('dużego')
      ? 'Mare (Büyük Irk)'
      : titleText.includes('małego')
      ? 'Mica (Küçük Irk)'
      : 'Toate Taliile (Tüm Irklar / Universal)';

    const productType = titleText.includes('dom dla') || titleText.includes('ev')
      ? 'Culcus tip Casuta (Ev / Kulübe)'
      : titleText.includes('mata') || titleText.includes('mat')
      ? 'Saltea Impermeabila (Su Geçirmez Mat)'
      : 'Culcus & Saltea (Yatak & Minder)';

    const isWaterproof = titleText.includes('wodoodporn') || titleText.includes('su geçirmez') || titleText.includes('waterproof');
    const isWarm = titleText.includes('ciepły') || titleText.includes('zimow') || titleText.includes('kışlık') || titleText.includes('warm');

    const benefitVal = isWaterproof && isWarm
      ? 'Impermeabil & Calduros de Iarna (Su Geçirmez & Kışlık Sıcak)'
      : isWaterproof
      ? 'Impermeabil (Su Geçirmez Kumaş)'
      : 'Baza Antiderapanta (Kaymaz Taban)';

    // Directly use valid numeric category code from Excel if provided
    const targetPetEmagCat = (product.categoryCode && /^\d+$/.test(product.categoryCode) && product.categoryCode !== '0' && product.categoryCode !== '257548')
      ? product.categoryCode
      : '3122';

    return {
      detectedCategory: 'Evcil Hayvan & Köpek/Kedi Yatakları, Minder ve Kulübeler',
      emagCategoryId: targetPetEmagCat,
      allegroCategoryId: '3122',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy',
        '225694': ean,
        'pet_type': 'dla psów i kotów',
        'waterproof': isWaterproof ? 'tak' : 'nie',
        'season': isWarm ? 'zimowe' : 'całoroczne'
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-pet-type': 'Caini si Pisici (Köpek & Kedi)',
        'emag-product-type': productType,
        'emag-material': isWaterproof ? 'Oxford Impermeabil & Plus Calduros' : 'Plus Moale (Yumuşak Peluş)',
        'emag-color': 'Multicolor (Kare Desenli / Renkli)',
        'emag-size': size,
        'emag-benefit': benefitVal
      }
    };
  }

  // 1. HOME TEXTILES, BEDDING & DECOR (Ev Tekstili, Nevresim Takımı, Yatak Örtüsü, Pościel)
  const isHomeTextiles =
    rawCat.includes('3690') ||
    rawCat.includes('textil') ||
    rawCat.includes('pościel') ||
    rawCat.includes('poszewk') ||
    rawCat.includes('bedding') ||
    rawCat.includes('carpet') ||
    titleText.includes('pościel') ||
    titleText.includes('poszewk') ||
    titleText.includes('kołdr') ||
    titleText.includes('prześcieradł') ||
    titleText.includes('zestaw pościeli') ||
    titleText.includes('nevresim') ||
    titleText.includes('yatak örtü') ||
    titleText.includes('çarşaf') ||
    titleText.includes('lenjerie de pat') ||
    titleText.includes('mikrofibr') ||
    titleText.includes('poduszk');

  if (isHomeTextiles) {
    const pieces = titleText.includes('3-części') || titleText.includes('3 części') || titleText.includes('3 pcs') || titleText.includes('3 parça')
      ? '3 Piese (3 Parça)'
      : titleText.includes('2-części') || titleText.includes('2 części') || titleText.includes('2 parça')
      ? '2 Piese (2 Parça)'
      : titleText.includes('4-części') || titleText.includes('4 części')
      ? '4 Piese (4 Parça)'
      : '3 Piese (3 Parça)';

    const material = titleText.includes('mikrofibr') || titleText.includes('microfib')
      ? 'Microfibra (Mikrofiber)'
      : titleText.includes('satyn') || titleText.includes('saten')
      ? 'Bumbac Satinat (Saten Pamuk)'
      : titleText.includes('bawełn') || titleText.includes('pamuk') || titleText.includes('cotton')
      ? '100% Bumbac (Pamuk)'
      : 'Microfibra (Mikrofiber)';

    const color = titleText.includes('czerwon') || titleText.includes('kırmızı') || titleText.includes('red')
      ? 'Rosu (Kırmızı)'
      : titleText.includes('biał') || titleText.includes('beyaz') || titleText.includes('white')
      ? 'Alb (Beyaz)'
      : titleText.includes('szar') || titleText.includes('gri') || titleText.includes('grey')
      ? 'Gri (Gri)'
      : 'Multicolor (Çok Renkli/Desenli)';

    const theme = titleText.includes('świątecz') || titleText.includes('craciun') || titleText.includes('yılbaşı') || titleText.includes('noel') || titleText.includes('christmas')
      ? 'Craciun / Sarbatori (Yılbaşı/Noel)'
      : titleText.includes('wiejsk') || titleText.includes('rustic') || titleText.includes('köy')
      ? 'Rustic / Wiejski (Kır/Rustik)'
      : 'Modern / Geometric (Modern)';

    const allegroMaterial = material.includes('Microfibra') ? 'mikrofibra' : material.includes('Bumbac Satinat') ? 'satyna bawełniana' : 'bawełna';
    const allegroColor = color.includes('Rosu') ? 'czerwony' : color.includes('Alb') ? 'biały' : color.includes('Gri') ? 'szary' : 'wielokolorowy';

    return {
      detectedCategory: 'Ev Tekstili, Nevresim Takımları & Pościel',
      emagCategoryId: '3690',
      allegroCategoryId: '3690',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy',
        '225694': ean,
        '3691': 'komplet pościeli',
        '3692': pieces.includes('3') ? '3 części' : pieces.includes('2') ? '2 części' : '3 części',
        '3693': allegroMaterial,
        '2026': allegroColor,
        '3694': '160x200 cm',
        '3695': theme.includes('Craciun') ? 'świąteczny' : 'geometryczny',
        '3696': 'zamek błyskawiczny'
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-product-type': 'Set Lenjerie de pat (Nevresim Takımı)',
        'emag-pieces': pieces,
        'emag-material': material,
        'emag-color': color,
        'emag-size': '160x200 cm + 2x 70x80 cm',
        'emag-theme': theme,
        'emag-closure': 'Fermoar (Fermuarlı)'
      }
    };
  }

  const isCurtainMotor = text.includes('curtain') || text.includes('shutter') || text.includes('motor') || text.includes('roleta') || text.includes('perde');
  const isLed = (text.includes('led') || text.includes('strip') || text.includes('şerit') || text.includes('rgb') || text.includes('cob') || text.includes('lampa') || text.includes('light')) && !isCurtainMotor;
  const isSmartHome = isCurtainMotor || text.includes('zigbee') || text.includes('tuya') || text.includes('smart life') || text.includes('switch') || text.includes('sensor');
  const isWatch = text.includes('watch') || text.includes('saat') || text.includes('smartwatch') || text.includes('band') || text.includes('bileklik');
  const isAudio = text.includes('headphone') || text.includes('kulaklık') || text.includes('earphone') || text.includes('tws') || text.includes('speaker') || text.includes('hoparlör') || text.includes('bluetooth');
  const isPhoneAcc = text.includes('cable') || text.includes('kablo') || text.includes('charger') || text.includes('şarj') || text.includes('holder') || text.includes('tutucu') || text.includes('usb');
  const isFashion = text.includes('t-shirt') || text.includes('shirt') || text.includes('giyim') || text.includes('tişört') || text.includes('pantolon');

  if (isLed) {
    // LED Light & Strip setup
    let color = 'RGB Multicolor + CCT (3500K-6000K)';
    if (text.includes('3500k') && text.includes('6000k')) color = 'RGB Multicolor + CCT (3500K-6000K)';
    else if (text.includes('rgbw')) color = 'RGBW (RGB + Alb)';
    else if (text.includes('rgb')) color = 'RGB Multicolor (16 Milyon Renk)';

    let length = '2 m';
    if (text.includes('5m') || text.includes('5 m')) length = '5 m';
    else if (text.includes('3m') || text.includes('3 m')) length = '3 m';
    else if (text.includes('1m') || text.includes('1 m')) length = '1 m';
    else if (text.includes('1/2/3/5m')) length = 'Set 1/2/3/5M';

    let voltage = '5V (USB Port)';
    if (text.includes('12v')) voltage = '12V DC';
    else if (text.includes('24v')) voltage = '24V DC';
    else if (text.includes('220v')) voltage = '220V-240V AC';

    let protocol = 'Tuya Zigbee 3.0';
    if (text.includes('zigbee')) protocol = 'Tuya Zigbee 3.0';
    else if (text.includes('wifi') || text.includes('wi-fi')) protocol = 'Wi-Fi 2.4GHz (Tuya/Smart Life)';
    else if (text.includes('bluetooth')) protocol = 'Bluetooth BLE Mesh';

    let ledType = 'COB Liniar (Pürüzsüz Noktasız Işık)';
    if (text.includes('cob')) ledType = 'COB Liniar (Pürüzsüz Noktasız Işık)';
    else if (text.includes('5050')) ledType = 'SMD 5050 RGB';
    else if (text.includes('ws2812b')) ledType = 'WS2812B Adreslenebilir Dijital';

    return {
      detectedCategory: 'RGB LED Şerit, Akıllı Aydınlatma & COB Şeritler (İzinli)',
      emagCategoryId: '257548',
      allegroCategoryId: '12800',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy (Sıfır/Yeni)',
        '225694': ean,
        '12801': color,
        '12802': length,
        '12803': voltage,
        '12804': protocol,
        '12805': 'IP20 (Do wnętrz)',
        '12806': ledType
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-color': color,
        'emag-light-length': length,
        'emag-voltage': voltage,
        'emag-protocol': protocol,
        'emag-smart-compat': 'Tuya / Smart Life / Alexa / Google Home',
        'emag-ip-rating': 'IP20 (Interior)',
        'emag-led-type': ledType
      }
    };
  }

  if (isSmartHome) {
    return {
      detectedCategory: 'Akıllı Ev & Sensörler',
      emagCategoryId: '202',
      allegroCategoryId: '12900',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy',
        '225694': ean,
        '12901': 'Tuya Smart Life',
        '12902': text.includes('5v') ? 'USB 5V' : 'Bateryjne (CR2032/CR2450)'
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-protocol': text.includes('zigbee') ? 'Zigbee 3.0' : 'Tuya WiFi 2.4GHz',
        'emag-app': 'Tuya Smart & Smart Life',
        'emag-power': text.includes('usb') ? 'USB 5V' : text.includes('battery') || text.includes('bater') ? 'Pilli (CR2032/CR2450)' : '220V AC Motor Besleme',
        'emag-voltage': text.includes('5v') ? 'USB 5V 1A/2A' : '220V AC',
        'emag-smart-compat': 'Tuya Smart & Smart Life',
        'emag-color': 'Alb (Beyaz)'
      }
    };
  }

  if (isAudio) {
    return {
      detectedCategory: 'Ses Sistemleri & Kulaklık',
      emagCategoryId: '104',
      allegroCategoryId: '66887',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy',
        '225694': ean,
        '891': 'Bluetooth 5.3',
        '892': 'Dokanałowe (Kulak İçi)',
        '893': 'Tak (Evet)'
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-color': 'Negru (Siyah)',
        'emag-type': 'In-Ear TWS (Kulak İçi)',
        'emag-conn': 'Bluetooth 5.3',
        'emag-anc': 'Doar ENC Microfon'
      }
    };
  }

  if (isPhoneAcc) {
    return {
      detectedCategory: 'Telefon & USB Aksesuarları',
      emagCategoryId: '124921',
      allegroCategoryId: '124921',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy',
        '225694': ean,
        '561': 'USB-C / USB-A',
        '562': 'Fast Charge 5V/3A 15W-65W'
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-color': 'Negru',
        'emag-conntype': 'USB Type-C',
        'emag-power': 'Fast Charge 5V/3A 15W-30W'
      }
    };
  }

  if (isFashion) {
    return {
      detectedCategory: 'Moda & Giyim',
      emagCategoryId: '1454',
      allegroCategoryId: '1454',
      allegroParams: {
        '11323': brand,
        '213': 'Nowy',
        '11324': 'L',
        '2026': 'Czarny',
        '11325': '100% Bawełna (Pamuk)',
        '11326': 'Unisex'
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-size': 'L',
        'emag-color': 'Negru',
        'emag-material': '100% Bumbac (Pamuk)',
        'emag-gender': 'Unisex'
      }
    };
  }

  // 7. General Home / Life (Ev, Yaşam & Dekorasyon)
  if (text.includes('ev') || text.includes('dom') || text.includes('casa') || text.includes('home') || text.includes('kuchnia') || text.includes('dekor') || text.includes('ozdob')) {
    return {
      detectedCategory: 'Ev, Yaşam & Dekorasyon',
      emagCategoryId: '106',
      allegroCategoryId: '5',
      allegroParams: {
        '11323': brand,
        '225693': sku,
        '213': 'Nowy',
        '225694': ean
      },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-color': 'Multicolor',
        'emag-material': 'Textil & Policarbonat',
        'emag-use': 'Dormitor & Sufragerie (İç Mekan)'
      }
    };
  }

  // Check if a specific supported categoryCode was provided
  if (product.categoryCode && EMAG_CATEGORY_SCHEMAS.some(s => String(s.id) === String(product.categoryCode))) {
    const schema = EMAG_CATEGORY_SCHEMAS.find(s => String(s.id) === String(product.categoryCode))!;
    const charMap: Record<string, string> = { 'emag-brand': brand };
    schema.characteristics.forEach(c => {
      if (c.options && c.options.length > 0) charMap[c.id] = c.options[0];
    });
    return {
      detectedCategory: schema.trName,
      emagCategoryId: String(schema.id),
      allegroCategoryId: String(schema.id),
      allegroParams: { '11323': brand, '213': 'Nowy', '225694': ean, '225693': sku },
      emagCharacteristics: charMap
    };
  }

  // Preserve any valid numeric categoryCode provided from Excel or upstream
  if (product.categoryCode && /^\d+$/.test(product.categoryCode) && product.categoryCode !== '0') {
    const rawNum = parseInt(product.categoryCode, 10);
    const resolvedEmagId = (rawNum === 6001 || rawNum > 65535) ? '257548' : String(product.categoryCode);
    return {
      detectedCategory: product.categoryName || `Excel Kategorisi (#${resolvedEmagId})`,
      emagCategoryId: resolvedEmagId,
      allegroCategoryId: String(product.categoryCode),
      allegroParams: { '11323': brand, '213': 'Nowy', '225694': ean, '225693': sku },
      emagCharacteristics: {
        'emag-brand': brand,
        'emag-model': product.title || product.name || 'Standart',
        'emag-warranty': '24'
      }
    };
  }

  // Default Smartwatch & Gadget setup (Category 101)
  return {
    detectedCategory: 'Akıllı Saatler & Giyilebilir Cihazlar',
    emagCategoryId: '101',
    allegroCategoryId: '101',
    allegroParams: {
      '11323': brand,
      '225693': sku,
      '213': 'Nowy (Sıfır/Yeni)',
      '225694': ean,
      '2026': 'Czarny (Siyah)',
      '2027': 'Android & iOS',
      '4588': 'IP68'
    },
    emagCharacteristics: {
      'emag-brand': brand,
      'emag-color': 'Negru (Siyah)',
      'emag-compat': 'Universal (Android & iOS)',
      'emag-type': 'Smartwatch',
      'emag-conn': 'Bluetooth 5.3 + GPS',
      'emag-material': 'Aluminiu & Titan'
    }
  };
}
