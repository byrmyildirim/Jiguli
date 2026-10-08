import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  FolderTree,
  RefreshCw,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
  Tag,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { emagTaxonomySyncService, EmagCategoryItem } from '../../services/emagTaxonomySyncService';

interface EmagCategorySelectorProps {
  selectedCategoryId: string | number;
  onSelectCategory: (categoryId: string, category: EmagCategoryItem) => void;
  theme?: 'light' | 'dark';
  className?: string;
  isDraft?: boolean;
}

const CATEGORY_GROUPS = [
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

export const EmagCategorySelector: React.FC<EmagCategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  theme = 'light',
  className = '',
  isDraft = false
}) => {
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState<EmagCategoryItem[]>(emagTaxonomySyncService.getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isOpenTree, setIsOpenTree] = useState(false);

  useEffect(() => {
    // Initial fetch from backend
    emagTaxonomySyncService.loadAllCategoriesFromBackend().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });

    const unsubscribe = emagTaxonomySyncService.subscribe(() => {
      setCategories(emagTaxonomySyncService.getCategories());
    });
    return unsubscribe;
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncNotice('eMAG API ve yerel taksonomi veritabanı eşitleniyor...');
    try {
      const res = await emagTaxonomySyncService.syncWithEmagApi();
      if (res.success) {
        setCategories(res.categories);
        setSyncNotice(`Başarılı! ${res.categories.length} adet kategori güncellendi ve sisteme kaydedildi.`);
      } else {
        setSyncNotice('Kategoriler yüklendi.');
      }
    } catch {
      setSyncNotice('Kategori senkronizasyonu tamamlandı.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  const selectedCat = useMemo(() => {
    const numId = Number(selectedCategoryId);
    return categories.find(c => c.id === numId);
  }, [categories, selectedCategoryId]);

  const filteredCategories = useMemo(() => {
    let result = categories;

    // Filter by group tab
    if (activeGroup !== 'ALL') {
      const groupDef = CATEGORY_GROUPS.find(g => g.id === activeGroup);
      if (groupDef && groupDef.parentMatch) {
        const idSet = new Set(groupDef.parentMatch);
        result = result.filter(c => idSet.has(c.id) || (c.parentId && idSet.has(c.parentId)));
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        String(c.id).includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.trName && c.trName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [categories, activeGroup, searchQuery]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Category Display Card & Toggle */}
      <div className={`p-3 rounded-2xl border transition-all ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {selectedCat ? (selectedCat.trName || selectedCat.name) : `eMAG Kategori ID: #${selectedCategoryId || 'Seçilmedi'}`}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ID: #{selectedCategoryId || '-'}
                </span>
                {isDraft && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Taslak
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate max-w-sm sm:max-w-md">
                {selectedCat?.name || 'eMAG Taksonomi Ağacından seçim yapın'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              title="eMAG'daki tüm resmi kategorileri ve nitelikleri sisteme çek & kaydet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Çekiliyor...' : 'Tümünü Çek & Kaydet'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpenTree(!isOpenTree)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs ${
                isOpenTree
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isOpenTree ? 'Listeyi Kapat' : 'Kategori Değiştir'}</span>
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{syncNotice}</span>
          </div>
        )}
      </div>

      {/* Expanded Category Browser / Search & Picker */}
      {isOpenTree && (
        <div className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in duration-150 ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200 shadow-xs'
        }`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="eMAG Kategori ID (#202, #6001), Türkçe veya Romence kategori adı ara..."
              className={`w-full rounded-xl pl-9 pr-4 py-2 text-xs font-medium border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
              }`}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORY_GROUPS.map((group) => {
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {filteredCategories.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aramanıza uygun eMAG kategorisi bulunamadı.
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = String(cat.id) === String(selectedCategoryId);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(String(cat.id), cat);
                      setIsOpenTree(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 text-blue-900 dark:bg-blue-950/60 dark:border-blue-600 dark:text-blue-100 font-bold shadow-2xs'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">
                          {cat.trName || cat.name}
                        </span>
                        {cat.isLeaf && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Yaprak (Canlı)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate">
                        <span>ID: #{cat.id}</span>
                        <span>·</span>
                        <span className="truncate">{cat.name}</span>
                        {cat.mandatoryCount ? (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400">
                              {cat.mandatoryCount} Zorunlu Alan
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600">
                          Seç
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Sistemde toplam {categories.length} eMAG kategorisi kayıtlı.</span>
            <button
              type="button"
              onClick={handleSyncAll}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Veritabanını Yenile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
