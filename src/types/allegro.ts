export type MarketplaceId = 'allegro' | 'emag' | 'baselinker' | 'aliexpress';

export type SupportedCurrency = 'PLN' | 'RON' | 'EUR' | 'USD' | 'TRY' | 'CZK' | 'HUF' | 'BGN';

export interface CurrencyRate {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateAgainstPln: number; // e.g. 1 PLN = X Currency
  flag: string;
}

export interface AllegroConfig {
  clientId: string;
  clientSecret: string;
  bearerToken: string;
  environment: 'sandbox' | 'production';
  isConnected: boolean;
  tokenExpiresAt: number | null;
  sellerLogin: string;
}

export interface PlatformCredentials {
  emag: {
    country: 'ro' | 'bg' | 'hu';      // eMAG pazar yeri seçimi
    username: string;                  // eMAG API Kullanıcı Adı
    userHash: string;                  // eMAG API Şifresi (Hesap Giriş Şifresi)
    apiCode?: string;                  // eMAG API Kodu (Örn: chrsadv)
  };
  baselinker: {
    apiToken: string;                  // BaseLinker API Token (X-BLToken)
    inventoryId?: string;              // BaseLinker Envanter / Depo ID
  };
  allegro: {
    environment: 'production' | 'sandbox';
    clientId: string;                  // Allegro App Client ID
    clientSecret: string;              // Allegro App Client Secret
    accessToken?: string;              // OAuth2 Bearer Access Token
    refreshToken?: string;             // Token yenilemek için Refresh Token
    tokenExpiresAt?: number;           // Unix timestamp (sn)
  };
}

export interface PlatformConfig {
  id: MarketplaceId;
  name: string;
  country: string;
  currency: string;
  sellerName?: string;
  status: 'connected' | 'configured' | 'available';
  description: string;
  apiDocsUrl: string;
  authType: 'oauth2' | 'apiKey' | 'basicAuth';
  credentials: Record<string, string>;
  activeListingsCount: number;
  ordersCount: number;
  lastSyncAt: string | null;
  features: {
    inventorySync: boolean;
    priceSync: boolean;
    orderFulfillment: boolean;
    webhookSupport: boolean;
  };
}

export interface AllegroParameter {
  id: string;
  name: string;
  type: 'STRING' | 'INTEGER' | 'FLOAT' | 'DICTIONARY';
  required: boolean;
  unit?: string;
  options?: { id: string; value: string }[];
  value?: string | string[];
}

export interface AllegroCategory {
  id: string;
  name: string;
  parentId: string | null;
  leaf: boolean;
  parameters?: AllegroParameter[];
}

