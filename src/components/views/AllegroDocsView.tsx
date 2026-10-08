import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Copy,
  Check,
  Globe2,
  ShieldCheck,
  Lock,
  Layers,
  Zap,
  Server,
  Key,
  BookOpen,
  ArrowRight,
  Info,
  CheckCircle2,
  Mail,
  Building2,
  Database,
  ArrowLeft
} from 'lucide-react';

interface AllegroDocsViewProps {
  theme?: 'light' | 'dark';
  onBackToApp?: () => void;
}

export const AllegroDocsView: React.FC<AllegroDocsViewProps> = ({
  theme = 'light',
  onBackToApp
}) => {
  const isDark = theme === 'dark';
  const [lang, setLang] = useState<'PL' | 'EN' | 'TR'>('TR');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-w2qdizdtvlpufom3twu32s-20337845826.europe-west2.run.app';

  const docsUrl = `${currentOrigin}/docs/allegro`;
  const privacyUrl = `${currentOrigin}/docs/allegro#privacy`;
  const callbackUrl = `${currentOrigin}/api/allegro/callback`;
  const localhostCallbackUrl = 'http://localhost:3000/api/allegro/callback';
  const appName = 'OmniChannel Marketplace Hub - Allegro & Multi-Platform Portal';
  const developerEmail = 'bayramyildirim207@gmail.com';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto pb-16 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {/* Top Navigation Bar with Back Button & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Panele Dön</span>
            </button>
          )}
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />
            <span>Allegro REST API Official Documentation</span>
          </span>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 self-start sm:self-auto">
          <button
            onClick={() => setLang('TR')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'TR'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-zinc-900 dark:text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            🇹🇷 Türkçe
          </button>
          <button
            onClick={() => setLang('PL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'PL'
                ? 'bg-[#FF5A00] text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
            title="Allegro onay birimi için Lehçe dil desteği"
          >
            🇵🇱 Polski (Dla Allegro)
          </button>
          <button
            onClick={() => setLang('EN')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'EN'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        isDark
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-[#1b140f] border-zinc-800'
          : 'bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 border-orange-200/80 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A00]/10 border border-[#FF5A00]/25 text-[#FF5A00] text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Allegro Developer Portal Application Specification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {lang === 'PL'
                ? 'Dokumentacja Integracji Allegro REST API'
                : lang === 'EN'
                ? 'Allegro REST API Integration & Application Documentation'
                : 'Allegro REST API Entegrasyon & Uygulama Dokümantasyonu'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              {lang === 'PL'
                ? 'Oficjalna strona dokumentacji aplikacji zgłaszanej do portalu deweloperskiego apps.developer.allegro.pl. Opis architektury, celów biznesowych, wykorzystywanych zasobów API oraz polityki bezpieczeństwa.'
                : lang === 'EN'
                ? 'Official technical documentation and specification for the application registered on the Allegro Developer Portal (apps.developer.allegro.pl). Detailed overview of architecture, scopes, security and privacy.'
                : 'Allegro Developer Portal (apps.developer.allegro.pl) üzerinde uygulama kaydı açılırken talep edilen resmi dokümantasyon sayfası. Panelinizin özellikleri, API kullanım kapsamı, güvenlik ve gizlilik politikası detayları.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="https://apps.developer.allegro.pl"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#FF5A00] hover:bg-[#e04f00] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>apps.developer.allegro.pl</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-[10px] text-center font-mono text-slate-400">
              OAuth 2.0 PKCE / Authorization Code
            </span>
          </div>
        </div>
      </div>

      {/* QUICK COPY PANEL FOR ALLEGRO APPLICATION REGISTRATION */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF5A00]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'PL'
                  ? 'Dane do formularza rejestracji aplikacji na Allegro'
                  : lang === 'EN'
                  ? 'Allegro Application Registration Form Fields'
                  : 'Allegro Başvuru Formuna Yapıştırılacak Bilgiler'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {lang === 'PL'
                  ? 'Skopiuj poniższe wartości i wklej bezpośrednio w odpowiednie pola na apps.developer.allegro.pl'
                  : lang === 'EN'
                  ? 'Copy these verified values directly into your application profile at apps.developer.allegro.pl'
                  : 'Allegro Developer Portal\'daki alanlara aşağıdaki değerleri tek tıkla kopyalayıp yapıştırabilirsiniz.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Documentation URL Field */}
          <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-zinc-950 border border-orange-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FF5A00]" />
                <span>Dokümantasyon URL (Adres URL dokumentacji):</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(docsUrl, 'docsUrl')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FF5A00] text-white hover:bg-[#e04f00] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {copiedKey === 'docsUrl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'docsUrl' ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-orange-200/80 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200 select-all break-all">
              {docsUrl}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              * Allegro panelinde "Adres URL dokumentacji / Opis aplikacji" kutusuna yapıştırın.
            </p>
          </div>

          {/* Redirect URI Field */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Redirect URI (Adresy przekierowań):</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(callbackUrl, 'callback')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 dark:bg-zinc-700 text-white hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {copiedKey === 'callback' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'callback' ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200 select-all break-all">
              {callbackUrl}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              * İsteğe bağlı yerel geliştirme için: <code className="font-mono text-orange-600">{localhostCallbackUrl}</code>
            </p>
          </div>

          {/* App Name Field */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Uygulama Adı (Nazwa aplikacji):</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(appName, 'appName')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 dark:bg-zinc-700 text-white hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {copiedKey === 'appName' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'appName' ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200 select-all break-all">
              {appName}
            </div>
          </div>

          {/* Privacy Policy URL Field */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gizlilik Politikası (Polityka prywatności):</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(privacyUrl, 'privacy')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 dark:bg-zinc-700 text-white hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {copiedKey === 'privacy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'privacy' ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200 select-all break-all">
              {privacyUrl}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED SPECIFICATION SECTIONS */}
      <div className="space-y-6">
        {/* 1. Cel i Przeznaczenie Aplikacji (Integration Purpose) */}
        <section className={`p-6 rounded-3xl border space-y-3.5 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Layers className="w-5 h-5 text-[#FF5A00]" />
            <h2>
              {lang === 'PL'
                ? '1. Przegląd i Cel Biznesowy Aplikacji (Application Overview)'
                : lang === 'EN'
                ? '1. Application Overview & Integration Scope'
                : '1. Uygulama Genel Bakışı & Entegrasyon Amacı'}
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
            {lang === 'PL' ? (
              <>
                <p>
                  <strong>OmniChannel Marketplace Hub</strong> to profesjonalna platforma do zarządzania sprzedażą wielokanałową (Omnichannel E-commerce Management System), dedykowana sprzedawcom prowadzącym działalność na rynku polskim i europejskim za pośrednictwem Allegro (allegro.pl oraz allegrosandbox.pl).
                </p>
                <p>
                  Aplikacja umożliwia bezpośrednią komunikację z oficjalnym Allegro REST API w celach:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>Zarządzanie ofertami i katalogiem (Offers):</strong> Odczyt aktywnych ofert, tworzenie nowych ofert, masowa aktualizacja cen i stanów magazynowych.</li>
                  <li><strong>Obsługa zamówień (Orders & Fulfillment):</strong> Automatyczny pobór formularzy opcji dostawy (FOD), przetwarzanie danych wysyłkowych i aktualizacja statusów realizacji zamówień.</li>
                  <li><strong>Taksonomia i parametry (Categories):</strong> Weryfikacja kategorii, obsługa parametrów obowiązkowych i opcjonalnych w drzewie kategorii Allegro.</li>
                  <li><strong>Wycena i prowizje (Pricing):</strong> Sprawdzanie opłat prowizyjnych i kosztów wystawienia przed publikacją oferty.</li>
                </ul>
              </>
            ) : lang === 'EN' ? (
              <>
                <p>
                  <strong>OmniChannel Marketplace Hub</strong> is an enterprise multi-marketplace seller management software designed for merchants operating on Allegro (allegro.pl & sandbox) and cross-border European marketplaces.
                </p>
                <p>
                  The system integrates with Allegro REST API for:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>Product Catalog & Offers Management:</strong> Reading current offers, creating new listings, real-time inventory and pricing synchronization.</li>
                  <li><strong>Orders & Fulfillment Automation:</strong> Downloading checkout forms (FOD), syncing buyer delivery requirements and status updates.</li>
                  <li><strong>Category Taxonomy & Characteristics:</strong> Browsing Allegro official category tree, validating mandatory and dictionary parameters.</li>
                  <li><strong>Pricing & Fee Calculator:</strong> Predicting sales commissions and listing tariffs prior to offer publication.</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  <strong>OmniChannel Marketplace Hub</strong>, Allegro (allegro.pl ve test sandbox'ı) üzerinde satış yapan işletmelerin ürün envanterini, fiyatlandırmasını ve siparişlerini merkezi bir panelden yönetmelerini sağlayan çoklu kanal e-ticaret yönetim yazılımıdır.
                </p>
                <p>
                  Sistem, Allegro REST API ile doğrudan entegre olarak aşağıdaki işlevleri yerine getirir:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>Ürün & Teklif Yönetimi (Offers):</strong> Aktif teklifleri listeleme, stok miktarı ve satış fiyatlarını anlık güncelleme, yeni ürün oluşturma.</li>
                  <li><strong>Sipariş ve Kargo Takibi (Orders):</strong> Allegro siparişlerini ve teslimat formlarını (FOD) çekme, kargo durumu güncelleme.</li>
                  <li><strong>Kategori ve Parametre Doğrulama (Categories):</strong> Allegro resmi taksonomi ağacı üzerinden zorunlu nitelikleri denetleme.</li>
                  <li><strong>Komisyon ve Fiyatlandırma (Pricing):</strong> Allegro satış komisyonlarını ve listeleme ücretlerini önceden hesaplama.</li>
                </ul>
              </>
            )}
          </div>
        </section>

        {/* 2. Architektura i Bezpieczeństwo OAuth 2.0 (OAuth & Architecture) */}
        <section className={`p-6 rounded-3xl border space-y-3.5 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2>
              {lang === 'PL'
                ? '2. Architektura Bezpieczeństwa i Autoryzacja OAuth 2.0'
                : lang === 'EN'
                ? '2. Security Architecture & OAuth 2.0 PKCE Flow'
                : '2. Güvenlik Mimarisi ve OAuth 2.0 Protokolü'}
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>OAuth 2.0 Authorization Code</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {lang === 'PL'
                    ? 'Autoryzacja za pośrednictwem oficjalnej strony logowania Allegro. Brak konieczności wprowadzania hasła do Allegro w aplikacji.'
                    : 'Standard OAuth 2.0 protocol. Users authenticate on Allegro\'s official login page; user passwords are never handled.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>Szyfrowanie TLS 1.3 / HTTPS</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {lang === 'PL'
                    ? 'Wszystkie połączenia do api.allegro.pl są realizowane wyłącznie przez bezpieczny kanał TLS z certyfikatem SSL.'
                    : 'End-to-end encrypted HTTPS traffic for all REST calls and token exchanges.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Token Refresh Mechanism</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {lang === 'PL'
                    ? 'Automatyczne odświeżanie tokenów dostępowych (12h) za pomocą refresh token, zgodnie ze standardem Allegro.'
                    : 'Automated 12-hour bearer token refresh using standard refresh token grant.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-950 font-mono text-[11px] space-y-1 text-slate-700 dark:text-zinc-300">
              <div className="font-bold text-slate-900 dark:text-white">Endpointy autoryzacyjne Allegro:</div>
              <div>• Autoryzacja użytkownika: <code className="text-[#FF5A00]">https://allegro.pl/auth/oauth/authorize</code></div>
              <div>• Wymiana kodu na token: <code className="text-[#FF5A00]">https://allegro.pl/auth/oauth/token</code></div>
              <div>• Główny REST API: <code className="text-[#FF5A00]">https://api.allegro.pl</code> (Accept: application/vnd.allegro.public.v1+json)</div>
            </div>
          </div>
        </section>

        {/* 3. Wymagane Uprawnienia (Requested Scopes) */}
        <section className={`p-6 rounded-3xl border space-y-3.5 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Key className="w-5 h-5 text-[#FF5A00]" />
            <h2>
              {lang === 'PL'
                ? '3. Wnioskowane Zakresy Uprawnień (Requested Scopes)'
                : lang === 'EN'
                ? '3. Requested OAuth 2.0 Scopes & Justification'
                : '3. Talep Edilen Allegro Yetki Kapsamları (Scopes)'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                  <th className="py-2.5 px-3 font-bold">Scope ID</th>
                  <th className="py-2.5 px-3 font-bold">Cel Wykorzystania (Purpose)</th>
                  <th className="py-2.5 px-3 font-bold">Główne Zasoby API</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                <tr>
                  <td className="py-2.5 px-3 text-[#FF5A00] font-bold">allegro:api:sale:offers:read</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-zinc-300">
                    Pobieranie listy ofert sprzedawcy, stanów magazynowych i aktualnych cen.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">GET /sale/offers</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#FF5A00] font-bold">allegro:api:sale:offers:write</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-zinc-300">
                    Tworzenie, wznawianie, kończenie ofert oraz masowa aktualizacja cen i stanów.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">POST /sale/offers, PATCH /sale/offers/*</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#FF5A00] font-bold">allegro:api:sale:categories</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-zinc-300">
                    Odczyt taksonomii drzewa kategorii Allegro i weryfikacja wymaganych parametrów.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">GET /sale/categories/*</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#FF5A00] font-bold">allegro:api:orders:read</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-zinc-300">
                    Pobieranie zamówień i formularzy dostawy (FOD) w celu realizacji wysyłki.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">GET /order/checkout-forms</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#FF5A00] font-bold">allegro:api:billing:read</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-zinc-300">
                    Odczyt zestawień billingowych, prowizji od sprzedaży i kalkulacja zysku.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">GET /billing/billing-entries</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Polityka Prywatności i Ochrona Danych (Privacy Policy & GDPR) */}
        <section id="privacy" className={`p-6 rounded-3xl border space-y-3.5 scroll-mt-6 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base border-b border-slate-100 dark:border-zinc-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2>
              {lang === 'PL'
                ? '4. Polityka Prywatności i Ochrona Danych Osobowych (Privacy Policy / RODO)'
                : lang === 'EN'
                ? '4. Privacy Policy & GDPR Compliance'
                : '4. Gizlilik Politikası ve Kişisel Verilerin Korunması (KVKK / GDPR)'}
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
            {lang === 'PL' ? (
              <>
                <p>
                  <strong>Zgodność z RODO / GDPR:</strong> Aplikacja przetwarza wyłącznie dane niezbędne do realizacji procesów sprzedażowych i wysyłkowych powiązanych z kontem sprzedawcy.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Dane osobowe kupujących:</strong> Pobrane z formularzy dostawy (FOD) dane kupującego (imię, nazwisko, adres dostawy, telefon) są wykorzystywane wyłącznie do wydruku etykiet i realizacji zamówienia.</li>
                  <li><strong>Brak odsprzedaży danych:</strong> Żadne dane nie są przekazywane, odsprzedawane ani udostępniane podmiotom trzecim.</li>
                  <li><strong>Bezpieczeństwo poświadczeń:</strong> Klucze Client ID, Client Secret oraz tokeny dostępowe są szyfrowane i przechowywane w zabezpieczonym magazynie sesji.</li>
                  <li><strong>Prawo do usunięcia:</strong> Sprzedawca w każdej chwili może odwołać token dostępu w ustawieniach konta Allegro lub usunąć dane z panelu.</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  <strong>Gizlilik ve Güvenlik Beyanı:</strong> Uygulama, satıcının Allegro mağazasındaki sipariş ve ürün verilerini yalnızca satıcının kendi operasyonel yönetimi amacıyla işler.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Alıcı müşteri bilgileri (isim, teslimat adresi, telefon) yalnızca kargo ve teslimat süreçlerinin yürütülmesi için kullanılır.</li>
                  <li>Hiçbir veri üçüncü taraflarla paylaşılmaz, satılmaz veya harici analiz şirketlerine aktarılmaz.</li>
                  <li>API anahtarları ve OAuth tokenları şifreli olarak saklanır ve tarayıcıda doğrudan düz metin olarak dışa açılmaz.</li>
                </ul>
              </>
            )}
          </div>
        </section>

        {/* 5. Kontakt i Wsparcie Techniczne (Contact & Support) */}
        <section className={`p-6 rounded-3xl border space-y-3.5 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2>
              {lang === 'PL'
                ? '5. Dane Kontaktowe Dewelopera i Wsparcie (Contact & Technical Support)'
                : lang === 'EN'
                ? '5. Developer Contact & Support'
                : '5. İletişim & Teknik Destek Bilgileri'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Wsparcie Techniczne / E-Mail:</span>
              <a
                href={`mailto:${developerEmail}`}
                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 underline font-mono text-xs"
              >
                {developerEmail}
              </a>
            </div>

            <div className="space-y-1 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Platforma / System:</span>
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                OmniChannel Marketplace Hub (Jiguli)
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Notice */}
      <div className="text-center text-xs text-slate-400 font-mono pt-4 border-t border-slate-200 dark:border-zinc-800">
        Allegro REST API Integration Documentation · Generated for apps.developer.allegro.pl application verification
      </div>
    </div>
  );
};
