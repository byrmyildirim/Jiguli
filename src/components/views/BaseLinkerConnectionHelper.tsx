import React, { useState } from 'react';
import {
  Layers,
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
  Terminal,
  Lock,
  Boxes,
  Truck,
  ArrowRight,
  Info
} from 'lucide-react';

interface BaseLinkerConnectionHelperProps {
  apiToken?: string;
  inventoryId?: string;
  onTestConnection?: () => void;
  isTesting?: boolean;
  defaultExpanded?: boolean;
}

export const BaseLinkerConnectionHelper: React.FC<BaseLinkerConnectionHelperProps> = ({
  apiToken = '',
  inventoryId = '',
  onTestConnection,
  isTesting = false,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Interactive step completion checklist
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: Boolean(apiToken && apiToken.length > 5),
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

  const panelUrl = 'https://panel.baselinker.com';
  const apiEndpoint = 'https://api.baselinker.com/connector.php';

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-cyan-50/30 p-4 sm:p-5 shadow-xs transition-all space-y-4">
      {/* Header bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpanded ? 'pb-3 border-b border-slate-200/80' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-slate-900 text-white border border-slate-800 shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>BaseLinker API & Entegrasyon Bağlantı Rehberi</span>
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isAllCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-800 border border-slate-300'
              }`}>
                {isAllCompleted ? 'Tüm Adımlar Hazır ✓' : `${completedCount}/4 Adım Tamamlandı`}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                X-BLToken (Tek Anahtar)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              BaseLinker panelinizden tek bir API Token alarak tüm Allegro, eMAG, Amazon ve kargo kanallarınızı tek elden bağlayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <a
            href={panelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs transition-colors"
          >
            <span>BaseLinker Panel</span>
            <ExternalLink className="w-3 h-3 text-slate-600" />
          </a>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Rehberi Kapat' : 'Rehberi Aç'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Guide Content: Shown only when expanded */}
      {isExpanded && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150">
          {/* Quick Setup Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* API Endpoint Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>API Gateway URL (connector.php)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">Tüm sipariş, stok ve kargo istekleri bu uç noktadan geçer</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(apiEndpoint, 'endpoint')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                    copiedField === 'endpoint'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-black text-white'
                  }`}
                >
                  {copiedField === 'endpoint' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 text-cyan-400 font-mono text-[11px] px-3 py-2 rounded-xl border border-slate-800 select-all font-semibold">
                {apiEndpoint}
              </div>
            </div>

            {/* Header Format Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-cyan-50 text-cyan-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Yetkilendirme Başlığı (Auth Header)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">BaseLinker tek bir API Token anahtarı kullanır</span>
                  </div>
                </div>

                <div className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tek Anahtar (Kolay Kurulum)
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-100 text-slate-800 font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 select-all font-bold">
                <span>X-BLToken: {apiToken ? `${apiToken.slice(0, 8)}...` : '300XXXX-XXXXXXXX'}</span>
                <span className="text-[10px] font-sans text-slate-500 font-normal">HTTP Header</span>
              </div>
            </div>
          </div>

          {/* 4-Step Interactive Checklist */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>4 Adımda BaseLinker API Entegrasyonu</span>
            </div>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div
                onClick={() => toggleStep(1)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  checkedSteps[1]
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[1]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-slate-500'
                    }`}
                  >
                    {checkedSteps[1] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span>Adım 1: BaseLinker Paneline Giriş Yapın</span>
                      </span>
                      <a
                        href={panelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>panel.baselinker.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      BaseLinker kullanıcı hesabınızla oturum açın. Eğer henüz bir hesabınız yoksa BaseLinker 14 günlük ücretsiz deneme hesabı sunmaktadır.
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
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[2]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-slate-500'
                    }`}
                  >
                    {checkedSteps[2] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 2: &apos;Hesabım &gt; API&apos; (Account &gt; API) Sayfasına Gidin</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      BaseLinker panelinin sağ üst köşesindeki profil/hesap simgenize tıklayın ve açılan menüden <strong>&quot;Konto / Moje konto&quot; (Hesabım) &gt; &quot;API&quot;</strong> sekmesini seçin.
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
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[3]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-slate-500'
                    }`}
                  >
                    {checkedSteps[3] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 3: &apos;API Token&apos; Değerini Kopyalayın</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      API sayfasında yer alan <strong>API Token</strong> alanındaki anahtarı kopyalayın (Örnek: <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">3001234-5678901-XXXXXXXXX</code>). Eğer henüz oluşturulmamışsa <strong>&quot;Generate new token&quot;</strong> butonuna basarak yeni bir anahtar üretin.
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
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      checkedSteps[4]
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-slate-500'
                    }`}
                  >
                    {checkedSteps[4] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Adım 4: Token&apos;ı Aşağıdaki Forma Yapıştırın ve Kaydedin</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Kopyaladığınız token&apos;ı aşağıdaki <strong>BaseLinker API Token (X-BLToken)</strong> kutucuğuna yapıştırın ve <strong>&quot;BaseLinker Ayarlarını Kaydet&quot;</strong> butonuna basın. Ardından <strong>&quot;Canlı Bağlantıyı Test Et&quot;</strong> butonuna basarak bağlantıyı anında doğrulayabilirsiniz!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BaseLinker Capabilities Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Boxes className="w-3.5 h-3.5 text-blue-600" />
                <span>Tek Merkezden Sipariş</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Allegro, eMAG, Amazon, eBay siparişlerini tek bir havuzda toplayıp faturaya dönüştürür.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Anlık Stok Senkronu</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Bir pazaryerinde ürün satıldığında diğer tüm pazaryerlerindeki stokları otomatik düşürür.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Truck className="w-3.5 h-3.5 text-purple-600" />
                <span>Kargo ve Takip</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                InPost, Sameday, DPD, DHL, Poczta Polska barkod ve etiketlerini otomatik basar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
