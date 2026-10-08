import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Check,
  X,
  ExternalLink,
  Package,
  Layers,
  Sparkles,
  Sliders,
  Download,
  Share2,
  CheckSquare,
  Square,
  TrendingUp,
  Percent,
  RefreshCw,
  Edit3,
  Trash2,
  Lock,
  RotateCcw,
  Eye,
  EyeOff,
  Globe,
  Building2,
  FileSpreadsheet,
  Rocket,
  Upload,
  ChevronDown,
  FileCheck,
  AlertTriangle,
  FolderTree
} from 'lucide-react';
import { store, resolveProductImage } from '../../services/marketplaceStore';
import { AllegroOffer, MarketplaceId, SupportedCurrency } from '../../types/allegro';
import {
  parseExcelProductData,
  convertExcelRowsToOffers,
  generateSampleExcelFile
} from '../../services/excelProductParser';
import { ProductImage } from '../common/ProductImage';
import { CreateOfferModal } from '../modals/CreateOfferModal';
import { ResetPanelModal } from '../modals/ResetPanelModal';
import { EmagImageDiagnosticModal } from '../modals/EmagImageDiagnosticModal';
import { EmagExecutionLogsModal, EmagExecutionReport } from '../modals/EmagExecutionLogsModal';
import { ExcelProductImportModal } from '../modals/ExcelProductImportModal';
import { MissingCharacteristicsPromptModal } from '../modals/MissingCharacteristicsPromptModal';
import { categorySchemaSyncService, ValidationResult } from '../../services/CategorySchemaSyncService';
import { emagTaxonomySyncService } from '../../services/emagTaxonomySyncService';
import { EmagCategorySelector } from '../common/EmagCategorySelector';
import { MarketplaceLogo, MARKETPLACE_LOGOS } from '../../constants/marketplaces';

interface OffersViewProps {
  onOpenCreateOffer: () => void;
  onNavigateToSourcing?: () => void;
  theme?: 'light' | 'dark';
}

const getOfferOrigin = (offer: AllegroOffer) => {
  const idStr = String(offer.id || '');
  const baseMarketplace = offer.publication?.marketplaces?.base?.id || '';
  const catName = offer.category?.name || '';
  const isDraft = Boolean(offer.isDraft || offer.publication?.status === 'DRAFT');

  // 1. Excel Taslağı (Excel'den yüklenen ham ürünler - henüz pazaryerine gitmedi)
  if (offer.excelMetadata || idStr.startsWith('draft-xl-')) {
    const cleanId = idStr.replace(/^draft-xl-/, '');
    return {
      platform: 'excel' as const,
      label: 'Excel Taslağı',
      url: null,
      idLabel: `Taslak ID: ${cleanId.slice(0, 14)}...`,
      textColor: 'text-slate-800 dark:text-zinc-200',
      bgColor: 'bg-slate-100 dark:bg-zinc-800',
      borderColor: 'border-slate-200 dark:border-zinc-700'
    };
  }

  // 2. Manuel Sistem Taslağı (Henüz pazaryerinde yayına alınmamış)
  if (isDraft || idStr.startsWith('draft-')) {
    const cleanId = idStr.replace(/^draft-/, '');
    return {
      platform: 'draft' as const,
      label: 'Sistem Taslağı',
      url: null,
      idLabel: `Taslak ID: ${cleanId.slice(0, 14)}...`,
      textColor: 'text-slate-800 dark:text-zinc-200',
      bgColor: 'bg-slate-100 dark:bg-zinc-800',
      borderColor: 'border-slate-200 dark:border-zinc-700'
    };
  }

  // 3. BaseLinker
  if (idStr.startsWith('bl-') || baseMarketplace === 'baselinker-hub' || catName.toLowerCase().includes('baselinker')) {
    const cleanId = idStr.replace(/^bl-/, '');
    return {
      platform: 'baselinker' as const,
      label: 'BaseLinker',
      url: `https://panel.baselinker.com/inventory_products.php?id=${cleanId}`,
      idLabel: `BL ID: ${cleanId}`,
      textColor: 'text-slate-700 dark:text-zinc-200',
      bgColor: 'bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80',
      borderColor: 'border-slate-200 dark:border-zinc-700'
    };
  }

  // 4. eMAG
  if (idStr.startsWith('emag_') || baseMarketplace.startsWith('emag') || catName.toLowerCase().includes('emag')) {
    const cleanId = idStr.replace(/^emag_/, '');
    const isBg = baseMarketplace.includes('bg');
    const domain = isBg ? 'emag.bg' : 'emag.ro';
    return {
      platform: 'emag' as const,
      label: 'eMAG',
      url: `https://www.${domain}/pd/${cleanId}`,
      idLabel: `eMAG ID: ${cleanId}`,
      textColor: 'text-slate-700 dark:text-zinc-200',
      bgColor: 'bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80',
      borderColor: 'border-slate-200 dark:border-zinc-700'
    };
  }

  // 5. Allegro (Yalnızca gerçekten bağlı/yayında olan Allegro ürünleri)
  const cleanId = idStr.replace(/^allegro_/, '');
  return {
    platform: 'allegro' as const,
    label: 'Allegro',
    url: `https://allegro.pl/oferta/${cleanId}`,
    idLabel: `Allegro ID: ${cleanId}`,
    textColor: 'text-slate-700 dark:text-zinc-200',
    bgColor: 'bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80',
    borderColor: 'border-slate-200 dark:border-zinc-700'
  };
};

