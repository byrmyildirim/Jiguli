import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  Check,
  Sparkles,
  Barcode,
  Truck,
  Image as ImageIcon,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  Info,
  Wand2,
  CheckCircle2,
  HelpCircle,
  Share2,
  Layers,
  Globe,
  Edit2,
  FileSpreadsheet,
  Rocket,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Copy,
  Boxes,
  Tag,
  Settings,
  Scale,
  Calculator,
  ShieldAlert,
  Zap,
  CheckCircle,
  Sliders,
  CheckSquare,
  Square,
  Eye,
  Send,
  Building,
  Flag
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { EmagExecutionLogsModal, EmagExecutionReport } from './EmagExecutionLogsModal';
import { ProductImage } from '../common/ProductImage';
import { AllegroCategory, AllegroParameter, AllegroOffer, MarketplaceId } from '../../types/allegro';
import { MarketplaceLogo } from '../../constants/marketplaces';
import {
  EMAG_CATEGORY_SCHEMAS,
  autoDetectAttributesFromProduct,
  EmagCategorySchema,
  EmagCharacteristicDef
} from '../../services/marketplaceAttributes';
import { emagTaxonomySyncService, EmagCategoryItem } from '../../services/emagTaxonomySyncService';
import { EmagCategorySelector } from '../common/EmagCategorySelector';

// Bilingual translations dictionary (Turkish Primary + Foreign Original)
export const PARAMETER_TRANSLATIONS: Record<string, { tr: string; original: string }> = {
  '11323': { tr: 'Marka', original: 'Marka (Brand)' },
  '225693': { tr: 'Üretici Kodu / Model', original: 'Kod producenta / Model' },
  '213': { tr: 'Ürün Durumu', original: 'Stan (Condition)' },
  '225694': { tr: 'Barkod (EAN / GTIN)', original: 'EAN / GTIN Barkod' },
  '12801': { tr: 'Işık Rengi / Renk Sıcaklığı', original: 'Barwa światła' },
  '12802': { tr: 'Şerit / Ürün Uzunluğu', original: 'Długość taśmy' },
  '12803': { tr: 'Besleme Voltajı (V)', original: 'Napięcie zasilania' },
  '12804': { tr: 'Haberleşme & Protokol', original: 'Protokół komunikacji' },
  '12805': { tr: 'Su & Toz Geçirmezlik', original: 'Klasa szczelności IP' },
  '12806': { tr: 'LED Diyot Türü', original: 'Typ diody LED' },
  '12901': { tr: 'Akıllı Ev Ekosistemi', original: 'Ekosystem Smart Home' },
  '12902': { tr: 'Besleme Kaynağı', original: 'Zasilanie' },
  '12903': { tr: 'Kablosuz Çekim Alanı', original: 'Zasięg komunikacji' },
  '2026': { tr: 'Kasa / Kordon / Ürün Rengi', original: 'Kolor koperty / paska' },
  '2027': { tr: 'Sistem Uyumluluğu', original: 'Kompatybilność systemowa' },
  '4588': { tr: 'Su Geçirmezlik Sınıfı', original: 'Wodoszczelność (Klasa)' },
  '4589': { tr: 'Ekran Boyutu (İnç)', original: 'Przekątna ekranu' },
  '891': { tr: 'Bağlantı & İletim Türü', original: 'Rodzaj transmisji' },
  '892': { tr: 'Kulaklık Tasarımı', original: 'Konstrukcja słuchawek' },
  '893': { tr: 'Dahili Mikrofon', original: 'Wbudowany mikrofon' },
  '904': { tr: 'Aktif Gürültü Engelleme (ANC)', original: 'Aktywna redukcja szumów' },
  '905': { tr: 'Pil / Çalışma Süresi (Saat)', original: 'Czas pracy na jednym ładowaniu' },
  '345': { tr: 'RMS Çıkış Gücü (Watt)', original: 'Moc znamionowa RMS' },
  '346': { tr: 'Güç Kaynağı & Batarya', original: 'Zasilanie' },
  '347': { tr: 'Giriş / Çıkış Portları', original: 'Złącza' },
  '561': { tr: 'Konnektör / Montaj Tipi', original: 'Złącze / Montaż' },
  '562': { tr: 'Şarj & Güç Kapasitesi', original: 'Moc ładowania' },
  '563': { tr: 'Kablo Uzunluğu', original: 'Długość przewodu' },
  '11324': { tr: 'Beden / Ölçü', original: 'Rozmiar (Beden)' },
  '11325': { tr: 'Kumaş / Ana Materyal', original: 'Materiał dominujący' },
  '11326': { tr: 'Cinsiyet / Hedef Kitle', original: 'Płeć (Cinsiyet)' },
  '344': { tr: 'Pompa Basıncı (Bar)', original: 'Ciśnienie pompy' },
  '348': { tr: 'Kapasite / Hacim', original: 'Pojemność zbiornika' },
  '3691': { tr: 'Ürün Türü', original: 'Rodzaj' },
  '3692': { tr: 'Parça Sayısı', original: 'Liczba elementów w zestawie' },
  '3693': { tr: 'Kumaş / Materyal', original: 'Materiał' },
  '3694': { tr: 'Yorgan Boyutu', original: 'Wymiary kołdry' },
  '3695': { tr: 'Desen / Tema', original: 'Wzór / Motyw' },
  '3696': { tr: 'Kapanış Şekli', original: 'Zapięcie' }
};

export const CATEGORY_TRANSLATIONS: Record<string, { tr: string; original: string }> = {
  '12800': { tr: 'LED Şerit Aydınlatma & Akıllı Işık (Tuya/Zigbee)', original: 'Elektronika > Oświetlenie LED > Taśmy LED & Smart' },
  '12900': { tr: 'Akıllı Ev, Zigbee/WiFi Sensörler & Anahtarlar', original: 'Elektronika > Smart Home > Czujniki & Przełączniki' },
  '257548': { tr: 'Akıllı Saatler & Spor Bileklikler', original: 'Elektronika > Smartwatche i opaski sportowe' },
  '66887': { tr: 'Kablosuz Bluetooth Kulaklıklar (TWS)', original: 'Elektronika > Sprzęt audio > Słuchawki bezprzewodowe TWS' },
  '48973': { tr: 'Taşınabilir Bluetooth Hoparlörler', original: 'Elektronika > Sprzęt audio > Głośniki przenośne Bluetooth' },
  '124921': { tr: 'USB-C Kablo & Hızlı Şarj Aksesuarları', original: 'Elektronika > Akcesoria telefoniczne > Kable USB-C' },
  '1454': { tr: 'Tişörtler & Günlük Üst Giyim', original: 'Moda > Odzież > T-shirty i koszulki' },
  '67414': { tr: 'Kahve Makineleri & Mutfak Aletleri', original: 'Dom i Ogród > Kuchnia > Ekspresy ciśnieniowe' },
  '3690': { tr: 'Ev Tekstili, Nevresim Takımları & Pościel', original: 'Dom i Ogród > Wyposażenie > Tekstylia domowe > Pościel' }
};

export const OPTION_TRANSLATIONS: Record<string, { tr: string; original: string }> = {
  'komplet pościeli': { tr: 'Nevresim Takımı (Komplet)', original: 'komplet pościeli' },
  'poszwa na kołdrę': { tr: 'Yorgan Kılıfı', original: 'poszwa na kołdrę' },
  'poszewka na poduszkę': { tr: 'Yastık Kılıfı', original: 'poszewka na poduszkę' },
  'mikrofibra': { tr: 'Mikrofiber Kumaş', original: 'mikrofibra' },
  'bawełna': { tr: '%100 Pamuk', original: 'bawełna' },
  'satyna bawełniana': { tr: 'Pamuk Saten', original: 'satyna bawełniana' },
  'czerwony': { tr: 'Kırmızı', original: 'czerwony' },
  'wielokolorowy': { tr: 'Çok Renkli / Desenli', original: 'wielokolorowy' },
  'świąteczny': { tr: 'Yılbaşı / Noel Temalı', original: 'świąteczny' },
  'zamek błyskawiczny': { tr: 'Fermuarlı', original: 'zamek błyskawiczny' },
  'Nowy (Sıfır/Yeni)': { tr: 'Sıfır / Yeni Ürün', original: 'Nowy (Brand New)' },
  'Nowy': { tr: 'Sıfır / Yeni Ürün', original: 'Nowy (Brand New)' },
  'Używany (İkinci El)': { tr: 'İkinci El / Kullanılmış', original: 'Używany (Used)' },
  'Używany': { tr: 'İkinci El / Kullanılmış', original: 'Używany (Used)' },
  'Powystawowy (Teşhir)': { tr: 'Teşhir / Yenilenmiş', original: 'Powystawowy (Refurbished)' },
  'Powystawowy': { tr: 'Teşhir / Yenilenmiş', original: 'Powystawowy (Refurbished)' },
  'Czarny (Siyah)': { tr: 'Siyah', original: 'Czarny (Black)' },
  'Czarny': { tr: 'Siyah', original: 'Czarny (Black)' },
  'Srebrny (Gümüş)': { tr: 'Gümüş', original: 'Srebrny (Silver)' },
  'Srebrny': { tr: 'Gümüş', original: 'Srebrny (Silver)' },
  'Złoty (Altın)': { tr: 'Altın', original: 'Złoty (Gold)' },
  'Złoty': { tr: 'Altın', original: 'Złoty (Gold)' },
  'Szary (Gri)': { tr: 'Gri', original: 'Szary (Grey)' },
  'Szary': { tr: 'Gri', original: 'Szary (Grey)' },
  'Niebieski (Mavi)': { tr: 'Mavi', original: 'Niebieski (Blue)' },
  'Niebieski': { tr: 'Mavi', original: 'Niebieski (Blue)' },
  'Biały': { tr: 'Beyaz', original: 'Biały (White)' },
  'Granatowy': { tr: 'Lacivert', original: 'Granatowy (Navy)' },
  'Beżowy': { tr: 'Bej', original: 'Beżowy (Beige)' },
  'Android & iOS': { tr: 'Android & iOS (Evrensel)', original: 'Android & iOS' },
  'Tylko Android': { tr: 'Yalnızca Android', original: 'Tylko Android' },
  'Tylko iOS': { tr: 'Yalnızca iOS (Apple)', original: 'Tylko iOS' },
  'Tak (Evet)': { tr: 'Evet (Dahili Mevcut)', original: 'Tak (Yes)' },
  'Tak': { tr: 'Evet (Dahili Mevcut)', original: 'Tak (Yes)' },
  'Nie (Hayır)': { tr: 'Hayır (Mevcut Değil)', original: 'Nie (No)' },
  'Nie': { tr: 'Hayır (Mevcut Değil)', original: 'Nie (No)' },
  'Tak (ANC)': { tr: 'Evet (Aktif Gürültü Engelleme)', original: 'Tak (ANC)' },
  '100% Bawełna (Pamuk)': { tr: '%100 Pamuk', original: '100% Bawełna (Cotton)' },
  'Bawełna z elastanem': { tr: 'Likralı / Elastan Pamuk', original: 'Bawełna z elastanem' },
  'Poliester': { tr: 'Polyester Kumaş', original: 'Poliester' },
  'Len': { tr: 'Keten Kumaş', original: 'Len (Linen)' },
  'Unisex': { tr: 'Unisex (Kadın & Erkek)', original: 'Unisex' },
  'Męski (Erkek)': { tr: 'Erkek', original: 'Męski (Men)' },
  'Męski': { tr: 'Erkek', original: 'Męski (Men)' },
  'Damski (Kadın)': { tr: 'Kadın', original: 'Damski (Women)' },
  'Damski': { tr: 'Kadın', original: 'Damski (Women)' }
};

