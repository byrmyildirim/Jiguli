import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  Sliders,
  Plus,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Bell,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  X,
  Check,
  HelpCircle,
  Truck,
  TrendingDown,
  MessageSquare,
  FileText,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { store } from '../../services/marketplaceStore';
import {
  AutomationRule,
  AutomationTrigger,
  AutomationAction,
  MarketplaceId
} from '../../types/allegro';

interface AutomationRulesViewProps {
  theme?: 'light' | 'dark';
}

export const AutomationRulesView: React.FC<AutomationRulesViewProps> = ({ theme = 'light' }) => {
  const [rules, setRules] = useState<AutomationRule[]>(store.getAutomationRules());
  const [runningId, setRunningId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NonNullable<AutomationRule['category']>>('LOGISTICS');
  const [channel, setChannel] = useState<'all' | MarketplaceId>('all');
  const [trigger, setTrigger] = useState<AutomationTrigger>('ORDER_PAID');
  const [condition, setCondition] = useState('');
  const [action, setAction] = useState<AutomationAction>('AUTO_INPOST_LABEL');
  const [enabled, setEnabled] = useState(true);

  // Background Cron Worker State
  const [cronData, setCronData] = useState<{
    isEnabled: boolean;
    intervalMinutes: number;
    lastRunAt: string | null;
    nextRunAt: string;
    runCount: number;
  } | null>(null);
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);

  const fetchCronStatus = async () => {
    try {
      const res = await fetch('/api/system/cron-status');
      const data = await res.json();
      if (data && data.success) {
        setCronData(data.cronState);
      }
    } catch {}
  };

  const handleManualCronTrigger = async () => {
    setIsTriggeringCron(true);
    try {
      const res = await fetch('/api/system/cron-trigger', { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        setCronData(data.cronState);
        showNotice('⚡ Otonom arka plan senkronizasyonu başarıyla tetiklendi!');
      }
    } catch (err: any) {
      showNotice(`Hata: ${err?.message || err}`);
    } finally {
      setIsTriggeringCron(false);
    }
  };

  useEffect(() => {
    fetchCronStatus();
    const timer = setInterval(fetchCronStatus, 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return store.subscribe(() => {
      setRules(store.getAutomationRules());
    });
  }, []);

  const isDark = theme === 'dark';

  const triggerPresets: {
    id: string;
    name: string;
    desc: string;
    category: NonNullable<AutomationRule['category']>;
    channel: 'all' | MarketplaceId;
    trigger: AutomationTrigger;
    condition: string;
    action: AutomationAction;
  }[] = [
    {
      id: 'tpl-1',
      name: 'Otomatik InPost Kargo Etiketi (Allegro Smart!)',
      desc: 'Allegro siparişi onaylandığında InPost ShipX API ile takip kodunu üretip siparişe iliştirir.',
      category: 'LOGISTICS',
      channel: 'allegro',
      trigger: 'ORDER_PAID',
      condition: 'Pazaryeri == Allegro && Stok > 0',
      action: 'AUTO_INPOST_LABEL'
    },
    {
      id: 'tpl-2',
      name: 'Anti-Overselling Global Stok Eşitleme',
      desc: 'Herhangi bir pazaryerinde satış olduğunda diğer kanalların stok havuzunu düşürür.',
      category: 'INVENTORY',
      channel: 'all',
      trigger: 'ORDER_PAID',
      condition: 'Tüm siparişlerde',
      action: 'DEDUCT_GLOBAL_STOCK'
    },
    {
      id: 'tpl-3',
      name: 'eMAG EasyBox Sameday Otomatik AWB',
      desc: 'Romanya eMAG siparişlerinde Sameday API ile 24 saat kuralına uygun koli etiketi alır.',
      category: 'LOGISTICS',
      channel: 'emag',
      trigger: 'ORDER_PAID',
      condition: 'Pazaryeri == eMAG && Kargo == EasyBox',
      action: 'AUTO_SAMEDAY_LABEL'
    },
    {
      id: 'tpl-4',
      name: 'Agresif BuyBox Koruma Repricer',
      desc: 'Rakip fiyatı düştüğünde kâr marjı sınırına kadar 0.10 PLN/RON altına günceller.',
      category: 'PRICING',
      channel: 'allegro',
      trigger: 'PRICE_DROP_DETECTED',
      condition: 'Rakip Fiyatı >= Minimum Fiyat Eşiği',
      action: 'TRIGGER_REPRICER'
    },
    {
      id: 'tpl-5',
      name: 'Kritik Stok Satın Alma Uyarısı (< 5 Adet)',
      desc: 'Stok 5 adede indiğinde AliExpress tedarik maliyetiyle satın alma alarmı oluşturur.',
      category: 'INVENTORY',
      channel: 'all',
      trigger: 'STOCK_BELOW_THRESHOLD',
      condition: 'Mevcut Stok <= 5 Adet',
      action: 'RESTOCK_PURCHASE_ALERT'
    },
    {
      id: 'tpl-6',
      name: 'Otomatik AB E-Fatura Düzenleme (VAT 23%/19%)',
      desc: 'Sipariş tamamlandığında NIP/CUI numarasına uygun KDV faturası üretip pazaryerine yükler.',
      category: 'INVOICING',
      channel: 'all',
      trigger: 'ORDER_DELIVERED',
      condition: 'Ödeme Durumu == PAID && Fatura İstendi',
      action: 'GENERATE_VAT_INVOICE'
    }
  ];

  const handleOpenCreateModal = () => {
    setEditingRuleId(null);
    setName('');
    setDescription('');
    setCategory('LOGISTICS');
    setChannel('all');
    setTrigger('ORDER_PAID');
    setCondition('Pazaryeri == Allegro && Stok > 0');
    setAction('AUTO_INPOST_LABEL');
    setEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: AutomationRule) => {
    setEditingRuleId(rule.id);
    setName(rule.name);
    setDescription(rule.description || '');
    setCategory(rule.category || 'LOGISTICS');
    setChannel(rule.channel || 'all');
    setTrigger(rule.trigger);
    setCondition(rule.condition);
    setAction(rule.action);
    setEnabled(rule.enabled);
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tpl: typeof triggerPresets[0]) => {
    setName(tpl.name);
    setDescription(tpl.desc);
    setCategory(tpl.category);
    setChannel(tpl.channel);
    setTrigger(tpl.trigger);
    setCondition(tpl.condition);
    setAction(tpl.action);
    showNotice(`"${tpl.name}" şablonu yüklendi!`);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingRuleId) {
      store.updateAutomationRule(editingRuleId, {
        name: name.trim(),
        description: description.trim(),
        category,
        channel,
        trigger,
        condition: condition.trim() || 'Tüm durumlarda',
        action,
        enabled
      });
      showNotice(`"${name}" kuralı başarıyla güncellendi!`);
    } else {
      store.addAutomationRule({
        name: name.trim(),
        description: description.trim(),
        category,
        channel,
        trigger,
        condition: condition.trim() || 'Tüm durumlarda',
        action,
        enabled
      });
      showNotice(`Yeni otomasyon kuralı "${name}" başarıyla oluşturuldu!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteRule = (rule: AutomationRule) => {
    if (window.confirm(`"${rule.name}" kuralını silmek istediğinize emin misiniz?`)) {
      store.deleteAutomationRule(rule.id);
      showNotice(`"${rule.name}" kuralı silindi.`);
    }
  };

  const handleDuplicateRule = (rule: AutomationRule) => {
    store.duplicateAutomationRule(rule.id);
    showNotice(`"${rule.name}" kuralı kopyalandı!`);
  };

  const handleTestRunRule = (rule: AutomationRule) => {
    setRunningId(rule.id);
    setTimeout(() => {
      store.runAutomationRule(rule.id);
      setRunningId(null);
      showNotice(`"${rule.name}" kuralı başarıyla tetiklendi ve çalıştırıldı!`);
    }, 600);
  };

  const showNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const getTriggerLabel = (t: AutomationTrigger) => {
    switch (t) {
      case 'ORDER_PAID':
        return 'Sipariş Ödemesi Alındığında';
      case 'STOCK_BELOW_THRESHOLD':
        return 'Stok Kritik Eşiğe Düştüğünde';
      case 'PRICE_DROP_DETECTED':
        return 'Rakip Fiyat Kırdığında';
      case 'DISPUTE_OPENED':
        return 'Uyuşmazlık (Dyskusja) Açıldığında';
      case 'MESSAGE_RECEIVED':
        return 'Yeni Alıcı Mesajı Geldiğinde';
      case 'NEW_PRODUCT_CREATED':
        return 'Yeni Ürün Kataloğa Eklendiğinde';
      case 'ORDER_DELIVERED':
        return 'Sipariş Teslim Edildiğinde';
      case 'RETURN_REQUESTED':
        return 'İade (Zwrot) Talebi Oluştuğunda';
      default:
        return t;
    }
  };

  const getActionLabel = (a: AutomationAction) => {
    switch (a) {
      case 'AUTO_INPOST_LABEL':
        return 'Otomatik InPost Kargo Kodu Al & Siparişe Ekle';
      case 'AUTO_SAMEDAY_LABEL':
        return 'eMAG Sameday EasyBox AWB Kodu Bas';
      case 'DEDUCT_GLOBAL_STOCK':
        return 'Tüm Kanallarda Global Stok Düşür';
      case 'TRIGGER_REPRICER':
        return 'Repricer Çalıştır & Alt Fiyata Çek';
      case 'SEND_ALERT_NOTIFICATION':
        return 'Telegram / SMS ile Acil Alarm Gönder';
      case 'GENERATE_VAT_INVOICE':
        return 'PDF E-Fatura Üret & Pazaryerine Yükle';
      case 'AUTO_REPLY_MESSAGE':
        return 'Otomatik Çok Dilli Yanıt Şablonu Gönder';
      case 'RESTOCK_PURCHASE_ALERT':
        return 'AliExpress Otomatik Tedarik Sipariş Bildirimi';
      case 'SYNC_CHANNELS':
        return 'BaseLinker ve eMAG Kataloğuna Anında Yay';
      default:
        return a;
    }
  };

  const getCategoryBadge = (cat?: AutomationRule['category']) => {
    switch (cat) {
      case 'LOGISTICS':
        return { label: 'Lojistik & Kargo', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'PRICING':
        return { label: 'Fiyat & BuyBox', bg: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      case 'INVENTORY':
        return { label: 'Stok & Envanter', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'CUSTOMER_CARE':
        return { label: 'Müşteri İlişkileri', bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'INVOICING':
        return { label: 'Fatura & Vergi', bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      default:
        return { label: 'Genel Otomasyon', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const getChannelBadge = (ch?: AutomationRule['channel']) => {
    switch (ch) {
      case 'allegro':
        return { label: 'Allegro', bg: 'bg-[#FF5A00]/10 text-[#FF5A00]' };
      case 'emag':
        return { label: 'eMAG', bg: 'bg-[#0056B3]/10 text-[#0056B3]' };
      case 'baselinker':
        return { label: 'BaseLinker', bg: 'bg-[#14171A]/10 text-[#14171A]' };
      default:
        return { label: 'Tüm Pazaryerleri (Global)', bg: 'bg-[#9FE870]/30 text-[#163300]' };
    }
  };

  const filteredRules = rules.filter(r => {
    if (categoryFilter === 'ALL') return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14171A] tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#163300]" />
            <span>Otomasyon Kuralları & Tetikleyici Motoru</span>
          </h1>
          <p className="text-xs text-[#5D7079] mt-0.5">
            Allegro, eMAG ve BaseLinker için kargo, stok, BuyBox ve fatura kuralları oluşturun ve yönetin.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#14171A] hover:bg-black text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto min-h-[42px]"
        >
          <Plus className="w-4 h-4 text-[#9FE870]" />
          <span>Yeni Kural Ekle</span>
        </button>
      </div>

      {/* 7/24 OTONOM ARKA PLAN CRON WORKER BANNER */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs ${
        isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
            <RotateCw className="w-5 h-5 text-emerald-600 animate-[spin_6s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                7/24 Otonom Arka Plan Nöbetçisi (Background Cron)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                🟢 Aktif ({cronData?.intervalMinutes || 15} Dakikada Bir)
              </span>
              {cronData?.runCount && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  Döngü #{cronData.runCount}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Panel kapalı olsa dahi sunucu arka planında eMAG ve Allegro siparişlerini, stok düşüşlerini ve BuyBox fiyatlarını otonom senkronize eder.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isTriggeringCron}
          onClick={handleManualCronTrigger}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto"
          title="Otonom arka plan senkronizasyon döngüsünü hemen tetikleyin"
        >
          <Zap className={`w-3.5 h-3.5 ${isTriggeringCron ? 'animate-bounce' : ''}`} />
          <span>{isTriggeringCron ? 'Çalıştırılıyor...' : '⚡ Şimdi Tetikle (Otonom Senkronizasyon)'}</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: `Tüm Kurallar (${rules.length})` },
          { id: 'LOGISTICS', label: 'Lojistik & Kargo' },
          { id: 'INVENTORY', label: 'Stok & Anti-Oversell' },
          { id: 'PRICING', label: 'Fiyatlandırma & BuyBox' },
          { id: 'CUSTOMER_CARE', label: 'Müşteri & Uyuşmazlık' },
          { id: 'INVOICING', label: 'E-Fatura & Muhasebe' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === tab.id
                ? 'bg-[#14171A] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-[#5D7079] border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const isRunning = runningId === rule.id;
          const catInfo = getCategoryBadge(rule.category);
          const chanInfo = getChannelBadge(rule.channel);

          return (
            <div
              key={rule.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Header row of rule */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2.5 h-2.5 rounded-full ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <h3 className="font-black text-sm sm:text-base text-[#14171A]">{rule.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.bg}`}>
                      {catInfo.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${chanInfo.bg}`}>
                      {chanInfo.label}
                    </span>
                  </div>

                  {rule.description && (
                    <p className="text-xs text-[#5D7079] mt-0.5">{rule.description}</p>
                  )}

                  <div className="text-[11px] text-slate-400 font-mono pt-0.5">
                    Toplam Çalışma: <strong className="text-slate-700">{rule.executionsCount} kez</strong> · Son
                    Tetiklenme:{' '}
                    {rule.lastExecutedAt
                      ? new Date(rule.lastExecutedAt).toLocaleTimeString('tr-TR')
                      : 'Henüz tetiklenmedi'}
                  </div>
                </div>

                {/* Status Toggle & Action Controls */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => store.toggleAutomationRule(rule.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      rule.enabled
                        ? 'bg-[#9FE870] text-[#163300]'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{rule.enabled ? 'Aktif' : 'Pasif'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(rule)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Kuralı Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicateRule(rule)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Kuralı Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule)}
                    className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Kuralı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Event-Driven Flow Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F7F8F9] border border-slate-200/80 text-xs">
                {/* 1. When */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    1. Tetikleyici (When Event):
                  </span>
                  <div className="font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="truncate">{getTriggerLabel(rule.trigger)}</span>
                  </div>
                </div>

                {/* 2. If */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    2. Koşul Kriteri (If Filter):
                  </span>
                  <div className="font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] truncate">
                    {rule.condition}
                  </div>
                </div>

                {/* 3. Then */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    3. Aksiyon (Then Action):
                  </span>
                  <div className="font-bold text-emerald-900 bg-[#9FE870]/20 p-2.5 rounded-xl border border-[#9FE870]/50 truncate">
                    {getActionLabel(rule.action)}
                  </div>
                </div>
              </div>

              {/* Test Action */}
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => handleTestRunRule(rule)}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <Play className={`w-3.5 h-3.5 text-indigo-600 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Test Tetikleniyor...' : 'Şimdi Test Et (Tetikle)'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE & EDIT AUTOMATION RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all my-auto bg-white border-slate-200 text-slate-900">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-[#9FE870]/30 text-[#163300]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    {editingRuleId ? 'Otomasyon Kuralını Düzenle' : 'Yeni Otomasyon Kuralı & Şablonu'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Olay, koşul ve eylem adımlarını yapılandırarak otomatik iş akışı oluşturun.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Presets Quick Picker (Only when creating new) */}
              {!editingRuleId && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-[#163300]" />
                      <span>Hazır Şablonlardan Tek Tıkla Yükle:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Opsiyonel</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {triggerPresets.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="p-2 rounded-xl bg-white hover:bg-[#F4F5F7] border border-slate-200 text-left transition-all cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-[#14171A] group-hover:text-[#163300] truncate">
                          {tpl.name}
                        </div>
                        <div className="text-[9px] text-[#5D7079] line-clamp-1">{tpl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rule Name & Description */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kural Adı: *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Yeni Siparişte Otomatik InPost Kargo Kodu Üret"
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Açıklama (Opsiyonel):</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kuralın ne işe yaradığını kısaca açıklayın..."
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Category & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kategori:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50"
                  >
                    <option value="LOGISTICS">Lojistik & Kargo Etiketleme</option>
                    <option value="INVENTORY">Stok & Anti-Overselling</option>
                    <option value="PRICING">Fiyatlandırma & BuyBox</option>
                    <option value="CUSTOMER_CARE">Müşteri İlişkileri & Dyskusja</option>
                    <option value="INVOICING">E-Fatura & Muhasebe</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hedef Pazaryeri:</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2.5 text-xs font-medium focus:outline-none bg-slate-50"
                  >
                    <option value="all">Tüm Pazaryerleri (Global Entegrasyon)</option>
                    <option value="allegro">Allegro (Polonya / Çekya / Slovakya)</option>
                    <option value="emag">eMAG (Romanya / Bulgaristan / Macaristan)</option>
                    <option value="baselinker">BaseLinker Hub</option>
                  </select>
                </div>
              </div>

              {/* Workflow Steps Builder: When -> If -> Then */}
              <div className="p-4 rounded-2xl bg-[#F7F8F9] border border-slate-200 space-y-3">
                <div className="text-xs font-black text-[#14171A] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#163300]" />
                  <span>İş Akışı Yapılandırması (Event Pipeline)</span>
                </div>

                {/* 1. Trigger */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    1. Tetikleyici Olay (When):
                  </label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as AutomationTrigger)}
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2 text-xs font-semibold focus:outline-none bg-white"
                  >
                    <option value="ORDER_PAID">Sipariş Ödemesi Alındığında (ORDER_PAID)</option>
                    <option value="STOCK_BELOW_THRESHOLD">Stok Kritik Eşiğe Düştüğünde (STOCK_BELOW_THRESHOLD)</option>
                    <option value="PRICE_DROP_DETECTED">Rakip Fiyat Kırdığında (PRICE_DROP_DETECTED)</option>
                    <option value="DISPUTE_OPENED">Uyuşmazlık (Dyskusja) Açıldığında (DISPUTE_OPENED)</option>
                    <option value="MESSAGE_RECEIVED">Yeni Alıcı Mesajı Geldiğinde (MESSAGE_RECEIVED)</option>
                    <option value="ORDER_DELIVERED">Sipariş Teslim Edildiğinde (ORDER_DELIVERED)</option>
                    <option value="RETURN_REQUESTED">İade (Zwrot) Talebi Oluştuğunda (RETURN_REQUESTED)</option>
                  </select>
                </div>

                {/* 2. Condition */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    2. Koşul / Filtre (If Condition):
                  </label>
                  <input
                    type="text"
                    required
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="Örn: Pazaryeri == Allegro && Stok > 0"
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2 text-xs font-mono font-medium focus:outline-none bg-white"
                  />
                </div>

                {/* 3. Action */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    3. Yürütülecek Aksiyon (Then Action):
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as AutomationAction)}
                    className="w-full border border-slate-200 focus:border-[#14171A] rounded-xl p-2 text-xs font-semibold focus:outline-none bg-white"
                  >
                    <option value="AUTO_INPOST_LABEL">Otomatik InPost Kargo Kodu Al & Siparişe Ekle</option>
                    <option value="AUTO_SAMEDAY_LABEL">eMAG Sameday EasyBox AWB Kodu Bas</option>
                    <option value="DEDUCT_GLOBAL_STOCK">Tüm Kanallarda Global Stok Düşür (Anti-Overselling)</option>
                    <option value="TRIGGER_REPRICER">Repricer Çalıştır & Alt Fiyata Çek</option>
                    <option value="SEND_ALERT_NOTIFICATION">Telegram / SMS ile Acil Alarm Gönder</option>
                    <option value="GENERATE_VAT_INVOICE">PDF E-Fatura Üret & Pazaryerine Yükle</option>
                    <option value="AUTO_REPLY_MESSAGE">Otomatik Çok Dilli Yanıt Şablonu Gönder</option>
                    <option value="RESTOCK_PURCHASE_ALERT">AliExpress Otomatik Tedarik Sipariş Bildirimi</option>
                    <option value="SYNC_CHANNELS">BaseLinker ve eMAG Kataloğuna Anında Yay</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">Kural Durumu</div>
                  <div className="text-[10px] text-slate-500">Kural oluşturulduğunda hemen aktif edilsin mi?</div>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#163300] cursor-pointer"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer min-h-[40px]"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-[#14171A] hover:bg-black text-white transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] shadow-xs active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 text-[#9FE870]" />
                  <span>{editingRuleId ? 'Değişiklikleri Kaydet' : 'Kuralı Oluştur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
