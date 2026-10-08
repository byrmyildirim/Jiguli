import React from 'react';
import {
  Sliders,
  DollarSign,
  ShieldAlert,
  Save,
  Check,
  Calculator,
  RefreshCw,
  Info
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { PricingRule, InventorySyncRule } from '../../types/allegro';
import { EXCHANGE_RATES } from '../../services/allegroData';

interface SyncRulesViewProps {
  theme: 'light' | 'dark';
}

export const SyncRulesView: React.FC<SyncRulesViewProps> = ({ theme }) => {
  const [pricingRules, setPricingRules] = React.useState<PricingRule[]>(store.getPricingRules());
  const [inventoryRules, setInventoryRules] = React.useState<InventorySyncRule>(store.getInventoryRules());
  const [testBasePrice, setTestBasePrice] = React.useState<number>(100);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    return store.subscribe(() => {
      setPricingRules(store.getPricingRules());
      setInventoryRules(store.getInventoryRules());
    });
  }, []);

  const isDark = theme === 'dark';

  const handleUpdateMarkup = (ruleId: string, percent: number) => {
    store.updatePricingRule(ruleId, { markupPercent: percent });
  };

  const handleUpdateFixed = (ruleId: string, fixed: number) => {
    store.updatePricingRule(ruleId, { fixedMarkup: fixed });
  };

  const handleUpdateRounding = (ruleId: string, rounding: 'none' | '99cents' | 'roundInteger') => {
    store.updatePricingRule(ruleId, { rounding });
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    store.updatePricingRule(ruleId, { enabled });
  };

  const handleSaveInventory = () => {
    store.updateInventoryRules(inventoryRules);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight">
            Fiyat & Stok Kural Motoru
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Farklı platformların komisyon oranlarına ve kargo maliyetlerine göre otomatik fiyat hesaplayıcı ve güvenlik stoku kuralları.
          </p>
        </div>
      </div>

      {/* Live Price Calculator Sandbox */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`flex items-center gap-2 text-xs font-bold ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <Calculator className="w-4 h-4 text-[#163300]" />
          <span>Canlı Çoklu Kanal Fiyatlandırma Simülatörü:</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="space-y-1">
            <label className={`text-[11px] font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Ürün Baz Maliyeti (PLN):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                value={testBasePrice}
                onChange={(e) => setTestBasePrice(parseFloat(e.target.value) || 0)}
                className={`w-32 border focus:border-[#14171A] rounded-xl px-3 py-1.5 text-sm font-mono font-bold focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <span className="text-xs font-mono font-bold text-slate-400">PLN</span>
            </div>
          </div>

          {/* Result across channels */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {pricingRules.map((rule) => {
              const res = store.calculateChannelPrice(testBasePrice, rule.channel);
              return (
                <div key={rule.id} className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50/80 border-slate-200'
                }`}>
                  <div className={`text-[11px] font-medium truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {rule.channelName}
                  </div>
                  <div className={`font-mono font-bold text-sm tabular-nums mt-0.5 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {res.amount} {res.currency}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    +{rule.markupPercent}% komisyon
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pricing Markup Matrix */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b ${
            isDark ? 'border-zinc-800' : 'border-slate-100'
          }`}>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Pazaryeri Komisyon & Fiyatlandırma Kuralları
            </h2>
            <span className="text-xs font-mono text-slate-400 font-medium">Baz: PLN</span>
          </div>

          <div className="space-y-3">
            {pricingRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{rule.channelName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({rule.currency})</span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                      className="rounded border-slate-300 text-[#FF5A00] focus:ring-0"
                    />
                    <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>{rule.enabled ? 'Aktif' : 'Devre Dışı'}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className={`text-[11px] font-semibold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Pazaryeri Komisyonu (%):
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={rule.markupPercent}
                      onChange={(e) => handleUpdateMarkup(rule.id, parseFloat(e.target.value) || 0)}
                      className={`mt-1 w-full border focus:border-[#FF5A00] rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[11px] font-semibold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Sabit Kargo/Paket Payı:
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        step="0.5"
                        value={rule.fixedMarkup}
                        onChange={(e) => handleUpdateFixed(rule.id, parseFloat(e.target.value) || 0)}
                        className={`w-full border focus:border-[#FF5A00] rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                      <span className="text-slate-400 font-mono text-xs">{rule.currency}</span>
                    </div>
                  </div>

                  <div>
                    <span className={`text-[11px] font-semibold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Fiyat Yuvarlama:
                    </span>
                    <select
                      value={rule.rounding}
                      onChange={(e) => handleUpdateRounding(rule.id, e.target.value as any)}
                      className={`mt-1 w-full border focus:border-[#FF5A00] rounded-lg px-2 py-1 text-xs font-medium focus:outline-none ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="none">Yuvarlama Yok</option>
                      <option value="99cents">.99 Kuruş Psikolojik</option>
                      <option value="roundInteger">Tam Sayı Yuvarla</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Inventory Safety Rules */}
        <div className={`lg:col-span-1 p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="space-y-4">
            <div className={`pb-2 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
              <h2 className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Güvenlik Stoku & Koruma
              </h2>
              <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Pazaryerlerinde ceza puanı almamak için stok koruma ayarları
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                  Güvenlik Stoku Tamponu (Adet):
                </label>
                <input
                  type="number"
                  min="0"
                  value={inventoryRules.safetyStock}
                  onChange={(e) =>
                    setInventoryRules({ ...inventoryRules, safetyStock: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <p className="text-[11px] text-slate-400">
                  Fiziksel depoda bu adedin altına düşen ürünler Allegro'da otomatik tükenmiş gösterilir.
                </p>
              </div>

              <div className="space-y-1 pt-2">
                <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                  Senkronizasyon Periyodu (Dakika):
                </label>
                <select
                  value={inventoryRules.syncIntervalMinutes}
                  onChange={(e) =>
                    setInventoryRules({ ...inventoryRules, syncIntervalMinutes: parseInt(e.target.value) || 5 })
                  }
                  className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-semibold focus:outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value={1}>1 Dakika (Hızlı)</option>
                  <option value={5}>5 Dakika (Önerilen)</option>
                  <option value={15}>15 Dakika</option>
                  <option value={30}>30 Dakika</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <label className={`flex items-start gap-2 cursor-pointer font-medium ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={inventoryRules.autoDeactivateWhenZero}
                    onChange={(e) =>
                      setInventoryRules({ ...inventoryRules, autoDeactivateWhenZero: e.target.checked })
                    }
                    className="mt-0.5 rounded border-slate-300 text-[#163300] focus:ring-0"
                  />
                  <span>Stok sıfırlandığında Allegro teklifini otomatik sonlandır (ENDED)</span>
                </label>

                <label className={`flex items-start gap-2 cursor-pointer font-medium ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={inventoryRules.multiChannelDeduction}
                    onChange={(e) =>
                      setInventoryRules({ ...inventoryRules, multiChannelDeduction: e.target.checked })
                    }
                    className="mt-0.5 rounded border-slate-300 text-[#163300] focus:ring-0"
                  />
                  <span>Sipariş geldiğinde tüm kanallardan otomatik stok düş</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveInventory}
            className="w-full py-2.5 text-xs font-bold bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] rounded-full shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-[#163300]" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Kurallar Kaydedildi!' : 'Kuralları Kaydet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
