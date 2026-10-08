import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe2,
  Layers,
  ArrowRight,
  Info,
  HelpCircle,
  Terminal,
  Lock,
  RefreshCw
} from 'lucide-react';

interface AllegroConnectionHelperProps {
  environment: 'production' | 'sandbox';
  clientId?: string;
  clientSecret?: string;
  onTestConnection?: () => void;
  isTesting?: boolean;
  defaultExpanded?: boolean;
  onOpenDocs?: () => void;
}

export const AllegroConnectionHelper: React.FC<AllegroConnectionHelperProps> = ({
  environment = 'production',
  clientId = '',
  clientSecret = '',
  onTestConnection,
  isTesting = false,
  defaultExpanded = false,
  onOpenDocs
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Interactive step completion checklist
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: Boolean(clientId && clientSecret),
    4: false
  });

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const isAllCompleted = completedCount === 4;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Determine current host for redirect URI & documentation URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-w2qdizdtvlpufom3twu32s-20337845826.europe-west2.run.app';
  const callbackUrl = `${currentOrigin}/api/allegro/callback`;
  const docsUrl = `${currentOrigin}/docs/allegro`;
  const localhostCallbackUrl = 'http://localhost:3000/api/allegro/callback';

  const portalUrl = environment === 'sandbox'
    ? 'https://apps.developer.allegro.pl.allegrosandbox.pl'
    : 'https://apps.developer.allegro.pl';

  const appNameSuggestion = 'OmniChannel Marketplace Hub - Allegro & Multi-Platform Portal';
  const recommendedScopes = 'allegro:api:sale:offers:read allegro:api:sale:offers:write allegro:api:orders:read allegro:api:sale:categories allegro:api:billing:read';

  return (
    <div className="rounded-3xl border border-orange-200/90 bg-gradient-to-b from-orange-50/70 to-amber-50/40 p-4 sm:p-5 shadow-xs transition-all space-y-4">
      {/* Header bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpanded ? 'pb-3 border-b border-orange-200/70' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-[#FF5A00]/15 text-[#FF5A00] border border-[#FF5A00]/30 shrink-0">
            <Key className="w-5 h-5 text-[#FF5A00]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Allegro REST API & OAuth 2.0 Kurulum ve Bağlantı Rehberi</span>
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isAllCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-orange-100 text-orange-900 border border-orange-300'
              }`}>
                {isAllCompleted ? 'Tüm Adımlar Hazır ✓' : `${completedCount}/4 Adım Tamamlandı`}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-orange-800 border border-orange-200">
                {environment === 'production' ? 'Production (allegro.pl)' : 'Sandbox Test'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Allegro Developer Portal üzerinden Client ID & Client Secret alarak mağazanızı OAuth2 ile bağlama rehberi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-xs font-bold text-orange-800 shadow-2xs transition-colors"
          >
            <span>Developer Portal</span>
            <ExternalLink className="w-3 h-3 text-orange-600" />
          </a>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-orange-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Rehberi Kapat' : 'Rehberi Aç'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Guide Content: Shown only when expanded */}
      {isExpanded && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150">
          {/* Quick Setup Values (Direct Copy Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Documentation URL Box (Requested by Allegro developer portal) */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-orange-50/70 border border-orange-300 shadow-2xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-[#FF5A00]/15 text-[#FF5A00]">
                    <HelpCircle className="w-4 h-4 text-[#FF5A00]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <span>Dokümantasyon URL</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF5A00] text-white uppercase">
                        Allegro İster
                      </span>
                    </span>
                    <span className="text-[10px] text-orange-800/80 block">Adres URL dokumentacji / Opis</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onOpenDocs && (
                    <button
                      type="button"
                      onClick={onOpenDocs}
                      className="p-1.5 rounded-lg text-xs font-bold bg-white text-orange-800 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200"
                      title="Dokümantasyonu Oku"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-orange-700" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(docsUrl, 'docsUrl')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer ${
                      copiedField === 'docsUrl'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#FF5A00] hover:bg-[#e04f00] text-white'
                    }`}
                  >
                    {copiedField === 'docsUrl' ? (
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
                </div>
              </div>

              <div className="bg-slate-950 text-orange-300 font-mono text-[11px] px-3 py-2 rounded-xl border border-slate-800 break-all select-all font-semibold">
                {docsUrl}
              </div>
            </div>

            {/* Redirect URI Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-orange-200 shadow-2xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-orange-50 text-orange-700">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Redirect URI</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-900 uppercase">
                        Callback
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">Adresy przekierowań alanına yapıştırın</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(callbackUrl, 'callback')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer ${
                    copiedField === 'callback'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {copiedField === 'callback' ? (
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
              </div>

              <div className="bg-slate-950 text-orange-400 font-mono text-[11px] px-3 py-2 rounded-xl border border-slate-800 break-all select-all font-semibold">
                {callbackUrl}
              </div>
            </div>

            {/* Application Name Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Uygulama Adı</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">Nazwa aplikacji alanına yapıştırın</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(appNameSuggestion, 'appName')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer ${
                    copiedField === 'appName'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {copiedField === 'appName' ? (
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
              </div>

              <div className="flex items-center justify-between bg-slate-100 text-slate-800 font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 select-all font-bold truncate">
                <span className="truncate">{appNameSuggestion}</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Interactive Checklist */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>4 Adımda Allegro API Entegrasyonu Kontrol Listesi</span>
            </div>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div
                onClick={() => toggleStep(1)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  checkedSteps[1]
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-orange-200 text-slate-800 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[1]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-orange-500'
                    }`}
                  >
                    {checkedSteps[1] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span>Adım 1: Allegro Developer Portal&apos;a Giriş Yapın</span>
                      </span>
                      <a
                        href={portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-bold text-orange-700 hover:text-orange-900 inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>{portalUrl.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Allegro satıcı hesabınızla (Konto firmowe) developer portalına giriş yapın. Henüz developer kaydınız yoksa sağ üstteki <strong>&quot;Zaloguj się&quot; (Giriş Yap)</strong> butonunu kullanarak mevcut Allegro satıcı hesabınızla oturum açabilirsiniz.
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
                    : 'bg-white border-orange-200 text-slate-800 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[2]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-orange-500'
                    }`}
                  >
                    {checkedSteps[2] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 2: &apos;Zarejestruj nową aplikację&apos; (Yeni Uygulama Kaydet)</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Developer portalındaki <strong>&quot;Zarejestruj nową aplikację&quot;</strong> butonuna tıklayın ve formu şu şekilde doldurun:
                    </p>
                    <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside bg-orange-50/50 p-2.5 rounded-xl border border-orange-100 font-medium">
                      <li><strong>Nazwa aplikacji (Adı):</strong> <code className="bg-white px-1 py-0.5 rounded font-mono text-orange-950">{appNameSuggestion}</code></li>
                      <li><strong>Typ aplikacji (Türü):</strong> <code className="bg-white px-1 py-0.5 rounded font-mono text-orange-950">Aplikasyon internetowa (Web application)</code> seçin</li>
                      <li><strong>Adres URL dokumentacji / Opis:</strong> <code className="bg-white px-1 py-0.5 rounded font-mono text-orange-950 break-all">{docsUrl}</code> adresini yapıştırın</li>
                      <li><strong>Adres przekierowania (Redirect URI):</strong> Yukarıda verilen <code className="bg-white px-1 py-0.5 rounded font-mono text-orange-950 break-all">{callbackUrl}</code> adresini yapıştırın</li>
                      <li>Tüm kullanım şartlarını onaylayıp <strong>&quot;Zapisz&quot; (Kaydet)</strong> butonuna basın.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => toggleStep(3)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  checkedSteps[3]
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-orange-200 text-slate-800 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[3]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-orange-500'
                    }`}
                  >
                    {checkedSteps[3] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 3: Client ID ve Client Secret Bilgilerini Kopyalayıp Aşağıya Ekleyin</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Uygulama kaydınız tamamlandığında ekranda beliren <strong>Client ID</strong> (uzun harf/rakam dizisi) ve <strong>Client Secret</strong> (gizli anahtar) değerlerini kopyalayarak hemen aşağıdaki <strong>Allegro REST API v2</strong> form alanlarına yapıştırıp <strong>&quot;Allegro Ayarlarını Kaydet&quot;</strong> butonuna basın.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-orange-900 bg-orange-100/70 p-2 rounded-xl">
                      <Lock className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                      <span>Client Secret değeri yalnızca ilk oluşturulduğunda bir kez gösterilir; kaydetmeyi unutmayın!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => toggleStep(4)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  checkedSteps[4]
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-orange-200 text-slate-800 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[4]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-orange-500'
                    }`}
                  >
                    {checkedSteps[4] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 4: &apos;OAuth Token Al / Bağlan&apos; Butonuna Basın</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Bilgileri kaydettikten sonra aşağıdaki <strong>&quot;OAuth Token Al / Bağlan&quot;</strong> veya <strong>&quot;Canlı Bağlantıyı Test Et&quot;</strong> butonuna basarak Allegro OAuth sunucusuyla el sıkışmasını tamamlayın. Sistem HTTP 200 yanıtı alarak token'ı otomatik yenileme döngüsüne alacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info & Endpoint Summary */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-600" />
              <span>Allegro OAuth2 Teknik Mimarisi & Uç Noktaları</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-sans font-bold">Token Uç Noktası:</span>
                <span className="text-slate-800 break-all">POST https://allegro.pl/auth/oauth/token</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-sans font-bold">API Base URL:</span>
                <span className="text-slate-800 break-all">https://api.allegro.pl</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
