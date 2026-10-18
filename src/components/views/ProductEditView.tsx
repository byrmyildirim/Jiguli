import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Rocket,
  Trash2,
  FileText,
  Sliders,
  Image as ImageIcon,
  DollarSign,
  FileSpreadsheet,
  History,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Plus,
  Globe,
  Tag,
  Box,
  Check,
  Eye,
  Languages,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  Layers,
  Boxes,
  Truck,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Barcode,
  Send,
  Building,
  ShieldAlert,
  Zap,
  Maximize2,
  Search,
  Copy,
  Star,
  ShoppingBag,
  CreditCard,
  Clock,
  MapPin,
  FileCheck,
  HelpCircle,
  FolderTree
} from 'lucide-react';
import { AllegroOffer, MarketplaceId } from '../../types/allegro';
import { store } from '../../services/marketplaceStore';
import { MarketplaceLogo } from '../../constants/marketplaces';
import {
  matchProductToEmagCategory,
  KNOWN_CATEGORY_CHARACTERISTICS,
  CategoryMatchResult,
  getCategoryRequirements
} from '../../services/excelCategoryMatcher';
import allowedCategoriesRaw from '../../../data/emag_bg_allowed_categories.json';
import {
  CreateOfferModal,
  PARAMETER_TRANSLATIONS,
  BASELINKER_WAREHOUSES,
  BASELINKER_CATEGORIES
} from '../modals/CreateOfferModal';
import {
  ALLEGRO_TAXONOMY,
  searchAllegroTaxonomy,
  getAllegroTaxonomyCategory,
  matchAllegroCategoryFromTitle,
  autoFillAllegroParameters,
  AllegroTaxonomyCategory
} from '../../services/allegroCategoryTaxonomy';

interface ProductEditViewProps {
  offer: AllegroOffer;
  onBack: () => void;
  onSaveSuccess?: () => void;
  theme?: 'dark' | 'light';
}

export type EditTabType = 'core' | 'emag' | 'allegro' | 'baselinker' | 'excel' | 'all';

export const ALLEGRO_POPULAR_CATEGORIES = [
  { id: '4228', name: 'Płyty główne (Anakartlar)', path: 'Elektronika > Komputery > Podzespoły komputerowe > Płyty główne' },
  { id: '4227', name: 'Procesory (İşlemciler)', path: 'Elektronika > Komputery > Podzespoły > Procesory' },
  { id: '260018', name: 'Karty graficzne (Ekran Kartları)', path: 'Elektronika > Komputery > Karty graficzne' },
  { id: '257745', name: 'Dyski SSD i NVMe (SSD Depolama)', path: 'Elektronika > Komputery > Dyski i pamięci' },
  { id: '257548', name: 'Smartwatche i opaski sportowe (Akıllı Saatler)', path: 'Elektronika > Smartwatche i akcesoria' },
  { id: '66887', name: 'Słuchawki bezprzewodowe TWS (Bluetooth Kulaklıklar)', path: 'Elektronika > Sprzęt audio > Słuchawki' },
  { id: '48973', name: 'Głośniki przenośne Bluetooth (Hoparlörler)', path: 'Elektronika > Audio > Głośniki' },
  { id: '124921', name: 'Kable USB-C i ładowarki (Şarj & Kablo Aksesuarları)', path: 'Elektronika > Akcesoria telefoniczne' },
  { id: '12800', name: 'Taśmy LED & Smart Oświetlenie (LED Aydınlatma)', path: 'Elektronika > Oświetlenie LED' },
  { id: '12900', name: 'Smart Home: Czujniki & Przełączniki (Akıllı Ev Sensörleri)', path: 'Elektronika > Smart Home' },
  { id: '165', name: 'Smartfony i telefony (Akıllı Telefonlar)', path: 'Elektronika > Telefony i Akcesoria > Smartfony' },
  { id: '491', name: 'Laptopy i komputery (Dizüstü Bilgisayarlar)', path: 'Elektronika > Komputery > Laptopy' },
  { id: '1531', name: 'Elektronarzędzia (Elektrikli El Aletleri)', path: 'Dom i Ogród > Narzędzia' },
  { id: '3690', name: 'Tekstylia domowe & Pościel (Ev Tekstili / Nevresim)', path: 'Dom i Ogród > Wyposażenie > Tekstylia' },
  { id: '67414', name: 'Ekspresy do kawy & AGD (Kahve Makineleri)', path: 'Dom i Ogród > Kuchnia > Ekspresy' },
  { id: '1454', name: 'T-shirty męskie & Odzież (Erkek Tişört & Giyim)', path: 'Moda > Odzież męska > T-shirty' },
  { id: '531', name: 'Obuwie sportowe (Spor Ayakkabılar)', path: 'Moda > Obuwie > Sportowe' },
  { id: '620', name: 'Części samochodowe (Oto Yedek Parça)', path: 'Motoryzacja > Części samochodowe' },
  { id: '11818', name: 'Zabawki edukacyjne (Eğitici Oyuncaklar)', path: 'Dziecko > Zabawki > Edukacyjne' }
];

