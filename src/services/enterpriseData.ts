import {
  RepricingItem,
  CustomerMessageThread,
  ReturnDisputeItem,
  AutomationRule
} from '../types/allegro';

// Pure production mode: clean lists for repricing, customer threads, disputes.
export const INITIAL_REPRICING_ITEMS: RepricingItem[] = [];

export const INITIAL_CUSTOMER_THREADS: CustomerMessageThread[] = [];

export const INITIAL_RETURN_DISPUTES: ReturnDisputeItem[] = [];

export const INITIAL_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'eMAG Bulgaristan / Romanya Siparişlerinde Sameday AWB & EasyBox Kodu Al',
    category: 'LOGISTICS',
    channel: 'emag',
    trigger: 'ORDER_PAID',
    condition: 'Pazaryeri == eMAG && Teslimat == EasyBox Locker',
    action: 'AUTO_SAMEDAY_LABEL',
    enabled: true,
    executionsCount: 0,
    lastExecutedAt: undefined,
    description: 'eMAG siparişleri onaylandığında Sameday API üzerinden anında locker AWB barkodu basar.'
  },
  {
    id: 'auto-2',
    name: 'Çapraz Satışta Global Stok Düşürme (Anti-Overselling)',
    category: 'INVENTORY',
    channel: 'all',
    trigger: 'ORDER_PAID',
    condition: 'Herhangi bir pazaryerinde (eMAG, Allegro, BaseLinker) satış olduğunda',
    action: 'DEDUCT_GLOBAL_STOCK',
    enabled: true,
    executionsCount: 0,
    lastExecutedAt: undefined,
    description: 'Bir pazaryerinde satılan adet kadar tüm diğer kanalların stok havuzunu anında günceller.'
  },
  {
    id: 'auto-3',
    name: 'Rakip Fiyat Kırdığında eMAG / Allegro Fiyatını Otomatik Güncelle',
    category: 'PRICING',
    channel: 'all',
    trigger: 'PRICE_DROP_DETECTED',
    condition: 'Rakip Fiyatı >= Minimum İzin Verilen Kâr Marjı',
    action: 'TRIGGER_REPRICER',
    enabled: true,
    executionsCount: 0,
    lastExecutedAt: undefined,
    description: 'Rakip fiyat kırdığında kâr marjının altına inmeden en avantajlı fiyata otomatik revize eder.'
  },
  {
    id: 'auto-4',
    name: 'Kritik Stok Uyarısı (< 5 Adet) ve Tedarikçi Alarmı',
    category: 'INVENTORY',
    channel: 'all',
    trigger: 'STOCK_BELOW_THRESHOLD',
    condition: 'Kalan Stok <= 5 Adet',
    action: 'RESTOCK_PURCHASE_ALERT',
    enabled: true,
    executionsCount: 0,
    lastExecutedAt: undefined,
    description: 'Ürün stoğu 5 adedin altına indiğinde satıcıya ikmal uyarısı bildirir.'
  }
];
