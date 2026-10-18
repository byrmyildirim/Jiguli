import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Eye,
  Key,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { ProductImage } from '../common/ProductImage';
import {
  SAMPLE_ALIEXPRESS_HOT_PRODUCTS,
  calculateSourcingProfit,
  publishAliExpressProductMultiChannel,
  searchAliExpressWithAI,
  adoptCandidateProduct,
  adoptSourcingMatch,
  generateClientPlatformMatches,
  SourcingCalculation,
  ChannelPublishResult
} from '../../services/aliExpressSourcing';
import {
  AliExpressMatchedProduct,
  AllegroOffer,
  AliExpressCandidateItem,
  SourcingProductMatch,
  SourcingPlatform
} from '../../types/allegro';

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
  const [selectedProduct, setSelectedProduct] = useState<AliExpressMatchedProduct & { directSearchUrl?: string }>(() => {
    const initial = SAMPLE_ALIEXPRESS_HOT_PRODUCTS[0];
    const fallbackData = generateClientPlatformMatches({
      searchTerm: initial.titleEn,
      chineseTerm: '无线车载吸尘器大吸力',
      baseTitle: initial.titleEn,
      basePriceUsd: initial.priceUsd,
      imageUrl: initial.primaryImage
    });
    return {
      ...initial,
      directSearchUrl: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(initial.titleEn)}`,
      platformMatches: initial.platformMatches || fallbackData.matches,
      platformDirectUrls: initial.platformDirectUrls || fallbackData.platformDirectUrls
    };
  });
  const [queryInput, setQueryInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [sourcingMode, setSourcingMode] = useState<'upload' | 'url'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStep, setScanningStep] = useState<string>('Görsel taranıyor...');
  const [marginPercent, setMarginPercent] = useState<number>(45);
  const [customStock, setCustomStock] = useState<number>(40);

  // Multi-platform sorting & filter state (1688, Taobao, Temu, Alibaba, AliExpress)
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | SourcingPlatform>('all');
  const [sortMatchesBy, setSortMatchesBy] = useState<'score_desc' | 'price_asc' | 'moq_asc' | 'speed'>('score_desc');
  const [copiedLinkUrl, setCopiedLinkUrl] = useState<string | null>(null);
  
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
    aiVisionActive?: boolean;
    quotaNotice?: string;
  } | null>(null);

  // Drag and Drop & AI Key Modal States
  const [isDragging, setIsDragging] = useState(false);
  const [aiConfig, setAiConfig] = useState<{ isConfigured: boolean; maskedKey: string; activeModel: string; activeProvider?: string } | null>(null);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load AI Configuration status
  const refreshAiConfig = async () => {
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      if (data.success) {
        setAiConfig(data);
      }
    } catch {}
  };

  useEffect(() => {
    refreshAiConfig();
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputApiKey.trim();
    if (!cleanKey) return;
    setIsSavingKey(true);
    setKeySaveMessage(null);
    try {
      const endpoint = cleanKey.startsWith('sk-') ? '/api/ai/qwen/config' : '/api/ai/config';
      const body = cleanKey.startsWith('sk-') ? { apiKey: cleanKey, model: 'qwen-vl-max' } : { apiKey: cleanKey };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('jiguli_qwen_api_key', cleanKey);
        localStorage.setItem('jiguli_gemini_api_key', cleanKey);
        setKeySaveMessage({ text: data.message || 'Yapay Zeka (AI) API Anahtarı başarıyla doğrulandı ve kaydedildi!' });
        await refreshAiConfig();
        setTimeout(() => {
          setShowAiKeyModal(false);
          setKeySaveMessage(null);
        }, 1300);
      } else {
        setKeySaveMessage({ text: data.message || 'API anahtarı doğrulanamadı.', error: true });
      }
    } catch (err: any) {
      setKeySaveMessage({ text: 'Bağlantı hatası: ' + err?.message, error: true });
    } finally {
      setIsSavingKey(false);
    }
  };

  // 1688 Clipboard Paste listener for instant screenshot & URL search (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      // 1. Check for clipboard image blob (screenshots, snips, copied photos)
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
              const dataUrl = reader.result as string;
              setUploadedPreview(dataUrl);
              setSourcingMode('upload');
              await executeLiveAliExpressSearch({
                imageBase64: dataUrl,
                mimeType: file.type || 'image/jpeg',
                queryText: '1688 图搜 (Panodan Yapıştırılan Görsel)'
              });
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }

      // 2. Check for pasted image URL or platform link
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (text && /^https?:\/\/.+/i.test(text)) {
        const isImg = /\.(jpg|jpeg|png|webp|avif|bmp|gif)(\?.*)?$/i.test(text) ||
          /alicdn\.com|1688\.com|taobao\.com|temu\.com|alibaba\.com|unsplash\.com/i.test(text);

        if (isImg) {
          setUploadedPreview(text);
          setImageUrlInput(text);
          setSourcingMode('url');
          executeLiveAliExpressSearch({
            imageUrl: text,
            queryText: `Direct Link: ${text}`
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Drop handler
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
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
    }
  };

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
    const fallbackData = generateClientPlatformMatches({
      searchTerm: prod.titleEn,
      baseTitle: prod.titleEn,
      basePriceUsd: prod.priceUsd,
      imageUrl: prod.primaryImage
    });
    setSelectedProduct({
      ...prod,
      directSearchUrl: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(prod.titleEn)}`,
      platformMatches: prod.platformMatches || fallbackData.matches,
      platformDirectUrls: prod.platformDirectUrls || fallbackData.platformDirectUrls
    });
    setUploadedPreview(null);
    setImageUrlInput('');
    setPublishResult(null);
    setShowLiveTerminal(false);
    setSearchMetadata({
      queries: [`Multi-platform search: ${prod.titleEn}`],
      sources: [prod.sourceUrl],
      detectedQuery: prod.titleEn
    });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkUrl(url);
    setTimeout(() => setCopiedLinkUrl(null), 2000);
  };

  const handleSelectSourcingMatch = (match: SourcingProductMatch) => {
    const updated = adoptSourcingMatch(selectedProduct, match);
    setSelectedProduct(updated);
    setPublishResult(null);
    setShowLiveTerminal(false);
  };

  // Filtered & Sorted Multi-Platform Matches (1688, Taobao, Temu, Alibaba, AliExpress)
  const currentPlatformMatches: SourcingProductMatch[] = useMemo(() => {
    let list = Array.isArray(selectedProduct.platformMatches) && selectedProduct.platformMatches.length > 0
      ? selectedProduct.platformMatches
      : generateClientPlatformMatches({
          searchTerm: selectedProduct.titleEn,
          baseTitle: selectedProduct.titleEn,
          basePriceUsd: selectedProduct.priceUsd,
          imageUrl: selectedProduct.primaryImage
        }).matches;

    if (selectedPlatformFilter !== 'all') {
      list = list.filter(m => m.platform === selectedPlatformFilter);
    }

    return [...list].sort((a, b) => {
      if (sortMatchesBy === 'price_asc') {
        return a.priceUsd - b.priceUsd;
      }
      if (sortMatchesBy === 'score_desc') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortMatchesBy === 'moq_asc') {
        return (a.moq || 1) - (b.moq || 1);
      }
      if (sortMatchesBy === 'speed') {
        return (a.shippingEstimateUsd || 0) - (b.shippingEstimateUsd || 0);
      }
      return 0;
    });
  }, [selectedProduct, selectedPlatformFilter, sortMatchesBy]);

  const activeDirectUrls = useMemo(() => {
    return selectedProduct.platformDirectUrls || generateClientPlatformMatches({
      searchTerm: selectedProduct.titleEn,
      baseTitle: selectedProduct.titleEn,
      basePriceUsd: selectedProduct.priceUsd,
      imageUrl: selectedProduct.primaryImage
    }).platformDirectUrls;
  }, [selectedProduct]);

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

    setScanningStep('Görsel Alibaba Qwen VL / Vision AI ile analiz ediliyor...');
    const stepTimer1 = setTimeout(() => {
      setScanningStep('AliExpress pazarında canlı ilanlar ve tedarikçiler taranıyor...');
    }, 800);

    const stepTimer2 = setTimeout(() => {
      setScanningStep('İngilizce/Lehçe ürün kataloğu ve fiyatlandırma verisi hazırlanıyor...');
    }, 1600);

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
              Qwen VL Vision & Live AI
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

      {/* AI Vision Status & API Key Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50 to-emerald-50/50 border border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${aiConfig?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <div>
            <div className="text-xs font-bold text-[#14171A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{aiConfig?.isConfigured ? `Alibaba Qwen / ${aiConfig.activeModel} AI Vision Aktif` : 'Alibaba Qwen VL AI Standby (Akıllı Eşleme Devrede)'}</span>
            </div>
            <div className="text-[11px] text-[#5D7079]">
              {aiConfig?.isConfigured
                ? `Motor: ${aiConfig.activeProvider === 'qwen' ? 'Alibaba Qwen' : 'Google Gemini'} (${aiConfig.activeModel}) • Anahtar: ${aiConfig.maskedKey}`
                : 'Alibaba Qwen veya Google Gemini API anahtarınızı tanımlayarak fotoğrafları yapay zeka ile %100 doğrulukla analiz edin.'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setInputApiKey('');
            setKeySaveMessage(null);
            setShowAiKeyModal(true);
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#14171A] border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Key className="w-3.5 h-3.5 text-emerald-600" />
          <span>{aiConfig?.isConfigured ? 'Anahtarı Değiştir' : 'API Anahtarı Ekle'}</span>
        </button>
      </div>

      {/* 1688 Authentic Visual Search (图搜) Sourcing Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setSourcingMode('upload')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              sourcingMode === 'upload'
                ? 'bg-[#FF5A00] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>1688 Görsel Arama (图搜 · Ctrl+V)</span>
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
          <div className="search-image-upload-container rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-5">
            {/* 1688 Drop & Button Area */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all block ${
                isDragging
                  ? 'border-[#FF5A00] bg-orange-50/70 scale-[1.01]'
                  : 'border-slate-200 hover:border-[#FF5A00] bg-[#FAFBFC] hover:bg-orange-50/20'
              }`}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.bmp,.webp"
                onChange={handleFileUpload}
                className="hidden image-file-reader-wrapper"
              />
              {uploadedPreview ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative">
                    <img
                      src={uploadedPreview}
                      alt="1688 Yüklenen Görsel"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF5A00] shadow-sm"
                    />
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-[#FF5A00] text-white text-[9px] font-bold">
                      1688 图搜
                    </span>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-sm font-bold text-[#14171A] flex items-center gap-1.5 justify-center sm:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Görsel Yüklendi ve 1688 Fabrika Ağı Taranıyor</span>
                    </div>
                    <div className="text-xs text-[#5D7079] mt-0.5">
                      Farklı bir görsel seçmek veya sürüklemek için tıklayın · Panodan yapıştırmak için <strong>Ctrl+V</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 text-[#FF5A00] flex items-center justify-center border border-orange-500/20">
                    <Camera className="w-7 h-7 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-base font-black text-[#14171A] flex items-center justify-center gap-2">
                      <span>1688 Görsel Arama</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FF5A00] text-white text-[10px] font-bold uppercase tracking-wider">
                        图搜
                      </span>
                    </div>
                    <div className="text-xs text-[#5D7079] mt-1">
                      Yerelinizden resim yüklemek veya sürükleyip bırakmak için tıklayın
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600 font-mono">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hızlı Arama: Panodan yapıştırmak için <strong>Ctrl + V</strong></span>
                  </div>
                </div>
              )}
            </label>

            {/* 1688 Authentic Tip Container */}
            <div className="tip-container p-4 sm:p-5 rounded-2xl bg-orange-50/60 border border-orange-200/80 text-xs text-orange-950 space-y-2.5">
              <div className="tip-title font-bold text-orange-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Aşağıdaki görüntüyü kullanarak aynı stil ürünleri için fiyat karşılaştırma yöntemini destekliyoruz.</span>
              </div>
              <div className="space-y-1.5 text-[11.5px] text-orange-900/90 pl-1">
                <div className="tip-warp flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] shrink-0" />
                  <div className="tip-text">1. Yerelinden resim yüklemek için tıklayın (.jpg, .jpeg, .png, .bmp, .webp)</div>
                </div>
                <div className="tip-warp flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] shrink-0" />
                  <div className="tip-text">2. Hızlı arama için bir resim veya resim bağlantısı yapıştırmak için <strong>Ctrl + V</strong> tuşlarını kullanın.</div>
                </div>
                <div className="tip-warp flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] shrink-0" />
                  <div className="tip-text flex items-center gap-2 flex-wrap">
                    <span>3. Web üzerinde 1688, Taobao, Temu, Alibaba ve AliExpress eşleşen ürün ve doğrudan fabrika linklerini sıralayın.</span>
                    <a
                      className="tip-link text-[#FF5A00] hover:text-[#e04f00] font-bold underline ml-1"
                      href={`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(selectedProduct.titleEn || 'wholesale')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      1688'de Doğrudan Ara ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

          {/* Unique/Custom Product Sourcing Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5 text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Görsel Arama ve Çoklu Platform Tedarik Analizi (1688, Taobao, Temu, Alibaba & AliExpress)</span>
            </div>
            <p className="text-[11.5px] text-amber-900/90 leading-relaxed">
              Yüklediğiniz görsel; <strong>1688</strong> (Çin Fabrika Toptan B2B), <strong>Taobao</strong> (Üretici Mağazaları), <strong>Temu</strong> (Global Perakende), <strong>Alibaba</strong> (Uluslararası B2B OEM) ve <strong>AliExpress</strong> üzerinde taranarak eşleşen ürünler, fabrika maliyetleri ve doğrudan linklerle aşağıda listelenmiştir. İstediğiniz platformdaki ürünü <strong>"Kaynak Olarak Seç"</strong> butonuyla seçip maliyet hesabını anında güncelleyebilirsiniz.
            </p>
          </div>

          {/* 1688, TAOBAO, TEMU, ALIBABA & ALIEXPRESS MULTI-PLATFORM SOURCING SECTION */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#14171A] tracking-tight flex items-center gap-2">
                    <span>Eşleşen Ürün Linkleri & Toptan Fabrika Kaynakları</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {currentPlatformMatches.length} Eşleşen Ürün
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-[#5D7079]">
                  1688, Taobao, Temu, Alibaba ve AliExpress üzerinden eşleşen gerçek ürün bağlantıları, birim maliyetleri ve minimum sipariş adetleri.
                </p>
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500">Sırala:</span>
                <select
                  value={sortMatchesBy}
                  onChange={(e) => setSortMatchesBy(e.target.value as any)}
                  className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="score_desc">⚡ En Yüksek Eşleşme Skoru (%)</option>
                  <option value="price_asc">💰 En Düşük Fiyat ($ / ₺)</option>
                  <option value="moq_asc">📦 En Düşük Minimum Sipariş (MOQ)</option>
                  <option value="speed">🚀 En Düşük Kargo Maliyeti</option>
                </select>
              </div>
            </div>

            {/* Fast Direct Image/Search Platform Links Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Platformlarda Doğrudan Canlı Arama:</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={activeDirectUrls['1688']}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-orange-200 text-[#FF6000] font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105"
                >
                  <span>🇨🇳 1688 Fabrika</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={activeDirectUrls['taobao']}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-amber-200 text-[#FF5000] font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105"
                >
                  <span>🇨🇳 Taobao Mağaza</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={activeDirectUrls['temu']}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-slate-200 text-slate-800 font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105"
                >
                  <span>🛍️ Temu Global</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={activeDirectUrls['alibaba']}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-amber-300 text-[#E05300] font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105"
                >
                  <span>🌐 Alibaba B2B</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={activeDirectUrls['aliexpress']}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-red-50 border border-red-200 text-[#E62E04] font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105"
                >
                  <span>📦 AliExpress</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Platform Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedPlatformFilter === 'all'
                    ? 'bg-[#14171A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Tüm Platformlar
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('1688')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedPlatformFilter === '1688'
                    ? 'bg-[#FF6000] text-white shadow-xs'
                    : 'bg-orange-50 text-[#FF6000] hover:bg-orange-100'
                }`}
              >
                <span>🇨🇳 1688 (Toptan Fabrika)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('taobao')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedPlatformFilter === 'taobao'
                    ? 'bg-[#FF5000] text-white shadow-xs'
                    : 'bg-amber-50 text-[#FF5000] hover:bg-amber-100'
                }`}
              >
                <span>🇨🇳 Taobao (Doğrudan Üretici)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('temu')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedPlatformFilter === 'temu'
                    ? 'bg-[#FB7701] text-white shadow-xs'
                    : 'bg-orange-50 text-[#D85A00] hover:bg-orange-100'
                }`}
              >
                <span>🛍️ Temu (Tüketici Sevkiyatı)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('alibaba')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedPlatformFilter === 'alibaba'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-amber-50 text-[#E05300] hover:bg-amber-100'
                }`}
              >
                <span>🌐 Alibaba (OEM / B2B)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('aliexpress')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedPlatformFilter === 'aliexpress'
                    ? 'bg-[#E62E04] text-white shadow-xs'
                    : 'bg-red-50 text-[#E62E04] hover:bg-red-100'
                }`}
              >
                <span>📦 AliExpress (Choice / Perakende)</span>
              </button>
            </div>

            {/* Sourcing Products Sorted List */}
            <div className="space-y-3">
              {currentPlatformMatches.map((match) => {
                const isCurrentlySelected = selectedProduct.sourceUrl === match.sourceUrl || (selectedProduct.supplierName.includes(match.platform.toUpperCase()) && Math.abs(selectedProduct.priceUsd - match.priceUsd) < 0.1);
                
                const badgeStyle = match.platform === '1688'
                  ? { bg: 'bg-[#FF6000]/10', text: 'text-[#FF6000]', border: 'border-[#FF6000]/30', label: '1688 Fabrika Toptan' }
                  : match.platform === 'taobao'
                  ? { bg: 'bg-[#FF5000]/10', text: 'text-[#FF5000]', border: 'border-[#FF5000]/30', label: 'Taobao Doğrudan Üretici' }
                  : match.platform === 'temu'
                  ? { bg: 'bg-[#FB7701]/10', text: 'text-[#D85A00]', border: 'border-[#FB7701]/30', label: 'Temu Global Perakende' }
                  : match.platform === 'alibaba'
                  ? { bg: 'bg-[#FF6A00]/10', text: 'text-[#E05300]', border: 'border-[#FF6A00]/30', label: 'Alibaba OEM/ODM B2B' }
                  : { bg: 'bg-[#E62E04]/10', text: 'text-[#E62E04]', border: 'border-[#E62E04]/30', label: 'AliExpress Choice' };

                return (
                  <div
                    key={match.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                      isCurrentlySelected
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Left Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {match.imageUrl || selectedProduct.primaryImage ? (
                          <img
                            src={match.imageUrl || selectedProduct.primaryImage}
                            alt={match.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                            {badgeStyle.label}
                          </span>

                          {match.matchScore && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>%{match.matchScore} Eşleşme</span>
                            </span>
                          )}

                          {match.verifiedSupplier && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              <span>Doğrulanmış Tedarikçi</span>
                            </span>
                          )}

                          {match.moq && (
                            <span className="text-[11px] font-mono text-slate-500">
                              MOQ: <strong className="text-slate-800">{match.moq} Adet</strong>
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-[#14171A] line-clamp-2">
                          {match.title}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#5D7079] flex-wrap">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Store className="w-3 h-3 text-slate-500" />
                            {match.supplierName}
                          </span>
                          {match.supplierRating && (
                            <span className="text-amber-600 font-bold">★ {match.supplierRating}</span>
                          )}
                          {match.location && <span>• {match.location}</span>}
                          {match.deliveryDays && <span>• 🚚 {match.deliveryDays}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="font-mono font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                          <span>${formatPrice(match.priceUsd)} USD</span>
                          <span className="text-xs font-normal text-slate-500">
                            (≈ ₺{formatPrice(match.priceUsd * 39.6)} TL)
                          </span>
                        </div>
                        {match.priceLocal && match.priceLocal.currency === 'CNY' && (
                          <div className="text-[11px] font-mono text-orange-600 font-bold">
                            ¥{match.priceLocal.amount} CNY Fabrika Çıkışı
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(match.sourceUrl)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ürün Linkini Kopyala"
                        >
                          {copiedLinkUrl === match.sourceUrl ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Kopyalandı!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>

                        <a
                          href={match.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Doğrudan Ürün Linkine Git"
                        >
                          <span>Ürünü Aç</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleSelectSourcingMatch(match)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            isCurrentlySelected
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-[#14171A] hover:bg-black text-white active:scale-95'
                          }`}
                        >
                          {isCurrentlySelected ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Aktif Kaynak</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-[#9FE870]" />
                              <span>Kaynak Olarak Seç</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Qwen / Gemini AI Key Setup Modal */}
      {showAiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#14171A]">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Yapay Zeka (AI) Görsel Motoru Kurulumu</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiKeyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#5D7079] leading-relaxed space-y-2">
              <p>
                Görselleri fotoğraf veya ekran görüntüsüyle %100 doğrulukla aramak ve AliExpress ile eşleştirmek için Alibaba Qwen veya Google Gemini API anahtarı gereklidir.
              </p>
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-[11px] space-y-2">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Desteklenen API Anahtarları:</span>
                </div>
                <div className="space-y-1">
                  <div>• <strong>Alibaba Qwen API Key:</strong> DashScope console (sk-...)</div>
                  <div>• <strong>Google Gemini API Key:</strong> AI Studio (AIzaSy...)</div>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-emerald-200/60">
                  <a
                    href="https://dashscope.console.aliyun.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 underline inline-flex items-center gap-1 hover:text-emerald-800"
                  >
                    <span>Qwen Key Al</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-300">•</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 underline inline-flex items-center gap-1 hover:text-emerald-800"
                  >
                    <span>Gemini Key Al</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#14171A] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>Alibaba Qwen / Gemini API Key:</span>
                </label>
                <input
                  type="password"
                  required
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder="sk-... veya AIzaSy... anahtarınızı girin"
                  className="w-full bg-[#FAFBFC] border border-slate-200 rounded-2xl px-4 py-3 text-xs text-[#14171A] focus:outline-none focus:ring-2 focus:ring-[#14171A] font-mono"
                />
              </div>

              {keySaveMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  keySaveMessage.error ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  {keySaveMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiKeyModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey || !inputApiKey.trim()}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#14171A] hover:bg-black text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {isSavingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSavingKey ? 'Doğrulanıyor...' : 'Doğrula & Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
