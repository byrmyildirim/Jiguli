import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import {
  EmagCharacteristicDefinition,
  ValidationResult
} from '../../services/CategorySchemaSyncService';

interface MissingCharacteristicsPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  categoryId: number;
  categoryName?: string;
  validationResult: ValidationResult | null;
  onConfirmAndPublish: (completedCharacteristics: Array<{ id: string | number; value: any }>) => void;
}

export const MissingCharacteristicsPromptModal: React.FC<MissingCharacteristicsPromptModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  categoryId,
  categoryName,
  validationResult,
  onConfirmAndPublish
}) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (validationResult) {
      const initial: Record<string, string> = {};
      // Fill existing values
      validationResult.providedCharacteristics.forEach(c => {
        initial[String(c.id)] = String(c.value || '');
      });
      // Pre-fill missing with suggestedAutoFill
      validationResult.missingMandatory.forEach(m => {
        const suggested = validationResult.suggestedAutoFill[String(m.id)];
        if (suggested && !initial[String(m.id)]) {
          initial[String(m.id)] = suggested;
        } else if (!initial[String(m.id)] && m.options && m.options.length > 0) {
          initial[String(m.id)] = m.options[0];
        } else if (!initial[String(m.id)] && m.default_value) {
          initial[String(m.id)] = m.default_value;
        }
      });
      setFieldValues(initial);
    }
  }, [validationResult]);

  if (!isOpen || !validationResult) return null;

  const missingList = validationResult.missingMandatory;

  const handleFieldChange = (id: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [id]: value }));
  };

  const handleAutoFillAll = () => {
    setFieldValues(prev => {
      const updated = { ...prev };
      missingList.forEach(m => {
        const suggested = validationResult.suggestedAutoFill[String(m.id)];
        if (suggested) {
          updated[String(m.id)] = suggested;
        } else if (m.options && m.options.length > 0) {
          updated[String(m.id)] = m.options[0];
        } else if (m.default_value) {
          updated[String(m.id)] = m.default_value;
        } else {
          updated[String(m.id)] = 'Generic';
        }
      });
      return updated;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mergedList: Array<{ id: string | number; value: any }> = [];
    // Include all completed fields
    Object.entries(fieldValues).forEach(([id, val]) => {
      if (val && String(val).trim()) {
        mergedList.push({ id, value: String(val).trim() });
      }
    });

    onConfirmAndPublish(mergedList);
    setIsSubmitting(false);
  };

  const allMandatoryFilled = missingList.every(m => {
    const val = fieldValues[String(m.id)];
    return val && String(val).trim().length > 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-900/40 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-amber-100 dark:border-amber-950/50 flex items-start justify-between gap-4 shrink-0 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  eMAG Zorunlu Nitelik Doğrulaması
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {missingList.length} Zorunlu Alan Eksik
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Kategori #{categoryId}: {categoryName || 'Seçili eMAG Kategorisi'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Context Banner */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              {productTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutoFillAll}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer border border-indigo-200 dark:border-indigo-800"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI ile Hepsini Doldur</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">eMAG v3 API Öncesi Doğrulama Katmanı</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  eMAG Marketplace bu kategoride aşağıdaki nitelikleri zorunlu tutmaktadır. Boş gönderim API tarafından reddedilir. Lütfen eksik alanları tamamlayın:
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {missingList.map(mand => {
                const fieldId = String(mand.id);
                const val = fieldValues[fieldId] || '';
                const suggested = validationResult.suggestedAutoFill[fieldId];
                const hasOptions = Array.isArray(mand.options) && mand.options.length > 0;

                return (
                  <div
                    key={fieldId}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/80 border border-slate-200 dark:border-zinc-750 space-y-2 transition-all hover:border-slate-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {mand.tr_name || mand.name}
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({fieldId})
                        </span>
                        <span className="text-red-500 text-xs font-bold">*</span>
                      </div>

                      {suggested && val !== suggested && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange(fieldId, suggested)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Öneri: {suggested}</span>
                        </button>
                      )}
                    </div>

                    {hasOptions ? (
                      <div className="relative">
                        <select
                          value={val}
                          onChange={e => handleFieldChange(fieldId, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                          required
                        >
                          <option value="">-- Lütfen bir değer seçin --</option>
                          {mand.options!.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <input
                        type={mand.type === 'INTEGER' || mand.type === 'FLOAT' ? 'number' : 'text'}
                        value={val}
                        placeholder={suggested || mand.default_value || `${mand.tr_name || mand.name} girin...`}
                        onChange={e => handleFieldChange(fieldId, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={!allMandatoryFilled || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                allMandatoryFilled && !isSubmitting
                  ? 'bg-amber-600 hover:bg-amber-500 active:scale-98 shadow-amber-600/20'
                  : 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Eksikleri Onayla ve eMAG'a Gönder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
