import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Coins, Check, RefreshCw } from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { SUPPORTED_CURRENCIES } from '../../services/allegroData';
import { tcmbService, TCMBData } from '../../services/tcmbService';
import { SupportedCurrency } from '../../types/allegro';

interface CurrencySwitcherProps {
  compact?: boolean;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ compact = false }) => {
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(store.getActiveCurrency());
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tcmbData, setTcmbData] = useState<TCMBData | null>(tcmbService.getData());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setActiveCurrency(store.getActiveCurrency());
    });
    const unsubTcmb = tcmbService.subscribe((data) => {
      setTcmbData(data);
    });
    return () => {
      unsubStore();
      unsubTcmb();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDetail = SUPPORTED_CURRENCIES.find(c => c.code === activeCurrency) || SUPPORTED_CURRENCIES[0];

  const handleSelect = (code: SupportedCurrency) => {
    store.setActiveCurrency(code);
    setIsOpen(false);
  };

  const handleRefreshTcmb = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await tcmbService.fetchLiveRates();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] text-[#14171A] text-xs font-bold transition-all cursor-pointer border border-slate-200/70 shadow-2xs"
        title="Görüntüleme Para Birimini Değiştir (TCMB Canlı Kurlar)"
      >
        <span className="text-sm leading-none">{currentDetail.flag}</span>
        <span>{currentDetail.code}</span>
        <span className="text-[#5D7079] font-mono font-medium text-[11px]">({currentDetail.symbol})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D8F99] uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#163300]" />
              <span>TCMB Canlı Kurlar</span>
            </span>
            <button
              onClick={handleRefreshTcmb}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-[#9FE870]/30 hover:bg-[#9FE870]/50 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              title="TCMB kurlarını güncelle"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>
          </div>

          {tcmbData && (
            <div className="px-3.5 py-1.5 bg-emerald-50/60 border-b border-emerald-100/60 flex items-center justify-between text-[10px] text-emerald-900">
              <span className="font-semibold">Bülten: {tcmbData.bulletinDate} ({tcmbData.bulletinNo})</span>
              <span className="font-mono font-bold">$ {tcmbData.tcmbUsdSelling.toFixed(2)}₺ · € {tcmbData.tcmbEurSelling.toFixed(2)}₺</span>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
            {SUPPORTED_CURRENCIES.map((c) => {
              const isSelected = c.code === activeCurrency;
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code as SupportedCurrency)}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#F7F8F9] transition-colors text-left cursor-pointer ${
                    isSelected ? 'bg-[#9FE870]/15' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{c.flag}</span>
                    <div>
                      <div className="text-xs font-bold text-[#14171A] flex items-center gap-1.5">
                        <span>{c.code}</span>
                        <span className="text-[11px] font-mono text-emerald-800 font-bold bg-[#9FE870]/30 px-1.5 py-0.2 rounded">
                          {c.symbol}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#5D7079] line-clamp-1">{c.market}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-slate-500 font-medium">
                      1$ = {c.rateAgainstUsd} {c.symbol}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-3.5 pt-2 border-t border-slate-100 text-[10px] text-[#5D7079] flex items-center justify-between">
            <span>T.C. Merkez Bankası Entegrasyonu</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Canlı TCMB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