export interface AllegroOffer {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  primaryImage: string;
  sellingMode: {
    format: 'BUY_NOW' | 'AUCTION';
    price: {
      amount: string;
      currency: string;
    };
    minimalPrice?: {
      amount: string;
      currency: string;
    };
  };
  stock: {
    available: number;
    unit: 'UNIT' | 'SET' | 'PAIR';
  };
  publication: {
    status: 'ACTIVE' | 'INACTIVE' | 'ACTIVATING' | 'ENDED' | 'DRAFT';
    marketplaces: {
      base: { id: string };
      additional: { id: string }[];
    };
  };
  delivery: {
    shippingRates: {
      id: string;
      name: string;
    };
    handlingTime: string; // e.g. "PT24H"
    shipmentDate?: string;
  };
  parameters: {
    id: string;
    name: string;
    values: string[];
    valuesIds?: string[];
  }[];
  ean?: string;
  sku: string;
  smartEligible: boolean;
  isDraft?: boolean;
  excelMetadata?: {
    originalEurPrice?: number;
    discountPercent?: string;
    discountedEurPrice?: number;
    matchedCategoryName?: string;
    matchedCategoryCode?: string;
    emagCategoryName?: string;
    emagCategoryCode?: string;
    allegroCategoryName?: string;
    allegroCategoryCode?: string;
    websiteLinks?: string;
    eanAllegro?: string;
    parcelNumber?: string;
    palletNumber?: string;
    declaredValue?: string;
    currency?: string;
    exchangeRateUsed?: number;
    declaredWeight?: string;
    tax?: string;
  };
  aliExpressSource?: {
    id: string;
    url: string;
    costUsd: number;
    supplierName: string;
  };
  stats: {
    watchersCount: number;
    visitsCount: number;
    salesVolume30d: number;
  };
  createdAt: string;
  updatedAt: string;
  channelSync: Partial<Record<MarketplaceId, 'synced' | 'pending' | 'unlinked' | 'error'>>;
  channelData?: {
    allegro?: {
      title?: string;
      price?: { amount: string; currency: string };
      categoryId?: string;
      smartEligible?: boolean;
      parameters?: Record<string, string>;
    };
    emag?: {
      title?: string;
      price?: { amount: string; currency: string };
      categoryId?: string;
      vatRate?: number;
      geniusEligible?: boolean;
      characteristics?: Record<string, string>;
    };
    baselinker?: {
      warehouseId?: string;
      categoryId?: string;
      price?: { amount: string; currency: string };
      weightKg?: number;
      dimensions?: { width: string; height: string; depth: string };
      autoSyncStock?: boolean;
      autoSyncPrice?: boolean;
    };
  };
}

export interface AllegroOrderLineItem {
  id: string;
  offer: {
    id: string;
    name: string;
    external?: {
      id: string;
    };
  };
  quantity: number;
  price: {
    amount: string;
    currency: string;
  };
  reconciliation?: {
    value: {
      amount: string;
      currency: string;
    };
    type: string;
  };
}

export interface AllegroCheckoutForm {
  id: string;
  platform: MarketplaceId;
  messageToSeller: string | null;
  buyer: {
    id: string;
    email: string;
    login: string;
    companyName?: string;
    taxId?: string;
    guest: boolean;
  };
  payment: {
    id: string;
    type: 'ONLINE' | 'CASH_ON_DELIVERY' | 'WIRE_TRANSFER';
    provider: 'PAYU' | 'P24' | 'STANDARD';
    status: 'PAID' | 'WAITING_FOR_PAYMENT' | 'CANCELLED';
    paidAmount: {
      amount: string;
      currency: string;
    };
  };
  delivery: {
    address: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      zipCode: string;
      countryCode: string;
      phoneNumber: string;
      companyName?: string;
    };
    method: {
      id: string;
      name: string;
      carrier: 'InPost' | 'DPD' | 'Allegro One' | 'Pocztex' | 'DHL' | 'Sameday' | 'Fan Courier';
    };
    pickupPoint?: {
      id: string;
      name: string;
      description: string;
      address: {
        street: string;
        zipCode: string;
        city: string;
      };
    };
    cost: {
      amount: string;
      currency: string;
    };
    smart: boolean;
  };
  lineItems: AllegroOrderLineItem[];
  fulfillment: {
    status: 'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT' | 'CANCELLED';
    shipmentSummary?: {
      lineItemsSent: 'NONE' | 'SOME' | 'ALL';
    };
    trackingNumber?: string;
  };
  invoice?: {
    required: boolean;
    uploaded?: boolean;
    fileName?: string;
    invoiceNumber?: string;
  };
  summary: {
    totalToPay: {
      amount: string;
      currency: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  platform: MarketplaceId;
}

export interface PricingRule {
  id: string;
  channel: MarketplaceId;
  channelName: string;
  markupPercent: number;
  fixedMarkup: number;
  currency: string;
  rounding: 'none' | '99cents' | 'roundInteger';
  enabled: boolean;
}

export interface InventorySyncRule {
  safetyStock: number;
  reserveStock: number;
  autoDeactivateWhenZero: boolean;
  syncIntervalMinutes: number;
  multiChannelDeduction: boolean;
}

export interface AliExpressCandidateItem {
  titleEn: string;
  priceUsd: number;
  supplierName?: string;
  shippingUsd?: number;
  directUrl?: string;
}

export interface AliExpressMatchedProduct {
  id: string;
  sourceUrl: string;
  directSearchUrl?: string;
  titleEn: string;
  titlePl: string;
  categoryName: string;
  allegroCategoryId: string;
  priceUsd: number;
  shippingUsd: number;
  supplierName: string;
  supplierRating: number;
  deliveryDays: string;
  stockAvailable: number;
  images: string[];
  primaryImage: string;
  descriptionPl: string;
  specifications: {
    brand: string;
    model: string;
    ean: string;
    condition: string;
    material?: string;
    color?: string;
    power?: string;
    weight?: string;
  };
  features: string[];
  candidateProducts?: AliExpressCandidateItem[];
  visualSummary?: string;
}

// -------------------------------------------------------------
// NEW ENTERPRISE EXTENSIONS: Repricing, Customer Care, Automations & Invoicing
// -------------------------------------------------------------

export interface RepricingItem {
  id: string;
  offerId: string;
  offerName: string;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  targetCompetitorPrice: number;
  competitorSellerName: string;
  buyBoxStatus: 'WINNING' | 'LOSING' | 'TIED';
  strategy: 'BEAT_BY_0_10' | 'MATCH' | 'MARGIN_TARGET';
  currency: 'PLN' | 'RON';
  platform: MarketplaceId;
  autoEnabled: boolean;
  lastRepricedAt: string;
}

export interface CustomerMessageThread {
  id: string;
  platform: MarketplaceId;
  buyerLogin: string;
  buyerEmail: string;
  orderId?: string;
  offerName?: string;
  subject: string;
  status: 'UNREAD' | 'REPLIED' | 'PENDING';
  unreadCount: number;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'BUYER' | 'SELLER' | 'SYSTEM';
    textPl: string;
    textTr: string;
    timestamp: string;
  }[];
}

