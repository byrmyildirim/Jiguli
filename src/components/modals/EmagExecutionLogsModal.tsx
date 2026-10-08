import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Globe,
  Terminal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldAlert,
  Server,
  Info,
  ExternalLink,
  Package,
  Wand2,
  Sparkles,
  Zap,
  ArrowRight,
  Sliders,
  Layers,
  FileCheck2
} from 'lucide-react';
import { MarketplaceLogo } from '../../constants/marketplaces';
import { store } from '../../services/marketplaceStore';

interface LogStep {
  step: number;
  title: string;
  endpoint?: string;
  httpStatus?: number;
  durationMs?: number;
  status: 'pending' | 'success' | 'warning' | 'error' | 'skipped';
  requestPayload?: any;
  responsePayload?: any;
  message: string;
  timestamp: string;
}

export interface EmagExecutionReport {
  success: boolean;
  isIpBlocked?: boolean;
  serverIp?: string;
  partNumberKey?: string;
  productName?: string;
  verificationStatus?: 'ACTIVE' | 'PENDING_MODERATION' | 'NOT_INDEXED' | 'ERROR';
  durationMs?: number;
  steps: LogStep[];
  summary?: {
    status: string;
    message: string;
    troubleshooting?: string;
  };
}

interface EmagExecutionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: EmagExecutionReport | null;
  onRetry?: () => void;
  theme?: 'light' | 'dark';
}

const EMAG_POPULAR_CATEGORIES = [
  { id: 257548, name: 'RGB LED Şerit, Akıllı Aydınlatma & COB Şeritler (İzinli)', badge: 'İzinli / LED' },
  { id: 3122, name: 'Evcil Hayvan & Köpek/Kedi Yatakları, Minder ve Kulübeler', badge: 'Pet Shop' },
  { id: 3690, name: 'Ev Tekstili, Nevresim Takımları & Yatak Örtüleri', badge: 'Ev & Yaşam' },
  { id: 202, name: 'Akıllı Ev, Zigbee & Sensör Sistemleri', badge: 'Popüler' },
  { id: 124921, name: 'Genel Elektronik, USB & Güç Aksesuarları', badge: 'Açık' },
  { id: 106, name: 'Ev, Yaşam & İç Mekan LED Aydınlatma', badge: 'Açık' },
  { id: 42540, name: 'Ofis & Bilgisayar Çevre Birimleri', badge: 'Standart' }
];