export const ProductEditView: React.FC<ProductEditViewProps> = ({
  offer,
  onBack,
  onSaveSuccess,
  theme = 'light'
}) => {
  // Navigation Tab State (Allegro priority first, then Core, eMAG, BaseLinker, Excel or All)
  const [activeTab, setActiveTab] = useState<EditTabType>('allegro');
  const [showModalView, setShowModalView] = useState(false);

  // Notice Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingEmag, setIsPublishingEmag] = useState(false);
  const [isPublishingAllegro, setIsPublishingAllegro] = useState(false);
  const [isPublishingBaselinker, setIsPublishingBaselinker] = useState(false);

  // --- 1. CORE / TEMEL ÜRÜN BİLGİLERİ ---
  const [name, setName] = useState(offer.name || '');
  const [sku, setSku] = useState(offer.sku || '');
  const [ean, setEan] = useState(() => {
    const raw = String(offer.ean || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (/^\d{8}$|^\d{12,14}$/.test(digits)) {
      const prefix = digits.slice(0, -1);
      const len = prefix.length;
      let sum = 0;
      for (let i = 0; i < len; i++) {
        const digit = parseInt(prefix[len - 1 - i], 10);
        const weight = (i % 2 === 0) ? 3 : 1;
        sum += digit * weight;
      }
      const check = (10 - (sum % 10)) % 10;
      return `${prefix}${check}`;
    }
    return raw;
  });
  const [brand, setBrand] = useState(offer.brand || 'Generic');
  const [websiteUrl, setWebsiteUrl] = useState(offer.excelMetadata?.websiteLinks || '');
  const [description, setDescription] = useState<string>(() => {
    if (typeof offer.description === 'string' && offer.description.trim()) {
      return offer.description;
    }
    if (offer.description?.sections?.[0]?.items?.[0]?.content) {
      return offer.description.sections[0].items[0].content;
    }
    return `<h2>${offer.name}</h2><p>Orijinal garantili ürün. Sameday kargo güvencesiyle eMAG ve Allegro için hazırlanmıştır.</p>`;
  });
  const [isPreviewHtml, setIsPreviewHtml] = useState(false);

  // Media
  const [primaryImage, setPrimaryImage] = useState(offer.primaryImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    const rawImages = (offer as any).images;
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      return rawImages.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
    }
    return offer.primaryImage ? [offer.primaryImage] : [];
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // Inventory & Pricing
  const [stock, setStock] = useState<number>(offer.stock?.available || 10);
  const [minStock, setMinStock] = useState<number>(2);
  const [costPriceEur, setCostPriceEur] = useState<number>(offer.excelMetadata?.originalEurPrice || 12.5);

  // --- 2. eMAG ÖZEL ALANLARI ---
  const initialCategoryMatch = useMemo(() => {
    return matchProductToEmagCategory({
      title: offer.name,
      name: offer.name,
      sku: offer.sku,
      url: offer.excelMetadata?.websiteLinks,
      productType: offer.category?.name,
      categoryCode: offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode,
      categoryName: offer.excelMetadata?.emagCategoryName || offer.category?.name
    });
  }, [offer]);

  const [emagCountry, setEmagCountry] = useState<'BG' | 'RO' | 'HU'>((offer.channelData?.emag as any)?.country || 'BG');
  const [emagSendStatus, setEmagSendStatus] = useState<0 | 1>(((offer.channelData?.emag as any)?.status ?? 0) as 0 | 1);
  const [emagTitle, setEmagTitle] = useState(offer.channelData?.emag?.title || offer.name || '');
  const [emagCurrency, setEmagCurrency] = useState<'BGN' | 'RON' | 'HUF'>((offer.channelData?.emag?.price?.currency as any) || (emagCountry === 'BG' ? 'BGN' : 'RON'));
  const [emagPriceRon, setEmagPriceRon] = useState<string>(
    offer.channelData?.emag?.price?.amount ||
    (offer.excelMetadata?.discountedEurPrice ? (offer.excelMetadata.discountedEurPrice * (emagCurrency === 'BGN' ? 1.96 : 4.97)).toFixed(2) : '129.90')
  );
  const [emagVatId, setEmagVatId] = useState<number>((offer.channelData?.emag as any)?.vatId || (emagCountry === 'BG' ? 6 : 1));
  const [emagPartNumberKey, setEmagPartNumberKey] = useState<string>(
    (offer.channelData?.emag as any)?.partNumberKey || (offer.sku ? (offer.sku.startsWith('SKU-') ? offer.sku : `SKU-${offer.sku}`) : `SKU-${offer.id}`)
  );
  const [emagGenius, setEmagGenius] = useState<boolean>(offer.channelData?.emag?.geniusEligible ?? true);
  const [emagCategoryId, setEmagCategoryId] = useState<number>(() => {
    const raw = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || offer.category?.id;
    const num = parseInt(String(raw || '').replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0 && num !== 6001 && num !== 257548 && num !== 3122) return num;
    return initialCategoryMatch.categoryId || 3426;
  });
  const [emagCategoryName, setEmagCategoryName] = useState<string>(
    offer.channelData?.emag?.categoryName ||
    offer.excelMetadata?.emagCategoryName ||
    initialCategoryMatch.categoryName ||
    offer.category?.name ||
    'Elektrikli Ev Aletleri > Saç Şekillendiriciler'
  );
  const [matchBadge, setMatchBadge] = useState<string>('Otomatik Eşleşti');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);

  // Characteristics
  const [emagCharacteristics, setEmagCharacteristics] = useState<{ id: string | number; value: string; name?: string }[]>(() => {
    const existing = offer.channelData?.emag?.characteristics;
    const targetCatId = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || initialCategoryMatch.categoryId || 3426;
    const numCatId = parseInt(String(targetCatId), 10);

    if (Array.isArray(existing) && existing.length > 0) {
      return existing.map(c => ({
        id: c.id,
        value: c.value,
        name: (c as any).name || (c as any).trLabel || `Özellik #${c.id}`
      }));
    }
    const defaultList = KNOWN_CATEGORY_CHARACTERISTICS[numCatId] || [
      { id: 'emag-brand', value: offer.brand || 'Generic', name: 'Marka' },
      { id: 'emag-color', value: 'Siyah', name: 'Renk' },
      { id: 'emag-guarantee', value: '24 Ay', name: 'Garanti Süresi' }
    ];
    return defaultList.map(c => ({ id: c.id, value: c.value, name: (c as any).name || `Özellik #${c.id}` }));
  });
  const [newCharName, setNewCharName] = useState('');
  const [newCharValue, setNewCharValue] = useState('');

  // Category Requirements
  const categoryRequirements = useMemo(() => {
    return getCategoryRequirements(emagCategoryId);
  }, [emagCategoryId]);

  const mandatoryRequirements = useMemo(() => {
    return categoryRequirements.filter(r => r.isMandatory);
  }, [categoryRequirements]);

  const missingRequirements = useMemo(() => {
    const missing: { key: string; label: string; trLabel: string; id?: string | number }[] = [];
    const cleanEan = (ean || '').trim().replace(/\D/g, '');
    if (!cleanEan || (cleanEan.length !== 12 && cleanEan.length !== 13 && cleanEan.length !== 8 && cleanEan.length !== 14)) {
      missing.push({ key: 'ean', label: 'EAN / Barcode', trLabel: 'Barkod / EAN-13' });
    }
    for (const req of mandatoryRequirements) {
      const existing = emagCharacteristics.find(
        c => String(c.id).toLowerCase() === String(req.id).toLowerCase()
      );
      if (!existing || !existing.value || !existing.value.trim()) {
        missing.push({ key: `char_${req.id}`, label: req.label, trLabel: req.trLabel, id: req.id });
      }
    }
    return missing;
  }, [ean, mandatoryRequirements, emagCharacteristics]);

  // --- 3. ALLEGRO KAPSAMLI İLAN & ÜRÜN SAYFASI ALANLARI ---
  const [allegroTitle, setAllegroTitle] = useState<string>(
    offer.channelData?.allegro?.title ||
    (offer.name && offer.name.length > 75 ? offer.name.substring(0, 75).trim() : offer.name || '')
  );
  const [allegroPricePln, setAllegroPricePln] = useState<string>(
    offer.channelData?.allegro?.price?.amount || offer.sellingMode?.price?.amount || '119.50'
  );
  const [allegroSmart, setAllegroSmart] = useState<boolean>(
    offer.channelData?.allegro?.smartEligible ?? offer.smartEligible ?? true
  );
  const [allegroCategoryId, setAllegroCategoryId] = useState<string>(() => {
    const rawId = String(offer.channelData?.allegro?.categoryId || offer.category?.id || '').trim();
    if (rawId && rawId !== '2713' && getAllegroTaxonomyCategory(rawId)) {
      return rawId;
    }
    const matched = matchAllegroCategoryFromTitle(offer.name || '');
    return matched ? matched.id : '4228';
  });
  const [allegroCategorySearchQuery, setAllegroCategorySearchQuery] = useState('');
  const [showAllegroCategoryDropdown, setShowAllegroCategoryDropdown] = useState(false);

  const currentTaxonomyCategory = useMemo(() => {
    return getAllegroTaxonomyCategory(allegroCategoryId) || ALLEGRO_TAXONOMY[0];
  }, [allegroCategoryId]);

  const searchedTaxonomyCategories = useMemo(() => {
    return searchAllegroTaxonomy(allegroCategorySearchQuery);
  }, [allegroCategorySearchQuery]);
  const [allegroStock, setAllegroStock] = useState<number>(
    offer.channelData?.allegro?.stock ?? offer.stock?.available ?? 10
  );
  const [allegroHandlingTime, setAllegroHandlingTime] = useState<string>(
    offer.channelData?.allegro?.handlingTime || 'PT24H'
  );
  const [allegroShippingRateId, setAllegroShippingRateId] = useState<string>(
    offer.channelData?.allegro?.shippingRateId || offer.delivery?.shippingRates?.id || 'standard-inpost'
  );
  const [allegroLocationCountry, setAllegroLocationCountry] = useState<string>(
    offer.channelData?.allegro?.location?.country || 'PL'
  );
  const [allegroLocationCity, setAllegroLocationCity] = useState<string>(
    offer.channelData?.allegro?.location?.city || 'Warszawa'
  );
  const [allegroLocationPostCode, setAllegroLocationPostCode] = useState<string>(
    offer.channelData?.allegro?.location?.postCode || '00-001'
  );
  const [allegroInvoiceType, setAllegroInvoiceType] = useState<string>(
    offer.channelData?.allegro?.invoice || 'VAT'
  );
  const [allegroReturnPolicy, setAllegroReturnPolicy] = useState<string>(
    offer.channelData?.allegro?.returnPolicy || '14_DAYS'
  );
  const [allegroWarranty, setAllegroWarranty] = useState<string>(
    offer.channelData?.allegro?.warranty || '24_MONTHS'
  );
  const [allegroDescription, setAllegroDescription] = useState<string>(
    offer.channelData?.allegro?.description ||
    offer.description ||
    `<h2>${offer.name || 'Wysokiej jakości produkt'}</h2>\n<p>Fabrycznie nowy produkt marki <strong>${offer.brand || 'Generic'}</strong>. Oferowany egzemplarz jest objęty pełną gwarancją i natychmiastową wysyłką.</p>\n<h3>Specyfikacja techniczna:</h3>\n<ul>\n  <li>Gwarantowana jakość wykonania</li>\n  <li>Pełna zgodność ze standardami europejskimi</li>\n</ul>`
  );
  const [allegroDescriptionLayout, setAllegroDescriptionLayout] = useState<'standard' | 'fulltext' | 'imagetext'>('standard');
  const [allegroImages, setAllegroImages] = useState<string[]>(() => {
    if (Array.isArray(offer.channelData?.allegro?.images) && offer.channelData.allegro.images.length > 0) {
      return offer.channelData.allegro.images;
    }
    return galleryImages.length > 0 ? galleryImages : (offer.primaryImage ? [offer.primaryImage] : []);
  });
  const [allegroNewImageUrl, setAllegroNewImageUrl] = useState('');
  const [allegroParams, setAllegroParams] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {
      '11323': offer.brand || 'Generic',
      '225693': offer.sku || 'MOD-01',
      '213': 'Nowy',
      '225694': ean || ''
    };
    if (offer.channelData?.allegro?.parameters) {
      Object.assign(map, offer.channelData.allegro.parameters);
    }
    (offer.parameters || []).forEach(p => {
      if (p.values && p.values.length > 0) map[p.id] = p.values[0];
    });
    return map;
  });
  const [allegroCustomParams, setAllegroCustomParams] = useState<Array<{ key: string; value: string }>>(() => {
    return [
      { key: 'Gniazdo procesora (Soket)', value: 'Socket AM4' },
      { key: 'Chipset (Yonga Seti)', value: 'AMD B450' },
      { key: 'Format płyty', value: 'Micro ATX' },
      { key: 'Typ pamięci RAM', value: 'DDR4' },
      { key: 'Liczba slotów pamięci', value: '2' }
    ];
  });
  const [newCustomParamKey, setNewCustomParamKey] = useState('');
  const [newCustomParamVal, setNewCustomParamVal] = useState('');
  const [allegroGpsrProducer, setAllegroGpsrProducer] = useState(
    (offer.channelData?.allegro as any)?.responsibleProducer?.name || `${offer.brand || 'MACHINIST'} EU Sp. z o.o.`
  );
  const [allegroGpsrSafety, setAllegroGpsrSafety] = useState(
    (offer.channelData?.allegro as any)?.safetyInformation?.description || 'Produkt bezpieczny w użytkowaniu. Używać zgodnie z dołączoną instrukcją obsługi i przeznaczeniem.'
  );
  const [showAllegroMockup, setShowAllegroMockup] = useState(false);
  const [isGeneratingAllegroAi, setIsGeneratingAllegroAi] = useState(false);
  const [isTranslatingAllegroTitle, setIsTranslatingAllegroTitle] = useState(false);

  // --- 4. BASELINKER ÖZEL ALANLARI ---
  const [baselinkerWarehouseId, setBaselinkerWarehouseId] = useState<string>(
    offer.channelData?.baselinker?.warehouseId || BASELINKER_WAREHOUSES[0].id
  );
  const [baselinkerCategoryId, setBaselinkerCategoryId] = useState<string>(
    offer.channelData?.baselinker?.categoryId || BASELINKER_CATEGORIES[0].id
  );
  const [baselinkerPriceEur, setBaselinkerPriceEur] = useState<string>(
    offer.channelData?.baselinker?.price?.amount ||
    (parseFloat(allegroPricePln) / 4.3).toFixed(2)
  );
  const [baselinkerSyncStock, setBaselinkerSyncStock] = useState<boolean>(
    offer.channelData?.baselinker?.autoSyncStock ?? true
  );
  const [baselinkerSyncPrice, setBaselinkerSyncPrice] = useState<boolean>(
    offer.channelData?.baselinker?.autoSyncPrice ?? true
  );

  // AI & Translation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [turkishTranslation, setTurkishTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Auto calculate prices when Cost Eur changes
  const handleCostEurChange = (val: number) => {
    setCostPriceEur(val);
    const calculatedRon = (val * (emagCurrency === 'BGN' ? 1.96 : 4.97) * 1.35).toFixed(2);
    const calculatedPln = (val * 4.29 * 1.35).toFixed(2);
    const calculatedEur = (val * 1.35).toFixed(2);
    setEmagPriceRon(calculatedRon);
    setAllegroPricePln(calculatedPln);
    setBaselinkerPriceEur(calculatedEur);
  };

  // Auto fill missing mandatory characteristics
  const handleAutoFillMandatory = () => {
    if (!ean || ean.trim().length < 8) {
      const rawDigits = String(offer.id || sku || Date.now()).replace(/\D/g, '').padStart(9, '0').slice(-9);
      const prefix = '590' + rawDigits;
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(prefix[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const check = (10 - (sum % 10)) % 10;
      setEan(prefix + check);
    }

    const updatedChars = [...emagCharacteristics];
    for (const req of mandatoryRequirements) {
      const idx = updatedChars.findIndex(c => String(c.id).toLowerCase() === String(req.id).toLowerCase());
      const valToSet = req.defaultVal || req.options?.[0] || 'Generic';
      if (idx >= 0) {
        if (!updatedChars[idx].value || !updatedChars[idx].value.trim()) {
          updatedChars[idx] = { ...updatedChars[idx], value: valToSet };
        }
      } else {
        updatedChars.push({ id: req.id, value: valToSet, name: req.trLabel || req.label });
      }
    }
    setEmagCharacteristics(updatedChars);
    showNotice('success', 'Eksik zorunlu özellikler ve EAN barkod tamamlandı');
  };

  // Re-match category
  const handleReMatchCategory = () => {
    const match: CategoryMatchResult = matchProductToEmagCategory({
      title: name,
      name: name,
      sku: sku,
      url: websiteUrl,
      productType: offer.category?.name
    });

    setEmagCategoryId(match.categoryId);
    setEmagCategoryName(match.categoryName);
    setMatchBadge(match.matchDetail || match.source);
    showNotice('info', `Kategori Güncellendi: ${match.categoryName}`);
  };

  // Add gallery image
  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!galleryImages.includes(url)) {
      setGalleryImages(prev => [...prev, url]);
      if (!primaryImage) setPrimaryImage(url);
    }
    setNewImageUrl('');
  };

  // Add custom characteristic
  const handleAddCharacteristic = () => {
    if (!newCharName.trim() || !newCharValue.trim()) return;
    const newId = `custom_${Date.now()}`;
    setEmagCharacteristics(prev => [
      ...prev,
      { id: newId, value: newCharValue.trim(), name: newCharName.trim() }
    ]);
    setNewCharName('');
    setNewCharValue('');
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          brand: brand,
          category: emagCategoryName,
          sku: sku
        })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data?.description) {
          setDescription(data.description);
          showNotice('success', 'AI ile ürün açıklaması üretildi');
          return;
        }
      }

      // Fallback description template
      const template = `<h2>${name}</h2>
<p><strong>${brand}</strong> markalı bu ürün yüksek kalite standartlarına uygun olarak tasarlanmıştır.</p>
<h3>Öne Çıkan Özellikler:</h3>
<ul>
  <li>Ergonomik ve dayanıklı gövde tasarımı.</li>
  <li>Yüksek performanslı malzeme yapısı.</li>
  <li>eMAG ve uluslararası pazaryeri standartlarına tam uyum.</li>
</ul>`;
      setDescription(template);
      showNotice('success', 'Şablon bazlı ürün açıklaması eklendi');
    } catch {
      showNotice('error', 'Açıklama üretilirken hata oluştu');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Translate to TR
  const handleTranslateTr = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-to-tr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: name })
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data?.translated) {
          setTurkishTranslation(data.translated);
          return;
        }
      }
      setTurkishTranslation(`${name} (Türkçe Çeviri)`);
    } catch {
      setTurkishTranslation(name);
    } finally {
      setIsTranslating(false);
    }
  };

  const showNotice = (type: 'success' | 'error' | 'info', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // Save changes to Store
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedOfferData: Partial<AllegroOffer> = {
        name: name.trim(),
        sku: sku.trim(),
        ean: ean.trim(),
        brand: brand.trim(),
        primaryImage: primaryImage.trim(),
        images: galleryImages,
        description: description,
        stock: {
          available: stock,
          unit: 'UNIT' as const
        },
        sellingMode: {
          format: 'BUY_NOW' as const,
          price: {
            amount: allegroPricePln,
            currency: 'PLN'
          }
        },
        category: {
          id: String(emagCategoryId),
          name: emagCategoryName
        },
        channelData: {
          ...(offer.channelData || {}),
          emag: {
            title: (emagTitle || name).trim(),
            categoryId: String(emagCategoryId),
            categoryName: emagCategoryName,
            country: emagCountry,
            vatId: emagVatId,
            partNumberKey: emagPartNumberKey || sku,
            geniusEligible: emagGenius,
            status: emagSendStatus,
            price: {
              amount: emagPriceRon,
              currency: emagCurrency
            },
            characteristics: emagCharacteristics.map(c => ({ id: c.id, value: c.value }))
          },
          allegro: {
            title: (allegroTitle || name).trim().substring(0, 75),
            categoryId: String(allegroCategoryId),
            categoryName: ALLEGRO_POPULAR_CATEGORIES.find(c => c.id === allegroCategoryId)?.name || 'Allegro Kategori',
            smartEligible: allegroSmart,
            price: {
              amount: allegroPricePln,
              currency: 'PLN'
            },
            stock: allegroStock,
            handlingTime: allegroHandlingTime,
            shippingRateId: allegroShippingRateId,
            description: allegroDescription,
            descriptionLayout: allegroDescriptionLayout,
            images: allegroImages,
            parameters: allegroParams,
            customParameters: allegroCustomParams,
            location: {
              country: allegroLocationCountry,
              city: allegroLocationCity,
              postCode: allegroLocationPostCode
            },
            invoice: allegroInvoiceType,
            returnPolicy: allegroReturnPolicy,
            warranty: allegroWarranty,
            responsibleProducer: { name: allegroGpsrProducer },
            safetyInformation: { description: allegroGpsrSafety }
          },
          baselinker: {
            warehouseId: baselinkerWarehouseId,
            categoryId: baselinkerCategoryId,
            autoSyncStock: baselinkerSyncStock,
            autoSyncPrice: baselinkerSyncPrice,
            price: {
              amount: baselinkerPriceEur,
              currency: 'EUR'
            }
          }
        }
      };

      store.updateOffer(offer.id, updatedOfferData);
      showNotice('success', 'Ürün ve tüm pazaryeri ayarları başarıyla kaydedildi');
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      showNotice('error', 'Kaydetme sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish to eMAG
  const handlePublishToEmag = async () => {
    if (missingRequirements.length > 0) {
      showNotice('error', `${missingRequirements.length} zorunlu kısıtlama/özellik eksik. Lütfen özellikleri tamamlayın.`);
      setActiveTab('emag');
      return;
    }

    setIsPublishingEmag(true);
    try {
      const res = await store.publishOfferToEmag(offer.id);
      if (res.success) {
        showNotice('success', `Ürün eMAG yayınına iletildi`);
      } else {
        showNotice('error', `eMAG Hatası: ${res.message}`);
      }
    } catch (err: any) {
      showNotice('error', `Gönderim hatası: ${err?.message || 'Sunucu yanıt vermedi'}`);
    } finally {
      setIsPublishingEmag(false);
    }
  };

  // Publish to Allegro with complete payload
  const handlePublishToAllegro = async () => {
    setIsPublishingAllegro(true);
    try {
      const combinedParams: Array<{ id: string; name?: string; values: string[] }> = Object.entries(allegroParams).map(([id, val]) => ({
        id,
        values: Array.isArray(val) ? val : [String(val)]
      }));
      allegroCustomParams.forEach((cp, idx) => {
        if (cp.key && cp.value) {
          combinedParams.push({
            id: `custom_${idx}_${cp.key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: cp.key,
            values: [cp.value]
          });
        }
      });

      const res = await store.publishOfferToAllegro(offer.id, {
        title: (allegroTitle || name).trim().substring(0, 75),
        name: (allegroTitle || name).trim().substring(0, 75),
        categoryId: String(allegroCategoryId),
        price: allegroPricePln,
        stock: allegroStock,
        currency: 'PLN',
        ean: allegroParams['225694'] || ean,
        sku: allegroParams['225693'] || sku,
        primaryImage: allegroImages[0] || primaryImage,
        images: allegroImages.length > 0 ? allegroImages : galleryImages,
        description: allegroDescription,
        shippingRateId: allegroShippingRateId,
        handlingTime: allegroHandlingTime,
        parameters: combinedParams,
        responsibleProducer: { name: allegroGpsrProducer },
        safetyInformation: { description: allegroGpsrSafety }
      });

      if (res.success) {
        showNotice('success', `Ürün Allegro yayınına başarıyla gönderildi! (İlan No: ${res.offerId || 'Yayınlandı'})`);
      } else {
        showNotice('error', `Allegro Hatası: ${res.message}`);
      }
    } catch (err: any) {
      showNotice('error', `Allegro gönderim hatası: ${err?.message || 'Sunucu yanıt vermedi'}`);
    } finally {
      setIsPublishingAllegro(false);
    }
  };

  // Allegro AI Polish Description Generator
  const handleGenerateAllegroAiDescription = async () => {
    setIsGeneratingAllegroAi(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: allegroTitle || name,
          brand: allegroParams['11323'] || brand,
          category: ALLEGRO_POPULAR_CATEGORIES.find(c => c.id === allegroCategoryId)?.name || 'Elektronika',
          sku: sku,
          language: 'pl'
        })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data?.description) {
          setAllegroDescription(data.description);
          showNotice('success', 'Allegro için Lehçe ürün tanıtımı oluşturuldu');
          return;
        }
      }

      // High quality Polish template for Allegro
      const brandStr = allegroParams['11323'] || brand || 'MACHINIST';
      const polishTemplate = `<h2>${allegroTitle || name}</h2>
<p>Oryginalny, fabrycznie nowy produkt marki <strong>${brandStr}</strong>, zaprojektowany z myślą o najwyższej wydajności, stabilności pracy oraz bezproblemowym użytkowaniu.</p>

<h3>Kluczowe zalety i cechy:</h3>
<ul>
  <li><strong>Stan:</strong> Fabrycznie nowy, oryginalne opakowanie producenta</li>
  <li><strong>Kod producenta / Model:</strong> ${allegroParams['225693'] || sku}</li>
  <li><strong>Kod EAN:</strong> ${allegroParams['225694'] || ean || 'Brak'}</li>
  <li><strong>Wysoka jakość:</strong> Starannie dobrane komponenty gwarantujące długą żywotność</li>
  <li><strong>Bezpieczna wysyłka:</strong> Profesjonalnie zabezpieczona paczka i ekspresowa wysyłka</li>
</ul>

<h3>Zawartość zestawu:</h3>
<p>Kompletny zestaw gotowy do montażu i natychmiastowego użytkowania zgodnie z dołączoną instrukcją obsługi.</p>`;
      setAllegroDescription(polishTemplate);
      showNotice('success', 'Allegro için optimize edilmiş Lehçe açıklama şablonu yüklendi');
    } catch {
      showNotice('error', 'Lehçe açıklama oluşturulamadı');
    } finally {
      setIsGeneratingAllegroAi(false);
    }
  };

  // Allegro Polish Title Generator (max 75 chars)
  const handleOptimizeAllegroTitle = () => {
    const raw = (allegroTitle || name).trim();
    if (!raw) return;
    // Polish e-commerce standard title optimization
    let optimized = raw;
    if (raw.length > 75) {
      optimized = raw.substring(0, 75).trim();
    }
    setAllegroTitle(optimized);
    showNotice('info', 'Lehçe başlık 75 karaktere uyarlandı');
  };

  const handleAddCustomAllegroParam = () => {
    if (!newCustomParamKey.trim() || !newCustomParamVal.trim()) return;
    setAllegroCustomParams(prev => [
      ...prev,
      { key: newCustomParamKey.trim(), value: newCustomParamVal.trim() }
    ]);
    setNewCustomParamKey('');
    setNewCustomParamVal('');
  };

  const handleAddAllegroImage = () => {
    if (!allegroNewImageUrl.trim()) return;
    setAllegroImages(prev => [...prev, allegroNewImageUrl.trim()]);
    setAllegroNewImageUrl('');
  };

  const handleCopyCoreImagesToAllegro = () => {
    if (galleryImages.length === 0) return;
    setAllegroImages(galleryImages);
    showNotice('success', `${galleryImages.length} adet görsel Allegro galerisine aktarıldı`);
  };

  const handleSelectAllegroCategory = (cat: AllegroTaxonomyCategory) => {
    setAllegroCategoryId(cat.id);
    setShowAllegroCategoryDropdown(false);
    setAllegroCategorySearchQuery('');
    const autoFilled = autoFillAllegroParameters(cat, allegroTitle || name, allegroParams['11323'] || brand, sku, ean);
    setAllegroParams(prev => ({
      ...prev,
      ...autoFilled
    }));
    showNotice('success', `Allegro Kategorisi Seçildi: ${cat.nameTr} (${cat.namePl}) · ID: ${cat.id}`);
  };

  const handleAutoSuggestAllegroCategory = () => {
    const matched = matchAllegroCategoryFromTitle(allegroTitle || name);
    if (matched) {
      handleSelectAllegroCategory(matched);
      showNotice('success', `Başlıktan otomatik kategori belirlendi: ${matched.nameTr} (${matched.namePl}) · ID: ${matched.id}`);
    } else {
      showNotice('info', 'Başlıktan eşleşen kategori bulunamadı, mevcut kategori korundu.');
    }
  };

  const handleAutoFillCurrentCategoryParams = () => {
    if (!currentTaxonomyCategory) return;
    const filled = autoFillAllegroParameters(currentTaxonomyCategory, allegroTitle || name, allegroParams['11323'] || brand, sku, ean);
    setAllegroParams(prev => ({
      ...prev,
      ...filled
    }));
    showNotice('success', `"${currentTaxonomyCategory.nameTr}" için zorunlu alanlar başlıktan dolduruldu!`);
  };

  // Publish to BaseLinker
  const handlePublishToBaselinker = () => {
    setIsPublishingBaselinker(true);
    setTimeout(() => {
      setIsPublishingBaselinker(false);
      showNotice('success', `Ürün BaseLinker kataloğuna (${baselinkerCategoryId}) başarıyla senkronize edildi!`);
    }, 600);
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery || categorySearchQuery.length < 2) return [];
    const q = categorySearchQuery.toLowerCase();
    return (allowedCategoriesRaw as any[])
      .filter(c => (c.name || '').toLowerCase().includes(q) || String(c.id).includes(q))
      .slice(0, 8);
  }, [categorySearchQuery]);

  const allegroTitleLength = allegroTitle.length;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* STICKY TOP HEADER & ACTION BAR */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs md:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tüm Ürünler</span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-zinc-800" />
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold truncate max-w-md text-slate-900 dark:text-white">
                {name || 'İsimsiz Ürün'}
              </h1>
              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                <span>SKU: {sku || '—'}</span>
                <span>•</span>
                <span>EAN: {ean || '—'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Modal Aç Butonu */}
            <button
              onClick={() => setShowModalView(true)}
              className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="Aynı ürünü çoklu kanal düzenleme modalı olarak aç"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Modal Görünümünde Aç</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>

            <button
              onClick={handlePublishToAllegro}
              disabled={isPublishingAllegro}
              className="px-3.5 py-2 rounded-xl bg-[#ff5a00] hover:bg-[#e04f00] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              title="Allegro REST API'sine gönder"
            >
              <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
              <span>{isPublishingAllegro ? 'Gönderiliyor...' : "Allegro'ya Gönder"}</span>
            </button>

            <button
              onClick={handlePublishToEmag}
              disabled={isPublishingEmag}
              className="px-3.5 py-2 rounded-xl bg-[#005fb8] hover:bg-[#004d99] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              title="eMAG satıcı API'sine gönder"
            >
              <MarketplaceLogo platform="emag" size="xs" rounded="full" />
              <span>{isPublishingEmag ? 'Gönderiliyor...' : "eMAG'a Gönder"}</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
                  store.removeOffer(offer.id);
                  onBack();
                }
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
              title="Ürünü Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Çoklu Kanal Sayfa & Sekme Barı (Allegro 1. Öncelikli, Core, eMAG, BaseLinker, Excel) */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          {/* Tab 1: Allegro (Polonya / Çekya) */}
          <button
            onClick={() => setActiveTab('allegro')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'allegro'
                ? 'bg-[#ff5a00] text-white shadow-2xs'
                : 'bg-white hover:bg-orange-50/50 text-slate-700 border border-slate-200'
            }`}
          >
            <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
            <span>1. Allegro (Polonya & Orta Avrupa)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
              PLN • {allegroSmart ? 'Smart+' : 'Standart'}
            </span>
          </button>

          {/* Tab 2: Ortak Çekirdek */}
          <button
            onClick={() => setActiveTab('core')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'core'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-sky-500" />
            <span>2. Ortak / Temel Bilgiler</span>
            <span className="text-[10px] font-mono opacity-80 bg-black/10 px-1.5 py-0.2 rounded">
              Temel
            </span>
          </button>

          {/* Tab 3: eMAG */}
          <button
            onClick={() => setActiveTab('emag')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'emag'
                ? 'bg-[#005fb8] text-white shadow-2xs'
                : 'bg-white hover:bg-blue-50/50 text-slate-700 border border-slate-200'
            }`}
          >
            <MarketplaceLogo platform="emag" size="xs" rounded="full" />
            <span>3. eMAG ({emagCountry === 'BG' ? 'Bulgaristan' : emagCountry === 'RO' ? 'Romanya' : 'Macaristan'})</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
              {emagCurrency} • {emagSendStatus === 0 ? 'Taslak' : 'Canlı'}
            </span>
            {missingRequirements.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                {missingRequirements.length} Eksik
              </span>
            )}
          </button>

          {/* Tab 4: BaseLinker */}
          <button
            onClick={() => setActiveTab('baselinker')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'baselinker'
                ? 'bg-[#1b2559] text-white shadow-2xs'
                : 'bg-white hover:bg-indigo-50/50 text-slate-700 border border-slate-200'
            }`}
          >
            <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
            <span>4. BaseLinker Entegrasyonu</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
              EUR Depo
            </span>
          </button>

          {/* Tab 5: Excel */}
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'excel'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white hover:bg-emerald-50/50 text-slate-700 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>5. Excel & Tedarik Verileri</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
              1688 / Kaynak
            </span>
          </button>

          {/* Tab 6: Tümünü Göster */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto ${
              activeTab === 'all'
                ? 'bg-slate-200 text-slate-900 border border-slate-400 font-black'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tümünü Göster</span>
          </button>
        </div>

      </div>

      {/* NOTICE BANNER */}
      {notice && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between shadow-xs transition-all ${
          notice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : notice.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-sky-50 border-sky-200 text-sky-900'
        }`}>
          <div className="flex items-center gap-2">
            {notice.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            {notice.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {notice.type === 'info' && <Info className="w-4 h-4 text-sky-600" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 1: ORTAK / TEMEL ÜRÜN BİLGİLERİ (CORE)                 */}
      {/* ============================================================== */}
      {(activeTab === 'core' || activeTab === 'all') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Boxes className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Ortak / Temel Ürün Bilgileri</h2>
                <p className="text-xs text-slate-500">Tüm pazaryerlerinde ortak kullanılan çekirdek alanlar (Başlık, EAN, SKU, Görseller, Stok ve Açıklama)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Ana Ürün Başlığı (İngilizce / Tanımlayıcı)
                </label>
                <button
                  onClick={handleTranslateTr}
                  disabled={isTranslating}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{isTranslating ? 'Çevriliyor...' : 'Türkçeye Çevir'}</span>
                </button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Translation Result Box */}
            {turkishTranslation && (
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-emerald-800 mr-2">TR Çeviri:</span>
                  <span>{turkishTranslation}</span>
                </div>
                <button
                  onClick={() => {
                    setName(turkishTranslation);
                    showNotice('success', 'Çevirili isim ana ürün başlığı olarak ayarlandı');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Başlık Yap
                </button>
              </div>
            )}

            {/* SKU, EAN & Brand Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Stok Kodu (SKU)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Barkod (EAN-13 / GTIN)
                  </label>
                  <button
                    onClick={handleAutoFillMandatory}
                    className="text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    Otomatik Üret
                  </button>
                </div>
                <input
                  type="text"
                  value={ean}
                  onChange={(e) => setEan(e.target.value)}
                  placeholder="590..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Marka (Brand)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            {/* Fiyat & Stok Genel Bakış */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Maliyet Bedeli (€ EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPriceEur}
                  onChange={(e) => handleCostEurChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mevcut Stok (Adet)
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kritik Stok Sınırı
                </label>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Media Gallery */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Ürün Görselleri ({galleryImages.length})
              </label>
              
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Yeni görsel URL'si ekleyin (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                />
                <button
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-square">
                    <img src={imgUrl} alt={`Ürün #${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                        Kapak
                      </span>
                    )}
                    <button
                      onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Görseli Sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Editor */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Ürün Açıklaması (HTML / Formatlı)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingAi}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>{isGeneratingAi ? 'Üretiliyor...' : 'AI ile Açıklama Oluştur'}</span>
                  </button>
                  <button
                    onClick={() => setIsPreviewHtml(!isPreviewHtml)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isPreviewHtml ? 'Kodu Düzenle' : 'Önizleme'}</span>
                  </button>
                </div>
              </div>

              {isPreviewHtml ? (
                <div
                  className="w-full min-h-[160px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: eMAG PAZARYERİ SAYFASI                              */}
      {/* ============================================================== */}
      {(activeTab === 'emag' || activeTab === 'all') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#005fb8]">
                <MarketplaceLogo platform="emag" size="sm" rounded="md" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>3. eMAG Pazaryeri Entegrasyonu</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#005fb8] text-[10px] font-bold">
                    eMAG Marketplace v3
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Bulgaristan (BG), Romanya (RO) veya Macaristan (HU) için eMAG kategori, özellik ve şema ayarları</p>
              </div>
            </div>

            <button
              onClick={handlePublishToEmag}
              disabled={isPublishingEmag}
              className="px-4 py-2 rounded-xl bg-[#005fb8] hover:bg-[#004d99] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isPublishingEmag ? 'İletiliyor...' : "eMAG'a Yayına Gönder"}</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* Country, Status & Currency Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-blue-50/40 border border-blue-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hedef eMAG Ülkesi
                </label>
                <select
                  value={emagCountry}
                  onChange={(e) => {
                    const c = e.target.value as 'BG' | 'RO' | 'HU';
                    setEmagCountry(c);
                    if (c === 'BG') {
                      setEmagCurrency('BGN');
                      setEmagVatId(6);
                    } else if (c === 'RO') {
                      setEmagCurrency('RON');
                      setEmagVatId(1);
                    } else {
                      setEmagCurrency('HUF');
                      setEmagVatId(1);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <option value="BG">🇧🇬 Bulgaristan (eMAG.bg)</option>
                  <option value="RO">🇷🇴 Romanya (eMAG.ro)</option>
                  <option value="HU">🇭🇺 Macaristan (eMAG.hu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gönderim Durumu
                </label>
                <select
                  value={emagSendStatus}
                  onChange={(e) => setEmagSendStatus(parseInt(e.target.value, 10) as 0 | 1)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <option value={0}>🟡 Taslak / Pasif (Draft 0)</option>
                  <option value={1}>🟢 Canlı / Satışta (Active 1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  eMAG Satış Fiyatı ({emagCurrency})
                </label>
                <input
                  type="text"
                  value={emagPriceRon}
                  onChange={(e) => setEmagPriceRon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-[#005fb8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KDV Oranı / ID
                </label>
                <select
                  value={emagVatId}
                  onChange={(e) => setEmagVatId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-medium"
                >
                  <option value={6}>ID: 6 (%20 Standart BG KDV)</option>
                  <option value={1}>ID: 1 (%19 Standart RO KDV)</option>
                  <option value={0}>ID: 0 (%0 Muafiyet / Transit)</option>
                </select>
              </div>
            </div>

            {/* eMAG Title (255 Chars SEO) & PNK */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    eMAG Özel Başlığı (Bulgarca / Romence SEO)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {emagTitle.length} / 255 Karakter
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={255}
                  value={emagTitle}
                  onChange={(e) => setEmagTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Part Number Key (PNK)
                </label>
                <input
                  type="text"
                  value={emagPartNumberKey}
                  onChange={(e) => setEmagPartNumberKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400">Örn: SKU-2407104</span>
              </div>
            </div>

            {/* eMAG Category Selection */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Seçili eMAG Kategorisi:
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-[#005fb8] font-bold">
                    #{emagCategoryId}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {matchBadge}
                  </span>
                </div>

                <button
                  onClick={handleReMatchCategory}
                  className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Kategoriyi Yeniden Tara</span>
                </button>
              </div>

              <div className="text-xs font-medium text-slate-700">
                {emagCategoryName}
              </div>

              {/* Search Category Dropdown */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="eMAG kategorisi ara veya ID yazın..."
                  value={categorySearchQuery}
                  onFocus={() => setIsCategorySearchOpen(true)}
                  onChange={(e) => {
                    setCategorySearchQuery(e.target.value);
                    setIsCategorySearchOpen(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                />

                {isCategorySearchOpen && filteredCategories.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredCategories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setEmagCategoryId(c.id);
                          setEmagCategoryName(c.name);
                          setMatchBadge('Manuel Seçim');
                          setIsCategorySearchOpen(false);
                          setCategorySearchQuery('');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs flex justify-between items-center cursor-pointer"
                      >
                        <span className="truncate pr-2 font-medium">{c.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">#{c.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Characteristics Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    eMAG Özellikleri & Karakteristikleri ({emagCharacteristics.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">Kategoriye ait zorunlu ve opsiyonel teknik değerler</p>
                </div>

                <button
                  onClick={handleAutoFillMandatory}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Eksikleri Otomatik Tamamla</span>
                </button>
              </div>

              {missingRequirements.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>eMAG Tarafından İstenen Eksik Zorunlu Alanlar:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {missingRequirements.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-rose-300 text-rose-700 font-medium text-[10px]">
                        {r.trLabel || r.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {emagCharacteristics.map((char, idx) => (
                  <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="w-full sm:w-1/3 font-medium text-slate-700 truncate">
                      {char.name || `Özellik #${char.id}`}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={char.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmagCharacteristics(prev => prev.map((c, i) => i === idx ? { ...c, value: val } : c));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium"
                      />
                      <button
                        onClick={() => setEmagCharacteristics(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Özelliği Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Characteristic */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Yeni özellik adı (örn: Malzeme, Güç)"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Değeri (örn: Alüminyum, 220V)"
                  value={newCharValue}
                  onChange={(e) => setNewCharValue(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
                <button
                  onClick={handleAddCharacteristic}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: ALLEGRO PAZARYERİ SAYFASI                           */}
      {/* ============================================================== */}
      {(activeTab === 'allegro' || activeTab === 'all') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 text-[#ff5a00]">
                <MarketplaceLogo platform="allegro" size="sm" rounded="md" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>1. Allegro Pazaryeri Entegrasyonu (Polonya - 1. Öncelikli Pazaryeri)</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ff5a00] text-[10px] font-bold">
                    Allegro REST API
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Allegro lehçe başlık (maks 75 karakter), PLN fiyatı, Smart+ kargo ve Allegro parametreleri</p>
              </div>
            </div>

            <button
              onClick={handlePublishToAllegro}
              disabled={isPublishingAllegro}
              className="px-4 py-2 rounded-xl bg-[#ff5a00] hover:bg-[#e04f00] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isPublishingAllegro ? 'Yükleniyor...' : "Allegro'ya Yayına Gönder"}</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* Allegro Title & 75 Char Limit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Allegro Lehçe Başlık (Tytuł Oferty)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 font-bold">
                    Lehçe
                  </span>
                </label>
                <span className={`text-[11px] font-mono font-bold ${
                  allegroTitleLength > 75 ? 'text-rose-600' : allegroTitleLength > 65 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {allegroTitleLength} / 75 Karakter {allegroTitleLength > 75 && '(Aşıldı!)'}
                </span>
              </div>
              <input
                type="text"
                maxLength={85}
                value={allegroTitle}
                onChange={(e) => setAllegroTitle(e.target.value)}
                placeholder="Lehçe başlık..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                  allegroTitleLength > 75 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                }`}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Allegro API kuralları gereği teklif başlığı maksimum <strong>75 karakter</strong> olmalıdır.
              </p>
            </div>

            {/* ============================================================== */}
            {/* 1. ALLEGRO KATEGORİ SEÇİCİ & ÇOK DİLLİ ARAMA (TR/EN/PL)         */}
            {/* ============================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/40 border border-orange-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/60 pb-3">
                <div>
                  <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-[#ff5a00]" />
                    <span>Allegro Kategori Seçimi & Doğrulama</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Doğrulanmış Leaf Kategori
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Türkçe, İngilizce veya Lehçe aratarak ürününüzün Allegro'da yayına açılacağı doğru kategoriyi seçin. (Hatalı/Geçersiz ID engellenir)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoSuggestAllegroCategory}
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                  title="Ürün başlığındaki kelimelerden otomatik kategori önerisi al"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Başlıktan Otomatik Kategori Bul</span>
                </button>
              </div>

              {/* Aktif Seçili Kategori Kartı */}
              <div className="p-3.5 rounded-xl bg-white border border-orange-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <span>🇵🇱 {currentTaxonomyCategory.namePl}</span>
                      <span className="text-slate-400 font-normal">/</span>
                      <span className="text-orange-700">🇹🇷 {currentTaxonomyCategory.nameTr}</span>
                      <span className="text-slate-400 font-normal">/</span>
                      <span className="text-slate-600 font-medium text-[11px]">🇬🇧 {currentTaxonomyCategory.nameEn}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#ff5a00] font-mono text-[11px] font-bold">
                      ID: {currentTaxonomyCategory.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>{currentTaxonomyCategory.path}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAllegroCategoryDropdown(!showAllegroCategoryDropdown)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-800 text-slate-700 font-bold text-xs flex items-center gap-1.5 bg-slate-50 hover:bg-white cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showAllegroCategoryDropdown ? 'Aramayı Kapat' : 'Kategori Değiştir / Ara'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showAllegroCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Çok Dilli Kategori Arama ve Dropdown Paneli */}
              {showAllegroCategoryDropdown && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-300 space-y-3 shadow-md animate-in fade-in duration-150">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={allegroCategorySearchQuery}
                      onChange={(e) => setAllegroCategorySearchQuery(e.target.value)}
                      placeholder="🔍 Kategori Ara... (Türkçe: 'Anakart', 'İşlemci', 'Kulaklık' | English: 'Motherboard', 'CPU' | Polski: 'Płyty główne' | ID: '4228')"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                    />
                    {allegroCategorySearchQuery && (
                      <button
                        onClick={() => setAllegroCategorySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Hızlı Kategori Rozetleri */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hızlı Seçim:</span>
                    {ALLEGRO_TAXONOMY.slice(0, 6).map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectAllegroCategory(cat)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                          cat.id === allegroCategoryId
                            ? 'bg-orange-600 text-white border-orange-600 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-medium'
                        }`}
                      >
                        {cat.nameTr.split('(')[0].trim()} ({cat.id})
                      </button>
                    ))}
                  </div>

                  {/* Arama Sonuçları Listesi */}
                  <div className="max-h-64 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
                    {searchedTaxonomyCategories.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Eşleşen kategori bulunamadı. Lütfen başka bir anahtar kelime veya ID deneyin.
                      </div>
                    ) : (
                      searchedTaxonomyCategories.map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => handleSelectAllegroCategory(cat)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                            cat.id === allegroCategoryId
                              ? 'bg-orange-50 border border-orange-300'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                🇵🇱 {cat.namePl}
                              </span>
                              <span className="text-xs font-semibold text-orange-700">
                                (🇹🇷 {cat.nameTr})
                              </span>
                              <span className="text-[11px] text-slate-500">
                                / 🇬🇧 {cat.nameEn}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cat.path}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                              ID: {cat.id}
                            </span>
                            {cat.id === allegroCategoryId && (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* 2. KATEGORİ ZORUNLULUKLARI & PARAMETRELERİ (DİNAMİK FORM)       */}
            {/* ============================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black text-slate-900">
                    Allegro Kategori Zorunlulukları: {currentTaxonomyCategory.namePl}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                    {currentTaxonomyCategory.parameters.filter(p => p.required).length} Zorunlu Alan
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillCurrentCategoryParams}
                  className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bilgilerden Zorunlu Alanları Otomatik Doldur</span>
                </button>
              </div>

              {/* Dinamik Kategori Parametre Formu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentTaxonomyCategory.parameters.map((param) => {
                  const currentValue = allegroParams[param.id] !== undefined
                    ? allegroParams[param.id]
                    : (param.defaultValue || '');

                  return (
                    <div
                      key={param.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        param.required ? 'border-orange-200/90 bg-orange-50/20' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-800 truncate" title={`${param.trName} (${param.name})`}>
                          <span>{param.trName}</span>
                          <span className="text-slate-400 font-normal text-[10px] ml-1">({param.name})</span>
                        </label>
                        {param.required ? (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 shrink-0">
                            * ZORUNLU
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                            Opsiyonel
                          </span>
                        )}
                      </div>

                      {param.options && param.options.length > 0 ? (
                        <select
                          value={currentValue}
                          onChange={(e) => setAllegroParams(prev => ({ ...prev, [param.id]: e.target.value }))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                        >
                          <option value="">Seçiniz...</option>
                          {param.options.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => setAllegroParams(prev => ({ ...prev, [param.id]: e.target.value }))}
                          placeholder={param.trName}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Özel Parametre Ekleme */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Ek Nitelikler & Özel Parametreler ({allegroCustomParams.length})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allegroCustomParams.map((cp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                    >
                      <strong className="text-slate-900">{cp.key}:</strong> {cp.value}
                      <button
                        type="button"
                        onClick={() => setAllegroCustomParams(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Özellik Adı (örn: Bellek Frekansı, Renk)"
                    value={newCustomParamKey}
                    onChange={(e) => setNewCustomParamKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Değeri (örn: 3200 MHz, Siyah)"
                    value={newCustomParamVal}
                    onChange={(e) => setNewCustomParamVal(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllegroParam}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ekle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. FİYAT, PARA BİRİMİ, STOK & KARGO ŞABLONU                     */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Allegro Satış Fiyatı (PLN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={allegroPricePln}
                    onChange={(e) => setAllegroPricePln(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-[#ff5a00]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                    zł
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Allegro Satış Stoku (Adet)
                </label>
                <input
                  type="number"
                  value={allegroStock}
                  onChange={(e) => setAllegroStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kargoya Hazırlık Süresi
                </label>
                <select
                  value={allegroHandlingTime}
                  onChange={(e) => setAllegroHandlingTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="PT24H">24 Saat (Wysyłka w 24h - Smart)</option>
                  <option value="PT0S">Aynı Gün (Wysyłka dzisiaj)</option>
                  <option value="PT48H">48 Saat (Wysyłka w 2 dni)</option>
                  <option value="P3D">3 Gün (Wysyłka w 3 dni)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Allegro Smart! Kargo
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                    <input
                      type="radio"
                      name="allegroSmart"
                      checked={allegroSmart === true}
                      onChange={() => setAllegroSmart(true)}
                    />
                    <span className="font-bold text-orange-600">Smart+ Aktif</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                    <input
                      type="radio"
                      name="allegroSmart"
                      checked={allegroSmart === false}
                      onChange={() => setAllegroSmart(false)}
                    />
                    <span>Standart</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 4. ALLEGRO GÖRSEL GALERİSİ & BEYAZ FON UYARISI                  */}
            {/* ============================================================== */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span>Allegro İlan Fotoğrafları ({allegroImages.length} Görsel)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Allegro standartları: Kapak fotoğrafı <strong>%100 saf beyaz arka plan (RGB 255,255,255)</strong> ve filigransız olmalıdır.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCoreImagesToAllegro}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ff5a00] text-[11px] font-bold border border-orange-200 cursor-pointer"
                  >
                    Ortak Görsellerden Aktar
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Yeni Allegro görsel URL'si ekleyin (https://...)"
                  value={allegroNewImageUrl}
                  onChange={(e) => setAllegroNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddAllegroImage}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {allegroImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-square">
                    <img src={imgUrl} alt={`Allegro #${idx + 1}`} className="w-full h-full object-contain p-1" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-bold">
                        Kapak (Miniatura)
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setAllegroImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Görseli Sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* 5. ALLEGRO LEHÇE AÇIKLAMA DÜZENLEYİCİ                           */}
            {/* ============================================================== */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>Allegro Lehçe Açıklama & Bölümler (Opis Oferty)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Allegro REST API kurallarına uygun biçimlendirilmiş Lehçe ürün tanıtımı</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAllegroAiDescription}
                    disabled={isGeneratingAllegroAi}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ff5a00] text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-orange-200"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>{isGeneratingAllegroAi ? 'Lehçe Metin Üretiliyor...' : 'AI ile Lehçe Açıklama Oluştur'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={allegroDescription}
                onChange={(e) => setAllegroDescription(e.target.value)}
                placeholder="<h2>Tytuł</h2><p>Opis po polsku...</p>"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800"
              />
            </div>

            {/* ============================================================== */}
            {/* 6. CANLI ALLEGRO SAYFASI ÖNİZLEMESİ (MOCKUP NA ALLEGRO.PL)      */}
            {/* ============================================================== */}
            <div className="border border-orange-200 rounded-2xl overflow-hidden shadow-xs">
              <div
                onClick={() => setShowAllegroMockup(!showAllegroMockup)}
                className="p-3 bg-orange-50/70 flex items-center justify-between cursor-pointer hover:bg-orange-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#ff5a00]" />
                  <span className="text-xs font-bold text-slate-900">
                    allegro.pl Ürün Sayfası Önizlemesi (Müşteri Nasıl Görecek?)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white text-orange-800 font-mono font-bold border border-orange-200">
                    Canlı Mockup
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showAllegroMockup ? 'rotate-180' : ''}`} />
              </div>

              {showAllegroMockup && (
                <div className="p-5 bg-[#f5f5f7] space-y-4">
                  {/* Allegro Header Bar */}
                  <div className="bg-[#ff5a00] p-2.5 rounded-xl flex items-center justify-between text-white">
                    <div className="flex items-center gap-2 font-black text-sm tracking-tight">
                      <span>allegro</span>
                    </div>
                    <div className="text-[11px] font-medium opacity-90">
                      Oficjalny Sklep · Bezpieczne Zakupy
                    </div>
                  </div>

                  {/* Product Main Showcase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200">
                    {/* Left: Gallery */}
                    <div className="space-y-3">
                      <div className="aspect-square rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-4">
                        <img
                          src={allegroImages[0] || primaryImage}
                          alt="Allegro Main"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allegroImages.slice(0, 5).map((img, i) => (
                          <div key={i} className="w-14 h-14 rounded-lg border border-slate-200 p-1 shrink-0 bg-white">
                            <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Buy Box & Details */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {currentTaxonomyCategory.path}
                        </div>
                        <h1 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                          {allegroTitle || name}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-amber-500 mt-1.5 font-bold">
                          <span>★★★★★</span>
                          <span className="text-slate-600 font-medium">4.92 (128 ocen)</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                            99.4% poleca tego sprzedawcę
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100 space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#ff5a00] font-mono">
                            {allegroPricePln} zł
                          </span>
                          {allegroSmart && (
                            <span className="text-xs font-black text-[#ff5a00] bg-orange-100 px-2 py-0.5 rounded-full">
                              smart!
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          lub { (parseFloat(allegroPricePln) / 10).toFixed(2) } zł x 10 rat z Allegro Pay
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kup dzisiaj do 14:00 - dostawa jutro z Allegro Smart!</span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Paczkomaty InPost, Kurier DPD, Odbiór w Punkcie (Darmowy zwrot)</span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-xl bg-[#ff5a00] hover:bg-[#e04f00] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>DODAJ DO KOSZYKA</span>
                        </button>
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <span>KUP TERAZ</span>
                        </button>
                      </div>

                      {/* Parametreler Tablosu */}
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="text-xs font-bold text-slate-800">Parametry Oferty:</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {currentTaxonomyCategory.parameters.map((p) => (
                            <div key={p.id} className="flex justify-between border-b border-slate-50 py-1">
                              <span className="text-slate-500">{p.name}:</span>
                              <span className="font-semibold text-slate-800">{allegroParams[p.id] || p.defaultValue || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: BASELINKER ENTEGRASYONU SAYFASI                     */}
      {/* ============================================================== */}
      {(activeTab === 'baselinker' || activeTab === 'all') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-[#1b2559]">
                <MarketplaceLogo platform="baselinker" size="sm" rounded="md" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>4. BaseLinker Entegrasyonu & Depo Yönetimi</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-[#1b2559] text-[10px] font-bold">
                    Merkezi Katalog
                  </span>
                </h2>
                <p className="text-xs text-slate-500">BaseLinker envanter eşitlemesi, depo ve kategori haritalandırması</p>
              </div>
            </div>

            <button
              onClick={handlePublishToBaselinker}
              disabled={isPublishingBaselinker}
              className="px-4 py-2 rounded-xl bg-[#1b2559] hover:bg-[#121a3e] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isPublishingBaselinker ? 'Eşitleniyor...' : "BaseLinker'a Aktar"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                BaseLinker Depo Seçimi
              </label>
              <select
                value={baselinkerWarehouseId}
                onChange={(e) => setBaselinkerWarehouseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium"
              >
                {BASELINKER_WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                BaseLinker Katalog Kategorisi
              </label>
              <select
                value={baselinkerCategoryId}
                onChange={(e) => setBaselinkerCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium"
              >
                {BASELINKER_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                BaseLinker Referans Fiyatı (€ EUR)
              </label>
              <input
                type="text"
                value={baselinkerPriceEur}
                onChange={(e) => setBaselinkerPriceEur(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Otomatik Senkronizasyon Seçenekleri
              </label>
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baselinkerSyncStock}
                    onChange={(e) => setBaselinkerSyncStock(e.target.checked)}
                  />
                  <span>Stok miktarını pazaryerleri arasında çift yönlü eşitle</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baselinkerSyncPrice}
                    onChange={(e) => setBaselinkerSyncPrice(e.target.checked)}
                  />
                  <span>Fiyat değişikliklerini BaseLinker kuralına göre uyarla</span>
                </label>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION 5: EXCEL / ORİJİNAL TEDARİK BİLGİLERİ SAYFASI         */}
      {/* ============================================================== */}
      {(activeTab === 'excel' || activeTab === 'all') && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>5. Excel & Orijinal Tedarikçi Verileri</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    1688 / AliExpress Kaynak
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Excel içe aktarımından gelen orijinal satır, maliyet ve paketleme detayları</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">Kaynak Ürün / Tedarikçi Linki:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono truncate"
                />
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer shrink-0"
                    title="Tedarikçi Sayfasını Aç"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">İndirimsiz Fiyat (Excel):</span>
              <span className="font-mono text-sm font-bold text-slate-800">
                €{(offer.excelMetadata?.originalEurPrice || costPriceEur || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">İndirim Oranı & İndirimli EUR:</span>
              <span className="font-mono text-sm font-bold text-emerald-700">
                {offer.excelMetadata?.discountPercent || '50%'} (İndirimli: €{(offer.excelMetadata?.discountedEurPrice || 0).toFixed(2)})
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">Koli / Paket Numarası:</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {offer.excelMetadata?.parcelNumber || 'FS2025-01'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">Palet Numarası:</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {offer.excelMetadata?.palletNumber || 'PL-AE-01'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block mb-1">Sipariş / Dosya Satırı:</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                #{offer.excelMetadata?.orderNumber || (offer.excelMetadata as any)?.rowIndex || '1'}
              </span>
            </div>
          </div>

          {/* Raw Excel Row Inspector */}
          {offer.excelMetadata?.rawRow && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Excel Ham Satır Verisi (JSON Inspector):
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-52">
                {JSON.stringify(offer.excelMetadata.rawRow, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* POPUP MODAL (User clicks "Modal Görünümünde Aç") */}
      {showModalView && (
        <CreateOfferModal
          isOpen={showModalView}
          onClose={() => setShowModalView(false)}
          offerToEdit={offer}
          theme={theme}
        />
      )}

    </div>
  );
};