export interface ReturnDisputeItem {
  id: string;
  type: 'RETURN' | 'DISPUTE'; // Zwrot veya Dyskusja
  platform: MarketplaceId;
  orderId: string;
  buyerLogin: string;
  reason: string;
  status: 'WAITING_FOR_ACTION' | 'ACCEPTED' | 'REJECTED' | 'REFUNDED';
  refundAmountPln: number;
  deadlineHoursLeft: number;
  createdAt: string;
  trackingReturnNumber?: string;
}

export type AutomationTrigger =
  | 'ORDER_PAID'
  | 'STOCK_BELOW_THRESHOLD'
  | 'PRICE_DROP_DETECTED'
  | 'DISPUTE_OPENED'
  | 'MESSAGE_RECEIVED'
  | 'NEW_PRODUCT_CREATED'
  | 'ORDER_DELIVERED'
  | 'RETURN_REQUESTED';

export type AutomationAction =
  | 'AUTO_INPOST_LABEL'
  | 'AUTO_SAMEDAY_LABEL'
  | 'DEDUCT_GLOBAL_STOCK'
  | 'TRIGGER_REPRICER'
  | 'SEND_ALERT_NOTIFICATION'
  | 'GENERATE_VAT_INVOICE'
  | 'AUTO_REPLY_MESSAGE'
  | 'RESTOCK_PURCHASE_ALERT'
  | 'SYNC_CHANNELS';

export interface AutomationRule {
  id: string;
  name: string;
  category?: 'LOGISTICS' | 'PRICING' | 'INVENTORY' | 'CUSTOMER_CARE' | 'INVOICING';
  channel?: 'all' | MarketplaceId;
  trigger: AutomationTrigger;
  condition: string;
  action: AutomationAction;
  enabled: boolean;
  executionsCount: number;
  lastExecutedAt?: string;
  description?: string;
}
