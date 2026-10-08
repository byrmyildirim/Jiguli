import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  FileCheck,
  RefreshCw,
  Layers,
  ArrowRight,
  ExternalLink,
  Tag,
  DollarSign,
  Package,
  Sparkles,
  Info
} from 'lucide-react';
import {
  parseExcelProductData,
  convertExcelRowsToOffers,
  generateSampleExcelFile,
  ParsedExcelRow
} from '../../services/excelProductParser';
import { store } from '../../services/marketplaceStore';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface ExcelProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ExcelProductImportModal: React.FC<ExcelProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);
  const [targetChannelMode, setTargetChannelMode] = useState<'AUTO' | 'ALL' | 'allegro' | 'emag'>('AUTO');
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (f: File) => {
    setFile(f);
    setIsParsing(true);
    setParseError(null);

    try {
      const buffer = await f.arrayBuffer();
      const result = parseExcelProductData(buffer);

      if (!result.success || result.rows.length === 0) {
        setParseError(result.error || 'Excel dosyasında geçerli ürün bulunamadı. Lütfen sütun başlıklarını kontrol ediniz.');
        setParsedRows([]);
        setSelectedRowIndices([]);
      } else {
        setParsedRows(result.rows);
        setSelectedRowIndices(result.rows.map((_, i) => i));
      }
    } catch (err: any) {
      setParseError(err?.message || 'Dosya okunurken bir hata oluştu.');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadSample = () => {
    try {
      const fileBuffer = generateSampleExcelFile();
      const blob = new Blob([fileBuffer.buffer as ArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jiguli_ornek_urun_listesi.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download sample error:', e);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIndices.length === parsedRows.length) {
      setSelectedRowIndices([]);
    } else {
      setSelectedRowIndices(parsedRows.map((_, i) => i));
    }
  };

  const handleToggleRow = (index: number) => {
    setSelectedRowIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const rowsToImport = selectedRowIndices.length > 0
        ? parsedRows.filter((_, idx) => selectedRowIndices.includes(idx))
        : parsedRows;
      const targetOverride = targetChannelMode === 'AUTO' ? undefined : targetChannelMode;
      const draftOffers = convertExcelRowsToOffers(rowsToImport, targetOverride);

      const result = store.importExcelDraftOffers(draftOffers);
      setIsImporting(false);
      onImportComplete(result.count);
      onClose();
    } catch (e: any) {
      setIsImporting(false);
      setParseError(e?.message || 'Ürünler aktarılırken hata oluştu.');
    }
  };

  const allegroCount = parsedRows.filter(r => r.detectedChannel === 'allegro').length;
  const emagCount = parsedRows.filter(r => r.detectedChannel === 'emag').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-4 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-800 dark:text-zinc-200 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Excel Listesinden Ürün Yükle
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  Taslak (DRAFT) Modu
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                EAN, çoklu dil başlıkları, indirimli Euro fiyatları, görseller ve kategoriler ayrıştırılarak taslak olarak kaydedilir.
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Area & Template Download */}
          {!file ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-slate-500 dark:hover:border-zinc-500 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-zinc-850 hover:bg-slate-100/50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Excel (.xlsx, .xls) veya CSV dosyanızı buraya sürükleyin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    veya bilgisayarınızdan dosya seçmek için tıklayın
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700 mt-1">
                  <span>Desteklenen: .xlsx, .xls, .csv</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Sample Template Download Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Birebir Eşleşen Örnek Excel Şablonu (.xlsx)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sütun yapısını içeren 6 adet hazır örnek ürünü hemen indirip test edebilirsiniz.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Örnek Şablonu İndir</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(1)} KB · {parsedRows.length} satır ayrıştırıldı
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                    }}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Başka Dosya Seç
                  </button>
                </div>
              </div>

              {parseError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Statistics & Channel Options Bar */}
              {parsedRows.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tespit Edilen Ürün</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{parsedRows.length} Adet</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kanal Dağılımı</div>
                    <div className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-1 flex items-center gap-2">
                      <span>Allegro: {allegroCount}</span>
                      <span>·</span>
                      <span>eMAG: {emagCount}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kayıt Türü</div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Sistem Taslağı (DRAFT)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Concise Sample Items Preview */}
              {parsedRows.length > 0 && (
                <div className="border border-slate-200 dark:border-zinc-750 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2 border-b border-slate-200 dark:border-zinc-750 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Dosya Önizlemesi (İlk {Math.min(3, parsedRows.length)} Ürün)</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Tüm {parsedRows.length} ürün taslak olarak yüklenecek
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {parsedRows.slice(0, 3).map((row, idx) => (
                      <div key={idx} className="p-3 flex items-center gap-3 bg-white dark:bg-zinc-900">
                        <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden bg-slate-50 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                          {row.photoUrl ? (
                            <img
                              src={row.photoUrl}
                              alt={row.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {row.marketplaceTitle || row.productName || row.productGroup}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                            <span className="font-mono">SKU: {row.sku || 'Otomatik'}</span>
                            {row.ean && <span>· EAN: {row.ean}</span>}
                            <span>· {row.discountedEurPrice ? `${row.discountedEurPrice.toFixed(2)} €` : 'Fiyat Belirtilmemiş'}</span>
                            {row.emagCategoryCode ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>eMAG #{row.emagCategoryCode}</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-medium flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                                <span>AI eMAG Eşleme</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
            <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Taslak Ürün Modu:</span>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
                İçe aktarılan tüm ürünler doğrudan <strong>"Taslak (DRAFT)"</strong> statüsünde panelinize kaydedilir. Canlı mağazanıza siz onay vermeden gönderilmez. "Ürünler & Stok" sayfasında taslak ürünleri düzenleyebilir ve dilediğiniz zaman tek tıkla yayına alabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer min-h-[40px]"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={parsedRows.length === 0 || isImporting}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[40px] shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Taslaklar Sisteme Aktarılıyor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {parsedRows.length > 0
                    ? `${parsedRows.length} Ürünü Taslak Olarak Sisteme Aktar`
                    : 'Excel Dosyası Seçiniz'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
