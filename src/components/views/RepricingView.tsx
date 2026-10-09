import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Check,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  DollarSign
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { RepricingItem, SupportedCurrency } from '../../types/allegro';

interface RepricingViewProps {
  theme?: 'light' | 'dark';
}

export const RepricingView: React.FC<RepricingViewProps> = ({ theme = 'light' }) => {
  const [items, setItems] = useState<RepricingItem[]>(store.getRepricingItems());
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(store.getActiveCurrency());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [minPriceInput, setMinPriceInput] = useState<number>(0);
  const [maxPriceInput, setMaxPriceInput] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    return store.subscribe(() => {
      setItems(store.getRepricingItems());
      setActiveCurrency(store.getActiveCurrency());
    });
  }, []);

  const isDark = theme === 'dark';

  const winningCount = items.filter(i => i.buyBoxStatus === 'WINNING').length;
  const losingCount = items.filter(i => i.buyBoxStatus === 'LOSING').length;
  const autoActiveCount = items.filter(i => i.autoEnabled).length;

  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [scanLogs, setScanLogs] = useState<any[]>([]);

  const handleScanCompetitors = async () => {
    setIsScanning(true);
    setScanNotice(null);
    try {
      const emagCreds = store.getPlatformCredentials().emag;
      const res = await fetch('/api/repricer/scan-and-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          emagCredentials: emagCreds
        })
      });
      const data = await res.json().catch(() => null);
      if (data && data.success && Array.isArray(data.updatedItems)) {
        data.updatedItems.forEach((updated: any) => {
          store.applyRepriceRule(updated.id, updated.currentPrice);
        });
        setScanLogs(data.logs || []);
        setScanNotice(`🟢 ${data.message}`);
      } else {
        setScanNotice(`⚠️ ${data?.message || 'Tarama tamamlanamadı'}`);
      }
    } catch (err: any) {
      setScanNotice(`⚠️ Tarama hatası: ${err?.message || err}`);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanNotice(null), 6000);
    }
  };

  const handleStartEditBounds = (item: RepricingItem) => {
    setEditingItemId(item.id);
    setMinPriceInput(item.minPrice);
    setMaxPriceInput(item.maxPrice);
  };

  const handleSaveBounds = (item: RepricingItem) => {
    const updated = items.map(i =>
      i.id === item.id ? { ...i, minPrice: minPriceInput, maxPrice: maxPriceInput } : i
    );
    setItems(updated);
    setEditingItemId(null);
  };

  const handleInstantBeatCompetitor = (item: RepricingItem) => {
    const beatPrice = Math.max(item.minPrice, parseFloat((item.targetCompetitorPrice - 0.10).toFixed(2)));
    store.applyRepriceRule(item.id, beatPrice);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight flex items-center gap-2.5">
            <span>Akıllı Repricer & BuyBox Motoru</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#9FE870]/40 text-[#163300]">
              Canlı Algoritma Aktif
            </span>
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Allegro ve eMAG'deki rakip fiyatlarını tarayın, minimum kâr marjınızı koruyarak BuyBox'ı kazanın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScanCompetitors}
            disabled={isScanning}
            className="px-4 py-2 rounded-full bg-[#14171A] hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Rakipler Taranıyor...' : 'Rakipleri Şimdi Tara & Eşitle'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D7079]">Kazanılan BuyBox</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {winningCount} <span className="text-xs font-normal text-slate-500">/ {items.length} Ürün</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">Allegro & eMAG 1. Sıra (En Uygun Fiyat)</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D7079]">Kayıp / Riskli BuyBox</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {losingCount} <span className="text-xs font-normal text-slate-500">Ürün</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold">Rakip daha ucuz fiyatta</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D7079]">Otomatik Repricing</span>
            <Zap className="w-5 h-5 text-[#163300]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {autoActiveCount} <span className="text-xs font-normal text-slate-500">Aktif Kural</span>
          </div>
          <div className="text-[11px] text-[#163300] font-semibold">Strateji: 0.10 PLN Alta Çek (Floor Korumalı)</div>
        </div>
      </div>

      {/* Live Scan Notification */}
      {scanNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{scanNotice}</span>
          </div>
          {scanLogs.length > 0 && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              {scanLogs.length} Fiyat Güncellendi
            </span>
          )}
        </div>
      )}

      {/* Repricing Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-slate-200 bg-white space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div className="font-bold text-xs text-slate-800">Canlı Repricer Havuzu Boş</div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Simülasyon verileri temizlendi. eMAG veya Allegro pazar yerinizden ürün çektiğinizde, fiyat rekabeti olan ürünleriniz bu alanda anlık listelenecektir.
            </p>
          </div>
        ) : (
          items.map((item) => {
          const isWinning = item.buyBoxStatus === 'WINNING';
          const isEditing = editingItemId === item.id;
          const diff = item.currentPrice - item.targetCompetitorPrice;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 shadow-2xs ${
                isWinning ? 'bg-white border-slate-200' : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                      isWinning
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isWinning ? <Award className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{isWinning ? 'BUYBOX KAZANILDI' : 'BUYBOX KAYIP (RAKİP ÖNDE)'}</span>
                    </span>

                    <span className="text-xs font-bold uppercase text-slate-500 font-mono">
                      {item.platform.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.offerName}</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Teklif ID: {item.offerId} · Son Kontrol: {new Date(item.lastRepricedAt).toLocaleTimeString('tr-TR')}
                  </div>
                </div>

                {/* Price Matrix */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  {/* Current Price */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Sizin Fiyatınız:</span>
                    <strong className="text-base font-black text-slate-900">{item.currentPrice.toFixed(2)} {item.currency}</strong>
                  </div>

                  {/* Competitor Price */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">En Ucuz Rakip ({item.competitorSellerName}):</span>
                    <strong className={`text-base font-black ${isWinning ? 'text-slate-700' : 'text-rose-600'}`}>
                      {item.targetCompetitorPrice.toFixed(2)} {item.currency}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                {/* Min-Max Price Bounds */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fiyat Limitleri:</span>
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 font-mono">
                      <input
                        type="number"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(parseFloat(e.target.value) || 0)}
                        className="w-16 border rounded p-1 text-xs"
                        placeholder="Min"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(parseFloat(e.target.value) || 0)}
                        className="w-16 border rounded p-1 text-xs"
                        placeholder="Max"
                      />
                      <button onClick={() => handleSaveBounds(item)} className="p-1 bg-emerald-600 text-white rounded">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="font-mono text-slate-700 font-bold flex items-center gap-1.5">
                      <span>Min: {item.minPrice.toFixed(2)} {item.currency}</span>
                      <span>·</span>
                      <span>Max: {item.maxPrice.toFixed(2)} {item.currency}</span>
                      <button
                        onClick={() => handleStartEditBounds(item)}
                        className="text-slate-400 hover:text-slate-700 underline text-[10px] cursor-pointer ml-1"
                      >
                        (Düzenle)
                      </button>
                    </div>
                  )}
                </div>

                {/* Reprice Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => store.toggleRepricingRule(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                      item.autoEnabled
                        ? 'bg-[#9FE870] text-[#163300]'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{item.autoEnabled ? 'Otomatik Reprice Açık' : 'Manuel'}</span>
                  </button>

                  {!isWinning && (
                    <button
                      onClick={() => handleInstantBeatCompetitor(item)}
                      className="px-4 py-1.5 rounded-full bg-[#14171A] hover:bg-black text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer min-h-[40px] flex items-center gap-1"
                    >
                      <span>BuyBox'ı Al ({Math.max(item.minPrice, item.targetCompetitorPrice - 0.10).toFixed(2)} {item.currency})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