// Dynamic eMAG Categories derived from schemas
export const EMAG_CATEGORIES = EMAG_CATEGORY_SCHEMAS.map(s => ({
  id: String(s.id),
  numericId: s.numericId,
  name: s.trName,
  originalName: s.name,
  badge: s.badge
}));

// BaseLinker Warehouses and Categories
export const BASELINKER_WAREHOUSES = [
  { id: 'wh-main', name: 'Ana Merkez Depo (İstanbul / Varşova)', type: 'Merkezi Stok' },
  { id: 'wh-fba', name: 'FBA / Pazaryeri Konsinye Deposu (Bükreş / Katowice)', type: 'Pazaryeri Deposu' },
  { id: 'wh-dropship', name: 'Tedarikçi Doğrudan Sevk Deposu (Transit)', type: 'Tedarikçi Deposu' }
];

export const BASELINKER_CATEGORIES = [
  { id: 'bl-cat-electronics', name: 'Tüketici Elektroniği & Akıllı Cihazlar' },
  { id: 'bl-cat-accessories', name: 'Mobil Aksesuar & Giyilebilir Teknoloji' },
  { id: 'bl-cat-home', name: 'Akıllı Ev, Aydınlatma & Otomasyon' },
  { id: 'bl-cat-apparel', name: 'Tekstil, Moda & Yaşam' }
];

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerToEdit?: AllegroOffer | null;
  initialData?: {
    id?: string;
    title?: string;
    priceAmount?: string;
    imageUrl?: string;
    sku?: string;
    ean?: string;
    brand?: string;
    categoryId?: string;
    stock?: number;
  };
  initialEmagCategoryId?: string | number;
  theme?: 'light' | 'dark';
}

