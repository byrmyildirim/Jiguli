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
import { LoginView } from './components/auth/LoginView';

function MainAppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  // Fetch live exchange rates directly from TCMB on mount
  useEffect(() => {
    tcmbService.fetchLiveRates();
  }, []);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
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
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
            }
            setCurrentTab('settings');
          }}
        />
      </div>
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
        onSelectTab={setCurrentTab}
        onOpenSourcing={() => setCurrentTab('aliexpress')}
        onOpenAuth={() => setCurrentTab('settings')}
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
          onSelectTab={setCurrentTab}
          onOpenAuth={() => setCurrentTab('settings')}
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
                onNavigate={setCurrentTab}
                onOpenCreateOffer={() => setIsCreateOfferModalOpen(true)}
                onOpenAuth={() => setCurrentTab('settings')}
                theme={theme}
              />
            )}

            {currentTab === 'aliexpress' && (
              <AliExpressSourcingView
                onNavigateToOffers={() => setCurrentTab('offers')}
                theme={theme}
              />
            )}

            {currentTab === 'offers' && (
              <OffersView
                onOpenCreateOffer={() => setIsCreateOfferModalOpen(true)}
                onNavigateToSourcing={() => setCurrentTab('aliexpress')}
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
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'allegrodocs' && (
              <AllegroDocsView
                theme={theme}
                onBackToApp={() => setCurrentTab('settings')}
              />
            )}

            {currentTab === 'channels' && (
              <ChannelsView
                onConfigurePlatform={(platform) => setSelectedPlatform(platform)}
                onOpenAllegroAuth={() => setCurrentTab('settings')}
                theme={theme}
              />
            )}

            {currentTab === 'database' && (
              <DatabaseSetupView
                theme={theme}
              />
            )}

            {currentTab === 'baselinker' && (
              <BaseLinkerHubView
                onConfigureBaseLinker={() => {
                  const blPlatform = store.getPlatforms().find(p => p.id === 'baselinker');
                  if (blPlatform) setSelectedPlatform(blPlatform);
                }}
                onNavigateToOrders={() => setCurrentTab('orders')}
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
                onNavigateToOffers={() => setCurrentTab('offers')}
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
