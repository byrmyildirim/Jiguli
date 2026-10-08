import React from 'react';
import {
  History,
  Terminal,
  Clock,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
  Zap,
  ExternalLink
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { ApiLogEntry } from '../../types/allegro';
import { EmagExecutionLogsModal, EmagExecutionReport } from '../modals/EmagExecutionLogsModal';

interface ApiLogsViewProps {
  theme: 'light' | 'dark';
}

export const ApiLogsView: React.FC<ApiLogsViewProps> = ({ theme }) => {
  const [logs, setLogs] = React.useState<ApiLogEntry[]>(store.getApiLogs());
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [methodFilter, setMethodFilter] = React.useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = React.useState<string>('ALL');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [showEmagWizardModal, setShowEmagWizardModal] = React.useState<boolean>(false);
  const [latestReport, setLatestReport] = React.useState<EmagExecutionReport | null>(
    store.getLatestEmagPublishReport()
  );

  React.useEffect(() => {
    return store.subscribe(() => {
      setLogs(store.getApiLogs());
      setLatestReport(store.getLatestEmagPublishReport());
    });
  }, []);

  const isDark = theme === 'dark';

  const handleCopy = (id: string, content: any) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClearLogs = () => {
    store.clearApiLogs();
  };

  const filteredLogs = logs.filter((log) => {
    if (methodFilter !== 'ALL' && log.method !== methodFilter) return false;
    if (platformFilter !== 'ALL' && log.platform !== platformFilter) return false;
    return true;
  });

  const hasEmagError = logs.some(l => l.platform === 'emag' && l.status >= 300) || (latestReport && !latestReport.success);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] dark:text-white tracking-tight">
            API & Olay Günlükleri
          </h1>
          <p className="text-xs text-[#5D7079] dark:text-zinc-400 mt-0.5">
            Sistem tarafından gönderilen tüm REST istekleri, eMAG/Allegro komut kuyrukları ve yanıt yükleri.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {latestReport && (
            <button
              onClick={() => setShowEmagWizardModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>eMAG Hata Sihirbazı</span>
            </button>
          )}

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className={`p-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-500'
              }`}
              title="Günlükleri Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <option value="ALL">Tüm Pazaryerleri</option>
            <option value="emag">eMAG API (POST /product/save)</option>
            <option value="allegro">Allegro REST API</option>
            <option value="baselinker">BaseLinker Connector</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <option value="ALL">Tüm HTTP Metotları</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
      </div>

      {/* Prominent eMAG Troubleshooting Banner if error exists */}
      {hasEmagError && latestReport && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                eMAG Entegrasyon Hatası Tespit Edildi
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Son gönderilen üründe ({latestReport.partNumberKey || 'N/A'}) kategori, KDV veya alan formatlama uyarısı mevcut.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEmagWizardModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Hata Ayıklama Sihirbazını Aç</span>
          </button>
        </div>
      )}

      {/* Logs Table / Accordion */}
      <div className={`border rounded-2xl overflow-hidden divide-y ${
        isDark
          ? 'bg-zinc-900 border-zinc-800 divide-zinc-800'
          : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
      }`}>
        {filteredLogs.length === 0 ? (
          <div className={`p-12 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Kayıtlı API günlüğü bulunamadı.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const isSuccess = log.status < 300;

            return (
              <div key={log.id} className="transition-colors">
                {/* Row Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className={`p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
                    isDark ? 'hover:bg-zinc-850' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.method === 'GET'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800/40'
                          : log.method === 'POST'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800/40'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800/40'
                      }`}
                    >
                      {log.method}
                    </span>

                    <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.endpoint}</span>

                    <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>·</span>
                    <span className="text-[11px] font-mono font-bold text-[#14171A]">{log.platform.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isSuccess
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40'
                          : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40'
                      }`}
                    >
                      HTTP {log.status}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.durationMs}ms
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className={`p-4 border-t space-y-3 text-xs ${
                    isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>İstek & Yanıt Detayları:</span>
                      <button
                        onClick={() => handleCopy(log.id, { request: log.requestBody, response: log.responseBody })}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                          isDark
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
                        }`}
                      >
                        {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === log.id ? 'Kopyalandı' : 'JSON Kopyala'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Headers & Request Body */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500">Headers & Request Body</div>
                        <pre className={`p-3 rounded-xl border font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                        }`}>
                          {JSON.stringify({ headers: log.requestHeaders, body: log.requestBody || null }, null, 2)}
                        </pre>
                      </div>

                      {/* Response Body */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500">Response Payload</div>
                        <pre className={`p-3 rounded-xl border font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-300'
                        }`}>
                          {JSON.stringify(log.responseBody || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* eMAG Execution & Troubleshooting Wizard Modal */}
      <EmagExecutionLogsModal
        isOpen={showEmagWizardModal}
        onClose={() => setShowEmagWizardModal(false)}
        report={latestReport}
        theme={theme}
      />
    </div>
  );
};