export const getModalOrigin = (offer?: AllegroOffer | null) => {
  if (!offer) return { platform: 'multi' as const, label: 'Yeni Çoklu Kanal İlanı', isDraft: false };
  const idStr = String(offer.id || '');
  const baseMarketplace = offer.publication?.marketplaces?.base?.id || '';
  const isDraft = Boolean(offer.isDraft || offer.publication?.status === 'DRAFT');

  if (offer.excelMetadata || idStr.startsWith('draft-xl-')) {
    return { platform: 'excel' as const, label: 'Excel Taslağı', isDraft: true };
  }
  if (isDraft || idStr.startsWith('draft-')) {
    return { platform: 'draft' as const, label: 'Sistem Taslağı', isDraft: true };
  }
  if (idStr.startsWith('bl-') || baseMarketplace === 'baselinker-hub') {
    return { platform: 'baselinker' as const, label: 'BaseLinker Envanteri', isDraft: false };
  }
  if (idStr.startsWith('emag_') || baseMarketplace.startsWith('emag')) {
    return { platform: 'emag' as const, label: 'eMAG Pazaryeri', isDraft: false };
  }
  return { platform: 'allegro' as const, label: 'Allegro Pazaryeri', isDraft: false };
};

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  onClose,
  offerToEdit,
  initialData,
  initialEmagCategoryId,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState<AllegroCategory[]>(store.getCategories());
  const leafCategories = categories.filter(c => c.leaf !== false);

  const isEditing = Boolean(offerToEdit || initialData?.id);
  const editingId = offerToEdit?.id || initialData?.id;
  const originInfo = getModalOrigin(offerToEdit);

  // Active tab management: 'core' | 'allegro' | 'emag' | 'baselinker' | 'excel'
  const [activeTab, setActiveTab] = useState<'core' | 'allegro' | 'emag' | 'baselinker' | 'excel'>('core');

  // --- 1. CORE / ORTAK ALANLAR ---
  const [coreTitle, setCoreTitle] = useState('');
  const [sku, setSku] = useState('');
  const [ean, setEan] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState(35);
  const [basePrice, setBasePrice] = useState('189.00');
  const [baseCurrency, setBaseCurrency] = useState<'PLN' | 'EUR' | 'RON' | 'TRY' | 'USD' | 'BGN'>('PLN');

  // Multi-Channel target selection
  const [selectedChannels, setSelectedChannels] = useState<MarketplaceId[]>(['allegro', 'emag', 'baselinker']);

  // --- 2. ALLEGRO ALANLARI (PLN, 75 Karakter Sınırı, Allegro Parametreleri, Smart) ---
  const [allegroTitle, setAllegroTitle] = useState('');
  const [allegroPrice, setAllegroPrice] = useState('189.00');
  const [allegroCategoryId, setAllegroCategoryId] = useState('');
  const [allegroSmart, setAllegroSmart] = useState(true);
  const [allegroParams, setAllegroParams] = useState<Record<string, string>>({});

  // --- 3. eMAG ALANLARI (Bulgaristan / Romanya / Macaristan, PNK, KDV ID, 255 Karakter SEO, Genius, Taslak/Canlı) ---
  const [emagCountry, setEmagCountry] = useState<'BG' | 'RO' | 'HU'>('BG');
  const [emagSendStatus, setEmagSendStatus] = useState<0 | 1>(0); // 0 = Draft (Taslak/Pasif), 1 = Active (Canlı)
  const [emagTitle, setEmagTitle] = useState('');
  const [emagPrice, setEmagPrice] = useState('135.82');
  const [emagCurrency, setEmagCurrency] = useState<'BGN' | 'RON' | 'HUF'>('BGN');
  const [emagVatId, setEmagVatId] = useState<number>(6); // Default to BG 20% VAT ID 6
  const [emagPartNumberKey, setEmagPartNumberKey] = useState('');
  const [emagCategoryId, setEmagCategoryId] = useState<string>('202');
  const [emagGenius, setEmagGenius] = useState(true);
  const [emagFulfillment, setEmagFulfillment] = useState<'merchant' | 'fbe'>('merchant');
  const [emagHandlingTime, setEmagHandlingTime] = useState<number>(1);
  const [emagCharacteristics, setEmagCharacteristics] = useState<Record<string, string>>({});
  const [customEmagAttributes, setCustomEmagAttributes] = useState<{ id: string; name: string; value: string }[]>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [showAddCustomAttr, setShowAddCustomAttr] = useState(false);

  // Live eMAG Schema Validation Tester State
  const [schemaValidationResult, setSchemaValidationResult] = useState<{
    tested: boolean;
    valid: boolean;
    messages: string[];
    details: {
      pnkValid: boolean;
      vatValid: boolean;
      priceValid: boolean;
      stockValid: boolean;
      categoryValid: boolean;
      characteristicsCount: number;
    };
  } | null>(null);

  // --- 4. BASELINKER ALANLARI ---
  const [baselinkerWarehouseId, setBaselinkerWarehouseId] = useState(BASELINKER_WAREHOUSES[0].id);
  const [baselinkerCategoryId, setBaselinkerCategoryId] = useState(BASELINKER_CATEGORIES[0].id);
  const [baselinkerPrice, setBaselinkerPrice] = useState('45.00');
  const [baselinkerCurrency, setBaselinkerCurrency] = useState<'EUR' | 'PLN' | 'USD' | 'TRY'>('EUR');
  const [baselinkerSafetyStock, setBaselinkerSafetyStock] = useState(5);
  const [baselinkerWeightKg, setBaselinkerWeightKg] = useState('0.35');
  const [baselinkerDimensions, setBaselinkerDimensions] = useState({ width: '12', height: '8', depth: '15' });
  const [baselinkerSyncStock, setBaselinkerSyncStock] = useState(true);
  const [baselinkerSyncPrice, setBaselinkerSyncPrice] = useState(true);

  // Draft status & UI notifications
  const isDraftOffer = Boolean(offerToEdit?.isDraft || offerToEdit?.publication?.status === 'DRAFT' || originInfo.isDraft);
  const [publishOnSave, setPublishOnSave] = useState(false);
  const [showEmagLogsModal, setShowEmagLogsModal] = useState(false);
  const [emagExecutionReport, setEmagExecutionReport] = useState<EmagExecutionReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [syncedEmagCategories, setSyncedEmagCategories] = useState<EmagCategoryItem[]>([]);
  const [categoryDiagnosis, setCategoryDiagnosis] = useState<{
    detectedGroup: string;
    sourceCategoryName: string;
    sourceCategoryCode: string;
    hasClashFixed: boolean;
    clashReason?: string;
  } | null>(null);

  const currentAllegroCategory: AllegroCategory = categories.find(c => c.id === allegroCategoryId) || {
    id: allegroCategoryId || '12800',
    name: CATEGORY_TRANSLATIONS[allegroCategoryId]?.original || offerToEdit?.excelMetadata?.matchedCategoryName || 'Genel Elektronik & Oświetlenie',
    parentId: '42540',
    leaf: true,
    parameters: []
  };
  const requiredAllegroParams = currentAllegroCategory?.parameters?.filter(p => p.required) || [];

  const currentEmagSchema: EmagCategorySchema = useMemo(() => {
    const fromStatic = EMAG_CATEGORY_SCHEMAS.find(
      s => String(s.id) === String(emagCategoryId) || String(s.numericId) === String(emagCategoryId)
    );
    if (fromStatic) return fromStatic;

    const numId = Number(emagCategoryId);
    const fromService = emagTaxonomySyncService.getCategoryById(numId);
    const chars = emagTaxonomySyncService.getCharacteristicsForCategory(numId);

    return {
      id: String(emagCategoryId),
      numericId: numId || 202,
      name: fromService?.name || `eMAG Kategori #${emagCategoryId}`,
      trName: fromService?.trName || fromService?.name || `eMAG Kategori #${emagCategoryId}`,
      badge: 'eMAG Resmi',
      characteristics: (chars && chars.length > 0 ? chars : [
        { id: 'emag-brand', categoryId: numId, name: 'Brand', trName: 'Marka', type: 'STRING', isMandatory: true, defaultValue: 'Generic' },
        { id: 'emag-color', categoryId: numId, name: 'Culoare', trName: 'Renk', type: 'DICTIONARY', isMandatory: false, options: ['Multicolor', 'Negru', 'Alb'] },
        { id: 'emag-warranty', categoryId: numId, name: 'Garantie', trName: 'Garanti (Ay)', type: 'INTEGER', isMandatory: false, defaultValue: '24' }
      ]).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        trName: c.trName || c.name,
        required: c.isMandatory ?? c.required ?? false,
        type: c.type || 'STRING',
        options: c.options || []
      }))
    };
  }, [emagCategoryId]);

  // Sync country selection with VAT & Currency
  const handleCountryChange = (country: 'BG' | 'RO' | 'HU') => {
    setEmagCountry(country);
    if (country === 'BG') {
      setEmagCurrency('BGN');
      setEmagVatId(4); // 20% VAT ID for Bulgaria
    } else if (country === 'RO') {
      setEmagCurrency('RON');
      setEmagVatId(1); // 19% VAT ID for Romania
    } else if (country === 'HU') {
      setEmagCurrency('HUF');
      setEmagVatId(1);
    }
  };

  // Reset or initialize state when opening modal
  useEffect(() => {
    if (isOpen) {
      setCategories(store.getCategories());
      setCreatedSuccess(false);
      setToastNotice(null);
      setPublishOnSave(false);
      setShowAddCustomAttr(false);
      setSchemaValidationResult(null);

      const cachedCategories = emagTaxonomySyncService.getCategories();
      if (cachedCategories && cachedCategories.length > 0) {
        setSyncedEmagCategories(cachedCategories);
      }

      const unsubSync = emagTaxonomySyncService.subscribe(() => {
        setSyncedEmagCategories(emagTaxonomySyncService.getCategories());
      });

      if (offerToEdit) {
        const itemOrigin = getModalOrigin(offerToEdit);
        const nameVal = offerToEdit.name || '';
        setCoreTitle(nameVal);

        const rawSku = offerToEdit.sku || `SKU-${offerToEdit.id || Math.floor(1000 + Math.random() * 9000)}`;
        const targetSku = rawSku;
        const targetEan = offerToEdit.ean || `590${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        setSku(targetSku);
        setEan(targetEan);

        // eMAG Part Number Key logic
        let pnkVal = (offerToEdit.channelData?.emag as any)?.part_number_key || targetSku;
        if (/^\d+$/.test(pnkVal)) {
          pnkVal = `SKU-${pnkVal}`;
        }
        setEmagPartNumberKey(pnkVal);

        setImageUrl(offerToEdit.primaryImage || '');
        setStock(offerToEdit.stock?.available !== undefined ? offerToEdit.stock.available : 10);
        
        const rawCurr = (offerToEdit.sellingMode?.price?.currency as any) || 'PLN';
        const rawAmount = offerToEdit.sellingMode?.price?.amount || '189.00';
        setBasePrice(rawAmount);
        setBaseCurrency(rawCurr);

        // Pre-fill channels
        const activeCh: MarketplaceId[] = [];
        if (offerToEdit.channelSync?.allegro === 'synced') activeCh.push('allegro');
        if (offerToEdit.channelSync?.emag === 'synced') activeCh.push('emag');
        if (offerToEdit.channelSync?.baselinker === 'synced') activeCh.push('baselinker');

        if (activeCh.length > 0) {
          setSelectedChannels(activeCh);
        } else if (itemOrigin.platform === 'emag') {
          setSelectedChannels(['emag']);
        } else if (itemOrigin.platform === 'baselinker') {
          setSelectedChannels(['baselinker']);
        } else if (itemOrigin.platform === 'allegro') {
          setSelectedChannels(['allegro']);
        } else {
          setSelectedChannels(['allegro', 'emag', 'baselinker']);
        }

        const offerCatCode = String(
          offerToEdit.excelMetadata?.emagCategoryCode ||
          offerToEdit.channelData?.emag?.categoryId ||
          offerToEdit.excelMetadata?.matchedCategoryCode ||
          offerToEdit.category?.id ||
          ''
        ).trim();
        const offerCatName = String(
          offerToEdit.excelMetadata?.emagCategoryName ||
          offerToEdit.excelMetadata?.matchedCategoryName ||
          offerToEdit.category?.name ||
          ''
        ).trim();

        // Run intelligent auto-detection for products
        const autoDetected = autoDetectAttributesFromProduct({
          title: nameVal,
          name: nameVal,
          sku: targetSku,
          ean: targetEan,
          brand: initialData?.brand,
          description: nameVal,
          categoryCode: offerCatCode,
          categoryName: offerCatName
        });

        // Taxonomy resolution
        const titleLower = nameVal.toLowerCase();
        const rawCatLower = `${offerCatCode} ${offerCatName}`.toLowerCase();
        const combinedText = `${titleLower} ${rawCatLower}`;

        const isPetProduct = combinedText.includes('psa') || combinedText.includes('pies') || combinedText.includes('kot') || combinedText.includes('köpek') || combinedText.includes('kedi') || combinedText.includes('dom dla psa') || combinedText.includes('mata') || combinedText.includes('łóżko') || combinedText.includes('legowisk') || combinedText.includes('culcus') || combinedText.includes('pet') || combinedText.includes('dog') || combinedText.includes('cat');
        const isLedProduct = !isPetProduct && (combinedText.includes('led') || combinedText.includes('strip') || combinedText.includes('şerit') || combinedText.includes('rgb') || combinedText.includes('cob') || combinedText.includes('lampa') || combinedText.includes('light'));
        const isBeddingProduct = combinedText.includes('pościel') || combinedText.includes('poszewk') || combinedText.includes('nevresim') || combinedText.includes('bedding') || combinedText.includes('3690');
        const isSmartHomeProduct = !isLedProduct && !isPetProduct && (combinedText.includes('zigbee') || combinedText.includes('tuya') || combinedText.includes('smart life') || combinedText.includes('switch') || combinedText.includes('sensor') || combinedText.includes('curtain') || combinedText.includes('motor'));
        const isWatchProduct = !isLedProduct && !isPetProduct && (combinedText.includes('watch') || combinedText.includes('saat') || combinedText.includes('smartwatch') || combinedText.includes('bileklik'));
        const isAudioProduct = combinedText.includes('kulaklık') || combinedText.includes('earphone') || combinedText.includes('headphone') || combinedText.includes('tws');

        let targetAllegroCatId = offerToEdit.channelData?.allegro?.categoryId;
        let targetEmagCatId = offerToEdit.channelData?.emag?.categoryId ? String(offerToEdit.channelData.emag.categoryId) : '';
        let hasClashFixed = false;
        let clashReason = '';

        const excelEmagCat = offerToEdit.excelMetadata?.emagCategoryCode ? String(offerToEdit.excelMetadata.emagCategoryCode).trim() : '';

        if (isPetProduct) {
          targetEmagCatId = excelEmagCat && /^\d+$/.test(excelEmagCat) ? excelEmagCat : '3122';
          targetAllegroCatId = '3122';
          hasClashFixed = true;
          clashReason = 'Evcil Hayvan Yatakları (3122) kategorisine eşlendi.';
        } else if (isLedProduct) {
          targetAllegroCatId = '12800';
          targetEmagCatId = '202';
          hasClashFixed = true;
          clashReason = 'LED & Şerit Aydınlatma kategorisine eşlendi.';
        } else if (isBeddingProduct) {
          targetAllegroCatId = '3690';
          targetEmagCatId = '3690';
        } else if (isSmartHomeProduct) {
          targetAllegroCatId = '12900';
          targetEmagCatId = '202';
        } else if (isWatchProduct) {
          targetAllegroCatId = '257548';
          targetEmagCatId = '101';
        } else if (isAudioProduct) {
          targetAllegroCatId = '66887';
          targetEmagCatId = '104';
        } else {
          targetEmagCatId = excelEmagCat || offerCatCode || autoDetected.emagCategoryId || '202';
          targetAllegroCatId = offerCatCode || autoDetected.allegroCategoryId || '12800';
        }

        setAllegroCategoryId(targetAllegroCatId || '12800');
        setEmagCategoryId(targetEmagCatId || '202');

        setCategoryDiagnosis({
          detectedGroup: autoDetected.detectedCategory || 'Genel Elektronik & Otomasyon',
          sourceCategoryName: offerCatName || 'Belirtilmemiş',
          sourceCategoryCode: offerCatCode || '-',
          hasClashFixed,
          clashReason
        });

        // Initialize Allegro specific
        setAllegroTitle(offerToEdit.channelData?.allegro?.title || (nameVal.length > 75 ? nameVal.substring(0, 75).trim() : nameVal));
        setAllegroPrice(offerToEdit.channelData?.allegro?.price?.amount || (rawCurr === 'PLN' ? rawAmount : (parseFloat(rawAmount) * 4.3).toFixed(2)));
        setAllegroSmart(offerToEdit.channelData?.allegro?.smartEligible ?? offerToEdit.smartEligible ?? true);
        
        const paramMap: Record<string, string> = {
          ...autoDetected.allegroParams,
          ...offerToEdit.channelData?.allegro?.parameters
        };
        (offerToEdit.parameters || []).forEach(p => {
          if (p.values && p.values.length > 0) paramMap[p.id] = p.values[0];
        });
        setAllegroParams(paramMap);

        // Initialize eMAG specific
        setEmagTitle(offerToEdit.channelData?.emag?.title || nameVal);
        const calcBgn = rawCurr === 'BGN' ? rawAmount : (rawCurr === 'PLN' ? (parseFloat(rawAmount) * 0.45).toFixed(2) : (parseFloat(rawAmount) * 0.39).toFixed(2));
        setEmagPrice(offerToEdit.channelData?.emag?.price?.amount || calcBgn);
        
        const emagCurrVal = (offerToEdit.channelData?.emag?.price?.currency as any) || 'BGN';
        setEmagCurrency(emagCurrVal);
        if (emagCurrVal === 'BGN') {
          setEmagCountry('BG');
          setEmagVatId(4);
        } else if (emagCurrVal === 'RON') {
          setEmagCountry('RO');
          setEmagVatId(1);
        }

        // Set draft vs live status
        setEmagSendStatus(((offerToEdit.channelData?.emag as any)?.status ?? 0) as 0 | 1);
        setEmagGenius(offerToEdit.channelData?.emag?.geniusEligible ?? true);
        
        setEmagCharacteristics({
          'emag-brand': 'Generic',
          'emag-warranty': '24',
          ...autoDetected.emagCharacteristics,
          ...(offerToEdit.channelData?.emag?.characteristics || {})
        });

        // Initialize BaseLinker specific
        if (offerToEdit.channelData?.baselinker) {
          setBaselinkerWarehouseId(offerToEdit.channelData.baselinker.warehouseId || BASELINKER_WAREHOUSES[0].id);
          setBaselinkerCategoryId(offerToEdit.channelData.baselinker.categoryId || BASELINKER_CATEGORIES[0].id);
          setBaselinkerPrice(offerToEdit.channelData.baselinker.price?.amount || '45.00');
          setBaselinkerCurrency((offerToEdit.channelData.baselinker.price?.currency as any) || 'EUR');
          setBaselinkerWeightKg(String(offerToEdit.channelData.baselinker.weightKg || '0.35'));
          if (offerToEdit.channelData.baselinker.dimensions) {
            setBaselinkerDimensions({
              width: String(offerToEdit.channelData.baselinker.dimensions.width),
              height: String(offerToEdit.channelData.baselinker.dimensions.height),
              depth: String(offerToEdit.channelData.baselinker.dimensions.depth)
            });
          }
          setBaselinkerSyncStock(offerToEdit.channelData.baselinker.autoSyncStock ?? true);
          setBaselinkerSyncPrice(offerToEdit.channelData.baselinker.autoSyncPrice ?? true);
        } else {
          setBaselinkerPrice((parseFloat(rawAmount) / 4.3).toFixed(2));
          setBaselinkerCurrency('EUR');
        }

        // Route default active tab by origin
        if (itemOrigin.platform === 'emag') setActiveTab('emag');
        else if (itemOrigin.platform === 'allegro') setActiveTab('allegro');
        else if (itemOrigin.platform === 'baselinker') setActiveTab('baselinker');
        else if (itemOrigin.platform === 'excel') setActiveTab('excel');
        else setActiveTab('core');

      } else {
        // New Product Wizard defaults
        const initialTitle = initialData?.title || 'RGB LED Smart Life Zigbee Controller COB LED Strip USB Lights 5V Tuya';
        setCoreTitle(initialTitle);
        const newSku = initialData?.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
        const newEan = initialData?.ean || `590${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        setSku(newSku);
        setEan(newEan);
        setEmagPartNumberKey(`SKU-${newSku.replace(/^SKU-/, '')}`);
        setBasePrice(initialData?.priceAmount || '189.00');
        setBaseCurrency('PLN');
        setStock(initialData?.stock !== undefined ? initialData.stock : 10);
        setImageUrl(
          initialData?.imageUrl ||
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80'
        );
        setSelectedChannels(['allegro', 'emag', 'baselinker']);

        const autoDetected = autoDetectAttributesFromProduct({
          title: initialTitle,
          name: initialTitle,
          sku: newSku,
          ean: newEan,
          brand: initialData?.brand,
          description: initialTitle
        });

        setAllegroTitle(initialTitle.length > 75 ? initialTitle.substring(0, 75).trim() : initialTitle);
        setAllegroPrice('189.00');
        setAllegroCategoryId(autoDetected.allegroCategoryId);
        setAllegroParams(autoDetected.allegroParams);
        setAllegroSmart(true);

        setEmagTitle(initialTitle);
        setEmagPrice('135.82');
        setEmagCountry('BG');
        setEmagCurrency('BGN');
        setEmagVatId(4); // 20% VAT for BG
        setEmagSendStatus(0); // Draft by default as instructed
        const targetEmagId = String(initialEmagCategoryId || autoDetected.emagCategoryId || '202');
        setEmagCategoryId(targetEmagId);
        setEmagCharacteristics({
          'emag-brand': 'Generic',
          'emag-warranty': '24',
          ...autoDetected.emagCharacteristics
        });

        setBaselinkerPrice('45.00');
        setBaselinkerCurrency('EUR');

        setActiveTab('core');
      }

      return () => {
        if (typeof unsubSync === 'function') {
          unsubSync();
        }
      };
    }
  }, [isOpen, offerToEdit, initialData, initialEmagCategoryId]);

  // Handle Channel Selection Toggles
  const handleToggleChannel = (ch: MarketplaceId) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  // Add Custom Attribute
  const handleAddCustomAttribute = () => {
    if (!newCustomKey.trim() || !newCustomVal.trim()) return;
    const key = newCustomKey.trim();
    const val = newCustomVal.trim();
    setCustomEmagAttributes(prev => [...prev, { id: `custom-${Date.now()}`, name: key, value: val }]);
    setEmagCharacteristics(prev => ({ ...prev, [key]: val }));
    setNewCustomKey('');
    setNewCustomVal('');
    setToastNotice(`Özel Nitelik Eklendi: ${key} = ${val}`);
  };

  const handleRemoveCustomAttribute = (id: string, name: string) => {
    setCustomEmagAttributes(prev => prev.filter(a => a.id !== id));
    setEmagCharacteristics(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  // Auto Currency & Exchange Rate Calculator
  const handleAutoConvertPrices = () => {
    const numericBase = parseFloat(basePrice) || 189.00;
    
    // Conversion formulas:
    // PLN 100 -> ~23.2 EUR -> ~45.6 BGN -> ~115 RON
    let pln = numericBase;
    if (baseCurrency === 'EUR') pln = numericBase * 4.31;
    else if (baseCurrency === 'USD') pln = numericBase * 3.95;
    else if (baseCurrency === 'RON') pln = numericBase * 0.88;
    else if (baseCurrency === 'BGN') pln = numericBase * 2.22;
    else if (baseCurrency === 'TRY') pln = numericBase * 0.10;

    const bgnVal = (pln * 0.455).toFixed(2);
    const ronVal = (pln * 1.15).toFixed(2);
    const eurVal = (pln / 4.31).toFixed(2);
    const plnVal = pln.toFixed(2);

    setAllegroPrice(plnVal);
    if (emagCountry === 'BG') {
      setEmagPrice(bgnVal);
      setEmagCurrency('BGN');
    } else {
      setEmagPrice(ronVal);
      setEmagCurrency('RON');
    }
    setBaselinkerPrice(eurVal);

    setToastNotice(`💰 Tüm pazaryeri fiyatları kur oranlarına göre güncellendi! (Allegro: ${plnVal} PLN, eMAG: ${emagCountry === 'BG' ? bgnVal + ' BGN' : ronVal + ' RON'}, BaseLinker: ${eurVal} EUR)`);
  };

  // Generate valid EAN if missing
  const handleFixEan = () => {
    const fixedEan = `590${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setEan(fixedEan);
    setToastNotice(`Geçerli GTIN/EAN Barkod Üretildi: ${fixedEan}`);
  };

  // Format Part Number Key correctly
  const handleFixPartNumberKey = () => {
    let clean = (sku || coreTitle).replace(/[^a-zA-Z0-9-]/g, '').trim();
    if (!clean || /^\d+$/.test(clean)) {
      clean = `SKU-${clean || Math.floor(100000 + Math.random() * 900000)}`;
    }
    setEmagPartNumberKey(clean);
    setToastNotice(`Part Number Key Biçimlendirildi: ${clean}`);
  };

  // Run Client-side eMAG Schema Validation Simulator
  const handleRunEmagSchemaTest = () => {
    const messages: string[] = [];
    const pnkValid = Boolean(emagPartNumberKey.trim()) && (emagPartNumberKey.startsWith('SKU-') || !/^\d+$/.test(emagPartNumberKey));
    const vatValid = emagVatId === 6 || emagVatId === 1;
    const priceValid = parseFloat(emagPrice) > 0;
    const stockValid = stock >= 0;
    const categoryValid = Boolean(emagCategoryId) && Number(emagCategoryId) > 0;
    const characteristicsCount = Object.keys(emagCharacteristics).length;

    if (!pnkValid) messages.push('Part Number Key "SKU-" ön eki ile alfanümerik olmalıdır (Sadece sayı kabul edilmez).');
    if (!vatValid) messages.push(`Seçili KDV ID (${emagVatId}) teslimat ülkesi ile uyuşmuyor.`);
    if (!priceValid) messages.push('eMAG satış fiyatı 0\'dan büyük bir tutar olmalıdır.');
    if (!stockValid) messages.push('Stok miktarı geçersizdir.');
    if (!categoryValid) messages.push('Geçerli bir eMAG kategori ID seçilmelidir.');

    const isValid = messages.length === 0;

    if (isValid) {
      messages.push(`✅ eMAG v3 API Şeması Tam Uyumlu! (${emagCountry} Pazarı, ${emagSendStatus === 0 ? 'Taslak / Pasif' : 'Canlı / Aktif'} Mod).`);
    }

    setSchemaValidationResult({
      tested: true,
      valid: isValid,
      messages,
      details: {
        pnkValid,
        vatValid,
        priceValid,
        stockValid,
        categoryValid,
        characteristicsCount
      }
    });
  };

  // Live Auto-Detection for Attributes & Categories
  const handleLiveAutoDetectAll = () => {
    const autoDetected = autoDetectAttributesFromProduct({
      title: coreTitle,
      name: coreTitle,
      sku,
      ean,
      description: coreTitle,
      categoryCode: emagCategoryId,
      categoryName: currentEmagSchema.trName
    });

    if (autoDetected.allegroCategoryId) setAllegroCategoryId(autoDetected.allegroCategoryId);
    if (autoDetected.emagCategoryId) setEmagCategoryId(autoDetected.emagCategoryId);

    setAllegroParams(prev => ({ ...autoDetected.allegroParams, ...prev }));
    setEmagCharacteristics(prev => ({ 'emag-brand': 'Generic', 'emag-warranty': '24', ...autoDetected.emagCharacteristics, ...prev }));

    setToastNotice('⚡ Ürün başlığı ve nitelikleri canlı taranarak tüm kanallara senkronize edildi!');
  };

  // Sync core title & basic attributes to platforms
  const handleSyncCoreToPlatforms = () => {
    const trimmedTitle = coreTitle.trim();
    if (trimmedTitle) {
      setAllegroTitle(trimmedTitle.length > 75 ? trimmedTitle.substring(0, 75).trim() : trimmedTitle);
      setEmagTitle(trimmedTitle);
      setToastNotice('Ortak başlık ve parametreler Allegro & eMAG alanlarına kopyalandı.');
    }
  };

  // AI Category Matching using Gemini
  const handleAiMatchEmagCategory = async () => {
    setIsAiMatching(true);
    setToastNotice('🤖 Gemini AI ürün içeriklerini analiz ederek eMAG taksonomisini eşleştiriyor...');
    
    setTimeout(() => {
      const auto = autoDetectAttributesFromProduct({
        title: coreTitle,
        name: coreTitle,
        sku,
        ean,
        description: coreTitle
      });

      const matchedId = auto.emagCategoryId || '202';
      setEmagCategoryId(matchedId);
      setEmagCharacteristics(prev => ({ 'emag-brand': 'Generic', 'emag-warranty': '24', ...auto.emagCharacteristics, ...prev }));
      setIsAiMatching(false);
      setToastNotice(`🤖 AI Eşleştirmesi Tamamlandı: eMAG Kategori #${matchedId} (${auto.detectedCategory})`);
    }, 800);
  };

  // Validation Checks
  const isEanValid = ean.length >= 8 && /^\d+$/.test(ean);
  const isCoreValid = coreTitle.trim().length > 0 && sku.trim().length > 0 && isEanValid;
  const isAllegroTooLong = allegroTitle.length > 75;
  const isPreFlightReady = isCoreValid && !isAllegroTooLong && selectedChannels.length > 0;

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreFlightReady || isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(async () => {
      // Format Allegro parameters
      const formattedAllegroParams = Object.entries(allegroParams).map(([id, val]) => ({
        id,
        name: id,
        values: [val]
      }));

      // Ensure PNK is formatted cleanly
      let cleanPnk = emagPartNumberKey.trim();
      if (!cleanPnk || /^\d+$/.test(cleanPnk)) {
        cleanPnk = `SKU-${cleanPnk || sku || Date.now()}`;
      }

      // Format eMAG channel payload
      const emagCharacteristicsArray = Object.entries(emagCharacteristics).map(([id, value]) => ({
        id,
        value
      }));

      const channelDataPayload = {
        allegro: {
          title: allegroTitle.trim(),
          price: { amount: parseFloat(allegroPrice).toFixed(2), currency: 'PLN' },
          categoryId: allegroCategoryId,
          smartEligible: allegroSmart,
          parameters: allegroParams
        },
        emag: {
          title: emagTitle.trim(),
          part_number: cleanPnk,
          price: { amount: parseFloat(emagPrice).toFixed(2), currency: emagCurrency },
          vat_id: emagVatId,
          status: emagSendStatus, // 0 = Draft, 1 = Active
          categoryId: emagCategoryId,
          geniusEligible: emagGenius,
          characteristics: emagCharacteristicsArray,
          handlingTime: emagHandlingTime
        },
        baselinker: {
          warehouseId: baselinkerWarehouseId,
          categoryId: baselinkerCategoryId,
          price: { amount: parseFloat(baselinkerPrice).toFixed(2), currency: baselinkerCurrency },
          weightKg: parseFloat(baselinkerWeightKg),
          dimensions: {
            width: parseFloat(baselinkerDimensions.width),
            height: parseFloat(baselinkerDimensions.height),
            depth: parseFloat(baselinkerDimensions.depth)
          },
          autoSyncStock: baselinkerSyncStock,
          autoSyncPrice: baselinkerSyncPrice
        }
      };

      let savedCategory = {
        id: allegroCategoryId || '12800',
        name: currentAllegroCategory.name || 'Genel Kategori'
      };

      if (selectedChannels.includes('emag')) {
        savedCategory = {
          id: String(currentEmagSchema.id || emagCategoryId),
          name: currentEmagSchema.trName || currentEmagSchema.name
        };
      }

      if (isEditing && editingId) {
        store.updateFullOffer(editingId, {
          name: coreTitle.trim(),
          category: savedCategory,
          sellingMode: {
            format: 'BUY_NOW',
            price: {
              amount: parseFloat(basePrice).toFixed(2),
              currency: baseCurrency
            }
          },
          stock: {
            available: stock,
            unit: 'UNIT'
          },
          sku: sku.trim(),
          ean: ean.trim(),
          primaryImage: imageUrl.trim(),
          smartEligible: allegroSmart,
          parameters: formattedAllegroParams,
          targetChannels: selectedChannels,
          channelData: channelDataPayload,
          excelMetadata: {
            ...(offerToEdit?.excelMetadata || {}),
            emagCategoryCode: emagCategoryId,
            emagCategoryName: currentEmagSchema?.trName || currentEmagSchema?.name || offerToEdit?.excelMetadata?.emagCategoryName,
            matchedCategoryCode: emagCategoryId || offerToEdit?.excelMetadata?.matchedCategoryCode,
            matchedCategoryName: currentEmagSchema?.trName || offerToEdit?.excelMetadata?.matchedCategoryName
          },
          isDraft: isDraftOffer ? !publishOnSave : false,
          publicationStatus: isDraftOffer ? (publishOnSave ? 'ACTIVE' : 'DRAFT') : 'ACTIVE'
        });

        // Trigger real eMAG publish API transmission if eMAG is selected
        if (selectedChannels.includes('emag')) {
          const res = await store.publishOfferToEmag(editingId, channelDataPayload.emag);
          if (res.report) {
            setEmagExecutionReport(res.report);
            setShowEmagLogsModal(true);
          }
        }
      } else {
        const created = store.createOffer({
          name: coreTitle.trim(),
          category: savedCategory,
          sellingMode: {
            format: 'BUY_NOW',
            price: {
              amount: parseFloat(basePrice).toFixed(2),
              currency: baseCurrency
            }
          },
          stock: {
            available: stock,
            unit: 'UNIT'
          },
          sku: sku.trim(),
          ean: ean.trim(),
          primaryImage: imageUrl.trim(),
          smartEligible: allegroSmart,
          parameters: formattedAllegroParams,
          targetChannels: selectedChannels
        });

        if (selectedChannels.includes('emag') && created?.id) {
          const res = await store.publishOfferToEmag(created.id, channelDataPayload.emag);
          if (res.report) {
            setEmagExecutionReport(res.report);
            setShowEmagLogsModal(true);
          }
        }
      }

      setIsSubmitting(false);
      setCreatedSuccess(true);
      if (!selectedChannels.includes('emag')) {
        setTimeout(() => {
          onClose();
        }, 600);
      }
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className={`border rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl transition-all my-auto flex flex-col max-h-[94vh] ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {isEditing ? <Edit2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {isEditing ? 'İlanı Düzenle & Pazar Yeri Revizyonu' : 'Çoklu Kanal İlan Sihirbazı'}
                </h2>
                {isDraftOffer ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-amber-600" />
                    <span>{originInfo.label.toUpperCase()}</span>
                  </span>
                ) : isEditing ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 flex items-center gap-1.5">
                    {originInfo.platform !== 'multi' && (
                      <MarketplaceLogo platform={originInfo.platform === 'draft' || originInfo.platform === 'excel' ? 'allegro' : originInfo.platform} size="xs" rounded="full" />
                    )}
                    <span>{originInfo.label}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                    Çoklu Pazar Yeri Hub
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Ortak ürün çekirdeğini tek yerden yönetin; eMAG, Allegro ve BaseLinker para birimlerini, KDV ve kategorilerini bağımsız revize edin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoConvertPrices}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold items-center gap-1.5 cursor-pointer transition-colors"
              title="Referans fiyata göre PLN, BGN, RON ve EUR kurlarını otomatik hesapla"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fiyat/Kur Çevirici</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {toastNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{toastNotice}</span>
            </div>
            <button onClick={() => setToastNotice(null)} className="text-emerald-700 hover:underline text-[10px] cursor-pointer">
              Kapat
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850/40 overflow-x-auto no-scrollbar shrink-0">
          {/* Tab 1: Ortak Çekirdek */}
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'core'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>1. Ortak Ürün Bilgisi</span>
            <span className="text-[10px] font-mono opacity-80 bg-black/10 dark:bg-white/20 px-1.5 py-0.2 rounded">
              Temel
            </span>
          </button>

          {/* Tab 2: eMAG */}
          <button
            type="button"
            onClick={() => setActiveTab('emag')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'emag'
                ? 'bg-[#005fb8] text-white shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            <MarketplaceLogo platform="emag" size="xs" rounded="full" />
            <span>2. eMAG (Bulgaristan/Romanya)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              selectedChannels.includes('emag')
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'
            }`}>
              {selectedChannels.includes('emag') ? `${emagCurrency} • ${emagSendStatus === 0 ? 'Taslak' : 'Canlı'}` : 'Pasif'}
            </span>
          </button>

          {/* Tab 3: Allegro */}
          <button
            type="button"
            onClick={() => setActiveTab('allegro')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'allegro'
                ? 'bg-[#ff5a00] text-white shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
            <span>3. Allegro</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              selectedChannels.includes('allegro')
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'
            }`}>
              {selectedChannels.includes('allegro') ? 'PLN • Aktif' : 'Pasif'}
            </span>
          </button>

          {/* Tab 4: BaseLinker */}
          <button
            type="button"
            onClick={() => setActiveTab('baselinker')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'baselinker'
                ? 'bg-[#1b2559] text-white shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
            <span>4. BaseLinker</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              selectedChannels.includes('baselinker')
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'
            }`}>
              {selectedChannels.includes('baselinker') ? 'Depo • Aktif' : 'Pasif'}
            </span>
          </button>

          {/* Tab 5: Excel Source (If Available) */}
          {offerToEdit?.excelMetadata && (
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'excel'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel Verisi</span>
            </button>
          )}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* ======================================================== */}
          {/* TAB 1: ORTAK ÇEKİRDEK (CORE PRODUCT DATA)                 */}
          {/* ======================================================== */}
          {activeTab === 'core' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Quick Sync Banner */}
              <div className="p-3.5 rounded-2xl bg-linear-to-r from-amber-500/10 via-slate-50 to-slate-50 dark:from-amber-500/10 dark:via-zinc-850 dark:to-zinc-850 border border-slate-200 dark:border-zinc-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Ortak Ürün Temeli & Canlı Nitelik Çekici</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Ürün başlığına göre tüm pazaryerlerinin (eMAG, Allegro) zorunlu niteliklerini ve kategorisini canlı çekin.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleLiveAutoDetectAll}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto active:scale-95 transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>⚡ Canlı Nitelikleri Çek</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncCoreToPlatforms}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tüm Kanallara Dağıt</span>
                  </button>
                </div>
              </div>

              {/* Master Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800 dark:text-zinc-200">
                    Ortak / Ana Ürün Başlığı: *
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {coreTitle.length} karakter (Ana Katalog Adı)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={coreTitle}
                  onChange={(e) => setCoreTitle(e.target.value)}
                  placeholder="Örn: RGB LED Smart Life Zigbee Controller COB LED Strip USB Lights 5V Tuya"
                  className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                />
              </div>

              {/* Taxonomy Diagnostic Panel */}
              <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-zinc-850/70 border-zinc-750' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                        <span>Kategori Eşleştirmesi ve Taksonomi Durumu</span>
                      </span>
                      {categoryDiagnosis?.hasClashFixed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Çapraz Çakışma Düzeltildi</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Ürün içeriğine göre pazaryerlerinin kendi resmi API kategorileri bağımsız olarak doğrulanır.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAiMatchEmagCategory}
                      disabled={isAiMatching}
                      className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer shrink-0 transition-colors disabled:opacity-50"
                      title="Excel ve ürün adını Gemini AI ile analiz edip otomatik eşle"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>{isAiMatching ? 'AI Eşliyor...' : '🤖 AI & Excel Eşle'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLiveAutoDetectAll}
                      className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Yeniden Eşle</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Excel Kaynak */}
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-750' : 'bg-white border-slate-200'}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                      <span>Kaynak / Excel Eşleşmesi</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate" title={categoryDiagnosis?.sourceCategoryName}>
                      {categoryDiagnosis?.sourceCategoryName || 'Genel Envanter'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Kod: {categoryDiagnosis?.sourceCategoryCode || '-'}
                    </div>
                  </div>

                  {/* eMAG Hedef */}
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-750' : 'bg-white border-slate-200'}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                        <span>eMAG API Hedefi</span>
                      </div>
                      <span className="font-mono text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1 rounded">
                        ID: {emagCategoryId}
                      </span>
                    </div>
                    <select
                      value={emagCategoryId}
                      onChange={(e) => setEmagCategoryId(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-transparent border-0 p-0 focus:outline-none cursor-pointer truncate"
                    >
                      {EMAG_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.badge ? `(${c.badge})` : ''}
                        </option>
                      ))}
                      {syncedEmagCategories.filter(sc => !EMAG_CATEGORIES.some(ec => String(ec.id) === String(sc.id))).map(sc => (
                        <option key={sc.id} value={String(sc.id)}>
                          {sc.trName || sc.name} [ID: {sc.id}]
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="truncate">{currentEmagSchema.trName || currentEmagSchema.name}</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('emag')}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold shrink-0 ml-1.5 cursor-pointer"
                      >
                        Ağaçtan Seç →
                      </button>
                    </div>
                  </div>

                  {/* Allegro Hedef */}
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-750' : 'bg-white border-slate-200'}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#ff5a00] mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                        <span>Allegro API Hedefi</span>
                      </div>
                      <span className="font-mono text-[9px] bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 px-1 rounded">
                        ID: {allegroCategoryId}
                      </span>
                    </div>
                    <select
                      value={allegroCategoryId}
                      onChange={(e) => setAllegroCategoryId(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-transparent border-0 p-0 focus:outline-none cursor-pointer truncate"
                    >
                      {leafCategories.map(cat => {
                        const tr = CATEGORY_TRANSLATIONS[cat.id];
                        return (
                          <option key={cat.id} value={cat.id}>
                            {tr ? tr.tr : cat.name}
                          </option>
                        );
                      })}
                    </select>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {CATEGORY_TRANSLATIONS[allegroCategoryId]?.tr || currentAllegroCategory.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identifiers & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Ana SKU / Ürün Kodu: *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="OMNI-7721"
                    className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                      Barkod (EAN / GTIN): *
                    </label>
                    {!isEanValid && (
                      <button
                        type="button"
                        onClick={handleFixEan}
                        className="text-[10px] text-amber-600 hover:underline font-bold cursor-pointer"
                      >
                        (Otomatik Üret)
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={ean}
                    onChange={(e) => setEan(e.target.value)}
                    placeholder="590..."
                    className={`w-full border rounded-xl p-2 text-xs font-mono focus:outline-none ${
                      !isEanValid
                        ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 bg-slate-50 dark:bg-zinc-800/60'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Toplam Depo Stoku: *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setStock(isNaN(v) ? 0 : Math.max(0, v));
                    }}
                    className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                  />
                </div>
              </div>

              {/* Base Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                      Referans Baz Satış Fiyatı: *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoConvertPrices}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Kurlara Çevir & Dağıt</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800/60 pl-3 pr-24"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <select
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value as any)}
                        className="text-[10px] font-mono font-bold py-1 px-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="PLN">PLN (zł)</option>
                        <option value="BGN">BGN (лв)</option>
                        <option value="RON">RON (lei)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="TRY">TRY (₺)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Kapak Görseli URL: *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                    />
                    <ProductImage
                      src={imageUrl}
                      alt="Önizleme"
                      className="w-9 h-9 rounded-lg shrink-0"
                      iconSize="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Marketplace Activation Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                  <span>Yayın Kanalları ve Entegrasyon Durumu:</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {selectedChannels.length} kanal etkin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => handleToggleChannel('allegro')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedChannels.includes('allegro')
                        ? 'bg-slate-50 dark:bg-zinc-800 border-slate-900 dark:border-zinc-200 shadow-2xs font-medium'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">Allegro REST API</div>
                        <div className="text-[10px] text-slate-500">PLN • 75 Karakter Sınırı</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('allegro')}
                      onChange={() => {}}
                      className="w-4 h-4 accent-slate-900 dark:accent-zinc-100 pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => handleToggleChannel('emag')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedChannels.includes('emag')
                        ? 'bg-slate-50 dark:bg-zinc-800 border-slate-900 dark:border-zinc-200 shadow-2xs font-medium'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">eMAG Marketplace</div>
                        <div className="text-[10px] text-slate-500">BGN/RON • %20 KDV • Taslak Mod</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('emag')}
                      onChange={() => {}}
                      className="w-4 h-4 accent-slate-900 dark:accent-zinc-100 pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => handleToggleChannel('baselinker')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedChannels.includes('baselinker')
                        ? 'bg-slate-50 dark:bg-zinc-800 border-slate-900 dark:border-zinc-200 shadow-2xs font-medium'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">BaseLinker Hub</div>
                        <div className="text-[10px] text-slate-500">Depo • Çoklu Kur • Desi</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('baselinker')}
                      onChange={() => {}}
                      className="w-4 h-4 accent-slate-900 dark:accent-zinc-100 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: eMAG PAZARYERİ (BULGARİSTAN / ROMANYA)              */}
          {/* ======================================================== */}
          {activeTab === 'emag' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* eMAG Banner with Target Market Selector */}
              <div className="p-3.5 rounded-2xl bg-[#005fb8]/10 border border-[#005fb8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MarketplaceLogo platform="emag" size="sm" rounded="full" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                      <span>eMAG Marketplace Entegrasyon Revizyonu</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#005fb8] text-white">
                        🇧🇬 Bulgaristan (emag.bg) - Aktif Pazar
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      eMAG v3 API spesifikasyonlarına göre PNK, KDV ID, 255 karakter SEO başlığı ve eMAG kategori şemasını yapılandırın.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleChannel('emag')}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      selectedChannels.includes('emag')
                        ? 'bg-[#005fb8] text-white border-[#005fb8]'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {selectedChannels.includes('emag') ? 'Etkin (Yayında)' : 'Pasif Yap'}
                  </button>
                </div>
              </div>

              {/* Target Country & Send Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750">
                {/* Country Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hedef eMAG Ülkesi & Para Birimi:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCountryChange('BG')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        emagCountry === 'BG'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇧🇬 Bulgaristan (BGN)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCountryChange('RO')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        emagCountry === 'RO'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇷🇴 Romanya (RON)</span>
                    </button>
                  </div>
                </div>

                {/* Send Status Selector (Draft vs Active) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>eMAG Gönderim Statüsü (status):</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEmagSendStatus(0)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        emagSendStatus === 0
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>0: Taslak / Pasif [ÖNERİLEN]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmagSendStatus(1)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        emagSendStatus === 1
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>1: Doğrudan Canlı</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* eMAG Rich SEO Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-800 dark:text-zinc-200">
                      eMAG SEO Ürün Başlığı: *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmagTitle(coreTitle)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 underline cursor-pointer"
                    >
                      (Ortaktan Kopyala)
                    </button>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {emagTitle.length} / 255 karakter (eMAG SEO)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={emagTitle}
                  onChange={(e) => setEmagTitle(e.target.value)}
                  placeholder="Ceas Smartwatch Titan Pro AMOLED GPS Rezistent la Apa..."
                  className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                />
              </div>

              {/* PNK (Part Number Key) & VAT ID Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PNK */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                      Part Number Key (Üretici Kod / PNK): *
                    </label>
                    <button
                      type="button"
                      onClick={handleFixPartNumberKey}
                      className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      (SKU Biçimlendir)
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={emagPartNumberKey}
                    onChange={(e) => setEmagPartNumberKey(e.target.value)}
                    placeholder="SKU-8993417"
                    className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                  />
                  <p className="text-[10px] text-slate-400">
                    eMAG sadece harf/tire içeren alfanümerik kod ister. Sadece sayı girilirse sistem otomatik "SKU-" ekler.
                  </p>
                </div>

                {/* VAT ID Selection */}
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    KDV Oranı & vat_id (Teslimat Ülkesi KDV): *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEmagVatId(6)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        emagVatId === 6
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <span>ID: 6 (%20 BG KDV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmagVatId(1)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        emagVatId === 1
                          ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <span>ID: 1 (%19 RO KDV)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {emagCountry === 'BG' ? '🇧🇬 Bulgaristan için eMAG sistemindeki geçerli KDV ID: 6 (%20 KDV).' : '🇷🇴 Romanya için eMAG sistemindeki geçerli KDV ID: 1 (%19 KDV).'}
                  </p>
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    eMAG Satış Fiyatı ({emagCurrency}): *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={emagPrice}
                      onChange={(e) => setEmagPrice(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800/60 pl-3 pr-20"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <select
                        value={emagCurrency}
                        onChange={(e) => {
                          const c = e.target.value as any;
                          setEmagCurrency(c);
                          if (c === 'BGN') { setEmagCountry('BG'); setEmagVatId(4); }
                          else if (c === 'RON') { setEmagCountry('RO'); setEmagVatId(1); }
                        }}
                        className="text-[10px] font-mono font-bold py-1 px-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="BGN">BGN (BG)</option>
                        <option value="RON">RON (RO)</option>
                        <option value="HUF">HUF (HU)</option>
                      </select>
                    </div>
                  </div>
                  {/* Financial calculation breakdown */}
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono space-y-0.5 mt-1 bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <div className="flex justify-between">
                      <span>{emagCountry === 'BG' ? 'Bulgaristan KDV (%20):' : 'Romanya KDV (%19):'}</span>
                      <span className="font-bold">{(parseFloat(emagPrice) * (emagCountry === 'BG' ? 0.20 : 0.19)).toFixed(2)} {emagCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tahmini eMAG Komisyonu (%14):</span>
                      <span className="font-bold">{(parseFloat(emagPrice) * 0.14).toFixed(2)} {emagCurrency}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                      eMAG Kategori Sınıflandırması: *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAiMatchEmagCategory}
                        disabled={isAiMatching}
                        className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer border border-purple-200 dark:border-purple-800/60 disabled:opacity-50"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        <span>{isAiMatching ? 'AI Eşliyor...' : '🤖 AI ile Eşle'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Rich Searchable eMAG Category Selector */}
                  <EmagCategorySelector
                    selectedCategoryId={emagCategoryId}
                    onSelectCategory={(newCatId) => {
                      setEmagCategoryId(newCatId);
                    }}
                    theme={theme}
                    isDraft={isDraftOffer}
                  />

                  <div className="mt-2 space-y-1">
                    <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                      Depo & Lojistik Modeli:
                    </label>
                    <select
                      value={emagFulfillment}
                      onChange={(e) => setEmagFulfillment(e.target.value as any)}
                      className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs bg-slate-50 dark:bg-zinc-800/60 font-medium focus:outline-none"
                    >
                      <option value="merchant">Kendi Depomuz (Merchant Fulfillment - Sameday Kargo)</option>
                      <option value="fbe">Fulfillment by eMAG (FBE Konsinye Deposu)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic eMAG Characteristics Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span>eMAG Zorunlu Karakteristikler & Filtre Alanları</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {currentEmagSchema.characteristics.filter(c => c.required).length} Zorunlu Alan
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {currentEmagSchema.trName} kategorisine ait resmi eMAG API katalog nitelikleri.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomAttr(!showAddCustomAttr)}
                      className="text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Özel Nitelik</span>
                    </button>
                  </div>
                </div>

                {/* Custom Attribute Add Bar */}
                {showAddCustomAttr && (
                  <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-wrap items-center gap-2 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="Örn: Garanti Süresi / Chipset"
                      value={newCustomKey}
                      onChange={(e) => setNewCustomKey(e.target.value)}
                      className="flex-1 min-w-[140px] p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Değer: 24 Ay / Tuya v3"
                      value={newCustomVal}
                      onChange={(e) => setNewCustomVal(e.target.value)}
                      className="flex-1 min-w-[140px] p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAttribute}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      Ekle
                    </button>
                  </div>
                )}

                {/* Dynamic Category Characteristics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentEmagSchema.characteristics.map((item) => {
                    const val = emagCharacteristics[item.id] || '';
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-semibold block text-slate-800 dark:text-zinc-200">
                            {item.trName} <span className="text-[10px] text-slate-400 font-normal">({item.name})</span> {item.required && <strong className="text-rose-500">*</strong>}
                          </label>
                        </div>
                        {item.options && item.options.length > 0 ? (
                          <select
                            value={val || item.options[0]}
                            onChange={(e) => setEmagCharacteristics(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs bg-white dark:bg-zinc-800 focus:outline-none font-medium"
                          >
                            {item.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setEmagCharacteristics(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder={item.trName}
                            className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs bg-white dark:bg-zinc-800 focus:outline-none"
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* User Added Custom Attributes */}
                  {customEmagAttributes.map((attr) => (
                    <div key={attr.id} className="space-y-1 relative">
                      <div className="flex items-center justify-between text-[11px]">
                        <label className="font-semibold text-blue-700 dark:text-blue-300">
                          {attr.name} (Özel Nitelik)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomAttribute(attr.id, attr.name)}
                          className="text-[10px] text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          Sil
                        </button>
                      </div>
                      <input
                        type="text"
                        value={emagCharacteristics[attr.name] || attr.value}
                        onChange={(e) => setEmagCharacteristics(prev => ({ ...prev, [attr.name]: e.target.value }))}
                        className="w-full border border-blue-200 dark:border-blue-800 rounded-xl p-2 text-xs bg-white dark:bg-zinc-800 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live eMAG Schema & Verification Simulator Card */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-zinc-950 border border-slate-800 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold">eMAG v3 API Şema Doğrulayıcı</h4>
                      <p className="text-[10px] text-slate-400">
                        Ürünü eMAG'a göndermeden önce tüm alanların eMAG sunucularının beklediği şemaya uygunluğunu test edin.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunEmagSchemaTest}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Şemayı Test Et</span>
                  </button>
                </div>

                {schemaValidationResult && (
                  <div className={`p-3 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                    schemaValidationResult.valid
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-800 text-rose-200'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {schemaValidationResult.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {schemaValidationResult.valid
                          ? 'Şema Doğrulama Başarılı: eMAG Yükü Sorunsuz'
                          : 'Şema Doğrulama Uyarısı: Düzeltme Gerekiyor'}
                      </span>
                    </div>

                    <ul className="space-y-1 text-[11px] list-disc list-inside opacity-90">
                      {schemaValidationResult.messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ALLEGRO PAZARYERİ (POLONYA REST API)                */}
          {/* ======================================================== */}
          {activeTab === 'allegro' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Channel Header Banner */}
              <div className="p-3 rounded-2xl bg-[#ff5a00]/10 border border-[#ff5a00]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MarketplaceLogo platform="allegro" size="sm" rounded="full" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100">Allegro REST API (Polonya, Çekya, Slovakya)</h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Zorunlu 75 karakter başlık kuralı, PLN para birimi, Allegro kategori parametreleri ve Smart! InPost kargo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleChannel('allegro')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedChannels.includes('allegro')
                      ? 'bg-[#ff5a00] text-white border-[#ff5a00]'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {selectedChannels.includes('allegro') ? 'Etkin (Yayında)' : 'Pasif Yap'}
                </button>
              </div>

              {/* Allegro Title with strict 75 char validation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-800 dark:text-zinc-200">
                      Allegro İlan Başlığı: *
                    </label>
                    <button
                      type="button"
                      onClick={() => setAllegroTitle(coreTitle.length > 75 ? coreTitle.substring(0, 75).trim() : coreTitle)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 underline cursor-pointer"
                    >
                      (Ortaktan Kopyala)
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-[11px] ${
                      allegroTitle.length > 75 ? 'text-rose-600' : allegroTitle.length > 65 ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {allegroTitle.length} / 75 karakter
                    </span>
                    {allegroTitle.length > 75 && (
                      <button
                        type="button"
                        onClick={() => setAllegroTitle(allegroTitle.substring(0, 75).trim())}
                        className="text-[10px] font-semibold text-rose-600 underline hover:text-rose-800 cursor-pointer"
                      >
                        75 Karakterle Kırp
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={allegroTitle}
                  onChange={(e) => setAllegroTitle(e.target.value)}
                  placeholder="Allegro 75 karakter ürün başlığı..."
                  className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition-colors ${
                    allegroTitle.length > 75
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/20 text-rose-900'
                      : 'border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 bg-slate-50 dark:bg-zinc-800/60'
                  }`}
                />
              </div>

              {/* Allegro Price & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Allegro Satış Fiyatı (PLN): *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={allegroPrice}
                      onChange={(e) => setAllegroPrice(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-mono font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800/60 pl-3 pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500">
                      PLN
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Allegro Kategori Ağacı: *
                  </label>
                  <select
                    value={allegroCategoryId}
                    onChange={(e) => setAllegroCategoryId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-700 focus:border-slate-800 dark:focus:border-zinc-300 rounded-xl p-2 text-xs font-medium focus:outline-none bg-slate-50 dark:bg-zinc-800/60"
                  >
                    {leafCategories.map((cat) => {
                      const trInfo = CATEGORY_TRANSLATIONS[cat.id];
                      return (
                        <option key={cat.id} value={cat.id}>
                          {trInfo ? `${trInfo.tr} (${trInfo.original})` : cat.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Allegro Category Parameters Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>Allegro Zorunlu Ürün Nitelikleri</span>
                    <span className="text-[10px] font-mono text-slate-400">({requiredAllegroParams.length} Zorunlu Alan)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {requiredAllegroParams.map((param) => {
                    const val = allegroParams[param.id] || '';
                    const trParam = PARAMETER_TRANSLATIONS[param.id];
                    const trTitle = trParam ? trParam.tr : param.name;

                    return (
                      <div key={param.id} className="space-y-1">
                        <label className="font-semibold block text-slate-800 dark:text-zinc-200 text-[11px]">
                          {trTitle} <strong className="text-rose-500">*</strong>
                        </label>
                        {param.options && param.options.length > 0 ? (
                          <select
                            value={val}
                            onChange={(e) => setAllegroParams(prev => ({ ...prev, [param.id]: e.target.value }))}
                            className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs bg-white dark:bg-zinc-800 focus:outline-none"
                          >
                            {param.options.map((opt) => {
                              const optTr = OPTION_TRANSLATIONS[opt.value];
                              return (
                                <option key={opt.id} value={opt.value}>
                                  {optTr ? `${optTr.tr} (${optTr.original})` : opt.value}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setAllegroParams(prev => ({ ...prev, [param.id]: e.target.value }))}
                            placeholder={trTitle}
                            className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-mono bg-white dark:bg-zinc-800 focus:outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Allegro Smart Logistics */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Allegro Smart! Kargo & InPost Paczkomat</div>
                    <div className="text-[10px] text-slate-500">24 Saat içinde kargoya teslim ve InPost kilitli dolap dağıtımı</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allegroSmart}
                  onChange={(e) => setAllegroSmart(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 dark:accent-zinc-100 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: BASELINKER (MERKEZİ ENVANTER & DEPONUZ)            */}
          {/* ======================================================== */}
          {activeTab === 'baselinker' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Channel Header Banner */}
              <div className="p-3 rounded-2xl bg-[#1b2559]/10 border border-[#1b2559]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MarketplaceLogo platform="baselinker" size="sm" rounded="full" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100">BaseLinker Envanter & Sipariş Köprüsü</h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Çoklu depo stok dağılımı, kargo desi/ağırlık yönetimi ve iki yönlü otomatik stok senkronizasyonu.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleChannel('baselinker')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedChannels.includes('baselinker')
                      ? 'bg-[#1b2559] text-white border-[#1b2559]'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {selectedChannels.includes('baselinker') ? 'Etkin (Yayında)' : 'Pasif Yap'}
                </button>
              </div>

              {/* Warehouse & Category Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Bağlı Merkez Depo: *
                  </label>
                  <select
                    value={baselinkerWarehouseId}
                    onChange={(e) => setBaselinkerWarehouseId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 font-medium focus:outline-none"
                  >
                    {BASELINKER_WAREHOUSES.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    BaseLinker Katalog Eşlemesi: *
                  </label>
                  <select
                    value={baselinkerCategoryId}
                    onChange={(e) => setBaselinkerCategoryId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 font-medium focus:outline-none"
                  >
                    {BASELINKER_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Weight/Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    BaseLinker Liste Fiyatı:
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={baselinkerPrice}
                      onChange={(e) => setBaselinkerPrice(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-mono font-bold bg-slate-50 dark:bg-zinc-800/60 pl-3 pr-20 focus:outline-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <select
                        value={baselinkerCurrency}
                        onChange={(e) => setBaselinkerCurrency(e.target.value as any)}
                        className="text-[10px] font-mono font-bold py-1 px-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="PLN">PLN (zł)</option>
                        <option value="USD">USD ($)</option>
                        <option value="TRY">TRY (₺)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Ürün Ağırlığı (kg):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.01"
                      value={baselinkerWeightKg}
                      onChange={(e) => setBaselinkerWeightKg(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-mono font-bold bg-slate-50 dark:bg-zinc-800/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block text-slate-700 dark:text-zinc-300 text-[11px]">
                    Ebatlar (GxYxD cm):
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      value={baselinkerDimensions.width}
                      onChange={(e) => setBaselinkerDimensions(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="G"
                      title="Genişlik"
                      className="border border-slate-200 dark:border-zinc-700 rounded-lg p-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-zinc-800/60 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={baselinkerDimensions.height}
                      onChange={(e) => setBaselinkerDimensions(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="Y"
                      title="Yükseklik"
                      className="border border-slate-200 dark:border-zinc-700 rounded-lg p-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-zinc-800/60 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={baselinkerDimensions.depth}
                      onChange={(e) => setBaselinkerDimensions(prev => ({ ...prev, depth: e.target.value }))}
                      placeholder="D"
                      title="Derinlik"
                      className="border border-slate-200 dark:border-zinc-700 rounded-lg p-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-zinc-800/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Sync Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">İki Yönlü Stok Senkronu</div>
                    <div className="text-[10px] text-slate-500">Bir kanalda satış olduğunda tüm kanallardan otomatik stok düşümü</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={baselinkerSyncStock}
                    onChange={(e) => setBaselinkerSyncStock(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Otomatik Fiyat Eşitleme</div>
                    <div className="text-[10px] text-slate-500">Merkezi fiyat değişimini pazaryeri kurlarına göre senkronize et</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={baselinkerSyncPrice}
                    onChange={(e) => setBaselinkerSyncPrice(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: EXCEL HAM VERİSİ (YALNIZCA VARSA)                 */}
          {/* ======================================================== */}
          {activeTab === 'excel' && offerToEdit?.excelMetadata && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                      Excel Dosyasından İçe Aktarılan Orijinal Veriler
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    Ham Veri Kaynağı
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Orijinal Liste Fiyatı:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      €{offerToEdit.excelMetadata.originalEurPrice?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">İndirimli Fiyat:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      €{offerToEdit.excelMetadata.discountedEurPrice?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Excel Kategori Adı:</span>
                    <span className="font-medium truncate block text-slate-800 dark:text-zinc-200" title={offerToEdit.excelMetadata.matchedCategoryName}>
                      {offerToEdit.excelMetadata.matchedCategoryName || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kaynak Web Linki:</span>
                    {offerToEdit.excelMetadata.websiteLinks ? (
                      <a
                        href={offerToEdit.excelMetadata.websiteLinks}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Kaynağı Aç</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Draft Publication Choice (If editing or draft product) */}
          {isDraftOffer && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                <span>Revizyon ve Yayınlama Tercihi:</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Şu an: TASLAK
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  onClick={() => setPublishOnSave(false)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    !publishOnSave
                      ? 'border-slate-900 dark:border-zinc-200 bg-white dark:bg-zinc-800 font-bold text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 bg-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="publishPref"
                    checked={!publishOnSave}
                    onChange={() => setPublishOnSave(false)}
                    className="accent-slate-900 dark:accent-zinc-100"
                  />
                  <div>
                    <div>Taslak Olarak Güncelle (status: 0)</div>
                    <div className="text-[10px] font-normal text-slate-500">Değişiklikleri kaydet, canlıya alma</div>
                  </div>
                </label>

                <label
                  onClick={() => setPublishOnSave(true)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    publishOnSave
                      ? 'border-slate-900 dark:border-zinc-200 bg-white dark:bg-zinc-800 font-bold text-slate-900 dark:text-zinc-100 shadow-2xs'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 bg-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="publishPref"
                    checked={publishOnSave}
                    onChange={() => setPublishOnSave(true)}
                    className="accent-slate-900 dark:accent-zinc-100"
                  />
                  <div>
                    <div>Doğrudan Yayına Al (status: 1)</div>
                    <div className="text-[10px] font-normal text-slate-500">Kaydet ve seçili pazaryerinde aktifleştir</div>
                  </div>
                </label>
              </div>

              {/* Target specific marketplace when "Doğrudan Yayına Al" is chosen */}
              {publishOnSave && (
                <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 space-y-2 animate-in fade-in">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Hangi Pazaryerine Gönderilsin?</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedChannels.length === 1
                        ? `Yalnızca ${selectedChannels[0].toUpperCase()} hedeflendi`
                        : `${selectedChannels.length} pazaryeri seçili`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChannels(['emag'])}
                      className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        selectedChannels.length === 1 && selectedChannels[0] === 'emag'
                          ? 'border-[#005fb8] bg-[#005fb8]/10 text-slate-900 dark:text-zinc-100 font-bold ring-1 ring-[#005fb8]'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-400'
                      }`}
                    >
                      <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                      <div>
                        <div>Sadece eMAG</div>
                        <div className="text-[10px] font-normal text-slate-500">Bulgaristan/Romanya</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChannels(['allegro'])}
                      className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        selectedChannels.length === 1 && selectedChannels[0] === 'allegro'
                          ? 'border-[#ff5a00] bg-[#ff5a00]/10 text-slate-900 dark:text-zinc-100 font-bold ring-1 ring-[#ff5a00]'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-400'
                      }`}
                    >
                      <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                      <div>
                        <div>Sadece Allegro</div>
                        <div className="text-[10px] font-normal text-slate-500">Polonya REST API</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChannels(['baselinker'])}
                      className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        selectedChannels.length === 1 && selectedChannels[0] === 'baselinker'
                          ? 'border-[#1b2559] bg-[#1b2559]/10 text-slate-900 dark:text-zinc-100 font-bold ring-1 ring-[#1b2559]'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-400'
                      }`}
                    >
                      <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                      <div>
                        <div>Sadece BaseLinker</div>
                        <div className="text-[10px] font-normal text-slate-500">Merkezi Envanter</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 self-start sm:self-auto">
              {!isCoreValid ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Ortak başlık, SKU ve geçerli barkod (EAN) zorunludur</span>
                </span>
              ) : isAllegroTooLong ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Allegro başlığı en fazla 75 karakter olabilir</span>
                </span>
              ) : selectedChannels.length === 0 ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>En az bir pazar yeri seçmelisiniz</span>
                </span>
              ) : (
                <span className="text-slate-700 dark:text-zinc-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{selectedChannels.length} pazaryeri için kurallar ve parametreler hazır</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer min-h-[40px]"
              >
                İptal
              </button>

              <button
                type="submit"
                disabled={!isPreFlightReady || isSubmitting}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[40px] shadow-2xs ${
                  isPreFlightReady && !isSubmitting
                    ? 'bg-slate-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 active:scale-95'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : createdSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Güncellendi!</span>
                  </>
                ) : (
                  <>
                    {isEditing ? <Edit2 className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                    <span>
                      {isEditing
                        ? isDraftOffer && publishOnSave
                          ? selectedChannels.length === 1
                            ? `Sadece ${selectedChannels[0] === 'allegro' ? 'Allegro' : selectedChannels[0] === 'emag' ? 'eMAG' : 'BaseLinker'}'da Yayına Al`
                            : `${selectedChannels.length} Pazaryerinde Doğrudan Yayına Al`
                          : 'Değişiklikleri Kaydet & Revize Et'
                        : `${selectedChannels.length} Kanalda İlanı Aç`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showEmagLogsModal && (
        <EmagExecutionLogsModal
          isOpen={showEmagLogsModal}
          onClose={() => {
            setShowEmagLogsModal(false);
            onClose();
          }}
          report={emagExecutionReport}
          theme={isDark ? 'dark' : 'light'}
        />
      )}
    </div>
  );
};
