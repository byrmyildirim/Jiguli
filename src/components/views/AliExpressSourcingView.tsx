import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Search,
  ExternalLink,
  CheckCircle2,
  Package,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Camera,
  X,
  Layers,
  TrendingUp,
  Store,
  Globe,
  Link as LinkIcon,
  Image as ImageIcon,
  Terminal,
  Code,
  CheckCircle,
  Clock,
  Send,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { ProductImage } from '../common/ProductImage';
import {
  SAMPLE_ALIEXPRESS_HOT_PRODUCTS,
  calculateSourcingProfit,
  publishAliExpressProductMultiChannel,
  searchAliExpressWithAI,
  adoptCandidateProduct,
  SourcingCalculation,
  ChannelPublishResult
} from '../../services/aliExpressSourcing';
import { AliExpressMatchedProduct, AllegroOffer, AliExpressCandidateItem } from '../../types/allegro';

interface AliExpressSourcingViewProps {
  onNavigateToOffers: () => void;
  theme?: 'light' | 'dark';
}

const formatPrice = (val: any, decimals = 2): string => {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

export const AliExpressSourcingView: React.FC<AliExpressSourcingViewProps> = ({
  onNavigateToOffers
}) => {
  const [selectedProduct, setSelectedProduct] = useState<AliExpressMatchedProduct & { directSearchUrl?: string }>(
    SAMPLE_ALIEXPRESS_HOT_PRODUCTS[0]
  );
  const [queryInput, setQueryInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [sourcingMode, setSourcingMode] = useState<'upload' | 'url'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStep, setScanningStep] = useState<string>('Görsel taranıyor...');
  const [marginPercent, setMarginPercent] = useState<number>(45);
  const [customStock, setCustomStock] = useState<number>(40);
  
  // Multilingual Title State (English is Primary default)
  const [activeLanguage, setActiveLanguage] = useState<'EN' | 'PL' | 'RO' | 'TR'>('EN');
  const [customTitle, setCustomTitle] = useState<string>(SAMPLE_ALIEXPRESS_HOT_PRODUCTS[0].titleEn);

  // Live Publishing & Terminal State
  const [isPublishing, setIsPublishing] = useState(false);
  const [activePublishingChannel, setActivePublishingChannel] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<ChannelPublishResult | null>(null);
  const [showLiveTerminal, setShowLiveTerminal] = useState(false);
  const [expandedLogIdx, setExpandedLogIdx] = useState<number | null>(0);

  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [emagTargetCountry, setEmagTargetCountry] = useState<'BG' | 'RO' | 'HU'>('BG');
  const [currencyFocus, setCurrencyFocus] = useState<'ALL' | 'TRY' | 'USD' | 'PLN' | 'BGN' | 'RON'>('ALL');
  const [searchMetadata, setSearchMetadata] = useState<{
    queries: string[];
    sources: string[];
    detectedQuery?: string;
    executedAt?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync customTitle when selectedProduct changes
  useEffect(() => {
    if (activeLanguage === 'EN') setCustomTitle(selectedProduct.titleEn);
    else if (activeLanguage === 'PL') setCustomTitle(selectedProduct.titlePl);
    else if (activeLanguage === 'RO') setCustomTitle(selectedProduct.titleEn);
    else setCustomTitle(selectedProduct.titleEn);
  }, [selectedProduct, activeLanguage]);

  // Sync emagTargetCountry with global store settings
  useEffect(() => {
    const syncPlatformCountry = () => {
      const p = store.getPlatform('emag');
      if (p?.credentials?.countryMarket) {
        setEmagTargetCountry(p.credentials.countryMarket as any);
      }
    };
    syncPlatformCountry();
    return store.subscribe(syncPlatformCountry);
  }, []);

  // Dynamic profit calculation (multi-currency)
  const calculation: SourcingCalculation = calculateSourcingProfit(
    selectedProduct.priceUsd,
    selectedProduct.shippingUsd,
    marginPercent
  );

  // Camera cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      alert('Kamera erişimine izin verilmedi veya kamera bulunamadı. Lütfen dosya yükleme veya resim linki yöntemini kullanın.');
      setIsCameraOpen(false);
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setUploadedPreview(dataUrl);
      handleStopCamera();
      executeLiveAliExpressSearch({
        imageBase64: dataUrl,
        mimeType: 'image/jpeg',
        queryText: 'camera product snapshot'
      });
    }
  };

  const handleSelectSample = (prod: AliExpressMatchedProduct) => {
    setSelectedProduct({
      ...prod,
      directSearchUrl: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(prod.titleEn)}`
    });
    setUploadedPreview(null);
    setImageUrlInput('');
    setPublishResult(null);
    setShowLiveTerminal(false);
    setSearchMetadata({
      queries: [`AliExpress: ${prod.titleEn}`],
      sources: [prod.sourceUrl],
      detectedQuery: prod.titleEn
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploadedPreview(dataUrl);
      await executeLiveAliExpressSearch({
        imageBase64: dataUrl,
        mimeType: file.type || 'image/jpeg',
        queryText: file.name.replace(/\.[^/.]+$/, '')
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = imageUrlInput.trim();
    if (!cleanUrl) return;

    setUploadedPreview(cleanUrl);
    await executeLiveAliExpressSearch({
      imageUrl: cleanUrl,
      queryText: `Image URL search ${cleanUrl}`
    });
  };

  const handleTextOrUrlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = queryInput.trim();
    if (!input) return;

    // Check if input is a direct image URL
    const isDirectImage = /^https?:\/\/.+/i.test(input) &&
      (/\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(input) ||
       /alicdn\.com|unsplash\.com|img|image|photo/i.test(input));

    if (isDirectImage) {
      setUploadedPreview(input);
      await executeLiveAliExpressSearch({
        imageUrl: input,
        queryText: `Direct Image URL: ${input}`
      });
    } else {
      await executeLiveAliExpressSearch({
        queryText: input
      });
    }
  };

  const executeLiveAliExpressSearch = async (params: {
    imageBase64?: string;
    imageUrl?: string;
    mimeType?: string;
    queryText?: string;
  }) => {
    setIsScanning(true);
    setPublishResult(null);
    setShowLiveTerminal(false);

    setScanningStep('Görsel Gemini 3.8 Vision AI ile analiz ediliyor...');
    const stepTimer1 = setTimeout(() => {
      setScanningStep('AliExpress pazarında canlı ilanlar ve tedarikçiler taranıyor...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setScanningStep('İngilizce/Lehçe ürün kataloğu ve fiyatlandırma verisi hazırlanıyor...');
    }, 1900);

    try {
      const result = await searchAliExpressWithAI(params);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setSelectedProduct(result.product);
      if (result.searchMetadata) {
        setSearchMetadata(result.searchMetadata);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectCandidate = (candidate: AliExpressCandidateItem) => {
    const updated = adoptCandidateProduct(selectedProduct, candidate);
    setSelectedProduct(updated);
    setPublishResult(null);
    setShowLiveTerminal(false);
  };

  // Dedicated Selective Channel Publishing
  const handlePublishToChannels = (channels: ('allegro' | 'emag' | 'baselinker')[]) => {
    setIsPublishing(true);
    setActivePublishingChannel(channels.join(', '));
    setShowLiveTerminal(true);

    setTimeout(() => {
      const result = publishAliExpressProductMultiChannel({
        product: selectedProduct,
        title: customTitle || selectedProduct.titleEn,
        channels,
        sellingPricePln: calculation.recommendedAllegroPricePln,
        sellingPriceRon: calculation.recommendedEmagPriceRon,
        sellingPriceBgn: calculation.recommendedEmagPriceBgn,
        emagTargetCountry,
        initialStock: customStock
      });

      setPublishResult(result);
      setIsPublishing(false);
      setActivePublishingChannel(null);
    }, 650);
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(customTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const liveAliExpressUrl =
    selectedProduct.directSearchUrl ||
    `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(selectedProduct.titleEn)}`;

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight flex items-center gap-2">
            <span>Canlı Ürün Bul, İncele & Pazaryerlerine Aktar</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9FE870]/40 text-[#163300]">
              Gemini Vision & Live API
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5D7079] mt-1">
            Görsel veya web linkiyle canlı ürünü bulun; <strong>İngilizce (Global)</strong> veya Lehçe/Romence başlıkla <strong>Allegro, eMAG ve BaseLinker'a ayrı ayrı veya tek tıkla</strong> aktarın.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStartCamera}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#14171A] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#163300]" />
            <span>Kamera ile Çek</span>
          </button>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-sm font-bold text-[#14171A] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#163300]" />
                <span>Canlı Kamera ile Ürün Tara</span>
              </div>
              <button
                onClick={handleStopCamera}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border-2 border-white/60 border-dashed rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-xs text-white/90 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  Ürünü çerçevenin içine hizalayın
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleStopCamera}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleCaptureSnapshot}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Fotoğrafı Çek ve Canlı Ara</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sourcing Input: File Drag & Drop vs Image Link URL */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setSourcingMode('upload')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              sourcingMode === 'upload'
                ? 'bg-[#14171A] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Görsel Dosyası Sürükle / Seç</span>
          </button>

          <button
            onClick={() => setSourcingMode('url')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              sourcingMode === 'url'
                ? 'bg-[#14171A] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Görsel Web Linki (URL) ile Ara</span>
          </button>
        </div>

        {sourcingMode === 'upload' ? (
          <label className="border-2 border-dashed border-slate-200 hover:border-[#14171A] bg-[#FAFBFC] hover:bg-[#F4F5F7] rounded-3xl p-8 text-center cursor-pointer transition-colors block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedPreview ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <img
                  src={uploadedPreview}
                  alt="Yüklenen Görsel"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <div className="text-center sm:text-left">
                  <div className="text-sm font-bold text-[#14171A] flex items-center gap-1.5 justify-center sm:justify-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Görsel Yüklendi ve Canlı Eşleşti</span>
                  </div>
                  <div className="text-xs text-[#5D7079] mt-0.5">
                    Farklı bir görsel seçmek veya sürüklemek için tıklayın
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#9FE870]/30 text-[#163300] flex items-center justify-center">
                  <Upload className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-sm font-bold text-[#14171A]">
                  Fotoğrafı Buraya Sürükleyin veya Dosya Seçin
                </div>
                <div className="text-xs text-[#5D7079]">
                  Gemini Vision fotoğrafı tanımlar, AliExpress'te canlı arama yaparak gerçek ürünü getirir
                </div>
              </div>
            )}
          </label>
        ) : (
          <form onSubmit={handleImageUrlSearch} className="p-6 rounded-3xl bg-[#FAFBFC] border border-slate-200 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#14171A] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Görsel Web Linki (Direct Image URL):</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://ae01.alicdn.com/kf/S...jpg veya resim linkini yapıştırın..."
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-[#14171A] focus:outline-none focus:ring-2 focus:ring-[#14171A]"
                />
              </div>
            </div>

            {imageUrlInput.trim() && (
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                <img
                  src={imageUrlInput}
                  alt="Görsel Önizleme"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="text-xs flex-1 min-w-0">
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Görsel Linki Algılandı</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">{imageUrlInput}</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isScanning || !imageUrlInput.trim()}
              className="w-full py-3 rounded-full bg-[#14171A] hover:bg-black text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Search className="w-4 h-4 text-[#9FE870]" />
              <span>Görsel Linki ile Canlı Ara</span>
            </button>
          </form>
        )}

        {/* Text / URL search bar */}
        <form onSubmit={handleTextOrUrlSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Veya ürün adı, model, aliexpress.com veya görsel linki yapıştırın..."
              className="w-full bg-[#F4F5F7] rounded-full pl-11 pr-5 py-2.5 text-xs text-[#14171A] focus:outline-none focus:ring-2 focus:ring-[#14171A]"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="bg-[#14171A] hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            Canlı Ara
          </button>
        </form>

        {/* Quick Samples Pill Row */}
        <div className="flex items-center gap-2 pt-1 text-xs overflow-x-auto">
          <span className="text-[11px] text-[#7D8F99] shrink-0">Hızlı Test Örnekleri:</span>
          {SAMPLE_ALIEXPRESS_HOT_PRODUCTS.map((prod) => (
            <button
              key={prod.id}
              onClick={() => handleSelectSample(prod)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedProduct.id === prod.id && !uploadedPreview
                  ? 'bg-[#14171A] text-white font-bold'
                  : 'bg-[#F2F4F7] text-[#5D7079] hover:text-[#14171A]'
              }`}
            >
              {prod.specifications.model} (${formatPrice(prod.priceUsd)})
            </button>
          ))}
        </div>
      </div>

      {/* Sourcing Results & Multi-Marketplace Pricing */}
      {isScanning ? (
        <div className="p-16 text-center space-y-4 bg-[#F7F8F9] rounded-3xl border border-slate-100 animate-in fade-in">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#9FE870]/30 animate-ping"></div>
            <div className="w-12 h-12 rounded-full bg-[#9FE870]/30 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#163300] animate-spin" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-base font-black text-[#14171A] tracking-tight">
              Görselden / Linkten Canlı Arama Yapılıyor
            </div>
            <div className="text-xs text-[#5D7079] font-medium">
              {scanningStep}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-4 border-t border-slate-100">
          {/* Matched Product Row */}
          <div className="p-6 rounded-3xl bg-[#F7F8F9] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <ProductImage
                src={selectedProduct.primaryImage}
                alt={selectedProduct.titleEn}
                className="w-20 h-20 rounded-2xl shadow-xs shrink-0"
                iconSize="lg"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-[#7D8F99]">
                  <span className="flex items-center gap-1 font-bold text-[#14171A]">
                    <Store className="w-3.5 h-3.5 text-[#163300]" />
                    {selectedProduct.supplierName}
                  </span>
                  <span>·</span>
                  <span className="text-amber-600 font-bold">{selectedProduct.supplierRating || 4.8} ★ Puan</span>
                  <span>·</span>
                  <span>{selectedProduct.deliveryDays || '7-10 gün'}</span>
                </div>
                <div className="text-sm font-bold text-[#14171A] line-clamp-2">
                  {selectedProduct.titleEn}
                </div>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="font-mono font-black text-emerald-800 bg-[#9FE870]/30 px-2.5 py-0.5 rounded-full">
                    ${formatPrice(selectedProduct.priceUsd)} USD (≈ ₺{formatPrice(calculation.costTry)} TL / {formatPrice(calculation.costPln)} PLN)
                  </span>
                  <span className="text-[#5D7079]">
                    {(selectedProduct.shippingUsd || 0) > 0 ? `(+$${formatPrice(selectedProduct.shippingUsd)} Kargo)` : '(Ücretsiz Kargo)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <a
                href={liveAliExpressUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#14171A] bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>AliExpress'te Canlı Aç</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Multilingual Title Editor with English as Primary Default */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#163300]" />
                <span className="text-xs font-bold text-[#14171A]">Pazaryeri İlan Başlığı (Varsayılan: İngilizce):</span>
              </div>

              {/* Language Switcher Buttons */}
              <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-full text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLanguage('EN');
                    setCustomTitle(selectedProduct.titleEn);
                  }}
                  className={`px-3 py-0.8 rounded-full font-bold transition-all cursor-pointer ${
                    activeLanguage === 'EN' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇬🇧 İngilizce (Global Öncelikli)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLanguage('PL');
                    setCustomTitle(selectedProduct.titlePl);
                  }}
                  className={`px-2.5 py-0.8 rounded-full font-bold transition-all cursor-pointer ${
                    activeLanguage === 'PL' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇵🇱 Lehçe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLanguage('RO');
                    setCustomTitle(selectedProduct.titleEn);
                  }}
                  className={`px-2.5 py-0.8 rounded-full font-bold transition-all cursor-pointer ${
                    activeLanguage === 'RO' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇷🇴 Romence
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#7D8F99]">
                <span>Aktarılacak Başlık (Düzenlenebilir):</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${customTitle.length > 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {customTitle.length}/75 karakter {customTitle.length <= 75 && '✓'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTitle}
                    className="text-slate-400 hover:text-[#14171A] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedTitle ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTitle ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#F7F8F9] border border-slate-200 rounded-xl p-3 text-xs font-semibold text-[#14171A] focus:outline-none focus:ring-2 focus:ring-[#14171A]"
              />
            </div>
          </div>

          {/* Margin Slider & Currency Filter Pills */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14171A]">
                <TrendingUp className="w-4 h-4 text-[#163300]" />
                <span>Hedef Kâr Marjı:</span>
                <span className="font-mono font-bold text-[#163300] bg-[#9FE870]/30 px-2.5 py-0.5 rounded-full text-xs">
                  %{marginPercent}
                </span>
              </div>

              {/* Currency View Selector */}
              <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-full text-[11px] self-start sm:self-auto">
                <button
                  onClick={() => setCurrencyFocus('ALL')}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currencyFocus === 'ALL' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tüm Kurlar (PLN + TL + USD + eMAG)
                </button>
                <button
                  onClick={() => setCurrencyFocus('TRY')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currencyFocus === 'TRY' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ₺ TL
                </button>
                <button
                  onClick={() => setCurrencyFocus('USD')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currencyFocus === 'USD' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => setCurrencyFocus('PLN')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currencyFocus === 'PLN' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  zł PLN
                </button>
                <button
                  onClick={() => setCurrencyFocus('RON')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currencyFocus === 'RON' ? 'bg-[#14171A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  lei RON (eMAG)
                </button>
              </div>
            </div>

            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={marginPercent}
              onChange={(e) => setMarginPercent(parseInt(e.target.value) || 45)}
              className="w-full accent-[#14171A] cursor-pointer"
            />

            {/* 4 Multi-Currency Financial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {/* Card 1: Tedarik Maliyeti */}
              <div className="p-4 rounded-2xl bg-[#F7F8F9] border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#7D8F99] flex items-center justify-between">
                    <span>Tedarik Maliyeti (AliExpress)</span>
                    <span className="text-[10px] bg-slate-200/70 px-1.5 py-0.2 rounded font-mono">Alış</span>
                  </div>
                  <div className="text-xl font-black text-[#14171A] font-mono mt-1">
                    {currencyFocus === 'TRY' && `₺${calculation.costTry}`}
                    {currencyFocus === 'USD' && `$${calculation.costUsd}`}
                    {currencyFocus === 'PLN' && `${calculation.costPln} PLN`}
                    {currencyFocus === 'RON' && `${calculation.costRon} RON`}
                    {currencyFocus === 'ALL' && `${calculation.costPln} PLN`}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-[#5D7079] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-400">Türk Lirası:</span>
                    <strong className="text-slate-800">₺{calculation.costTry} TL</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-400">Dolar & Euro:</span>
                    <span>${calculation.costUsd} · {calculation.costEur} €</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Allegro Tavsiye Satış Fiyatı */}
              <div className="p-4 rounded-2xl bg-[#F7F8F9] border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                    <span>Allegro Tavsiye Satış</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">🇵🇱 Polonya</span>
                  </div>
                  <div className="text-xl font-black text-[#14171A] font-mono mt-1">
                    {calculation.recommendedAllegroPricePln} PLN
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-[#5D7079] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-400">TL Karşılığı:</span>
                    <strong className="text-emerald-700">₺{calculation.recommendedAllegroPriceTry} TL</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-400">USD & EUR:</span>
                    <span>${calculation.recommendedAllegroPriceUsd} · {calculation.recommendedAllegroPriceEur} €</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-sans mt-0.5">Komisyon (%12) ve Smart! dahil</div>
                </div>
              </div>

              {/* Card 3: eMAG Tavsiye Satış Fiyatı (Bulgaristan BGN / Romanya RON) */}
              <div className="p-4 rounded-2xl bg-[#F7F8F9] border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between">
                    <span>eMAG Tavsiye Satış</span>
                    <div className="flex items-center gap-1 bg-blue-50 p-0.5 rounded-lg border border-blue-200">
                      <button
                        type="button"
                        onClick={() => setEmagTargetCountry('BG')}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer ${
                          emagTargetCountry === 'BG' ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-700 hover:text-blue-900'
                        }`}
                        title="eMAG Bulgaristan (emag.bg - BGN)"
                      >
                        🇧🇬 BG
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmagTargetCountry('RO')}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer ${
                          emagTargetCountry === 'RO' ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-700 hover:text-blue-900'
                        }`}
                        title="eMAG Romanya (emag.ro - RON)"
                      >
                        🇷🇴 RO
                      </button>
                    </div>
                  </div>
                  <div className="text-xl font-black text-[#14171A] font-mono mt-1">
                    {emagTargetCountry === 'BG' ? `${calculation.recommendedEmagPriceBgn} BGN (лв)` : `${calculation.recommendedEmagPriceRon} RON`}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-[#5D7079] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-400">TL Karşılığı:</span>
                    <strong className="text-blue-700">₺{calculation.recommendedEmagPriceTry} TL</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-slate-400">Pazar Yeri:</span>
                    <span className="font-bold text-slate-800">{emagTargetCountry === 'BG' ? 'emag.bg (Bulgaristan)' : 'emag.ro (Romanya)'}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-sans mt-0.5">eMAG (%16) ve Genius kargo dahil</div>
                </div>
              </div>

              {/* Card 4: Net Kâr (Adet Başı) */}
              <div className="p-4 rounded-2xl bg-[#9FE870]/25 border border-[#9FE870]/50 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] text-[#163300] font-black flex items-center justify-between">
                    <span>Net Kâr (Adet Başı)</span>
                    <span className="text-[10px] font-black bg-[#163300] text-[#9FE870] px-2 py-0.2 rounded-full">
                      %{calculation.roiPercent} ROI
                    </span>
                  </div>
                  <div className="text-xl font-black text-[#163300] font-mono mt-1">
                    +{calculation.netProfitPln} PLN
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#163300]/15 text-[11px] font-mono text-[#163300] space-y-0.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-sans text-[10px] opacity-80">Türk Lirası Kâr:</span>
                    <span>+₺{calculation.netProfitTry} TL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] opacity-80">USD & eMAG:</span>
                    <span>+${calculation.netProfitUsd} · +{calculation.netProfitRon} RON</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] opacity-80">Euro Kâr:</span>
                    <span>+{calculation.netProfitEur} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEDICATED INDIVIDUAL & SIMULTANEOUS CHANNEL PUBLISHING CARDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#14171A] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#163300]" />
                <span>Pazaryerlerine Aktarma Seçenekleri (Ayrı Ayrı veya Eş Zamanlı)</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Başlık: <strong className="text-slate-800">English (Global)</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option 1: Allegro Only */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">🇵🇱 Allegro</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                      {calculation.recommendedAllegroPricePln} PLN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Sadece Allegro REST API v2 üzerinden Polonya & Çekya pazarına canlı ilan açar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishToChannels(['allegro'])}
                  disabled={isPublishing}
                  className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Sadece Allegro'ya Aktar</span>
                </button>
              </div>

              {/* Option 2: eMAG Only */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700">
                      {emagTargetCountry === 'BG' ? '🇧🇬 eMAG Bulgaristan' : '🇷🇴 eMAG Romanya'}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                      {emagTargetCountry === 'BG' ? `${calculation.recommendedEmagPriceBgn} BGN` : `${calculation.recommendedEmagPriceRon} RON`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Sadece eMAG API v3 üzerinden {emagTargetCountry === 'BG' ? 'Bulgaristan (emag.bg)' : 'Romanya (emag.ro)'} pazarına canlı aktarır.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishToChannels(['emag'])}
                  disabled={isPublishing}
                  className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Sadece eMAG'a Aktar ({emagTargetCountry === 'BG' ? 'BGN' : 'RON'})</span>
                </button>
              </div>

              {/* Option 3: BaseLinker Only */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 transition-all flex flex-col justify-between shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700">⚡ BaseLinker Hub</span>
                    <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">
                      Envanter Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Merkezi BaseLinker envanterine kaydeder; stok ve sipariş otomasyonunu başlatır.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishToChannels(['baselinker'])}
                  disabled={isPublishing}
                  className="mt-3 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>BaseLinker'a Aktar</span>
                </button>
              </div>

              {/* Option 4: All Channels Simultaneously */}
              <div className="p-4 rounded-2xl bg-[#9FE870]/20 border border-[#9FE870]/60 flex flex-col justify-between shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#163300]">🌐 Tüm Kanallar (Full Sync)</span>
                    <span className="text-[10px] bg-[#163300] text-[#9FE870] px-2 py-0.5 rounded font-bold">
                      Önerilen
                    </span>
                  </div>
                  <p className="text-[11px] text-[#163300] leading-tight">
                    Allegro + eMAG + BaseLinker'a aynı anda canlı bağlanır ve tam senkronizasyon sağlar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishToChannels(['allegro', 'emag', 'baselinker'])}
                  disabled={isPublishing}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tümüne Canlı Aktar</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE API TRANSMISSION TERMINAL / PAYLOAD INSPECTION DRAWER */}
          {showLiveTerminal && (
            <div className="p-5 rounded-3xl bg-[#0F172A] text-slate-200 space-y-4 shadow-2xl border border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#9FE870]" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Canlı API İletim Terminali & Gerçek Veri Akışı</span>
                      {isPublishing ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Veri İletiliyor...</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Başarıyla İletildi (HTTP 200/201 OK)</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Gerçek Payload JSON iletimi ve sunucu yanıtları
                    </div>
                  </div>
                </div>

                {publishResult && (
                  <button
                    onClick={onNavigateToOffers}
                    className="px-4 py-2 rounded-full bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Teklifler Panelinde Gör</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Logs List with Expandable Payload Inspection */}
              {publishResult && (
                <div className="space-y-3 font-mono text-xs">
                  {publishResult.logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-800 bg-[#1E293B]/70 overflow-hidden"
                    >
                      <div
                        onClick={() => setExpandedLogIdx(expandedLogIdx === idx ? null : idx)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.channel === 'allegro' ? 'bg-amber-500/20 text-amber-300' :
                            log.channel === 'emag' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {log.channelName}
                          </span>
                          <span className="text-emerald-400 font-bold">HTTP {log.status}</span>
                          <span className="text-slate-300">{log.endpoint}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-[11px]">{log.durationMs}ms</span>
                          {expandedLogIdx === idx ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Real Payload Details */}
                      {expandedLogIdx === idx && (
                        <div className="p-4 border-t border-slate-800/80 bg-black/40 space-y-3">
                          <div className="text-[11px] text-emerald-400 font-sans font-semibold">
                            ✓ {log.message}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Gönderilen İstek (Request Payload):
                              </div>
                              <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] overflow-x-auto max-h-48 border border-slate-800/60">
                                {JSON.stringify(log.requestPayload, null, 2)}
                              </pre>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Sunucu Yanıtı (API Response Body):
                              </div>
                              <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 text-[11px] overflow-x-auto max-h-48 border border-slate-800/60">
                                {JSON.stringify(log.responsePayload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alternative Candidates if found */}
          {selectedProduct.candidateProducts && selectedProduct.candidateProducts.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-[#14171A] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#163300]" />
                <span>AliExpress'te Bulunan Diğer Canlı İlan Seçenekleri:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProduct.candidateProducts.map((cand, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectCandidate(cand)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#14171A] bg-white transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#14171A] truncate">{cand.titleEn}</div>
                      <div className="text-[11px] text-[#7D8F99]">{cand.supplierName || 'Alternatif Tedarikçi'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-[#14171A]">
                        ${formatPrice(cand.priceUsd)} USD (≈ ₺{formatPrice((cand.priceUsd || 10) * 39.6)} TL)
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Seç</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
