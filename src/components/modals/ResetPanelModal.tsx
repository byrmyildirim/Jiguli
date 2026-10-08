import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';

interface ResetPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  theme?: 'light' | 'dark';
}

export const ResetPanelModal: React.FC<ResetPanelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme = 'light'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleConfirmReset = () => {
    setIsProcessing(true);
    setTimeout(() => {
      store.clearAllData();
      setIsProcessing(false);
      onClose();
      if (onSuccess) {
        onSuccess(
          '🟢 Jiguli panelindeki yerel veriler başarıyla sıfırlandı. eMAG, Allegro ve BaseLinker mağazanızdaki canlı ürün ve siparişlerinize dokunulmadı.'
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0 border border-rose-200">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100">
                Jiguli Panel Verilerini Sıfırla
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Sadece bu tarayıcıdaki yerel önbellek temizlenir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reassuring Guarantee Box */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pazaryeri Hesaplarınız %100 Güvende</span>
          </div>
          <ul className="text-[11px] text-emerald-800/90 space-y-1.5 list-disc list-inside">
            <li>
              <strong>eMAG, Allegro veya BaseLinker</strong> mağazanızdaki canlı ürün, stok ve siparişlerinize <u>KESİNLİKLE DOKUNULMAZ</u>.
            </li>
            <li>
              API anahtarlarınız, kullanıcı adınız ve sistem bağlantı ayarlarınız <strong>korunur</strong>.
            </li>
            <li>
              Yalnızca Jiguli paneline geçici olarak indirilmiş yerel ürün ve sipariş önbelleği sıfırlanır.
            </li>
          </ul>
        </div>

        {/* What gets cleared */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
            Jiguli Panelinde Temizlenecek Alanlar:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Panel Ürün Listesi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>İndirilen Siparişler</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Repricer Geçmişi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Yerel API Logları</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          💡 Sıfırladıktan sonra istediğiniz zaman <strong>"eMAG Ürünlerini Çek"</strong> veya <strong>"Canlı Siparişleri Çek"</strong> butonuna basarak mağazanızdaki güncel verileri tekrar panele yükleyebilirsiniz.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all cursor-pointer min-h-[42px]"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer min-h-[42px] flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Sıfırlanıyor...' : 'Evet, Sadece Paneli Sıfırla'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
