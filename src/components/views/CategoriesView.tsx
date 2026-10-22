import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Tag,
  RefreshCw,
  Sparkles,
  Layers,
  ShieldCheck,
  Database,
  Check,
  Plus,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroCategory, AllegroParameter, AllegroOffer } from '../../types/allegro';
import {
  emagTaxonomySyncService,
  EmagCategoryItem,
  EmagCharacteristicItem,
  TaxonomySyncStats
} from '../../services/emagTaxonomySyncService';
import {
  allegroTaxonomySyncService,
  AllegroCategoryItem,
  AllegroTaxonomyStats
} from '../../services/allegroTaxonomySyncService';

interface CategoriesViewProps {
  theme: 'light' | 'dark';
  onOpenCreateOffer?: (categoryId?: number | string) => void;
  onNavigateToOffers?: () => void;
}

const ALLEGRO_ROOT_GROUPS = [
  { id: 'ALL', label: 'Tüm Allegro Kategorileri' },
  { id: '42540aec-367a-4e5e-b411-17c09b08e41f', label: 'Elektronika' },
  { id: '5', label: 'Dom i Ogród (Ev & Bahçe)' },
  { id: 'ea5b98dd-4b6f-4bd0-8c80-22c2629132d0', label: 'Moda & Giyim' },
  { id: '258832', label: 'Supermarket & Pet' },
  { id: '1429', label: 'Uroda (Güzellik)' },
  { id: '121882', label: 'Zdrowie (Sağlık)' },
  { id: '3', label: 'Motoryzacja (Oto)' },
  { id: '3919', label: 'Sport i turystyka' },
  { id: '11763', label: 'Dziecko (Bebek & Çocuk)' }
];

