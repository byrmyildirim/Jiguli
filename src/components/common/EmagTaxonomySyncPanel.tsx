import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Search,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Tag,
  ShieldCheck,
  ExternalLink,
  Sliders,
  Check,
  Copy,
  Info
} from 'lucide-react';
import {
  emagTaxonomySyncService,
  EmagCategoryItem,
  EmagCharacteristicItem,
  TaxonomySyncStats,
  TaxonomySyncLogStep
} from '../../services/emagTaxonomySyncService';
import { store } from '../../services/marketplaceStore';

interface EmagTaxonomySyncPanelProps {
  theme?: 'light' | 'dark';
  onCategorySelected?: (categoryId: number) => void;
  compact?: boolean;
}

export const EmagTaxonomySyncPanel: React.FC<EmagTaxonomySyncPanelProps> = ({
  theme = 'light',
  onCategorySelected,
  compact = false
}) => {
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<TaxonomySyncStats>(emagTaxonomySyncService.getStats());
  const [categories, setCategories] = useState<EmagCategoryItem[]>(emagTaxonomySyncService.getCategories());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(257548);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSteps, setSyncSteps] = useState<TaxonomySyncLogStep[]>([]);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explorer' | 'ai-tester' | 'logs'>('explorer');

  // AI Test State
  const [testTitle, setTestTitle] = useState(
    'RGB LED Smart Life Zigbee Controller COB LED Strip USB Lights 5V Tuya Wifi Switch 3500K 5000K 6000K Smart Lamp 1/2/3/5M LED Tape'
  );
  const [aiTestResult, setAiTestResult] = useState<any>(null);

  useEffect(() => {
    // Initial test match
    handleRunAiTest();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncSteps([]);

    const creds = store.getPlatformCredentials().emag;

    const result = await emagTaxonomySyncService.syncWithEmagApi({
      username: creds.username,
      userHash: creds.userHash,
      country: creds.country
    });

    setStats(result.stats);
    setCategories(result.categories);
    setSyncSteps(result.steps);
    setSyncMessage(result.message);
    setIsSyncing(false);
  };

  const handleRunAiTest = () => {
    if (!testTitle.trim()) return;
    const res = emagTaxonomySyncService.autoMatchCategory({
      title: testTitle,
      brand: 'Generic'
    });
    setAiTestResult(res);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.trName && c.trName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    String(c.id).includes(searchQuery)
  );

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];
  const selectedCharacteristics = selectedCategory
    ? emagTaxonomySyncService.getCharacteristicsForCategory(selectedCategory.id)
    : [];

  return (
    <div
      className={`rounded-3xl border transition-all ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      } ${compact ? 'p-4' : 'p-5 sm:p-6'} space-y-5`}
    >
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-zinc-100 text-sm sm:text-base">
                eMAG Kategori Şeması & Karakteristik Senkronizasyonu
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Yerel DB Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              eMAG API taksonomi ağacı ve zorunlu ürün özellikleri (characteristics) yerel veritabanında saklanır.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'eMAG API ile Senkronize Ediliyor...' : 'eMAG API\'den Canlı Senkronize Et'}</span>
        </button>
      </div>

      {/* Sync Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-750">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Kayıtlı Kategoriler</div>
          <div className="text-lg font-black text-slate-800 dark:text-zinc-100 mt-0.5">{stats.totalCategories}</div>
          <div className="text-[10px] text-emerald-600 font-bold">{stats.leafCategories} Yaprak Kategori</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-750">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Karakteristikler</div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{stats.totalCharacteristics}</div>
          <div className="text-[10px] text-slate-500">{stats.mandatoryCharacteristics} Zorunlu Alan</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-750">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Depolama Tipi</div>
          <div className="text-sm font-black text-slate-800 dark:text-zinc-200 mt-1">Disk JSON & Bellek</div>
          <div className="text-[10px] text-slate-500 font-mono">./data/emag_taxonomy.json</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-750">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Son Senkronizasyon</div>
          <div className="text-xs font-black text-slate-800 dark:text-zinc-200 mt-1 truncate">
            {stats.lastSyncAt ? new Date(stats.lastSyncAt).toLocaleTimeString('tr-TR') : 'Şimdi'}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Güncel & Hazır
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'explorer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Kategori & Nitelik Gezgini</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai-tester')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ai-tester'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Otomatik Eşleştirme Testi</span>
        </button>

        {syncSteps.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Senkronizasyon Logları ({syncSteps.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: Kategori & Karakteristik Gezgini */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Categories List (5 cols) */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kategori adı veya ID ara (örn: LED, 257548)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
              {filteredCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      if (onCategorySelected) onCategorySelected(cat.id);
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 dark:bg-indigo-500/20'
                        : 'bg-white dark:bg-zinc-850/60 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {cat.trName || cat.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                        ID: {cat.id} • {cat.characteristicsCount || 6} Nitelik
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Characteristics Details (7 cols) */}
          <div className="md:col-span-7 space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-750">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2.5">
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{selectedCategory?.trName || selectedCategory?.name}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                    ID: {selectedCategory?.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Bu kategoride {selectedCharacteristics.length} adet eMAG özelliği tanımlı ({selectedCharacteristics.filter(c => c.isMandatory).length} Zorunlu).
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
              {selectedCharacteristics.map((char) => (
                <div
                  key={char.id}
                  className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{char.trName || char.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({char.name})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          char.isMandatory
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {char.isMandatory ? 'ZORUNLU' : 'Seçmeli'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                        {char.type}
                      </span>
                    </div>
                  </div>

                  {char.options && char.options.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {char.options.slice(0, 5).map((opt, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                        >
                          {opt}
                        </span>
                      ))}
                      {char.options.length > 5 && (
                        <span className="text-[10px] text-slate-400 pt-0.5">
                          +{char.options.length - 5} seçenek
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Otomatik Eşleştirme Testi */}
      {activeTab === 'ai-tester' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Test Edilecek Ham Ürün Başlığı & Özellikleri:</span>
              <button
                type="button"
                onClick={handleRunAiTest}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Tekrar Test Et</span>
              </button>
            </label>
            <textarea
              rows={2}
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-850 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ürün adını girin..."
            />
          </div>

          {aiTestResult && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                      Tespit Edilen Hedef Kategori: {aiTestResult.matchedCategory?.trName || aiTestResult.matchedCategory?.name}
                    </div>
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-400">
                      eMAG Kategori ID: <strong>{aiTestResult.matchedCategory?.id}</strong> • Doğruluk Güveni: %{Math.round(aiTestResult.confidence * 100)}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  {aiTestResult.reasoning}
                </span>
              </div>

              {/* Extracted Characteristics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-200 dark:border-indigo-900/40">
                {Object.entries(aiTestResult.extractedCharacteristics || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-500 font-mono text-[11px]">{key}:</span>
                    <strong className="text-slate-800 dark:text-zinc-200 text-right truncate max-w-[200px]">{String(val)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Senkronizasyon Logları */}
      {activeTab === 'logs' && syncSteps.length > 0 && (
        <div className="space-y-2">
          {syncSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-750 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-zinc-200">{step.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{step.message}</div>
                </div>
              </div>
              {step.durationMs !== undefined && (
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {step.durationMs}ms
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
