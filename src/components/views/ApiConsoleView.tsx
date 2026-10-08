import React from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  Code,
  ShieldCheck,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroConfig } from '../../types/allegro';

interface PresetEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  description: string;
  body?: string;
}

const PRESETS: PresetEndpoint[] = [
  {
    name: 'Aktif Teklifleri Getir (/sale/offers)',
    method: 'GET',
    endpoint: '/sale/offers?publication.status=ACTIVE&limit=10',
    description: 'Satıcıya ait yayında olan tüm teklifleri ve stok durumunu listeler.'
  },
  {
    name: 'Siparişleri Listele (/order/checkout-forms)',
    method: 'GET',
    endpoint: '/order/checkout-forms?status=READY_FOR_PROCESSING',
    description: 'Alıcıların tamamladığı, kargoya hazır sipariş formlarını çeker.'
  },
  {
    name: 'Satıcı Profili & Yetkiler (/me)',
    method: 'GET',
    endpoint: '/me',
    description: 'Mevcut OAuth2 token sahibinin mağaza adı ve API yetki kapsamlarını sorgular.'
  },
  {
    name: 'Kategori Ağacını Çek (/sale/categories)',
    method: 'GET',
    endpoint: '/sale/categories?parent.id=42540',
    description: 'Elektronik ana kategorisi altındaki alt kategorileri getirir.'
  },
  {
    name: 'Kategori Zorunlu Parametreleri (/sale/categories/{id}/parameters)',
    method: 'GET',
    endpoint: '/sale/categories/257548/parameters',
    description: 'Smartwatch kategorisi için zorunlu olan EAN, Marka ve garanti parametre kurallarını döner.'
  },
  {
    name: 'Hızlı Fiyat Değiştirme Komutu (/sale/offer-price-change-commands)',
    method: 'PATCH',
    endpoint: '/sale/offer-price-change-commands/cmd-price-98214',
    description: 'Allegro asenkron komut mimarisiyle teklif fiyatını anında günceller.',
    body: JSON.stringify(
      {
        offer: { id: '14892019482' },
        price: { amount: '299.00', currency: 'PLN' }
      },
      null,
      2
    )
  },
  {
    name: 'Yeni Teklif Yayınla (/sale/offers)',
    method: 'POST',
    endpoint: '/sale/offers',
    description: 'Allegro standart JSON formatında yeni bir teklif oluşturur.',
    body: JSON.stringify(
      {
        name: 'Bezprzewodowy Głośnik Bluetooth Hi-Fi IPX7 30W Bass',
        category: { id: '66887' },
        sellingMode: {
          format: 'BUY_NOW',
          price: { amount: '159.00', currency: 'PLN' }
        },
        stock: { available: 50, unit: 'UNIT' },
        publication: { status: 'ACTIVE' },
        delivery: {
          shippingRates: { id: 'rate-smart-inpost' },
          handlingTime: 'PT24H'
        },
        parameters: [
          { id: '11323', name: 'Marka', values: ['SoundMaster'] },
          { id: '213', name: 'Stan', values: ['Nowy'] }
        ]
      },
      null,
      2
    )
  },
  {
    name: 'eMAG: Ürün & Teklif Kaydet (/api-3/product_offer/save)',
    method: 'POST',
    endpoint: '/api-3/product_offer/save',
    description: 'eMAG Marketplace API v3 standart JSON formatında ürün teklifi, fiyatı ve özelliklerini kaydeder.',
    body: JSON.stringify(
      [
        {
          id: 104829,
          part_number_key: 'EMG-82910',
          name: 'Căști Wireless Pro Sound ANC Hi-Res Audio 45h Autonomie',
          category_id: 1249,
          brand: 'AcousticAir',
          sale_price: 229.90,
          currency: 'RON',
          vat_id: 1,
          handling_time: 1,
          images: [
            { display_type: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }
          ],
          characteristics: [
            { id: 11, value: '5901234987654' },
            { id: 24, value: 'Negru Mat' }
          ]
        }
      ],
      null,
      2
    )
  },
  {
    name: 'eMAG: Siparişleri Oku (/api-3/order/read)',
    method: 'POST',
    endpoint: '/api-3/order/read',
    description: 'eMAG Romanya/Bulgaristan/Macaristan mağazalarındaki güncel siparişleri çeker.',
    body: JSON.stringify(
      {
        status: 1,
        currentPage: 1,
        itemsPerPage: 10
      },
      null,
      2
    )
  },
  {
    name: 'eMAG: Sameday AWB Kargo Oluştur (/api-3/awb/save)',
    method: 'POST',
    endpoint: '/api-3/awb/save',
    description: 'eMAG EasyBox veya Sameday kurye teslimatı için AWB taşıma belgesi ve takip numarası üretir.',
    body: JSON.stringify(
      {
        order_id: 9920148,
        courier: 'Sameday',
        service_id: 7,
        locker_id: 1049,
        parcels: 1
      },
      null,
      2
    )
  },
  {
    name: 'BaseLinker: Siparişleri Çek (getOrders)',
    method: 'POST',
    endpoint: 'https://api.baselinker.com/connector.php?method=getOrders',
    description: 'BaseLinker resmi connector API üzerinden Allegro, eMAG ve mağazadaki tüm yeni siparişleri listeler.',
    body: JSON.stringify(
      {
        token: '3004829-918204-BLTOKEN-K8F9204A8109',
        method: 'getOrders',
        parameters: {
          get_unconfirmed_orders: false,
          status_id: 8021,
          date_from: 1727740800
        }
      },
      null,
      2
    )
  },
  {
    name: 'BaseLinker: Depo Stoklarını Çek (getInventoryProductsList)',
    method: 'POST',
    endpoint: 'https://api.baselinker.com/connector.php?method=getInventoryProductsList',
    description: 'BaseLinker merkez depo kataloğundaki ürünlerin SKU, EAN, stok miktarı ve fiyatlarını döner.',
    body: JSON.stringify(
      {
        token: '3004829-918204-BLTOKEN-K8F9204A8109',
        method: 'getInventoryProductsList',
        parameters: {
          inventory_id: 'inv_main_warehouse',
          page: 1
        }
      },
      null,
      2
    )
  },
  {
    name: 'BaseLinker: Kargo Paketi & Barkod Oluştur (createPackageManual)',
    method: 'POST',
    endpoint: 'https://api.baselinker.com/connector.php?method=createPackageManual',
    description: 'InPost, Sameday veya DPD için kurye paketi oluşturur ve AWB takip barkodu üretir.',
    body: JSON.stringify(
      {
        token: '3004829-918204-BLTOKEN-K8F9204A8109',
        method: 'createPackageManual',
        parameters: {
          order_id: 7492104,
          courier_code: 'inpost',
          package_type: 'paczkomat',
          pickup_point_id: 'WAW104A'
        }
      },
      null,
      2
    )
  }
];

