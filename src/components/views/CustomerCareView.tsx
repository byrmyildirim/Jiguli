import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  RotateCcw,
  AlertOctagon,
  Clock,
  Send,
  Languages,
  CheckCircle2,
  XCircle,
  User,
  ExternalLink,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import { CustomerMessageThread, ReturnDisputeItem } from '../../types/allegro';

interface CustomerCareViewProps {
  theme?: 'light' | 'dark';
}

export const CustomerCareView: React.FC<CustomerCareViewProps> = ({ theme = 'light' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'MESSAGES' | 'RETURNS_DISPUTES'>('MESSAGES');
  const [threads, setThreads] = useState<CustomerMessageThread[]>(store.getCustomerThreads());
  const [disputes, setDisputes] = useState<ReturnDisputeItem[]>(store.getReturnDisputes());
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [showTurkishTranslation, setShowTurkishTranslation] = useState(true);

  useEffect(() => {
    return store.subscribe(() => {
      setThreads(store.getCustomerThreads());
      setDisputes(store.getReturnDisputes());
    });
  }, []);

  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];
  const isDark = theme === 'dark';

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    store.sendThreadReply(selectedThread.id, replyText.trim());
    setReplyText('');
  };

  const handleCannedResponse = (templatePl: string) => {
    setReplyText(templatePl);
  };

  const handleApproveRefund = (disputeId: string) => {
    store.updateReturnStatus(disputeId, 'REFUNDED');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight">
            Müşteri İletişimi & İade Yönetimi
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Allegro Centrum Wiadomości (Mesajlar), Dyskusje (24s Süreli Uyuşmazlıklar) ve eMAG İade Talepleri.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center p-1 rounded-full bg-[#F4F5F7] self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('MESSAGES')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSubTab === 'MESSAGES'
                ? 'bg-white text-[#14171A] shadow-xs'
                : 'text-[#5D7079] hover:text-[#14171A]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Alıcı Mesajları ({threads.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('RETURNS_DISPUTES')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSubTab === 'RETURNS_DISPUTES'
                ? 'bg-white text-[#14171A] shadow-xs'
                : 'text-[#5D7079] hover:text-[#14171A]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>İadeler & Uyuşmazlıklar ({disputes.length})</span>
            </span>
          </button>
        </div>
      </div>

      {activeSubTab === 'MESSAGES' ? (
        /* Messenger Two-Column Workspace */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Threads List Column */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 md:col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Gelen Mesaj Kutusu
            </div>

            <div className="space-y-2">
              {threads.length === 0 ? (
                <div className="text-center py-8 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 space-y-1">
                  <div className="text-xs font-bold text-slate-800">Mesaj Kutusu Temiz</div>
                  <p className="text-[10px] text-slate-400">
                    Henüz okunmamış alıcı mesajınız bulunmuyor.
                  </p>
                </div>
              ) : (
                threads.map((thread) => {
                  const isSelected = thread.id === selectedThreadId;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F4F5F7] border-[#14171A] shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{thread.buyerLogin}</span>
                          {thread.unreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {thread.platform.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 line-clamp-1 mt-1">
                        {thread.subject}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {new Date(thread.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Conversation Column */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs md:col-span-2 flex flex-col justify-between space-y-4 min-h-[460px]">
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{selectedThread.buyerLogin}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedThread.platform.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{selectedThread.offerName}</div>
                  </div>

                  <button
                    onClick={() => setShowTurkishTranslation(prev => !prev)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Languages className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{showTurkishTranslation ? 'Türkçe Çeviri: Açık' : 'Orijinal Lehçe'}</span>
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] p-2">
                  {selectedThread.messages.map((msg) => {
                    const isSeller = msg.sender === 'SELLER';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`p-3.5 rounded-2xl max-w-md text-xs space-y-1.5 shadow-2xs ${
                          isSeller
                            ? 'bg-[#14171A] text-white rounded-br-none'
                            : 'bg-[#F4F5F7] text-slate-900 rounded-bl-none'
                        }`}>
                          <div className="font-medium">
                            {showTurkishTranslation ? msg.textTr : msg.textPl}
                          </div>
                          {showTurkishTranslation && !isSeller && (
                            <div className="text-[10px] text-slate-400 border-t border-slate-200/50 pt-1 font-mono italic">
                              Lehçe: "{msg.textPl}"
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Canned Quick Responses */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Hızlı Yanıtlar:</span>
                  <button
                    onClick={() => handleCannedResponse('Dzień dobry! Tak, zamówienie zostało przekazane do kuriera InPost.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] shrink-0 cursor-pointer"
                  >
                    Kargoya Verildi
                  </button>
                  <button
                    onClick={() => handleCannedResponse('Dzień dobry! Faktura VAT 23% została dołączona do zamówienia w formacie PDF.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] shrink-0 cursor-pointer"
                  >
                    Fatura Eklendi
                  </button>
                  <button
                    onClick={() => handleCannedResponse('Dzień dobry! Produkt posiada 24 miesiące gwarancji oraz polskie menu.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] shrink-0 cursor-pointer"
                  >
                    Garanti & Türkçe/Lehçe Dil
                  </button>
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Lehçe veya Türkçe yanıt yazın..."
                    className="flex-1 border border-slate-200 focus:border-[#14171A] rounded-full px-4 py-2.5 text-xs focus:outline-none bg-slate-50"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-[#14171A] hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gönder</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">Görüntülenecek mesaj seçilmedi.</div>
            )}
          </div>
        </div>
      ) : (
        /* Returns & Allegro Disputes (Zwroty & Dyskusje) */
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl border border-slate-200 bg-white space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div className="font-bold text-xs text-slate-800">Açık İade veya Uyuşmazlık Bulunmuyor</div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Tüm simülasyon verileri temizlendi. eMAG veya Allegro üzerinden alıcılar iade talebi veya tartışma açtığında bu alanda anlık listelenecektir.
              </p>
            </div>
          ) : (
            disputes.map((item) => {
            const isDispute = item.type === 'DISPUTE';
            const isRefunded = item.status === 'REFUNDED';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all space-y-4 shadow-2xs ${
                  isDispute ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                        isDispute ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {isDispute ? <ShieldAlert className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        <span>{isDispute ? 'ALLEGRO DYSKUSJA (UYUŞMAZLIK)' : 'MÜŞTERİ İADE TALEBİ (ZWROT)'}</span>
                      </span>

                      {isDispute && !isRefunded && (
                        <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Son {item.deadlineHoursLeft} Saat Kaldı (24s Kuralı)</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">
                      Alıcı: {item.buyerLogin} · Sipariş ID: {item.orderId}
                    </h3>
                    <p className="text-xs text-slate-600 italic">"{item.reason}"</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-right font-mono">
                    <span className="text-[10px] text-slate-400 block font-sans">İade Tutarı:</span>
                    <strong className="text-base font-black text-slate-900">{item.refundAmountPln.toFixed(2)} PLN</strong>
                  </div>
                </div>

                {/* Dispute Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {item.trackingReturnNumber ? `İade Takip: ${item.trackingReturnNumber}` : 'İade kargo bekleniyor'}
                  </div>

                  <div className="flex items-center gap-2">
                    {isRefunded ? (
                      <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ücret İadesi Tamamlandı</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApproveRefund(item.id)}
                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs cursor-pointer min-h-[40px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>İadeyi Onayla & Parayı Aktar ({item.refundAmountPln.toFixed(2)} PLN)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};
