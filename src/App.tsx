import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { OffersView } from './components/views/OffersView';
import { OrdersView } from './components/views/OrdersView';
import { RepricingView } from './components/views/RepricingView';
import { CustomerCareView } from './components/views/CustomerCareView';
import { AutomationRulesView } from './components/views/AutomationRulesView';
import { SettingsView } from './components/views/SettingsView';
import { ApiConsoleView } from './components/views/ApiConsoleView';
import { CategoriesView } from './components/views/CategoriesView';
import { ChannelsView } from './components/views/ChannelsView';
import { BaseLinkerHubView } from './components/views/BaseLinkerHubView';
import { SyncRulesView } from './components/views/SyncRulesView';
import { ApiLogsView } from './components/views/ApiLogsView';
import { DatabaseSetupView } from './components/views/DatabaseSetupView';
import { AliExpressSourcingView } from './components/views/AliExpressSourcingView';
import { AllegroDocsView } from './components/views/AllegroDocsView';
import { AllegroAuthModal } from './components/modals/AllegroAuthModal';
import { CreateOfferModal } from './components/modals/CreateOfferModal';
import { OrderDetailsModal } from './components/modals/OrderDetailsModal';
import { ChannelConfigModal } from './components/modals/ChannelConfigModal';
import { AllegroCheckoutForm, PlatformConfig } from './types/allegro';
import { store } from './services/marketplaceStore';
import { tcmbService } from './services/tcmbService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InitialInstallationWizard } from './components/auth/InitialInstallationWizard';
import { LoginView } from './components/auth/LoginView';

export const TAB_CONFIG: Record<string, { path: string; title: string }> = {
  dashboard: { path: '/', title: 'Jiguli - Ana Sayfa & Satış Özeti' },
  aliexpress: { path: '/sourcing', title: 'Jiguli - Görselle Ürün Bul & Kaynak' },
  offers: { path: '/offers', title: 'Jiguli - Ürünler & Stok Yönetimi' },
  orders: { path: '/orders', title: 'Jiguli - Siparişler & Lojistik' },
  repricer: { path: '/repricer', title: 'Jiguli - Repricer & BuyBox' },
  customercare: { path: '/customer-care', title: 'Jiguli - Müşteri & İade' },
  automations: { path: '/automations', title: 'Jiguli - Otomasyon Kuralları' },
  baselinker: { path: '/baselinker', title: 'BaseLinker Hub' },
  channels: { path: '/channels', title: 'Pazaryerleri' },
  settings: { path: '/settings', title: 'Ayarlar' },
  allegrodocs: { path: '/allegro-docs', title: 'Allegro API Dokümanı' },
  categories: { path: '/categories', title: 'Kategoriler & Eşleme' },
  syncrules: { path: '/sync-rules', title: 'Senkronizasyon Kuralları' },
  apilogs: { path: '/logs', title: 'API Logları' },
  apiconsole: { path: '/api-console', title: 'API Konsolu' }
};

export const PATH_TO_TAB_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/sourcing': 'aliexpress',
  '/aliexpress': 'aliexpress',
  '/offers': 'offers',
  '/products': 'offers',
  '/urunler': 'offers',
  '/orders': 'orders',
  '/siparisler': 'orders',
  '/repricer': 'repricer',
  '/customer-care': 'customercare',
  '/customercare': 'customercare',
  '/automations': 'automations',
  '/otomasyon': 'automations',
  '/baselinker': 'baselinker',
  '/channels': 'channels',
  '/pazaryerleri': 'channels',
  '/database': 'settings',
  '/veritabani': 'settings',
  '/settings': 'settings',
  '/ayarlar': 'settings',
  '/allegro-docs': 'allegrodocs',
  '/docs': 'allegrodocs',
  '/categories': 'categories',
  '/kategoriler': 'categories',
  '/sync-rules': 'syncrules',
  '/syncrules': 'syncrules',
  '/logs': 'apilogs',
  '/apilogs': 'apilogs',
  '/api-console': 'apiconsole',
  '/apiconsole': 'apiconsole'
};

