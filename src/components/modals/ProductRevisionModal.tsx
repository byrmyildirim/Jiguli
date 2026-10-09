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
  Copy
} from 'lucide-react';
import { AllegroOffer, MarketplaceId } from '../../types/allegro';
import { store } from '../../services/marketplaceStore';
import { MarketplaceLogo } from '../../constants/marketplaces';
import {
  matchProductToEmagCategory,
  KNOWN_CATEGORY_CHARACTERISTICS,
  CategoryMatchResult
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
  const [isAllegroEnabled, setIsAllegroEnabled] = useState(Boolean(offer.channelData?.allegro));
  const [allegroTitle, setAllegroTitle] = useState(offer.channelData?.allegro?.title || offer.name || '');
  const [allegroPricePln, setAllegroPricePln] = useState<string>(
    offer.channelData?.allegro?.price?.amount || offer.sellingMode?.price?.amount || '135.80'
  );
  const [allegroCategoryId, setAllegroCategoryId] = useState(offer.channelData?.allegro?.categoryId || '12800');
  const [allegroSmart, setAllegroSmart] = useState(offer.smartEligible ?? true);

  // --- BASELINKER STATE ---
  const [isBaseLinkerEnabled, setIsBaseLinkerEnabled] = useState(offer.channelSync?.baselinker !== 'unlinked');
  const [baseLinkerStorageId, setBaseLinkerStorageId] = useState('bl_shop_default');

  // --- SUBMISSION & LOGS STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingLive, setIsPublishingLive] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEmagLogsModal, setShowEmagLogsModal] = useState(false);
  const [emagExecutionReport, setEmagExecutionReport] = useState<EmagExecutionReport | null>(null);

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
            price: {
              amount: allegroPricePln,
              currency: 'PLN'
            },
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
                    <label className={`text-xs uppercase tracking-wider block mb-1.5 ${c.label}`}>
                      Ürün Başlığı (Dahili Tanım)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                    />
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

              {/* Title, Pricing & VAT */}
              <div className="space-y-4">
                <div>
                  <label className={`text-xs block mb-1.5 ${c.label}`}>
                    eMAG İlan Başlığı (Bulgarca / İngilizce)
                  </label>
                  <input
                    type="text"
                    value={emagTitle}
                    onChange={(e) => setEmagTitle(e.target.value)}
                    placeholder="eMAG'da yayınlanacak başlık..."
                    className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                  />
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${c.label}`}>
                      <Sliders className="w-3.5 h-3.5 text-rose-500" />
                      <span>eMAG Kategori Karakteristikleri (Teknik Özellikler)</span>
                    </h4>
                    <p className={`text-[11px] ${c.hint}`}>
                      Bu değerler eMAG API v3 kurallarına göre zorunlu olup ürünün kabul edilmesini sağlar.
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
                  {emagCharacteristics.map((charItem, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${c.innerCard}`}
                    >
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 shrink-0">
                        {String(charItem.id)}:
                      </span>
                      <input
                        type="text"
                        value={charItem.value}
                        onChange={(e) => {
                          const updated = [...emagCharacteristics];
                          updated[idx] = { ...charItem, value: e.target.value };
                          setEmagCharacteristics(updated);
                        }}
                        className={`w-full text-xs px-2.5 py-1.5 rounded-lg border ${c.inputBg}`}
                      />
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
                  ))}
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
              <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                isDark ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    a
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                        Allegro Polonya Pazaryeri
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                        allegro.pl
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${c.hint}`}>
                      Polonya ve Çekya için PLN cinsinden satış, Smart! rozet uyumluluğu.
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
                    <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${c.label}`}>
                    {isAllegroEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs ${c.label}`}>
                      Allegro Başlığı (Lehçe - Maksimum 75 Karakter)
                    </label>
                    <span className={`text-xs font-mono font-bold ${allegroTitle.length > 75 ? 'text-rose-500' : c.hint}`}>
                      {allegroTitle.length} / 75
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={75}
                    value={allegroTitle}
                    onChange={(e) => setAllegroTitle(e.target.value)}
                    placeholder="Lehçe ürün başlığı..."
                    className={`w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`text-xs block mb-1.5 ${c.label}`}>
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
                  </div>

                  <div>
                    <label className={`text-xs block mb-1.5 ${c.label}`}>
                      Allegro Kategori Kodu
                    </label>
                    <input
                      type="text"
                      value={allegroCategoryId}
                      onChange={(e) => setAllegroCategoryId(e.target.value)}
                      className={`w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border ${c.inputBg}`}
                    />
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${c.innerCard}`}>
                    <div>
                      <span className={`text-xs font-bold block ${c.label}`}>Allegro Smart!</span>
                      <span className={`text-[11px] ${c.hint}`}>Ücretsiz teslimat rozeti</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allegroSmart}
                      onChange={(e) => setAllegroSmart(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer"
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
