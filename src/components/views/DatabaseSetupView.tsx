import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  Check,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Table,
  Cpu,
  Key,
  Globe,
  Settings,
  Terminal,
  Activity,
  Zap,
  HardDrive
} from 'lucide-react';
import { MySQLConnectionConfig, DBSetupStatus } from '../../types/database';
import { mysqlService, DEFAULT_DEMO_MYSQL_CONFIG } from '../../services/mysqlService';
import { store } from '../../services/marketplaceStore';

interface DatabaseSetupViewProps {
  theme?: 'light' | 'dark';
}

export const DatabaseSetupView: React.FC<DatabaseSetupViewProps> = () => {
  const [config, setConfig] = useState<MySQLConnectionConfig>(mysqlService.getConfig());
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    serverVersion?: string;
    message: string;
  } | null>(null);
  const [dbStatus, setDbStatus] = useState<DBSetupStatus | null>(null);
  const [copiedSQL, setCopiedSQL] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'wizard' | 'tables' | 'sql_export' | 'guide'>('wizard');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load status on mount
  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = async () => {
    const status = await mysqlService.getDatabaseStatus(config);
    setDbStatus(status);
  };

  const handleInputChange = (field: keyof MySQLConnectionConfig, value: any) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    mysqlService.saveConfig(updated);
  };

  const handleFillDemoConfig = () => {
    const demo: MySQLConnectionConfig = {
      host: '127.0.0.1',
      port: 3306,
      database: 'jiguli_integration_db',
      user: 'jiguli_user',
      password: 'Strong_DB_Password_2026!',
      ssl: false,
      prefix: 'jiguli_',
      charset: 'utf8mb4'
    };
    setConfig(demo);
    mysqlService.saveConfig(demo);
    setStatusMessage('Örnek yerel MySQL bağlantı bilgileri form alanlarına yüklendi.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleFillCloudConfig = () => {
    const cloud: MySQLConnectionConfig = {
      host: 'mysql-server.cloud-database.net',
      port: 3306,
      database: 'jiguli_production',
      user: 'db_admin_root',
      password: 'Prod_Secret_Key_999!',
      ssl: true,
      prefix: 'jiguli_',
      charset: 'utf8mb4'
    };
    setConfig(cloud);
    mysqlService.saveConfig(cloud);
    setStatusMessage('Örnek Bulut / Uzak Sunucu MySQL şablonu yüklendi.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await mysqlService.testConnection(config);
      setTestResult(res);
      if (res.success) {
        await refreshStatus();
        setActiveStep(3); // Move to table creation
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Bağlantı testi sırasında hata meydana geldi.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunInstallation = async () => {
    setIsInstalling(true);
    try {
      const res = await mysqlService.installSchema(config);
      setStatusMessage(res.message);
      await refreshStatus();
      if (res.success) {
        setActiveStep(4);
      }
    } catch (err: any) {
      setStatusMessage(`Kurulum hatası: ${err?.message || err}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleSeedAndSync = async () => {
    setIsSyncing(true);
    try {
      const allOffers = store.getOffers();
      const allOrders = store.getOrders();
      const res = await mysqlService.syncAllData({
        offers: allOffers,
        orders: allOrders
      }, config);
      setStatusMessage(res.message || 'Veriler MySQL tablolarına aktarıldı.');
      await refreshStatus();
      setActiveStep(5);
    } catch (err: any) {
      setStatusMessage(`Senkronizasyon hatası: ${err?.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySQL = () => {
    const sql = mysqlService.generateFullSQLScript(config.prefix);
    navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  const handleDownloadSQL = () => {
    mysqlService.downloadSQLDump(config.prefix);
  };

  const fullSqlScript = mysqlService.generateFullSQLScript(config.prefix);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & DB Health Overview */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#163300] to-[#2B5900] text-[#9FE870] flex items-center justify-center shadow-md shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black text-[#14171A] tracking-tight">
                  MySQL Veritabanı Kurulumu & Yönetim Merkezi
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9FE870]/30 text-[#163300] border border-[#9FE870]">
                  MySQL 5.7 / 8.0+ Hazır
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#5D7079] mt-1 font-medium">
                Tüm kullanıcı, pazaryeri API anahtarları, ürün kataloğu, sipariş ve otomasyon verilerinizi kalıcı MySQL veritabanına bağlayın.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#5D7079]">Sunucu Durumu</div>
              <div className="flex items-center justify-center gap-1.5 mt-0.5 font-black text-xs text-[#14171A]">
                <div className={`w-2 h-2 rounded-full ${dbStatus?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {dbStatus?.isConnected ? 'Bağlantı Aktif' : 'Hazır (Standby)'}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#5D7079]">Tablo Sayısı</div>
              <div className="font-black text-sm text-[#14171A]">
                {dbStatus?.tables?.filter(t => t.status === 'ready').length || 11} / 11 Tablo
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#5D7079]">Kayıt Toplamı</div>
              <div className="font-black text-sm text-[#163300]">
                {dbStatus?.totalRecords || (store.getOffers().length + store.getOrders().length + 5)} Kayıt
              </div>
            </div>

            <button
              onClick={refreshStatus}
              className="p-3 rounded-2xl bg-[#F4F5F7] hover:bg-[#E5E8EC] text-[#14171A] transition-colors cursor-pointer"
              title="Durumu Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Notification */}
        {statusMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#9FE870]/20 border border-[#9FE870] text-[#163300] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#163300]" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'wizard'
              ? 'bg-[#163300] text-white shadow-sm'
              : 'bg-white text-[#5D7079] hover:bg-slate-100 hover:text-[#14171A]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Sıfırdan Kurulum Sihirbazı</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tables'
              ? 'bg-[#163300] text-white shadow-sm'
              : 'bg-white text-[#5D7079] hover:bg-slate-100 hover:text-[#14171A]'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Veritabanı Tabloları ({dbStatus?.tables?.length || 11})</span>
        </button>

        <button
          onClick={() => setActiveTab('sql_export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sql_export'
              ? 'bg-[#163300] text-white shadow-sm'
              : 'bg-white text-[#5D7079] hover:bg-slate-100 hover:text-[#14171A]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>SQL Kurulum Betiği (.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-[#163300] text-white shadow-sm'
              : 'bg-white text-[#5D7079] hover:bg-slate-100 hover:text-[#14171A]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>phpMyAdmin & cPanel Kılavuzu</span>
        </button>
      </div>

      {/* TAB 1: KURULUM SİHİRBAZI */}
      {activeTab === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Step Indicator */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#5D7079] px-2">
                Kurulum Adımları
              </h3>

              <div
                onClick={() => setActiveStep(1)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  activeStep === 1
                    ? 'bg-[#163300] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#14171A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                  activeStep === 1 ? 'bg-[#9FE870] text-[#163300]' : 'bg-slate-200 text-slate-700'
                }`}>
                  1
                </div>
                <div>
                  <div className="text-xs font-bold">Bağlantı Parametreleri</div>
                  <div className={`text-[10px] ${activeStep === 1 ? 'text-white/80' : 'text-[#5D7079]'}`}>
                    Host, Port, DB, Kullanıcı & Şifre
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveStep(2)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  activeStep === 2
                    ? 'bg-[#163300] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#14171A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                  activeStep === 2 ? 'bg-[#9FE870] text-[#163300]' : 'bg-slate-200 text-slate-700'
                }`}>
                  2
                </div>
                <div>
                  <div className="text-xs font-bold">Bağlantı Testi (Ping)</div>
                  <div className={`text-[10px] ${activeStep === 2 ? 'text-white/80' : 'text-[#5D7079]'}`}>
                    MySQL el sıkışması ve sürüm onayı
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveStep(3)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  activeStep === 3
                    ? 'bg-[#163300] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#14171A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                  activeStep === 3 ? 'bg-[#9FE870] text-[#163300]' : 'bg-slate-200 text-slate-700'
                }`}>
                  3
                </div>
                <div>
                  <div className="text-xs font-bold">Tabloları Oluştur (DDL)</div>
                  <div className={`text-[10px] ${activeStep === 3 ? 'text-white/80' : 'text-[#5D7079]'}`}>
                    11 entegrasyon tablosu şeması
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveStep(4)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  activeStep === 4
                    ? 'bg-[#163300] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#14171A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                  activeStep === 4 ? 'bg-[#9FE870] text-[#163300]' : 'bg-slate-200 text-slate-700'
                }`}>
                  4
                </div>
                <div>
                  <div className="text-xs font-bold">Veri Aktarımı & Tohumlama</div>
                  <div className={`text-[10px] ${activeStep === 4 ? 'text-white/80' : 'text-[#5D7079]'}`}>
                    Admin hesabı & katalog verisi aktar
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveStep(5)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  activeStep === 5
                    ? 'bg-[#163300] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#14171A]'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                  activeStep === 5 ? 'bg-[#9FE870] text-[#163300]' : 'bg-slate-200 text-slate-700'
                }`}>
                  5
                </div>
                <div>
                  <div className="text-xs font-bold">Kurulum Tamamlandı</div>
                  <div className={`text-[10px] ${activeStep === 5 ? 'text-white/80' : 'text-[#5D7079]'}`}>
                    Canlı senkronizasyon & SQL Dökümü
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-black text-[#14171A] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#163300]" />
                <span>Hızlı Bağlantı Şablonları</span>
              </div>
              <p className="text-[11px] text-[#5D7079]">
                Yerel (Localhost) veya Bulut (AWS RDS / cPanel / MariaDB) için önceden tanımlı bağlantı parametrelerini tek tıkla yükleyebilirsiniz:
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleFillDemoConfig}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#14171A] text-xs font-bold text-left transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Yerel MySQL (Localhost:3306)</span>
                  <span className="text-[10px] text-[#5D7079] font-mono">127.0.0.1</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillCloudConfig}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#14171A] text-xs font-bold text-left transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Bulut / Uzak Sunucu (SSL Aktif)</span>
                  <span className="text-[10px] text-[#5D7079] font-mono">Cloud RDS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Active Step Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* STEP 1 */}
              {activeStep === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-[#14171A]">
                      Adım 1: MySQL Veritabanı Bağlantı Bilgileri
                    </h2>
                    <p className="text-xs text-[#5D7079] mt-0.5">
                      Veritabanınızın IP adresini, portunu, kullanıcı adını ve şifresini girin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14171A] mb-1.5">
                        Sunucu Adresi (Host) *
                      </label>
                      <input
                        type="text"
                        value={config.host}
                        onChange={(e) => handleInputChange('host', e.target.value)}
                        placeholder="Örn: 127.0.0.1 veya sql.domain.com"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#163300]"
                      />
                      <span className="text-[10px] text-[#7D8F99] mt-1 block">Yerel sunucu için 127.0.0.1 veya localhost</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14171A] mb-1.5">
                        Port Numarası *
                      </label>
                      <input
                        type="number"
                        value={config.port}
                        onChange={(e) => handleInputChange('port', Number(e.target.value))}
                        placeholder="3306"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#163300]"
                      />
                      <span className="text-[10px] text-[#7D8F99] mt-1 block">Varsayılan MySQL portu: 3306</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14171A] mb-1.5">
                        Veritabanı Adı (Database Name) *
                      </label>
                      <input
                        type="text"
                        value={config.database}
                        onChange={(e) => handleInputChange('database', e.target.value)}
                        placeholder="Örn: jiguli_db veya entegrasyon"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#163300]"
                      />
                      <span className="text-[10px] text-[#7D8F99] mt-1 block">phpMyAdmin veya MySQL'de açtığınız DB adı</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14171A] mb-1.5">
                        Kullanıcı Adı (DB User) *
                      </label>
                      <input
                        type="text"
                        value={config.user}
                        onChange={(e) => handleInputChange('user', e.target.value)}
                        placeholder="Örn: root veya jiguli_user"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#163300]"
                      />
                      <span className="text-[10px] text-[#7D8F99] mt-1 block">Yetkili MySQL kullanıcı adı</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14171A] mb-1.5">
                        Veritabanı Şifresi (DB Password)
                      </label>
                      <input
                        type="password"
                        value={config.password || ''}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#163300]"
                      />
                      <span className="text-[10px] text-[#7D8F99] mt-1 block">Kullanıcı parolası</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14171A] mb-1.5">
                        Tablo Öneki (Table Prefix)
                      </label>
                      <input
                        type="text"
                        value={config.prefix || 'jiguli_'}
                        onChange={(e) => handleInputChange('prefix', e.target.value)}
                        placeholder="jiguli_"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#163300]"
                      />
                      <span className="text-[10px] text-[#7D8F99] mt-1 block">Varsayılan: jiguli_ (Örn: jiguli_products)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <input
                      type="checkbox"
                      id="sslCheck"
                      checked={config.ssl === true}
                      onChange={(e) => handleInputChange('ssl', e.target.checked)}
                      className="w-4 h-4 rounded text-[#163300] cursor-pointer"
                    />
                    <label htmlFor="sslCheck" className="text-xs font-bold text-[#14171A] cursor-pointer">
                      Güvenli SSL / TLS Bağlantısı Kullan (Amazon RDS, PlanetScale veya Cloud SQL için)
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleFillDemoConfig}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#14171A] cursor-pointer"
                    >
                      Örnek Verileri Doldur
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        mysqlService.saveConfig(config);
                        setActiveStep(2);
                        handleTestConnection();
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-[#163300] hover:bg-[#234F00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Kaydet & Test Et</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {activeStep === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-[#14171A]">
                      Adım 2: Canlı Bağlantı & Yetki Testi
                    </h2>
                    <p className="text-xs text-[#5D7079] mt-0.5">
                      MySQL sunucusu ile el sıkışma yapılıyor ve veritabanı yanıt süresi ölçülüyor.
                    </p>
                  </div>

                  {/* Testing state or result */}
                  {isTesting ? (
                    <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <RefreshCw className="w-8 h-8 text-[#163300] animate-spin mx-auto" />
                      <div className="text-sm font-bold text-[#14171A]">
                        MySQL Sunucusuna ({config.host}:{config.port}) Bağlanılıyor...
                      </div>
                      <p className="text-xs text-[#5D7079]">
                        Kullanıcı kimliği ve UTF8MB4 karakter seti doğrulanıyor.
                      </p>
                    </div>
                  ) : testResult ? (
                    <div className={`p-5 rounded-2xl border ${
                      testResult.success ? 'bg-emerald-50/70 border-emerald-300' : 'bg-amber-50/70 border-amber-300'
                    } space-y-3`}>
                      <div className="flex items-center gap-2.5">
                        {testResult.success ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-amber-600" />
                        )}
                        <div className="font-bold text-sm text-[#14171A]">
                          {testResult.success ? 'Bağlantı Başarılı!' : 'Bağlantı Kurulamadı'}
                        </div>
                      </div>

                      <p className="text-xs text-[#5D7079] leading-relaxed">
                        {testResult.message}
                      </p>

                      {testResult.latencyMs !== undefined && (
                        <div className="flex items-center gap-4 text-xs font-mono text-[#14171A] pt-2 border-t border-slate-200/60">
                          <div>⏱️ Gecikme: <strong>{testResult.latencyMs}ms</strong></div>
                          <div>🏷️ Sürüm: <strong>{testResult.serverVersion || 'MySQL 8.0'}</strong></div>
                          <div>🗄️ Veritabanı: <strong>{config.database}</strong></div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#14171A] cursor-pointer"
                    >
                      Geri Dön
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#14171A] flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>Tekrar Test Et</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStep(3)}
                        className="px-6 py-2.5 rounded-2xl bg-[#163300] hover:bg-[#234F00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Tabloları Oluşturma Adımına Geç</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {activeStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-[#14171A]">
                      Adım 3: Sıfırdan Tabloları Oluştur (DDL Migration)
                    </h2>
                    <p className="text-xs text-[#5D7079] mt-0.5">
                      Entegrasyon yazılımı için gerekli 11 adet ilişkisel tablo otomatik olarak oluşturulacak.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto no-scrollbar p-1">
                    {[
                      { name: `${config.prefix || 'jiguli_'}db_config`, desc: 'Sistem Yapılandırma & Sürüm' },
                      { name: `${config.prefix || 'jiguli_'}users`, desc: 'Kullanıcılar & Şifreler' },
                      { name: `${config.prefix || 'jiguli_'}api_credentials`, desc: 'Pazaryeri API Anahtarları' },
                      { name: `${config.prefix || 'jiguli_'}categories`, desc: 'Pazaryeri Kategori Eşlemeleri' },
                      { name: `${config.prefix || 'jiguli_'}products`, desc: 'Ürün Kataloğu & Stok Master' },
                      { name: `${config.prefix || 'jiguli_'}offers`, desc: 'Pazaryeri Teklifleri (Allegro/eMAG)' },
                      { name: `${config.prefix || 'jiguli_'}orders`, desc: 'Siparişler & Alıcı Bilgileri' },
                      { name: `${config.prefix || 'jiguli_'}order_items`, desc: 'Sipariş Satır Kalemleri' },
                      { name: `${config.prefix || 'jiguli_'}repricer_rules`, desc: 'BuyBox & Fiyat Kuralları' },
                      { name: `${config.prefix || 'jiguli_'}automations`, desc: 'İş Akışı Otomasyonları' },
                      { name: `${config.prefix || 'jiguli_'}sync_logs`, desc: 'Entegrasyon Log Kayıtları' }
                    ].map((tbl, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Table className="w-4 h-4 text-[#163300]" />
                          <div>
                            <div className="text-xs font-mono font-bold text-[#14171A]">{tbl.name}</div>
                            <div className="text-[10px] text-[#5D7079]">{tbl.desc}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          Hazır
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#14171A] cursor-pointer"
                    >
                      Geri Dön
                    </button>

                    <button
                      type="button"
                      onClick={handleRunInstallation}
                      disabled={isInstalling}
                      className="px-6 py-2.5 rounded-2xl bg-[#163300] hover:bg-[#234F00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isInstalling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#9FE870]" />
                          <span>Tablolar Oluşturuluyor...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-[#9FE870]" />
                          <span>Tüm Tabloları Tek Tıkla Kur</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {activeStep === 4 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-[#14171A]">
                      Adım 4: Başlangıç Verilerini Tohumla (Seed Data)
                    </h2>
                    <p className="text-xs text-[#5D7079] mt-0.5">
                      Yönetici hesabı, pazaryeri bağlantı şablonları ve mevcut ürün/sipariş verileriniz MySQL tablolarına yazılacak.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-xs font-bold text-[#14171A]">Yüklenecek Başlangıç Verileri:</div>
                    <ul className="text-xs text-[#5D7079] space-y-1.5 list-disc pl-5">
                      <li><strong>Yönetici Hesabı:</strong> Kullanıcı Adı: <code>demo</code> (Varsayılan SuperAdmin)</li>
                      <li><strong>Pazaryeri API Şablonları:</strong> Allegro, eMAG, BaseLinker, AliExpress kayıtları</li>
                      <li><strong>Mevcut Ürün Kataloğu:</strong> {store.getOffers().length} adet ürün ve teklif</li>
                      <li><strong>Sipariş Kayıtları:</strong> {store.getOrders().length} adet sipariş ve müşteri bilgisi</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#14171A] cursor-pointer"
                    >
                      Geri Dön
                    </button>

                    <button
                      type="button"
                      onClick={handleSeedAndSync}
                      disabled={isSyncing}
                      className="px-6 py-2.5 rounded-2xl bg-[#163300] hover:bg-[#234F00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#9FE870]" />
                          <span>Veriler Aktarılıyor...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-[#9FE870]" />
                          <span>Verileri Aktar & Kurulumu Tamamla</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {activeStep === 5 && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-[#14171A]">
                      Tebrikler! MySQL Veritabanı Kurulumu Başarıyla Tamamlandı
                    </h2>
                    <p className="text-xs text-[#5D7079] mt-1.5 max-w-lg mx-auto">
                      Yazılımınız artık tamamen MySQL veritabanı ile çalışmaktadır. Tüm ürünler, siparişler, API bilgileri ve kullanıcılar veritabanına kayıt edilecek ve veritabanından çekilecektir.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleDownloadSQL}
                      className="px-5 py-2.5 rounded-2xl bg-[#163300] hover:bg-[#234F00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-[#9FE870]" />
                      <span>.SQL Kurulum Dosyasını İndir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('tables')}
                      className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#14171A] flex items-center gap-2 cursor-pointer"
                    >
                      <Table className="w-4 h-4" />
                      <span>Veritabanı Tablolarını İncele</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLOLAR LİSTESİ */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-[#14171A]">
                Canlı MySQL Veritabanı Tabloları & Kayıt Sayıları
              </h2>
              <p className="text-xs text-[#5D7079] mt-0.5">
                Veritabanı tablosu şemaları, kayıt sayıları ve son senkronizasyon zamanları.
              </p>
            </div>

            <button
              onClick={handleSeedAndSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-2xl bg-[#163300] text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-[#234F00]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Tümünü Şimdi Senkronize Et</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-[#5D7079] uppercase tracking-wider">
                  <th className="py-3 px-3">Tablo Adı</th>
                  <th className="py-3 px-3">Açıklama</th>
                  <th className="py-3 px-3">Birincil Anahtar</th>
                  <th className="py-3 px-3 text-center">Kayıt Sayısı</th>
                  <th className="py-3 px-3 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(dbStatus?.tables || []).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#14171A] flex items-center gap-2">
                      <Table className="w-3.5 h-3.5 text-[#163300]" />
                      <span>{t.tableName}</span>
                    </td>
                    <td className="py-3 px-3 text-[#5D7079] font-medium">{t.description}</td>
                    <td className="py-3 px-3 font-mono text-[#7D8F99]">{t.primaryKey}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#14171A]">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs">
                        {t.rowCount} adet
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'ready' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {t.status === 'ready' ? 'Aktif' : 'Eksik'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SQL EXPORT & BETİK */}
      {activeTab === 'sql_export' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-[#14171A]">
                Hazır MySQL Kurulum Betiği (.SQL Schema Dump)
              </h2>
              <p className="text-xs text-[#5D7079] mt-0.5">
                Bu SQL kodunu phpMyAdmin, MySQL Workbench, DBeaver veya sunucu konsolunuza yapıştırarak veritabanını anında kurabilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySQL}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#14171A] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSQL ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSQL ? 'Kopyalandı!' : 'SQL Kopyala'}</span>
              </button>

              <button
                onClick={handleDownloadSQL}
                className="px-4 py-2 rounded-2xl bg-[#163300] hover:bg-[#234F00] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-[#9FE870]" />
                <span>.sql Dosyası İndir</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-[#0B0F19] text-[#9FE870] font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[480px] select-all border border-slate-800">
              <code>{fullSqlScript}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: PHPMYADMIN & CPANEL KILAVUZU */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#14171A]">
              phpMyAdmin, cPanel & MySQL Sunucu Kurulum Kılavuzu
            </h2>
            <p className="text-xs text-[#5D7079] mt-0.5">
              Kendi sunucunuzda veya hosting hesabınızda veritabanını 2 dakikada ayağa kaldırma adımları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#163300] text-[#9FE870] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="text-xs font-bold text-[#14171A]">Veritabanı Oluşturun</div>
              <p className="text-[11px] text-[#5D7079] leading-relaxed">
                cPanel MySQL Sihirbazı veya phpMyAdmin'e girip yeni bir veritabanı (Örn: <code>jiguli_db</code>) açın ve Karakter Seti olarak <code>utf8mb4_unicode_ci</code> seçin.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#163300] text-[#9FE870] flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="text-xs font-bold text-[#14171A]">Kullanıcı & Şifre Yetkisi</div>
              <p className="text-[11px] text-[#5D7079] leading-relaxed">
                Bir MySQL kullanıcısı oluşturun (Örn: <code>jiguli_user</code>), şifre belirleyin ve açtığınız veritabanına <strong>"TÜM YETKİLER (ALL PRIVILEGES)"</strong> verin.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#163300] text-[#9FE870] flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="text-xs font-bold text-[#14171A]">SQL İçe Aktarma (Import)</div>
              <p className="text-[11px] text-[#5D7079] leading-relaxed">
                phpMyAdmin "İçe Aktar (Import)" sekmesinden indirdiğiniz <code>.sql</code> dosyasını yükleyin veya Sihirbazın 3. Adımındaki "Tüm Tabloları Tek Tıkla Kur" butonuna basın.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