export function getTabFromPathname(pathname: string): string {
  const norm = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (PATH_TO_TAB_MAP[norm]) return PATH_TO_TAB_MAP[norm];
  for (const [prefix, tab] of Object.entries(PATH_TO_TAB_MAP)) {
    if (prefix !== '/' && norm.startsWith(prefix)) return tab;
  }
  return 'dashboard';
}

function MainAppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const [isCheckingSystem, setIsCheckingSystem] = useState(true);
  const [isSystemInstalled, setIsSystemInstalled] = useState<boolean>(true);

  // Read initial tab from URL bar
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPathname(window.location.pathname);
    }
    return 'dashboard';
  });

  const navigateToTab = (targetTab: string, replace = false) => {
    setCurrentTab(targetTab);
    if (typeof window !== 'undefined') {
      const cfg = TAB_CONFIG[targetTab] || { path: `/${targetTab}`, title: targetTab };
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const targetPath = cfg.path;

      if (currentPath !== targetPath) {
        if (replace) {
          window.history.replaceState({ tab: targetTab }, '', targetPath);
        } else {
          window.history.pushState({ tab: targetTab }, '', targetPath);
        }
      }
      document.title = `${store.getBrandName()} - ${cfg.title}`;
    }
  };

  // Sync with browser Back and Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPathname(window.location.pathname);
      setCurrentTab(tab);
      const cfg = TAB_CONFIG[tab];
      if (cfg && typeof document !== 'undefined') {
        document.title = `${store.getBrandName()} - ${cfg.title}`;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update initial title
  useEffect(() => {
    const cfg = TAB_CONFIG[currentTab];
    if (cfg && typeof document !== 'undefined') {
      document.title = `${store.getBrandName()} - ${cfg.title}`;
    }
  }, [currentTab]);

  // Fetch live exchange rates directly from TCMB on mount & check system status & sync DB
  useEffect(() => {
    tcmbService.fetchLiveRates();
    store.initFromDatabase();

    const checkStatus = async () => {
      try {
        const localInstalled = localStorage.getItem('jiguli_system_installed') === 'true';
        const res = await fetch('/api/system/status');
        const data = await res.json();
        if (localInstalled || (data && data.isInstalled === true)) {
          setIsSystemInstalled(true);
          try {
            localStorage.setItem('jiguli_system_installed', 'true');
          } catch {}
        } else {
          setIsSystemInstalled(false);
        }
      } catch {
        const localInstalled = localStorage.getItem('jiguli_system_installed') === 'true';
        setIsSystemInstalled(localInstalled);
      } finally {
        setIsCheckingSystem(false);
      }
    };

    checkStatus();
  }, []);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jiguli_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('jiguli_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false);
  const [selectedEmagCategoryForNewOffer, setSelectedEmagCategoryForNewOffer] = useState<string | number | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<AllegroCheckoutForm | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);

  // Public documentation access for apps.developer.allegro.pl review & verification
  const isPublicDocsUrl = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/docs') ||
    window.location.pathname.startsWith('/allegro-docs') ||
    new URLSearchParams(window.location.search).get('tab') === 'allegrodocs' ||
    new URLSearchParams(window.location.search).get('page') === 'allegro-docs'
  );

  if (isPublicDocsUrl) {
    return (
      <div className={`min-h-screen p-4 sm:p-8 ${theme === 'dark' ? 'bg-[#0B0F19]' : 'bg-slate-50'}`}>
        <AllegroDocsView
          theme={theme}
          onBackToApp={() => {
            navigateToTab('settings');
          }}
        />
      </div>
    );
  }

  // If checking system status on initial load, show sleek loader
  if (isCheckingSystem) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center ${theme === 'dark' ? 'bg-[#0B0F19]' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#9FE870] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Jiguli Sistem Kontrolü...</span>
        </div>
      </div>
    );
  }

  // If system has not been installed yet, force Initial Installation Wizard
  if (!isSystemInstalled) {
    return (
      <InitialInstallationWizard
        onInstallationComplete={() => {
          setIsSystemInstalled(true);
        }}
      />
    );
  }

  // If user is not logged in, render the Login Screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row font-sans selection:bg-[#9FE870]/60 selection:text-[#163300] ${
      theme === 'dark' ? 'bg-[#0B0F19] text-[#F8FAFC]' : 'bg-white text-[#14171A]'
    }`}>
      {/* Left Sidebar (Desktop + Mobile Drawer + Bottom Nav) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={navigateToTab}
        onOpenSourcing={() => navigateToTab('aliexpress')}
        onOpenAuth={() => navigateToTab('settings')}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        theme={theme}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />

      {/* Main Full-Width Content Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${
        theme === 'dark' ? 'bg-[#0B0F19]' : 'bg-white'
      }`}>
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={navigateToTab}
          onOpenAuth={() => navigateToTab('settings')}
          onOpenCreateOffer={() => setIsCreateOfferModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileDrawerOpen(prev => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={toggleSidebarCollapsed}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 md:pb-10 overflow-y-auto w-full">
          <div className="w-full">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigate={navigateToTab}
                onOpenCreateOffer={() => setIsCreateOfferModalOpen(true)}
                onOpenAuth={() => navigateToTab('settings')}
                theme={theme}
              />
            )}

            {currentTab === 'aliexpress' && (
              <AliExpressSourcingView
                onNavigateToOffers={() => navigateToTab('offers')}
                theme={theme}
              />
            )}

            {currentTab === 'offers' && (
              <OffersView
                onOpenCreateOffer={() => setIsCreateOfferModalOpen(true)}
                onNavigateToSourcing={() => navigateToTab('aliexpress')}
                onNavigateToSettings={() => navigateToTab('settings')}
                theme={theme}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersView
                onSelectOrder={(order) => setSelectedOrder(order)}
                theme={theme}
              />
            )}

            {currentTab === 'repricer' && (
              <RepricingView
                theme={theme}
              />
            )}

            {currentTab === 'customercare' && (
              <CustomerCareView
                theme={theme}
              />
            )}

            {currentTab === 'automations' && (
              <AutomationRulesView
                theme={theme}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                theme={theme}
                onNavigateToTab={(tab) => navigateToTab(tab)}
              />
            )}

            {currentTab === 'allegrodocs' && (
              <AllegroDocsView
                theme={theme}
                onBackToApp={() => navigateToTab('settings')}
              />
            )}

            {currentTab === 'channels' && (
              <ChannelsView
                onConfigurePlatform={(platform) => setSelectedPlatform(platform)}
                onOpenAllegroAuth={() => navigateToTab('settings')}
                theme={theme}
              />
            )}

            {currentTab === 'baselinker' && (
              <BaseLinkerHubView
                onConfigureBaseLinker={() => {
                  const blPlatform = store.getPlatforms().find(p => p.id === 'baselinker');
                  if (blPlatform) setSelectedPlatform(blPlatform);
                }}
                onNavigateToOrders={() => navigateToTab('orders')}
                theme={theme}
              />
            )}

            {currentTab === 'apiconsole' && (
              <ApiConsoleView
                theme={theme}
              />
            )}

            {currentTab === 'categories' && (
              <CategoriesView
                theme={theme}
                onOpenCreateOffer={(catId) => {
                  setSelectedEmagCategoryForNewOffer(catId);
                  setIsCreateOfferModalOpen(true);
                }}
                onNavigateToOffers={() => navigateToTab('offers')}
              />
            )}

            {currentTab === 'syncrules' && (
              <SyncRulesView
                theme={theme}
              />
            )}

            {currentTab === 'apilogs' && (
              <ApiLogsView
                theme={theme}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AllegroAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        theme={theme}
      />

      <CreateOfferModal
        isOpen={isCreateOfferModalOpen}
        onClose={() => {
          setIsCreateOfferModalOpen(false);
          setSelectedEmagCategoryForNewOffer(undefined);
        }}
        initialEmagCategoryId={selectedEmagCategoryForNewOffer}
        theme={theme}
      />

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        theme={theme}
      />

      <ChannelConfigModal
        platform={selectedPlatform}
        onClose={() => setSelectedPlatform(null)}
        theme={theme}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
