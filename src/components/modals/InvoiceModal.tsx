import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Mail,
  Check,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { AllegroCheckoutForm } from '../../types/allegro';
import { store } from '../../services/marketplaceStore';
import { MarketplaceLogo } from '../../constants/marketplaces';

interface InvoiceModalProps {
  order: AllegroCheckoutForm | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose, theme = 'light' }) => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!order) return null;

  const isDark = theme === 'dark';
  const totalAmount = parseFloat(order.summary.totalToPay.amount);
  const currency = order.summary.totalToPay.currency;
  const isPolish = order.platform === 'allegro';
  const vatRate = isPolish ? 0.23 : 0.19; // 23% PL, 19% RO
  const netAmount = totalAmount / (1 + vatRate);
  const vatAmount = totalAmount - netAmount;

  const invoiceNumber = `FV/${new Date().getFullYear()}/${order.id.slice(-6).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString(isPolish ? 'pl-PL' : 'ro-RO');

  const handleSendEmail = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    }, 600);
  };

  const handleDownload = () => {
    setIsDownloaded(true);
    const element = document.createElement('a');
    const content = `FAKTURA VAT: ${invoiceNumber}\nData: ${issueDate}\nSprzedawca: OmniMerchant Pro Sp. z o.o. NIP: PL5289104829\nNabywca: ${order.buyer.companyName || order.buyer.login} (NIP: ${order.buyer.taxId || 'Brak'})\nNetto: ${netAmount.toFixed(2)} ${currency}\nVAT (${(vatRate*100).toFixed(0)}%): ${vatAmount.toFixed(2)} ${currency}\nBrutto: ${totalAmount.toFixed(2)} ${currency}`;
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoiceNumber.replace(/\//g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setIsDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all my-auto ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden shrink-0">
              <MarketplaceLogo platform={order.platform || 'allegro'} size="md" rounded="xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#14171A]">
                  {isPolish ? 'Faktura VAT 23% (Polonya)' : 'Factură Fiscală TVA 19% (Romanya)'}
                </h2>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                  {invoiceNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {(order.platform || 'allegro').toUpperCase()} & BaseLinker e-Fatura Çıktısı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Body Canvas */}
        <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
          {/* Metadata Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="font-mono text-sm font-black text-slate-900">FAKTURA VAT: {invoiceNumber}</div>
              <div className="text-[11px] text-slate-500">Oryginał / Kopia</div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-600">
              <div>Data wystawienia (Tarih): <strong>{issueDate}</strong></div>
              <div>Metoda płatności: <strong>{order.payment.provider} (Zapłacono)</strong></div>
            </div>
          </div>

          {/* Seller & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {/* Seller */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SPRZEDAWCA (Satıcı):
              </div>
              <div className="font-bold text-slate-900">OmniMerchant Pro Sp. z o.o.</div>
              <div className="text-slate-600">ul. Marszałkowska 104/55</div>
              <div className="text-slate-600 font-mono">00-001 Warszawa, Polska</div>
              <div className="font-mono font-bold text-indigo-700">NIP: PL5289104829</div>
            </div>

            {/* Buyer */}
            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                NABYWCA (Alıcı):
              </div>
              <div className="font-bold text-slate-900">
                {order.buyer.companyName || `${order.delivery.address.firstName} ${order.delivery.address.lastName}`}
              </div>
              <div className="text-slate-600">{order.delivery.address.street}</div>
              <div className="text-slate-600 font-mono">
                {order.delivery.address.zipCode} {order.delivery.address.city}, {order.delivery.address.countryCode}
              </div>
              {order.buyer.taxId ? (
                <div className="font-mono font-bold text-[#FF5A00]">NIP: {order.buyer.taxId}</div>
              ) : (
                <div className="text-slate-400 font-mono">Osoba prywatna (Bireysel)</div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Lp.</th>
                  <th className="py-2.5 px-3">Nazwa towaru / usługi</th>
                  <th className="py-2.5 px-3 text-center">Ilość</th>
                  <th className="py-2.5 px-3 text-right">Netto</th>
                  <th className="py-2.5 px-3 text-center">Stawka VAT</th>
                  <th className="py-2.5 px-3 text-right">Brutto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {order.lineItems.map((item, idx) => {
                  const itemTotal = parseFloat(item.price.amount) * item.quantity;
                  const itemNet = itemTotal / (1 + vatRate);
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-medium">{item.offer.name}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity} szt.</td>
                      <td className="py-2.5 px-3 text-right">{itemNet.toFixed(2)} {currency}</td>
                      <td className="py-2.5 px-3 text-center">{(vatRate * 100).toFixed(0)}%</td>
                      <td className="py-2.5 px-3 text-right font-bold">{itemTotal.toFixed(2)} {currency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Wartość Netto:</span>
                <span>{netAmount.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Podatek VAT ({(vatRate * 100).toFixed(0)}%):</span>
                <span>{vatAmount.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Razem Brutto:</span>
                <span>{totalAmount.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <span>{emailSent ? 'Fatura Alıcıya Gönderildi!' : isSendingEmail ? 'Gönderiliyor...' : 'Alıcıya E-Fatura Gönder'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloaded ? 'İndirildi' : 'Fatura PDF İndir'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-2 rounded-full bg-[#14171A] hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
