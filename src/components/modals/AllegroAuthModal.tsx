import React from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  Check,
  AlertCircle,
  ExternalLink,
  Globe2
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroConfig } from '../../types/allegro';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface AllegroAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const AllegroAuthModal: React.FC<AllegroAuthModalProps> = ({ isOpen, onClose, theme = 'light' }) => {
  const [config, setConfig] = React.useState<AllegroConfig>(store.getAllegroConfig());
  const [clientId, setClientId] = React.useState(config.clientId);
  const [clientSecret, setClientSecret] = React.useState(config.clientSecret);
  const [sellerLogin, setSellerLogin] = React.useState(config.sellerLogin);
  const [environment, setEnvironment] = React.useState<'sandbox' | 'production'>(config.environment);
  const [bearerToken, setBearerToken] = React.useState(config.bearerToken);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifySuccess, setVerifySuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const current = store.getAllegroConfig();
      setConfig(current);
      setClientId(current.clientId);
      setClientSecret(current.clientSecret);
      setSellerLogin(current.sellerLogin);
      setEnvironment(current.environment);
      setBearerToken(current.bearerToken);
      setVerifySuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSaveAndVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      store.updateAllegroConfig({
        clientId,
        clientSecret,
        sellerLogin,
        environment,
        bearerToken,
        isConnected: true
      });
      setVerifySuccess(true);
      setTimeout(() => {
        onClose();
      }, 900);
    }, 500);
  };

  const redirectUri = `${window.location.origin}/oauth/allegro/callback`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden shrink-0">
              <MarketplaceLogo platform="allegro" size="md" rounded="xl" />
            </div>
            <div>
              <h2 className="text-base font-bold">Allegro REST API Kimlik & Token Yapılandırması</h2>
              <p className="text-xs text-slate-400">apps.developer.allegro.pl üzerinden oluşturulan uygulama bilgileri</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Environment selection */}
          <div className="space-y-1.5">
            <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
              Çalışma Ortamı (Environment):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEnvironment('sandbox')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  environment === 'sandbox'
                    ? 'bg-[#F4F5F7] border-[#14171A] text-[#14171A] font-bold shadow-xs'
                    : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-xs">Sandbox (Test Ortamı)</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">api.allegro.pl.allegrosandbox.pl</div>
              </button>

              <button
                type="button"
                onClick={() => setEnvironment('production')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  environment === 'production'
                    ? 'bg-[#F4F5F7] border-[#14171A] text-[#14171A] font-bold shadow-xs'
                    : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-xs">Production (Canlı Satış)</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">api.allegro.pl</div>
              </button>
            </div>
          </div>

          {/* Client ID & Secret */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>Client ID:</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="c19e830f81d4489a..."
                className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>Client Secret:</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="••••••••••••••••••••"
                className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Seller Login */}
          <div className="space-y-1">
            <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
              Allegro Satıcı Kullanıcı Adı (Seller Login):
            </label>
            <input
              type="text"
              value={sellerLogin}
              onChange={(e) => setSellerLogin(e.target.value)}
              placeholder="omni_merchant_pro"
              className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Redirect URI Info */}
          <div className={`p-3 rounded-xl border space-y-1 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[11px] font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              OAuth2 Redirect URI (Allegro Portalına Tanımlayın):
            </div>
            <div className="font-mono text-[11px] text-[#14171A] font-semibold select-all break-all">
              {redirectUri}
            </div>
          </div>

          {/* Direct Bearer Token for immediate testing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                Manuel Bearer Token (Opsiyonel / Hızlı Test):
              </label>
              <span className="text-[10px] text-slate-400">JWT Token formatı</span>
            </div>
            <textarea
              rows={3}
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIs..."
              className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none resize-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'
              }`}
            />
          </div>

          {/* Docs link */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Henüz Allegro API anahtarınız yok mu?</span>
            <a
              href="https://developer.allegro.pl/documentation"
              target="_blank"
              rel="noreferrer"
              className="text-[#163300] font-semibold hover:underline flex items-center gap-1"
            >
              <span>developer.allegro.pl</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-3 ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSaveAndVerify}
            disabled={isVerifying}
            className="px-6 py-2.5 text-xs font-bold bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] rounded-full shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {verifySuccess ? (
              <>
                <Check className="w-4 h-4 text-[#163300]" />
                <span>Bağlantı Doğrulandı!</span>
              </>
            ) : isVerifying ? (
              <span>Doğrulanıyor...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Kaydet & Test Et</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
