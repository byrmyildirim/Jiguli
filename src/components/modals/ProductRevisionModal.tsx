import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  Check,
  AlertTriangle,
  Edit2,
  ExternalLink,
  RefreshCw,
  Tag,
  DollarSign,
  Sparkles,
  Layers,
  Globe,
  CheckCircle2,
  Image as ImageIcon,
  Barcode,
  Truck,
  FileSpreadsheet,
  Zap,
  Sliders,
  Send,
  Building,
  Info,
  Search,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Percent,
  Box,
  ArrowUpRight,
  Plus,
  Trash2,
  Copy,
  Languages,
  Lock,
  Unlock
} from 'lucide-react';
import { AllegroOffer, MarketplaceId } from '../../types/allegro';
import { store } from '../../services/marketplaceStore';
import { MarketplaceLogo } from '../../constants/marketplaces';
import {
  matchProductToEmagCategory,
  KNOWN_CATEGORY_CHARACTERISTICS,
  CategoryMatchResult,
  getCategoryRequirements,
  CategoryRequirementDefinition
} from '../../services/excelCategoryMatcher';
import { EmagExecutionLogsModal, EmagExecutionReport } from './EmagExecutionLogsModal';
import allowedCategoriesRaw from '../../../data/emag_bg_allowed_categories.json';

interface ProductRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: AllegroOffer;
  theme?: 'dark' | 'light';
}

type RevisionTab = 'core' | 'emag' | 'allegro' | 'baselinker';

