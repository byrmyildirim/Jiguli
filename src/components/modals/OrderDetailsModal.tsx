import React from 'react';
import {
  X,
  ShoppingCart,
  Truck,
  Building2,
  MapPin,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  Upload,
  ExternalLink
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { AllegroCheckoutForm } from '../../types/allegro';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface OrderDetailsModalProps {
  order: AllegroCheckoutForm | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, theme = 'light' }) => {
  const [invoiceUploaded, setInvoiceUploaded] = React.useState(false);

  if (!order) return null;

  const isDark = theme === 'dark';

  const handleAdvanceStatus = (
    status: 'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT'
  ) => {
    store.updateOrderFulfillment(order.id, status);
  };

  const handleSimulateInvoiceUpload = () => {
    setInvoiceUploaded(true);
    store.logApiCall({
      method: 'POST',
      endpoint: `/order/checkout-forms/${order.id}/invoices`,
      status: 201,
      durationMs: 220,
      requestHeaders: {
        'Content-Type': 'application/pdf',
        Accept: 'application/vnd.allegro.public.v1+json'
      },
      responseBody: {
        id: `inv-${Date.now()}`,
        status: 'ACCEPTED',
        fileName: `faktura-vat-${order.id}.pdf`
      },
      platform: 'allegro'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden shrink-0">
              <MarketplaceLogo platform={order.platform || 'allegro'} size="md" rounded="xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Sipariş & Kargo Detayları</h2>
                <span className={`font-mono text-xs px-2 py-0.5 rounded border font-bold ${
                  isDark ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : 'bg-slate-100 text-[#14171A] border-slate-200'
                }`}>
                  {order.id}
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {(order.platform || 'ALLEGRO').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sipariş Kayıt Tarihi: {new Date(order.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Fulfillment Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Kargo & Hazırlık Durumu
              </div>
              <div className="flex items-center gap-2 mt-1">
                {(order.fulfillment?.status || 'NEW') === 'NEW' && (
                  <span className="font-bold text-sky-600 dark:text-sky-400">YENİ ALINDI</span>
                )}
                {order.fulfillment?.status === 'PROCESSING' && (
                  <span className="font-bold text-amber-600 dark:text-amber-400">HAZIRLANIYOR</span>
                )}
                {order.fulfillment?.status === 'READY_FOR_SHIPMENT' && (
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">KARGO ETİKETİ ÇIKARILDI</span>
                )}
                {order.fulfillment?.status === 'SENT' && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">GÖNDERİLDİ</span>
                )}

                {order.fulfillment?.trackingNumber && (
                  <span className="font-mono text-[11px] text-slate-400">
                    · Takip No: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{order.fulfillment.trackingNumber}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(order.fulfillment?.status || 'NEW') === 'NEW' && (
                <button
                  onClick={() => handleAdvanceStatus('PROCESSING')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    isDark ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  İşleme Al
                </button>
              )}
              {order.fulfillment?.status === 'PROCESSING' && (
                <button
                  onClick={() => handleAdvanceStatus('READY_FOR_SHIPMENT')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors"
                >
                  Kargo Kodunu Oluştur
                </button>
              )}
              {order.fulfillment?.status === 'READY_FOR_SHIPMENT' && (
                <button
                  onClick={() => handleAdvanceStatus('SENT')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                >
                  Kargoya Verildi Yap
                </button>
              )}
            </div>
          </div>

          {/* Delivery & InPost Box details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-500" />
                <span>Teslimat Metodu</span>
              </div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.delivery?.method?.name || 'Standart Kargo'}</div>

              {order.delivery?.pickupPoint ? (
                <div className="space-y-1">
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Paczkomat: {order.delivery.pickupPoint.id}</span>
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{order.delivery.pickupPoint.description}</div>
                  <div className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {order.delivery.pickupPoint.address?.street}, {order.delivery.pickupPoint.address?.zipCode}{' '}
                    {order.delivery.pickupPoint.address?.city}
                  </div>
                </div>
              ) : (
                <div className={`space-y-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <div>{order.delivery?.address?.street || ''}</div>
                  <div>
                    {order.delivery?.address?.zipCode || ''} {order.delivery?.address?.city || ''}, {order.delivery?.address?.countryCode || ''}
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Contact & Invoicing */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Alıcı ve Fatura</span>
              </div>
              <div>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.delivery?.address?.firstName || ''} {order.delivery?.address?.lastName || ''}</div>
                <div className="text-slate-400 text-[11px]">Kullanıcı: {order.buyer?.login || 'Alıcı'} · {order.buyer?.email || ''}</div>
                <div className="text-slate-400 text-[11px]">Tel: {order.delivery?.address?.phoneNumber || ''}</div>
              </div>

              {order.buyer?.companyName && (
                <div className={`pt-1 border-t text-[11px] space-y-0.5 ${
                  isDark ? 'border-zinc-800' : 'border-slate-200'
                }`}>
                  <div className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>{order.buyer.companyName}</div>
                  <div className="font-mono font-bold text-[#14171A]">NIP: {order.buyer.taxId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Siparişteki Ürünler ({(order.lineItems || []).length})
            </div>
            <div className={`divide-y border rounded-xl overflow-hidden ${
              isDark ? 'bg-zinc-950 border-zinc-800 divide-zinc-850' : 'bg-slate-50 border-slate-200 divide-slate-200'
            }`}>
              {(order.lineItems || []).map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.offer?.name || 'Ürün'}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Teklif ID: {item.offer?.id || '—'}
                      {item.offer?.external?.id && ` · SKU: ${item.offer.external.id}`}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-mono font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.quantity} x {item.price?.amount || '0.00'} {item.price?.currency || 'PLN'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Toplam: {(item.quantity * parseFloat(item.price?.amount || '0.00')).toFixed(2)} {item.price?.currency || 'PLN'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Attachment Simulation */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-0.5">
              <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileText className="w-3.5 h-3.5 text-[#163300]" />
                <span>E-Arşiv / e-Faktura (Allegro API)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Alıcıya PDF formatında faturayı /order/checkout-forms/{order.id}/invoices üzerinden iletin.
              </p>
            </div>

            <button
              onClick={handleSimulateInvoiceUpload}
              disabled={invoiceUploaded}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 shrink-0 ${
                isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{invoiceUploaded ? 'Fatura Yüklendi ✓' : 'PDF Fatura Yükle'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="font-mono text-xs">
            Toplam Tutar: <strong className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {order.summary.totalToPay.amount} {order.summary.totalToPay.currency}
            </strong>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