const EMAG_GROUPS = [
  { id: 'ALL', label: 'Tüm Kategoriler' },
  { id: 'SMART', label: 'Akıllı Ev & IoT', parentMatch: [42540, 202, 203, 204, 205, 206, 207, 208] },
  { id: 'LIGHTING', label: 'Aydınlatma & LED', parentMatch: [6001, 257548, 6002, 6003, 6004, 6005, 6006] },
  { id: 'PET', label: 'Evcil Hayvan (Pet)', parentMatch: [3120, 3122, 3125, 3126, 3127, 3128, 3129] },
  { id: 'HOME', label: 'Ev & Tekstil', parentMatch: [3690, 3691, 3692, 3693, 3694, 5342, 106, 108, 109] },
  { id: 'ELECTRONICS', label: 'Telefon & IT', parentMatch: [101, 1001, 1249, 1250, 1251, 4001, 4002, 4003, 4004, 4005, 4006, 4007] },
  { id: 'AUTO', label: 'Oto & Araç', parentMatch: [5001, 5002, 5003, 5004, 5005] },
  { id: 'TOOLS', label: 'El Aletleri & Bricolaj', parentMatch: [8001, 8002, 8003, 8004] },
  { id: 'FASHION', label: 'Moda & Kişisel Bakım', parentMatch: [7001, 1454, 7002, 7003, 7004] }
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  theme,
  onOpenCreateOffer,
  onNavigateToOffers
}) => {
  const isDark = theme === 'dark';
  const [activePlatformTab, setActivePlatformTab] = useState<'allegro' | 'emag'>('allegro');

  // Allegro state
  const [allegroCategories, setAllegroCategories] = useState<AllegroCategory[]>(store.getCategories());
  const [allegroTaxonomyList, setAllegroTaxonomyList] = useState<AllegroCategoryItem[]>([]);
  const [allegroStats, setAllegroStats] = useState<AllegroTaxonomyStats>(allegroTaxonomySyncService.getStats());
  const [selectedAllegroCategoryId, setSelectedAllegroCategoryId] = useState<string>('257548');
  const [selectedAllegroItem, setSelectedAllegroItem] = useState<AllegroCategoryItem | null>(null);
  const [activeAllegroRoot, setActiveAllegroRoot] = useState('ALL');
  const [allegroSearch, setAllegroSearch] = useState('');
  const [paramSearch, setParamSearch] = useState('');
  const [isSyncingAllegro, setIsSyncingAllegro] = useState(false);
  const [allegroSyncFeedback, setAllegroSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [liveAllegroParams, setLiveAllegroParams] = useState<any[]>([]);
  const [isLoadingAllegroParams, setIsLoadingAllegroParams] = useState(false);

  // eMAG state
  const [emagCategories, setEmagCategories] = useState<EmagCategoryItem[]>(
    emagTaxonomySyncService.getCategories()
  );
  const [selectedEmagCategoryId, setSelectedEmagCategoryId] = useState<number>(
    emagCategories[0]?.id || 202
  );
  const [emagSearch, setEmagSearch] = useState('');
  const [activeEmagGroup, setActiveEmagGroup] = useState('ALL');
  const [isSyncingEmag, setIsSyncingEmag] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    durationMs?: number;
    serverIp?: string;
  } | null>(null);

  const [taxonomyStats, setTaxonomyStats] = useState<TaxonomySyncStats>(
    emagTaxonomySyncService.getStats()
  );

  // Draft offers state for direct category assignment
  const [draftOffers, setDraftOffers] = useState<AllegroOffer[]>(() =>
    store.getOffers().filter(o => o.isDraft || o.publication?.status === 'DRAFT')
  );
  const [isAssignDraftModalOpen, setIsAssignDraftModalOpen] = useState(false);
  const [selectedDraftIdToAssign, setSelectedDraftIdToAssign] = useState<string>('');

  useEffect(() => {
    // Initial fetch from backend for eMAG
    emagTaxonomySyncService.loadAllCategoriesFromBackend().then((cats) => {
      if (cats && cats.length > 0) {
        setEmagCategories(cats);
        setTaxonomyStats(emagTaxonomySyncService.getStats());
      }
    });

    // Initial fetch for Allegro full taxonomy
    allegroTaxonomySyncService.loadAllCategoriesFromBackend().then((cats) => {
      if (cats && cats.length > 0) {
        setAllegroTaxonomyList(cats);
        setAllegroStats(allegroTaxonomySyncService.getStats());
        if (cats[0]) setSelectedAllegroItem(cats[0]);
      }
    });

    const unsubscribeAllegro = allegroTaxonomySyncService.subscribe(() => {
      setAllegroTaxonomyList(allegroTaxonomySyncService.getCategories());
      setAllegroStats(allegroTaxonomySyncService.getStats());
    });

    const unsubscribeEmag = emagTaxonomySyncService.subscribe(() => {
      setEmagCategories(emagTaxonomySyncService.getCategories());
      setTaxonomyStats(emagTaxonomySyncService.getStats());
    });

    const unsubscribeStore = store.subscribe(() => {
      setAllegroCategories(store.getCategories());
      setDraftOffers(store.getOffers().filter(o => o.isDraft || o.publication?.status === 'DRAFT'));
    });

    return () => {
      unsubscribeAllegro();
      unsubscribeEmag();
      unsubscribeStore();
    };
  }, []);

  const handleSyncAllEmagCategories = async () => {
    setIsSyncingEmag(true);
    setSyncFeedback({
      type: 'info',
      message: 'eMAG API taksonomi ağacı (/api-3/category/read) çekiliyor ve yerel veritabanına kaydediliyor...'
    });

    const start = Date.now();
    try {
      const res = await emagTaxonomySyncService.syncWithEmagApi();
      const duration = Date.now() - start;

      if (res.success) {
        setEmagCategories(res.categories);
        setTaxonomyStats(res.stats);
        setSyncFeedback({
          type: 'success',
          message: `eMAG resmi taksonomi ağacı başarıyla güncellendi! Toplam ${res.categories.length} kategori ve ${res.stats.totalCharacteristics} özellik sisteme kaydedildi.`,
          durationMs: duration,
          serverIp: res.stats.serverIp
        });
      } else {
        setSyncFeedback({
          type: 'info',
          message: 'Kategori verileri yerel önbellekten yüklendi.',
          durationMs: duration
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Hata: ${err?.message || err}`
      });
    } finally {
      setIsSyncingEmag(false);
    }
  };

  // Filtered eMAG categories
  const filteredEmagCategories = useMemo(() => {
    let result = emagCategories;

    if (activeEmagGroup !== 'ALL') {
      const groupDef = EMAG_GROUPS.find(g => g.id === activeEmagGroup);
      if (groupDef?.parentMatch) {
        const idSet = new Set(groupDef.parentMatch);
        result = result.filter(c => idSet.has(c.id) || (c.parentId && idSet.has(c.parentId)));
      }
    }

    if (emagSearch.trim()) {
      const q = emagSearch.toLowerCase().trim();
      result = result.filter(c =>
        String(c.id).includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.trName && c.trName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [emagCategories, activeEmagGroup, emagSearch]);

  const selectedEmagCategory = useMemo(() => {
    return emagCategories.find(c => c.id === selectedEmagCategoryId) || emagCategories[0];
  }, [emagCategories, selectedEmagCategoryId]);

  const emagCharacteristics: EmagCharacteristicItem[] = useMemo(() => {
    if (!selectedEmagCategory) return [];
    return emagTaxonomySyncService.getCharacteristicsForCategory(selectedEmagCategory.id);
  }, [selectedEmagCategory]);

  const handleSyncAllAllegroCategories = async () => {
    setIsSyncingAllegro(true);
    setAllegroSyncFeedback({
      type: 'info',
      message: 'Allegro API resmi taksonomi ağacı (/sale/categories) çekiliyor ve yerel veritabanına kaydediliyor...'
    });

    try {
      const res = await allegroTaxonomySyncService.syncAllCategories();
      if (res.success) {
        setAllegroSyncFeedback({
          type: 'success',
          message: `Allegro resmi taksonomisi başarıyla güncellendi! Toplam ${res.count.toLocaleString()} kategori yerel veritabanına kaydedildi.`
        });
      } else {
        setAllegroSyncFeedback({
          type: 'error',
          message: res.message || 'Senkronizasyon hatası.'
        });
      }
    } catch (err: any) {
      setAllegroSyncFeedback({
        type: 'error',
        message: `Hata: ${err?.message || err}`
      });
    } finally {
      setIsSyncingAllegro(false);
    }
  };

  // Fetch parameters when selected category changes
  useEffect(() => {
    if (!selectedAllegroCategoryId) return;
    setIsLoadingAllegroParams(true);
    allegroTaxonomySyncService.fetchParameters(selectedAllegroCategoryId).then((params) => {
      setLiveAllegroParams(params || []);
      setIsLoadingAllegroParams(false);
    }).catch(() => {
      setIsLoadingAllegroParams(false);
    });
  }, [selectedAllegroCategoryId]);

  // Dynamic filter for Allegro
  const [debouncedAllegroSearch, setDebouncedAllegroSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAllegroSearch(allegroSearch), 300);
    return () => clearTimeout(t);
  }, [allegroSearch]);

  const [filteredAllegroList, setFilteredAllegroList] = useState<AllegroCategoryItem[]>([]);
  const [isSearchingAllegro, setIsSearchingAllegro] = useState(false);

  useEffect(() => {
    setIsSearchingAllegro(true);
    const params: any = { limit: 120 };
    if (activeAllegroRoot !== 'ALL') {
      params.parentId = activeAllegroRoot;
    }
    if (debouncedAllegroSearch.trim()) {
      params.q = debouncedAllegroSearch.trim();
    }
    allegroTaxonomySyncService.fetchCategories(params).then((cats) => {
      if (cats && cats.length > 0) {
        setFilteredAllegroList(cats);
        if (!selectedAllegroItem || !cats.some(c => c.id === selectedAllegroItem.id)) {
          setSelectedAllegroItem(cats[0]);
          setSelectedAllegroCategoryId(cats[0].id);
        }
      } else if (!debouncedAllegroSearch.trim() && activeAllegroRoot === 'ALL') {
        const roots = allegroTaxonomySyncService.getRootCategories();
        setFilteredAllegroList(roots);
      } else {
        setFilteredAllegroList([]);
      }
      setIsSearchingAllegro(false);
    }).catch(() => {
      setIsSearchingAllegro(false);
    });
  }, [activeAllegroRoot, debouncedAllegroSearch]);

  const filteredAllegroParams = liveAllegroParams.filter((p: any) =>
    (p.name && p.name.toLowerCase().includes(paramSearch.toLowerCase())) ||
    String(p.id).includes(paramSearch)
  );

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] dark:text-white tracking-tight flex items-center gap-2">
            <span>Kategori & Taksonomi Rehberi</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
              {allegroStats.totalCategories.toLocaleString()} Allegro · {taxonomyStats.totalCategories} eMAG
            </span>
          </h1>
          <p className="text-xs text-[#5D7079] dark:text-zinc-400 mt-1">
            Allegro (22,634+ kategori) ve eMAG resmi ağaçlarını inceleyin, canlı API'den senkronize edin ve ürün aktarımlarında kullanın.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700">
          <button
            onClick={() => setActivePlatformTab('allegro')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePlatformTab === 'allegro'
                ? 'bg-[#FF5A00] text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Allegro Kategori Rehberi</span>
          </button>

          <button
            onClick={() => setActivePlatformTab('emag')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePlatformTab === 'emag'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900'
            }`}
          >
            <span>eMAG Marketplace Taksonomisi</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. eMAG TAKSONOMİ VE KATEGORİ REHBERİ TABI */}
      {/* ==================================================================== */}
      {activePlatformTab === 'emag' && (
        <div className="space-y-6">
          {/* Stats & Sync Action Bar */}
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>eMAG Taksonomi ve Karakteristik Veritabanı</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                      Aktif & Kayıtlı
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1 flex-wrap">
                    <span>Kayıtlı Kategori: <strong className="text-slate-900 dark:text-white">{emagCategories.length}</strong></span>
                    <span>·</span>
                    <span>Teklif Açık (Leaf): <strong className="text-slate-900 dark:text-white">{taxonomyStats.leafCategories}</strong></span>
                    <span>·</span>
                    <span>Özellik Sayısı: <strong className="text-slate-900 dark:text-white">{taxonomyStats.totalCharacteristics}</strong></span>
                    <span>·</span>
                    <span>Zorunlu Parametre: <strong className="text-amber-600 dark:text-amber-400">{taxonomyStats.mandatoryCharacteristics}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSyncAllEmagCategories}
                  disabled={isSyncingEmag}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  title="eMAG'daki tüm resmi kategorileri çek ve sisteme kaydet"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingEmag ? 'animate-spin' : ''}`} />
                  <span>{isSyncingEmag ? 'Kategoriler Çekiliyor...' : 'Tüm Kategorileri eMAG\'dan Çek & Kaydet'}</span>
                </button>

                <a
                  href="https://marketplace-api.emag.bg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>eMAG API Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncFeedback && (
              <div className={`mt-3.5 p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                syncFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : syncFeedback.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
              }`}>
                {syncFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : syncFeedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                )}
                <div className="flex-1">
                  <span>{syncFeedback.message}</span>
                  {syncFeedback.durationMs && (
                    <span className="font-mono ml-2 opacity-80">({syncFeedback.durationMs}ms)</span>
                  )}
                  {syncFeedback.serverIp && (
                    <span className="font-mono ml-2 opacity-80">· Sunucu IP: {syncFeedback.serverIp}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Group Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {EMAG_GROUPS.map((group) => {
              const isActive = activeEmagGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveEmagGroup(group.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>

          {/* Two Column Layout: Category Hierarchy & Characteristics Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Category List with Search */}
            <div className={`md:col-span-1 p-5 rounded-3xl border space-y-3 ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}>
                  eMAG Kategorileri ({filteredEmagCategories.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Toplam: {emagCategories.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emagSearch}
                  onChange={(e) => setEmagSearch(e.target.value)}
                  placeholder="Kategori adı veya ID ara (#202)..."
                  className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Categories Scrollable Box */}
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredEmagCategories.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Kategori bulunamadı.
                  </div>
                ) : (
                  filteredEmagCategories.map((cat) => {
                    const isSelected = selectedEmagCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedEmagCategoryId(cat.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 text-blue-900 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-100 font-bold shadow-xs'
                            : isDark
                            ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/50'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate">{cat.trName || cat.name}</span>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                          <span className="font-bold text-blue-600 dark:text-blue-400">ID: #{cat.id}</span>
                          {cat.isLeaf && (
                            <span className="text-emerald-600 dark:text-emerald-400">· Canlı Teklife Açık</span>
                          )}
                          {cat.mandatoryCount ? (
                            <span>· {cat.mandatoryCount} Zorunlu</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Selected Category Characteristics Inspector */}
            <div className={`md:col-span-2 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedEmagCategory ? (selectedEmagCategory.trName || selectedEmagCategory.name) : 'Kategori Seçin'}
                    </h2>
                    {selectedEmagCategory && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        eMAG ID: #{selectedEmagCategory.id}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedEmagCategory?.name} · Endpoint: /api-3/category/{selectedEmagCategory?.id}/characteristics
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {emagCharacteristics.length} Özellik Tanımlı
                  </span>

                  {/* Taslağa Ata Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      if (draftOffers.length > 0) {
                        setSelectedDraftIdToAssign(draftOffers[0].id);
                      }
                      setIsAssignDraftModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Bu kategoriyi mevcut bir taslak ürüne anında ata"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                    <span>Taslağa Ata ({draftOffers.length})</span>
                  </button>

                  {/* Bu Kategoriyle Yeni Ürün Oluştur Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedEmagCategory && onOpenCreateOffer) {
                        onOpenCreateOffer(selectedEmagCategory.id);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Bu kategori seçili olarak yeni ürün oluşturma sihirbazını aç"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bu Kategoriyle Yeni Ürün</span>
                  </button>
                </div>
              </div>

              {/* Characteristics List */}
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {emagCharacteristics.length === 0 ? (
                  <div className="p-8 text-center text-xs rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400">
                    Bu kategori için henüz özel şema tanımlanmadı. Standart eMAG ürün özellikleri (Brand, Renk, Garanti) kullanılır.
                  </div>
                ) : (
                  emagCharacteristics.map((char) => (
                    <div
                      key={char.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 ${
                        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {char.trName || char.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({char.name})
                          </span>
                          {char.isMandatory ? (
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded">
                              ZORUNLU ALAN
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-200/60 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-medium">
                              Opsiyonel
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span>Alan Kodu: {char.id}</span>
                          <span>·</span>
                          <span>Veri Tipi: {char.type}</span>
                          {char.defaultValue && (
                            <span>· Varsayılan: <strong>{char.defaultValue}</strong></span>
                          )}
                        </div>
                      </div>

                      {char.options && char.options.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap max-w-sm">
                          <span className="text-[10px] text-slate-400 shrink-0">Seçenekler:</span>
                          {char.options.slice(0, 4).map((opt, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
                            >
                              {opt}
                            </span>
                          ))}
                          {char.options.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{char.options.length - 4} seçenek
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. ALLEGRO KATEGORİ & TAKSONOMİ REHBERİ TABI (22,634+ KATEGORİ) */}
      {/* ==================================================================== */}
      {activePlatformTab === 'allegro' && (
        <div className="space-y-6">
          {/* Stats & Sync Action Bar */}
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#FF5A00]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Allegro Canlı Taksonomi Veritabanı</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-100 dark:bg-orange-950 text-[#FF5A00] border border-orange-200 dark:border-orange-800">
                        {allegroStats.totalCategories.toLocaleString()} Kategori
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {allegroStats.leafCategories.toLocaleString()} Teklife Açık (Leaf)
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Tüm ana departmanlar ve alt kırılımlar Allegro REST API v2 üzerinden çekilmiş ve yerel veritabanında saklanmaktadır.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSyncAllAllegroCategories}
                  disabled={isSyncingAllegro}
                  className="px-4 py-2.5 rounded-2xl bg-[#FF5A00] hover:bg-[#e04f00] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingAllegro ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAllegro ? 'API Taranıyor...' : 'Tüm Allegro Ağacını Senkronize Et (Canlı API)'}</span>
                </button>
              </div>
            </div>

            {allegroSyncFeedback && (
              <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                allegroSyncFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                  : allegroSyncFeedback.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-200'
                  : 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 text-orange-800 dark:text-orange-200'
              }`}>
                {allegroSyncFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : allegroSyncFeedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-orange-600 shrink-0 animate-spin" />
                )}
                <span>{allegroSyncFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Department Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ALLEGRO_ROOT_GROUPS.map((g) => {
              const isActive = activeAllegroRoot === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveAllegroRoot(g.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5A00] text-white border-[#FF5A00] shadow-xs'
                      : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Category Explorer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Category Hierarchy & Search */}
            <div className={`md:col-span-1 p-5 rounded-3xl border space-y-3.5 flex flex-col h-[750px] ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Allegro Kategori Listesi
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {filteredAllegroList.length} kategori
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={allegroSearch}
                  onChange={(e) => setAllegroSearch(e.target.value)}
                  placeholder="22,634+ Kategori içinde ara (Örn: T-shirty, Kulaklık, 66887)..."
                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#FF5A00] ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Categories Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {isSearchingAllegro ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FF5A00]" />
                    <span>Kategoriler taranıyor...</span>
                  </div>
                ) : filteredAllegroList.length === 0 ? (
                  <div className={`p-8 text-center text-xs rounded-2xl border ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    Arama kriterine uygun Allegro kategorisi bulunamadı.
                  </div>
                ) : (
                  filteredAllegroList.map((cat) => {
                    const isSelected = selectedAllegroCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedAllegroCategoryId(cat.id);
                          setSelectedAllegroItem(cat);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/80 dark:bg-orange-950/30 border-[#FF5A00] text-slate-900 dark:text-white shadow-xs'
                            : isDark
                            ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/50'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between gap-2">
                          <span className="truncate">{cat.name}</span>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#FF5A00]' : 'text-slate-400'}`} />
                        </div>
                        {cat.trName && cat.trName !== cat.name && (
                          <div className="text-[11px] text-[#FF5A00] font-medium truncate mt-0.5">
                            {cat.trName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-1">
                          {cat.path}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-slate-400">ID: {cat.id}</span>
                          {cat.leaf ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">· Teklife Açık (Leaf)</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">· Üst Kategori</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Category Details & Live Parameters Inspector */}
            <div className={`md:col-span-2 p-5 rounded-3xl border space-y-4 flex flex-col h-[750px] ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              {/* Category Details Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-orange-50/40 border-orange-100'
              }`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedAllegroItem?.name || selectedAllegroItem?.trName || 'Kategori Seçiniz'}
                    </h2>
                    {selectedAllegroItem?.trName && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5A00] text-white">
                        {selectedAllegroItem.trName}
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      ID: {selectedAllegroCategoryId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1 font-mono truncate">
                    <span>Yol:</span>
                    <span className="font-bold">{selectedAllegroItem?.path || selectedAllegroItem?.name || 'Seçili Kategori'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onOpenCreateOffer) {
                        onOpenCreateOffer(selectedAllegroCategoryId);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#FF5A00] hover:bg-[#e04f00] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bu Kategoriyle İlan Oluştur</span>
                  </button>
                </div>
              </div>

              {/* Parameter Filter Bar */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <span>Allegro Zorunlu & Seçmeli Parametreleri</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {filteredAllegroParams.length} Parametre
                  </span>
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paramSearch}
                    onChange={(e) => setParamSearch(e.target.value)}
                    placeholder="Parametre ara (Marka, EAN, Boyut)..."
                    className={`w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#FF5A00] ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Parameters List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {isLoadingAllegroParams ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FF5A00]" />
                    <span>Canlı Allegro parametreleri çekiliyor...</span>
                  </div>
                ) : filteredAllegroParams.length === 0 ? (
                  <div className={`p-8 text-center text-xs rounded-2xl border ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    Bu kategori için özel parametre bulunamadı veya arama sonucu boş.
                  </div>
                ) : (
                  filteredAllegroParams.map((param: any) => (
                    <div
                      key={param.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {param.name}
                          </span>
                          {param.required ? (
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 px-1.5 py-0.2 rounded">
                              ZORUNLU ALAN
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-200/60 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-medium">
                              Opsiyonel
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] font-mono flex items-center gap-2 ${
                          isDark ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          <span>Parametre ID: {param.id}</span>
                          <span>·</span>
                          <span>Tür: {param.type}</span>
                          {param.unit && <span>· Birim: {param.unit}</span>}
                        </div>
                      </div>

                      {param.dictionary && param.dictionary.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap max-w-sm">
                          <span className="text-[10px] text-slate-400 shrink-0">Seçenekler:</span>
                          {param.dictionary.slice(0, 4).map((opt: any, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
                            >
                              {opt.value || opt}
                            </span>
                          ))}
                          {param.dictionary.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{param.dictionary.length - 4} seçenek
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taslak Ürüne eMAG Kategori Atama Modalı */}
      {isAssignDraftModalOpen && selectedEmagCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Taslak Ürüne eMAG Kategorisi Ata
                  </h3>
                  <p className="text-xs text-slate-400">
                    Seçili Kategori: #{selectedEmagCategory.id} - {selectedEmagCategory.trName || selectedEmagCategory.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignDraftModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {draftOffers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                Sistemde henüz taslak ürün bulunmuyor. Yeni ürün oluşturabilir veya Excel yükleyebilirsiniz.
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                  Hedef Taslak Ürün Seçin ({draftOffers.length} Taslak Mevcut):
                </label>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {draftOffers.map((draft) => {
                    const isSelected = selectedDraftIdToAssign === draft.id;
                    return (
                      <button
                        key={draft.id}
                        type="button"
                        onClick={() => setSelectedDraftIdToAssign(draft.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 text-amber-900 dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-100 font-bold'
                            : isDark
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs truncate">{draft.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center justify-between">
                          <span>SKU: {draft.sku}</span>
                          <span>Mevcut Kat: #{draft.channelData?.emag?.categoryId || draft.excelMetadata?.emagCategoryCode || draft.category?.id || '-'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAssignDraftModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 cursor-pointer"
              >
                Vazgeç
              </button>
              {draftOffers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const target = draftOffers.find(d => d.id === selectedDraftIdToAssign) || draftOffers[0];
                    if (target) {
                      store.updateOfferCategory(target.id, selectedEmagCategory.id, selectedEmagCategory.trName || selectedEmagCategory.name);
                      setSyncFeedback({
                        type: 'success',
                        message: `"${target.name.slice(0, 30)}..." taslağına eMAG #${selectedEmagCategory.id} (${selectedEmagCategory.trName || selectedEmagCategory.name}) kategorisi başarıyla atandı!`
                      });
                      setIsAssignDraftModalOpen(false);
                      if (onNavigateToOffers) {
                        setTimeout(() => onNavigateToOffers(), 1000);
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Kategoriyi Taslağa Ata</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
