import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe2,
  Building2,
  Truck,
  Coins,
  Save,
  RotateCcw,
  Download,
  Edit3,
  Sliders,
  ExternalLink,
  Layers,
  ShoppingBag,
  Zap,
  Check,
  Server,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  DownloadCloud,
  UploadCloud,
  ArrowUpDown,
  Terminal,
  KeyRound,
  Copy,
  Package
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { SUPPORTED_CURRENCIES, EXCHANGE_RATES, CURRENCY_SYMBOLS } from '../../services/allegroData';
import { tcmbService, TCMBData } from '../../services/tcmbService';
import { EmagIpWhitelistHelper } from './EmagIpWhitelistHelper';
import { AllegroConnectionHelper } from './AllegroConnectionHelper';
import { BaseLinkerConnectionHelper } from './BaseLinkerConnectionHelper';
import { EmagTaxonomySyncPanel } from '../common/EmagTaxonomySyncPanel';
import {
  AllegroConfig,
  SupportedCurrency,
  PlatformConfig,
  MarketplaceId,
  PlatformCredentials
} from '../../types/allegro';
import { MarketplaceLogo } from '../../constants/marketplaces';
import { useTheme } from '../../context/ThemeContext';
import { ResetPanelModal } from '../modals/ResetPanelModal';

