import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Package,
  Truck,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Barcode
} from 'lucide-react';
import { AllegroCheckoutForm } from '../../types/allegro';

interface ShippingLabelModalProps {
  order: AllegroCheckoutForm | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ order, onClose, theme = 'light' }) => {
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [isDownloaded, setIsDownloaded] = React.useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const isDark = theme === 'dark';
  const trackingNumber = order.fulfillment.trackingNumber || `6284920${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;
  const carrier = order.delivery.method.carrier;
  const isPaczkomat = order.delivery.pickupPoint !== undefined;
  const paczkomatId = order.delivery.pickupPoint?.id || 'WAW129M';

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handleDownload = () => {
    setIsDownloaded(true);
    const element = document.createElement('a');
    const file = new Blob([
      `INPOST / ALLEGRO SHIPPING LABEL\nTracking: ${trackingNumber}\nRecipient: ${order.delivery.address.firstName} ${order.delivery.address.lastName}\nPaczkomat: ${paczkomatId}\nDate: ${new Date().toISOString()}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Etykieta_${carrier}_${order.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setIsDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl transition-all my-auto ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-800 font-black text-xs flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>{carrier}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14171A]">Termal Kargo Etiketi (100×150 mm)</h2>
              <p className="text-[11px] text-slate-500 font-mono">Sipariş ID: {order.id} · {order.platform.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Realistic Printable Thermal Label Canvas */}
        <div className="p-6 bg-slate-100/70 flex justify-center">
          <div
            ref={labelRef}
            className="w-full max-w-sm bg-white border-2 border-black p-4 text-black rounded-lg shadow-md font-sans text-xs space-y-3"
            style={{ minHeight: '440px' }}
          >
            {/* Header: Carrier Brand & Smart Logo */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tighter bg-black text-white px-2 py-0.5 rounded">
                  {carrier.toUpperCase()}
                </span>
                {order.delivery.smart && (
                  <span className="font-black text-[10px] bg-[#9FE870] text-[#163300] px-1.5 py-0.5 rounded">
                    ALLEGRO SMART!
                  </span>
                )}
              </div>
              <div className="text-right font-mono font-bold text-xs">
                <div>GABARYT: B</div>
                <div className="text-[9px] text-slate-600">MASA: 1.25 KG</div>
              </div>
            </div>

            {/* InPost Paczkomat Big Code (If locker delivery) */}
            {isPaczkomat ? (
              <div className="border-2 border-black p-2.5 rounded bg-yellow-50 text-center space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  DOCELOWY PACZKOMAT INPOST
                </div>
                <div className="text-2xl font-black font-mono tracking-wider text-black">
                  {paczkomatId}
                </div>
                <div className="text-[10px] text-slate-600">
                  {order.delivery.pickupPoint?.name || 'Warszawa, ul. Marszałkowska 104'}
                </div>
              </div>
            ) : (
              <div className="border-2 border-black p-2 rounded text-center font-bold text-sm bg-slate-50">
                PRZESYŁKA KURIERSKA DRZWI-DO-DRZWI
              </div>
            )}

            {/* Recipient / Nadawca Details */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-2 text-[11px]">
              <div>
                <div className="font-bold text-[9px] text-slate-500 uppercase">ODBIORCA (Alıcı):</div>
                <div className="font-bold">{order.delivery.address.firstName} {order.delivery.address.lastName}</div>
                <div>{order.delivery.address.street}</div>
                <div className="font-mono font-bold">{order.delivery.address.zipCode} {order.delivery.address.city}</div>
                <div className="font-mono mt-0.5">Tel: {order.delivery.address.phoneNumber}</div>
              </div>

              <div>
                <div className="font-bold text-[9px] text-slate-500 uppercase">NADAWCA (Gönderici):</div>
                <div className="font-bold">OmniMerchant Pro Sp. z o.o.</div>
                <div>ul. Logistyczna 44/B</div>
                <div className="font-mono">00-001 Warszawa, PL</div>
                <div className="font-mono mt-0.5">NIP: PL5289104829</div>
              </div>
            </div>

            {/* Barcode & Numbers */}
            <div className="space-y-1.5 text-center pt-1">
              <div className="flex justify-center items-center py-2 bg-slate-50 border border-slate-300 rounded font-mono">
                {/* Visual Barcode Bars */}
                <div className="flex items-center h-12 gap-0.5 px-2">
                  {[4,2,3,1,5,2,4,1,3,2,5,1,2,4,3,1,4,2,3,5,1,4,2,3,1,4,2,5,3,1,4,2,3,1,5,2,4,1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="font-mono font-bold text-xs tracking-widest">
                {trackingNumber}
              </div>
            </div>

            {/* Footer QR Code & Reference */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-black text-[10px]">
              <div className="font-mono">
                <div>REF: {order.id.slice(0, 14)}</div>
                <div>DATA: {new Date().toLocaleDateString('pl-PL')}</div>
              </div>
              <div className="flex items-center gap-1 font-bold text-[10px]">
                <QrCode className="w-6 h-6" />
                <span>INPOST 2D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kargo API entegrasyonu onaylı</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloaded ? 'İndirildi!' : 'Etiketi İndir'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-5 py-2 rounded-full bg-[#14171A] hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[44px] active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Yazdırılıyor...' : 'Termal Yazıcıya Gönder'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
