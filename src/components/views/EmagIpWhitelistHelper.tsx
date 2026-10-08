import React, { useState } from 'react';
import {
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Server,
  Laptop
} from 'lucide-react';

interface EmagIpWhitelistHelperProps {
  serverIp: string;
  clientIp?: string;
  selectedCountry?: 'BG' | 'RO' | 'HU';
  onTestConnection?: () => void;
  isTesting?: boolean;
}

export const EmagIpWhitelistHelper: React.FC<EmagIpWhitelistHelperProps> = ({
  serverIp,
  clientIp,
  selectedCountry = 'BG',
  onTestConnection,
  isTesting = false
}) => {
  const [copiedServerIp, setCopiedServerIp] = useState(false);
  const [copiedClientIp, setCopiedClientIp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Interactive checklist state
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false
  });

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const isAllCompleted = completedCount === 4;

  const handleCopy = (ip: string, type: 'server' | 'client') => {
    navigator.clipboard.writeText(ip);
    if (type === 'server') {
      setCopiedServerIp(true);
      setTimeout(() => setCopiedServerIp(false), 2200);
      // Auto-check step 3 when server IP is copied
      setCheckedSteps(prev => ({ ...prev, 3: true }));
    } else {
      setCopiedClientIp(true);
      setTimeout(() => setCopiedClientIp(false), 2200);
    }
  };

  const getEmagPortalUrl = () => {
    if (selectedCountry === 'RO') return 'https://marketplace.emag.ro';
    if (selectedCountry === 'HU') return 'https://marketplace.emag.hu';
    return 'https://marketplace.emag.bg';
  };

  const getEmagPortalName = () => {
    if (selectedCountry === 'RO') return 'eMAG Marketplace Romanya (marketplace.emag.ro)';
    if (selectedCountry === 'HU') return 'eMAG Marketplace Macaristan (marketplace.emag.hu)';
    return 'eMAG Marketplace Bulgaristan (marketplace.emag.bg)';
  };

  return (
    <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-b from-amber-50/70 to-orange-50/40 p-4 sm:p-5 shadow-xs transition-all space-y-4">
      {/* Header bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpanded ? 'pb-3 border-b border-amber-200/70' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-800 border border-amber-300/40">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                eMAG API IP İzni (Allowed IPs) & Kurulum Rehberi
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isAllCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isAllCompleted ? 'Tüm Adımlar Hazır ✓' : `${completedCount}/4 Adım Tamamlandı`}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              eMAG API &apos;You are not allowed to use this API&apos; (HTTP 401) hatasını çözmek için kurulum adımları.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {!isExpanded && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/90 border border-amber-300/70 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-mono shadow-2xs">
              <span className="text-[10px] text-amber-700 font-sans font-semibold">Sunucu IP:</span>
              <strong className="text-slate-900">{serverIp}</strong>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(serverIp, 'server');
                }}
                className="text-[10px] font-sans font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
              >
                {copiedServerIp ? '✓ Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-amber-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Rehberi Kapat' : 'Rehberi Aç'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Guide Content: Shown only when expanded */}
      {isExpanded && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150">
          {/* Prominent Quick-Copy Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Server Outbound IP (Primary) */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Panel Sunucu Çıkış IP</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 uppercase">
                    eMAG İçin Zorunlu
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 block">Tüm API istekleri bu sunucudan çıkar</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(serverIp, 'server')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                copiedServerIp
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {copiedServerIp ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>IP Kopyala</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-950 text-emerald-400 font-mono text-xs px-3 py-2 rounded-xl border border-slate-800 font-bold select-all">
            <span>{serverIp}</span>
            <span className="text-[10px] text-slate-400 font-sans font-normal">Google Cloud (Avrupa)</span>
          </div>
        </div>

        {/* Client Device IP (Informational) */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/80 border border-slate-200 shadow-2xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Kişisel Bilgisayar IP'niz</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                    İsteğe Bağlı
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 block">Postman veya kendi cihazınızdan test için</span>
              </div>
            </div>

            {clientIp && (
              <button
                type="button"
                onClick={() => handleCopy(clientIp, 'client')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedClientIp
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {copiedClientIp ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between bg-slate-100 text-slate-700 font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 select-all">
            <span>{clientIp || 'Algılanıyor...'}</span>
            <span className="text-[10px] text-slate-500 font-sans">Tarayıcınızın İnternet IP'si</span>
          </div>
        </div>
      </div>

      {/* Expandable Step-by-Step Interactive Checklist */}
      <div className="space-y-3 pt-1">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>4 Adımda eMAG IP İzni Ekleme Kontrol Listesi</span>
          </div>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div
              onClick={() => toggleStep(1)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                checkedSteps[1]
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-white border-amber-200 text-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    checkedSteps[1]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-amber-500'
                  }`}
                >
                  {checkedSteps[1] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 1: eMAG Satıcı Paneline Giriş Yapın</span>
                    </span>
                    <a
                      href={getEmagPortalUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{getEmagPortalName()}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Mağazanızın kayıtlı olduğu resmi eMAG satıcı portalına kullanıcı adı ve şifrenizle giriş yapın.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => toggleStep(2)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                checkedSteps[2]
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-white border-amber-200 text-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    checkedSteps[2]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-amber-500'
                  }`}
                >
                  {checkedSteps[2] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-bold block">
                    Adım 2: Profilim &gt; Teknik Detaylar (Technical Details) Sayfasına Gidin
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Sağ üst köşedeki profil ikonuna tıklayın &gt; <strong>Hesabım / Profil (My Account / Profile)</strong> seçin &gt; Üst sekmelerden <strong>Teknik Detaylar (Technical Details / Detalii Tehnice)</strong> sekmesine geçin.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => toggleStep(3)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                checkedSteps[3]
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-white border-amber-200 text-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    checkedSteps[3]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-amber-500'
                  }`}
                >
                  {checkedSteps[3] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-xs font-bold">
                      Adım 3: &apos;Allowed IPs&apos; (İzin Verilen IP&apos;ler) Kutusuna IP&apos;yi Ekleyin
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(serverIp, 'server');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{serverIp}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Teknik Detaylar sayfasındaki <strong>&quot;Allowed IPs&quot;</strong> veya <strong>&quot;IP Whitelist&quot;</strong> kutucuğuna yukarıdaki sunucu IP adresini (<code className="font-mono font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded">{serverIp}</code>) yapıştırın. Kutuda önceden başka bir IP varsa yeni bir satıra geçerek ekleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => toggleStep(4)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                checkedSteps[4]
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-white border-amber-200 text-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    checkedSteps[4]
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-amber-500'
                  }`}
                >
                  {checkedSteps[4] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">
                      Adım 4: Kaydet Butonuna Basın & 2-5 Dakika Bekleyin
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      <span>2-5 dk önbellek</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sayfanın altındaki <strong>Kaydet (Save)</strong> butonuna tıklayın. eMAG güvenlik duvarı yeni IP kurallarını sunucu havuzunda ortalama <strong>2 ila 5 dakika</strong> içinde yayına alır.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Bar */}
          <div className="p-3.5 rounded-2xl bg-amber-100/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Adımları tamamladıktan sonra bağlantıyı hemen test edin:
              </span>
            </div>

            {onTestConnection && (
              <button
                type="button"
                onClick={onTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0056B3] hover:bg-[#004494] text-white shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'eMAG Canlı API Test Ediliyor...' : 'Canlı Bağlantıyı Şimdi Test Et'}</span>
              </button>
            )}
          </div>

          {/* Crucial Tips Footer */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-[11px] text-emerald-950 space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Harika Haber: IP Adresi (34.34.246.189) eMAG Panelinizde &quot;Active&quot; Olarak Eklenmiş!</span>
            </div>
            <div className="text-[11px] text-emerald-900/90 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-emerald-200">
              <p className="font-semibold text-slate-900 mb-1">
                🔑 401 Hatasını Çözecek Tek Adım: Kullanıcı Adı Düzeltmesi
              </p>
              <p className="text-slate-700">
                eMAG panelinizdeki <strong>Seller IPs</strong> tablosunda <code>34.34.246.189</code> IP&apos;si yeşil <strong>Active</strong> olarak tanımlanmış ve karşısındaki <strong>User</strong> sütununda <strong><code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-bold font-mono">melis_oman_u-speedex_com_tr</code></strong> yazmaktadır.
              </p>
              <p className="text-slate-700 mt-1">
                Lütfen aşağıdaki formda <strong>eMAG API Kullanıcı Adı (User)</strong> alanına normal e-postanızı değil, tam olarak <strong className="text-blue-700 font-mono">melis_oman_u-speedex_com_tr</strong> yazıp kaydedin ve ardından testi yeniden çalıştırın!
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
