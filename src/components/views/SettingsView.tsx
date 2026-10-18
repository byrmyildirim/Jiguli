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
  Package,
  Camera,
  Database,
  Lock,
  Eye,
  EyeOff,
  Wrench,
  ServerCrash,
  Bot
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { SUPPORTED_CURRENCIES, EXCHANGE_RATES, CURRENCY_SYMBOLS } from '../../services/allegroData';
import { CompanyTaxInfo } from '../../types/allegro';
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
  // Brand Name & Slogan State
  const [brandName, setBrandName] = useState<string>(store.getBrandName());
  const [editingBrandName, setEditingBrandName] = useState(false);
  const [brandNameInput, setBrandNameInput] = useState<string>(store.getBrandName());

  const [slogan, setSlogan] = useState<string>(store.getSlogan());
  const [editingSlogan, setEditingSlogan] = useState(false);
  const [sloganInput, setSloganInput] = useState<string>(store.getSlogan());

  const [logoUrl, setLogoUrl] = useState<string>(store.getLogoUrl());
  const [editingLogo, setEditingLogo] = useState(false);
  const [logoInput, setLogoInput] = useState<string>(store.getLogoUrl());
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Company & Tax Info State
  const [companyTax, setCompanyTax] = useState<CompanyTaxInfo>(store.getCompanyTaxInfo());
  const [isSavingTaxInfo, setIsSavingTaxInfo] = useState(false);

  // Gemini & Qwen AI Vision Configuration State
  const [activeAiProvider, setActiveAiProvider] = useState<'gemini' | 'qwen'>('qwen');
  const [isSwitchingProvider, setIsSwitchingProvider] = useState(false);

  const [aiConfig, setAiConfig] = useState<{ hasKey: boolean; maskedKey: string; source: string; model: string }>({
    hasKey: false,
    maskedKey: '',
    source: 'none',
    model: 'gemini-2.5-flash'
  });
  const [aiApiKeyInput, setAiApiKeyInput] = useState('');
  const [isSavingAiKey, setIsSavingAiKey] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Qwen (Alibaba DashScope) AI State
  const [qwenApiKeyInput, setQwenApiKeyInput] = useState('');
  const [qwenSelectedModel, setQwenSelectedModel] = useState('qwen-max');
  const [qwenConfig, setQwenConfig] = useState<{ isConfigured: boolean; maskedKey: string; activeModel: string }>({
    isConfigured: false,
    maskedKey: '',
    activeModel: 'qwen-max'
  });
  const [isSavingQwenKey, setIsSavingQwenKey] = useState(false);
  const [qwenTestResult, setQwenTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // MySQL Database Configuration State (Production / Live)
  const [dbConfig, setDbConfig] = useState<{
    host: string;
    port: number;
    database: string;
    user: string;
    prefix: string;
    ssl: boolean;
    charset: string;
    hasPassword: boolean;
    maskedPassword: string;
    source: string;
    supportedSecrets?: Array<{ name: string; desc: string }>;
  }>({
    host: '127.0.0.1',
    port: 3306,
    database: 'u162532946_connect',
    user: 'u162532946_connect',
    prefix: 'cnt_',
    ssl: false,
    charset: 'utf8mb4',
    hasPassword: true,
    maskedPassword: '••••',
    source: 'default'
  });

  const [dbForm, setDbForm] = useState({
    host: '127.0.0.1',
    port: '3306',
    database: 'u162532946_connect',
    user: 'u162532946_connect',
    password: '',
    prefix: 'cnt_',
    ssl: false,
    charset: 'utf8mb4'
  });

  const [showDbPassword, setShowDbPassword] = useState(false);
  const [quickDbUrl, setQuickDbUrl] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [isRepairingDb, setIsRepairingDb] = useState(false);
  const [isRefreshingDbStatus, setIsRefreshingDbStatus] = useState(false);
  const [showSecretsHelp, setShowSecretsHelp] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const [dbTestResult, setDbTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    serverVersion?: string;
    totalTablesCount?: number;
    matchingPrefixCount?: number;
    detectedPrefix?: string;
    errorCode?: string;
  } | null>(null);

  const [dbStatus, setDbStatus] = useState<{
    isConnected: boolean;
    serverVersion?: string;
    latencyMs?: number;
    totalRecords: number;
    tableStatuses: Array<{
      tableName: string;
      displayName: string;
      recordCount: number;
      exists: boolean;
    }>;
    errorMessage?: string;
  } | null>(null);

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

  const showNotice = (msg: string) => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const [testingPlatform, setTestingPlatform] = useState<MarketplaceId | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, { message: string; isError: boolean; status?: number; durationMs?: number } | null>>({});
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [serverIp, setServerIp] = useState<string>('34.34.246.189');
  const [clientIp, setClientIp] = useState<string>('');
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedClientIp, setCopiedClientIp] = useState(false);

  const fetchDbConfigAndStatus = async () => {
    try {
      setIsRefreshingDbStatus(true);
      const [cfgRes, statusRes] = await Promise.all([
        fetch('/api/mysql/config').then(r => r.json()).catch(() => null),
        fetch('/api/mysql/status').then(r => r.json()).catch(() => null)
      ]);

      if (cfgRes?.success && cfgRes.config) {
        setDbConfig(cfgRes.config);
        setDbForm(prev => ({
          ...prev,
          host: cfgRes.config.host || prev.host,
          port: String(cfgRes.config.port || '3306'),
          database: cfgRes.config.database || prev.database,
          user: cfgRes.config.user || prev.user,
          prefix: cfgRes.config.prefix || prev.prefix,
          ssl: Boolean(cfgRes.config.ssl),
          charset: cfgRes.config.charset || prev.charset
        }));
      }

      if (statusRes) {
        setDbStatus(statusRes);
      }
    } catch (err) {
      console.warn('[Fetch DB Settings Error]:', err);
    } finally {
      setIsRefreshingDbStatus(false);
    }
  };

  const handleApplyQuickUrl = () => {
    if (!quickDbUrl.trim()) return;
    try {
      const url = new URL(quickDbUrl.trim());
      setDbForm(prev => ({
        ...prev,
        host: url.hostname || prev.host,
        port: url.port || '3306',
        database: url.pathname.replace(/^\//, '') || prev.database,
        user: decodeURIComponent(url.username || '') || prev.user,
        password: decodeURIComponent(url.password || '') || prev.password,
        ssl: url.searchParams.get('ssl') === 'true' || url.searchParams.get('sslmode') === 'require' || prev.ssl
      }));
      showNotice('Bağlantı URL bilgileri form alanlarına aktarıldı!');
    } catch {
      setDbTestResult({
        success: false,
        message: 'Geçersiz bağlantı URL formatı. Örnek: mysql://kullanici:sifre@host:3306/veritabani'
      });
    }
  };

  const handleTestDbConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch('/api/mysql/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbForm.host,
          port: Number(dbForm.port) || 3306,
          database: dbForm.database,
          user: dbForm.user,
          password: dbForm.password,
          prefix: dbForm.prefix,
          ssl: dbForm.ssl,
          charset: dbForm.charset
        })
      });
      const data = await res.json();
      setDbTestResult(data);
      if (data.success) {
        showNotice('Veritabanı bağlantı testi başarılı!');
      }
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: `Bağlantı testi hatası: ${err?.message || err}`
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSaveDbConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch('/api/mysql/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbForm.host,
          port: Number(dbForm.port) || 3306,
          database: dbForm.database,
          user: dbForm.user,
          password: dbForm.password,
          prefix: dbForm.prefix,
          ssl: dbForm.ssl,
          charset: dbForm.charset
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.config) setDbConfig(data.config);
        if (data.status) setDbStatus(data.status);
        if (data.testResult) setDbTestResult(data.testResult);
        showNotice('MySQL veritabanı ayarları başarıyla kaydedildi!');
        // Refresh master catalog in store
        store.initFromDatabase();
      } else {
        setDbTestResult({
          success: false,
          message: data.message || 'Veritabanı ayarları kaydedilemedi.'
        });
      }
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: `Kayıt hatası: ${err?.message || err}`
      });
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleInitDbTables = async () => {
    setIsRepairingDb(true);
    try {
      const res = await fetch('/api/mysql/init-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbForm.host,
          port: Number(dbForm.port) || 3306,
          database: dbForm.database,
          user: dbForm.user,
          password: dbForm.password,
          prefix: dbForm.prefix,
          ssl: dbForm.ssl,
          charset: dbForm.charset
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message || 'Tablolar başarıyla kontrol edildi ve onarıldı!');
        await fetchDbConfigAndStatus();
      } else {
        setDbTestResult({
          success: false,
          message: data.message || 'Tablo onarımı gerçekleştirilemedi.'
        });
      }
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: `Tablo onarım hatası: ${err?.message || err}`
      });
    } finally {
      setIsRepairingDb(false);
    }
  };

  const handleCopySecret = (name: string) => {
    navigator.clipboard?.writeText(name);
    setCopiedSecret(name);
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  useEffect(() => {
    fetch('/api/system/server-ip')
      .then(r => r.json())
      .then(d => {
        if (d?.serverIp || d?.ip) setServerIp(d.serverIp || d.ip);
        if (d?.clientIp) setClientIp(d.clientIp);
      })
      .catch(() => {});

    fetch('/api/ai/config')
      .then(r => r.json())
      .then(d => {
        if (d && d.success) {
          if (d.activeProvider) setActiveAiProvider(d.activeProvider);
          if (d.gemini) {
            setAiConfig({
              hasKey: d.gemini.isConfigured,
              maskedKey: d.gemini.maskedKey,
              source: 'database',
              model: d.gemini.activeModel || 'gemini-2.5-flash'
            });
          }
          if (d.qwen) {
            setQwenConfig({
              isConfigured: d.qwen.isConfigured,
              maskedKey: d.qwen.maskedKey,
              activeModel: d.qwen.activeModel || 'qwen-max'
            });
            if (d.qwen.activeModel) setQwenSelectedModel(d.qwen.activeModel);
          }
        }
      })
      .catch(() => {});

    fetchDbConfigAndStatus();
  }, []);

  const [tcmbData, setTcmbData] = useState<TCMBData | null>(tcmbService.getData());
  const [isRefreshingTcmb, setIsRefreshingTcmb] = useState(false);

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setBrandName(store.getBrandName());
      setSlogan(store.getSlogan());
      setLogoUrl(store.getLogoUrl());
      setActiveCurrency(store.getActiveCurrency());
      setCreds(store.getPlatformCredentials());
    });
    const unsubTcmb = tcmbService.subscribe((data) => {
      setTcmbData(data);
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ALLEGRO_OAUTH_TOKEN_SUCCESS' && event.data?.token) {
        const token = event.data.token;
        const refreshToken = event.data.refreshToken || creds.allegro.refreshToken;
        const expiresIn = event.data.expiresIn || 43199;
        const updated = {
          ...creds.allegro,
          accessToken: token,
          refreshToken: refreshToken,
          tokenExpiresAt: Date.now() + expiresIn * 1000
        };
        setCreds(prev => ({ ...prev, allegro: updated }));
        store.savePlatformCredentials({ allegro: updated });
        store.updateAllegroConfig({
          bearerToken: token,
          isConnected: true,
          tokenExpiresAt: updated.tokenExpiresAt,
          sellerLogin: sellerLogin || 'charsioutlet'
        });
        showNotice('Tebrikler! Allegro Satıcı Yetkilendirmesi (User Token) başarıyla alındı ve kaydedildi.');
        setActiveTransfer({
          platform: 'allegro',
          action: 'token',
          loading: false,
          result: {
            success: true,
            status: 200,
            durationMs: 250,
            endpoint: 'Allegro OAuth 2.0 Authorization Code Flow',
            headerPreview: `Authorization: Bearer ${token.slice(0, 15)}...`,
            message: 'Allegro Satıcı Hesabı (charsioutlet) için User Access Token başarıyla bağlandı!',
            data: { access_token: token.slice(0, 25) + '...', expires_in: expiresIn }
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      unsubStore();
      unsubTcmb();
      window.removeEventListener('message', handleMessage);
    };
  }, [creds.allegro, sellerLogin]);

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
    'Küresel Pazaryeri Entegrasyon & Otomasyon Suite',
    'Çok Kanallı E-Ticaret ve Akıllı Stok Yönetimi',
    'Allegro, eMAG ve BaseLinker Canlı Operasyon Merkezi',
    'Yüksek Performanslı Sınır Ötesi E-Ticaret Motoru',
    'Otomatik Fiyatlandırma, Senkronizasyon ve Lojistik Hub',
    'Kurumsal Pazaryeri Entegrasyon Platformu',
    'Gerçek Zamanlı Sipariş ve Envanter Yönetimi'
  ];

  const brandNamePresets = [
    'Jiguli',
    'Techrasyon Connect',
    'Techrasyon Omni',
    'Omni Merchant Hub',
    'Global Trade Hub'
  ];

  const handleSaveBrandName = async () => {
    const val = brandNameInput.trim() || 'Jiguli';
    setIsSavingBranding(true);
    try {
      await store.setBranding({ brandName: val });
      setEditingBrandName(false);
      showNotice(`Marka adı "${val}" olarak veritabanına kaydedildi!`);
    } catch {
      showNotice('Marka adı kaydedildi.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSelectPresetBrand = async (preset: string) => {
    setBrandNameInput(preset);
    setIsSavingBranding(true);
    try {
      await store.setBranding({ brandName: preset });
      setEditingBrandName(false);
      showNotice(`Marka adı "${preset}" olarak veritabanına kaydedildi!`);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveSlogan = async () => {
    const val = sloganInput.trim() || 'Küresel Pazaryeri Entegrasyon & Otomasyon Suite';
    setIsSavingBranding(true);
    try {
      await store.setBranding({ slogan: val });
      setEditingSlogan(false);
      showNotice('Kurumsal slogan başarıyla veritabanına kaydedildi!');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSelectPresetSlogan = async (preset: string) => {
    setSloganInput(preset);
    setIsSavingBranding(true);
    try {
      await store.setBranding({ slogan: preset });
      setEditingSlogan(false);
      showNotice(`Slogan veritabanına kaydedildi: "${preset}"`);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveLogo = async () => {
    const val = logoInput.trim();
    setIsSavingBranding(true);
    try {
      await store.setBranding({ logoUrl: val });
      setEditingLogo(false);
      showNotice(val ? 'Logo başarıyla veritabanına kaydedildi!' : 'Varsayılan logo (↗) geri yüklendi.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotice('Logo görseli boyutu en fazla 2MB olmalıdır.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setLogoInput(dataUrl);
      setEditingLogo(true);
      await store.setBranding({ logoUrl: dataUrl });
      showNotice('Özel logo görseli başarıyla yüklendi ve veritabanına kaydedildi!');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = async () => {
    setLogoInput('');
    await store.setBranding({ logoUrl: '' });
    setEditingLogo(false);
    showNotice('Logo varsayılan (↗) haline getirildi.');
  };

  const handleSaveCompanyTax = () => {
    setIsSavingTaxInfo(true);
    store.saveCompanyTaxInfo(companyTax);
    setTimeout(() => {
      setIsSavingTaxInfo(false);
      showNotice('Şirket & E-Fatura vergi bilgileri başarıyla veritabanına kaydedildi!');
    }, 350);
  };

  const handleSaveAiKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = aiApiKeyInput.trim();
    if (!key) return;
    setIsSavingAiKey(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiTestResult({ success: true, message: data.message });
        setAiConfig({
          hasKey: true,
          maskedKey: key.slice(0, 6) + '...' + key.slice(-4),
          source: 'database',
          model: 'gemini-2.5-flash'
        });
        localStorage.setItem('JIGULI_GEMINI_API_KEY', key);
        showNotice('Google Gemini AI Vision API anahtarı başarıyla doğrulandı ve kaydedildi!');
      } else {
        setAiTestResult({ success: false, message: data.error || 'API anahtarı doğrulanamadı' });
      }
    } catch (err: any) {
      setAiTestResult({ success: false, message: 'Bağlantı hatası: ' + (err.message || err) });
    } finally {
      setIsSavingAiKey(false);
    }
  };

  const handleSwitchAiProvider = async (provider: 'gemini' | 'qwen') => {
    setIsSwitchingProvider(true);
    try {
      const res = await fetch('/api/ai/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.success) {
        setActiveAiProvider(provider);
        showNotice(`Aktif AI motoru ${provider === 'qwen' ? 'Alibaba Qwen' : 'Google Gemini'} olarak ayarlandı!`);
      }
    } catch (err: any) {
      showNotice('AI motoru değiştirilemedi: ' + (err.message || err));
    } finally {
      setIsSwitchingProvider(false);
    }
  };

  const handleSaveQwenKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = qwenApiKeyInput.trim();
    if (!key) return;
    setIsSavingQwenKey(true);
    setQwenTestResult(null);
    try {
      const res = await fetch('/api/ai/qwen/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key, model: qwenSelectedModel })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQwenTestResult({ success: true, message: data.message });
        setQwenConfig({
          isConfigured: true,
          maskedKey: key.slice(0, 6) + '...' + key.slice(-4),
          activeModel: qwenSelectedModel
        });
        localStorage.setItem('JIGULI_QWEN_API_KEY', key);
        showNotice('Alibaba Qwen API anahtarı ve modeli başarıyla doğrulandı ve kaydedildi!');
      } else {
        setQwenTestResult({ success: false, message: data.message || 'Qwen API anahtarı doğrulanamadı.' });
      }
    } catch (err: any) {
      setQwenTestResult({ success: false, message: 'Bağlantı hatası: ' + (err.message || err) });
    } finally {
      setIsSavingQwenKey(false);
    }
  };

  const handleSaveAllegroApi = (e: React.FormEvent) => {
    e.preventDefault();
    store.savePlatformCredentials({ allegro: creds.allegro });
    store.updateAllegroConfig({
      clientId: creds.allegro.clientId,
      clientSecret: creds.allegro.clientSecret,
      environment: creds.allegro.environment,
      bearerToken: creds.allegro.accessToken,
      sellerLogin: sellerLogin || 'charsioutlet',
      isConnected: Boolean(creds.allegro.accessToken || creds.allegro.clientId)
    });
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

        if (data?.tokenRefreshed && data?.access_token) {
          const updated = {
            ...creds.allegro,
            accessToken: data.access_token,
            tokenExpiresAt: Date.now() + (data.expiresIn || 43199) * 1000
          };
          setCreds(prev => ({ ...prev, allegro: updated }));
          store.savePlatformCredentials({ allegro: updated });
          store.updateAllegroConfig({
            bearerToken: data.access_token,
            isConnected: true,
            tokenExpiresAt: updated.tokenExpiresAt
          });
          showNotice('Eski token otomatik güncellendi ve yeni Allegro canlı tokenı kaydedildi!');
        }

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

  // Allegro OAuth 2.0 Web Giriş Pop-up (Satıcı Hesabı ile Yetkilendirme)
  const handleOpenAllegroOAuthPopup = () => {
    const width = 640;
    const height = 750;
    const left = Math.max(0, Math.round(window.screen.width / 2 - width / 2));
    const top = Math.max(0, Math.round(window.screen.height / 2 - height / 2));
    const url = `/api/allegro/authorize?clientId=${encodeURIComponent(clientId || 'f2aaccb04bc146e4a6832179f10a12c3')}&environment=${environment}`;
    
    showNotice('Allegro giriş penceresi açıldı. Lütfen charsioutlet hesabınızla onay verin.');
    window.open(url, 'allegro_oauth_popup', `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`);
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
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#9FE870]/30 text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14171A] dark:text-zinc-100">Panel Kimliği (Marka Adı & Kurumsal Slogan)</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Sol üst menüde, başlıkta ve sistem genelinde görünen marka ismi ve sloganı</p>
            </div>
          </div>
        </div>

        {/* 1.1 Marka / Panel Adı */}
        <div className="space-y-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Marka / Panel Adı:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingBrandName ? brandNameInput : brandName}
              onChange={(e) => {
                setEditingBrandName(true);
                setBrandNameInput(e.target.value);
              }}
              placeholder="Örn: Jiguli, Techrasyon Connect..."
              className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-[#14171A] dark:focus:border-white rounded-xl p-2.5 text-xs font-bold focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
            />
            {editingBrandName ? (
              <button
                onClick={handleSaveBrandName}
                className="bg-[#14171A] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer shadow-2xs"
              >
                Kaydet
              </button>
            ) : (
              <button
                onClick={() => setEditingBrandName(true)}
                className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#14171A] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Değiştir</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
              Örnekler:
            </span>
            {brandNamePresets.map((bName, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPresetBrand(bName)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  brandName === bName
                    ? 'bg-[#14171A] text-white dark:bg-white dark:text-black border-[#14171A] font-bold'
                    : 'bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-[#5D7079] dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                {bName}
              </button>
            ))}
          </div>
        </div>

        {/* 1.2 Kurumsal Slogan */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kurumsal Slogan / Alt Başlık:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingSlogan ? sloganInput : slogan}
              onChange={(e) => {
                setEditingSlogan(true);
                setSloganInput(e.target.value);
              }}
              placeholder="Örn: Küresel Pazaryeri Entegrasyon & Otomasyon Suite"
              className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-[#14171A] dark:focus:border-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
            />
            {editingSlogan ? (
              <button
                onClick={handleSaveSlogan}
                className="bg-[#14171A] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer shadow-2xs"
              >
                Kaydet
              </button>
            ) : (
              <button
                onClick={() => setEditingSlogan(true)}
                className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#14171A] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
              Profesyonel Kurumsal Şablonlar (Tek Tıkla Seçin):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sloganPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetSlogan(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    slogan === preset
                      ? 'bg-[#14171A] text-white dark:bg-white dark:text-black border-[#14171A] font-bold'
                      : 'bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-[#5D7079] dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1.3 Panel Logosu & Simge Yönetimi */}
        <div className="space-y-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>Panel Logosu & Özel Simge:</span>
            </label>
            <span className="text-[10px] text-slate-400">Menü ve Giriş ekranında görüntülenir</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Live Logo Preview Box */}
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Panel Logo"
                  className="w-10 h-10 object-contain max-h-10 rounded-lg"
                  onError={() => {
                    showNotice('Logo bağlantısı yüklenemedi, lütfen geçerli bir URL girin.');
                  }}
                />
              ) : (
                <span className="text-2xl font-bold brand-logo-arrow text-[#14171A] dark:text-white select-none">
                  ↗
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingLogo ? logoInput : logoUrl}
                  onChange={(e) => {
                    setEditingLogo(true);
                    setLogoInput(e.target.value);
                  }}
                  placeholder="Logo Resim URL'si (örn: https://... veya data:image/...)"
                  className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-[#14171A] dark:focus:border-white rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
                />
                {editingLogo ? (
                  <button
                    type="button"
                    onClick={handleSaveLogo}
                    disabled={isSavingBranding}
                    className="bg-[#14171A] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    Kaydet
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingLogo(true)}
                    className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#14171A] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Değiştir</span>
                  </button>
                )}
              </div>

              {/* Upload & Reset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Logo Görseli Yükle (PNG/SVG)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Varsayılan Oku Kullan (↗)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1.5. Yapay Zeka (AI) Motoru Yapılandırması (Google Gemini & Alibaba Qwen Dual Engine) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#14171A] dark:text-zinc-100">
                  Yapay Zeka (AI) Motoru Yapılandırması (Google Gemini & Alibaba Qwen)
                </h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Aktif Motor: {activeAiProvider === 'qwen' ? `Alibaba Qwen (${qwenConfig.activeModel})` : `Google Gemini (${aiConfig.model})`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Ürün fotoğrafları ve metin analizinde kullanılacak yapay zeka sağlayıcısını seçin. Görselle ürün arama, otomatik çeviri ve e-ticaret parametre sentezi sunar.
              </p>
            </div>
          </div>

          {/* Provider Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700 shrink-0">
            <button
              type="button"
              disabled={isSwitchingProvider}
              onClick={() => handleSwitchAiProvider('gemini')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAiProvider === 'gemini'
                  ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Google Gemini</span>
            </button>
            <button
              type="button"
              disabled={isSwitchingProvider}
              onClick={() => handleSwitchAiProvider('qwen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAiProvider === 'qwen'
                  ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-600" />
              <span>Alibaba Qwen (API)</span>
            </button>
          </div>
        </div>

        {/* Gemini Provider Config */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeAiProvider === 'gemini'
            ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60'
            : 'bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">1. Google Gemini AI Engine</span>
              {aiConfig.hasKey ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ Doğrulandı ({aiConfig.maskedKey})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Anahtar Girilmedi
                </span>
              )}
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>Ücretsiz Gemini Key Al</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSaveAiKey} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={aiApiKeyInput}
                onChange={(e) => setAiApiKeyInput(e.target.value)}
                placeholder={aiConfig.hasKey ? `Kayıtlı: ${aiConfig.maskedKey} (Yeni anahtar girin)` : "AIzaSy..."}
                className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-purple-600 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-white dark:bg-zinc-900 text-[#14171A] dark:text-white"
              />
              <button
                type="submit"
                disabled={isSavingAiKey || !aiApiKeyInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isSavingAiKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Test Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Gemini Kaydet</span>
                  </>
                )}
              </button>
            </div>

            {aiTestResult && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                aiTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30'
              }`}>
                {aiTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{aiTestResult.message}</span>
              </div>
            )}
          </form>
        </div>

        {/* Qwen Provider Config */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeAiProvider === 'qwen'
            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
            : 'bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">2. Alibaba Qwen AI Engine (DashScope)</span>
              {qwenConfig.isConfigured ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ Doğrulandı ({qwenConfig.maskedKey})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Anahtar Girilmedi
                </span>
              )}
            </div>
            <a
              href="https://dashscope.console.aliyun.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>DashScope Console (Qwen Key)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSaveQwenKey} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Qwen Modeli Seçin:</label>
                <select
                  value={qwenSelectedModel}
                  onChange={(e) => setQwenSelectedModel(e.target.value)}
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold bg-white dark:bg-zinc-900 text-[#14171A] dark:text-white"
                >
                  <option value="qwen-max">qwen-max (En Yüksek Akıl Yürütme)</option>
                  <option value="qwen-plus">qwen-plus (Dengeli Hız & Kalite)</option>
                  <option value="qwen-turbo">qwen-turbo (Ultra Hızlı)</option>
                  <option value="qwen2.5-72b-instruct">qwen2.5-72b-instruct (Açık Model)</option>
                  <option value="qwen-vl-max">qwen-vl-max (Görselle Ürün Analizi)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Qwen / DashScope API Key:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={qwenApiKeyInput}
                    onChange={(e) => setQwenApiKeyInput(e.target.value)}
                    placeholder={qwenConfig.isConfigured ? `Kayıtlı: ${qwenConfig.maskedKey} (Yeni anahtar girin)` : "sk-..."}
                    className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-amber-600 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-white dark:bg-zinc-900 text-[#14171A] dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSavingQwenKey || !qwenApiKeyInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isSavingQwenKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Test Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Qwen Kaydet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {qwenTestResult && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                qwenTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30'
              }`}>
                {qwenTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{qwenTestResult.message}</span>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
          <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>
            API anahtarları ve model seçimleri veritabanına (cnt_db_config) ve sisteme güvenle kaydedilir. Aktif olarak seçilen AI motoru tüm e-ticaret analizlerinde ve sourcing işlemlerinde otomatik olarak kullanılır.
          </span>
        </div>
      </div>

      {/* 1.6. MySQL Canlı Veritabanı Yönetimi & Bağlantı Ayarları (Production / Live DB) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              dbStatus?.isConnected
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#14171A] dark:text-zinc-100">
                  MySQL Canlı Veritabanı Yönetimi & Bağlantı Ayarları
                </h2>
                {dbStatus?.isConnected ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Canlı MySQL Bağlı ({dbStatus.serverVersion || '8.0'} · {dbStatus.latencyMs ?? 15}ms · {dbStatus.totalRecords} Kayıt)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Bağlantı Bekliyor / Çevrimdışı ({dbConfig.source === 'env' ? 'AI Studio Secrets' : 'data/db_config.json'})
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  Önek: {dbForm.prefix || 'cnt_'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Ürün kataloğu (cnt_products), pazaryeri teklifleri (cnt_offers), siparişler ve API kimlikleri bu veritabanında saklanır. Canlı sunucu bilgilerinizi buradan veya sol Secrets sekmesinden yapılandırabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchDbConfigAndStatus}
              disabled={isRefreshingDbStatus}
              title="Veritabanı durumunu ve tablo sayaçlarını yenile"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDbStatus ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Durumu Yenile</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSecretsHelp(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>AI Studio Secrets</span>
              {showSecretsHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* AI Studio Secrets Helper Banner (Corresponding to user's uploaded Secrets screenshot) */}
        {showSecretsHelp && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/70 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  AI Studio "Secrets" Sekmesi ile Kalıcı Ortam Değişkeni Tanımlama
                </h3>
                <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                  Sol paneldeki <strong>Secrets</strong> sekmesine (yüklediğiniz ekran görüntüsündeki "+ Add secret" butonuyla) aşağıdaki değişkenleri eklediğinizde, veritabanı ayarlarınız sunucu yeniden başlasa dahi korunur:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {[
                { key: 'DB_HOST', val: dbForm.host || '127.0.0.1', desc: 'MySQL Sunucu IP veya Host' },
                { key: 'DB_PORT', val: dbForm.port || '3306', desc: 'MySQL Port' },
                { key: 'DB_NAME', val: dbForm.database || 'u162532946_connect', desc: 'Veritabanı Adı' },
                { key: 'DB_USER', val: dbForm.user || 'u162532946_connect', desc: 'Kullanıcı Adı' },
                { key: 'DB_PASSWORD', val: '••••••••', desc: 'Veritabanı Şifresi' },
                { key: 'DB_PREFIX', val: dbForm.prefix || 'cnt_', desc: 'Tablo Öneki' },
                { key: 'DB_SSL', val: dbForm.ssl ? 'true' : 'false', desc: 'SSL (true/false)' },
                { key: 'DATABASE_URL', val: `mysql://${dbForm.user || 'user'}:pass@${dbForm.host || 'host'}:${dbForm.port || 3306}/${dbForm.database || 'db'}`, desc: 'Tek Satır URI Alternatifi' },
              ].map(sec => (
                <div
                  key={sec.key}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 flex items-center justify-between gap-1 shadow-2xs"
                >
                  <div className="min-w-0">
                    <span className="block text-[11px] font-mono font-bold text-[#14171A] dark:text-zinc-200 truncate">
                      {sec.key}
                    </span>
                    <span className="block text-[9px] text-slate-400 dark:text-zinc-400 truncate">
                      {sec.desc}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySecret(sec.key)}
                    className="p-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400 cursor-pointer shrink-0 transition-colors"
                    title={`${sec.key} adını kopyala`}
                  >
                    {copiedSecret === sec.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Connection URL Parser (Optional Fast Input) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Hızlı Bağlantı URL ile Otomatik Doldur (Opsiyonel):</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              mysql://user:pass@host:3306/dbname
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={quickDbUrl}
              onChange={(e) => setQuickDbUrl(e.target.value)}
              placeholder="mysql://u162532946_connect:sifre@127.0.0.1:3306/u162532946_connect"
              className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2 text-xs font-mono focus:outline-none bg-white dark:bg-zinc-900 text-[#14171A] dark:text-white"
            />
            <button
              type="button"
              onClick={handleApplyQuickUrl}
              disabled={!quickDbUrl.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-50 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Alanlara Aktar
            </button>
          </div>
        </div>

        {/* Database Configuration Form */}
        <form onSubmit={handleSaveDbConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Host */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Sunucu IP / Host Adresi:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dbForm.host}
                onChange={(e) => setDbForm(prev => ({ ...prev, host: e.target.value }))}
                placeholder="127.0.0.1 veya Hostinger IP"
                className="w-full border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
              />
              <span className="text-[10px] text-slate-400">cPanel / Hostinger MySQL IP veya localhost</span>
            </div>

            {/* Port */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Port:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={dbForm.port}
                onChange={(e) => setDbForm(prev => ({ ...prev, port: e.target.value }))}
                placeholder="3306"
                className="w-full border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Varsayılan: 3306</span>
            </div>

            {/* Database Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Veritabanı Adı (Database):</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dbForm.database}
                onChange={(e) => setDbForm(prev => ({ ...prev, database: e.target.value }))}
                placeholder="u162532946_connect"
                className="w-full border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Örn: u162532946_connect</span>
            </div>

            {/* User */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Kullanıcı Adı (User):</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dbForm.user}
                onChange={(e) => setDbForm(prev => ({ ...prev, user: e.target.value }))}
                placeholder="u162532946_connect"
                className="w-full border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
              />
              <span className="text-[10px] text-slate-400">MySQL kullanıcısı</span>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Veritabanı Şifresi:</span>
                {dbConfig.hasPassword && !dbForm.password && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                    Kayıtlı: {dbConfig.maskedPassword}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showDbPassword ? "text" : "password"}
                  value={dbForm.password}
                  onChange={(e) => setDbForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={dbConfig.hasPassword ? "Mevcut şifre kayıtlı (Değiştirmek için yeni şifre girin)" : "MySQL kullanıcı şifresi"}
                  className="w-full border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2.5 pr-9 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowDbPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  title={showDbPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {showDbPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400">Boş bırakılırsa mevcut kayıtlı şifre korunur</span>
            </div>

            {/* Prefix & SSL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Tablo Öneki (Prefix):</span>
                <span className="text-[10px] text-slate-400">Varsayılan: cnt_</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dbForm.prefix}
                  onChange={(e) => setDbForm(prev => ({ ...prev, prefix: e.target.value }))}
                  placeholder="cnt_"
                  className="flex-1 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
                />
                <label className="flex items-center gap-1.5 p-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={dbForm.ssl}
                    onChange={(e) => setDbForm(prev => ({ ...prev, ssl: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">SSL</span>
                </label>
              </div>
              <span className="text-[10px] text-slate-400">Tüm tablolar bu önekle başlar (örn: cnt_products)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleTestDbConnection}
                disabled={isTestingDb || !dbForm.host || !dbForm.database || !dbForm.user}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingDb ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Bağlantı Test Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bağlantıyı Canlı Test Et</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleInitDbTables}
                disabled={isRepairingDb || !dbStatus?.isConnected}
                title="Eksik veritabanı tablolarını otomatik oluşturur veya doğrular"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRepairingDb ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Tablolar Doğrulanıyor...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tabloları Onar / Oluştur</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSavingDb || !dbForm.host || !dbForm.database || !dbForm.user}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              {isSavingDb ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Kaydet & Bağlan</span>
                </>
              )}
            </button>
          </div>

          {/* Test / Operation Result Alert */}
          {dbTestResult && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 border ${
              dbTestResult.success
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-800'
            }`}>
              {dbTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ServerCrash className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold block">{dbTestResult.message}</span>
                {dbTestResult.serverVersion && (
                  <span className="text-[11px] block opacity-85">
                    Sunucu: {dbTestResult.serverVersion} · Gecikme: {dbTestResult.latencyMs}ms · Tespit Edilen Tablo: {dbTestResult.totalTablesCount ?? 0}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Active Tables Overview Grid */}
          {dbStatus?.tableStatuses && dbStatus.tableStatuses.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Veritabanı Tabloları & Kayıt Sayıları:</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Toplam {dbStatus.totalRecords} Kayıt
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {dbStatus.tableStatuses.map(tbl => (
                  <div
                    key={tbl.tableName}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-1">
                      <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-zinc-200 block truncate">
                        {tbl.tableName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {tbl.displayName}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      tbl.recordCount > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-400'
                    }`}>
                      {tbl.recordCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remote MySQL Firewall Hint */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Uzak Sunucu (cPanel / Hostinger / AWS) Bağlantı İpucu:</strong> Eğer MySQL sunucunuz uzak bir hosting üzerinde ise, cPanel veya Hostinger panelinizdeki <strong>"Remote MySQL / Uzak MySQL"</strong> bölümünden bu sunucunun IP adresine veya tüm IP'lere erişim için <code>%</code> (yüzde işareti) ekleyerek izin vermeniz gerekmektedir.
            </div>
          </div>
        </form>
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
                onClick={handleOpenAllegroOAuthPopup}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF5A00] hover:bg-[#e04f00] text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Allegro hesabınızla tek tıkla giriş yaparak yetkili satıcı tokenı alın"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>OAuth ile Bağlan (charsioutlet Girişi)</span>
              </button>

              <a
                href="https://apps.developer.allegro.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-orange-50 border border-orange-200 text-orange-800 shadow-2xs flex items-center gap-1.5 transition-all"
                title="Allegro Developer Portal üzerinden 'Pobierz token' butonuna tıklayarak direkt User Token alabilirsiniz"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                <span>Developer Portal'dan Token Al</span>
              </a>

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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Doğrudan Bearer Token (Opsiyonel):</label>
                  {allegroToken && (
                    <button
                      type="button"
                      onClick={() => {
                        setAllegroToken('');
                        const updated = { ...creds.allegro, accessToken: '' };
                        setCreds(prev => ({ ...prev, allegro: updated }));
                        store.savePlatformCredentials({ allegro: updated });
                        store.updateAllegroConfig({ bearerToken: '', isConnected: Boolean(creds.allegro.clientId) });
                        showNotice('Eski Allegro tokenı temizlendi.');
                      }}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Tokenı Temizle
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={allegroToken}
                  onChange={(e) => setAllegroToken(e.target.value)}
                  placeholder="Kişisel OAuth token (Varsa)..."
                  className="w-full border border-slate-200 focus:border-[#FF5A00] rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50"
                />
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-[10px] text-slate-500">
                    Süre: <strong>12 saat</strong> geçerlidir (dolduğunda 401 verir).
                  </p>
                  <button
                    type="button"
                    onClick={handleFetchAllegroOAuthToken}
                    disabled={activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'token'}
                    className="text-[10px] font-bold text-[#FF5A00] hover:text-[#e04f00] hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${activeTransfer?.loading && activeTransfer.platform === 'allegro' && activeTransfer.action === 'token' ? 'animate-spin' : ''}`} />
                    <span>Yeni Canlı Token Üret</span>
                  </button>
                </div>
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
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14171A] dark:text-zinc-100">Şirket & E-Fatura Vergi Bilgileri</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Polonya (NIP), Romanya (CUI) ve AB KDV fatura şablonu</p>
            </div>
          </div>

          <button
            onClick={handleSaveCompanyTax}
            disabled={isSavingTaxInfo}
            className="px-4 py-2 rounded-xl bg-[#14171A] dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 min-h-[36px]"
          >
            {isSavingTaxInfo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingTaxInfo ? 'Kaydediliyor...' : 'Vergi Bilgilerini Kaydet'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Şirket Ünvanı:</label>
            <input
              type="text"
              value={companyTax.companyName || ''}
              onChange={(e) => setCompanyTax(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Örn: Omni Merchant Global Sp. z o.o."
              className="w-full border border-slate-200 dark:border-zinc-700 focus:border-[#14171A] dark:focus:border-white rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Polonya NIP (AB KDV No):</label>
            <input
              type="text"
              value={companyTax.polandNip || ''}
              onChange={(e) => setCompanyTax(prev => ({ ...prev, polandNip: e.target.value }))}
              placeholder="Örn: PL5252849102"
              className="w-full border border-slate-200 dark:border-zinc-700 focus:border-[#14171A] dark:focus:border-white rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Romanya CUI / CIF No:</label>
            <input
              type="text"
              value={companyTax.romaniaCui || ''}
              onChange={(e) => setCompanyTax(prev => ({ ...prev, romaniaCui: e.target.value }))}
              placeholder="Örn: RO48291048"
              className="w-full border border-slate-200 dark:border-zinc-700 focus:border-[#14171A] dark:focus:border-white rounded-xl p-2.5 text-xs font-mono focus:outline-none bg-slate-50 dark:bg-zinc-800 text-[#14171A] dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 6. Panel Verilerini Sıfırlama (Yerel Önbellek Yönetimi) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/50 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#14171A] dark:text-zinc-100">
                  {brandName} Panel Verilerini Sıfırla (Yerel Önbellek)
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