interface SettingsViewProps {
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme: propTheme, onNavigateToTab }) => {
  const { theme: ctxTheme, setTheme, toggleTheme } = useTheme();
  const currentAppTheme = propTheme || ctxTheme;
  const [showResetModal, setShowResetModal] = useState(false);
  // Slogan State
  const [slogan, setSlogan] = useState<string>(store.getSlogan());
  const [editingSlogan, setEditingSlogan] = useState(false);
  const [sloganInput, setSloganInput] = useState<string>(store.getSlogan());

  // Integration Tabs
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<'ALL' | 'EMAG' | 'BASELINKER' | 'ALLEGRO'>('ALL');
  
  // Guides accordion state
  const [openGuides, setOpenGuides] = useState<Record<string, boolean>>({
    emag: false,
    baselinker: false,
    allegro: false
  });

  const toggleGuide = (platform: string) => {
    setOpenGuides(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Multi-Platform Credentials (Antigravity Architecture Spec)
  const [creds, setCreds] = useState<PlatformCredentials>(store.getPlatformCredentials());

  // Input bindings mapped directly to creds
  const emagUser = creds.emag.username;
  const emagApiKey = creds.emag.userHash;
  const emagCountry = (creds.emag.country || 'bg').toUpperCase() as 'RO' | 'BG' | 'HU';
  const setEmagUser = (val: string) => setCreds(prev => ({ ...prev, emag: { ...prev.emag, username: val } }));
  const setEmagApiKey = (val: string) => setCreds(prev => ({ ...prev, emag: { ...prev.emag, userHash: val } }));
  const setEmagCountry = (val: 'RO' | 'BG' | 'HU') => setCreds(prev => ({ ...prev, emag: { ...prev.emag, country: val.toLowerCase() as any } }));

  const blToken = creds.baselinker.apiToken;
  const setBlToken = (val: string) => setCreds(prev => ({ ...prev, baselinker: { ...prev.baselinker, apiToken: val } }));

  const clientId = creds.allegro.clientId;
  const clientSecret = creds.allegro.clientSecret;
  const environment = creds.allegro.environment;
  const allegroToken = creds.allegro.accessToken || '';
  const setClientId = (val: string) => setCreds(prev => ({ ...prev, allegro: { ...prev.allegro, clientId: val } }));
  const setClientSecret = (val: string) => setCreds(prev => ({ ...prev, allegro: { ...prev.allegro, clientSecret: val } }));
  const setEnvironment = (val: 'production' | 'sandbox') => setCreds(prev => ({ ...prev, allegro: { ...prev.allegro, environment: val } }));
  const setAllegroToken = (val: string) => setCreds(prev => ({ ...prev, allegro: { ...prev.allegro, accessToken: val } }));

  // Two-Way Data Transfer Activity State (Inbound & Outbound test feedback)
  const [activeTransfer, setActiveTransfer] = useState<{
    platform: 'emag' | 'baselinker' | 'allegro';
    action: 'orders' | 'stock' | 'token' | 'products';
    loading: boolean;
    result?: {
      success: boolean;
      status?: number;
      durationMs?: number;
      endpoint?: string;
      headerPreview?: string;
      message: string;
      data?: any;
    };
  } | null>(null);

  // Allegro additional UI state
  const [sellerLogin, setSellerLogin] = useState(store.getAllegroConfig().sellerLogin);

  // eMAG additional state
  const [emagGeniusEnabled, setEmagGeniusEnabled] = useState(true);
  const [emagVatRate, setEmagVatRate] = useState('20');
  const [emagApiCode, setEmagApiCode] = useState(creds.emag.apiCode || 'chrsadv');

  // BaseLinker additional state
  const [blInventoryId, setBlInventoryId] = useState('inv_main_warsaw_01');
  const [blAutoSyncStock, setBlAutoSyncStock] = useState(true);
  const [blAutoSyncPrice, setBlAutoSyncPrice] = useState(true);
  const [blAutoFulfill, setBlAutoFulfill] = useState(true);

  // Currency
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(store.getActiveCurrency());

  // Status & Feedback per platform
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<MarketplaceId | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, { message: string; isError: boolean; status?: number; durationMs?: number } | null>>({});
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [serverIp, setServerIp] = useState<string>('34.34.246.189');
  const [clientIp, setClientIp] = useState<string>('');
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedClientIp, setCopiedClientIp] = useState(false);

  useEffect(() => {
    fetch('/api/system/server-ip')
      .then(r => r.json())
      .then(d => {
        if (d?.serverIp || d?.ip) setServerIp(d.serverIp || d.ip);
        if (d?.clientIp) setClientIp(d.clientIp);
      })
      .catch(() => {});
  }, []);

  const [tcmbData, setTcmbData] = useState<TCMBData | null>(tcmbService.getData());
  const [isRefreshingTcmb, setIsRefreshingTcmb] = useState(false);

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setSlogan(store.getSlogan());
      setActiveCurrency(store.getActiveCurrency());
      setCreds(store.getPlatformCredentials());
    });
    const unsubTcmb = tcmbService.subscribe((data) => {
      setTcmbData(data);
    });
    return () => {
      unsubStore();
      unsubTcmb();
    };
  }, []);

  const handleRefreshTcmb = async () => {
    setIsRefreshingTcmb(true);
    try {
      const res = await tcmbService.fetchLiveRates();
      showNotice(`TCMB canlı kurları başarıyla güncellendi! (Bülten: ${res.bulletinDate} - ${res.bulletinNo})`);
    } catch {
      showNotice('TCMB kurları güncellenirken hata oluştu.');
    } finally {
      setIsRefreshingTcmb(false);
    }
  };

  const sloganPresets = [
    'Az yakar, çok satar.',
    'Tüplü ve öfkeli e-ticaret.',
    'Yokuşta bayılmaz, stokta yanıltmaz.',
    'Bizde benzin değil, Złoty yakılır.',
    'Vitesi 5’e, satışı Złoty’ye tak.',
    'Sanayiye uğratmayan pazaryeri motoru.',
    'Çin’den yükler, Varşova’ya gazlar.'
  ];

  const handleSaveSlogan = () => {
    store.setSlogan(sloganInput.trim() || 'Az yakar, çok satar.');
    setEditingSlogan(false);
    showNotice('Slogan başarıyla güncellendi!');
  };

  const handleSelectPresetSlogan = (preset: string) => {
    setSloganInput(preset);
    store.setSlogan(preset);
    setEditingSlogan(false);
    showNotice(`Slogan "${preset}" olarak ayarlandı!`);
  };

  const handleSaveAllegroApi = (e: React.FormEvent) => {
    e.preventDefault();
    store.savePlatformCredentials({ allegro: creds.allegro });
    showNotice('Allegro REST API ayarları başarıyla kaydedildi!');
  };

  const handleSaveEmagApi = (e: React.FormEvent) => {
    e.preventDefault();
    store.savePlatformCredentials({
      emag: {
        ...creds.emag,
        apiCode: emagApiCode
      }
    });
    showNotice(`eMAG Marketplace (${creds.emag.country.toUpperCase()}) ayarları başarıyla kaydedildi!`);
  };

  const handleSaveBaseLinkerApi = (e: React.FormEvent) => {
    e.preventDefault();
    store.savePlatformCredentials({ baselinker: creds.baselinker });
    showNotice('BaseLinker Hub API ayarları başarıyla kaydedildi!');
  };

  const handleTestPing = async (platform: MarketplaceId) => {
    setTestingPlatform(platform);
    setPingStatus(prev => ({ ...prev, [platform]: null }));

    if (platform === 'emag') {
      try {
        const res = await fetch('/api/emag/test-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: creds.emag.username,
            userHash: creds.emag.userHash,
            country: creds.emag.country
          })
        });
        const data = await res.json().catch(() => null);

        const realBase64 = typeof btoa !== 'undefined'
          ? btoa(`${creds.emag.username}:${creds.emag.userHash}`)
          : '';
        const maskedPreview = data?.headerPreview || (realBase64 ? `Authorization: Basic ${realBase64.slice(0, 10)}...${realBase64.slice(-4)}` : 'Authorization: Basic ...');

        store.logApiCall({
          method: 'POST',
          endpoint: `/api-3/user/read [REAL eMAG LIVE PING: ${creds.emag.country.toUpperCase()}]`,
          status: data?.status || res.status,
          durationMs: data?.durationMs || 150,
          requestHeaders: { Authorization: maskedPreview },
          requestBody: { user: creds.emag.username, country: creds.emag.country },
          responseBody: data || { error: 'Unknown response' },
          platform: 'emag'
        });

        setTestingPlatform(null);
        setPingStatus(prev => ({
          ...prev,
          emag: {
            message: data?.message || (data?.success ? 'eMAG bağlantısı başarılı!' : 'eMAG yetkilendirme hatası.'),
            isError: !data?.success,
            status: data?.status || res.status,
            durationMs: data?.durationMs
          }
        }));
      } catch (err: any) {
        setTestingPlatform(null);
        setPingStatus(prev => ({
          ...prev,
          emag: {
            message: `eMAG bağlantı hatası: ${err?.message || err}`,
            isError: true
          }
        }));
      }
      return;
    }

    if (platform === 'baselinker') {
      try {
        const res = await fetch('/api/baselinker/test-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiToken: creds.baselinker.apiToken })
        });
        const data = await res.json().catch(() => null);

        store.logApiCall({
          method: 'POST',
          endpoint: '/connector.php [REAL BASELINKER LIVE PING]',
          status: data?.status || res.status,
          durationMs: data?.durationMs || 100,
          requestHeaders: { 'X-BLToken': creds.baselinker.apiToken ? `${creds.baselinker.apiToken.slice(0, 8)}...` : 'empty' },
          requestBody: { method: 'getStoragesList' },
          responseBody: data || { error: 'Unknown response' },
          platform: 'baselinker'
        });

        setTestingPlatform(null);
        setPingStatus(prev => ({
          ...prev,
          baselinker: {
            message: data?.message || (data?.success ? 'BaseLinker bağlantısı başarılı!' : 'BaseLinker bağlantısı başarısız.'),
            isError: !data?.success,
            status: data?.status || res.status,
            durationMs: data?.durationMs
          }
        }));
      } catch (err: any) {
        setTestingPlatform(null);
        setPingStatus(prev => ({
          ...prev,
          baselinker: {
            message: `BaseLinker bağlantı hatası: ${err?.message || err}`,
            isError: true
          }
        }));
      }
      return;
    }

    if (platform === 'allegro') {
      try {
        const res = await fetch('/api/allegro/test-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: creds.allegro.clientId,
            clientSecret: creds.allegro.clientSecret,
            environment: creds.allegro.environment,
            accessToken: creds.allegro.accessToken
          })
        });
        const data = await res.json().catch(() => null);

        store.logApiCall({
          method: 'POST',
          endpoint: `/auth/oauth/token [REAL ALLEGRO LIVE PING: ${creds.allegro.environment}]`,
          status: data?.status || res.status,
          durationMs: data?.durationMs || 120,
          requestHeaders: { Authorization: 'Basic base64(clientId:clientSecret)' },
          requestBody: { grant_type: 'client_credentials', environment: creds.allegro.environment },
          responseBody: data || { error: 'Unknown response' },
          platform: 'allegro'
        });

        setTestingPlatform(null);
        setPingStatus(prev => ({
          ...prev,
          allegro: {
            message: data?.message || (data?.success ? 'Allegro bağlantısı başarılı!' : 'Allegro yetkilendirme hatası.'),
            isError: !data?.success,
            status: data?.status || res.status,
            durationMs: data?.durationMs
          }
        }));
      } catch (err: any) {
        setTestingPlatform(null);
        setPingStatus(prev => ({
          ...prev,
          allegro: {
            message: `Allegro bağlantı hatası: ${err?.message || err}`,
            isError: true
          }
        }));
      }
      return;
    }
  };

  // Allegro OAuth Token Alma / Yenileme (Refresh Token Akışı)
  const handleFetchAllegroOAuthToken = async () => {
    setActiveTransfer({ platform: 'allegro', action: 'token', loading: true });
    try {
      const res = await fetch('/api/allegro/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: creds.allegro.clientId,
          clientSecret: creds.allegro.clientSecret,
          environment: creds.allegro.environment,
          grant_type: creds.allegro.refreshToken ? 'refresh_token' : 'client_credentials',
          refresh_token: creds.allegro.refreshToken
        })
      });
      const data = await res.json().catch(() => null);

      if (data?.success && data?.access_token) {
        const updated = {
          ...creds.allegro,
          accessToken: data.access_token,
          refreshToken: data.refresh_token || creds.allegro.refreshToken,
          tokenExpiresAt: data.tokenExpiresAt
        };
        setCreds(prev => ({ ...prev, allegro: updated }));
        store.savePlatformCredentials({ allegro: updated });
        showNotice('Allegro OAuth2 token başarıyla alındı ve güncellendi!');
      }

      setActiveTransfer({
        platform: 'allegro',
        action: 'token',
        loading: false,
        result: {
          success: Boolean(data?.success),
          status: res.status,
          durationMs: data?.durationMs || 180,
          endpoint: `POST https://${creds.allegro.environment === 'sandbox' ? 'allegro.pl.allegrosandbox.pl' : 'allegro.pl'}/auth/oauth/token`,
          headerPreview: 'Authorization: Basic base64(clientId:clientSecret)',
          message: data?.message || (data?.success ? 'OAuth token alındı' : 'Yetkilendirme hatası'),
          data
        }
      });
    } catch (err: any) {
      setActiveTransfer({
        platform: 'allegro',
        action: 'token',
        loading: false,
        result: {
          success: false,
          status: 500,
          message: `OAuth isteği hatası: ${err?.message || err}`
        }
      });
    }
  };

  // İki Yönlü Veri Transferi: Siparişleri Çek (Inbound)
  const handleTransferOrders = async (platform: 'emag' | 'baselinker' | 'allegro') => {
    setActiveTransfer({ platform, action: 'orders', loading: true });
    try {
      if (platform === 'emag') {
        const res = await fetch('/api/emag/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: creds.emag.country,
            username: creds.emag.username,
            userHash: creds.emag.userHash,
            currentPage: 1,
            itemsPerPage: 10,
            status: 3
          })
        });
        const data = await res.json().catch(() => null);
        const realBase64 = typeof btoa !== 'undefined'
          ? btoa(`${creds.emag.username}:${creds.emag.userHash}`)
          : '';
        const maskedPreview = data?.headerPreview || (realBase64 ? `Authorization: Basic ${realBase64.slice(0, 10)}...${realBase64.slice(-4)}` : 'Authorization: Basic ...');

        setActiveTransfer({
          platform: 'emag',
          action: 'orders',
          loading: false,
          result: {
            success: Boolean(data?.success),
            status: res.status,
            durationMs: data?.durationMs || 160,
            endpoint: `POST https://marketplace-api.emag.${creds.emag.country}/api-3/order/read`,
            headerPreview: maskedPreview,
            message: data?.message || (data?.success ? 'eMAG siparişleri çekildi' : 'Sipariş çekme hatası'),
            data: data?.results || data
          }
        });
      } else if (platform === 'baselinker') {
        const res = await fetch('/api/baselinker/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiToken: creds.baselinker.apiToken })
        });
        const data = await res.json().catch(() => null);
        setActiveTransfer({
          platform: 'baselinker',
          action: 'orders',
          loading: false,
          result: {
            success: Boolean(data?.success),
            status: res.status,
            durationMs: data?.durationMs || 110,
            endpoint: 'POST https://api.baselinker.com/connector.php [method=getOrders]',
            headerPreview: `X-BLToken: ${creds.baselinker.apiToken ? creds.baselinker.apiToken.slice(0, 10) + '...' : 'empty'}`,
            message: data?.message || (data?.success ? 'BaseLinker siparişleri çekildi' : 'Sipariş çekme hatası'),
            data: data?.orders || data
          }
        });
      } else if (platform === 'allegro') {
        const res = await fetch('/api/allegro/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: creds.allegro.accessToken,
            environment: creds.allegro.environment
          })
        });
        const data = await res.json().catch(() => null);
        setActiveTransfer({
          platform: 'allegro',
          action: 'orders',
          loading: false,
          result: {
            success: Boolean(data?.success),
            status: res.status,
            durationMs: data?.durationMs || 140,
            endpoint: `GET https://${creds.allegro.environment === 'sandbox' ? 'api.allegro.pl.allegrosandbox.pl' : 'api.allegro.pl'}/order/checkout-forms?status=READY_FOR_PROCESSING`,
            headerPreview: `Authorization: Bearer ${creds.allegro.accessToken ? creds.allegro.accessToken.slice(0, 15) + '...' : 'empty'}`,
            message: data?.message || (data?.success ? 'Allegro siparişleri çekildi' : 'Sipariş çekme hatası'),
            data: data?.checkoutForms || data
          }
        });
      }
    } catch (err: any) {
      setActiveTransfer({
        platform,
        action: 'orders',
        loading: false,
        result: {
          success: false,
          status: 500,
          message: `Sipariş çekme ağ hatası: ${err?.message || err}`
        }
      });
    }
  };

  // İki Yönlü Veri Transferi: eMAG Gerçek Ürün Kataloğunu Çek (Inbound)
  const handleTransferProducts = async (platform: 'emag') => {
    setActiveTransfer({ platform, action: 'products', loading: true });
    try {
      const res = await store.fetchEmagProducts();
      const realBase64 = typeof btoa !== 'undefined'
        ? btoa(`${creds.emag.username}:${creds.emag.userHash}`)
        : '';
      const maskedPreview = realBase64 ? `Authorization: Basic ${realBase64.slice(0, 10)}...${realBase64.slice(-4)}` : 'Authorization: Basic ...';

      setActiveTransfer({
        platform: 'emag',
        action: 'products',
        loading: false,
        result: {
          success: res.success,
          status: 200,
          durationMs: 350,
          endpoint: `POST https://marketplace-api.emag.${creds.emag.country}/api-3/product_offer/read`,
          headerPreview: maskedPreview,
          message: res.message,
          data: res.offers
        }
      });
      if (res.success) {
        showNotice(`eMAG üzerinden ${res.count} gerçek ürün başarıyla çekildi ve 'Ürünler & Stok' sayfasına yüklendi!`);
      }
    } catch (err: any) {
      setActiveTransfer({
        platform: 'emag',
        action: 'products',
        loading: false,
        result: {
          success: false,
          status: 500,
          message: `Ürün çekme hatası: ${err?.message || err}`
        }
      });
    }
  };

  // İki Yönlü Veri Transferi: Stok / Fiyat Gönder (Outbound)
  const handleTransferStock = async (platform: 'emag' | 'baselinker' | 'allegro') => {
    setActiveTransfer({ platform, action: 'stock', loading: true });
    try {
      if (platform === 'emag') {
        const sampleOffers = store.getOffers().slice(0, 2).map(o => ({
          id: o.id,
          sale_price: parseFloat(o.sellingMode.price.amount),
          stock: o.stock.available
        }));
        const res = await fetch('/api/emag/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: creds.emag.country,
            username: creds.emag.username,
            userHash: creds.emag.userHash,
            offers: sampleOffers
          })
        });
        const data = await res.json().catch(() => null);
        const realBase64 = typeof btoa !== 'undefined'
          ? btoa(`${creds.emag.username}:${creds.emag.userHash}`)
          : '';
        const maskedPreview = data?.headerPreview || (realBase64 ? `Authorization: Basic ${realBase64.slice(0, 10)}...${realBase64.slice(-4)}` : 'Authorization: Basic ...');

        setActiveTransfer({
          platform: 'emag',
          action: 'stock',
          loading: false,
          result: {
            success: Boolean(data?.success),
            status: res.status,
            durationMs: data?.durationMs || 170,
            endpoint: `POST https://marketplace-api.emag.${creds.emag.country}/api-3/product_offer/save`,
            headerPreview: maskedPreview,
            message: data?.message || 'eMAG stok güncelleme isteği gönderildi',
            data: data?.data || data
          }
        });
      } else if (platform === 'baselinker') {
        const sampleProducts: Record<string, any> = {};
        store.getOffers().slice(0, 2).forEach(o => {
          sampleProducts[o.id] = { stock: o.stock.available };
        });
        const res = await fetch('/api/baselinker/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiToken: creds.baselinker.apiToken,
            inventory_id: 'main',
            products: sampleProducts
          })
        });
        const data = await res.json().catch(() => null);
        setActiveTransfer({
          platform: 'baselinker',
          action: 'stock',
          loading: false,
          result: {
            success: Boolean(data?.success),
            status: res.status,
            durationMs: data?.durationMs || 130,
            endpoint: 'POST https://api.baselinker.com/connector.php [method=updateInventoryProductsStock]',
            headerPreview: `X-BLToken: ${creds.baselinker.apiToken ? creds.baselinker.apiToken.slice(0, 10) + '...' : 'empty'}`,
            message: data?.message || 'BaseLinker stok senkronizasyonu gönderildi',
            data: data?.data || data
          }
        });
      } else if (platform === 'allegro') {
        const firstOffer = store.getOffers()[0];
        const res = await fetch('/api/allegro/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: creds.allegro.accessToken,
            environment: creds.allegro.environment,
            offerId: firstOffer?.id || 'sample-offer-1',
            stock: firstOffer?.stock?.available || 25
          })
        });
        const data = await res.json().catch(() => null);
        setActiveTransfer({
          platform: 'allegro',
          action: 'stock',
          loading: false,
          result: {
            success: Boolean(data?.success),
            status: res.status,
            durationMs: data?.durationMs || 150,
            endpoint: `PATCH https://${creds.allegro.environment === 'sandbox' ? 'api.allegro.pl.allegrosandbox.pl' : 'api.allegro.pl'}/sale/offers/${firstOffer?.id || 'offer-id'}`,
            headerPreview: `Authorization: Bearer ${creds.allegro.accessToken ? creds.allegro.accessToken.slice(0, 15) + '...' : 'empty'}`,
            message: data?.message || 'Allegro stok güncelleme isteği gönderildi',
            data: data?.data || data
          }
        });
      }
    } catch (err: any) {
      setActiveTransfer({
        platform,
        action: 'stock',
        loading: false,
        result: {
          success: false,
          status: 500,
          message: `Stok gönderme ağ hatası: ${err?.message || err}`
        }
      });
    }
  };

  const showNotice = (msg: string) => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#14171A]" />
            <span>Sistem & Entegrasyon Ayarları</span>
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Allegro, eMAG, BaseLinker API anahtarları, marka sloganı ve vergi parametreleri.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* 0. Tema ve Görünüm Tercihi (Dark Mode / Light Mode) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#9FE870]/30 text-[#163300]">
              {currentAppTheme === 'dark' ? <Moon className="w-4 h-4 text-[#163300]" /> : <Sun className="w-4 h-4 text-[#163300]" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14171A]">Tema & Görünüm (Karanlık Mod)</h2>
              <p className="text-[11px] text-slate-500">CSS değişkenleri ile global tema değişimi ve yerel tarayıcı (localStorage) senkronizasyonu</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#9FE870]/30 text-[#163300] uppercase tracking-wider">
            {currentAppTheme === 'dark' ? 'Karanlık Mod Aktif' : 'Açık Mod Aktif'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Light Mode Option */}
          <div
            onClick={() => {
              setTheme('light');
              showNotice('Tema "Açık Mod" olarak ayarlandı ve kaydedildi.');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              currentAppTheme === 'light'
                ? 'border-[#14171A] bg-slate-50 ring-2 ring-[#9FE870]/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-2xs">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#14171A]">Açık Tema (Light Mode)</div>
                <div className="text-[10px] text-slate-500">Standart aydınlık çalışma ortamı</div>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              currentAppTheme === 'light' ? 'border-[#14171A] bg-[#14171A]' : 'border-slate-300'
            }`}>
              {currentAppTheme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>

          {/* Dark Mode Option */}
          <div
            onClick={() => {
              setTheme('dark');
              showNotice('Tema "Karanlık Mod" olarak ayarlandı ve kaydedildi.');
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              currentAppTheme === 'dark'
                ? 'border-[#9FE870] bg-[#151D2A] ring-2 ring-[#9FE870]/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B0F19] border border-slate-700 flex items-center justify-center text-[#9FE870] shadow-2xs">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#14171A]">Karanlık Tema (Dark Mode)</div>
                <div className="text-[10px] text-slate-500">Göz yormayan, gece ve yüksek kontrast modu</div>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              currentAppTheme === 'dark' ? 'border-[#9FE870] bg-[#9FE870]' : 'border-slate-300'
            }`}>
              {currentAppTheme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-[#163300]" />}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Marka & Slogan Yönetimi */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#9FE870]/30 text-[#163300]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14171A]">Marka & Slogan Yönetimi</h2>
              <p className="text-[11px] text-slate-500">Logonun altında ve panel genelinde görünen slogan</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingSlogan ? sloganInput : slogan}
              onChange={(e) => {
                setEditingSlogan(true);
                setSloganInput(e.target.value);
              }}
              placeholder="Örn: Az yakar, çok satar."
              className="flex-1 border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-semibold focus:outline-none bg-slate-50"
            />
            {editingSlogan ? (
              <button
                onClick={handleSaveSlogan}
                className="bg-[#14171A] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Kaydet
              </button>
            ) : (
              <button
                onClick={() => setEditingSlogan(true)}
                className="bg-slate-100 hover:bg-slate-200 text-[#14171A] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Hazır Slogan Şablonları (Tek Tıkla Seçin):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sloganPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetSlogan(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    slogan === preset
                      ? 'bg-[#14171A] text-white border-[#14171A] font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-[#5D7079] border-slate-200'
                  }`}
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Varsayılan Para Birimi & Kur Yönetimi (TCMB Canlı Entegrasyon) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#9FE870]/30 text-[#163300]">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#14171A]">Varsayılan Para Birimi & Kur Ayarları</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9FE870]/30 text-[#163300] border border-[#9FE870]">
                  Aktif: {activeCurrency} ({CURRENCY_SYMBOLS[activeCurrency] || activeCurrency})
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TCMB Canlı Kurlar
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Paneldeki tüm ürün fiyatları, sipariş tutarları, kargo maliyetleri ve ciro istatistikleri bu para biriminde görüntülenir. Kurlar doğrudan T.C. Merkez Bankası'ndan çekilmektedir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRefreshTcmb}
              disabled={isRefreshingTcmb}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              title="TCMB canlı kurlarını hemen güncelle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTcmb ? 'animate-spin text-emerald-700' : 'text-slate-600'}`} />
              <span>{isRefreshingTcmb ? 'TCMB Çekiliyor...' : 'TCMB Kurlarını Yenile'}</span>
            </button>
          </div>
        </div>

        {/* TCMB Live Bulletin Banner */}
        {tcmbData && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-900">🏛️ T.C. Merkez Bankası (TCMB) Günlük Bülten:</span>
              <span className="font-mono bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold text-[11px]">
                Tarih: {tcmbData.bulletinDate} · No: {tcmbData.bulletinNo}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
              <span className="bg-white/90 px-2.5 py-0.5 rounded-md border border-emerald-200 text-[#163300]">
                1 USD = {tcmbData.tcmbUsdSelling.toFixed(2)} ₺
              </span>
              <span className="bg-white/90 px-2.5 py-0.5 rounded-md border border-emerald-200 text-blue-800">
                1 EUR = {tcmbData.tcmbEurSelling.toFixed(2)} ₺
              </span>
            </div>
          </div>
        )}

        {/* Currency Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = curr.code === activeCurrency;
            return (
              <div
                key={curr.code}
                onClick={() => {
                  store.setActiveCurrency(curr.code as SupportedCurrency);
                  showNotice(`Varsayılan para birimi "${curr.name} (${curr.code})" olarak güncellendi!`);
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#163300] bg-[#9FE870]/10 ring-2 ring-[#9FE870]/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{curr.flag}</span>
                    <div>
                      <div className="text-xs font-black text-[#14171A] flex items-center gap-1.5">
                        <span>{curr.code}</span>
                        <span className="text-[10px] font-mono font-bold text-[#163300] bg-[#9FE870]/30 px-1.5 py-0.2 rounded">
                          {curr.symbol}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#163300] bg-[#163300]' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#9FE870]" />}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] text-slate-500 font-medium line-clamp-1">
                    {curr.market}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">1 USD ($) =</span>
                    <span className="text-[#163300] font-bold">
                      {curr.code === 'USD' ? '1.00 $' : `${curr.rateAgainstUsd} ${curr.symbol}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">1 EUR (€) =</span>
                    <span className="text-blue-700 font-bold">
                      {curr.code === 'EUR' ? '1.00 €' : `${curr.rateAgainstEur} ${curr.symbol}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
              <Coins className="w-4 h-4 text-[#163300]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#14171A]">
                Canlı Döviz Çevrim Örneği (USD & EUR Bazında):
              </div>
              <div className="text-[11px] text-slate-500">
                100 USD = <strong>{(100 * (SUPPORTED_CURRENCIES.find(c => c.code === activeCurrency)?.rateAgainstUsd || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {CURRENCY_SYMBOLS[activeCurrency] || activeCurrency}</strong> · 100 EUR = <strong>{(100 * (SUPPORTED_CURRENCIES.find(c => c.code === activeCurrency)?.rateAgainstEur || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {CURRENCY_SYMBOLS[activeCurrency] || activeCurrency}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-[#163300] shadow-2xs">
              100 $ = {(100 * (SUPPORTED_CURRENCIES.find(c => c.code === activeCurrency)?.rateAgainstUsd || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {CURRENCY_SYMBOLS[activeCurrency]}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-blue-700 shadow-2xs">
              100 € = {(100 * (SUPPORTED_CURRENCIES.find(c => c.code === activeCurrency)?.rateAgainstEur || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {CURRENCY_SYMBOLS[activeCurrency]}
            </span>
          </div>
        </div>
      </div>

      {/* Entegrasyonlar Başlığı ve Hızlı Geçiş Sekmeleri */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#14171A] tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#14171A]" />
              <span>Pazaryeri API Entegrasyonları (Canlı Ortam)</span>
            </h2>
            <p className="text-xs text-slate-500">
              eMAG, BaseLinker ve Allegro hesaplarınızı ayrı ayrı yapılandırın ve bağımsız canlı bağlantı testleri uygulayın.
            </p>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto self-start sm:self-auto">
            <button
              onClick={() => setActiveIntegrationTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeIntegrationTab === 'ALL'
                  ? 'bg-white text-[#14171A] shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              Tümü (3 Kanal)
            </button>
            <button
              onClick={() => setActiveIntegrationTab('EMAG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeIntegrationTab === 'EMAG'
                  ? 'bg-[#0056B3] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0056B3]'
              }`}
            >
              <MarketplaceLogo platform="emag" size="xs" rounded="full" />
              <span>eMAG</span>
            </button>
            <button
              onClick={() => setActiveIntegrationTab('BASELINKER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeIntegrationTab === 'BASELINKER'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <MarketplaceLogo platform="baselinker" size="xs" rounded="full" />
              <span>BaseLinker</span>
            </button>
            <button
              onClick={() => setActiveIntegrationTab('ALLEGRO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeIntegrationTab === 'ALLEGRO'
                  ? 'bg-[#FF5A00] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#FF5A00]'
              }`}
            >
              <MarketplaceLogo platform="allegro" size="xs" rounded="full" />
              <span>Allegro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. eMAG Marketplace API Ayarları */}
      {(activeIntegrationTab === 'ALL' || activeIntegrationTab === 'EMAG') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <MarketplaceLogo platform="emag" size="lg" rounded="xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#14171A]">eMAG Marketplace API v3</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0056B3]/10 text-[#0056B3]">
                    {emagCountry === 'BG' ? 'marketplace-api.emag.bg' : emagCountry === 'HU' ? 'marketplace-api.emag.hu' : 'marketplace-api.emag.ro'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    {emagCountry === 'BG' ? '🇧🇬 Bulgaristan' : emagCountry === 'HU' ? '🇭🇺 Macaristan' : '🇷🇴 Romanya'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Balkanlar pazarında canlı ürün listeleme, stok güncelleme ve sipariş kabulü
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => toggleGuide('emag')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>API Nasıl Alınır?</span>
                {openGuides['emag'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleTestPing('emag')}
                disabled={testingPlatform === 'emag'}
                className="bg-[#0056B3] hover:bg-[#004494] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === 'emag' ? 'animate-spin' : ''}`} />
                <span>{testingPlatform === 'emag' ? 'Sunucuya Bağlanıyor...' : 'Canlı Bağlantıyı Test Et'}</span>
              </button>
            </div>
          </div>

          {/* eMAG Rehber Accordion (Antigravity Spec) */}
          {openGuides['emag'] && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-slate-700 space-y-3 animate-in fade-in">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <Info className="w-4 h-4 text-blue-600" />
                  eMAG Marketplace API v3 Entegrasyon Mimarisi
                </span>
                <span className="text-[10px] font-mono bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  HTTP Basic Auth
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5 p-3 rounded-xl bg-white border border-blue-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gerekli Form Alanları:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    <li><strong>Pazar Ülkesi:</strong> Romanya (RO), Bulgaristan (BG), Macaristan (HU)</li>
                    <li><strong>Kullanıcı Adı:</strong> eMAG satıcı hesabı kullanıcı e-postası</li>
                    <li><strong>API Şifresi / Hash:</strong> Satıcı paneli &gt; Profilim &gt; API Details bölümünden üretilen özel şifre</li>
                  </ul>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-white border border-blue-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pazar Base URL Listesi:</span>
                  <ul className="space-y-1 font-mono text-[10px] text-slate-700">
                    <li>🇷🇴 <strong>RO:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">https://marketplace-api.emag.ro/api-3</code></li>
                    <li>🇧🇬 <strong>BG:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">https://marketplace-api.emag.bg/api-3</code></li>
                    <li>🇭🇺 <strong>HU:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">https://marketplace-api.emag.hu/api-3</code></li>
                  </ul>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Örnek Canlı İstek (Sipariş Listeleme - cURL):</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto leading-relaxed">
{`curl -X POST "https://marketplace-api.emag.bg/api-3/order/read" \\
  -H "Authorization: Basic $(echo -n 'KULLANICI_ADI:API_HASH_SIFRE' | base64)" \\
  -H "Content-Type: application/json" \\
  -d '{
    "currentPage": 1,
    "itemsPerPage": 50,
    "status": 3
  }'`}
                </pre>
              </div>
            </div>
          )}

          {/* eMAG Canlı Yanıt Bildirimi */}
          {pingStatus['emag'] && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono font-medium flex items-start gap-2.5 animate-in fade-in ${
                pingStatus['emag'].isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {pingStatus['emag'].isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-2">
                  <span>{pingStatus['emag'].isError ? 'Bağlantı Başarısız' : 'eMAG Canlı API Yanıtı Başarılı'}</span>
                  {pingStatus['emag'].status && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                      HTTP {pingStatus['emag'].status}
                    </span>
                  )}
                  {pingStatus['emag'].durationMs && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                      {pingStatus['emag'].durationMs}ms
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed">{pingStatus['emag'].message}</div>
              </div>
            </div>
          )}

          {/* eMAG İki Yönlü Canlı Transfer İşlemleri */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>İki Yönlü Canlı Veri Transfer Testleri (eMAG)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Girilen kimlik bilgileriyle eMAG API v3 üzerinden anlık canlı sipariş çekin veya stok/fiyat gönderin
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleTransferProducts('emag')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'emag' && activeTransfer.action === 'products'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0056B3] hover:bg-[#004494] text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Package className={`w-3.5 h-3.5 text-white ${activeTransfer?.loading && activeTransfer.platform === 'emag' && activeTransfer.action === 'products' ? 'animate-bounce' : ''}`} />
                <span>Ürün Çek (POST /product_offer/read)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransferOrders('emag')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'emag' && activeTransfer.action === 'orders'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className={`w-3.5 h-3.5 text-blue-600 ${activeTransfer?.loading && activeTransfer.platform === 'emag' && activeTransfer.action === 'orders' ? 'animate-bounce' : ''}`} />
                <span>Sipariş Çek (POST /order/read)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransferStock('emag')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'emag' && activeTransfer.action === 'stock'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-3.5 h-3.5 text-blue-600 ${activeTransfer?.loading && activeTransfer.platform === 'emag' && activeTransfer.action === 'stock' ? 'animate-bounce' : ''}`} />
                <span>Stok Gönder (POST /product_offer/save)</span>
              </button>
            </div>
          </div>

          {/* eMAG IP İzni & Adım Adım Kontrol Listesi Yardımcı Bileşeni */}
          <EmagIpWhitelistHelper
            serverIp={serverIp}
            clientIp={clientIp}
            selectedCountry={emagCountry}
            onTestConnection={() => handleTestPing('emag')}
            isTesting={testingPlatform === 'emag'}
          />

          <form onSubmit={handleSaveEmagApi} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>eMAG API Kullanıcı Adı (User):</span>
                  <span className="text-[10px] text-blue-700 font-bold">Seller IPs tablosundaki User</span>
                </label>
                <input
                  type="text"
                  required
                  value={emagUser}
                  onChange={(e) => setEmagUser(e.target.value)}
                  placeholder="Örn: melis_oman_u-speedex_com_tr"
                  className="w-full border border-slate-200 focus:border-[#0056B3] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
                <p className="text-[10px] text-slate-500">
                  eMAG satıcı panelinizdeki Seller IPs tablosundaki <strong>User</strong> sütunundaki kullanıcı adını girin (Örn: <code>melis_oman_u-speedex_com_tr</code>). E-posta adresi değil!
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>eMAG Satıcı Paneli Giriş Şifresi:</span>
                  <span className="text-[10px] text-rose-600 font-bold">chrsadv DEĞİLDİR</span>
                </label>
                <input
                  type="password"
                  required
                  value={emagApiKey}
                  onChange={(e) => setEmagApiKey(e.target.value)}
                  placeholder="eMAG web paneline girerken yazdığınız şifre..."
                  className="w-full border border-slate-200 focus:border-[#0056B3] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
                <p className="text-[10px] text-slate-500">
                  eMAG satıcı paneline (marketplace.emag.bg) giriş yaparken kullandığınız asıl hesap şifrenizi giriniz. Ekranınızdaki <code>chrsadv</code> bir şifre değil, API Kodudur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Pazar Ülkesi:</label>
                <select
                  value={emagCountry}
                  onChange={(e) => setEmagCountry(e.target.value as 'RO' | 'BG' | 'HU')}
                  className="w-full border border-slate-200 focus:border-[#0056B3] rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50"
                >
                  <option value="BG">🇧🇬 Bulgaristan (emag.bg - BGN) [AKTİF PAZAR]</option>
                  <option value="RO">🇷🇴 Romanya (emag.ro - Devre Dışı)</option>
                  <option value="HU">🇭🇺 Macaristan (emag.hu - Devre Dışı)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>eMAG API Kodu (API Code):</span>
                  <span className="text-[10px] text-slate-500 font-mono">Settings</span>
                </label>
                <input
                  type="text"
                  value={emagApiCode}
                  onChange={(e) => setEmagApiCode(e.target.value)}
                  placeholder="chrsadv"
                  className="w-full border border-slate-200 focus:border-[#0056B3] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Varsayılan KDV Oranı (%):</label>
                <input
                  type="number"
                  value={emagVatRate}
                  onChange={(e) => setEmagVatRate(e.target.value)}
                  placeholder="20"
                  className="w-full border border-slate-200 focus:border-[#0056B3] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">eMAG Genius & Locker:</label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 mt-0.5">
                  <span className="text-xs font-medium text-slate-700">Genius & EasyBox</span>
                  <input
                    type="checkbox"
                    checked={emagGeniusEnabled}
                    onChange={(e) => setEmagGeniusEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#0056B3] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="bg-[#0056B3] hover:bg-[#004494] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>eMAG Ayarlarını Kaydet</span>
              </button>
            </div>
          </form>

          {/* eMAG Kategori Şeması & Karakteristik Senkronizasyon Paneli */}
          <EmagTaxonomySyncPanel theme={currentAppTheme} />
        </div>
      )}

      {/* 2. BaseLinker Hub API Ayarları */}
      {(activeIntegrationTab === 'ALL' || activeIntegrationTab === 'BASELINKER') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <MarketplaceLogo platform="baselinker" size="lg" rounded="xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#14171A]">BaseLinker Hub API</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
                    api.baselinker.com/connector.php
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                    Merkezi Envanter & Depo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Çoklu pazaryeri senkronizasyonu, depo stok havuzu ve lojistik entegrasyonu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTestPing('baselinker')}
                disabled={testingPlatform === 'baselinker'}
                className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === 'baselinker' ? 'animate-spin' : ''}`} />
                <span>{testingPlatform === 'baselinker' ? 'BaseLinker Kontrol Ediliyor...' : 'Canlı Bağlantıyı Test Et'}</span>
              </button>
            </div>
          </div>

          {/* BaseLinker API & Entegrasyon Bağlantı Rehberi */}
          <BaseLinkerConnectionHelper
            apiToken={blToken}
            inventoryId={blInventoryId}
            onTestConnection={() => handleTestPing('baselinker')}
            isTesting={testingPlatform === 'baselinker'}
            defaultExpanded={false}
          />

          {/* BaseLinker Canlı Yanıt Bildirimi */}
          {pingStatus['baselinker'] && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono font-medium flex items-start gap-2.5 animate-in fade-in ${
                pingStatus['baselinker'].isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {pingStatus['baselinker'].isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-2">
                  <span>{pingStatus['baselinker'].isError ? 'BaseLinker Bağlantı Hatası' : 'BaseLinker Canlı API Doğrulandı'}</span>
                  {pingStatus['baselinker'].status && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                      HTTP {pingStatus['baselinker'].status}
                    </span>
                  )}
                  {pingStatus['baselinker'].durationMs && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                      {pingStatus['baselinker'].durationMs}ms
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed">{pingStatus['baselinker'].message}</div>
              </div>
            </div>
          )}

          {/* BaseLinker İki Yönlü Canlı Transfer İşlemleri */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-700" />
                <span>İki Yönlü Canlı Veri Transfer Testleri (BaseLinker)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                X-BLToken ile connector.php üzerinden canlı sipariş çekin veya envanter depo stoğunu güncelleyin
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleTransferOrders('baselinker')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'baselinker' && activeTransfer.action === 'orders'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className={`w-3.5 h-3.5 text-slate-700 ${activeTransfer?.loading && activeTransfer.platform === 'baselinker' && activeTransfer.action === 'orders' ? 'animate-bounce' : ''}`} />
                <span>Sipariş Çek (method=getOrders)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransferStock('baselinker')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'baselinker' && activeTransfer.action === 'stock'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-3.5 h-3.5 text-slate-700 ${activeTransfer?.loading && activeTransfer.platform === 'baselinker' && activeTransfer.action === 'stock' ? 'animate-bounce' : ''}`} />
                <span>Stok Gönder (updateInventoryProductsStock)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveBaseLinkerApi} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">BaseLinker API Token (X-BLToken):</label>
                <input
                  type="password"
                  required
                  value={blToken}
                  onChange={(e) => setBlToken(e.target.value)}
                  placeholder="BaseLinker panelinden alınan API Token..."
                  className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Envanter Katalog / Depo ID (Opsiyonel):</label>
                <input
                  type="text"
                  value={blInventoryId}
                  onChange={(e) => setBlInventoryId(e.target.value)}
                  placeholder="Örn: shop veya inv_main_01 (Boş bırakılabilir)"
                  className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Otomatik Stok Eşitleme</div>
                  <div className="text-[10px] text-slate-500">Tüm pazaryerlerine anlık yay</div>
                </div>
                <input
                  type="checkbox"
                  checked={blAutoSyncStock}
                  onChange={(e) => setBlAutoSyncStock(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Otomatik Fiyat Eşitleme</div>
                  <div className="text-[10px] text-slate-500">Kura göre fiyat güncelle</div>
                </div>
                <input
                  type="checkbox"
                  checked={blAutoSyncPrice}
                  onChange={(e) => setBlAutoSyncPrice(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Otomatik Kargo Etiketi</div>
                  <div className="text-[10px] text-slate-500">InPost / Sameday / DPD</div>
                </div>
                <input
                  type="checkbox"
                  checked={blAutoFulfill}
                  onChange={(e) => setBlAutoFulfill(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>BaseLinker Ayarlarını Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Allegro REST API Ayarları */}
      {(activeIntegrationTab === 'ALL' || activeIntegrationTab === 'ALLEGRO') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <MarketplaceLogo platform="allegro" size="lg" rounded="xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#14171A]">Allegro REST API v2</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF5A00]/10 text-[#FF5A00]">
                    {environment === 'production' ? 'api.allegro.pl' : 'api.allegro.pl.allegrosandbox.pl'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800">
                    🇵🇱 Polonya, 🇨🇿 Çekya, 🇸🇰 Slovakya
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allegro OAuth2 üzerinden teklif yönetimi, akıllı fiyatlandırma ve sipariş lojistiği
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTestPing('allegro')}
                disabled={testingPlatform === 'allegro'}
                className="bg-[#FF5A00] hover:bg-[#e04f00] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === 'allegro' ? 'animate-spin' : ''}`} />
                <span>{testingPlatform === 'allegro' ? 'OAuth Doğrulanıyor...' : 'Canlı Bağlantıyı Test Et'}</span>
              </button>
            </div>
          </div>

          {/* Allegro OAuth 2.0 & REST API Bağlantı Rehberi */}
          <AllegroConnectionHelper
            environment={environment}
            clientId={clientId}
            clientSecret={clientSecret}
            onTestConnection={() => handleTestPing('allegro')}
            isTesting={testingPlatform === 'allegro'}
            defaultExpanded={false}
            onOpenDocs={() => onNavigateToTab?.('allegrodocs')}
          />

          {/* Allegro Canlı Yanıt Bildirimi */}
          {pingStatus['allegro'] && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono font-medium flex items-start gap-2.5 animate-in fade-in ${
                pingStatus['allegro'].isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {pingStatus['allegro'].isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-2">
                  <span>{pingStatus['allegro'].isError ? 'Allegro Yetkilendirme Hatası' : 'Allegro OAuth2 Canlı Doğrulandı'}</span>
                  {pingStatus['allegro'].status && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                      HTTP {pingStatus['allegro'].status}
                    </span>
                  )}
                  {pingStatus['allegro'].durationMs && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10">
                      {pingStatus['allegro'].durationMs}ms
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed">{pingStatus['allegro'].message}</div>
              </div>
            </div>
          )}

          {/* Allegro İki Yönlü Canlı Transfer İşlemleri */}
          <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-600" />
                <span>İki Yönlü Canlı Veri Transfer Testleri (Allegro)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                OAuth2 Bearer Token ile siparişleri çekin veya mağaza ilanlarınızın stok miktarını güncelleyin
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleFetchAllegroOAuthToken}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'token'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF5A00] hover:bg-[#e04f00] text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <KeyRound className={`w-3.5 h-3.5 ${activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'token' ? 'animate-spin' : ''}`} />
                <span>OAuth Token Al / Bağlan</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransferOrders('allegro')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'orders'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className={`w-3.5 h-3.5 text-orange-600 ${activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'orders' ? 'animate-bounce' : ''}`} />
                <span>Sipariş Çek (GET /order/checkout-forms)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransferStock('allegro')}
                disabled={activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'stock'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-3.5 h-3.5 text-orange-600 ${activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'stock' ? 'animate-bounce' : ''}`} />
                <span>Stok Gönder (PATCH /sale/offers)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveAllegroApi} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Client ID (Uygulama Kimliği):</label>
                <input
                  type="text"
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="apps.developer.allegro.pl Client ID..."
                  className="w-full border border-slate-200 focus:border-[#FF5A00] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Client Secret (Gizli Anahtar):</label>
                <input
                  type="password"
                  required
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full border border-slate-200 focus:border-[#FF5A00] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Satıcı Kullanıcı Adı (Seller Login):</label>
                <input
                  type="text"
                  value={sellerLogin}
                  onChange={(e) => setSellerLogin(e.target.value)}
                  placeholder="Allegro kullanıcı adınız..."
                  className="w-full border border-slate-200 focus:border-[#FF5A00] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Ortam (Environment):</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as 'sandbox' | 'production')}
                  className="w-full border border-slate-200 focus:border-[#FF5A00] rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50"
                >
                  <option value="production">Production (Canlı Satış Ortamı - allegro.pl)</option>
                  <option value="sandbox">Sandbox (Test Ortamı - allegrosandbox.pl)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Doğrudan Bearer Token (Opsiyonel):</label>
                <input
                  type="password"
                  value={allegroToken}
                  onChange={(e) => setAllegroToken(e.target.value)}
                  placeholder="Kişisel OAuth token (Varsa)..."
                  className="w-full border border-slate-200 focus:border-[#FF5A00] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="bg-[#FF5A00] hover:bg-[#e04f00] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Allegro Ayarlarını Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Canlı İstek & Veri Transfer Terminali (HTTP Request & Response Console) */}
      {activeTransfer && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] text-white border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Canlı API & Veri Transfer Terminali</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 uppercase text-slate-300">
                    {activeTransfer.platform} · {activeTransfer.action.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Arka plan proxy ve pazaryeri sunucuları arasındaki anlık HTTP istek ve JSON yanıtları
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activeTransfer.result && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(activeTransfer.result, null, 2));
                    setCopiedPayload(true);
                    setTimeout(() => setCopiedPayload(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPayload ? 'Kopyalandı!' : 'JSON Kopyala'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTransfer(null)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕ Kapat
              </button>
            </div>
          </div>

          {activeTransfer.loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <div className="text-xs font-mono font-medium">
                Pazaryeri API sunucusuna istek gönderiliyor ve kimlik doğrulama başlıkları enjekte ediliyor...
              </div>
            </div>
          ) : activeTransfer.result ? (
            <div className="space-y-3 font-mono text-xs">
              {/* Header preview & status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] block">İstek Uç Noktası (Endpoint):</span>
                  <div className="text-emerald-400 break-all">{activeTransfer.result.endpoint || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] block">Kimlik Başlığı (Auth Header):</span>
                  <div className="text-cyan-400 break-all">{activeTransfer.result.headerPreview || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] block">Durum & Gecikme:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeTransfer.result.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      HTTP {activeTransfer.result.status || (activeTransfer.result.success ? 200 : 500)}
                    </span>
                    <span className="text-slate-400">{activeTransfer.result.durationMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className={`p-3 rounded-2xl border text-xs ${
                activeTransfer.result.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  <span>{activeTransfer.result.success ? '✓ Canlı İstek Başarıyla Yanıtlandı' : '⚠ İşlem Uyarısı / Hata'}</span>
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-slate-300">
                  {activeTransfer.result.message}
                </div>
              </div>

              {/* Payload viewer */}
              {activeTransfer.result.data && (
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Sunucudan Dönen Ham Yanıt (Live JSON Payload):
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-60 leading-relaxed font-mono">
                    {typeof activeTransfer.result.data === 'string'
                      ? activeTransfer.result.data
                      : JSON.stringify(activeTransfer.result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* 5. Şirket & E-Fatura Vergi Bilgileri */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#14171A]">Şirket & E-Fatura Vergi Bilgileri</h2>
            <p className="text-[11px] text-slate-500">Polonya (NIP), Romanya (CUI) ve AB KDV fatura şablonu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Şirket Ünvanı:</label>
            <input
              type="text"
              defaultValue="Omni Merchant Global Sp. z o.o."
              className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Polonya NIP (AB KDV No):</label>
            <input
              type="text"
              defaultValue="PL5252849102"
              className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Romanya CUI / CIF No:</label>
            <input
              type="text"
              defaultValue="RO48291048"
              className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* 6. Jiguli Panel Verilerini Sıfırlama (Yerel Önbellek Yönetimi) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/50 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#14171A] dark:text-zinc-100">
                  Jiguli Panel Verilerini Sıfırla (Yerel Önbellek)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Pazaryeri Hesaplarına Dokunmaz</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Bu buton <strong>yalnızca</strong> Jiguli panelinizde önbelleğe alınan ürün, sipariş ve log kayıtlarını temizler. <strong>eMAG, Allegro veya BaseLinker mağazanızdaki canlı ürünlere, siparişlere ve API kimlik bilgilerinize KESİNLİKLE DOKUNMAZ</strong>. Sıfırlama sonrası istediğiniz zaman "eMAG Ürünlerini Çek" butonuna basarak güncel verilerinizi tekrar panele aktarabilirsiniz.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 min-h-[42px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jiguli Panelini Sıfırla</span>
          </button>
        </div>
      </div>

      {/* JIGULI PANEL DATA RESET MODAL */}
      <ResetPanelModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={(msg) => {
          showNotice(msg);
        }}
        theme={currentAppTheme}
      />
    </div>
  );
};
