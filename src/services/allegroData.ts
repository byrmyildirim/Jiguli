import { AllegroCategory, AllegroCheckoutForm, AllegroOffer, PlatformConfig, PricingRule, InventorySyncRule } from '../types/allegro';

export const INITIAL_CATEGORIES: AllegroCategory[] = [
  {
    id: '42540',
    name: 'Elektronika (Electronics)',
    parentId: null,
    leaf: false,
  },
  {
    id: '257548',
    name: 'Elektronika > Smartwatche i opaski sportowe',
    parentId: '42540',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka (Brand)', type: 'STRING', required: true },
      { id: '225693', name: 'Kod producenta / Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan (Condition)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy (Sıfır/Yeni)' }, { id: '2', value: 'Używany (İkinci El)' }, { id: '3', value: 'Powystawowy (Teşhir)' }] },
      { id: '225694', name: 'EAN / GTIN Barkod (8-14 hane)', type: 'STRING', required: true },
      { id: '2026', name: 'Kolor koperty / paska', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Czarny (Siyah)' }, { id: '2', value: 'Srebrny (Gümüş)' }, { id: '3', value: 'Złoty (Altın)' }, { id: '4', value: 'Szary (Gri)' }, { id: '5', value: 'Niebieski (Mavi)' }] },
      { id: '2027', name: 'Kompatybilność systemowa', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Android & iOS' }, { id: '2', value: 'Tylko Android' }, { id: '3', value: 'Tylko iOS' }] },
      { id: '4588', name: 'Wodoszczelność (Klasa)', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'IP68' }, { id: '2', value: '5 ATM (50m)' }, { id: '3', value: '3 ATM (30m)' }, { id: '4', value: 'IP67' }] },
      { id: '4589', name: 'Przekątna ekranu', type: 'FLOAT', unit: 'cali', required: false }
    ]
  },
  {
    id: '12800',
    name: 'Elektronika > Oświetlenie LED > Taśmy LED & Smart Tuya/Zigbee',
    parentId: '42540',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka (Brand)', type: 'STRING', required: true },
      { id: '225693', name: 'Kod producenta / Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan (Condition)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy (Sıfır/Yeni)' }, { id: '2', value: 'Używany' }] },
      { id: '225694', name: 'EAN / GTIN Barkod', type: 'STRING', required: true },
      { id: '12801', name: 'Barwa światła (Işık Rengi)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'RGB + CCT (Multicolor + 3500K-6000K)' }, { id: '2', value: 'RGB (Multicolor)' }, { id: '3', value: 'Biały ciepły (3000K-3500K)' }, { id: '4', value: 'Biały neutralny (4000K-5000K)' }, { id: '5', value: 'Biały zimny (6000K-6500K)' }] },
      { id: '12802', name: 'Długość taśmy (Uzunluk)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: '2m' }, { id: '2', value: '1m' }, { id: '3', value: '3m' }, { id: '4', value: '5m' }, { id: '5', value: '10m' }] },
      { id: '12803', name: 'Napięcie zasilania (Voltaj)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: '5V (USB)' }, { id: '2', value: '12V' }, { id: '3', value: '24V' }, { id: '4', value: '230V' }] },
      { id: '12804', name: 'Protokół komunikacji (Bağlantı)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Tuya Zigbee 3.0' }, { id: '2', value: 'Wi-Fi 2.4GHz + Tuya' }, { id: '3', value: 'Bluetooth Mesh' }, { id: '4', value: 'Pilot IR / RF' }] },
      { id: '12805', name: 'Klasa szczelności IP (Su Geçirmezlik)', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'IP20 (Do wnętrz)' }, { id: '2', value: 'IP65 (Wodoodporna silikon)' }, { id: '3', value: 'IP68' }] },
      { id: '12806', name: 'Typ diody LED', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'COB Liniowa (Bezpunktowa)' }, { id: '2', value: 'SMD 5050 RGB' }, { id: '3', value: 'SMD 2835' }, { id: '4', value: 'WS2812B Adresowalna' }] }
    ]
  },
  {
    id: '12900',
    name: 'Elektronika > Smart Home > Czujniki & Przełączniki Zigbee/WiFi',
    parentId: '42540',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka', type: 'STRING', required: true },
      { id: '225693', name: 'Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }] },
      { id: '225694', name: 'EAN', type: 'STRING', required: true },
      { id: '12901', name: 'Ekosystem Smart Home', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Tuya Smart Life' }, { id: '2', value: 'Zigbee2MQTT / Home Assistant' }, { id: '3', value: 'Amazon Alexa & Google Home' }, { id: '4', value: 'Apple HomeKit' }] },
      { id: '12902', name: 'Zasilanie', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'USB 5V' }, { id: '2', value: 'Bateryjne (CR2032/CR2450)' }, { id: '3', value: 'Sieciowe 230V' }] },
      { id: '12903', name: 'Zasięg komunikacji', type: 'STRING', required: false }
    ]
  },
  {
    id: '66887',
    name: 'Elektronika > Sprzęt audio > Słuchawki bezprzewodowe TWS',
    parentId: '42540',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka (Brand)', type: 'STRING', required: true },
      { id: '225693', name: 'Kod producenta / Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan (Condition)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }, { id: '2', value: 'Powystawowy' }] },
      { id: '225694', name: 'EAN / GTIN', type: 'STRING', required: true },
      { id: '891', name: 'Rodzaj transmisji', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Bluetooth 5.3' }, { id: '2', value: 'Bluetooth 5.2' }, { id: '3', value: 'Radiowa 2.4GHz' }] },
      { id: '892', name: 'Konstrukcja słuchawek', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Dokanałowe (Kulak İçi)' }, { id: '2', value: 'Douszne' }, { id: '3', value: 'Nauszne (Kulak Üstü)' }, { id: '4', value: 'Wokółuszne' }] },
      { id: '893', name: 'Wbudowany mikrofon', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Tak (Evet)' }, { id: '2', value: 'Nie (Hayır)' }] },
      { id: '904', name: 'Aktywna redukcja szumów (ANC)', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'Tak (ANC)' }, { id: '2', value: 'Nie' }] },
      { id: '905', name: 'Czas pracy na jednym ładowaniu', type: 'INTEGER', unit: 'godz.', required: false }
    ]
  },
  {
    id: '48973',
    name: 'Elektronika > Sprzęt audio > Głośniki przenośne Bluetooth',
    parentId: '42540',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka', type: 'STRING', required: true },
      { id: '225693', name: 'Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }, { id: '2', value: 'Używany' }] },
      { id: '225694', name: 'EAN', type: 'STRING', required: true },
      { id: '345', name: 'Moc znamionowa RMS', type: 'INTEGER', unit: 'W', required: true },
      { id: '346', name: 'Zasilanie', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Akumulatorowe' }, { id: '2', value: 'Sieciowo-akumulatorowe' }, { id: '3', value: 'Sieciowe' }] },
      { id: '347', name: 'Złącza', type: 'STRING', required: false },
      { id: '4588', name: 'Odporność na zachlapanie (IPX)', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'IPX7 (Wodoodporny)' }, { id: '2', value: 'IPX5' }, { id: '3', value: 'Brak' }] }
    ]
  },
  {
    id: '124921',
    name: 'Elektronika > Akcesoria GSM > Uchwyty i Kable USB',
    parentId: '42540',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka', type: 'STRING', required: true },
      { id: '225693', name: 'Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }] },
      { id: '225694', name: 'EAN', type: 'STRING', required: true },
      { id: '561', name: 'Złącze / Montaż', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'USB-C / USB-A' }, { id: '2', value: 'Kratka nawiewu' }, { id: '3', value: 'Szyba / Deska' }] },
      { id: '562', name: 'Moc ładowania / Transmisja', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Fast Charge 5V/3A 15W-65W' }, { id: '2', value: 'Standard 5V/2A' }] },
      { id: '563', name: 'Długość przewodu', type: 'STRING', required: false }
    ]
  },
  {
    id: '5',
    name: 'Dom i Ogród (Home & Garden)',
    parentId: null,
    leaf: false,
  },
  {
    id: '3690',
    name: 'Dom i Ogród > Wyposażenie > Tekstylia domowe > Pościel',
    parentId: '5',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka', type: 'STRING', required: true },
      { id: '213', name: 'Stan', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }] },
      { id: '225694', name: 'EAN', type: 'STRING', required: true },
      { id: '3691', name: 'Rodzaj', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'komplet pościeli' }, { id: '2', value: 'poszwa na kołdrę' }, { id: '3', value: 'poszewka na poduszkę' }] },
      { id: '3692', name: 'Liczba elementów w zestawie', type: 'DICTIONARY', required: true, options: [{ id: '3', value: '3 części' }, { id: '2', value: '2 części' }, { id: '4', value: '4 części' }, { id: '1', value: '1 część' }] },
      { id: '3693', name: 'Materiał', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'mikrofibra' }, { id: '2', value: 'bawełna' }, { id: '3', value: 'satyna bawełniana' }, { id: '4', value: 'poliester' }] },
      { id: '2026', name: 'Kolor', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'czerwony' }, { id: '2', value: 'wielokolorowy' }, { id: '3', value: 'biały' }, { id: '4', value: 'szary' }] },
      { id: '3694', name: 'Wymiary kołdry', type: 'DICTIONARY', required: false, options: [{ id: '1', value: '160x200 cm' }, { id: '2', value: '200x220 cm' }, { id: '3', value: '140x200 cm' }] },
      { id: '3695', name: 'Wzór / Motyw', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'świąteczny' }, { id: '2', value: 'geometryczny' }, { id: '3', value: 'roślinny' }] },
      { id: '3696', name: 'Zapięcie', type: 'DICTIONARY', required: false, options: [{ id: '1', value: 'zamek błyskawiczny' }, { id: '2', value: 'guziki' }] }
    ]
  },
  {
    id: '1454',
    name: 'Moda > Odzież męska > T-shirty & Odzież',
    parentId: null,
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka', type: 'STRING', required: true },
      { id: '213', name: 'Stan', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }] },
      { id: '11324', name: 'Rozmiar (Beden)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'S' }, { id: '2', value: 'M' }, { id: '3', value: 'L' }, { id: '4', value: 'XL' }, { id: '5', value: 'XXL' }, { id: '6', value: 'Oversize' }] },
      { id: '2026', name: 'Kolor', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Czarny' }, { id: '2', value: 'Biały' }, { id: '3', value: 'Granatowy' }, { id: '4', value: 'Szary' }, { id: '5', value: 'Beżowy' }] },
      { id: '11325', name: 'Materiał dominujący', type: 'DICTIONARY', required: true, options: [{ id: '1', value: '100% Bawełna (Pamuk)' }, { id: '2', value: 'Bawełna z elastanem' }, { id: '3', value: 'Poliester' }, { id: '4', value: 'Len' }] },
      { id: '11326', name: 'Płeć (Cinsiyet)', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Unisex' }, { id: '2', value: 'Męski (Erkek)' }, { id: '3', value: 'Damski (Kadın)' }] }
    ]
  },
  {
    id: '67414',
    name: 'Dom i Ogród > Kuchnia > Ekspresy & Małe AGD',
    parentId: '5',
    leaf: true,
    parameters: [
      { id: '11323', name: 'Marka (Brand)', type: 'STRING', required: true },
      { id: '225693', name: 'Kod producenta / Model', type: 'STRING', required: true },
      { id: '213', name: 'Stan', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Nowy' }] },
      { id: '225694', name: 'EAN', type: 'STRING', required: true },
      { id: '344', name: 'Ciśnienie / Moc', type: 'INTEGER', unit: 'bar/W', required: true },
      { id: '345', name: 'Zasilanie', type: 'DICTIONARY', required: true, options: [{ id: '1', value: 'Sieciowe 230V' }, { id: '2', value: 'USB 5V' }, { id: '3', value: 'Akumulatorowe' }] },
      { id: '348', name: 'Pojemność / Rozmiar', type: 'STRING', required: false }
    ]
  }
];

// Pure production mode: Starts with clean 0 offers and 0 orders.
// Real items are populated directly from live marketplace APIs (eMAG, Allegro, BaseLinker).
export const INITIAL_OFFERS: AllegroOffer[] = [];

export const INITIAL_ORDERS: AllegroCheckoutForm[] = [];

export const INITIAL_PLATFORMS: PlatformConfig[] = [
  {
    id: 'emag',
    name: 'eMAG Marketplace API v3',
    country: 'Bulgaristan, Romanya, Macaristan (BG, RO, HU)',
    currency: 'BGN',
    sellerName: '',
    status: 'configured',
    description: 'Resmi eMAG Marketplace REST API v3 entegrasyonu. /api-3/product_offer/read, /api-3/order/read ve Sameday EasyBox AWB kargo oluşturma.',
    apiDocsUrl: 'https://marketplace-api.emag.bg/',
    authType: 'basicAuth',
    credentials: {
      username: '',
      userPassword: '',
      apiKey: '',
      apiEndpoint: 'https://marketplace-api.emag.bg/api-3',
      countryMarket: 'BG'
    },
    activeListingsCount: 0,
    ordersCount: 0,
    lastSyncAt: null,
    features: {
      inventorySync: true,
      priceSync: true,
      orderFulfillment: true,
      webhookSupport: true
    }
  },
  {
    id: 'allegro',
    name: 'Allegro REST API',
    country: 'Polonya / Orta Avrupa (PL, CZ, SK)',
    currency: 'PLN',
    sellerName: '',
    status: 'available',
    description: 'Resmi Allegro REST API v1/v2 entegrasyonu. Teklifler, siparişler, InPost kargo ve fatura yönetimi.',
    apiDocsUrl: 'https://developer.allegro.pl/documentation',
    authType: 'oauth2',
    credentials: {
      clientId: '',
      clientSecret: '',
      environment: 'production',
      sellerLogin: ''
    },
    activeListingsCount: 0,
    ordersCount: 0,
    lastSyncAt: null,
    features: {
      inventorySync: true,
      priceSync: true,
      orderFulfillment: true,
      webhookSupport: true
    }
  },
  {
    id: 'baselinker',
    name: 'BaseLinker API Connector',
    country: 'Avrupa Çok Kanallı Envanter & Kargo Hub (PL, RO, CZ, DE, HU, BG)',
    currency: 'PLN',
    sellerName: '',
    status: 'available',
    description: 'Resmi BaseLinker REST API. getOrders, getInventoryProductsList, kargo etiketi oluşturma ve çok kanallı sipariş yönetimi.',
    apiDocsUrl: 'https://api.baselinker.com/',
    authType: 'apiKey',
    credentials: {
      apiToken: '',
      storageId: '',
      inventoryId: '',
      autoSyncStock: 'true',
      autoGenerateWaybills: 'true',
      defaultCourier: 'sameday'
    },
    activeListingsCount: 0,
    ordersCount: 0,
    lastSyncAt: null,
    features: {
      inventorySync: true,
      priceSync: true,
      orderFulfillment: true,
      webhookSupport: true
    }
  }
];

export const INITIAL_PRICING_RULES: PricingRule[] = [
  {
    id: 'rule-emag',
    channel: 'emag',
    channelName: 'eMAG (Bulgaristan, Romanya, Macaristan)',
    markupPercent: 15.0,
    fixedMarkup: 2.0,
    currency: 'BGN',
    rounding: '99cents',
    enabled: true
  },
  {
    id: 'rule-allegro',
    channel: 'allegro',
    channelName: 'Allegro (Polonya, Çekya, Slovakya)',
    markupPercent: 12.0,
    fixedMarkup: 3.5,
    currency: 'PLN',
    rounding: '99cents',
    enabled: true
  },
  {
    id: 'rule-baselinker',
    channel: 'baselinker',
    channelName: 'BaseLinker Envanter & Kargo Hub',
    markupPercent: 10.0,
    fixedMarkup: 2.0,
    currency: 'PLN',
    rounding: '99cents',
    enabled: true
  }
];

export const INITIAL_INVENTORY_RULES: InventorySyncRule = {
  safetyStock: 3,
  reserveStock: 1,
  autoDeactivateWhenZero: true,
  syncIntervalMinutes: 5,
  multiChannelDeduction: true
};

export interface CurrencyDetail {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  market: string;
  rateAgainstPln: number;
  rateAgainstUsd: number;
  rateAgainstEur: number;
}

export const SUPPORTED_CURRENCIES: CurrencyDetail[] = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası (TL)', flag: '🇹🇷', market: 'Türkiye & Net Muhasebe / Raporlama', rateAgainstPln: 9.85, rateAgainstUsd: 39.40, rateAgainstEur: 42.83 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', market: 'AliExpress Tedarik & Global', rateAgainstPln: 0.25, rateAgainstUsd: 1.00, rateAgainstEur: 1.09 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', market: 'Allegro SK / AB Pazarı', rateAgainstPln: 0.23, rateAgainstUsd: 0.92, rateAgainstEur: 1.00 },
  { code: 'PLN', symbol: 'zł', name: 'Polski Złoty', flag: '🇵🇱', market: 'Allegro PL (Polonya)', rateAgainstPln: 1.0, rateAgainstUsd: 4.00, rateAgainstEur: 4.35 },
  { code: 'BGN', symbol: 'лв', name: 'Български Лев', flag: '🇧🇬', market: 'eMAG Bulgaristan (BG)', rateAgainstPln: 0.45, rateAgainstUsd: 1.80, rateAgainstEur: 1.96 },
  { code: 'RON', symbol: 'lei', name: 'Leu Românesc', flag: '🇷🇴', market: 'eMAG Romanya', rateAgainstPln: 1.15, rateAgainstUsd: 4.60, rateAgainstEur: 5.00 },
  { code: 'CZK', symbol: 'Kč', name: 'Česká Koruna', flag: '🇨🇿', market: 'Allegro Çekya (CZ)', rateAgainstPln: 5.85, rateAgainstUsd: 23.40, rateAgainstEur: 25.43 },
  { code: 'HUF', symbol: 'Ft', name: 'Magyar Forint', flag: '🇭🇺', market: 'eMAG Macaristan (HU)', rateAgainstPln: 91.50, rateAgainstUsd: 366.00, rateAgainstEur: 397.83 }
];

export const EXCHANGE_RATES: Record<string, number> = {
  TRY: 9.85,
  PLN: 1.0,
  RON: 1.15,
  EUR: 0.23,
  USD: 0.25,
  CZK: 5.85,
  HUF: 91.50,
  BGN: 0.45
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  BGN: 'лв',
  RON: 'lei',
  PLN: 'zł',
  EUR: '€',
  USD: '$',
  CZK: 'Kč',
  HUF: 'Ft'
};