export const ProductRevisionModal: React.FC<ProductRevisionModalProps> = ({
  isOpen,
  onClose,
  offer,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  // Active Tab
  const [activeTab, setActiveTab] = useState<RevisionTab>('emag');

  // --- CORE PRODUCT STATE ---
  const [name, setName] = useState(offer.name || '');
  const [sku, setSku] = useState(offer.sku || '');
  const [ean, setEan] = useState(offer.ean || '');
  const [primaryImage, setPrimaryImage] = useState(offer.primaryImage || '');
  const [stock, setStock] = useState<number>(offer.stock?.available || 10);
  const [websiteUrl, setWebsiteUrl] = useState(offer.excelMetadata?.websiteLinks || '');
  const [eurOriginalPrice, setEurOriginalPrice] = useState<number>(offer.excelMetadata?.originalEurPrice || 0);
  const [discountPercent, setDiscountPercent] = useState<string>(offer.excelMetadata?.discountPercent || '50%');
  const [discountedEurPrice, setDiscountedEurPrice] = useState<number>(offer.excelMetadata?.discountedEurPrice || 0);

  // --- eMAG STATE ---
  const [isEmagEnabled, setIsEmagEnabled] = useState(true);
  const [emagTitle, setEmagTitle] = useState(offer.channelData?.emag?.title || offer.name || '');
  const [emagPriceBgn, setEmagPriceBgn] = useState<string>(
    offer.channelData?.emag?.price?.amount ||
    (offer.excelMetadata?.discountedEurPrice ? (offer.excelMetadata.discountedEurPrice * 1.95).toFixed(2) : '61.74')
  );
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
    'House Cleaning/Cleaning and maintenance/Organisation and storage'
  );
  const [emagDescription, setEmagDescription] = useState<string>(
    offer.description?.sections?.[0]?.items?.[0]?.content ||
    `<h2>${offer.name}</h2><p>Orijinal garantili ürün. Sameday kargo güvencesiyle eMAG Bulgaristan için hazırlanmıştır.</p>`
  );
  const [emagCharacteristics, setEmagCharacteristics] = useState<{ id: string | number; value: string }[]>(() => {
    const existing = offer.channelData?.emag?.characteristics;
    const targetCatId = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || initialCategoryMatch.categoryId || 3426;
    const numCatId = parseInt(String(targetCatId), 10);
    const isLed = numCatId === 3523 || numCatId === 6001 || numCatId === 257548;

    if (Array.isArray(existing) && existing.length > 0) {
      const sanitized = existing.filter(c => {
        if (!isLed) {
          const val = String(c.value).toLowerCase();
          const cid = String(c.id).toLowerCase();
          if (c.id === 5464 || c.id === 6862) return false;
          if (c.id === 5704 && (val.includes('led') || val.includes('strip'))) return false;
          if (val.includes('led strip') || val.includes('banda led') || val === 'indoor') return false;
          if (cid.includes('led') || cid.includes('light')) return false;
        }
        return true;
      });
      if (sanitized.length > 0) return sanitized;
    }
    return KNOWN_CATEGORY_CHARACTERISTICS[numCatId] || [
      { id: 'emag-brand', value: offer.brand || 'Generic' }
    ];
  });
  const [matchBadge, setMatchBadge] = useState<string>('Otomatik');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);

  // --- ALLEGRO STATE ---
  const [isAllegroEnabled, setIsAllegroEnabled] = useState(
    offer.channelData?.allegro !== undefined ? Boolean(offer.channelData?.allegro) : true
  );
  const [allegroTitle, setAllegroTitle] = useState(offer.channelData?.allegro?.title || offer.name || '');
  const [allegroPricePln, setAllegroPricePln] = useState<string>(
    offer.channelData?.allegro?.price?.amount || offer.sellingMode?.price?.amount || '135.80'
  );
  const [allegroCategoryId, setAllegroCategoryId] = useState(offer.channelData?.allegro?.categoryId || '95595');
  const [allegroCategoryName, setAllegroCategoryName] = useState<string>(
    offer.channelData?.allegro?.categoryName || 'Elektronika > Akcesoria GSM > Uchwyty'
  );
  const [allegroSmart, setAllegroSmart] = useState(offer.smartEligible ?? true);
  const [allegroShippingRateId, setAllegroShippingRateId] = useState<string>(
    offer.channelData?.allegro?.shippingRateId || offer.delivery?.shippingRates?.id || '9fd66924-1c22-4c99-9c58-40c32a9e1028'
  );
  const [allegroShippingRates, setAllegroShippingRates] = useState<any[]>([]);
  const [isLoadingShippingRates, setIsLoadingShippingRates] = useState(false);
  const [allegroDescription, setAllegroDescription] = useState<string>(
    offer.description?.sections?.[0]?.items?.[0]?.content ||
    `<h2>${offer.name}</h2><p>Wysokiej jakości produkt z gwarancją producenta. Szybka i bezpieczna wysyłka.</p>`
  );

  // Allegro Category Search & Suggestions
  const [allegroCategorySearch, setAllegroCategorySearch] = useState('');
  const [allegroMatchingCategories, setAllegroMatchingCategories] = useState<{ id: string; name: string; fullPath: string; leaf?: boolean }[]>([]);
  const [isSearchingAllegroCategories, setIsSearchingAllegroCategories] = useState(false);
  const [isAllegroCategoryDropdownOpen, setIsAllegroCategoryDropdownOpen] = useState(false);
  const [allegroCategorySuggestions, setAllegroCategorySuggestions] = useState<{ id: string; name: string; fullPath: string }[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [manualCategoryInput, setManualCategoryInput] = useState(false);

  // Allegro Catalog Product Matching
  const [matchedCatalogProduct, setMatchedCatalogProduct] = useState<any | null>(null);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);

  // --- BASELINKER STATE ---
  const [isBaseLinkerEnabled, setIsBaseLinkerEnabled] = useState(offer.channelSync?.baselinker !== 'unlinked');
  const [baseLinkerStorageId, setBaseLinkerStorageId] = useState('bl_shop_default');

  // --- SUBMISSION & LOGS STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingLive, setIsPublishingLive] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEmagLogsModal, setShowEmagLogsModal] = useState(false);
  const [emagExecutionReport, setEmagExecutionReport] = useState<EmagExecutionReport | null>(null);

  // --- TRANSLATION STATE (Seller Internal Preview) ---
  const [turkishTranslation, setTurkishTranslation] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const handleTranslateToTr = async () => {
    const textToTranslate = name || emagTitle || allegroTitle || offer.name || '';
    if (!textToTranslate.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-to-tr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate.trim() })
      });
      const data = await res.json();
      if (data?.translated) {
        setTurkishTranslation(data.translated);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // --- CATEGORY REQUIREMENTS & VALIDATION ENGINE ---
  const categoryRequirements = useMemo(() => {
    return getCategoryRequirements(emagCategoryId);
  }, [emagCategoryId]);

  const mandatoryRequirements = useMemo(() => {
    return categoryRequirements.filter(r => r.isMandatory);
  }, [categoryRequirements]);

  // Missing requirements list (determines whether publishing is blocked)
  const missingRequirements = useMemo(() => {
    const missing: { key: string; label: string; trLabel: string; id?: string | number }[] = [];

    // 1. EAN Check: Required for active listings in eMAG
    const cleanEan = (ean || '').trim().replace(/\D/g, '');
    if (!cleanEan || (cleanEan.length !== 12 && cleanEan.length !== 13 && cleanEan.length !== 8 && cleanEan.length !== 14)) {
      missing.push({ key: 'ean', label: 'EAN / Barcode', trLabel: 'EAN-13 Barkod' });
    }

    // 2. Mandatory Characteristics Check
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

  const isEmagPublishReady = missingRequirements.length === 0;

  // Auto-fill all missing mandatory requirements with smart defaults
  const handleAutoFillMandatoryRequirements = () => {
    // 1. Auto-generate valid EAN-13 if missing
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

    // 2. Fill missing mandatory characteristics with schema defaults
    const updatedChars = [...emagCharacteristics];
    for (const req of mandatoryRequirements) {
      const idx = updatedChars.findIndex(c => String(c.id).toLowerCase() === String(req.id).toLowerCase());
      const valToSet = req.defaultVal || req.options?.[0] || 'Generic';
      if (idx >= 0) {
        if (!updatedChars[idx].value || !updatedChars[idx].value.trim()) {
          updatedChars[idx] = { ...updatedChars[idx], value: valToSet };
        }
      } else {
        updatedChars.push({ id: req.id, value: valToSet });
      }
    }
    setEmagCharacteristics(updatedChars);
  };

  // Allegro Live Publishing State
  const [isPublishingToAllegro, setIsPublishingToAllegro] = useState(false);
  const [allegroPublishNotice, setAllegroPublishNotice] = useState<{
    success: boolean;
    message: string;
    offerUrl?: string;
  } | null>(null);

  // Allegro: Load real shipping rates
  const handleFetchShippingRates = async () => {
    setIsLoadingShippingRates(true);
    try {
      const res = await fetch('/api/allegro/shipping-rates');
      const data = await res.json().catch(() => null);
      if (data?.success && Array.isArray(data.shippingRates)) {
        setAllegroShippingRates(data.shippingRates);
        if (!allegroShippingRateId && data.shippingRates[0]?.id) {
          setAllegroShippingRateId(data.shippingRates[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch shipping rates:', err);
    } finally {
      setIsLoadingShippingRates(false);
    }
  };

  // Allegro: Auto suggest categories based on title
  const handleAutoSuggestAllegroCategory = async () => {
    const term = allegroTitle || name || offer.name;
    if (!term.trim()) return;
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/allegro/matching-categories?name=${encodeURIComponent(term.trim())}`);
      const data = await res.json().catch(() => null);
      if (data?.success && Array.isArray(data.categories)) {
        setAllegroCategorySuggestions(data.categories);
        // If current category is default, auto-pick top recommendation
        if (data.categories.length > 0 && (!allegroCategoryId || allegroCategoryId === '12800' || allegroCategoryId === '95595')) {
          setAllegroCategoryId(data.categories[0].id);
          setAllegroCategoryName(data.categories[0].fullPath);
        }
      }
    } catch (err) {
      console.warn('Allegro category suggestions failed:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Allegro: Live search categories
  const handleSearchAllegroCategories = async (query: string) => {
    setAllegroCategorySearch(query);
    if (!query.trim() || query.trim().length < 2) {
      setAllegroMatchingCategories([]);
      return;
    }
    setIsSearchingAllegroCategories(true);
    try {
      const res = await fetch(`/api/allegro/matching-categories?name=${encodeURIComponent(query.trim())}`);
      const data = await res.json().catch(() => null);
      if (data?.success && Array.isArray(data.categories)) {
        setAllegroMatchingCategories(data.categories);
        setIsAllegroCategoryDropdownOpen(true);
      }
    } catch (err) {
      console.warn('Allegro category search error:', err);
    } finally {
      setIsSearchingAllegroCategories(false);
    }
  };

  // Allegro: Search Allegro catalog for existing items
  const handleSearchAllegroCatalog = async () => {
    const term = allegroTitle || name || offer.name;
    setIsSearchingCatalog(true);
    try {
      const searchParam = ean ? `ean=${encodeURIComponent(ean)}` : `phrase=${encodeURIComponent(term.slice(0, 45))}`;
      const res = await fetch(`/api/allegro/products?${searchParam}`);
      const data = await res.json().catch(() => null);
      if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
        setMatchedCatalogProduct(data.products[0]);
      } else {
        setMatchedCatalogProduct(null);
      }
    } catch (err) {
      console.warn('Allegro catalog search failed:', err);
    } finally {
      setIsSearchingCatalog(false);
    }
  };

  // Allegro: Auto-format / shorten title to comply with Allegro 75-char limit & 3-word rule
  const handleOptimizeAllegroTitle = () => {
    let t = (allegroTitle || name || offer.name).trim();
    if (t.length > 75) {
      t = t.slice(0, 75).trim();
    }
    const words = t.split(/\s+/).filter(Boolean);
    if (words.length < 3) {
      t = `${t} nowy produkt`.slice(0, 75);
    }
    setAllegroTitle(t);
  };

  // Automatically trigger shipping rates & suggestions when entering Allegro tab
  useEffect(() => {
    if (isOpen && activeTab === 'allegro') {
      if (allegroShippingRates.length === 0) {
        handleFetchShippingRates();
      }
      if (allegroCategorySuggestions.length === 0) {
        handleAutoSuggestAllegroCategory();
      }
    }
  }, [isOpen, activeTab]);

  const handlePublishLiveToAllegro = async () => {
    setIsPublishingToAllegro(true);
    setAllegroPublishNotice(null);
    try {
      const res = await store.publishOfferToAllegro(offer.id, {
        name: allegroTitle.trim() || name.trim(),
        categoryId: allegroCategoryId,
        categoryName: allegroCategoryName,
        price: allegroPricePln,
        stock: stock,
        ean: ean,
        shippingRateId: allegroShippingRateId,
        productId: matchedCatalogProduct?.id,
        description: allegroDescription
      });
      setAllegroPublishNotice({
        success: res.success,
        message: res.message,
        offerUrl: res.url
      });
    } catch (err: any) {
      setAllegroPublishNotice({
        success: false,
        message: err?.message || 'Allegro API bağlantı hatası'
      });
    } finally {
      setIsPublishingToAllegro(false);
    }
  };

  // Auto-match category on mount if needed
  useEffect(() => {
    if (!offer) return;
    const match = matchProductToEmagCategory({
      title: offer.name,
      name: offer.name,
      sku: offer.sku,
      url: offer.excelMetadata?.websiteLinks,
      productType: offer.category?.name,
      categoryCode: offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode,
      categoryName: offer.excelMetadata?.emagCategoryName || offer.category?.name
    });

    if (match.categoryId && match.categoryId > 0) {
      setEmagCategoryId(match.categoryId);
      setEmagCategoryName(match.categoryName);
      setMatchBadge(match.matchDetail || match.source);

      if (match.characteristics && match.characteristics.length > 0) {
        setEmagCharacteristics(match.characteristics);
      } else {
        setEmagCharacteristics([{ id: 'emag-brand', value: offer.brand || 'Generic' }]);
      }
    }
  }, [offer]);

  // Recalculate eMAG BGN price automatically when EUR price changes
  const handleEurPriceChange = (val: number) => {
    setDiscountedEurPrice(val);
    const bgn = (val * 1.95).toFixed(2);
    setEmagPriceBgn(bgn);
    const pln = (val * 4.29).toFixed(2);
    setAllegroPricePln(pln);
  };

  // Re-run intelligent matching explicitly
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
    if (match.characteristics && match.characteristics.length > 0) {
      setEmagCharacteristics(match.characteristics);
    } else {
      setEmagCharacteristics([{ id: 'emag-brand', value: offer.brand || 'Generic' }]);
    }
  };

  // Filter allowed categories for manual search dropdown
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery || categorySearchQuery.length < 2) return [];
    const q = categorySearchQuery.toLowerCase();
    return (allowedCategoriesRaw as any[])
      .filter(c => (c.name || '').toLowerCase().includes(q) || String(c.id).includes(q))
      .slice(0, 10);
  }, [categorySearchQuery]);

  // Save changes to panel / store
  const handleSaveDraft = async (publishToLiveEmag: boolean = false) => {
    setIsSaving(true);

    try {
      const targetChannels: MarketplaceId[] = [];
      if (isEmagEnabled) targetChannels.push('emag');
      if (isAllegroEnabled) targetChannels.push('allegro');
      if (isBaseLinkerEnabled) targetChannels.push('baselinker');

      const updatedOfferData = {
        name: name.trim(),
        sku: sku.trim(),
        ean: ean.trim(),
        primaryImage: primaryImage.trim(),
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
        targetChannels,
        channelData: {
          ...(offer.channelData || {}),
          emag: {
            title: emagTitle.trim() || name.trim(),
            categoryId: String(emagCategoryId),
            categoryName: emagCategoryName,
            price: {
              amount: emagPriceBgn,
              currency: 'BGN'
            },
            characteristics: emagCharacteristics
          },
          allegro: {
            title: allegroTitle.trim() || name.trim(),
            categoryId: allegroCategoryId,
            categoryName: allegroCategoryName,
            price: {
              amount: allegroPricePln,
              currency: 'PLN'
            },
            shippingRateId: allegroShippingRateId,
            description: allegroDescription,
            parameters: offer.channelData?.allegro?.parameters || []
          }
        },
        excelMetadata: {
          ...(offer.excelMetadata || {}),
          websiteLinks: websiteUrl.trim(),
          emagCategoryCode: String(emagCategoryId),
          emagCategoryName: emagCategoryName,
          matchedCategoryCode: String(emagCategoryId),
          matchedCategoryName: emagCategoryName,
          originalEurPrice: eurOriginalPrice,
          discountPercent: discountPercent,
          discountedEurPrice: discountedEurPrice
        },
        smartEligible: allegroSmart,
        isDraft: !publishToLiveEmag,
        publicationStatus: (publishToLiveEmag ? 'ACTIVE' : (offer.publication?.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT')) as 'ACTIVE' | 'DRAFT'
      };

      store.updateFullOffer(offer.id, updatedOfferData);

      if (publishToLiveEmag && isEmagEnabled) {
        if (!isEmagPublishReady) {
          setIsSaving(false);
          setActiveTab('emag');
          alert(
            `⚠️ eMAG Zorunlu Alan Uyarısı!\n\n` +
            `eMAG #${emagCategoryId} kategorisine ürün gönderebilmek için aşağıdaki ${missingRequirements.length} alanın doldurulması zorunludur:\n\n` +
            missingRequirements.map(m => `• ${m.trLabel} (${m.label})`).join('\n') +
            `\n\nLütfen eMAG sekmesindeki zorunlu alanları doldurun veya "Eksikleri Otomatik Doldur" butonuna tıklayın.`
          );
          return;
        }

        setIsPublishingLive(true);
        const res = await store.publishOfferToEmag(offer.id, {
          name: emagTitle.trim() || name.trim(),
          part_number: sku.trim(),
          category_id: emagCategoryId,
          sale_price: emagPriceBgn,
          currency: 'BGN',
          vat_id: 6, // 20% VAT for Bulgaria
          stock: stock,
          characteristics: emagCharacteristics,
          description: emagDescription,
          url: websiteUrl.trim(),
          images: [primaryImage.trim()]
        });

        setIsPublishingLive(false);

        if (res.report) {
          setEmagExecutionReport(res.report);
          setShowEmagLogsModal(true);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        if (!publishToLiveEmag) {
          onClose();
        }
      }, 700);
    } catch (err) {
      console.error('Save error:', err);
      setIsSaving(false);
      setIsPublishingLive(false);
    }
  };

  if (!isOpen) return null;

  // Theming helper class utilities
  const c = {
    modalBg: isDark ? 'bg-[#0f121a] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900',
    headerBg: isDark ? 'bg-[#151924] border-zinc-800' : 'bg-slate-50 border-slate-200',
    tabsBg: isDark ? 'bg-[#121622] border-zinc-800' : 'bg-slate-100/80 border-slate-200',
    cardBg: isDark ? 'bg-[#161b28] border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800',
    innerCard: isDark ? 'bg-[#10141f] border-zinc-800/80' : 'bg-white border-slate-200',
    inputBg: isDark ? 'bg-[#0d1017] border-zinc-700 text-white placeholder-zinc-500 focus:border-indigo-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600',
    label: isDark ? 'text-zinc-300 font-semibold' : 'text-slate-700 font-semibold',
    hint: isDark ? 'text-zinc-400' : 'text-slate-500',
    badge: isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-200/80 text-slate-700 border-slate-300',
    footerBg: isDark ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        className={`border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl transition-all my-auto flex flex-col max-h-[94vh] ${c.modalBg}`}
      >
        {/* ========================================================================= */}
        {/* HEADER: Clean, crisp, and informative */}
        {/* ========================================================================= */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${c.headerBg}`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isDark ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
              <Edit2 className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Ürün Revizyonu & Pazaryeri Yönetimi</h2>
                <span className={`font-mono text-xs px-2.5 py-0.5 rounded-lg font-bold border ${c.badge}`}>
                  {sku || `ID: ${offer.id.slice(0, 8)}`}
                </span>
                {offer.excelMetadata && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel Listesi</span>
                  </span>
                )}
                {offer.publication?.status === 'ACTIVE' ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Yayında
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Taslak
                  </span>
                )}
              </div>
              <p className={`text-xs truncate max-w-xl mt-0.5 ${c.hint}`}>
                {name || 'İsimsiz Ürün'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isDark ? 'border-zinc-700 bg-zinc-800/70 hover:bg-zinc-700 text-zinc-200' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
                title="Tedarikçi sayfasını aç"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tedarikçide Gör</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
              }`}
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MARKETPLACE SEGMENTED NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className={`px-6 pt-2.5 border-b flex items-center gap-1.5 overflow-x-auto shrink-0 ${c.tabsBg}`}>
          {/* TAB 1: CORE / TEMEL */}
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'core'
                ? isDark
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
                : isDark
                ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1. Temel Ürün & Envanter</span>
          </button>

          {/* TAB 2: eMAG MARKETPLACE */}
          <button
            type="button"
            onClick={() => setActiveTab('emag')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'emag'
                ? isDark
                  ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                  : 'border-rose-600 text-rose-600 bg-white shadow-2xs'
                : isDark
                ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="w-4 h-4 rounded bg-rose-600 flex items-center justify-center text-[10px] text-white font-black">
              e
            </div>
            <span>2. eMAG (Bulgaristan)</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              #{emagCategoryId}
            </span>
          </button>

          {/* TAB 3: ALLEGRO */}
          <button
            type="button"
            onClick={() => setActiveTab('allegro')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'allegro'
                ? isDark
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-amber-600 text-amber-600 bg-white shadow-2xs'
                : isDark
                ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="w-4 h-4 rounded bg-amber-600 flex items-center justify-center text-[10px] text-white font-black">
              a
            </div>
            <span>3. Allegro (Polonya)</span>
          </button>

          {/* TAB 4: BASELINKER */}
          <button
            type="button"
            onClick={() => setActiveTab('baselinker')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'baselinker'
                ? isDark
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : isDark
                ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-black">
              B
            </div>
            <span>4. BaseLinker & Stok</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* BODY CONTENT */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ======================================================================= */}
          {/* TAB 1: CORE / TEMEL ÜRÜN */}
          {/* ======================================================================= */}
          {activeTab === 'core' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Product Info & Visual */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Visual Card */}
                <div className="md:col-span-4 space-y-3">
                  <label className={`text-xs uppercase tracking-wider block ${c.label}`}>
                    Ürün Görseli
                  </label>
                  <div className={`relative aspect-square w-full rounded-2xl overflow-hidden border flex items-center justify-center ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/no_image.svg';
                        }}
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto opacity-50 mb-1" />
                        <span className="text-xs">Görsel Yok</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={`text-xs block mb-1 ${c.label}`}>Görsel Bağlantı URL'si</label>
                    <input
                      type="text"
                      value={primaryImage}
                      onChange={(e) => setPrimaryImage(e.target.value)}
                      placeholder="https://..."
                      className={`w-full text-xs font-mono px-3 py-2 rounded-xl border ${c.inputBg}`}
                    />
                  </div>
                </div>

                {/* Primary Identifiers */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <label className={`text-xs uppercase tracking-wider block ${c.label}`}>
                        Ürün Başlığı (Orijinal İsim)
                      </label>
                      <button
                        type="button"
                        onClick={handleTranslateToTr}
                        disabled={isTranslating}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isDark
                            ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-2xs'
                        }`}
                        title="Ürün ismini Türkçe'ye çevir (Yalnızca sizin görmeniz içindir)"
                      >
                        <Languages className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin text-indigo-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        <span>{isTranslating ? 'Türkçe\'ye Çevriliyor...' : '🌐 TR\'ye Çevir'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                    />

                    {/* Türkçe Önizleme Bilgi Kartı (Sadece Satıcı Görür) */}
                    {turkishTranslation && (
                      <div className={`mt-2.5 p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-200 ${
                        isDark ? 'bg-indigo-950/30 border-indigo-800/70 text-indigo-200' : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-2xs'
                      }`}>
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-500 shrink-0 mt-0.5">
                          <Languages className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                              <span>🇹🇷 Ürün Türkçe Karşılığı</span>
                              <span className="text-[10px] font-normal opacity-75">(Sadece Dahili Bilgilendirme)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setTurkishTranslation('')}
                              className="text-xs opacity-50 hover:opacity-100 p-0.5 cursor-pointer"
                              title="Kapat"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs font-semibold mt-1 select-text leading-relaxed">
                            {turkishTranslation}
                          </p>
                          <span className="text-[10px] opacity-70 block mt-1">
                            ℹ️ Bu çeviri yalnızca sizin ürünü anlamanız içindir; pazar yerindeki yabancı dildeki orijinal ilanı etkilemez.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={`text-xs block mb-1 ${c.label}`}>SKU / Stok Kodu</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className={`w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border ${c.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs block mb-1 ${c.label}`}>Barkod / EAN</label>
                      <input
                        type="text"
                        value={ean}
                        onChange={(e) => setEan(e.target.value)}
                        placeholder="Örn: 590..."
                        className={`w-full text-xs font-mono px-3 py-2.5 rounded-xl border ${c.inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs block mb-1 ${c.label}`}>Stok Adedi</label>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full text-xs font-bold px-3 py-2.5 rounded-xl border ${c.inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Supplier Link */}
                  <div className={`p-4 rounded-xl border space-y-2 ${c.innerCard}`}>
                    <div className="flex items-center justify-between">
                      <label className={`text-xs flex items-center gap-1.5 ${c.label}`}>
                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Tedarikçi İnternet Sayfası (1688, AliExpress, Amazon, Trendyol, DHgate)</span>
                      </label>
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>Sayfayı Aç</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                      className={`w-full text-xs font-mono px-3 py-2 rounded-xl border ${c.inputBg}`}
                    />
                  </div>

                  {/* Financial & Costing Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-xl border ${c.innerCard}`}>
                      <span className={`text-[11px] block mb-0.5 ${c.hint}`}>Orijinal EUR Fiyatı</span>
                      <div className="font-mono font-bold text-sm">
                        {eurOriginalPrice.toFixed(2)} €
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl border ${c.innerCard}`}>
                      <span className={`text-[11px] block mb-0.5 ${c.hint}`}>Uygulanan İndirim</span>
                      <div className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                        {discountPercent}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-indigo-950/30 border-indigo-800/60' : 'bg-indigo-50/70 border-indigo-200'
                    }`}>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        Alış Maliyeti (€)
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={discountedEurPrice}
                          onChange={(e) => handleEurPriceChange(parseFloat(e.target.value) || 0)}
                          className={`w-24 text-sm font-black font-mono px-2 py-0.5 rounded border ${c.inputBg}`}
                        />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Excel Logistics Metadata */}
              {offer.excelMetadata && (
                <div className={`p-4 rounded-xl border space-y-2.5 ${c.cardBg}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${c.label}`}>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel Sevkiyat & Lojistik Detayları (resale projesi-revize.xlsx)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className={`p-2.5 rounded-lg border ${c.innerCard}`}>
                      <span className={`text-[10px] block ${c.hint}`}>Koli / Paket No</span>
                      <span className="font-bold">{offer.excelMetadata.parcelNumber || '-'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${c.innerCard}`}>
                      <span className={`text-[10px] block ${c.hint}`}>Palet No</span>
                      <span className="font-bold">{offer.excelMetadata.palletNumber || '-'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${c.innerCard}`}>
                      <span className={`text-[10px] block ${c.hint}`}>Beyan Değeri</span>
                      <span className="font-bold">
                        {offer.excelMetadata.declaredValue ? `${offer.excelMetadata.declaredValue} ${offer.excelMetadata.currency || 'CNY'}` : '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${c.innerCard}`}>
                      <span className={`text-[10px] block ${c.hint}`}>Vergi / KDV</span>
                      <span className="font-bold">{offer.excelMetadata.tax || '%20'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 2: eMAG MARKETPLACE (BULGARİSTAN) */}
          {/* ======================================================================= */}
          {activeTab === 'emag' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Channel Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                isDark ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50/70 border-rose-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    e
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                        eMAG Bulgaristan Pazaryeri
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                        marketplace-api.emag.bg
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${c.hint}`}>
                      Onaylı satıcı hesabı, Sameday Kargo entegrasyonu ve %20 KDV desteği.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveDraft(true)}
                    disabled={isPublishingLive}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPublishingLive ? 'eMAG API Gönderiliyor...' : 'eMAG Canlı Yayına Al'}</span>
                  </button>
                </div>
              </div>

              {/* AUTOMATED & INTELLIGENT CATEGORY MATCHING CARD */}
              <div className={`p-5 rounded-xl border space-y-3.5 ${c.cardBg}`}>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>eMAG Bulgaristan Akıllı Kategori Eşleştirmesi</span>
                    </label>
                    <p className={`text-xs mt-0.5 ${c.hint}`}>
                      Masaüstündeki Excel listesi ve eMAG 1.735 izinli kategori kataloğundan otomatik belirlendi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReMatchCategory}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                    }`}
                    title="Excel kuralları ve URL'ye göre yeniden tara"
                  >
                    <RefreshCw className="w-3 h-3 text-rose-500" />
                    <span>Kategoriyi Yeniden Bul</span>
                  </button>
                </div>

                {/* Active Category Display */}
                <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${c.innerCard}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                      #{emagCategoryId}
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight flex items-center gap-2">
                        <span>{emagCategoryName}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.badge}`}>
                          {matchBadge}
                        </span>
                      </div>
                      <span className={`text-xs block mt-0.5 ${c.hint}`}>
                        Bu kategori eMAG Bulgaristan mağazanız için açık ve doğrulanmıştır.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCategorySearchOpen(!isCategorySearchOpen)}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    {isCategorySearchOpen ? 'Aramayı Gizle' : 'Kategoriyi Değiştir...'}
                  </button>
                </div>

                {/* Manual Category Search Dropdown */}
                {isCategorySearchOpen && (
                  <div className={`p-3.5 rounded-xl border space-y-2.5 animate-in fade-in ${c.innerCard}`}>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        placeholder="1.735 eMAG Bulgaristan kategorisinde ara (örn: LED, Pet, Dress, Watch...)"
                        className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border ${c.inputBg}`}
                        autoFocus
                      />
                    </div>

                    {filteredCategories.length > 0 && (
                      <div className={`max-h-48 overflow-y-auto space-y-1 divide-y rounded-lg border p-1 ${
                        isDark ? 'border-zinc-800 divide-zinc-800' : 'border-slate-200 divide-slate-100 bg-slate-50/50'
                      }`}>
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setEmagCategoryId(Number(cat.id));
                              setEmagCategoryName(cat.name);
                              setMatchBadge('Manuel Seçim');
                              if (KNOWN_CATEGORY_CHARACTERISTICS[Number(cat.id)]) {
                                setEmagCharacteristics(KNOWN_CATEGORY_CHARACTERISTICS[Number(cat.id)]);
                              } else {
                                setEmagCharacteristics([{ id: 'emag-brand', value: offer.brand || 'Generic' }]);
                              }
                              setIsCategorySearchOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isDark ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-white text-slate-800'
                            }`}
                          >
                            <span className="font-medium">{cat.name}</span>
                            <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                              #{cat.id}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SMART CATEGORY MANDATORY REQUIREMENTS & VALIDATION CARD */}
              <div className={`p-5 rounded-xl border space-y-3.5 ${c.cardBg}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Kategori Zorunluluk Denetimi (#{emagCategoryId})</span>
                      </span>
                      {isEmagPublishReady ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tamamlandı ({mandatoryRequirements.length + 1}/{mandatoryRequirements.length + 1})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{missingRequirements.length} Zorunlu Alan Eksik</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${c.hint}`}>
                      eMAG Marketplace politikası gereği bu alanlar doldurulmadan ürün canlıya gönderilemez.
                    </p>
                  </div>

                  {!isEmagPublishReady && (
                    <button
                      type="button"
                      onClick={handleAutoFillMandatoryRequirements}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Eksik zorunlu alanları şablon değerleriyle otomatik tamamla"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Eksikleri Otomatik Doldur</span>
                    </button>
                  )}
                </div>

                {/* Validation Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {/* EAN requirement check */}
                  <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    (ean && ean.trim().length >= 8)
                      ? isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : isDark ? 'bg-rose-950/20 border-rose-800/60 text-rose-300' : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <Barcode className="w-3.5 h-3.5 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold">EAN-13 Barkod</span>
                        <span className="text-[10px] opacity-75 block font-mono truncate">{ean || 'Tanımsız (Eksik)'}</span>
                      </div>
                    </div>
                    {(ean && ean.trim().length >= 8) ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shrink-0">
                        Zorunlu
                      </span>
                    )}
                  </div>

                  {/* Mandatory characteristics checks */}
                  {mandatoryRequirements.map((req) => {
                    const charObj = emagCharacteristics.find(c => String(c.id).toLowerCase() === String(req.id).toLowerCase());
                    const isFilled = Boolean(charObj?.value && charObj.value.trim());

                    return (
                      <div
                        key={String(req.id)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          isFilled
                            ? isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : isDark ? 'bg-rose-950/20 border-rose-800/60 text-rose-300' : 'bg-rose-50/80 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Tag className="w-3.5 h-3.5 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold">{req.trLabel}</span>
                            <span className="text-[10px] opacity-75 block truncate">
                              {charObj?.value || 'Boş (Eksik)'}
                            </span>
                          </div>
                        </div>
                        {isFilled ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shrink-0">
                            Zorunlu
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isEmagPublishReady && (
                  <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                    isDark ? 'bg-rose-950/30 border-rose-800/70 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>
                      <strong>Canlı Gönderim Engellendi:</strong> Aşağıdaki alanlar eksik: <strong>{missingRequirements.map(m => m.trLabel).join(', ')}</strong>. Bu alanlar doldurulmadan ürün eMAG'a gönderilemez.
                    </span>
                  </div>
                )}
              </div>

              {/* Title, Pricing & VAT */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <label className={`text-xs block ${c.label}`}>
                      eMAG İlan Başlığı (Bulgarca / İngilizce)
                    </label>
                    <button
                      type="button"
                      onClick={handleTranslateToTr}
                      disabled={isTranslating}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-2xs'
                      }`}
                      title="Başlığı Türkçe olarak göster (Satıcı dahili önizleme)"
                    >
                      <Languages className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin text-indigo-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      <span>{isTranslating ? 'Çevriliyor...' : '🌐 Başlığı TR\'ye Çevir'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={emagTitle}
                    onChange={(e) => setEmagTitle(e.target.value)}
                    placeholder="eMAG'da yayınlanacak başlık..."
                    className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                  />
                  {turkishTranslation && (
                    <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      isDark ? 'bg-indigo-950/30 border-indigo-800/60 text-indigo-200' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                    }`}>
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">🇹🇷 Türkçe Anlamı:</span>
                        <span className="truncate">{turkishTranslation}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTurkishTranslation('')}
                        className="text-xs opacity-50 hover:opacity-100 p-0.5 cursor-pointer shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`text-xs block mb-1.5 ${c.label}`}>
                      eMAG Satış Fiyatı (BGN)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={emagPriceBgn}
                        onChange={(e) => setEmagPriceBgn(e.target.value)}
                        className={`w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border text-rose-600 dark:text-rose-400 ${c.inputBg}`}
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                        BGN
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs block mb-1.5 ${c.label}`}>
                      KDV Oranı (Bulgaristan)
                    </label>
                    <div className={`px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between ${c.innerCard}`}>
                      <span>%20 Standart KDV</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.badge}`}>
                        VAT ID: 6
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs block mb-1.5 ${c.label}`}>
                      Kargoya Verme Süresi
                    </label>
                    <div className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium ${c.innerCard}`}>
                      1 İş Günü (Sameday)
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic eMAG Characteristics */}
              <div className={`p-5 rounded-xl border space-y-3 ${c.cardBg}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${c.label}`}>
                      <Sliders className="w-3.5 h-3.5 text-rose-500" />
                      <span>eMAG Kategori Karakteristikleri & Nitelikler</span>
                    </h4>
                    <p className={`text-[11px] ${c.hint}`}>
                      Kırmızı etiketli (<span className="text-rose-500 font-bold">* Zorunlu</span>) nitelikler doldurulmadan ürün eMAG tarafından kabul edilmez.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEmagCharacteristics([
                        ...emagCharacteristics,
                        { id: `char_${Date.now()}`, value: '' }
                      ]);
                    }}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Özellik Ekle</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emagCharacteristics.map((charItem, idx) => {
                    const reqDef = categoryRequirements.find(
                      r => String(r.id).toLowerCase() === String(charItem.id).toLowerCase()
                    );
                    const isMandatory = reqDef?.isMandatory;
                    const isEmpty = !charItem.value || !charItem.value.trim();

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                          isMandatory && isEmpty
                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20'
                            : c.innerCard
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                              {reqDef ? reqDef.trLabel : String(charItem.id)}
                            </span>
                            {reqDef && (
                              <span className="text-[10px] font-mono text-slate-400">
                                ({reqDef.label})
                              </span>
                            )}
                            {isMandatory && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                                * Zorunlu
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEmagCharacteristics(emagCharacteristics.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                            title="Özelliği Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {reqDef?.options && reqDef.options.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={charItem.value}
                              onChange={(e) => {
                                const updated = [...emagCharacteristics];
                                updated[idx] = { ...charItem, value: e.target.value };
                                setEmagCharacteristics(updated);
                              }}
                              className={`w-full text-xs px-2.5 py-2 rounded-lg border ${c.inputBg}`}
                            >
                              <option value="">-- Değer Seçin --</option>
                              {reqDef.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={charItem.value}
                            placeholder={reqDef?.placeholder || 'Değer girin...'}
                            onChange={(e) => {
                              const updated = [...emagCharacteristics];
                              updated[idx] = { ...charItem, value: e.target.value };
                              setEmagCharacteristics(updated);
                            }}
                            className={`w-full text-xs px-2.5 py-2 rounded-lg border ${c.inputBg}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* eMAG Description */}
              <div className="space-y-1.5">
                <label className={`text-xs block ${c.label}`}>
                  eMAG Ürün Açıklaması (HTML Formatlı)
                </label>
                <textarea
                  rows={4}
                  value={emagDescription}
                  onChange={(e) => setEmagDescription(e.target.value)}
                  className={`w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                />
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 3: ALLEGRO MARKETPLACE (POLONYA) */}
          {/* ======================================================================= */}
          {activeTab === 'allegro' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Pazaryeri Başlık & Aktiflik Kartı */}
              <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                isDark ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5A00] flex items-center justify-center text-white font-black text-lg shadow-sm">
                    a
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                        Allegro Polonya Pazaryeri
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FF5A00] text-white">
                        allegro.pl
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        charsioutlet Bağlı
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${c.hint}`}>
                      Polonya (PLN) için REST API Product-Offers üzerinden doğrudan canlı teklif oluşturma ve kategori yönetimi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllegroEnabled}
                      onChange={(e) => setIsAllegroEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5A00]"></div>
                  </label>
                  <span className={`text-xs font-bold ${c.label}`}>
                    {isAllegroEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              {/* BÖLÜM 1: 🎯 AKILLI KATEGORİ SEÇİCİ & CANLI ARAMA */}
              <div className={`p-4 rounded-xl border space-y-4 ${c.innerCard}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#FF5A00]" />
                    <h4 className={`text-xs font-bold ${c.label}`}>
                      Allegro Kategori Seçimi & Eşleştirme Motoru
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoSuggestAllegroCategory()}
                      disabled={isLoadingSuggestions}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Ürün başlığına göre Allegro API'sinden en uygun kategorileri otomatik bul"
                    >
                      <Sparkles className={`w-3 h-3 text-[#FF5A00] ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
                      <span>{isLoadingSuggestions ? 'Öneriler Alınıyor...' : '✨ Otomatik Kategori Öner'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualCategoryInput(!manualCategoryInput)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{manualCategoryInput ? 'Önerileri Göster' : 'Manuel ID Gir'}</span>
                    </button>
                  </div>
                </div>

                {/* Mevcut Seçili Kategori Kartı */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white border-amber-200 shadow-2xs'
                }`}>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Seçili Allegro Kategorisi:
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                        #{allegroCategoryId || 'Seçilmedi'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate" title={allegroCategoryName}>
                      {allegroCategoryName || 'Kategori belirlenmedi. Lütfen aşağıdan arama yapın veya önerilerden seçin.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Hazır</span>
                  </div>
                </div>

                {/* Manuel ID Girişi (İsteğe Bağlı) */}
                {manualCategoryInput && (
                  <div className="p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-800 space-y-1.5 bg-amber-50/30 dark:bg-amber-950/10">
                    <label className={`text-xs block font-semibold ${c.label}`}>
                      Doğrudan Allegro Kategori ID:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={allegroCategoryId}
                        onChange={(e) => setAllegroCategoryId(e.target.value.trim())}
                        placeholder="Örn: 95595 veya 87913"
                        className={`flex-1 text-xs font-mono font-bold px-3 py-2 rounded-lg border ${c.inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setManualCategoryInput(false);
                          setAllegroCategoryName(`Özel Kategori #${allegroCategoryId}`);
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white cursor-pointer"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                )}

                {/* Canlı Kategori Arama Çubuğu */}
                <div className="relative">
                  <label className={`text-xs block mb-1 font-semibold ${c.label}`}>
                    Canlı Kategori Arama (Lehçe, İngilizce veya Türkçe):
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={allegroCategorySearch}
                      onChange={(e) => handleSearchAllegroCategories(e.target.value)}
                      onFocus={() => {
                        if (allegroMatchingCategories.length > 0) setIsAllegroCategoryDropdownOpen(true);
                      }}
                      placeholder="Kategori arayın... (örn: T-shirt, uchwyt samochodowy, saat, telefon kılıfı, buty)"
                      className={`w-full text-xs font-medium pl-9 pr-9 py-2.5 rounded-xl border ${c.inputBg}`}
                    />
                    {isSearchingAllegroCategories ? (
                      <span className="w-3.5 h-3.5 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin absolute right-3 top-3" />
                    ) : allegroCategorySearch ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAllegroCategorySearch('');
                          setAllegroMatchingCategories([]);
                          setIsAllegroCategoryDropdownOpen(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 absolute right-3 top-2.5 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {/* Arama Sonuçları Açılır Paneli */}
                  {isAllegroCategoryDropdownOpen && allegroMatchingCategories.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl divide-y divide-slate-100 dark:divide-zinc-800">
                      <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-zinc-800/50 flex justify-between items-center">
                        <span>Allegro API'den Bulunan Kategoriler ({allegroMatchingCategories.length})</span>
                        <button
                          type="button"
                          onClick={() => setIsAllegroCategoryDropdownOpen(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          Kapat
                        </button>
                      </div>
                      {allegroMatchingCategories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setAllegroCategoryId(cat.id);
                            setAllegroCategoryName(cat.fullPath);
                            setIsAllegroCategoryDropdownOpen(false);
                          }}
                          className="p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                                {cat.name}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                                #{cat.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              {cat.fullPath}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#FF5A00] text-white shrink-0 hover:bg-[#e04f00]"
                          >
                            Seç
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Akıllı Kategori Öneri Hapları */}
                {allegroCategorySuggestions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      💡 Önerilen Allegro Kategorileri (1 Tıkla Seçin):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allegroCategorySuggestions.slice(0, 5).map((sug) => {
                        const isSelected = allegroCategoryId === sug.id;
                        return (
                          <button
                            key={sug.id}
                            type="button"
                            onClick={() => {
                              setAllegroCategoryId(sug.id);
                              setAllegroCategoryName(sug.fullPath);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                                : 'bg-slate-100 hover:bg-amber-50 dark:bg-zinc-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                            }`}
                            title={sug.fullPath}
                          >
                            <span>{sug.name}</span>
                            <span className="opacity-75 font-mono text-[10px]">#{sug.id}</span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* BÖLÜM 2: ÜRÜN BAŞLIĞI & LEHÇE OPTİMİZASYONU */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <label className={`text-xs font-bold ${c.label}`}>
                        Allegro İlan Başlığı (Lehçe)
                      </label>
                      <button
                        type="button"
                        onClick={handleOptimizeAllegroTitle}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Başlığı Allegro kurallarına (≤75 karakter ve en az 3 kelime) göre otomatik düzenler"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-[#FF5A00]" />
                        <span>✨ 75 Karakterle Optimize Et</span>
                      </button>
                    </div>
                    <span className={`text-xs font-mono font-bold ${allegroTitle.length > 75 ? 'text-rose-500 font-black' : c.hint}`}>
                      {allegroTitle.length} / 75 karakter {allegroTitle.length > 75 ? '(Maksimum aşıldı!)' : ''}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={75}
                    value={allegroTitle}
                    onChange={(e) => setAllegroTitle(e.target.value)}
                    placeholder="Lehçe ürün başlığı..."
                    className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border ${
                      allegroTitle.length > 75 ? 'border-rose-400 focus:ring-rose-400' : c.inputBg
                    }`}
                  />
                  <p className={`text-[11px] mt-1 ${c.hint}`}>
                    Allegro'da başlıklar en az 3 kelimeden oluşmalı ve en fazla 75 karakter olmalıdır.
                  </p>
                </div>

                {/* BÖLÜM 3: FİYAT, STOK VE BARKOD */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`text-xs block mb-1.5 font-bold ${c.label}`}>
                      Allegro Satış Fiyatı (PLN)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={allegroPricePln}
                        onChange={(e) => setAllegroPricePln(e.target.value)}
                        className={`w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border text-amber-600 dark:text-amber-400 ${c.inputBg}`}
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                        PLN
                      </span>
                    </div>
                    <span className={`text-[10px] mt-1 block ${c.hint}`}>
                      ≈ {(Number(allegroPricePln) / 4.29 || 0).toFixed(2)} € · {(Number(allegroPricePln) * 8.6 || 0).toFixed(2)} ₺
                    </span>
                  </div>

                  <div>
                    <label className={`text-xs block mb-1.5 font-bold ${c.label}`}>
                      Stok Miktarı (Adet)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={stock}
                      onChange={(e) => setStock(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className={`w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-bold ${c.label}`}>EAN Barkod (GTIN)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const rawDigits = String(offer.id || sku || Date.now()).replace(/\D/g, '').padStart(9, '0').slice(-9);
                          const prefix = '590' + rawDigits;
                          let sum = 0;
                          for (let i = 0; i < 12; i++) {
                            sum += parseInt(prefix[i], 10) * (i % 2 === 0 ? 1 : 3);
                          }
                          const check = (10 - (sum % 10)) % 10;
                          setEan(prefix + check);
                        }}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-300"
                        title="Geçerli Polonya EAN-13 üretir"
                      >
                        🎲 EAN Üret
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ean}
                      onChange={(e) => setEan(e.target.value.trim())}
                      placeholder="590..."
                      className={`w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                    />
                  </div>
                </div>

                {/* BÖLÜM 4: KARGO ŞABLONU VE SMART! */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-bold ${c.label}`}>
                        Kargo Şablonu (Cennik dostawy)
                      </label>
                      <button
                        type="button"
                        onClick={handleFetchShippingRates}
                        disabled={isLoadingShippingRates}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                        title="Allegro hesabından kargo şablonlarını yeniden çeker"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isLoadingShippingRates ? 'animate-spin' : ''}`} />
                        <span>Yenile</span>
                      </button>
                    </div>

                    <select
                      value={allegroShippingRateId}
                      onChange={(e) => setAllegroShippingRateId(e.target.value)}
                      className={`w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border cursor-pointer ${c.inputBg}`}
                    >
                      {allegroShippingRates.length > 0 ? (
                        allegroShippingRates.map((rate) => (
                          <option key={rate.id} value={rate.id}>
                            {rate.name} ({rate.id.slice(0, 8)}...)
                          </option>
                        ))
                      ) : (
                        <option value="9fd66924-1c22-4c99-9c58-40c32a9e1028">
                          Alegro delivery (Varsayılan Kargo Şablonu)
                        </option>
                      )}
                    </select>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${c.innerCard}`}>
                    <div>
                      <span className={`text-xs font-bold block ${c.label}`}>Allegro Smart! Uyumluluğu</span>
                      <span className={`text-[11px] ${c.hint}`}>Ücretsiz kargo rozeti ve alıcı avantajı</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allegroSmart}
                      onChange={(e) => setAllegroSmart(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* BÖLÜM 5: ALLEGRO KATALOG EŞLEŞTİRME KARTI */}
                <div className={`p-3.5 rounded-xl border space-y-2 ${c.innerCard}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-amber-600" />
                      <span className={`text-xs font-bold ${c.label}`}>
                        Allegro Ürün Kataloğu (Product Catalog Entegrasyonu)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchAllegroCatalog}
                      disabled={isSearchingCatalog}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className={`w-3 h-3 ${isSearchingCatalog ? 'animate-spin' : ''}`} />
                      <span>{isSearchingCatalog ? 'Katalog Taranıyor...' : 'Allegro Kataloğunda Tara'}</span>
                    </button>
                  </div>

                  {matchedCatalogProduct ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                      {matchedCatalogProduct.image && (
                        <img
                          src={matchedCatalogProduct.image}
                          alt=""
                          className="w-10 h-10 object-contain rounded-md bg-white border border-emerald-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                          {matchedCatalogProduct.name}
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                          Katalog ID: {matchedCatalogProduct.id}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                        Eşleşti ✓
                      </span>
                    </div>
                  ) : (
                    <p className={`text-[11px] ${c.hint}`}>
                      {ean
                        ? `EAN (#${ean}) ile katalog taranabilir veya yeni ürün oluşturulabilir.`
                        : 'Ürün Allegro kataloğuna otomatik bağlanacaktır. EAN girerek tam katalog eşleştirmesi yapabilirsiniz.'}
                    </p>
                  )}
                </div>

                {/* BÖLÜM 6: LEHÇE ÜRÜN AÇIKLAMASI */}
                <div>
                  <label className={`text-xs font-bold block mb-1.5 ${c.label}`}>
                    Lehçe Ürün Açıklaması (HTML Destekli)
                  </label>
                  <textarea
                    rows={4}
                    value={allegroDescription}
                    onChange={(e) => setAllegroDescription(e.target.value)}
                    className={`w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                  />
                </div>

                {/* BÖLÜM 7: CANLI YAYINA ALMA AKSİYON KARTI */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/60 border-amber-200'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5A00]" />
                      Allegro REST API (POST /sale/product-offers) Canlı Yayın
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${c.hint}`}>
                      Başlık, kategori (#{allegroCategoryId}), görsel ve kargo şablonu Allegro Product Catalog üzerinden doğrulanarak yayına alınır.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isPublishingToAllegro || !isAllegroEnabled}
                    onClick={handlePublishLiveToAllegro}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5A00] hover:bg-[#e04f00] active:scale-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50 shrink-0"
                  >
                    {isPublishingToAllegro ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Allegro'ya Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>🚀 Allegro'da Doğrula ve Canlı Yayınla</span>
                      </>
                    )}
                  </button>
                </div>

                {/* YAYIN BİLDİRİMİ */}
                {allegroPublishNotice && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
                    allegroPublishNotice.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {allegroPublishNotice.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="truncate">{allegroPublishNotice.message}</span>
                    </div>

                    {allegroPublishNotice.offerUrl && (
                      <a
                        href={allegroPublishNotice.offerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shrink-0 hover:bg-emerald-700"
                      >
                        <span>İlanı Gör</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 4: BASELINKER */}
          {/* ======================================================================= */}
          {activeTab === 'baselinker' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                isDark ? 'bg-blue-950/20 border-blue-900/50' : 'bg-blue-50/70 border-blue-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    B
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                        BaseLinker Hub & Sipariş Senkronizasyonu
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        api.baselinker.com
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${c.hint}`}>
                      Çoklu depo stokları, kargo etiketleri ve ortak sipariş yönetimi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBaseLinkerEnabled}
                      onChange={(e) => setIsBaseLinkerEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${c.label}`}>
                    {isBaseLinkerEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border space-y-2 ${c.innerCard}`}>
                  <span className={`text-xs block ${c.label}`}>Depo / Katalog ID</span>
                  <input
                    type="text"
                    value={baseLinkerStorageId}
                    onChange={(e) => setBaseLinkerStorageId(e.target.value)}
                    className={`w-full text-xs font-mono px-3 py-2 rounded-xl border ${c.inputBg}`}
                  />
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${c.innerCard}`}>
                  <span className={`text-xs block ${c.label}`}>Kanal Eşleme Durumu</span>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Ortak SKU ({sku}) üzerinden dinamik stok eşleme etkin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER: Professional, harmonious action bar */}
        {/* ========================================================================= */}
        <div className={`px-6 py-4 border-t flex items-center justify-between flex-wrap gap-4 shrink-0 ${c.footerBg}`}>
          {/* Quick Metrics */}
          <div className={`flex items-center gap-3 text-xs flex-wrap ${c.hint}`}>
            <span className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-zinc-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              <span>eMAG: #{emagCategoryId}</span>
            </span>
            <span>•</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Stok: {stock} Adet
            </span>
            <span>•</span>
            <span className="font-mono text-slate-700 dark:text-zinc-300">
              Maliyet: {discountedEurPrice.toFixed(2)} € ({emagPriceBgn} BGN)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Vazgeç
            </button>

            {/* Save Draft */}
            <button
              type="button"
              disabled={isSaving || isPublishingLive}
              onClick={() => handleSaveDraft(false)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-slate-500" />
              <span>{isSaving && !isPublishingLive ? 'Kaydediliyor...' : 'Taslak Olarak Kaydet'}</span>
            </button>

            {/* Save & Publish Live to eMAG */}
            <button
              type="button"
              disabled={isSaving || isPublishingLive}
              onClick={() => handleSaveDraft(true)}
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                (!isEmagPublishReady && isEmagEnabled)
                  ? 'bg-slate-300 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 hover:bg-slate-300 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700'
                  : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white'
              }`}
              title={
                (!isEmagPublishReady && isEmagEnabled)
                  ? `eMAG zorunlu alanları eksik: ${missingRequirements.map(m => m.trLabel).join(', ')}`
                  : 'Kaydet ve eMAG Marketplace canlı kataloğuna anında gönder'
              }
            >
              {isPublishingLive ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>eMAG'a Gönderiliyor...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Kaydedildi!</span>
                </>
              ) : (!isEmagPublishReady && isEmagEnabled) ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>eMAG Kilitli ({missingRequirements.length} Eksik)</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kaydet & eMAG'a Canlı Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live eMAG API Execution Audit Trail Modal */}
      {showEmagLogsModal && (
        <EmagExecutionLogsModal
          isOpen={showEmagLogsModal}
          onClose={() => {
            setShowEmagLogsModal(false);
            onClose();
          }}
          report={emagExecutionReport}
          theme={theme}
        />
      )}
    </div>
  );
};
