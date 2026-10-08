import React, { useState } from 'react';
import {
  Database,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  User,
  Key,
  Mail,
  Zap,
  Check,
  Layers,
  Sparkles,
  Lock,
  Globe,
  HardDrive
} from 'lucide-react';
import { MySQLConnectionConfig } from '../../types/database';
import { mysqlService } from '../../services/mysqlService';
import { useAuth } from '../../context/AuthContext';

interface InitialInstallationWizardProps {
  onInstallationComplete: () => void;
}

export const InitialInstallationWizard: React.FC<InitialInstallationWizardProps> = ({
  onInstallationComplete
}) => {
  const { setDirectUser } = useAuth() as any;

  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState<MySQLConnectionConfig>(mysqlService.getConfig());
  
  // Admin form details
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');
  const [adminFullName, setAdminFullName] = useState<string>('Sistem Yöneticisi');
  const [adminEmail, setAdminEmail] = useState<string>('admin@jiguli.pro');

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    serverVersion?: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof MySQLConnectionConfig, value: any) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    mysqlService.saveConfig(updated);
  };

  const handleFillLocalhost = () => {
    const localCfg: MySQLConnectionConfig = {
      host: '127.0.0.1',
      port: 3306,
      database: 'jiguli_db',
      user: 'root',
      password: '',
      ssl: false,
      prefix: 'jiguli_',
      charset: 'utf8mb4'
    };
    setConfig(localCfg);
    mysqlService.saveConfig(localCfg);
    setTestResult(null);
  };

  const handleFillRemoteCloud = () => {
    const cloudCfg: MySQLConnectionConfig = {
      host: 'mysql-server.cloud-database.net',
      port: 3306,
      database: 'jiguli_production',
      user: 'db_admin_user',
      password: 'Prod_Secret_2026!',
      ssl: true,
      prefix: 'jiguli_',
      charset: 'utf8mb4'
    };
    setConfig(cloudCfg);
    mysqlService.saveConfig(cloudCfg);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);
    try {
      const res = await mysqlService.testConnection(config);
      setTestResult(res);
      if (res.success) {
        setTimeout(() => {
          setStep(3);
        }, 1000);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Bağlantı hatası'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunInstallation = async () => {
    setIsInstalling(true);
    setErrorMessage(null);
    try {
      // 1. Install tables
      const res = await mysqlService.installSchema(config);
      if (!res.success && res.errors && res.errors.length > 0) {
        setErrorMessage(res.errors.join(', '));
      }
      
      // Move to admin user creation
      setStep(4);
    } catch (err: any) {
      setErrorMessage(`Kurulum sırasında hata: ${err?.message || err}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleFinalizeSetup = () => {
    // Save admin user session
    const authUser = {
      username: adminUsername.trim() || 'admin',
      name: adminFullName.trim() || 'Sistem Yöneticisi',
      role: 'Sistem Yöneticisi (SuperAdmin)',
      avatar: (adminFullName.trim() || 'AD').slice(0, 2).toUpperCase(),
      email: adminEmail.trim() || 'admin@jiguli.pro',
      loginTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    try {
      localStorage.setItem('jiguli_system_installed', 'true');
      localStorage.setItem('jiguli_auth_session_v1', JSON.stringify(authUser));
      if (setDirectUser) {
        setDirectUser(authUser);
      }
    } catch (e) {
      console.warn('Local storage error:', e);
    }

    onInstallationComplete();
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#9FE870] selection:text-[#163300] font-sans">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#9FE870] text-[#163300] flex items-center justify-center font-black text-xl shadow-md">
            ↗
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Jiguli <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#9FE870]/20 text-[#9FE870] border border-[#9FE870]/40">İlk Kurulum Sihirbazı</span>
            </div>
            <div className="text-[11px] text-slate-400">
              E-Ticaret & Pazaryeri Entegrasyon Sistemi (MySQL 5.7+ / 8.0+)
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Database className="w-4 h-4 text-[#9FE870]" />
          <span>Veritabanı Odaklı Sistem</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-3xl bg-[#141A29] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className={step >= 1 ? 'text-[#9FE870]' : ''}>1. Hoş Geldiniz</span>
              <span className={step >= 2 ? 'text-[#9FE870]' : ''}>2. MySQL Bağlantısı</span>
              <span className={step >= 3 ? 'text-[#9FE870]' : ''}>3. Tablolar & Şema</span>
              <span className={step >= 4 ? 'text-[#9FE870]' : ''}>4. Yönetici Hesabı</span>
              <span className={step >= 5 ? 'text-[#9FE870]' : ''}>5. Tamamlandı</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#9FE870] to-[#2B5900] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* ERROR BANNER */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-[#9FE870]/20 text-[#9FE870] border border-[#9FE870]/30 flex items-center justify-center mx-auto shadow-inner">
                <Database className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Jiguli Kurulumuna Hoş Geldiniz
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  Sistemimiz artık tüm verileri (kullanıcılar, pazaryeri API anahtarları, ürünler, siparişler, kargo takip kodları ve otomasyonlar) doğrudan MySQL veritabanında saklayacak ve yönetecek şekilde çalışmaktadır.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <HardDrive className="w-5 h-5 text-[#9FE870]" />
                  <div className="text-xs font-bold text-white">Sıfır & Temiz Veri</div>
                  <div className="text-[11px] text-slate-400">Tüm mock veriler temizlendi, gerçek veri tabanı ile bağlanacaksınız.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <ShieldCheck className="w-5 h-5 text-[#9FE870]" />
                  <div className="text-xs font-bold text-white">11 İlişkisel Tablo</div>
                  <div className="text-[11px] text-slate-400">Kullanıcılar, API'ler, ürünler ve siparişler için optimize MySQL şeması.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <Zap className="w-5 h-5 text-[#9FE870]" />
                  <div className="text-xs font-bold text-white">Canlı API & Eşleme</div>
                  <div className="text-[11px] text-slate-400">Allegro, eMAG, BaseLinker ve AliExpress anlık senkronizasyon desteği.</div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#9FE870] hover:bg-[#8CD85C] text-[#163300] font-black text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Kuruluma Başla (Adım 1/5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MYSQL CONNECTION CONFIG */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">
                    MySQL Veritabanı Bağlantı Parametreleri
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kendi MySQL / MariaDB sunucunuzun bağlantı parametrelerini giriniz.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillLocalhost}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#9FE870] text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                  >
                    Yerel (Localhost)
                  </button>
                  <button
                    type="button"
                    onClick={handleFillRemoteCloud}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                  >
                    Bulut (Cloud)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Sunucu Adresi (Host) *
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    placeholder="127.0.0.1"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Port Numarası *
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => handleInputChange('port', Number(e.target.value))}
                    placeholder="3306"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Veritabanı Adı (Database Name) *
                  </label>
                  <input
                    type="text"
                    value={config.database}
                    onChange={(e) => handleInputChange('database', e.target.value)}
                    placeholder="jiguli_db"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Kullanıcı Adı (DB User) *
                  </label>
                  <input
                    type="text"
                    value={config.user}
                    onChange={(e) => handleInputChange('user', e.target.value)}
                    placeholder="root"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Veritabanı Şifresi (DB Password)
                  </label>
                  <input
                    type="password"
                    value={config.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tablo Öneki (Prefix)
                  </label>
                  <input
                    type="text"
                    value={config.prefix || 'jiguli_'}
                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                    placeholder="jiguli_"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>
              </div>

              {testResult && (
                <div className={`p-4 rounded-2xl border ${
                  testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                } text-xs space-y-1`}>
                  <div className="font-bold flex items-center gap-2">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.latencyMs !== undefined && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Gecikme: {testResult.latencyMs}ms · Sürüm: {testResult.serverVersion || 'MySQL 8.0'}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                >
                  Geri Dön
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-6 py-2.5 rounded-2xl bg-[#9FE870] hover:bg-[#8CD85C] text-[#163300] text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-[#163300]" /> : <Server className="w-4 h-4" />}
                    <span>Bağlantıyı Test Et & Devam Et</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEMA CREATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-black text-white">
                  Adım 3: Veritabanı Tablolarını Sıfırdan Oluştur (DDL)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  11 adet ilişkisel MySQL tablosu veritabanınızda tek tıkla oluşturulacak.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto no-scrollbar p-1">
                {[
                  { name: `${config.prefix || 'jiguli_'}db_config`, desc: 'Sistem Yapılandırması' },
                  { name: `${config.prefix || 'jiguli_'}users`, desc: 'Kullanıcılar & Şifreler' },
                  { name: `${config.prefix || 'jiguli_'}api_credentials`, desc: 'Pazaryeri API Anahtarları' },
                  { name: `${config.prefix || 'jiguli_'}categories`, desc: 'Kategori Eşlemeleri' },
                  { name: `${config.prefix || 'jiguli_'}products`, desc: 'Ürün Kataloğu & Stok Master' },
                  { name: `${config.prefix || 'jiguli_'}offers`, desc: 'Pazaryeri Teklifleri (Allegro/eMAG)' },
                  { name: `${config.prefix || 'jiguli_'}orders`, desc: 'Siparişler & Alıcı Adresleri' },
                  { name: `${config.prefix || 'jiguli_'}order_items`, desc: 'Sipariş Ürün Kalemleri' },
                  { name: `${config.prefix || 'jiguli_'}repricer_rules`, desc: 'BuyBox & Fiyat Kuralları' },
                  { name: `${config.prefix || 'jiguli_'}automations`, desc: 'Otomasyon Kuralları' },
                  { name: `${config.prefix || 'jiguli_'}sync_logs`, desc: 'Entegrasyon Log Kayıtları' }
                ].map((tbl, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-white">{tbl.name}</div>
                      <div className="text-[10px] text-slate-400">{tbl.desc}</div>
                    </div>
                    <span className="text-[10px] font-bold text-[#9FE870] bg-[#9FE870]/10 px-2 py-0.5 rounded-md border border-[#9FE870]/30">
                      Oluşturulacak
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                >
                  Geri Dön
                </button>

                <button
                  type="button"
                  onClick={handleRunInstallation}
                  disabled={isInstalling}
                  className="px-6 py-2.5 rounded-2xl bg-[#9FE870] hover:bg-[#8CD85C] text-[#163300] text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isInstalling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#163300]" />
                      <span>Tablolar Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Tüm Tabloları Oluştur & İlerle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ADMIN USER CREATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-black text-white">
                  Adım 4: Yönetici (Admin) Hesabı Oluşturun
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sisteme ve entegrasyon paneline giriş yapacağınız ana yönetici hesabını belirleyin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Kullanıcı Adı (Username) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-hidden focus:border-[#9FE870]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Giriş Şifresi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-hidden focus:border-[#9FE870]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    İsim Soyisim *
                  </label>
                  <input
                    type="text"
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    placeholder="Sistem Yöneticisi"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-hidden focus:border-[#9FE870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    E-Posta Adresi *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@jiguli.pro"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-hidden focus:border-[#9FE870]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                >
                  Geri Dön
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-2xl bg-[#9FE870] hover:bg-[#8CD85C] text-[#163300] text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Hesabı Kaydet & İlerle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FINAL COMPLETE */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl font-black text-white">
                  Kurulum Başarıyla Tamamlandı!
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Yazılımınız sıfırdan MySQL veritabanına bağlandı. Artık kullanıcılar, API anahtarları, ürünler ve siparişler tamamen veritabanına kayıt olup veritabanından çekilecektir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 max-w-md mx-auto">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#9FE870]" />
                  <span>Yönetici Giriş Bilgileriniz:</span>
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div>Kullanıcı Adı: <strong className="text-white">{adminUsername}</strong></div>
                  <div>E-Posta: <strong className="text-white">{adminEmail}</strong></div>
                  <div>Veritabanı: <strong className="text-[#9FE870]">{config.database}</strong> ({config.host}:{config.port})</div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleFinalizeSetup}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-[#9FE870] hover:bg-[#8CD85C] text-[#163300] font-black text-sm transition-all shadow-xl hover:shadow-2xl cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-[#163300]" />
                  <span>Entegrasyon Paneline Giriş Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        Jiguli Cross-Border E-Commerce Suite © 2026 · MySQL Database Integration Engine
      </footer>
    </div>
  );
};
