import React, { useState, useEffect } from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Share2,
  Sparkles,
  Settings,
  Layers,
  TrendingUp,
  MessageSquare,
  Zap,
  X,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight,
  BookOpen
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroConfig } from '../../types/allegro';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSourcing?: () => void;
  onOpenAuth: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  theme?: 'light' | 'dark';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSourcing,
  onOpenAuth,
  isMobileOpen = false,
  onCloseMobile = () => {},
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [allegroConfig, setAllegroConfig] = useState<AllegroConfig>(store.getAllegroConfig());
  const [slogan, setSlogan] = useState<string>(store.getSlogan());

  useEffect(() => {
    return store.subscribe(() => {
      setAllegroConfig(store.getAllegroConfig());
      setSlogan(store.getSlogan());
    });
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      icon: Home
    },
    {
      id: 'aliexpress',
      label: 'Görselle Ürün Bul',
      icon: Sparkles
    },
    {
      id: 'offers',
      label: 'Ürünler & Stok',
      icon: Package
    },
    {
      id: 'orders',
      label: 'Siparişler & Kargo',
      icon: ShoppingCart
    },
    {
      id: 'repricer',
      label: 'Repricer & BuyBox',
      icon: TrendingUp
    },
    {
      id: 'customercare',
      label: 'Müşteri & İade',
      icon: MessageSquare
    },
    {
      id: 'automations',
      label: 'Otomasyon Kuralları',
      icon: Zap
    },
    {
      id: 'baselinker',
      label: 'BaseLinker Hub',
      icon: Layers
    },
    {
      id: 'channels',
      label: 'Pazaryerleri',
      icon: Share2
    },
    {
      id: 'database',
      label: 'MySQL Kurulum & DB',
      icon: Database
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings
    },
    {
      id: 'allegrodocs',
      label: 'Allegro API Dokümanı',
      icon: BookOpen
    }
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const renderNavContent = (isMobile: boolean = false) => {
    // On mobile drawer, never collapse; always show full labels, brand, and clean layout
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <div className="flex flex-col justify-between h-full w-full">
        {/* Top Header & Scrollable Nav Items */}
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {/* Brand Header with Editable Slogan */}
          <div className="flex items-center justify-between shrink-0 pb-4 w-full">
            <div
              className="cursor-pointer group flex items-center min-w-0"
              onClick={() => handleTabClick('dashboard')}
              title={`Jiguli - ${slogan}`}
            >
              {/* Çerçevesiz Siyah Ok (Tamamen çerçevesiz, arka plansız ve ikonlarla hizalı) */}
              <div className="w-10 h-10 shrink-0 flex items-center justify-center text-2xl font-black text-[#14171A] dark:text-white select-none">
                <span className="brand-logo-arrow font-bold text-2xl leading-none">↗</span>
              </div>

              {/* Brand Name & Slogan - Always visible on mobile, accordion on desktop */}
              <div
                className={`sidebar-logo-accordion overflow-hidden whitespace-nowrap ${
                  collapsed
                    ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                    : 'max-w-[200px] opacity-100 translate-x-0 pl-1.5'
                }`}
              >
                <div className="text-2xl font-black tracking-tight text-[#14171A] dark:text-white leading-none">
                  Jiguli
                </div>
                <div className="text-[11px] font-semibold text-[#5D7079] dark:text-slate-400 truncate mt-1">
                  "{slogan}"
                </div>
              </div>
            </div>

            {/* Close button inside mobile drawer */}
            {isMobile && (
              <button
                onClick={onCloseMobile}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                aria-label="Menüyü Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links - Scrollable Middle Area with Rock-Solid Icon Alignment */}
          <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1 pt-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center h-10 rounded-2xl text-xs font-medium transition-colors duration-150 text-left cursor-pointer group ${
                    isActive
                      ? 'bg-[#F4F5F7] dark:bg-slate-800 text-[#14171A] dark:text-white font-bold shadow-2xs'
                      : 'text-[#5D7079] dark:text-slate-400 hover:bg-[#F7F8F9] dark:hover:bg-slate-800/60 hover:text-[#14171A] dark:hover:text-white'
                  }`}
                >
                  {/* Fixed-width Icon Slot (40px) - Center point NEVER shifts! */}
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? 'text-[#14171A] dark:text-white stroke-[2.2]'
                          : 'text-[#7D8F99] dark:text-slate-400 group-hover:text-[#14171A] dark:group-hover:text-white'
                      }`}
                    />
                  </div>

                  {/* Text Label - Always visible on mobile, collapses with smooth slide on desktop */}
                  <span
                    className={`sidebar-label-accordion whitespace-nowrap overflow-hidden inline-block ${
                      collapsed
                        ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                        : 'max-w-[200px] opacity-100 translate-x-0 pr-2 font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pinned Collapse Button at the Absolute Bottom (Desktop only!) */}
        {!isMobile && onToggleCollapse && (
          <div className="shrink-0 pt-3 pb-1 border-t border-slate-100 dark:border-zinc-800 flex items-center w-full">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 shrink-0 rounded-2xl bg-[#F4F5F7] dark:bg-slate-800 hover:bg-[#E5E8EC] dark:hover:bg-slate-700 text-[#5D7079] hover:text-[#14171A] dark:hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xs active:scale-95 group focus:outline-none"
              title={collapsed ? 'Menüyü Genişlet (Akordeon Aç)' : 'Menüyü Daralt (Akordeon Kapat)'}
              aria-label={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
            >
              <div className={`sidebar-toggle-chevron ${collapsed ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronsLeft className="w-5 h-5 text-[#163300] dark:text-[#9FE870] group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar - Pinned Full Height with Accordion Sliding Transition */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#0B0F19] shrink-0 h-screen sticky top-0 self-start sidebar-accordion-slider overflow-hidden z-30 select-none px-4 py-4 ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer with Smooth Slide Transition */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay with blur */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
        />

        {/* Sliding Drawer Panel */}
        <div
          className={`relative w-4/5 max-w-xs bg-white dark:bg-[#0B0F19] h-full p-5 shadow-2xl z-10 flex flex-col justify-between transform transition-transform duration-300 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {renderNavContent(true)}
        </div>
      </div>

      {/* Ultra-Clean Modern Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex justify-around items-center shadow-lg safe-area-pb">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[48px] min-h-[46px] transition-colors cursor-pointer ${
            currentTab === 'dashboard' ? 'text-[#14171A] font-bold' : 'text-[#7D8F99]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Ana Sayfa</span>
        </button>

        <button
          onClick={() => onSelectTab('offers')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[48px] min-h-[46px] transition-colors cursor-pointer ${
            currentTab === 'offers' ? 'text-[#14171A] font-bold' : 'text-[#7D8F99]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Ürünler</span>
        </button>

        {/* Center Sourcing Floating Action Button */}
        <button
          onClick={() => onSelectTab('aliexpress')}
          className="flex flex-col items-center justify-center -mt-5 bg-[#9FE870] text-[#163300] p-3 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer border-2 border-white min-w-[48px] min-h-[48px]"
          title="Görselle Ürün Bul"
        >
          <Sparkles className="w-5 h-5 text-[#163300]" />
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[48px] min-h-[46px] transition-colors cursor-pointer ${
            currentTab === 'orders' ? 'text-[#14171A] font-bold' : 'text-[#7D8F99]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Sipariş</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[48px] min-h-[46px] transition-colors cursor-pointer ${
            currentTab === 'settings' ? 'text-[#14171A] font-bold' : 'text-[#7D8F99]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Ayarlar</span>
        </button>
      </nav>
    </>
  );
};

