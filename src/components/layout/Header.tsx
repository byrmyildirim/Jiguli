import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  Plus,
  Package,
  ShoppingCart,
  Sparkles,
  ShieldCheck,
  Settings,
  X,
  Menu,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroConfig } from '../../types/allegro';
import { CurrencySwitcher } from './CurrencySwitcher';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenCreateOffer: () => void;
  onToggleMobileMenu?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

interface NotificationItem {
  id: string;
  type: 'order' | 'stock' | 'sourcing' | 'api';
  title: string;
  description: string;
  time: string;
  read: boolean;
  targetTab?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'order',
    title: 'Yeni Allegro Siparişi',
    description: 'Sipariş #39281-PL ödendi. InPost Paczkomat için etiket oluşturulabilir.',
    time: '4 dk önce',
    read: false,
    targetTab: 'orders'
  },
  {
    id: 'n-2',
    type: 'stock',
    title: 'Kritik Stok Uyarısı',
    description: 'Hi-Fi Bluetooth Hoparlör stoğu 8 adede düştü.',
    time: '24 dk önce',
    read: false,
    targetTab: 'offers'
  },
  {
    id: 'n-3',
    type: 'api',
    title: 'Allegro Token Yenilendi',
    description: 'OAuth2 bearer erişim jetonu 30 gün uzatıldı.',
    time: '1 saat önce',
    read: true,
    targetTab: 'settings'
  }
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenCreateOffer,
  onToggleMobileMenu,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse
}) => {
  const { theme: ctxTheme, toggleTheme: ctxToggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const activeTheme = propTheme || ctxTheme;
  const handleToggleTheme = propToggleTheme || ctxToggleTheme;

  const [allegroConfig, setAllegroConfig] = useState<AllegroConfig>(store.getAllegroConfig());
  const [slogan, setSlogan] = useState<string>(store.getSlogan());
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setAllegroConfig(store.getAllegroConfig());
      setSlogan(store.getSlogan());
    });
  }, []);

  // Close floating popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.targetTab) {
      onSelectTab(item.targetTab);
    }
    setIsNotificationOpen(false);
  };

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0B0F19] shrink-0 sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Hamburger / Desktop Collapse Toggle & Dynamic Page Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F4F5F7] dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
            aria-label="Menüyü Aç"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="md:hidden flex flex-col">
          <div className="flex items-center text-lg font-black tracking-tight text-[#14171A] dark:text-white">
            <span className="text-[#163300] dark:text-[#9FE870] mr-1 font-bold brand-logo-arrow">↗</span>Jiguli
          </div>
          <span className="text-[10px] text-[#5D7079] dark:text-slate-400 font-medium tracking-tight -mt-0.5 truncate max-w-[170px]">
            "{slogan}"
          </span>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span className="text-[#14171A] dark:text-white font-bold">
            {currentTab === 'dashboard' && 'Ana Sayfa'}
            {currentTab === 'aliexpress' && 'Görselle Ürün Bul & Tedarik'}
            {currentTab === 'offers' && 'Ürünler & Stok'}
            {currentTab === 'orders' && 'Siparişler & Kargo'}
            {currentTab === 'repricer' && 'Repricer & BuyBox'}
            {currentTab === 'customercare' && 'Müşteri & İade'}
            {currentTab === 'automations' && 'Otomasyon Kuralları'}
            {currentTab === 'baselinker' && 'BaseLinker Hub'}
            {currentTab === 'channels' && 'Pazaryerleri'}
            {currentTab === 'settings' && 'Ayarlar'}
            {currentTab === 'categories' && 'Kategori Eşleme'}
            {currentTab === 'syncrules' && 'Senkronizasyon Kuralları'}
            {currentTab === 'apiconsole' && 'API Konsolu'}
            {currentTab === 'apilogs' && 'API & Webhook Logları'}
          </span>
        </div>
      </div>

      {/* Right Control Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Currency Switcher (Visible on desktop; on mobile it is inside the slide-out menu) */}
        <div className="hidden md:flex">
          <CurrencySwitcher />
        </div>

        {/* Global Dark / Light Mode Toggle Button */}
        <button
          onClick={handleToggleTheme}
          className="w-9 h-9 rounded-full bg-[#F4F5F7] hover:bg-[#E5E8EC] flex items-center justify-center text-[#14171A] relative transition-all duration-200 cursor-pointer group"
          title={activeTheme === 'dark' ? 'Açık Moda Geç' : 'Karanlık Modu Aç'}
          aria-label={activeTheme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}
        >
          {activeTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-200" />
          )}
        </button>

        {/* Notification Bell with Floating Popover */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setIsNotificationOpen(prev => !prev);
              setIsProfileMenuOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-[#F4F5F7] hover:bg-[#E5E8EC] flex items-center justify-center text-[#14171A] relative transition-colors cursor-pointer"
            aria-label="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            )}
          </button>

          {/* Floating Baloncuk (Speech-bubble Popover) */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="absolute -top-1.5 right-3.5 w-3 h-3 bg-white border-t border-l border-slate-200/90 rotate-45" />

              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#14171A]">Bildirimler</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9FE870]/40 text-[#163300]">
                      {unreadCount} yeni
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-medium text-[#5D7079] hover:text-[#14171A] cursor-pointer transition-colors"
                    >
                      Tümünü okundu yap
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Henüz yeni bildirim bulunmuyor.
                  </div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-[#F7F8F9] transition-colors cursor-pointer ${
                        !item.read ? 'bg-[#FAFCF8]' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center shrink-0 mt-0.5 text-[#14171A]">
                        {item.type === 'order' && <ShoppingCart className="w-4 h-4 text-[#163300]" />}
                        {item.type === 'stock' && <Package className="w-4 h-4 text-amber-600" />}
                        {item.type === 'sourcing' && <Sparkles className="w-4 h-4 text-[#163300]" />}
                        {item.type === 'api' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-semibold truncate ${
                            !item.read ? 'text-[#14171A] font-bold' : 'text-[#5D7079]'
                          }`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5D7079] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {!item.read && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    onSelectTab('orders');
                    setIsNotificationOpen(false);
                  }}
                  className="text-xs font-bold text-[#14171A] hover:underline cursor-pointer"
                >
                  Sipariş Akışını Gör →
                </button>
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setIsNotificationOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Ayarlar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileMenuOpen(prev => !prev);
              setIsNotificationOpen(false);
            }}
            className="h-9 px-3 rounded-full bg-[#F2F4F7] hover:bg-[#E5E8EC] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-[#14171A] text-white text-[10px] font-bold flex items-center justify-center">
              ÇY
            </div>
            <span className="text-xs font-semibold text-[#14171A] hidden md:inline">
              Çağla Y.
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5D7079]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-[#14171A] dark:text-white">
                  {user?.name || 'Çağla Yurtseven'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  @{allegroConfig.sellerLogin || user?.username || 'demo'}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-[#14171A] hover:bg-[#F4F5F7] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#7D8F99]" />
                  <span>Sistem & Mağaza Ayarları</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('channels');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-[#14171A] hover:bg-[#F4F5F7] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#7D8F99]" />
                  <span>Pazaryeri Bağlantıları</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Oturumu Kapat (Çıkış)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
