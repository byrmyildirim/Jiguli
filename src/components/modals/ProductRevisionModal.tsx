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
  Box
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
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // Active Tab: 'core' | 'emag' | 'allegro' | 'baselinker'
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
  const [emagCategoryId, setEmagCategoryId] = useState<number>(() => {
    const raw = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || offer.category?.id;
    const num = parseInt(String(raw || '').replace(/\D/g, ''), 10);
    return !isNaN(num) && num > 0 && num !== 6001 && num !== 257548 && num !== 3122 ? num : 3523;
  });
  const [emagCategoryName, setEmagCategoryName] = useState<string>(
    offer.channelData?.emag?.categoryName ||
    offer.excelMetadata?.emagCategoryName ||
    offer.category?.name ||
    'Lighting & Electrical/Light sources/LED strips'
  );
  const [emagDescription, setEmagDescription] = useState<string>(
    offer.description?.sections?.[0]?.items?.[0]?.content ||
    `<h2>${offer.name}</h2><p>Orijinal garantili ürün. Sameday kargo güvencesiyle eMAG Bulgaristan için hazırlanmıştır.</p>`
  );
  const [emagCharacteristics, setEmagCharacteristics] = useState<{ id: string | number; value: string }[]>(() => {
    const existing = offer.channelData?.emag?.characteristics;
    if (Array.isArray(existing) && existing.length > 0) return existing;
    return KNOWN_CATEGORY_CHARACTERISTICS[3523] || [
      { id: 'emag-brand', value: 'Generic' }
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

  // Initialize or re-match category on mount if needed
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

      // Populate characteristic defaults if empty
      if (match.characteristics && (!offer.channelData?.emag?.characteristics || offer.channelData.emag.characteristics.length === 0)) {
        setEmagCharacteristics(match.characteristics);
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

  // Re-run intelligent matching explicitly on user request
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

      const updatedOfferData: Partial<AllegroOffer> = {
        name: name.trim(),
        sku: sku.trim(),
        ean: ean.trim(),
        primaryImage: primaryImage.trim(),
        stock: {
          available: stock,
          unit: 'UNIT'
        },
        sellingMode: {
          format: 'BUY_NOW',
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
        publication: {
          ...offer.publication,
          status: publishToLiveEmag ? 'ACTIVE' : (offer.publication?.status || 'DRAFT')
        }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        className={`border rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl transition-all my-auto flex flex-col max-h-[94vh] ${
          isDark ? 'bg-[#0f131c] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-zinc-800 bg-[#141924]' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Edit2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Ürün Revizyonu & Pazaryeri Yönetimi</h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {sku || `ID: ${offer.id.slice(0, 8)}`}
                </span>
                {offer.excelMetadata && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>Excel Kataloğu</span>
                  </span>
                )}
              </div>
              <p className={`text-xs truncate max-w-xl mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {name || 'İsimsiz Ürün'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Kapat (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DISTINCT MARKETPLACE TABS (HER PAZAR YERİNİ AYIR) */}
        <div
          className={`px-5 pt-3 border-b flex items-center gap-2 overflow-x-auto shrink-0 ${
            isDark ? 'border-zinc-800 bg-[#121620]' : 'border-slate-200 bg-slate-100/60'
          }`}
        >
          {/* TAB 1: CORE / TEMEL */}
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'core'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
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
                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[9px] text-white font-black">
              e
            </div>
            <span>2. eMAG Marketplace (Bulgaristan)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono">
              #{emagCategoryId}
            </span>
          </button>

          {/* TAB 3: ALLEGRO MARKETPLACE */}
          <button
            type="button"
            onClick={() => setActiveTab('allegro')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
              activeTab === 'allegro'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <div className="w-4 h-4 rounded bg-amber-600 flex items-center justify-center text-[9px] text-white font-black">
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
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[9px] text-white font-black">
              B
            </div>
            <span>4. BaseLinker & Çoklu Kanal</span>
          </button>
        </div>

        {/* MODAL BODY (TAB CONTENT) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================================= */}
          {/* TAB 1: CORE PRODUCT & INVENTORY */}
          {/* ========================================================================= */}
          {activeTab === 'core' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Product Visual & Basic Properties */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Visual Preview Card */}
                <div className="md:col-span-4 space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Ürün Görseli</span>
                  </label>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/60 flex items-center justify-center group shadow-inner">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={name}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/no_image.svg';
                        }}
                      />
                    ) : (
                      <div className="text-center p-4 text-zinc-500">
                        <ImageIcon className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
                        <span className="text-xs">Görsel Bulunamadı</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Görsel URL Bağlantısı</label>
                    <input
                      type="text"
                      value={primaryImage}
                      onChange={(e) => setPrimaryImage(e.target.value)}
                      placeholder="https://... resim linki"
                      className={`w-full text-xs font-mono px-3 py-2 rounded-xl border ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {/* Primary Identifiers */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                      Ürün Ana Başlığı (Dahili Tanım)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ürün başlığı..."
                      className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl border ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>SKU / Stok Kodu</span>
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className={`w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Barkod / EAN</span>
                      </label>
                      <input
                        type="text"
                        value={ean}
                        onChange={(e) => setEan(e.target.value)}
                        placeholder="Örn: 590..."
                        className={`w-full text-xs font-mono px-3 py-2.5 rounded-xl border ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                        <Box className="w-3.5 h-3.5" />
                        <span>Stok Miktarı</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full text-xs font-bold px-3 py-2.5 rounded-xl border ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-700'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Supplier Link (1688 / AliExpress / DHgate) */}
                  <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tedarikçi İnternet Sayfası (1688 / AliExpress / Amazon / Trendyol)</span>
                      </label>
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
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
                      placeholder="https://detail.1688.com/... veya AliExpress / DHgate bağlantısı"
                      className={`w-full text-xs font-mono px-3 py-2 rounded-xl border ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  {/* Financial & Costing Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Orijinal EUR Fiyatı</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-sm text-zinc-300">
                        <span>{eurOriginalPrice.toFixed(2)}</span>
                        <span className="text-xs text-zinc-500">€</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Uygulanan İndirim</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-sm text-amber-400">
                        <span>{discountPercent}</span>
                        <Percent className="w-3 h-3 text-zinc-500" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                      <span className="text-[10px] text-indigo-400 font-semibold block mb-0.5">İndirimli Alış Maliyeti (€)</span>
                      <div className="flex items-center gap-1 font-mono font-black text-sm text-indigo-300">
                        <input
                          type="number"
                          step="0.01"
                          value={discountedEurPrice}
                          onChange={(e) => handleEurPriceChange(parseFloat(e.target.value) || 0)}
                          className="w-20 bg-transparent border-b border-indigo-400 text-indigo-200 outline-none text-sm font-bold"
                        />
                        <span className="text-xs text-indigo-400">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Excel Logistics Metadata (If available) */}
              {offer.excelMetadata && (
                <div className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Excel Sevkiyat & Lojistik Detayları (resale projesi-revize.xlsx)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Koli / Paket No</span>
                      <span className="text-zinc-300 font-bold">{offer.excelMetadata.parcelNumber || '-'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Palet No</span>
                      <span className="text-zinc-300 font-bold">{offer.excelMetadata.palletNumber || '-'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Beyan Edilen Değer</span>
                      <span className="text-zinc-300 font-bold">
                        {offer.excelMetadata.declaredValue ? `${offer.excelMetadata.declaredValue} ${offer.excelMetadata.currency || 'CNY'}` : '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Vergi / KDV</span>
                      <span className="text-zinc-300 font-bold">{offer.excelMetadata.tax || '%20'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: eMAG MARKETPLACE (BULGARISTAN) */}
          {/* ========================================================================= */}
          {activeTab === 'emag' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Channel Enable Header */}
              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-rose-900/30">
                    e
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">eMAG Bulgaristan Marketplace</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        marketplace-api.emag.bg
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Onaylı Bulgaristan hesabı, Sameday Kargo entegrasyonu ve %20 KDV desteği.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveDraft(true)}
                    disabled={isPublishingLive}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPublishingLive ? 'eMAG API Test Ediliyor...' : 'eMAG Canlı Yayına Al'}</span>
                  </button>
                </div>
              </div>

              {/* AUTOMATED & INTELLIGENT CATEGORY MATCHING CARD */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#121622] space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>eMAG Bulgaristan Otomatik Kategori Seçimi</span>
                    </label>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Masaüstündeki Excel bilgi tabanı ve eMAG 1.735 izinli kategori kataloğundan otomatik belirlendi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReMatchCategory}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Excel kuralları ve URL'ye göre yeniden tara"
                  >
                    <RefreshCw className="w-3 h-3 text-rose-400" />
                    <span>Akıllı Eşleştirmeyi Yenile</span>
                  </button>
                </div>

                {/* Current Active Category Pill */}
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      #{emagCategoryId}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{emagCategoryName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {matchBadge}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        Bu kategori satıcı hesabınızda onaylı ve eMAG API v3 için izinlidir.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCategorySearchOpen(!isCategorySearchOpen)}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    {isCategorySearchOpen ? 'Aramayı Kapat' : 'Kategoriyi Değiştir...'}
                  </button>
                </div>

                {/* Manual Category Search Dropdown (Search over 1,735 allowed categories) */}
                {isCategorySearchOpen && (
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 animate-in fade-in">
                    <div className="relative">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        placeholder="1.735 eMAG Bulgaristan kategorisinde ara (örn: LED, Pet, Dress, Watch...)"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-rose-500"
                        autoFocus
                      />
                    </div>

                    {filteredCategories.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-zinc-800/60">
                        {filteredCategories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setEmagCategoryId(Number(c.id));
                              setEmagCategoryName(c.name);
                              setMatchBadge('Manuel Seçim');
                              if (KNOWN_CATEGORY_CHARACTERISTICS[Number(c.id)]) {
                                setEmagCharacteristics(KNOWN_CATEGORY_CHARACTERISTICS[Number(c.id)]);
                              }
                              setIsCategorySearchOpen(false);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-zinc-800 text-xs flex items-center justify-between text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <span>{c.name}</span>
                            <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              #{c.id}
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
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                    eMAG İlan Başlığı (Bulgarca / İngilizce)
                  </label>
                  <input
                    type="text"
                    value={emagTitle}
                    onChange={(e) => setEmagTitle(e.target.value)}
                    placeholder="eMAG'da görünecek başlık..."
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:outline-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                      <span>eMAG Satış Fiyatı (BGN)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={emagPriceBgn}
                        onChange={(e) => setEmagPriceBgn(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-rose-400 focus:outline-rose-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">BGN</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      <span>KDV Oranı (Bulgaristan)</span>
                    </label>
                    <div className="px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                      <span>%20 Standart</span>
                      <span className="text-[10px] text-zinc-500">VAT ID: 6</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Kargoya Verme Süresi</span>
                    </label>
                    <div className="px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-medium text-zinc-300">
                      1 İş Günü (Sameday)
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic eMAG Category Characteristics */}
              <div className="p-4 rounded-2xl border border-zinc-800 bg-[#121622] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-rose-400" />
                      <span>eMAG Kategori Karakteristikleri (Özellikler)</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400">
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
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    + Özellik Ekle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {emagCharacteristics.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-mono text-zinc-400 font-bold shrink-0">
                        {String(c.id)}:
                      </span>
                      <input
                        type="text"
                        value={c.value}
                        onChange={(e) => {
                          const updated = [...emagCharacteristics];
                          updated[idx] = { ...c, value: e.target.value };
                          setEmagCharacteristics(updated);
                        }}
                        className="w-full text-xs px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEmagCharacteristics(emagCharacteristics.filter((_, i) => i !== idx));
                        }}
                        className="text-zinc-500 hover:text-rose-400 text-xs px-1 cursor-pointer"
                        title="Sil"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* eMAG HTML Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  eMAG Ürün Açıklaması (HTML Formatlı)
                </label>
                <textarea
                  rows={4}
                  value={emagDescription}
                  onChange={(e) => setEmagDescription(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 focus:outline-rose-500"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ALLEGRO MARKETPLACE (POLONYA) */}
          {/* ========================================================================= */}
          {activeTab === 'allegro' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-900/30">
                    a
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Allegro Polonya Marketplace</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        allegro.pl
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
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
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                  <span className="text-xs font-bold text-zinc-300">
                    {isAllegroEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Allegro Başlığı (Lehçe - Maksimum 75 Karakter)
                    </label>
                    <span className={`text-[11px] font-mono ${allegroTitle.length > 75 ? 'text-rose-400 font-bold' : 'text-zinc-500'}`}>
                      {allegroTitle.length} / 75
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={75}
                    value={allegroTitle}
                    onChange={(e) => setAllegroTitle(e.target.value)}
                    placeholder="Lehçe ürün başlığı..."
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:outline-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1 block">
                      Allegro Fiyatı (PLN)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={allegroPricePln}
                        onChange={(e) => setAllegroPricePln(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-amber-400 focus:outline-amber-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">PLN</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1 block">
                      Allegro Kategori Kodu
                    </label>
                    <input
                      type="text"
                      value={allegroCategoryId}
                      onChange={(e) => setAllegroCategoryId(e.target.value)}
                      className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900">
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">Allegro Smart!</span>
                      <span className="text-[10px] text-zinc-500">Ücretsiz teslimat rozeti</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allegroSmart}
                      onChange={(e) => setAllegroSmart(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BASELINKER & MULTI-CHANNEL */}
          {/* ========================================================================= */}
          {activeTab === 'baselinker' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-900/30">
                    B
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">BaseLinker Hub & Sipariş Senkronizasyonu</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        api.baselinker.com
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
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
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-xs font-bold text-zinc-300">
                    {isBaseLinkerEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">Depo / Katalog ID</span>
                  <input
                    type="text"
                    value={baseLinkerStorageId}
                    onChange={(e) => setBaseLinkerStorageId(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-white"
                  />
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">Kanal Eşleme Durumu</span>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Ortak SKU (#`{sku}`) üzerinden dinamik eşleme aktif</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between flex-wrap gap-4 shrink-0 ${
            isDark ? 'border-zinc-800 bg-[#121620]' : 'border-slate-100 bg-white'
          }`}
        >
          {/* Quick Summary Pill */}
          <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
            <span className="flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>eMAG: #{emagCategoryId}</span>
            </span>
            <span>•</span>
            <span className="font-mono font-bold text-emerald-400">
              Stok: {stock} Adet
            </span>
            <span>•</span>
            <span className="font-mono text-zinc-300">
              Maliyet: {discountedEurPrice.toFixed(2)} € ({emagPriceBgn} BGN)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Vazgeç
            </button>

            {/* Save Draft */}
            <button
              type="button"
              disabled={isSaving || isPublishingLive}
              onClick={() => handleSaveDraft(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Package className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isSaving && !isPublishingLive ? 'Kaydediliyor...' : 'Taslak Olarak Kaydet'}</span>
            </button>

            {/* Save & Publish Live to eMAG */}
            <button
              type="button"
              disabled={isSaving || isPublishingLive}
              onClick={() => handleSaveDraft(true)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
            >
              {isPublishingLive ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>eMAG'a Gönderiliyor...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
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
