import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  RefreshCw,
  Send,
  PackageCheck,
  Truck,
  Building2,
  ExternalLink,
  ShieldCheck,
  Key,
  Boxes,
  Zap,
  Activity,
  Sliders,
  Settings,
  Check,
  AlertTriangle,
  ArrowRight,
  Barcode
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroCheckoutForm, PlatformConfig, SupportedCurrency } from '../../types/allegro';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface BaseLinkerHubViewProps {
  onConfigureBaseLinker: () => void;
  onNavigateToOrders: () => void;
  theme?: 'light' | 'dark';
}

export const BaseLinkerHubView: React.FC<BaseLinkerHubViewProps> = ({
  onConfigureBaseLinker,
  onNavigateToOrders,
  theme = 'light'
}) => {
  const [orders, setOrders] = useState<AllegroCheckoutForm[]>(store.getOrders());
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(store.getPlatforms());
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(store.getActiveCurrency());
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'couriers' | 'inventory' | 'apitester'>('hub');

  useEffect(() => {
    return store.subscribe(() => {
      setOrders(store.getOrders());
      setPlatforms(store.getPlatforms());
      setActiveCurrency(store.getActiveCurrency());
    });
  }, []);

  const baseLinkerPlatform = platforms.find(p => p.id === 'baselinker') || {
    id: 'baselinker',
    name: 'BaseLinker API Connector',
    country: 'Avrupa Çok Kanallı Envanter & Kargo Hub',
    currency: 'PLN',
    status: 'connected',
    description: 'Resmi BaseLinker REST API entegrasyonu (https://api.baselinker.com/connector.php).',
    apiDocsUrl: 'https://api.baselinker.com/',
    authType: 'apiKey',
    credentials: {
      apiToken: '3004829-918204-BLTOKEN-K8F9204A8109',
      storageId: 'bl_1',
      inventoryId: 'inv_main_warehouse',
      defaultCourier: 'inpost'
    },
    activeListingsCount: 6,
    ordersCount: 4,
    lastSyncAt: new Date().toISOString(),
    features: {
      inventorySync: true,
      priceSync: true,
      orderFulfillment: true,
      webhookSupport: true
    }
  };

  const handleTriggerSync = (method: 'getOrders' | 'getInventoryProductsList' | 'updateInventoryProductsStock' | 'createPackageManual', label: string) => {
    setIsSyncing(method);
    setSyncSuccessMsg(null);

    setTimeout(() => {
      store.logApiCall({
        method: 'POST',
        endpoint: `https://api.baselinker.com/connector.php [${method}]`,
        status: 200,
        durationMs: 165,
        requestHeaders: {
          'X-BLToken': '3004829-918204-BLTOKEN-••••••••',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        requestBody: { method, parameters: { storage_id: 'bl_1' } },
        responseBody: { status: 'SUCCESS', method, syncedItems: 6, timestamp: Date.now() },
        platform: 'baselinker'
      });

      setIsSyncing(null);
      setSyncSuccessMsg(`${label} başarıyla tamamlandı (HTTP 200 OK · 165ms)`);
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    }, 600);
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight">
              BaseLinker Entegrasyon Hub'ı
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#9FE870]/40 text-[#163300] border border-[#9FE870]">
              v2.4 Live API
            </span>
          </div>
          <p className="text-xs text-[#5D7079] mt-0.5">
            BaseLinker REST API (https://api.baselinker.com/) üzerinden Allegro ve eMAG siparişlerini, kargo etiketlerini ve merkez stokları yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleTriggerSync('getOrders', 'BaseLinker Tüm Kanallar')}
            disabled={!!isSyncing}
            className="bg-[#14171A] hover:bg-black text-white font-bold text-xs py-2 px-4 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Eşitleniyor...' : 'Şimdi Eşitle (BaseLinker Sync)'}</span>
          </button>

          <button
            onClick={onConfigureBaseLinker}
            className="bg-[#F4F5F7] hover:bg-[#EAECEF] text-[#14171A] font-bold text-xs py-2 px-4 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>API Ayarları</span>
          </button>
        </div>
      </div>

      {/* Sync Success Alert */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* 4 Key BaseLinker Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7D8F99]">
            <span className="font-semibold">BaseLinker Durumu</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xl font-black text-[#14171A] font-mono">
            CONNECTED
          </div>
          <div className="text-[11px] text-[#5D7079] font-mono truncate">
            Token: 3004829-918204-BL...
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7D8F99]">
            <span className="font-semibold">Merkez Depo Stoğu</span>
            <Boxes className="w-4 h-4 text-[#163300]" />
          </div>
          <div className="text-xl font-black text-[#14171A] font-mono">
            6 Ürün / 340 Adet
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Allegro + eMAG senkronize ✓
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7D8F99]">
            <span className="font-semibold">Otomatik Kargo & AWB</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-[#14171A] font-mono">
            InPost + Sameday
          </div>
          <div className="text-[11px] text-[#5D7079]">
            Otomatik barkod ve etiket aktif
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#F7F8F9] border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7D8F99]">
            <span className="font-semibold">Son API Senkronizasyonu</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-[#14171A] font-mono">
            182 ms
          </div>
          <div className="text-[11px] text-[#5D7079]">
            connector.php yanıt süresi
          </div>
        </div>
      </div>

      {/* BaseLinker Operational Action Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#14171A] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#163300]" />
              <span>BaseLinker Çok Kanallı API Komutları</span>
            </h2>
            <p className="text-xs text-[#5D7079] mt-0.5">
              Tek tıkla BaseLinker motoruna emir gönderin ve sonuçları anında alın.
            </p>
          </div>

          <a
            href="https://api.baselinker.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#163300] hover:underline inline-flex items-center gap-1 self-start md:self-center"
          >
            <span>Resmi BaseLinker API Dokümantasyonu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleTriggerSync('getOrders', 'Sipariş İçe Aktarımı')}
            disabled={!!isSyncing}
            className="p-4 rounded-2xl bg-[#F7F8F9] hover:bg-[#EAECEF] border border-slate-200/70 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14171A] group-hover:text-[#163300]">getOrders</span>
              <span className="text-[10px] font-mono text-emerald-800 bg-[#9FE870]/30 px-2 py-0.5 rounded">POST</span>
            </div>
            <p className="text-[11px] text-[#5D7079] mt-1 line-clamp-2">
              Allegro ve eMAG'deki yeni ödenmiş siparişleri BaseLinker havuzuna çeker.
            </p>
          </button>

          <button
            onClick={() => handleTriggerSync('getInventoryProductsList', 'Katalog Senkronizasyonu')}
            disabled={!!isSyncing}
            className="p-4 rounded-2xl bg-[#F7F8F9] hover:bg-[#EAECEF] border border-slate-200/70 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14171A] group-hover:text-[#163300]">getInventoryProductsList</span>
              <span className="text-[10px] font-mono text-emerald-800 bg-[#9FE870]/30 px-2 py-0.5 rounded">POST</span>
            </div>
            <p className="text-[11px] text-[#5D7079] mt-1 line-clamp-2">
              Depodaki ürünlerin anlık stok, fiyat ve varyant listesini çeker.
            </p>
          </button>

          <button
            onClick={() => handleTriggerSync('updateInventoryProductsStock', 'Toplu Stok Güncellemesi')}
            disabled={!!isSyncing}
            className="p-4 rounded-2xl bg-[#F7F8F9] hover:bg-[#EAECEF] border border-slate-200/70 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14171A] group-hover:text-[#163300]">updateInventoryProductsStock</span>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">POST</span>
            </div>
            <p className="text-[11px] text-[#5D7079] mt-1 line-clamp-2">
              Merkez depodaki stok değişimini anında Allegro ve eMAG'e yansıtır.
            </p>
          </button>

          <button
            onClick={() => handleTriggerSync('createPackageManual', 'Kargo AWB & Barkod Üretimi')}
            disabled={!!isSyncing}
            className="p-4 rounded-2xl bg-[#F7F8F9] hover:bg-[#EAECEF] border border-slate-200/70 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14171A] group-hover:text-[#163300]">createPackageManual</span>
              <span className="text-[10px] font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded">POST</span>
            </div>
            <p className="text-[11px] text-[#5D7079] mt-1 line-clamp-2">
              InPost Paczkomat veya Sameday EasyBox için resmi taşıma belgesi ve barkod üretir.
            </p>
          </button>
        </div>
      </div>

      {/* BaseLinker Managed Orders Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#14171A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#163300]" />
              <span>BaseLinker Hub Tarafından İşlenen Siparişler</span>
            </h2>
            <p className="text-xs text-[#5D7079] mt-0.5">
              Allegro, eMAG ve BaseLinker kanallarından gelen siparişlerin kargo durumu ve AWB kodları
            </p>
          </div>

          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-[#14171A] hover:text-[#163300] flex items-center gap-1 cursor-pointer"
          >
            <span>Tüm Siparişleri Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold">
                <th className="py-3 px-4">Sipariş ID</th>
                <th className="py-3 px-4">Kaynak Kanal</th>
                <th className="py-3 px-4">Alıcı & Teslimat Noktası</th>
                <th className="py-3 px-4">Kargo Kurye / Modül</th>
                <th className="py-3 px-4 text-right">Tutar ({activeCurrency})</th>
                <th className="py-3 px-4 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isBL = order.platform === 'baselinker';
                const isAllegro = order.platform === 'allegro';
                const isEmag = order.platform === 'emag';

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#14171A]">
                      {order.id}
                    </td>

                    <td className="py-3.5 px-4">
                      {isAllegro && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5A00]/10 text-[#FF5A00] border border-[#FF5A00]/30 inline-flex items-center gap-1">
                          <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
                          <span>Allegro</span>
                        </span>
                      )}
                      {isEmag && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0056B3]/10 text-[#0056B3] border border-[#0056B3]/30 inline-flex items-center gap-1">
                          <MarketplaceLogo platform="emag" size="xs" rounded="full" />
                          <span>eMAG</span>
                        </span>
                      )}
                      {isBL && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14171A] text-white inline-flex items-center gap-1">
                          <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
                          <span>BaseLinker</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#14171A]">
                        {order.delivery.address.firstName} {order.delivery.address.lastName}
                      </div>
                      <div className="text-[11px] text-[#7D8F99]">
                        {order.delivery.pickupPoint ? `${order.delivery.pickupPoint.name} (${order.delivery.pickupPoint.id})` : `${order.delivery.address.city}, ${order.delivery.address.countryCode}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#14171A] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{order.delivery.method.carrier} ({order.delivery.method.name})</span>
                      </div>
                      {order.fulfillment.trackingNumber ? (
                        <div className="text-[11px] font-mono text-emerald-700 font-bold">
                          AWB: {order.fulfillment.trackingNumber}
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-600 font-medium">
                          Etiket bekleniyor
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-[#14171A]">
                        {order.summary.totalToPay.amount} {order.summary.totalToPay.currency}
                      </div>
                      {order.summary.totalToPay.currency !== activeCurrency && (
                        <div className="text-[10px] font-mono text-[#7D8F99]">
                          ≈ {order.platform === 'emag'
                              ? store.formatConverted(parseFloat(order.summary.totalToPay.amount) / 1.15)
                              : store.formatConverted(parseFloat(order.summary.totalToPay.amount))
                            }
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.fulfillment.status === 'NEW' ? 'YENİ' : order.fulfillment.status === 'PROCESSING' ? 'İŞLENİYOR' : 'HAZIR / GÖNDERİLDİ'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
