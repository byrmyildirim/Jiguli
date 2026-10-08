import React from 'react';
import {
  X,
  Share2,
  Check,
  ShieldCheck,
  Globe2,
  ExternalLink
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { PlatformConfig } from '../../types/allegro';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface ChannelConfigModalProps {
  platform: PlatformConfig | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const ChannelConfigModal: React.FC<ChannelConfigModalProps> = ({ platform, onClose, theme = 'light' }) => {
  const [credentials, setCredentials] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (platform) {
      setCredentials({ ...platform.credentials });
      setSuccess(false);
    }
  }, [platform]);

  if (!platform) return null;

  const isDark = theme === 'dark';

  const handleFieldChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      store.updatePlatform(platform.id, {
        credentials,
        status: 'configured',
        lastSyncAt: new Date().toISOString()
      });

      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden shrink-0">
              <MarketplaceLogo platform={platform.id} size="md" rounded="xl" />
            </div>
            <div>
              <h2 className="text-base font-bold">{platform.name} API Entegrasyonu</h2>
              <p className="text-xs text-slate-400">{platform.country} Pazaryeri Bağlantı Parametreleri</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
            {platform.name} mağazanızdan siparişleri çekmek ve stok senkronizasyonu sağlamak için ilgili API anahtarlarını tanımlayın:
          </p>

          {/* BaseLinker API Configuration */}
          {platform.id === 'baselinker' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                  BaseLinker API Token (X-BLToken):
                </label>
                <input
                  type="password"
                  required
                  value={credentials.apiToken || ''}
                  onChange={(e) => handleFieldChange('apiToken', e.target.value)}
                  placeholder="3004829-918204-BLTOKEN-..."
                  className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <span className="text-[10px] text-slate-400">BaseLinker Paneli &gt; Hesabım &gt; API bölümünden alınan API anahtarı</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                    Depo / Depolama ID (Storage ID):
                  </label>
                  <input
                    type="text"
                    value={credentials.storageId || 'bl_1'}
                    onChange={(e) => handleFieldChange('storageId', e.target.value)}
                    placeholder="bl_1 (BaseLinker Deposu)"
                    className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                    Envanter Katalog ID:
                  </label>
                  <input
                    type="text"
                    value={credentials.inventoryId || 'inv_main_warehouse'}
                    onChange={(e) => handleFieldChange('inventoryId', e.target.value)}
                    placeholder="inv_main_warehouse"
                    className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                  Varsayılan Kargo Taşıyıcı Modülü:
                </label>
                <select
                  value={credentials.defaultCourier || 'inpost'}
                  onChange={(e) => handleFieldChange('defaultCourier', e.target.value)}
                  className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-medium focus:outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="inpost">InPost Paczkomaty / Kurier 24/7 (Polonya)</option>
                  <option value="sameday">Sameday EasyBox Locker (Romanya / Bulgaristan / Macaristan)</option>
                  <option value="dpd">DPD Kurier Europe</option>
                  <option value="dhl">DHL Express / Parcel</option>
                  <option value="gls">GLS Parcel Logistics</option>
                  <option value="pocztex">Pocztex Poczta Polska</option>
                </select>
              </div>
            </div>
          )}

          {/* eMAG Marketplace API v3 configuration */}
          {platform.id === 'emag' && (
            <div className="space-y-3">
            <div className="space-y-1">
              <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                eMAG Kullanıcı Adı (Username / Email):
              </label>
              <input
                type="text"
                required
                value={credentials.username || ''}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="Örn: seller@company.ro"
                className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                eMAG API Şifresi (User Password / API Hash):
              </label>
              <input
                type="password"
                required
                value={credentials.userPassword || ''}
                onChange={(e) => handleFieldChange('userPassword', e.target.value)}
                placeholder="••••••••••••••••••••"
                className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <span className="text-[10px] text-slate-400">eMAG Satıcı Paneli &gt; Setari Cont &gt; Profil &gt; API Security bölümünden oluşturulan anahtar</span>
            </div>

            <div className="space-y-1">
              <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                Hedef eMAG Pazarı & API Endpoint:
              </label>
              <select
                value={credentials.apiEndpoint || 'https://marketplace-api.emag.bg/api-3'}
                onChange={(e) => {
                  handleFieldChange('apiEndpoint', e.target.value);
                  const country = e.target.value.includes('.bg') ? 'BG' : e.target.value.includes('.hu') ? 'HU' : 'RO';
                  handleFieldChange('countryMarket', country);
                }}
                className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="https://marketplace-api.emag.bg/api-3">🇧🇬 eMAG Bulgaristan (BGN - Aktif) · marketplace-api.emag.bg</option>
                <option value="https://marketplace-api.emag.ro/api-3">🇷🇴 eMAG Romanya (Devre Dışı)</option>
                <option value="https://marketplace-api.emag.hu/api-3">🇭🇺 eMAG Macaristan (Devre Dışı)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                Sameday EasyBox / Fan Courier Servis Entegrasyonu:
              </label>
              <input
                type="text"
                value={credentials.courierService || 'Sameday EasyBox Locker 24/7'}
                onChange={(e) => handleFieldChange('courierService', e.target.value)}
                placeholder="Örn: Sameday EasyBox Locker 24/7"
                className={`w-full border focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>
          )}

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Resmi API Kılavuzu:</span>
            <a
              href={platform.apiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#163300] font-semibold hover:underline flex items-center gap-1"
            >
              <span>{platform.name} Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className={`pt-3 border-t flex items-center justify-end gap-3 ${
            isDark ? 'border-zinc-800' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] rounded-full shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 text-[#163300]" />
                  <span>Kaydedildi!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSaving ? 'Kaydediliyor...' : 'Kanala Bağlan & Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