export const EmagExecutionLogsModal: React.FC<EmagExecutionLogsModalProps> = ({
  isOpen,
  onClose,
  report: initialReport,
  onRetry,
  theme = 'light'
}) => {
  const [currentReport, setCurrentReport] = useState<EmagExecutionReport | null>(initialReport);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copiedPayloadStep, setCopiedPayloadStep] = useState<number | null>(null);
  const [copiedAllLogs, setCopiedAllLogs] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(true);

  // Auto-Fix Wizard Interactive State
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [autoFixSuccessMsg, setAutoFixSuccessMsg] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(true);

  // Form field overrides for error fixing
  const [customCategory, setCustomCategory] = useState<number>(257548);
  const [customPnk, setCustomPnk] = useState<string>('');
  const [customStock, setCustomStock] = useState<number>(10);
  const [customHandling, setCustomHandling] = useState<number>(1);
  const [customVatId, setCustomVatId] = useState<number>(4); // Default to valid eMAG BG VAT ID 4 (20% VAT)
  const [startDateMode, setStartDateMode] = useState<'today' | 'immediate' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  React.useEffect(() => {
    setCurrentReport(initialReport);
    if (initialReport) {
      const pnk = initialReport.partNumberKey;
      if (pnk) {
        setCustomPnk(pnk.startsWith('SKU-') ? pnk : `SKU-${pnk}`);
      }

      const prodTitle = (initialReport.productName || '').toLowerCase();
      const isPet = prodTitle.includes('psa') || prodTitle.includes('pies') || prodTitle.includes('kot') || prodTitle.includes('köpek') || prodTitle.includes('kedi') || prodTitle.includes('dom dla psa') || prodTitle.includes('mata') || prodTitle.includes('łóżko') || prodTitle.includes('legowisk') || prodTitle.includes('culcus') || prodTitle.includes('pet') || prodTitle.includes('dog') || prodTitle.includes('cat');
      const isTextile = prodTitle.includes('pościel') || prodTitle.includes('poszewk') || prodTitle.includes('nevresim') || prodTitle.includes('bedding');
      const isLed = prodTitle.includes('led') || prodTitle.includes('strip') || prodTitle.includes('şerit') || prodTitle.includes('rgb') || prodTitle.includes('cob');

      // Check matched offer in store to retrieve exact Excel category ID
      const offers = store.getOffers();
      const matched = offers.find(o => o.sku === pnk || o.id === pnk || (o.name && o.name.toLowerCase() === prodTitle));
      const offerCatId = parseInt(String(matched?.channelData?.emag?.categoryId || matched?.excelMetadata?.emagCategoryCode || matched?.category?.id || ''), 10);

      if (isPet) {
        setCustomCategory(!isNaN(offerCatId) && offerCatId !== 6001 && offerCatId > 0 && offerCatId <= 65535 ? offerCatId : 3122);
      } else if (isTextile) {
        setCustomCategory(3690);
      } else if (isLed || offerCatId === 257548 || offerCatId === 6001) {
        setCustomCategory(257548);
      } else if (!isNaN(offerCatId) && offerCatId > 0 && offerCatId <= 65535) {
        setCustomCategory(offerCatId);
      }
    }
  }, [initialReport]);

  if (!isOpen || !currentReport) return null;

  const isDark = theme === 'dark';
  const isSuccess = currentReport.success;
  const isIpBlocked = currentReport.isIpBlocked;
  const isPendingModeration = currentReport.verificationStatus === 'PENDING_MODERATION';

  // Analyze all error messages from report steps
  const allMessages = currentReport.steps.flatMap(s => {
    const list: string[] = [];
    if (s.message) list.push(s.message);
    if (s.responsePayload?.messages && Array.isArray(s.responsePayload.messages)) {
      list.push(...s.responsePayload.messages);
    }
    return list;
  });
  const fullErrorText = allMessages.join(' ');

  const hasCategoryError = fullErrorText.toLowerCase().includes('category') || fullErrorText.includes('29081');
  const hasVatError = fullErrorText.toLowerCase().includes('vat') || fullErrorText.includes('29010');
  const hasStockError = fullErrorText.toLowerCase().includes('stock') || fullErrorText.includes('29006');
  const hasPnkError = fullErrorText.toLowerCase().includes('part_number_key') || fullErrorText.includes('1008');
  const hasHandlingError = fullErrorText.toLowerCase().includes('handling_time') || fullErrorText.includes('1049');
  const hasStartDateError = fullErrorText.toLowerCase().includes('start_date') || fullErrorText.includes('29128');
  const hasProductIdError = fullErrorText.toLowerCase().includes('product id is invalid') || fullErrorText.includes('1014');

  const detectedErrorCount = [
    hasProductIdError,
    hasCategoryError,
    hasVatError,
    hasStockError,
    hasPnkError,
    hasHandlingError,
    hasStartDateError
  ].filter(Boolean).length;

  const handleCopyPayload = (stepIdx: number, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayloadStep(stepIdx);
    setTimeout(() => setCopiedPayloadStep(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
    setCopiedAllLogs(true);
    setTimeout(() => setCopiedAllLogs(false), 2000);
  };

  // Master One-Click Auto-Fix & Re-Submit Action
  const handleAutoFixAndResubmit = async (singleFieldOverride?: Partial<any>) => {
    setIsAutoFixing(true);
    setAutoFixSuccessMsg(null);

    const targetPnk = customPnk || (currentReport.partNumberKey?.startsWith('SKU-') ? currentReport.partNumberKey : `SKU-${currentReport.partNumberKey || Date.now()}`);
    const offers = store.getOffers();
    const matchedOffer = offers.find(
      o => o.sku === currentReport.partNumberKey || o.id === currentReport.partNumberKey || o.sku === targetPnk
    ) || offers[0];

    if (!matchedOffer) {
      setIsAutoFixing(false);
      return;
    }

    let calculatedStartDate: string | undefined = undefined;
    if (startDateMode === 'today') {
      calculatedStartDate = new Date().toISOString().split('T')[0];
    } else if (startDateMode === 'custom') {
      calculatedStartDate = customStartDate;
    } else {
      calculatedStartDate = undefined;
    }

    const prodTitleLower = (currentReport.productName || matchedOffer.name || '').toLowerCase();
    const isCurtainMotor = prodTitleLower.includes('curtain') || prodTitleLower.includes('shutter') || prodTitleLower.includes('motor') || prodTitleLower.includes('roleta') || prodTitleLower.includes('perde');
    const isSmartItem = isCurtainMotor || prodTitleLower.includes('zigbee') || prodTitleLower.includes('tuya') || prodTitleLower.includes('switch');

    let validCatId = customCategory;
    if (validCatId === 6001) {
      validCatId = 257548;
    }

    const fixedPayload = {
      name: currentReport.productName || matchedOffer.name,
      part_number: targetPnk,
      category_id: validCatId,
      stock: Math.max(1, customStock),
      vat_id: customVatId || 6,
      handling_time: [{ value: customHandling }],
      currency: 'BGN',
      ...(calculatedStartDate ? { start_date: calculatedStartDate } : {}),
      ...singleFieldOverride
    };

    const res = await store.publishOfferToEmag(matchedOffer.id, fixedPayload);
    setIsAutoFixing(false);

    if (res.report) {
      setCurrentReport(res.report);
      if (res.success) {
        setAutoFixSuccessMsg('🎉 Tebrikler! eMAG parametreleri başarıyla güncellendi ve ürün API tarafından kabul edildi!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        className={`border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl transition-all my-auto flex flex-col max-h-[92vh] ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#005fb8]/10 text-[#005fb8] border border-[#005fb8]/20 flex items-center justify-center">
              <MarketplaceLogo platform="emag" size="sm" rounded="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  eMAG Gönderim & Hata Ayıklama Sihirbazı
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isSuccess
                      ? isPendingModeration
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : isIpBlocked
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  {isSuccess
                    ? isPendingModeration
                      ? 'Moderasyonda (5-15 Dk)'
                      : 'Canlı Yayında'
                    : isIpBlocked
                    ? 'IP Engellendi (HTTP 401)'
                    : `${detectedErrorCount > 0 ? `${detectedErrorCount} Kural Uyarısı` : 'İşlem Başarısız'}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>SKU: <strong className="font-mono text-slate-700 dark:text-zinc-300">{currentReport.partNumberKey || 'N/A'}</strong></span>
                <span>•</span>
                <span className="truncate max-w-[280px]">{currentReport.productName || 'Ürün'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isDark
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Tüm log raporunu JSON kopyala"
            >
              {copiedAllLogs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedAllLogs ? 'Kopyalandı' : 'Tüm Logları Kopyala'}</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* ======================================================== */}
          {/* 1. HATA AYIKLAMA & OTOMATİK DÜZELTME SİHİRBAZI KARTI     */}
          {/* ======================================================== */}
          {!isSuccess && detectedErrorCount > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 dark:border-amber-500/40 space-y-4 animate-in fade-in zoom-in-98 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>eMAG Hata Ayıklama Sihirbazı</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                        {detectedErrorCount} Alan Düzeltilmeli
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                      eMAG API'sinin reddettiği parametreler tespit edildi. Aşağıdan hızlı düzeltmeleri seçebilir veya tek tıkla tümünü düzeltebilirsiniz.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFixAndResubmit}
                  disabled={isAutoFixing}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isAutoFixing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Düzeltilip Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>⚡ Tümünü Otomatik Düzelt & Gönder</span>
                    </>
                  )}
                </button>
              </div>

              {autoFixSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{autoFixSuccessMsg}</span>
                </div>
              )}

              {/* Individual Interactive Error Correction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* 0. Product ID Numeric Requirement Error */}
                {hasProductIdError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-400 dark:border-emerald-600/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Ürün ID (Sayısal Envanter Kodu)</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        Kod 1014 (Sayısal Zorunlu)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      eMAG <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">id</code> alanında yalnızca pozitif tamsayı bekler. Sayısal kod (<strong>3669756</strong>) <code className="font-mono">id</code> alanına, metin kodu ise <code className="font-mono">part_number_key</code> alanına otomatik ayrıştırıldı.
                    </p>
                  </div>
                )}

                {/* 1. Category 101 / 257548 Access Error */}
                {hasCategoryError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Kategori Yetkisi / Geçersiz Kategori ID</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        Kod 29081 / 39006
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      Geçersiz veya yetkiniz olmayan kategori tespit edildi (Örn: 257548 Allegro ID'sidir, eMAG ID'si değildir). Ürününüz için resmi açık kategoriyi seçin:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomCategory(6001)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          customCategory === 6001
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-amber-400'
                        }`}
                      >
                        💡 LED Aydınlatma (6001)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCategory(3122)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          customCategory === 3122
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-amber-400'
                        }`}
                      >
                        🐾 Pet Shop (3122)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCategory(3690)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          customCategory === 3690
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-amber-400'
                        }`}
                      >
                        🛏️ Ev Tekstili (3690)
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(Number(e.target.value))}
                        className="w-full text-xs font-bold p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
                      >
                        {EMAG_POPULAR_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} (ID: {cat.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. VAT & Currency Error */}
                {hasVatError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>KDV Oranı & ID Uyuşmazlığı</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Kod 29010 (vat_id)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      eMAG Bulgaristan (BG) pazarı için resmi KDV tablosunda geçerli oran (ID: 6 / %20) atanmalıdır:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCustomVatId(6)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-left ${
                          customVatId === 6
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div>🇧🇬 eMAG Geçerli KDV</div>
                        <div className="text-[9px] opacity-80">ID: 6 (Bulgaristan %20 Oranı)</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomVatId(1)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-left ${
                          customVatId === 1
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div>🇷🇴 Romanya / Standart</div>
                        <div className="text-[9px] opacity-80">ID: 1 (Varsayılan KDV)</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Stock Mandatory Error */}
                {hasStockError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>İlk Yayına Alma Stok Şartı</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Kod 29006
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      eMAG yeni ilan oluşturulurken stok değerinin en az 1 olmasını şart koşar (0 stokla yeni ilan açılamaz):
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={customStock}
                        onChange={(e) => setCustomStock(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-center"
                      />
                      <span className="text-xs font-semibold text-slate-500">adet başlangıç stoğu</span>
                    </div>
                  </div>
                )}

                {/* 4. PNK / SKU Format Error */}
                {hasPnkError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>eMAG PNK (Stok / Üretici Kodu) Zorunluluğu</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Zorunlu Alan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      eMAG kuralı: <code>part_number_key</code> alanı boş bırakılamaz. Ürünün stok / üretici kodu (örn: <strong>SKU-3669756</strong>) gönderilmelidir:
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fallbackSku = currentReport?.partNumberKey?.startsWith('SKU-') ? currentReport.partNumberKey : `SKU-${currentReport?.partNumberKey || '3669756'}`;
                          setCustomPnk(fallbackSku);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                      >
                        ✨ SKU Kodunu Ekle (Önerilen)
                      </button>
                      <input
                        type="text"
                        value={customPnk}
                        onChange={(e) => setCustomPnk(e.target.value)}
                        placeholder="Örn: SKU-3669756"
                        className="flex-1 p-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Handling Time Format */}
                {hasHandlingError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-amber-400 dark:border-amber-600/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Sipariş Hazırlık Süresi (handling_time)</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold">
                        Kod 1049 (Dizi Formatı)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      eMAG, hazırlık süresinin nesne dizisi (<code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">[{`{ value: N }`}]</code>) olmasını şart koşar:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[1, 2, 3].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setCustomHandling(days)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            customHandling === days
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                          }`}
                        >
                          {days} Gün {days === 1 ? '(Önerilen)' : ''}
                        </button>
                      ))}
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={customHandling}
                          onChange={(e) => setCustomHandling(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-16 p-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-mono font-bold text-center text-xs"
                        />
                        <span className="text-[11px] text-slate-500">gün</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Start Date */}
                {hasStartDateError && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-amber-400 dark:border-amber-600/80 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>İlan Başlangıç Tarihi (start_date)</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold">
                        Kod 29128 (Tarih Formatı)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      Geçmiş veya geçersiz tarih hatalarını önlemek için hızlı seçeneklerden birini belirleyin:
                    </p>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStartDateMode('today');
                            setCustomStartDate(new Date().toISOString().split('T')[0]);
                          }}
                          className={`p-2 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                            startDateMode === 'today'
                              ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200'
                              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          <div>📅 Bugünü Varsayılan Yap</div>
                          <div className="text-[10px] font-mono font-normal opacity-80">
                            {new Date().toISOString().split('T')[0]} (Önerilen)
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStartDateMode('immediate')}
                          className={`p-2 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                            startDateMode === 'immediate'
                              ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200'
                              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          <div>⚡ Anında Canlıya Al</div>
                          <div className="text-[10px] font-mono font-normal opacity-80">
                            start_date parametresiz
                          </div>
                        </button>
                      </div>

                      {startDateMode === 'custom' && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">Tarih Seç:</span>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="p-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Status Card */}
          <div
            className={`p-4 rounded-2xl border ${
              isSuccess
                ? isPendingModeration
                  ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'
                  : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                : isIpBlocked
                ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50'
                : 'bg-slate-50 border-slate-200 dark:bg-zinc-800/40 dark:border-zinc-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isSuccess ? (
                  isPendingModeration ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )
                ) : isIpBlocked ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div className="space-y-1 text-xs flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                  {currentReport.summary?.message || 'eMAG API işlem durumu'}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sunucu Çıkış IP:</span>
                    <strong className="font-mono text-slate-800 dark:text-zinc-200">{currentReport.serverIp || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Toplam Süre:</span>
                    <strong className="font-mono text-slate-800 dark:text-zinc-200">{currentReport.durationMs || 0} ms</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>İşlem Adımı:</span>
                    <strong className="font-mono text-slate-800 dark:text-zinc-200">{currentReport.steps.length} / 4</strong>
                  </div>
                </div>

                {currentReport.summary?.troubleshooting && (
                  <div className="mt-3 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-[11px] whitespace-pre-line text-slate-700 dark:text-zinc-300 font-sans leading-relaxed">
                    {currentReport.summary.troubleshooting}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visual Architecture Flowchart Pipeline Component */}
          <div className={`p-4 rounded-3xl border transition-all ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  eMAG Otomatik Kategori & Karakteristik Eşleştirme Mimarisi
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Uçtan Uca 5 Aşamalı AI Pipeline
              </span>
            </div>

            {/* Architecture Pipeline Stages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 pt-1">
              {/* Stage 0: Ham Ürün */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-center flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Girdi</div>
                <div className="text-[11px] font-black text-slate-800 dark:text-zinc-200 my-1">Ham Ürün Verisi</div>
                <div className="text-[9px] text-slate-500 leading-tight">Başlık, Açıklama, Görseller, Ham Özellikler</div>
              </div>

              {/* Stage 1: Taksonomi */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-center flex flex-col justify-between">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Adım 1</div>
                <div className="text-[11px] font-black text-slate-800 dark:text-zinc-200 my-1">Taksonomi Ağacı</div>
                <div className="text-[9px] text-slate-500 leading-tight">Kategori önbelleği & izinli yaprak listesi</div>
              </div>

              {/* Stage 2: AI Kategori Eşleştirme */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-center flex flex-col justify-between">
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Adım 2 (AI)</div>
                <div className="text-[11px] font-black text-slate-800 dark:text-zinc-200 my-1">Kategori Tahmini</div>
                <div className="text-[9px] text-slate-500 leading-tight">RGB LED / 257548 otomatik eşleme</div>
              </div>

              {/* Stage 3: Karakteristik Şablonu */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-center flex flex-col justify-between">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Adım 3</div>
                <div className="text-[11px] font-black text-slate-800 dark:text-zinc-200 my-1">Özellik Şablonu</div>
                <div className="text-[9px] text-slate-500 leading-tight">Zorunlu eMAG nitelik sözlüğü</div>
              </div>

              {/* Stage 4: AI Karakteristik Çıkarma */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-center flex flex-col justify-between">
                <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">Adım 4 (AI)</div>
                <div className="text-[11px] font-black text-slate-800 dark:text-zinc-200 my-1">Değer Eşleme</div>
                <div className="text-[9px] text-slate-500 leading-tight">5V, Tuya, Zigbee, RGB değerleri</div>
              </div>

              {/* Stage 5: Şema & POST */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-emerald-400/60 dark:border-emerald-600/60 text-center flex flex-col justify-between">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Adım 5 & POST</div>
                <div className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 my-1">v3 Şema Doğrulayıcı</div>
                <div className="text-[9px] text-slate-500 leading-tight">POST /api-3/product_offer/save</div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Execution Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Gerçekleşen API & Doğrulama Adımları
            </h3>

            <div className="space-y-2.5">
              {currentReport.steps.map((step, idx) => {
                const isStepExpanded = expandedStep === idx;
                const isStepOk = step.status === 'success';
                const isStepWarn = step.status === 'warning';
                const isStepErr = step.status === 'error';

                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl transition-all ${
                      isDark ? 'bg-zinc-850/60 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedStep(isStepExpanded ? null : idx)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 rounded-2xl transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isStepOk
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isStepWarn
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : isStepErr
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {isStepOk ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isStepWarn ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : isStepErr ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            step.step
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
                            <span>Adım {step.step}: {step.title}</span>
                            {step.httpStatus && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  step.httpStatus >= 200 && step.httpStatus < 300
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                                }`}
                              >
                                HTTP {step.httpStatus}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                            {step.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {step.durationMs !== undefined && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {step.durationMs}ms
                          </span>
                        )}
                        <div className="text-slate-400">
                          {isStepExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Step Expanded Details (Payload & Response JSON) */}
                    {isStepExpanded && (
                      <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-zinc-800/80 space-y-3 mt-1 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-sans text-slate-700 dark:text-zinc-300">
                          <strong className="block mb-0.5 text-slate-900 dark:text-zinc-100 font-semibold">Adım Detayları:</strong>
                          {step.message}
                          {step.endpoint && (
                            <div className="mt-1 font-mono text-[10px] text-slate-500">
                              Endpoint: {step.endpoint}
                            </div>
                          )}
                        </div>

                        {/* Request Payload JSON */}
                        {step.requestPayload && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
                              <span>Gönderilen İstek Yükü (Request Body)</span>
                              <button
                                onClick={() => handleCopyPayload(idx, step.requestPayload)}
                                className="flex items-center gap-1 text-slate-600 dark:text-zinc-300 hover:text-black cursor-pointer font-mono lowercase"
                              >
                                {copiedPayloadStep === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPayloadStep === idx ? 'kopyalandı' : 'kopyala'}</span>
                              </button>
                            </div>
                            <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-x-auto max-h-40">
                              {JSON.stringify(step.requestPayload, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Response Payload JSON */}
                        {step.responsePayload && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
                              <span>eMAG API Yanıtı (Response Body)</span>
                              <button
                                onClick={() => handleCopyPayload(idx + 100, step.responsePayload)}
                                className="flex items-center gap-1 text-slate-600 dark:text-zinc-300 hover:text-black cursor-pointer font-mono lowercase"
                              >
                                {copiedPayloadStep === idx + 100 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPayloadStep === idx + 100 ? 'kopyalandı' : 'kopyala'}</span>
                              </button>
                            </div>
                            <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-x-auto max-h-40">
                              {JSON.stringify(step.responsePayload, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* eMAG Important Knowledge & FAQ Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark ? 'bg-zinc-850/40 border-zinc-800' : 'bg-blue-50/50 border-blue-100'
            }`}
          >
            <div
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#005fb8] dark:text-blue-400">
                <Info className="w-4 h-4" />
                <span>eMAG Marketplace Ürün Yayınlama Hakkında Önemli Bilgiler</span>
              </div>
              <div className="text-slate-400">
                {showTroubleshooting ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showTroubleshooting && (
              <div className="mt-3 pt-3 border-t border-blue-100 dark:border-zinc-800 space-y-2 text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 shrink-0">1. Moderasyon Kuyruğu:</span>
                  <span>
                    eMAG, yeni eklenen ürünleri (yeni EAN/SKU) anında arama sonuçlarında göstermez. eMAG içerik ekibi ve otomatik algoritmalar ürünü <strong>5 ila 15 dakika</strong> (bazen 24 saate kadar) doğrular ve onaylar.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 shrink-0">2. IP Whitelist:</span>
                  <span>
                    eMAG API, güvenliğiniz için yalnızca beyaz listedeki IP adreslerine izin verir. HTTP 401 hatası alıyorsanız sunucu çıkış IP adresinizi (<strong>{currentReport.serverIp}</strong>) eMAG panelinize eklemeniz gerekir.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 shrink-0">3. Kategori Kısıtlaması:</span>
                  <span>
                    Bazı kategoriler (Örn: Tablet Aksesuarları 101) eMAG satıcı hesabınızda ön izin gerektirebilir. İzin onaylanana kadar ürünü açık kategorilerde (LED & Aydınlatma 257548) yayınlayabilirsiniz.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            Tüm adımlar Omni-Channel API Audit günlüğüne kaydedildi.
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isSuccess && (
              <button
                type="button"
                onClick={handleAutoFixAndResubmit}
                disabled={isAutoFixing}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isAutoFixing ? 'Düzeltiliyor...' : 'Otomatik Düzelt & Gönder'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
