import React from 'react';
import { X, Copy, Check, Terminal, AlertTriangle, ShieldAlert, Globe, Server, Link2, ExternalLink } from 'lucide-react';

interface EmagImageDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: any;
  productName?: string;
  onManualUrlSubmit?: (url: string) => void;
}

export const EmagImageDiagnosticModal: React.FC<EmagImageDiagnosticModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  productName,
  onManualUrlSubmit
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !diagnostics) return null;

  const logs: string[] = diagnostics.logs || [];
  const apiAttempts: any[] = diagnostics.apiAttempts || [];
  const webAttempts: any[] = diagnostics.webAttempts || [];

  const handleCopyLogs = () => {
    const textToCopy = `=== eMAG GÖRSEL ARAMA VE TEŞHİS RAPORU ===
Ürün: ${productName || diagnostics.name}
ID: ${diagnostics.productId || 'Eksik'}
SKU: ${diagnostics.sku || 'Eksik'}
EAN: ${diagnostics.ean || 'Eksik'}
Pazaryeri: eMAG ${diagnostics.country?.toUpperCase() || 'BG'} (${diagnostics.siteDomain || 'www.emag.bg'})
Tarih: ${diagnostics.timestamp || new Date().toISOString()}

--- AÇIKLAMA VE LOGLAR ---
${logs.join('\n')}

--- API SORGULARI ---
${JSON.stringify(apiAttempts, null, 2)}

--- WEB TARAMALARI ---
${JSON.stringify(webAttempts, null, 2)}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleManualInput = () => {
    const url = prompt(`"${productName || diagnostics.name}" için eMAG veya harici görsel URL adresini giriniz:`);
    if (url && url.trim() && onManualUrlSubmit) {
      onManualUrlSubmit(url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                eMAG Görsel Teşhis & Log Raporu
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {productName || diagnostics.name || 'Seçili Ürün'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-medium block">SKU / PNK</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 truncate block">
                {diagnostics.sku || 'Eksik'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-medium block">EAN Barkod</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 truncate block">
                {diagnostics.ean || 'Eksik'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-medium block">API Yetkisi</span>
              <span className={`font-bold block ${diagnostics.hasApiCredentials ? 'text-emerald-600' : 'text-amber-600'}`}>
                {diagnostics.hasApiCredentials ? '✓ Aktif' : '⚠️ Eksik'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-medium block">Pazaryeri</span>
              <span className="font-bold text-blue-600 block">
                eMAG {diagnostics.country?.toUpperCase() || 'BG'}
              </span>
            </div>
          </div>

          {/* Diagnostic Log Console */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-500" />
                <span>Adım Adım İşlem Logları ({logs.length} Adım):</span>
              </span>
              <button
                onClick={handleCopyLogs}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Kopyalandı!' : 'Logları Kopyala'}</span>
              </button>
            </div>

            <div className="p-3 bg-zinc-950 text-emerald-400 rounded-2xl font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto border border-zinc-800 space-y-1 select-text">
              {logs.map((log, idx) => (
                <div key={idx} className={`${
                  log.includes('❌') ? 'text-rose-400 font-bold' :
                  log.includes('🎯') ? 'text-emerald-300 font-bold' :
                  log.includes('⚠️') ? 'text-amber-300' :
                  'text-zinc-300'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed API & Web Attempt Cards */}
          {apiAttempts.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-500" />
                <span>eMAG API Sorguları (`/api-3/product/read`):</span>
              </div>
              <div className="space-y-1.5">
                {apiAttempts.map((attempt, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800 dark:text-zinc-200">{attempt.type}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        attempt.httpStatus === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        HTTP {attempt.httpStatus} ({attempt.durationMs}ms)
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Payload: {JSON.stringify(attempt.payload)} | Dönen Ürün Sayısı: {attempt.resultsCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Web Search Attempt Cards */}
          {webAttempts.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                <span>eMAG Web Kataloğu Taramaları:</span>
              </div>
              <div className="space-y-1.5">
                {webAttempts.map((attempt, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800 dark:text-zinc-200">{attempt.type}</span>
                      <span className="text-[10px] text-blue-600 font-mono">
                        {attempt.matchesCount} CDN Görseli Bulundu
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {attempt.searchUrl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleManualInput}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Manuel Görsel URL Gir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-2xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Kopyalandı' : 'Logları Kopyala'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#14171A] hover:bg-black text-white rounded-2xl font-bold text-xs transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