export const OffersView: React.FC<OffersViewProps> = ({ onOpenCreateOffer, onNavigateToSourcing, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const [offers, setOffers] = useState<AllegroOffer[]>(store.getOffers());
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(store.getActiveCurrency());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'LOW_STOCK' | 'ENDED'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'emag' | 'allegro' | 'baselinker'>('ALL');
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Full Edit / Revise State
  const [editingOffer, setEditingOffer] = useState<AllegroOffer | null>(null);

  // Multi-select state for Bulk Operations
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [bulkActionModal, setBulkActionModal] = useState<'PRICE' | 'STOCK' | 'CATEGORY' | null>(null);
  const [bulkPriceValue, setBulkPriceValue] = useState<number>(10);
  const [bulkPriceType, setBulkPriceType] = useState<'PERCENT_INCREASE' | 'PERCENT_DECREASE' | 'FIXED_ADD'>('PERCENT_INCREASE');
  const [bulkStockValue, setBulkStockValue] = useState<number>(50);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  // eMAG Category Sync & Quick Assign State
  const [quickCategoryOffer, setQuickCategoryOffer] = useState<AllegroOffer | null>(null);
  const [bulkCategorySelectedId, setBulkCategorySelectedId] = useState<string>('202');
  const [bulkCategorySelectedName, setBulkCategorySelectedName] = useState<string>('Smart Home');
  const [isSyncingEmagCats, setIsSyncingEmagCats] = useState(false);
  const [emagCategoryCount, setEmagCategoryCount] = useState<number>(emagTaxonomySyncService.getCategories().length);

  useEffect(() => {
    const unsub = emagTaxonomySyncService.subscribe(() => {
      setEmagCategoryCount(emagTaxonomySyncService.getCategories().length);
    });
    return unsub;
  }, []);

  const handleSyncEmagCategoriesFromHeader = async () => {
    setIsSyncingEmagCats(true);
    try {
      const res = await emagTaxonomySyncService.syncWithEmagApi();
      if (res.success) {
        setBulkNotice(`eMAG Taksonomisi başarıyla güncellendi! (${res.categories.length} kategori sistemde kayıtlı)`);
        setEmagCategoryCount(res.categories.length);
        setTimeout(() => setBulkNotice(null), 4000);
      }
    } catch {} finally {
      setIsSyncingEmagCats(false);
    }
  };

  // Inline editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  // Transfer to Marketplace & Inline Excel State
  const [activeTransferMenuOfferId, setActiveTransferMenuOfferId] = useState<string | null>(null);
  const [showBulkTransferDropdown, setShowBulkTransferDropdown] = useState(false);
  const [isInlineUploadingExcel, setIsInlineUploadingExcel] = useState(false);
  const [isDraggingExcel, setIsDraggingExcel] = useState(false);
  const inlineFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setActiveTransferMenuOfferId(null);
        setShowBulkTransferDropdown(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  useEffect(() => {
    return store.subscribe(() => {
      setOffers(store.getOffers());
      setActiveCurrency(store.getActiveCurrency());
    });
  }, []);

  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [isFetchingEmag, setIsFetchingEmag] = useState(false);
  const [isFetchingAllegro, setIsFetchingAllegro] = useState(false);
  const [isFetchingBaseLinker, setIsFetchingBaseLinker] = useState(false);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleClearAllData = () => {
    if (confirm('Paneldeki tüm verileri sıfırlayıp temizlemek istediğinize emin misiniz?')) {
      store.clearAllData();
      setBulkNotice('🧹 Tüm veriler sıfırlandı. Panel temiz canlı moda hazır.');
      setTimeout(() => setBulkNotice(null), 4000);
    }
  };

  const handleLiveStoreSync = async () => {
    setIsLiveSyncing(true);
    const result = await store.syncLiveMarketplaceData();
    setIsLiveSyncing(false);
    setBulkNotice(
      `🟢 ${result.syncedPlatforms.join(' + ')} mağazalarınızdan ${result.syncedOffersCount} canlı ürün, stok ve fiyat bilgileri güncellendi!`
    );
    setTimeout(() => setBulkNotice(null), 5000);
  };

  const handleLiveStoreSyncWithClean = async () => {
    setIsLiveSyncing(true);
    const result = await store.syncLiveMarketplaceData({ cleanDemoOffers: true });
    setIsLiveSyncing(false);
    if (result.syncedOffersCount > 0) {
      setBulkNotice(
        `🟢 Demo veriler temizlendi! ${result.syncedPlatforms.join(' + ')} mağazalarınızdan ${result.syncedOffersCount} canlı ürün yüklendi.`
      );
    } else {
      setBulkNotice(
        `ℹ️ Demo veriler temizlendi. eMAG API Durumu (${result.details.emagApiStatus}): ${result.details.emagApiMessage}`
      );
    }
    setTimeout(() => setBulkNotice(null), 8000);
  };

  const handleFetchEmagProducts = async () => {
    setIsFetchingEmag(true);
    const res = await store.fetchEmagProducts();
    setIsFetchingEmag(false);
    if (res.success) {
      setBulkNotice(
        res.count > 0
          ? `🟢 eMAG (${store.getPlatformCredentials().emag.country.toUpperCase()}) mağazanızdan ${res.count} gerçek ürün başarıyla çekildi ve listelendi!`
          : `ℹ️ eMAG mağazanıza başarıyla bağlanıldı (HTTP 200 OK). Ancak mağazanızda şu an listelenmiş ürün teklifi bulunmuyor.`
      );
    } else {
      setBulkNotice(`⚠️ eMAG Ürün Çekme Hatası: ${res.message}`);
    }
    setTimeout(() => setBulkNotice(null), 8000);
  };

  const handleFetchAllegroProducts = async () => {
    setIsFetchingAllegro(true);
    const res = await store.fetchAllegroProducts();
    setIsFetchingAllegro(false);
    if (res.success) {
      setBulkNotice(
        res.count > 0
          ? `🟢 Allegro mağazanızdan ${res.count} gerçek ürün teklifi başarıyla çekildi!`
          : `ℹ️ Allegro mağazanıza bağlanıldı (HTTP 200 OK). Ancak aktif ürün teklifi bulunamadı.`
      );
    } else {
      setBulkNotice(`⚠️ Allegro Ürün Çekme Hatası: ${res.message}`);
    }
    setTimeout(() => setBulkNotice(null), 8000);
  };

  const handleFetchBaseLinkerProducts = async () => {
    setIsFetchingBaseLinker(true);
    const res = await store.fetchBaseLinkerProducts();
    setIsFetchingBaseLinker(false);
    if (res.success) {
      setBulkNotice(
        res.count > 0
          ? `🟢 BaseLinker envanterinizden ${res.count} ürün başarıyla çekildi!`
          : `ℹ️ BaseLinker API'sine bağlanıldı (HTTP 200 OK). Ancak katalogda ürün bulunamadı.`
      );
    } else {
      setBulkNotice(`⚠️ BaseLinker Ürün Çekme Hatası: ${res.message}`);
    }
    setTimeout(() => setBulkNotice(null), 8000);
  };

  const handleFetchAllMarketplaces = async () => {
    setIsFetchingAll(true);
    const res = await store.fetchAllMarketplacesProducts();
    setIsFetchingAll(false);
    if (res.success) {
      setBulkNotice(`🟢 Tüm pazaryerlerinden toplam ${res.totalCount} ürün başarıyla çekildi ve eşitlendi!`);
    } else {
      setBulkNotice(`⚠️ Pazaryerleri çekme sonucu: ${res.results.map(r => `${r.platform}: ${r.message}`).join(' | ')}`);
    }
    setTimeout(() => setBulkNotice(null), 8000);
  };

  const handleStartEditPrice = (offer: AllegroOffer) => {
    setEditingPriceId(offer.id);
    setEditPriceValue(offer.sellingMode.price.amount);
  };

  const handleSavePrice = (offerId: string) => {
    store.updateOfferPrice(offerId, editPriceValue);
    setEditingPriceId(null);
  };

  const handleStartEditStock = (offer: AllegroOffer) => {
    setEditingStockId(offer.id);
    setEditStockValue(offer.stock.available);
  };

  const handleSaveStock = (offerId: string) => {
    store.updateOfferStock(offerId, editStockValue);
    setEditingStockId(null);
  };

  // Single offer fetching state
  const [fetchingImageOfferId, setFetchingImageOfferId] = useState<string | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<any | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticProductName, setDiagnosticProductName] = useState('');
  const [diagnosticOfferId, setDiagnosticOfferId] = useState('');

  // eMAG Step-by-Step Publish Execution Logs Modal State
  const [showEmagLogsModal, setShowEmagLogsModal] = useState(false);
  const [emagLogReport, setEmagLogReport] = useState<EmagExecutionReport | null>(null);
  const [publishingEmagOfferId, setPublishingEmagOfferId] = useState<string | null>(null);

  // Missing Mandatory Characteristics Modal State
  const [showMissingCharsModal, setShowMissingCharsModal] = useState(false);
  const [missingCharsValidation, setMissingCharsValidation] = useState<ValidationResult | null>(null);
  const [pendingPublishOffer, setPendingPublishOffer] = useState<AllegroOffer | null>(null);

  const handlePublishSingleOfferToEmag = async (offer: AllegroOffer, overrideCharacteristics?: Array<{ id: string | number; value: any }>) => {
    // If override characteristics are passed, bypass check and publish directly
    if (overrideCharacteristics) {
      setPublishingEmagOfferId(offer.id);
      const res = await store.publishOfferToEmag(offer.id, { characteristics: overrideCharacteristics });
      setPublishingEmagOfferId(null);

      if (res.report) {
        setEmagLogReport(res.report);
        setShowEmagLogsModal(true);
      }

      if (res.success) {
        setBulkNotice(`🟢 "${offer.name.slice(0, 30)}..." eMAG pazaryerine başarıyla iletildi.`);
      } else {
        setBulkNotice(`⚠️ eMAG gönderim adımları inceleniyor.`);
      }
      setTimeout(() => setBulkNotice(null), 7000);
      return;
    }

    // Extract brand safely
    const brandParam = Array.isArray(offer.parameters)
      ? offer.parameters.find(p => p.id === '11323' || p.name?.toLowerCase().includes('marka') || p.name?.toLowerCase().includes('brand'))?.values?.[0]
      : 'Generic';
    const brandName = brandParam || 'Generic';

    // Determine category ID for validation
    const rawCatId = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || offer.excelMetadata?.matchedCategoryCode || offer.category?.id;
    let numCatId = parseInt(String(rawCatId || '').replace(/\D/g, ''), 10);
    if (isNaN(numCatId) || numCatId <= 0 || numCatId === 257548 || numCatId > 65535) {
      const mapping = await categorySchemaSyncService.validateAndMapExcelCategory(
        { code: rawCatId, name: offer.category?.name },
        { name: offer.name, brand: brandName }
      );
      numCatId = mapping.categoryId;
    }

    const currentChars = offer.channelData?.emag?.characteristics || offer.parameters || [];
    const validation = await categorySchemaSyncService.validateProductCharacteristics(
      numCatId,
      currentChars,
      { name: offer.name, brand: brandName }
    );

    // If mandatory fields are missing, prompt user before POST request
    if (!validation.isValid && validation.missingMandatory.length > 0) {
      setPendingPublishOffer(offer);
      setMissingCharsValidation(validation);
      setShowMissingCharsModal(true);
      return;
    }

    setPublishingEmagOfferId(offer.id);
    const res = await store.publishOfferToEmag(offer.id);
    setPublishingEmagOfferId(null);

    if (res.report) {
      setEmagLogReport(res.report);
      setShowEmagLogsModal(true);
    }

    if (res.success) {
      setBulkNotice(`🟢 "${offer.name.slice(0, 30)}..." eMAG pazaryerine başarıyla iletildi. Detaylı işlem adımları açıldı.`);
    } else {
      setBulkNotice(`⚠️ eMAG gönderim logları ve olası IP/alan uyarıları görüntülendi.`);
    }
    setTimeout(() => setBulkNotice(null), 7000);
  };

  const handleOpenLatestEmagLog = () => {
    const latest = store.getLatestEmagPublishReport();
    if (latest) {
      setEmagLogReport(latest);
      setShowEmagLogsModal(true);
    } else {
      const apiLogs = store.getApiLogs().filter(l => l.platform === 'emag');
      if (apiLogs.length > 0) {
        setEmagLogReport({
          success: apiLogs.some(l => l.status < 300),
          serverIp: '185.x.x.x',
          partNumberKey: 'Kayıtlı İstekler',
          productName: 'Son eMAG API İstek ve Yanıt Geçmişi',
          durationMs: 280,
          steps: apiLogs.slice(0, 6).map((l, i) => ({
            step: i + 1,
            title: l.endpoint,
            endpoint: l.endpoint,
            httpStatus: l.status,
            durationMs: l.durationMs,
            status: l.status < 300 ? 'success' : l.status === 202 ? 'warning' : 'error',
            requestPayload: l.requestBody,
            responsePayload: l.responseBody,
            message: `${l.method} ${l.endpoint} (HTTP ${l.status})`,
            timestamp: l.timestamp
          })),
          summary: {
            status: 'API_HISTORY',
            message: 'eMAG API İstek & Yanıt Geçmişi'
          }
        });
        setShowEmagLogsModal(true);
      } else {
        setBulkNotice('ℹ️ Henüz kaydedilmiş bir eMAG gönderim logu bulunmuyor. Bir ürünü eMAG’a gönderdiğinizde adım adım loglar burada listelenecektir.');
        setTimeout(() => setBulkNotice(null), 5000);
      }
    }
  };

  const handleFetchSingleEmagImage = async (offer: AllegroOffer) => {
    setFetchingImageOfferId(offer.id);
    const res = await store.fetchEmagSingleProductImage(offer.id);
    setFetchingImageOfferId(null);

    if (res.diagnostics) {
      setDiagnosticData(res.diagnostics);
      setDiagnosticProductName(offer.name);
      setDiagnosticOfferId(offer.id);
    }

    if (res.success && res.imageUrl) {
      setBulkNotice(`🟢 "${offer.name.slice(0, 30)}..." eMAG ürün fotoğrafı başarıyla çekildi!`);
    } else {
      setBulkNotice(`⚠️ eMAG'den görsel çekilemedi. Detaylı loglar açılıyor...`);
      setShowDiagnosticModal(true);
    }
    setTimeout(() => setBulkNotice(null), 5000);
  };

  const handleChangeImagePrompt = (offer: AllegroOffer) => {
    const currentUrl = offer.primaryImage || '';
    const newUrl = prompt(`"${offer.name}" için ürün görseli URL'si:`, currentUrl);
    if (newUrl && newUrl.trim() && newUrl.trim() !== currentUrl) {
      store.updateOfferImage(offer.id, newUrl.trim());
      setBulkNotice(`"${offer.name.slice(0, 32)}..." görseli başarıyla güncellendi!`);
      setTimeout(() => setBulkNotice(null), 4000);
    }
  };

  const handleInlineExcelFile = async (f: File) => {
    setIsInlineUploadingExcel(true);
    try {
      const buffer = await f.arrayBuffer();
      const result = parseExcelProductData(buffer);
      if (!result.success || result.rows.length === 0) {
        setBulkNotice(`⚠️ Excel okunamadı: ${result.error || 'Geçerli ürün bulunamadı.'}`);
        return;
      }
      const draftOffers = convertExcelRowsToOffers(result.rows);
      const importRes = store.importExcelDraftOffers(draftOffers);
      setStatusFilter('DRAFT');
      setBulkNotice(
        `🟢 ${importRes.count} adet ürün Excel dosyasından doğrudan TASLAK (DRAFT) olarak aktarıldı! Şimdi istediğiniz ürünü seçip dilediğiniz pazaryerine aktarabilirsiniz.`
      );
    } catch (err: any) {
      setBulkNotice(`⚠️ Hata: ${err?.message || 'Excel dosyası işlenemedi'}`);
    } finally {
      setIsInlineUploadingExcel(false);
      setTimeout(() => setBulkNotice(null), 7000);
    }
  };

  const handleDownloadSampleExcel = () => {
    try {
      const fileBuffer = generateSampleExcelFile();
      const blob = new Blob([fileBuffer.buffer as ArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jiguli_ornek_urun_listesi.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download sample error:', e);
    }
  };

  const handleTransferOfferToMarketplace = async (offer: AllegroOffer, targetChannel: MarketplaceId | 'ALL') => {
    const success = store.publishDraftOffer(offer.id, targetChannel);
    setActiveTransferMenuOfferId(null);
    if (success) {
      const channelNames: Record<string, string> = {
        allegro: 'Allegro',
        emag: 'eMAG',
        baselinker: 'BaseLinker',
        ALL: 'Tüm Pazaryerleri'
      };
      const channelLabel = channelNames[targetChannel] || targetChannel;
      setBulkNotice(`🟢 "${offer.name.slice(0, 30)}..." ürünü ${channelLabel} pazaryerine aktarıldı ve yayına alındı!`);

      // If sending to eMAG, execute real eMAG pipeline and fetch execution report
      if (targetChannel === 'emag' || targetChannel === 'ALL') {
        const res = await store.publishOfferToEmag(offer.id);
        if (res.report) {
          setEmagLogReport(res.report);
          setShowEmagLogsModal(true);
        }
      }

      setTimeout(() => setBulkNotice(null), 6000);
    }
  };

  const handleBulkTransferToMarketplace = (targetChannel: MarketplaceId | 'ALL') => {
    if (selectedOfferIds.length === 0) return;
    const count = store.publishBulkDraftOffers(selectedOfferIds, targetChannel);
    setShowBulkTransferDropdown(false);
    const channelNames: Record<string, string> = {
      allegro: 'Allegro',
      emag: 'eMAG',
      baselinker: 'BaseLinker',
      ALL: 'Tüm Pazaryerleri'
    };
    const channelLabel = channelNames[targetChannel] || targetChannel;
    setBulkNotice(`🟢 Seçilen ${count} adet taslak ürün ${channelLabel} pazaryerine başarıyla aktarıldı ve yayına alındı!`);
    setTimeout(() => setBulkNotice(null), 5000);
  };

  const draftOffersCount = offers.filter(o => o.isDraft || o.publication?.status === 'DRAFT').length;
  const activeOffersCount = offers.filter(o => !o.isDraft && (o.publication?.status || 'ACTIVE') === 'ACTIVE').length;
  const lowStockOffersCount = offers.filter(o => (o.stock?.available ?? 0) <= 15).length;
  const endedOffersCount = offers.filter(o => o.publication?.status === 'ENDED').length;
  const excelDraftsCount = offers.filter(o => (o.isDraft || o.publication?.status === 'DRAFT') && (Boolean(o.excelMetadata) || o.id.startsWith('draft-xl-'))).length;

  const sourceCounts = {
    ALL: offers.length,
    emag: offers.filter(o => getOfferOrigin(o).platform === 'emag').length,
    allegro: offers.filter(o => getOfferOrigin(o).platform === 'allegro').length,
    baselinker: offers.filter(o => getOfferOrigin(o).platform === 'baselinker').length
  };

  const filteredOffers = offers.filter((offer) => {
    // Marketplace Source Filter (eMAG / Allegro / BaseLinker import origin)
    if (sourceFilter !== 'ALL') {
      const origin = getOfferOrigin(offer);
      if (origin.platform !== sourceFilter) return false;
    }

    const matchesSearch =
      offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.ean && offer.ean.includes(searchQuery)) ||
      offer.id.includes(searchQuery);

    if (!matchesSearch) return false;

    const isDraftOffer = Boolean(offer.isDraft || offer.publication?.status === 'DRAFT');
    if (statusFilter === 'DRAFT') {
      if (!isDraftOffer) return false;
    } else if (statusFilter === 'ACTIVE') {
      if (isDraftOffer || (offer.publication?.status || 'ACTIVE') !== 'ACTIVE') return false;
    } else if (statusFilter === 'ENDED') {
      if (offer.publication?.status !== 'ENDED') return false;
    } else if (statusFilter === 'LOW_STOCK') {
      if ((offer.stock?.available ?? 0) > 15) return false;
    }

    return true;
  });

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedOfferIds.length === filteredOffers.length) {
      setSelectedOfferIds([]);
    } else {
      setSelectedOfferIds(filteredOffers.map(o => o.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedOfferIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleApplyBulkPrice = () => {
    if (selectedOfferIds.length === 0) return;
    store.bulkUpdatePrices(selectedOfferIds, bulkPriceType, bulkPriceValue);
    setBulkActionModal(null);
    setBulkNotice(`${selectedOfferIds.length} ürünün fiyatı başarıyla güncellendi!`);
    setTimeout(() => setBulkNotice(null), 3000);
  };

  const handleApplyBulkStock = () => {
    if (selectedOfferIds.length === 0) return;
    store.bulkUpdateStock(selectedOfferIds, bulkStockValue);
    setBulkActionModal(null);
    setBulkNotice(`${selectedOfferIds.length} ürünün stoğu ${bulkStockValue} adet olarak güncellendi!`);
    setTimeout(() => setBulkNotice(null), 3000);
  };

  const handleApplyBulkEmagSync = () => {
    if (selectedOfferIds.length === 0) return;
    store.bulkSyncChannels(selectedOfferIds, 'emag');
    setBulkNotice(`${selectedOfferIds.length} ürün eMAG Marketplace'e başarıyla senkronize edildi!`);
    setTimeout(() => setBulkNotice(null), 3000);
  };

  const handleApplyBulkEndListing = () => {
    if (selectedOfferIds.length === 0) return;
    store.bulkToggleStatus(selectedOfferIds, 'ENDED');
    setBulkNotice(`${selectedOfferIds.length} ürün satıştan kaldırıldı!`);
    setTimeout(() => setBulkNotice(null), 3000);
  };

  const handleBulkToggleChannel = (channel: MarketplaceId, targetStatus: 'synced' | 'unlinked') => {
    if (selectedOfferIds.length === 0) return;
    store.bulkToggleChannel(selectedOfferIds, channel, targetStatus);
    const label = channel === 'emag' ? 'eMAG' : channel === 'allegro' ? 'Allegro' : 'BaseLinker';
    const stateStr = targetStatus === 'synced' ? 'Aktif' : 'Pasif';
    setBulkNotice(`${selectedOfferIds.length} ürün için ${label} pazaryeri ${stateStr} konuma getirildi!`);
    setTimeout(() => setBulkNotice(null), 3000);
  };

  const handleBulkDeleteOffers = () => {
    if (selectedOfferIds.length === 0) return;
    if (confirm(`Seçilen ${selectedOfferIds.length} ürünü panelden silmek istediğinize emin misiniz?`)) {
      selectedOfferIds.forEach(id => store.removeOffer(id));
      setSelectedOfferIds([]);
      setBulkNotice(`Seçilen demo ürünler panelden silindi!`);
      setTimeout(() => setBulkNotice(null), 3000);
    }
  };

  const handleExportCsv = () => {
    const selected = offers.filter(o => selectedOfferIds.includes(o.id));
    const targetOffers = selected.length > 0 ? selected : offers;
    const csvContent = "data:text/csv;charset=utf-8," +
      ["ID,Başlık,SKU,EAN,Fiyat (PLN),Stok,Durum",
       ...targetOffers.map(o => `"${o.id}","${(o.name || '').replace(/"/g, '""')}","${o.sku || ''}","${o.ean || ''}","${o.sellingMode?.price?.amount || '0.00'}","${o.stock?.available ?? 0}","${o.publication?.status || 'ACTIVE'}"`)
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `allegro_urunler_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllSelected = filteredOffers.length > 0 && selectedOfferIds.length === filteredOffers.length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight">
            Ürünler & Stok
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Allegro teklifleri ve çok kanallı envanter listesi ({offers.length} Ürün)
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          {/* 1. eMAG Çek */}
          <button
            onClick={handleFetchEmagProducts}
            disabled={isFetchingEmag}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="eMAG satıcı panelinizdeki gerçek ürün tekliflerini çeker"
          >
            <MarketplaceLogo platform="emag" size="xs" rounded="md" />
            <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingEmag ? 'animate-bounce' : ''}`} />
            <span>{isFetchingEmag ? 'Çekiliyor...' : 'eMAG'}</span>
          </button>

          {/* 2. Allegro Çek */}
          <button
            onClick={handleFetchAllegroProducts}
            disabled={isFetchingAllegro}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="Allegro REST API üzerinden mağaza tekliflerinizi çeker"
          >
            <MarketplaceLogo platform="allegro" size="xs" rounded="md" />
            <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingAllegro ? 'animate-bounce' : ''}`} />
            <span>{isFetchingAllegro ? 'Çekiliyor...' : 'Allegro'}</span>
          </button>

          {/* 3. BaseLinker Çek */}
          <button
            onClick={handleFetchBaseLinkerProducts}
            disabled={isFetchingBaseLinker}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="BaseLinker envanter kataloğundaki ürünleri çeker"
          >
            <MarketplaceLogo platform="baselinker" size="xs" rounded="md" />
            <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingBaseLinker ? 'animate-bounce' : ''}`} />
            <span>{isFetchingBaseLinker ? 'Çekiliyor...' : 'BaseLinker'}</span>
          </button>

          {/* 4. Tüm Pazaryerlerini Çek & Eşitle */}
          <button
            onClick={handleFetchAllMarketplaces}
            disabled={isFetchingAll}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="eMAG, Allegro ve BaseLinker'dan aynı anda tüm ürünleri çeker ve eşitler"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetchingAll ? 'animate-spin' : ''}`} />
            <span>{isFetchingAll ? 'Eşitleniyor...' : 'Tümünü Eşitle'}</span>
          </button>

          {/* 5. Excel ile Ürün Yükle (Taslak) */}
          <button
            onClick={() => setShowExcelModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs"
            title="Excel dosyasını yükleyin (.xlsx / .csv); ürünler taslak (DRAFT) olarak aktarılır"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel ile Yükle</span>
          </button>

          {/* eMAG Gönderim & Adım Logları */}
          <button
            onClick={handleOpenLatestEmagLog}
            className="px-3 py-1.5 rounded-xl border border-[#005fb8]/30 bg-[#005fb8]/5 hover:bg-[#005fb8]/10 text-[#005fb8] dark:text-blue-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs"
            title="eMAG'a yapılan ürün gönderimleri, API istek yükleri ve adım adım onay durum logları"
          >
            <MarketplaceLogo platform="emag" size="xs" rounded="full" />
            <span>eMAG Gönderim Logları</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={offers.length === 0}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-40"
            title="Ürün listesini CSV olarak indir"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          {onNavigateToSourcing && (
            <button
              onClick={onNavigateToSourcing}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs"
              title="Fotoğraf yükleyerek 1688 / AliExpress tedarikçi ürünleri bulun"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Görselle Bul</span>
            </button>
          )}

          <button
            onClick={() => setShowResetModal(true)}
            className="px-2.5 py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 text-slate-400 hover:text-rose-600 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
            title="Sadece Jiguli panelindeki yerel verileri sıfırlar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          <button
            onClick={onOpenCreateOffer}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manuel İlan</span>
          </button>
        </div>
      </div>

      {bulkNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{bulkNotice}</span>
        </div>
      )}

      {/* Category Navigation Bar (Tüm Ürünler, Yayında, Taslaklar, vb.) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Tüm Ürünler</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            statusFilter === 'ALL'
              ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
              : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
          }`}>
            {offers.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            statusFilter === 'ACTIVE'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Yayındaki İlanlar</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            statusFilter === 'ACTIVE'
              ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
              : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
          }`}>
            {activeOffersCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('DRAFT')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            statusFilter === 'DRAFT'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
          <span>Taslak Ürünler (Excel & Taslak)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            statusFilter === 'DRAFT'
              ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
              : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
          }`}>
            {draftOffersCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>Kritik Stok</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
              : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
          }`}>
            {lowStockOffersCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('ENDED')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            statusFilter === 'ENDED'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>Sonlanan</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            statusFilter === 'ENDED'
              ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
              : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
          }`}>
            {endedOffersCount}
          </span>
        </button>
      </div>

      {/* DEDICATED DRAFTS CATEGORY MANAGEMENT & INLINE EXCEL DROPZONE */}
      {statusFilter === 'DRAFT' && (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-200 shrink-0 border border-slate-200 dark:border-zinc-700">
                <FileSpreadsheet className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Taslak Ürün Kataloğu
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {draftOffersCount} Ürün
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Excel ile yüklenen veya taslak oluşturulan ürünler. İstediğiniz ürünü veya toplu seçim yaparak dilediğiniz pazaryerine aktarabilirsiniz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handleSyncEmagCategoriesFromHeader}
                disabled={isSyncingEmagCats}
                className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                title="eMAG'daki tüm resmi kategorileri çek ve sisteme kaydet"
              >
                <FolderTree className={`w-3.5 h-3.5 text-blue-600 ${isSyncingEmagCats ? 'animate-spin' : ''}`} />
                <span>{isSyncingEmagCats ? 'Kategoriler Çekiliyor...' : `eMAG Kategorilerini Çek (${emagCategoryCount})`}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="6 adet hazır ürünlü örnek Excel şablonunu indirin"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Örnek Excel Şablonu</span>
              </button>

              <button
                type="button"
                onClick={() => inlineFileInputRef.current?.click()}
                disabled={isInlineUploadingExcel}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isInlineUploadingExcel ? 'Yükleniyor...' : 'Hızlı Excel Yükle'}</span>
              </button>
            </div>
          </div>

          {/* Inline Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingExcel(true);
            }}
            onDragLeave={() => setIsDraggingExcel(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingExcel(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) handleInlineExcelFile(dropped);
            }}
            onClick={() => inlineFileInputRef.current?.click()}
            className={`mt-3 border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-all cursor-pointer ${
              isDraggingExcel
                ? 'border-slate-800 bg-slate-100 dark:border-white dark:bg-zinc-800'
                : 'border-slate-200 hover:border-slate-400 dark:border-zinc-800 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0">
                <FileCheck className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Excel dosyasını (.xlsx, .xls, .csv) buraya sürükleyin veya tıklayıp seçin
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ürünler doğrudan bu taslak listesine eklenir. Modal sayfasına gerek kalmadan ürün sayfasında yönetebilirsiniz.
                </div>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 underline underline-offset-2 shrink-0">
              Dosya Seç (.xlsx / .csv)
            </span>

            <input
              ref={inlineFileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) {
                  handleInlineExcelFile(picked);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Başlık, SKU, EAN veya ID ile filtrele..."
            className="w-full bg-slate-100 dark:bg-zinc-800/80 rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {/* Marketplace Source Dropdown Filter */}
          <div className="relative shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-2xs transition-colors ${
              isDark ? 'bg-zinc-800/90 border-zinc-700 text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <label htmlFor="marketplace-source-select" className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                Pazaryeri Kaynağı:
              </label>
              <select
                id="marketplace-source-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1 text-[#14171A] dark:text-zinc-100"
              >
                <option value="ALL" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                  Tümü ({sourceCounts.ALL})
                </option>
                <option value="emag" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                  eMAG ({sourceCounts.emag})
                </option>
                <option value="allegro" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                  Allegro ({sourceCounts.allegro})
                </option>
                <option value="baselinker" className={isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-slate-900'}>
                  BaseLinker ({sourceCounts.baselinker})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING BULK ACTIONS TOOLBAR (Toplu İşlemler Barı) */}
      {selectedOfferIds.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white text-slate-900 font-bold text-xs flex items-center justify-center">
              {selectedOfferIds.length}
            </span>
            <span className="text-xs font-medium">ürün seçildi</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {selectedOfferIds.some(id => {
              const off = offers.find(o => o.id === id);
              return off?.isDraft || off?.publication?.status === 'DRAFT';
            }) && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkTransferDropdown(prev => !prev)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Seçili taslak ürünleri istediğiniz pazaryerine aktarın"
                >
                  <Rocket className="w-3.5 h-3.5 text-slate-900" />
                  <span>Pazaryerine Aktar</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showBulkTransferDropdown && (
                  <div className="absolute left-0 bottom-full mb-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 text-slate-800 dark:text-zinc-100 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                      Hedef Pazaryeri Seçin
                    </div>
                    <button
                      onClick={() => handleBulkTransferToMarketplace('allegro')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                      <span>Allegro'ya Aktar</span>
                    </button>
                    <button
                      onClick={() => handleBulkTransferToMarketplace('emag')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                      <span>eMAG'a Aktar</span>
                    </button>
                    <button
                      onClick={() => handleBulkTransferToMarketplace('baselinker')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                      <span>BaseLinker'a Aktar</span>
                    </button>
                    <button
                      onClick={() => handleBulkTransferToMarketplace('ALL')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800 mt-1 pt-2 cursor-pointer transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tüm Pazaryerlerine Aktar</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setBulkActionModal('PRICE')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5 text-slate-300" />
              <span>Fiyat</span>
            </button>

            <button
              onClick={() => setBulkActionModal('STOCK')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-slate-300" />
              <span>Stok</span>
            </button>

            <button
              onClick={() => setBulkActionModal('CATEGORY')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Seçili ürünlere toplu eMAG kategorisi ata"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>eMAG Kategori Ata</span>
            </button>

            <button
              onClick={() => handleBulkToggleChannel('emag', 'synced')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Seçili ürünleri eMAG pazaryerinde Aktif yap"
            >
              <MarketplaceLogo platform="emag" size="xs" rounded="full" />
              <span>eMAG Aktif</span>
            </button>

            <button
              onClick={() => handleBulkToggleChannel('allegro', 'synced')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Seçili ürünleri Allegro'da Aktif yap"
            >
              <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
              <span>Allegro Aktif</span>
            </button>

            <button
              onClick={handleBulkDeleteOffers}
              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Seçilen demo ürünleri panelden sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sil</span>
            </button>

            <button
              onClick={() => setSelectedOfferIds([])}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Seçimi Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Action Sub-Modals */}
      {bulkActionModal === 'PRICE' && (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-300 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs text-slate-900">
            <span>Seçilen {selectedOfferIds.length} Ürün İçin Toplu Fiyatlandırma:</span>
            <button onClick={() => setBulkActionModal(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={bulkPriceType}
              onChange={(e) => setBulkPriceType(e.target.value as any)}
              className="border border-slate-300 rounded-xl p-2 bg-white font-medium"
            >
              <option value="PERCENT_INCREASE">Yüzdelik Zam Yap (+%)</option>
              <option value="PERCENT_DECREASE">Yüzdelik İndirim Yap (-%)</option>
              <option value="FIXED_ADD">Sabit Tutar Ekle (+ PLN)</option>
            </select>
            <input
              type="number"
              value={bulkPriceValue}
              onChange={(e) => setBulkPriceValue(parseFloat(e.target.value) || 0)}
              className="w-24 border border-slate-300 rounded-xl p-2 bg-white font-mono font-bold"
            />
            <button
              onClick={handleApplyBulkPrice}
              className="px-4 py-2 bg-[#14171A] hover:bg-black text-white rounded-full font-bold transition-all shadow-2xs"
            >
              Uygula & Kaydet
            </button>
          </div>
        </div>
      )}

      {bulkActionModal === 'STOCK' && (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-300 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs text-slate-900">
            <span>Seçilen {selectedOfferIds.length} Ürün İçin Toplu Stok Belirle:</span>
            <button onClick={() => setBulkActionModal(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <input
              type="number"
              min="0"
              value={bulkStockValue}
              onChange={(e) => setBulkStockValue(parseInt(e.target.value) || 0)}
              className="w-28 border border-slate-300 rounded-xl p-2 bg-white font-mono font-bold"
              placeholder="Adet"
            />
            <button
              onClick={handleApplyBulkStock}
              className="px-4 py-2 bg-[#14171A] hover:bg-black text-white rounded-full font-bold transition-all shadow-2xs"
            >
              Stokları Güncelle
            </button>
          </div>
        </div>
      )}

      {bulkActionModal === 'CATEGORY' && (
        <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 animate-in fade-in ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-lg'
        }`}>
          <div className="flex items-center justify-between font-bold text-xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span>Seçilen {selectedOfferIds.length} Ürün İçin Toplu eMAG Kategori Ata:</span>
            </div>
            <button onClick={() => setBulkActionModal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <EmagCategorySelector
            selectedCategoryId={bulkCategorySelectedId}
            onSelectCategory={(catId, cat) => {
              setBulkCategorySelectedId(catId);
              setBulkCategorySelectedName(cat.trName || cat.name);
            }}
            theme={theme}
            isDraft={true}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => setBulkActionModal(null)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300 font-semibold cursor-pointer"
            >
              İptal
            </button>
            <button
              onClick={() => {
                store.bulkUpdateOffersCategory(selectedOfferIds, bulkCategorySelectedId, bulkCategorySelectedName);
                setBulkNotice(`${selectedOfferIds.length} adet ürüne eMAG Kategori (#${bulkCategorySelectedId} - ${bulkCategorySelectedName}) başarıyla atandı!`);
                setBulkActionModal(null);
                setTimeout(() => setBulkNotice(null), 4000);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Kategoriyi Uygula ({selectedOfferIds.length} Ürün)</span>
            </button>
          </div>
        </div>
      )}

      {/* Tekil Ürün / Taslak İçin eMAG Kategori Seçim ve Atama Modalı */}
      {quickCategoryOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      eMAG Kategori Seçimi & Atama
                    </h3>
                    {(quickCategoryOffer.isDraft || quickCategoryOffer.publication?.status === 'DRAFT') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Taslak Ürün
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-md mt-0.5" title={quickCategoryOffer.name}>
                    {quickCategoryOffer.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickCategoryOffer(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                eMAG Taksonomisinden hedef kategori seçin. Seçtiğiniz kategori bu ürünün/taslağın şemasına ve eMAG API gönderim profiline kaydedilecektir.
              </span>
            </div>

            <EmagCategorySelector
              selectedCategoryId={
                quickCategoryOffer.channelData?.emag?.categoryId ||
                quickCategoryOffer.excelMetadata?.emagCategoryCode ||
                quickCategoryOffer.category?.id ||
                '202'
              }
              onSelectCategory={(catId, cat) => {
                store.updateOfferCategory(quickCategoryOffer.id, catId, cat.trName || cat.name);
                setBulkNotice(`Ürün kategorisi eMAG #${catId} (${cat.trName || cat.name}) olarak güncellendi!`);
                setQuickCategoryOffer(null);
                setTimeout(() => setBulkNotice(null), 4000);
              }}
              theme={theme}
              isDraft={Boolean(quickCategoryOffer.isDraft || quickCategoryOffer.publication?.status === 'DRAFT')}
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-mono text-slate-400">
                Mevcut Kategori: #{quickCategoryOffer.channelData?.emag?.categoryId || quickCategoryOffer.excelMetadata?.emagCategoryCode || quickCategoryOffer.category?.id || '-'}
              </span>
              <button
                onClick={() => setQuickCategoryOffer(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Vazgeç / Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers List: Mobile Cards (< md) & Desktop Table (>= md) */}
      <div className="space-y-3">
        {/* Dedicated Marketplace Source Dropdown Filter Bar Above Table */}
        <div className={`p-3 sm:p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Marketplace Source:</span>
            </div>

            {/* Dropdown Selector */}
            <div className="relative">
              <select
                aria-label="Filter products by Marketplace Source"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className={`px-3 py-1.5 pr-8 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs ${
                  sourceFilter === 'emag'
                    ? 'bg-blue-50 border-blue-300 text-[#0056B3] dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-300'
                    : sourceFilter === 'allegro'
                    ? 'bg-orange-50 border-orange-300 text-[#FF5A00] dark:bg-orange-950/60 dark:border-orange-700 dark:text-orange-300'
                    : sourceFilter === 'baselinker'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-300'
                    : isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">All Marketplaces ({sourceCounts.ALL} items)</option>
                <option value="emag">eMAG ({sourceCounts.emag} items)</option>
                <option value="allegro">Allegro ({sourceCounts.allegro} items)</option>
                <option value="baselinker">BaseLinker ({sourceCounts.baselinker} items)</option>
              </select>
            </div>

            {/* Quick Toggle Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sourceFilter === 'ALL'
                    ? 'bg-[#14171A] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300'
                }`}
              >
                All ({sourceCounts.ALL})
              </button>
              <button
                onClick={() => setSourceFilter('emag')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sourceFilter === 'emag'
                    ? 'bg-[#0056B3] text-white shadow-2xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-[#0056B3] border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
                }`}
              >
                <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                <span>eMAG ({sourceCounts.emag})</span>
              </button>
              <button
                onClick={() => setSourceFilter('allegro')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sourceFilter === 'allegro'
                    ? 'bg-[#FF5A00] text-white shadow-2xs'
                    : 'bg-orange-50 hover:bg-orange-100 text-[#FF5A00] border border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300'
                }`}
              >
                <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                <span>Allegro ({sourceCounts.allegro})</span>
              </button>
              <button
                onClick={() => setSourceFilter('baselinker')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sourceFilter === 'baselinker'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
                }`}
              >
                <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                <span>BaseLinker ({sourceCounts.baselinker})</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Showing <span className="font-bold text-slate-900 dark:text-zinc-100">{filteredOffers.length}</span> of {offers.length} products
          </div>
        </div>

        {/* Mobile View: High-Fidelity Touch Cards */}
        <div className="md:hidden space-y-3">
          {filteredOffers.length === 0 ? (
            <div className={`text-center py-10 px-4 rounded-3xl border space-y-3 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-bold text-xl shadow-2xs">
                📦
              </div>
              <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                {offers.length === 0 ? 'Henüz Ürün Çekilmedi (Canlı Pazaryeri Modu)' : 'Kriterlere uygun ürün bulunamadı.'}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {offers.length === 0
                  ? 'Bağlı pazaryerlerinizdeki (eMAG, Allegro, BaseLinker) gerçek ürün tekliflerini aşağıdaki butonlardan tek tıkla içeri aktarabilirsiniz.'
                  : 'Filtreleri veya arama kelimesini değiştirerek tekrar deneyebilirsiniz.'}
              </p>

              {offers.length === 0 && (
                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  <button
                    onClick={handleFetchEmagProducts}
                    disabled={isFetchingEmag}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <MarketplaceLogo platform="emag" size="xs" rounded="md" />
                    <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingEmag ? 'animate-bounce' : ''}`} />
                    <span>eMAG Çek</span>
                  </button>
                  <button
                    onClick={handleFetchAllegroProducts}
                    disabled={isFetchingAllegro}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <MarketplaceLogo platform="allegro" size="xs" rounded="md" />
                    <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingAllegro ? 'animate-bounce' : ''}`} />
                    <span>Allegro Çek</span>
                  </button>
                  <button
                    onClick={handleFetchBaseLinkerProducts}
                    disabled={isFetchingBaseLinker}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <MarketplaceLogo platform="baselinker" size="xs" rounded="md" />
                    <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingBaseLinker ? 'animate-bounce' : ''}`} />
                    <span>BaseLinker Çek</span>
                  </button>
                  <button
                    onClick={handleFetchAllMarketplaces}
                    disabled={isFetchingAll}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetchingAll ? 'animate-spin' : ''}`} />
                    <span>Tümünü Çek & Eşitle</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredOffers.map((offer) => {
              const isSelected = selectedOfferIds.includes(offer.id);
              const isEditingPrice = editingPriceId === offer.id;
              const isEditingStock = editingStockId === offer.id;
              const pricePln = parseFloat(offer.sellingMode.price.amount);

              return (
                <div
                  key={offer.id}
                  className={`p-4 rounded-3xl border space-y-3 shadow-2xs transition-all ${
                    isSelected
                      ? 'border-[#14171A] ring-2 ring-[#14171A]/20 bg-slate-50/70'
                      : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelectItem(offer.id)}
                      className="p-1 text-slate-400 hover:text-slate-900 mt-1 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#14171A]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <ProductImage
                      src={
                        offer.primaryImage &&
                        offer.primaryImage !== '/products/no_image.svg' &&
                        offer.primaryImage.trim() !== '' &&
                        !offer.primaryImage.includes('unsplash.com')
                          ? offer.primaryImage
                          : resolveProductImage(offer)
                      }
                      alt={offer.name}
                      className="w-14 h-14 rounded-xl"
                      isDark={isDark}
                      showChangeButton={true}
                      isLoading={fetchingImageOfferId === offer.id}
                      onClick={() => handleFetchSingleEmagImage(offer)}
                      onChangeClick={() => handleFetchSingleEmagImage(offer)}
                      buttonLabel="eMAG'den Çek"
                      buttonTitle="eMAG'den Resmi Çek & Güncelle"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[#7D8F99] truncate">
                          ID: {offer.id} · SKU: {offer.sku}
                        </span>
                        {offer.isDraft || offer.publication?.status === 'DRAFT' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                            TASLAK
                          </span>
                        ) : (offer.publication?.status || 'ACTIVE') === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                            YAYINDA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-500">
                            SONLANDI
                          </span>
                        )}
                      </div>
                      <div className={`font-semibold text-xs line-clamp-2 leading-snug ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                        {offer.name}
                      </div>
                      <div className="flex items-center justify-between gap-1 text-[11px] text-[#7D8F99]">
                        <span className="truncate">{offer.category.name}</span>
                        <button
                          type="button"
                          onClick={() => setQuickCategoryOffer(offer)}
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0 cursor-pointer flex items-center gap-0.5"
                          title="eMAG Kategori Değiştir"
                        >
                          <FolderTree className="w-2.5 h-2.5 text-blue-600" />
                          <span>Kategori Seç</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price & Stock Row with Direct Touch Editing */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    {/* Price Cell */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-[#7D8F99] font-medium flex items-center justify-between">
                        <span>Fiyat ({offer.sellingMode.price.currency})</span>
                        {!isEditingPrice && (
                          <button
                            onClick={() => handleStartEditPrice(offer)}
                            className="text-[#14171A] hover:underline p-0.5"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                          </button>
                        )}
                      </div>
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            step="0.01"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-full bg-white border border-[#14171A] rounded p-1 text-xs font-mono font-bold text-right"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(offer.id)}
                            className="p-1 bg-emerald-600 text-white rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-0.5">
                          <div className="text-xs font-mono font-bold text-[#14171A] dark:text-white">
                            {offer.sellingMode.price.amount} {offer.sellingMode.price.currency}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            ≈ {store.formatConverted(pricePln)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stock Cell */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-[#7D8F99] font-medium flex items-center justify-between">
                        <span>Stok Miktarı</span>
                        {!isEditingStock && (
                          <button
                            onClick={() => handleStartEditStock(offer)}
                            className="text-[#14171A] hover:underline p-0.5"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                          </button>
                        )}
                      </div>
                      {isEditingStock ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            min="0"
                            value={editStockValue}
                            onChange={(e) => {
                              const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                              setEditStockValue(isNaN(v) ? 0 : Math.max(0, v));
                            }}
                            className="w-full bg-white border border-[#14171A] rounded p-1 text-xs font-mono font-bold text-center"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveStock(offer.id)}
                            className="p-1 bg-emerald-600 text-white rounded cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-0.5">
                          <div className={`text-xs font-mono font-bold ${offer.stock.available <= 15 ? 'text-amber-600' : 'text-slate-900 dark:text-zinc-100'}`}>
                            {offer.stock.available} {offer.stock.unit.toLowerCase()}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            Allegro + eMAG bağlı
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Marketplace Source & Quick Actions */}
                  {(() => {
                    const origin = getOfferOrigin(offer);
                    return (
                      <div className="flex items-center justify-between pt-2 gap-2 text-[10px] border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-medium">Source:</span>
                          {origin.url ? (
                            <a
                              href={origin.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer ${origin.bgColor} ${origin.textColor} ${origin.borderColor}`}
                              title={`${origin.label} sayfasını aç`}
                            >
                              <MarketplaceLogo platform={origin.platform} size="xs" rounded="full" />
                              <span>{origin.label}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                            </a>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${origin.bgColor} ${origin.textColor} ${origin.borderColor}`}>
                              {origin.platform === 'excel' ? (
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <FileCheck className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                              )}
                              <span>{origin.label}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(offer.isDraft || offer.publication?.status === 'DRAFT') && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveTransferMenuOfferId(prev => (prev === offer.id ? null : offer.id))
                                }
                                className="text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                title="Pazaryeri Seç ve Aktar"
                              >
                                <Rocket className="w-3 h-3" />
                                <span>Pazaryerine Aktar</span>
                                <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                              </button>

                              {activeTransferMenuOfferId === offer.id && (
                                <div className="absolute right-0 bottom-full mb-1.5 w-52 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 text-slate-800 dark:text-zinc-100 animate-in fade-in zoom-in-95">
                                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                                    Hedef Pazaryeri Seç
                                  </div>
                                  <button
                                    onClick={() => handleTransferOfferToMarketplace(offer, 'allegro')}
                                    className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                                    <span>Allegro'ya Aktar</span>
                                  </button>
                                  <button
                                    onClick={() => handleTransferOfferToMarketplace(offer, 'emag')}
                                    className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                                    <span>eMAG'a Aktar</span>
                                  </button>
                                  <button
                                    onClick={() => handleTransferOfferToMarketplace(offer, 'baselinker')}
                                    className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                                    <span>BaseLinker'a Aktar</span>
                                  </button>
                                  <button
                                    onClick={() => handleTransferOfferToMarketplace(offer, 'ALL')}
                                    className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800 mt-1 pt-1.5 cursor-pointer transition-colors"
                                  >
                                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Tüm Pazaryerlerine Aktar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => setEditingOffer(offer)}
                            className="text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Revize Et</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`"${offer.name}" ürününü panelden silmek istediğinize emin misiniz?`)) {
                                store.removeOffer(offer.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Ürünü Panelden Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop & Tablet View: Structured Data Table (>= md) */}
        <div className={`hidden md:block border rounded-3xl overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${
                  isDark ? 'border-zinc-800 bg-zinc-950/70 text-zinc-400' : 'border-slate-200 bg-slate-50/80 text-slate-500'
                }`}>
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#14171A]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 font-bold">Ürün & Detay</th>
                  <th className="py-3 px-4 font-bold">Marketplace Source</th>
                  <th className="py-3 px-4 font-bold">Kategori</th>
                  <th className="py-3 px-4 font-bold text-right">Satış Fiyatı ({activeCurrency})</th>
                  <th className="py-3 px-4 font-bold text-center">Stok</th>
                  <th className="py-3 px-4 font-bold text-center">Durum</th>
                  <th className="py-3 px-4 font-bold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800/80' : 'divide-slate-100'}`}>
                {filteredOffers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 mx-auto flex items-center justify-center font-bold text-xl shadow-2xs">
                          📦
                        </div>
                        <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                          {offers.length === 0 ? 'Henüz Ürün Çekilmedi (Canlı Pazaryeri Modu)' : 'Kriterlere uygun ürün bulunamadı.'}
                        </div>
                        <p className="text-xs text-slate-400">
                          {offers.length === 0
                            ? 'Bağlı pazaryerlerinizdeki (eMAG, Allegro, BaseLinker) gerçek ürünleri aşağıdaki butonlardan tek tıkla içeri aktarabilirsiniz.'
                            : 'Filtreleri veya arama kelimesini değiştirerek tekrar deneyebilirsiniz.'}
                        </p>

                        {offers.length === 0 && (
                          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                            <button
                              onClick={handleFetchEmagProducts}
                              disabled={isFetchingEmag}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <MarketplaceLogo platform="emag" size="xs" rounded="md" />
                              <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingEmag ? 'animate-bounce' : ''}`} />
                              <span>eMAG Çek</span>
                            </button>
                            <button
                              onClick={handleFetchAllegroProducts}
                              disabled={isFetchingAllegro}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <MarketplaceLogo platform="allegro" size="xs" rounded="md" />
                              <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingAllegro ? 'animate-bounce' : ''}`} />
                              <span>Allegro Çek</span>
                            </button>
                            <button
                              onClick={handleFetchBaseLinkerProducts}
                              disabled={isFetchingBaseLinker}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <MarketplaceLogo platform="baselinker" size="xs" rounded="md" />
                              <Download className={`w-3.5 h-3.5 text-slate-400 ${isFetchingBaseLinker ? 'animate-bounce' : ''}`} />
                              <span>BaseLinker Çek</span>
                            </button>
                            <button
                              onClick={handleFetchAllMarketplaces}
                              disabled={isFetchingAll}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetchingAll ? 'animate-spin' : ''}`} />
                              <span>Tümünü Çek & Eşitle</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOffers.map((offer) => {
                    const isSelected = selectedOfferIds.includes(offer.id);
                    const isEditingPrice = editingPriceId === offer.id;
                    const isEditingStock = editingStockId === offer.id;
                    const pricePln = parseFloat(offer.sellingMode.price.amount);

                    return (
                      <tr key={offer.id} className={`transition-colors ${
                        isSelected
                          ? 'bg-slate-50/90 font-medium'
                          : isDark ? 'hover:bg-zinc-850/60' : 'hover:bg-slate-50/70'
                      }`}>
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleSelectItem(offer.id)}
                            className="cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#14171A]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>

                        {/* Product Thumbnail & Identification */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-3 max-w-sm">
                            <ProductImage
                              src={
                                offer.primaryImage &&
                                offer.primaryImage !== '/products/no_image.svg' &&
                                offer.primaryImage.trim() !== '' &&
                                !offer.primaryImage.includes('unsplash.com')
                                  ? offer.primaryImage
                                  : resolveProductImage(offer)
                              }
                              alt={offer.name}
                              className="w-12 h-12 rounded-xl"
                              isDark={isDark}
                              showChangeButton={true}
                              isLoading={fetchingImageOfferId === offer.id}
                              onClick={() => handleFetchSingleEmagImage(offer)}
                              onChangeClick={() => handleFetchSingleEmagImage(offer)}
                              buttonLabel="eMAG'den Çek"
                              buttonTitle="eMAG'den Resmi Çek & Güncelle"
                            />
                            <div className="space-y-1">
                              <div className={`font-semibold line-clamp-2 leading-snug ${
                                isDark ? 'text-zinc-100' : 'text-slate-900'
                              }`}>
                                {offer.name}
                              </div>
                              <div className={`flex items-center gap-2 text-[11px] font-mono ${
                                isDark ? 'text-zinc-400' : 'text-slate-500'
                              }`}>
                                <span>SKU: {offer.sku}</span>
                                {offer.ean && (
                                  <>
                                    <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>·</span>
                                    <span>EAN: {offer.ean}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="font-mono text-[#5D7079]">ID: {offer.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Marketplace Source Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {(() => {
                            const origin = getOfferOrigin(offer);
                            return (
                              <div className="flex flex-col items-start gap-1">
                                {origin.url ? (
                                  <a
                                    href={origin.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shadow-2xs hover:shadow-xs cursor-pointer ${origin.bgColor} ${origin.textColor} ${origin.borderColor}`}
                                    title={`${origin.label} üzerindeki ürün sayfasına git (Yeni sekmede açılır)`}
                                  >
                                    <MarketplaceLogo platform={origin.platform} size="xs" rounded="full" />
                                    <span>{origin.label}</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                                  </a>
                                ) : (
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${origin.bgColor} ${origin.textColor} ${origin.borderColor}`}>
                                    {origin.platform === 'excel' ? (
                                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                      <FileCheck className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                    )}
                                    <span>{origin.label}</span>
                                  </div>
                                )}
                                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 pl-0.5">
                                  {origin.idLabel}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Category */}
                        <td className={`py-3.5 px-4 max-w-[190px] ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                          {(() => {
                            const titleLower = (offer.name || '').toLowerCase();
                            const isPet = titleLower.includes('psa') || titleLower.includes('pies') || titleLower.includes('kot') || titleLower.includes('köpek') || titleLower.includes('kedi') || titleLower.includes('dom dla psa') || titleLower.includes('mata') || titleLower.includes('łóżko') || titleLower.includes('legowisk') || titleLower.includes('culcus') || titleLower.includes('pet') || titleLower.includes('dog') || titleLower.includes('cat');
                            const isLed = !isPet && (titleLower.includes('led') || titleLower.includes('strip') || titleLower.includes('şerit') || titleLower.includes('rgb') || titleLower.includes('cob') || titleLower.includes('lampa'));
                            const isBedding = titleLower.includes('pościel') || titleLower.includes('poszewk') || titleLower.includes('nevresim') || titleLower.includes('bedding');
                            
                            let catDisplay = offer.category?.name || 'Genel Kategori';
                            let idDisplay = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || offer.category?.id || '-';
                            let badgeInfo: string | null = null;

                            if (isPet) {
                              catDisplay = offer.excelMetadata?.emagCategoryName || offer.excelMetadata?.matchedCategoryName || 'Evcil Hayvan & Köpek/Kedi Yatakları';
                              idDisplay = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || '3122';
                              badgeInfo = 'eMAG: 3122 · Pet Shop';
                            } else if (isLed) {
                              catDisplay = 'RGB LED Şerit & Akıllı Aydınlatma';
                              idDisplay = '257548 / 12800';
                              badgeInfo = 'eMAG: 257548 · Allegro: 12800';
                            } else if (isBedding) {
                              catDisplay = 'Ev Tekstili, Nevresim Takımları & Pościel';
                              idDisplay = '3690';
                              badgeInfo = 'eMAG: 3690 · Tekstil';
                            } else if (offer.excelMetadata?.matchedCategoryName) {
                              catDisplay = offer.excelMetadata.matchedCategoryName;
                              idDisplay = offer.excelMetadata.emagCategoryCode || offer.excelMetadata.matchedCategoryCode || offer.category.id;
                              badgeInfo = 'Excel Eşleşmesi';
                            }

                            return (
                              <>
                                <div className="truncate text-xs font-medium" title={catDisplay}>
                                  {catDisplay}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                                    Kat. ID: {idDisplay}
                                  </span>
                                  {badgeInfo && (
                                    <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      {badgeInfo}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setQuickCategoryOffer(offer)}
                                    className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-0.5 cursor-pointer ml-auto"
                                    title="Bu ürün için eMAG kategorisi seç / değiştir"
                                  >
                                    <FolderTree className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                    <span>Seç</span>
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-right">
                          {isEditingPrice ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.01"
                                value={editPriceValue}
                                onChange={(e) => setEditPriceValue(e.target.value)}
                                className="w-20 bg-white border border-[#14171A] rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePrice(offer.id)}
                                className="p-1 text-emerald-600 hover:text-emerald-500"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingPriceId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center justify-end gap-1.5">
                              <div className="font-mono font-bold tabular-nums text-sm text-slate-900">
                                {offer.sellingMode.price.amount} {offer.sellingMode.price.currency}
                              </div>
                              <button
                                onClick={() => handleStartEditPrice(offer)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#14171A] transition-opacity"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="text-[10px] font-mono text-slate-400">
                            ≈ {store.formatConverted(pricePln)} · {(pricePln * 1.15).toFixed(2)} RON
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4 text-center">
                          {isEditingStock ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={editStockValue}
                                onChange={(e) => {
                                  const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                  setEditStockValue(isNaN(v) ? 0 : Math.max(0, v));
                                }}
                                className="w-16 bg-white border border-[#14171A] rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveStock(offer.id)}
                                className="p-1 text-emerald-600 hover:text-emerald-500 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStockId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center justify-center gap-1">
                              <span
                                className={`font-mono font-bold tabular-nums ${
                                  offer.stock.available <= 15 ? 'text-amber-600' : 'text-slate-800'
                                }`}
                              >
                                {offer.stock.available} {offer.stock.unit.toLowerCase()}
                              </span>
                              <button
                                onClick={() => handleStartEditStock(offer)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#14171A] transition-opacity"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {offer.isDraft || offer.publication?.status === 'DRAFT' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                              TASLAK
                            </span>
                          ) : (offer.publication?.status || 'ACTIVE') === 'ACTIVE' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                              YAYINDA
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-500">
                              SONLANDI
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(offer.isDraft || offer.publication?.status === 'DRAFT') && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setActiveTransferMenuOfferId(prev => (prev === offer.id ? null : offer.id))
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                  title="Pazaryeri Seç ve Aktar"
                                >
                                  <Rocket className="w-3 h-3" />
                                  <span>Pazaryerine Aktar</span>
                                  <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                                </button>

                                {activeTransferMenuOfferId === offer.id && (
                                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 text-slate-800 dark:text-zinc-100 text-left animate-in fade-in zoom-in-95">
                                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                                      Hedef Pazaryeri Seç
                                    </div>
                                    <button
                                      onClick={() => handleTransferOfferToMarketplace(offer, 'allegro')}
                                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                                      <span>Allegro'ya Aktar</span>
                                    </button>
                                    <button
                                      onClick={() => handleTransferOfferToMarketplace(offer, 'emag')}
                                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                                      <span>eMAG'a Aktar</span>
                                    </button>
                                    <button
                                      onClick={() => handleTransferOfferToMarketplace(offer, 'baselinker')}
                                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                                      <span>BaseLinker'a Aktar</span>
                                    </button>
                                    <button
                                      onClick={() => handleTransferOfferToMarketplace(offer, 'ALL')}
                                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800 mt-1 pt-1.5 cursor-pointer transition-colors"
                                    >
                                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Tüm Pazaryerlerine Aktar</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            <button
                              onClick={() => setEditingOffer(offer)}
                              className="px-2.5 py-1 rounded-lg border text-slate-700 dark:text-zinc-200 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Ürün Bilgilerini Revize Et"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>Revize Et</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`"${offer.name}" ürününü panelden silmek istediğinize emin misiniz?`)) {
                                  store.removeOffer(offer.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Ürünü Panelden Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FULL PRODUCT EDIT / REVISION MODAL */}
      {editingOffer && (
        <CreateOfferModal
          isOpen={Boolean(editingOffer)}
          onClose={() => setEditingOffer(null)}
          offerToEdit={editingOffer}
          theme={theme}
        />
      )}

      {/* JIGULI PANEL DATA RESET MODAL */}
      <ResetPanelModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={(msg) => {
          setBulkNotice(msg);
          setTimeout(() => setBulkNotice(null), 7000);
        }}
        theme={theme}
      />

      {/* eMAG IMAGE DIAGNOSTIC & LOG MODAL */}
      <EmagImageDiagnosticModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        diagnostics={diagnosticData}
        productName={diagnosticProductName}
        onManualUrlSubmit={(url) => {
          if (diagnosticOfferId) {
            store.updateOfferImage(diagnosticOfferId, url);
            setBulkNotice('🟢 Görsel URL adresi başarıyla güncellendi!');
            setTimeout(() => setBulkNotice(null), 4000);
          }
        }}
      />
      {/* eMAG STEP-BY-STEP PUBLISH EXECUTION LOGS MODAL */}
      <EmagExecutionLogsModal
        isOpen={showEmagLogsModal}
        onClose={() => setShowEmagLogsModal(false)}
        report={emagLogReport}
        onRetry={() => {
          if (emagLogReport?.partNumberKey) {
            const found = offers.find(o => o.sku === emagLogReport.partNumberKey || o.id === emagLogReport.partNumberKey);
            if (found) {
              handlePublishSingleOfferToEmag(found);
            }
          }
        }}
        theme={theme}
      />

      {/* EXCEL PRODUCT IMPORT MODAL (Excel ile Ürün Yükleme) */}
      <ExcelProductImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onImportComplete={(count) => {
          setBulkNotice(`🟢 ${count} adet ürün Excel dosyasından başarıyla TASLAK (DRAFT) olarak panelinize eklendi!`);
          setStatusFilter('DRAFT');
          setTimeout(() => setBulkNotice(null), 8000);
        }}
      />

      {/* MISSING MANDATORY CHARACTERISTICS PROMPT MODAL */}
      {pendingPublishOffer && (
        <MissingCharacteristicsPromptModal
          isOpen={showMissingCharsModal}
          onClose={() => {
            setShowMissingCharsModal(false);
            setPendingPublishOffer(null);
            setMissingCharsValidation(null);
          }}
          productTitle={pendingPublishOffer.name}
          categoryId={missingCharsValidation?.categoryId || 202}
          categoryName={missingCharsValidation?.categoryName}
          validationResult={missingCharsValidation}
          onConfirmAndPublish={(completedCharacteristics) => {
            const target = pendingPublishOffer;
            setShowMissingCharsModal(false);
            setPendingPublishOffer(null);
            setMissingCharsValidation(null);
            if (target) {
              handlePublishSingleOfferToEmag(target, completedCharacteristics);
            }
          }}
        />
      )}
    </div>
  );
};