interface ApiConsoleViewProps {
  theme: 'light' | 'dark';
}

export const ApiConsoleView: React.FC<ApiConsoleViewProps> = ({ theme }) => {
  const [allegroConfig, setAllegroConfig] = React.useState<AllegroConfig>(store.getAllegroConfig());
  const [method, setMethod] = React.useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = React.useState('/sale/offers?publication.status=ACTIVE&limit=10');
  const [requestBody, setRequestBody] = React.useState('');
  const [responseStatus, setResponseStatus] = React.useState<number | null>(null);
  const [responseTime, setResponseTime] = React.useState<number | null>(null);
  const [responsePayload, setResponsePayload] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    return store.subscribe(() => {
      setAllegroConfig(store.getAllegroConfig());
    });
  }, []);

  const isDark = theme === 'dark';

  const handleApplyPreset = (preset: PresetEndpoint) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body || '');
    setResponseStatus(null);
    setResponsePayload(null);
  };

  const handleExecuteRequest = () => {
    setIsLoading(true);
    const startTime = performance.now();

    setTimeout(() => {
      let status = 200;
      let result: any = {};

      const offers = store.getOffers();
      const orders = store.getOrders();
      const categories = store.getCategories();

      if (endpoint.includes('/sale/offers') && method === 'GET') {
        result = {
          count: offers.length,
          totalCount: offers.length,
          offers: offers.map((o) => ({
            id: o.id,
            name: o.name,
            category: o.category,
            sellingMode: o.sellingMode,
            stock: o.stock,
            publication: o.publication,
            smartEligible: o.smartEligible
          }))
        };
      } else if (endpoint.includes('/sale/offers') && method === 'POST') {
        try {
          const parsed = JSON.parse(requestBody);
          const newOffer = store.createOffer(parsed);
          status = 201;
          result = {
            id: newOffer.id,
            name: newOffer.name,
            status: 'ACTIVE',
            createdAt: newOffer.createdAt
          };
        } catch {
          status = 400;
          result = {
            errors: [
              {
                code: 'INVALID_JSON_BODY',
                message: 'Gönderilen istek JSON formatına uygun değil.',
                details: 'Invalid JSON payload in request'
              }
            ]
          };
        }
      } else if (endpoint.includes('/order/checkout-forms')) {
        result = {
          checkoutForms: orders,
          count: orders.length,
          totalCount: orders.length
        };
      } else if (endpoint.includes('/me')) {
        result = {
          id: 'usr_829104829',
          login: allegroConfig.sellerLogin,
          email: `${allegroConfig.sellerLogin}@allegro-merchant.pl`,
          company: {
            name: 'OmniMarket Seller Hub Sp. z o.o.',
            taxId: 'PL5252849102'
          },
          features: ['SMART_SELLER', 'SUPER_SELLER', 'STANDARD_ALLEGRO_API'],
          environment: allegroConfig.environment
        };
      } else if (endpoint.includes('/sale/categories') && endpoint.includes('parameters')) {
        const cat = categories.find((c) => endpoint.includes(c.id)) || categories[1];
        result = {
          parameters: cat.parameters || []
        };
      } else if (endpoint.includes('/sale/categories')) {
        result = {
          categories: categories
        };
      } else if (endpoint.includes('/sale/offer-price-change-commands')) {
        try {
          const parsed = JSON.parse(requestBody);
          if (parsed.offer?.id && parsed.price?.amount) {
            store.updateOfferPrice(parsed.offer.id, parsed.price.amount);
            result = {
              id: `cmd-${Date.now()}`,
              input: parsed,
              status: 'SUCCESSFUL',
              createdAt: new Date().toISOString()
            };
          } else {
            status = 422;
            result = { errors: [{ code: 'VALIDATION_ERROR', message: 'offer.id ve price.amount zorunludur' }] };
          }
        } catch {
          status = 400;
          result = { errors: [{ code: 'INVALID_SYNTAX', message: 'JSON hatası' }] };
        }
      } else if (endpoint.includes('/api-3/product_offer/save')) {
        try {
          const parsed = JSON.parse(requestBody || '[]');
          const item = Array.isArray(parsed) ? parsed[0] : parsed;
          result = {
            isError: false,
            messages: [],
            results: [
              {
                id: item?.id || 104829,
                part_number_key: item?.part_number_key || 'EMG-82910',
                status: 1,
                message: 'Product offer successfully saved to eMAG Marketplace',
                validated_at: new Date().toISOString()
              }
            ]
          };
        } catch {
          status = 400;
          result = { isError: true, messages: ['Invalid JSON in product_offer payload'] };
        }
      } else if (endpoint.includes('/api-3/order/read')) {
        result = {
          isError: false,
          messages: [],
          results: orders.map((o) => ({
            order_id: o.id,
            status: 2,
            type: 1,
            payment_mode_id: 1,
            cashed_total: o.summary.totalToPay.amount,
            customer: {
              name: `${o.delivery.address.firstName} ${o.delivery.address.lastName}`,
              email: o.buyer.email,
              phone: o.delivery.address.phoneNumber
            },
            shipping: {
              courier: 'Sameday',
              method: o.delivery.method.name
            },
            date: o.createdAt
          }))
        };
      } else if (endpoint.includes('/api-3/awb/save')) {
        result = {
          isError: false,
          messages: [],
          results: {
            awb: 'SMD98201948201',
            order_id: 9920148,
            courier: 'Sameday Romania',
            service: 'EasyBox 24/7 Locker',
            parcels: 1,
            pdf_url: 'https://marketplace-api.emag.ro/api-3/awb/download/SMD98201948201.pdf',
            created_at: new Date().toISOString()
          }
        };
      } else {
        result = {
          message: 'API endpoint processed successfully',
          endpoint,
          method,
          timestamp: new Date().toISOString()
        };
      }

      const duration = Math.round(performance.now() - startTime);
      setResponseStatus(status);
      setResponseTime(duration);
      setResponsePayload(JSON.stringify(result, null, 2));
      setIsLoading(false);

      store.logApiCall({
        method,
        endpoint,
        status,
        durationMs: duration,
        requestHeaders: {
          Accept: 'application/vnd.allegro.public.v1+json',
          Authorization: `Bearer ${allegroConfig.bearerToken.slice(0, 15)}...`
        },
        requestBody: requestBody ? JSON.parse(requestBody || '{}') : undefined,
        responseBody: result,
        platform: endpoint.startsWith('/api-3') ? 'emag' : 'allegro'
      });
    }, 280);
  };

  const handleCopyResponse = () => {
    if (responsePayload) {
      navigator.clipboard.writeText(responsePayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const baseUrl =
    allegroConfig.environment === 'sandbox'
      ? 'https://api.allegro.pl.allegrosandbox.pl'
      : 'https://api.allegro.pl';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight">
            Allegro REST API Konsolu
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Resmi Allegro API standartlarına göre canlı test sorguları gönderin, istek ve yanıt başlıklarını inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://developer.allegro.pl/documentation"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-slate-200 text-[#14171A] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Allegro REST Referansı</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Preset Fast Actions */}
      <div className={`p-4 rounded-xl border space-y-2.5 ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="text-xs font-bold flex items-center gap-1.5 text-[#14171A]">
          <Sparkles className="w-3.5 h-3.5 text-[#163300]" />
          <span>Hazır Allegro REST Sorgu Şablonları (Presets):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className={`text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 hover:border-[#14171A] hover:bg-zinc-850 text-zinc-300'
                  : 'bg-slate-50 border-slate-200 hover:border-[#14171A] hover:bg-white text-slate-700 shadow-2xs'
              }`}
            >
              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                p.method === 'GET' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                p.method === 'POST' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
              }`}>
                {p.method}
              </span>
              <span className="font-semibold">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Request Builder */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Method & Endpoint bar */}
        <div className="space-y-1.5">
          <div className={`text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}>
            Hedef Uç Nokta (Target Endpoint)
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Method */}
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className={`border rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#14171A] focus:outline-none focus:border-[#14171A] cursor-pointer ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            {/* Base URL badge */}
            <span className={`hidden md:inline-flex items-center px-3 py-2 border rounded-lg text-xs font-mono ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {baseUrl}
            </span>

            {/* Endpoint path input */}
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/sale/offers"
              className={`flex-1 border focus:border-[#14171A] rounded-lg px-3 py-2 text-xs font-mono font-semibold focus:outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />

            {/* Execute Button */}
            <button
              onClick={handleExecuteRequest}
              disabled={isLoading}
              className="px-6 py-2.5 text-xs font-bold bg-[#9FE870] hover:bg-[#8ee05e] text-[#163300] rounded-full shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'İşleniyor...' : 'İsteği Gönder'}</span>
            </button>
          </div>
        </div>

        {/* Standard Headers Preview */}
        <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="text-[11px] font-sans font-bold text-slate-700 dark:text-zinc-200">İstek Başlıkları (Oto Enjekte):</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <div>
              <span className="text-slate-400">Accept:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">application/vnd.allegro.public.v1+json</span>
            </div>
            <div>
              <span className="text-slate-400">Authorization:</span>{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">Bearer {allegroConfig.bearerToken.slice(0, 16)}...</span>
            </div>
            {method !== 'GET' && (
              <div>
                <span className="text-slate-400">Content-Type:</span>{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">application/vnd.allegro.public.v1+json</span>
              </div>
            )}
          </div>
        </div>

        {/* Request Body (for POST/PUT/PATCH) */}
        {method !== 'GET' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>İstek Gövdesi (JSON Payload)</span>
              <span className="normal-case font-mono">application/vnd.allegro.public.v1+json</span>
            </div>
            <textarea
              rows={7}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder="JSON formatında veri girin..."
              className={`w-full border focus:border-[#14171A] rounded-xl p-3 text-xs font-mono font-medium focus:outline-none resize-y ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'
              }`}
            />
          </div>
        )}

        {/* Response Container */}
        {responsePayload && (
          <div className={`space-y-2 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Allegro REST Yanıtı:</span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    responseStatus && responseStatus < 300
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/50'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
                {responseTime !== null && (
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {responseTime} ms
                  </span>
                )}
              </div>

              <button
                onClick={handleCopyResponse}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'JSON Kopyala'}</span>
              </button>
            </div>

            <pre className={`p-4 rounded-xl border overflow-x-auto text-xs font-mono max-h-96 leading-relaxed ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-900 border-slate-800 text-emerald-300'
            }`}>
              {responsePayload}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
