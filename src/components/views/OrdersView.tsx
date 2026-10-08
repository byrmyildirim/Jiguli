import React, { useState } from 'react';
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  PackageCheck,
  Send,
  Building2,
  MapPin,
  Printer,
  Download,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroCheckoutForm } from '../../types/allegro';
import { ShippingLabelModal } from '../modals/ShippingLabelModal';
import { InvoiceModal } from '../modals/InvoiceModal';
import { ResetPanelModal } from '../modals/ResetPanelModal';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface OrdersViewProps {
  onSelectOrder: (order: AllegroCheckoutForm) => void;
  theme?: 'light' | 'dark';
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onSelectOrder, theme = 'light' }) => {
  const [orders, setOrders] = useState<AllegroCheckoutForm[]>(store.getOrders());
  const [activeCurrency, setActiveCurrency] = useState(store.getActiveCurrency());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Modals state
  const [shippingLabelOrder, setShippingLabelOrder] = useState<AllegroCheckoutForm | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<AllegroCheckoutForm | null>(null);

  React.useEffect(() => {
    return store.subscribe(() => {
      setOrders(store.getOrders());
      setActiveCurrency(store.getActiveCurrency());
    });
  }, []);

  const [isSyncingEmag, setIsSyncingEmag] = useState(false);
  const [isSyncingAllegro, setIsSyncingAllegro] = useState(false);
  const [isSyncingBaseLinker, setIsSyncingBaseLinker] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const isDark = theme === 'dark';

  const handleFetchEmagOrders = async () => {
    setIsSyncingEmag(true);
    const result = await store.fetchEmagOrders();
    setIsSyncingEmag(false);
    if (result.success) {
      setSyncNotice(`🟢 eMAG mağazanızdan ${result.count} canlı sipariş güncellendi!`);
    } else {
      setSyncNotice(`⚠️ eMAG Sipariş Hatası: ${result.message}`);
    }
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleFetchAllegroOrders = async () => {
    setIsSyncingAllegro(true);
    const result = await store.fetchAllegroOrders();
    setIsSyncingAllegro(false);
    if (result.success) {
      setSyncNotice(`🟢 Allegro mağazanızdan ${result.count} canlı sipariş başarıyla çekildi!`);
    } else {
      setSyncNotice(`⚠️ Allegro Sipariş Hatası: ${result.message}`);
    }
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleFetchBaseLinkerOrders = async () => {
    setIsSyncingBaseLinker(true);
    const result = await store.fetchBaseLinkerOrders();
    setIsSyncingBaseLinker(false);
    if (result.success) {
      setSyncNotice(`🟢 BaseLinker havuzundan ${result.count} sipariş başarıyla çekildi!`);
    } else {
      setSyncNotice(`⚠️ BaseLinker Sipariş Hatası: ${result.message}`);
    }
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleFetchAllOrders = async () => {
    setIsSyncingAll(true);
    const result = await store.fetchAllMarketplacesOrders();
    setIsSyncingAll(false);
    if (result.success) {
      setSyncNotice(`🟢 Tüm pazaryerlerinden toplam ${result.totalCount} canlı sipariş başarıyla çekildi!`);
    } else {
      setSyncNotice(`⚠️ Sipariş Çekme Sonucu: ${result.results.map(r => `${r.platform}: ${r.message}`).join(' | ')}`);
    }
    setTimeout(() => setSyncNotice(null), 6000);
  };

  const handleUpdateStatus = (
    orderId: string,
    status: 'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT'
  ) => {
    store.updateOrderFulfillment(orderId, status);
  };

  const filteredOrders = orders.filter((order) => {
    const buyerLogin = order.buyer?.login || '';
    const buyerEmail = order.buyer?.email || '';
    const buyerComp = order.buyer?.companyName || '';
    const trackingNo = order.fulfillment?.trackingNumber || '';

    const matchesSearch =
      (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      buyerLogin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyerComp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trackingNo.includes(searchQuery);

    if (!matchesSearch) return false;
    if (channelFilter !== 'ALL' && order.platform !== channelFilter) return false;
    const orderStatus = order.fulfillment?.status || 'NEW';
    if (statusFilter !== 'ALL' && orderStatus !== statusFilter) return false;
    const carrier = order.delivery?.method?.carrier || 'InPost';
    if (carrierFilter !== 'ALL' && carrier !== carrierFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight">
            Siparişler & Lojistik
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Allegro, eMAG ve BaseLinker sipariş akışı, InPost kargo etiketleri ve faturalar
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          {/* 1. eMAG Sipariş Çek */}
          <button
            onClick={handleFetchEmagOrders}
            disabled={isSyncingEmag}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="eMAG güncel siparişlerini çeker"
          >
            <MarketplaceLogo platform="emag" size="xs" rounded="md" />
            <Download className={`w-3.5 h-3.5 text-slate-400 ${isSyncingEmag ? 'animate-bounce' : ''}`} />
            <span>{isSyncingEmag ? 'Çekiliyor...' : 'eMAG'}</span>
          </button>

          {/* 2. Allegro Sipariş Çek */}
          <button
            onClick={handleFetchAllegroOrders}
            disabled={isSyncingAllegro}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="Allegro yeni ve işleme hazır siparişlerini çeker"
          >
            <MarketplaceLogo platform="allegro" size="xs" rounded="md" />
            <Download className={`w-3.5 h-3.5 text-slate-400 ${isSyncingAllegro ? 'animate-bounce' : ''}`} />
            <span>{isSyncingAllegro ? 'Çekiliyor...' : 'Allegro'}</span>
          </button>

          {/* 3. BaseLinker Sipariş Çek */}
          <button
            onClick={handleFetchBaseLinkerOrders}
            disabled={isSyncingBaseLinker}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="BaseLinker sipariş havuzundan tüm siparişleri çeker"
          >
            <MarketplaceLogo platform="baselinker" size="xs" rounded="md" />
            <Download className={`w-3.5 h-3.5 text-slate-400 ${isSyncingBaseLinker ? 'animate-bounce' : ''}`} />
            <span>{isSyncingBaseLinker ? 'Çekiliyor...' : 'BaseLinker'}</span>
          </button>

          {/* 4. Tüm Siparişleri Çek */}
          <button
            onClick={handleFetchAllOrders}
            disabled={isSyncingAll}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs disabled:opacity-50"
            title="Tüm bağlı pazaryerlerinden aynı anda siparişleri çeker"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Çekiliyor...' : 'Tümünü Çek'}</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="px-2.5 py-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 text-slate-400 hover:text-rose-600 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
            title="Sadece Jiguli panelindeki yerel verileri sıfırlar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          <div className="text-xs font-mono font-medium text-slate-500 pl-1">
            Toplam: <strong className="text-slate-900 dark:text-zinc-100 font-bold">{orders.length} adet</strong>
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D8F99]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sipariş ID, Alıcı, E-posta veya Kargo Takip Kodu ile ara..."
            className="w-full bg-[#F4F5F7] rounded-full pl-10 pr-4 py-2 text-xs text-[#14171A] focus:outline-none focus:ring-2 focus:ring-[#9FE870] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {/* Channel selector */}
          <div className="flex items-center p-1 rounded-full bg-[#F4F5F7] shrink-0">
            <button
              onClick={() => setChannelFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                channelFilter === 'ALL'
                  ? 'bg-white text-[#14171A] shadow-xs font-bold'
                  : 'text-[#5D7079] hover:text-[#14171A]'
              }`}
            >
              Tüm Kanallar
            </button>
            <button
              onClick={() => setChannelFilter('allegro')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                channelFilter === 'allegro'
                  ? 'bg-[#FF5A00] text-white shadow-xs font-bold'
                  : 'text-[#FF5A00] hover:text-[#FF5A00]/80'
              }`}
            >
              Allegro
            </button>
            <button
              onClick={() => setChannelFilter('emag')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                channelFilter === 'emag'
                  ? 'bg-[#0056B3] text-white shadow-xs font-bold'
                  : 'text-[#0056B3] hover:text-[#0056B3]/80'
              }`}
            >
              eMAG
            </button>
          </div>

          {/* Status selector */}
          <div className="flex items-center p-1 rounded-full bg-[#F4F5F7] shrink-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-[#14171A] shadow-xs font-bold'
                  : 'text-[#5D7079] hover:text-[#14171A]'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('NEW')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                statusFilter === 'NEW'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-sky-700 hover:text-sky-800'
              }`}
            >
              Yeni
            </button>
            <button
              onClick={() => setStatusFilter('READY_FOR_SHIPMENT')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                statusFilter === 'READY_FOR_SHIPMENT'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-indigo-700 hover:text-indigo-800'
              }`}
            >
              Etiketli
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-10 sm:p-12 text-center text-xs space-y-3 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-bold text-xl shadow-2xs">
              🛒
            </div>
            <div className="font-bold text-sm text-slate-800">
              {orders.length === 0 ? 'Henüz Sipariş Çekilmedi (Canlı Pazaryeri Modu)' : 'Arama kriterlerine uygun sipariş bulunamadı.'}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {orders.length === 0
                ? 'Bağlı pazaryerlerinizdeki (eMAG, Allegro, BaseLinker) müşteri siparişlerini aşağıdaki butonlardan tek tıkla içeri aktarabilirsiniz.'
                : 'Filtreleri veya arama kriterini değiştirerek tekrar deneyebilirsiniz.'}
            </p>
            {orders.length === 0 && (
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                <button
                  onClick={handleFetchEmagOrders}
                  disabled={isSyncingEmag}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <MarketplaceLogo platform="emag" size="xs" rounded="md" />
                  <Download className={`w-3.5 h-3.5 text-slate-400 ${isSyncingEmag ? 'animate-bounce' : ''}`} />
                  <span>eMAG Siparişleri Çek</span>
                </button>
                <button
                  onClick={handleFetchAllegroOrders}
                  disabled={isSyncingAllegro}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <MarketplaceLogo platform="allegro" size="xs" rounded="md" />
                  <Download className={`w-3.5 h-3.5 text-slate-400 ${isSyncingAllegro ? 'animate-bounce' : ''}`} />
                  <span>Allegro Siparişleri Çek</span>
                </button>
                <button
                  onClick={handleFetchBaseLinkerOrders}
                  disabled={isSyncingBaseLinker}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <MarketplaceLogo platform="baselinker" size="xs" rounded="md" />
                  <Download className={`w-3.5 h-3.5 text-slate-400 ${isSyncingBaseLinker ? 'animate-bounce' : ''}`} />
                  <span>BaseLinker Siparişleri Çek</span>
                </button>
                <button
                  onClick={handleFetchAllOrders}
                  disabled={isSyncingAll}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>Tüm Siparişleri Çek</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isAllegro = order.platform === 'allegro';
            const orderStatus = order.fulfillment?.status || 'NEW';
            const isSent = orderStatus === 'SENT';
            const totalAmount = order.summary?.totalToPay?.amount || '0.00';
            const currency = order.summary?.totalToPay?.currency || activeCurrency;

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 transition-all"
              >
                {/* Order Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {order.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F4F5F7] text-[#14171A] border border-slate-200 flex items-center gap-1.5">
                      <MarketplaceLogo platform={order.platform || 'allegro'} size="xs" rounded="full" />
                      <span>{(order.platform || 'ALLEGRO').toUpperCase()}</span>
                    </span>
                    {order.delivery?.smart && (
                      <span className="font-extrabold text-[9px] text-[#163300] bg-[#9FE870]/40 px-2 py-0.5 rounded-full">
                        ALLEGRO SMART!
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt || Date.now()).toLocaleString('tr-TR')}
                    </span>
                  </div>

                  {/* Total Amount */}
                  <div className="text-right">
                    <div className="font-mono font-black text-sm tabular-nums text-slate-900">
                      {totalAmount} {currency}
                    </div>
                    {currency !== activeCurrency && (
                      <div className="text-[10px] font-mono text-slate-400">
                        ≈ {store.formatConverted(parseFloat(totalAmount))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Left: Line Items */}
                  <div className="space-y-1.5 md:col-span-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Sipariş Edilen Ürünler
                    </div>
                    {(order.lineItems || []).map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {item.offer?.name || 'Ürün'}
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-slate-500">
                          <span>Adet: <strong className="text-slate-900">{item.quantity}</strong></span>
                          <span>Birim: {item.price?.amount || '0.00'} {item.price?.currency || currency}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle: Delivery & Carrier Point */}
                  <div className="space-y-1.5 md:col-span-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-500">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      Teslimat & Kargo Noktası
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-semibold text-slate-900">
                        {order.delivery?.method?.name || 'Standart Kargo'}
                      </div>

                      {order.delivery?.pickupPoint && (
                        <div className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                          Nokta: {order.delivery.pickupPoint.id}
                        </div>
                      )}

                      {order.fulfillment?.trackingNumber && (
                        <div className="pt-1 text-[11px] font-mono text-slate-700 flex items-center justify-between">
                          <span>Kargo Takip:</span>
                          <strong className="text-slate-900 font-bold">{order.fulfillment.trackingNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Buyer Info */}
                  <div className="space-y-1.5 md:col-span-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Alıcı Bilgileri
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{order.buyer?.login || `${order.delivery?.address?.firstName || ''} ${order.delivery?.address?.lastName || ''}`.trim() || 'Müşteri'}</span>
                        <span className="text-[11px] text-slate-500 font-normal">{order.buyer?.email || ''}</span>
                      </div>

                      {order.buyer?.companyName && (
                        <div className="text-[11px] text-slate-600">
                          Firma: <strong className="text-slate-900">{order.buyer.companyName}</strong>
                          {order.buyer?.taxId && <span className="font-mono ml-1 font-bold text-[#FF5A00]">(NIP: {order.buyer.taxId})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Durum:</span>
                    {orderStatus === 'NEW' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-sky-800 bg-sky-100">
                        YENİ ALINDI
                      </span>
                    )}
                    {orderStatus === 'PROCESSING' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-100">
                        HAZIRLANIYOR
                      </span>
                    )}
                    {orderStatus === 'READY_FOR_SHIPMENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-800 bg-indigo-100">
                        KARGO ETİKETİ ÇIKARILDI
                      </span>
                    )}
                    {orderStatus === 'SENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100">
                        TESLİM EDİLDİ / KARGODA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* InPost / DPD Thermal Label Button */}
                    <button
                      onClick={() => setShippingLabelOrder(order)}
                      className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kargo Etiketi Yazdır</span>
                    </button>

                    {/* e-Invoice Button */}
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Faktura VAT (e-Fatura)</span>
                    </button>

                    {orderStatus === 'NEW' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                        className="px-4 py-1.5 rounded-full bg-[#14171A] hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer min-h-[40px]"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>İşleme Al</span>
                      </button>
                    )}

                    {orderStatus === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY_FOR_SHIPMENT')}
                        className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer min-h-[40px]"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Kargo Kodu Al</span>
                      </button>
                    )}

                    {orderStatus === 'READY_FOR_SHIPMENT' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SENT')}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer min-h-[40px]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kargoya Teslim Edildi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Shipping Label Modal */}
      {shippingLabelOrder && (
        <ShippingLabelModal
          order={shippingLabelOrder}
          onClose={() => setShippingLabelOrder(null)}
          theme={theme}
        />
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          theme={theme}
        />
      )}

      {/* JIGULI PANEL DATA RESET MODAL */}
      <ResetPanelModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={(msg) => {
          setSyncNotice(msg);
          setTimeout(() => setSyncNotice(null), 6000);
        }}
        theme={theme}
      />
    </div>
  );
};
