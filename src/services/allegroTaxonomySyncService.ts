// ============================================================================
// Allegro Taksonomi ve Kategori Ağacı Senkronizasyon Servisi
// 22,634+ Kategori ve 20,337+ Yaprak (Leaf) Kategori Desteği
// ============================================================================

export interface AllegroCategoryItem {
  id: string;
  name: string;
  namePl: string;
  trName: string;
  parentId: string | null;
  path: string;
  depth: number;
  leaf: boolean;
  rootId?: string;
  rootName?: string;
  parametersCount?: number;
}

export interface AllegroCategoryParameter {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unit?: string;
  options?: Array<{ id: string; value: string }>;
  dictionary?: any;
}

export interface AllegroTaxonomyStats {
  lastSyncAt: string | null;
  totalCategories: number;
  leafCategories: number;
  rootCategories: number;
  storageType: 'LOCAL_DB_FILE' | 'MEMORY' | 'REMOTE_API';
  status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
}

export interface AllegroMatchResult {
  success: boolean;
  category: AllegroCategoryItem | null;
  confidence: number;
  source: 'ALLEGRO_LIVE_API_MATCH' | 'LOCAL_TAXONOMY_MATCH' | 'FALLBACK';
  fullPath?: string;
  suggestedCategories?: AllegroCategoryItem[];
  parameters?: AllegroCategoryParameter[];
  message?: string;
}

const LOCAL_STORAGE_TAXONOMY_KEY = 'jiguli_allegro_taxonomy_v1';
const LOCAL_STORAGE_STATS_KEY = 'jiguli_allegro_taxonomy_stats_v1';

export class AllegroTaxonomySyncService {
  private categories: AllegroCategoryItem[] = [];
  private rootCategories: AllegroCategoryItem[] = [];
  private categoryMap: Map<string, AllegroCategoryItem> = new Map();
  private stats: AllegroTaxonomyStats = {
    lastSyncAt: null,
    totalCategories: 22634,
    leafCategories: 20337,
    rootCategories: 13,
    storageType: 'LOCAL_DB_FILE',
    status: 'IDLE'
  };
  private subscribers: Array<() => void> = [];

  constructor() {
    this.initFromLocalStorage();
  }

  private initFromLocalStorage() {
    try {
      const savedStats = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
      const savedCats = localStorage.getItem(LOCAL_STORAGE_TAXONOMY_KEY);
      if (savedCats) {
        const parsed: AllegroCategoryItem[] = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.setCategoriesData(parsed);
        }
      }
    } catch {}
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => {
      try { cb(); } catch {}
    });
  }

  private setCategoriesData(cats: AllegroCategoryItem[]) {
    this.categories = cats;
    this.categoryMap.clear();
    this.rootCategories = [];

    cats.forEach(c => {
      this.categoryMap.set(String(c.id), c);
      if (c.depth === 0 || !c.parentId) {
        this.rootCategories.push(c);
      }
    });

    this.stats.totalCategories = cats.length;
    this.stats.leafCategories = cats.filter(c => c.leaf).length;
    this.stats.rootCategories = this.rootCategories.length || 13;
    this.notify();
  }

  public getStats(): AllegroTaxonomyStats {
    return { ...this.stats };
  }

  public getCategories(): AllegroCategoryItem[] {
    return this.categories;
  }

  public getRootCategories(): AllegroCategoryItem[] {
    if (this.rootCategories.length > 0) return this.rootCategories;
    return [
      { id: '5', name: 'Dom i Ogród', namePl: 'Dom i Ogród', trName: 'Ev ve Bahçe', parentId: null, path: 'Dom i Ogród', depth: 0, leaf: false },
      { id: '11763', name: 'Dziecko', namePl: 'Dziecko', trName: 'Bebek ve Çocuk', parentId: null, path: 'Dziecko', depth: 0, leaf: false },
      { id: '42540aec-367a-4e5e-b411-17c09b08e41f', name: 'Elektronika', namePl: 'Elektronika', trName: 'Elektronik', parentId: null, path: 'Elektronika', depth: 0, leaf: false },
      { id: 'ea5b98dd-4b6f-4bd0-8c80-22c2629132d0', name: 'Moda', namePl: 'Moda', trName: 'Moda ve Giyim', parentId: null, path: 'Moda', depth: 0, leaf: false },
      { id: '3', name: 'Motoryzacja', namePl: 'Motoryzacja', trName: 'Otomotiv ve Araç', parentId: null, path: 'Motoryzacja', depth: 0, leaf: false },
      { id: '3919', name: 'Sport i turystyka', namePl: 'Sport i turystyka', trName: 'Spor ve Doğa Sporları', parentId: null, path: 'Sport i turystyka', depth: 0, leaf: false },
      { id: '258832', name: 'Supermarket', namePl: 'Supermarket', trName: 'Süpermarket ve Petshop', parentId: null, path: 'Supermarket', depth: 0, leaf: false },
      { id: '1429', name: 'Uroda', namePl: 'Uroda', trName: 'Kozmetik ve Kişisel Bakım', parentId: null, path: 'Uroda', depth: 0, leaf: false },
      { id: '121882', name: 'Zdrowie', namePl: 'Zdrowie', trName: 'Sağlık ve Medikal', parentId: null, path: 'Zdrowie', depth: 0, leaf: false }
    ];
  }

  public getCategoryById(id: string | number): AllegroCategoryItem | undefined {
    return this.categoryMap.get(String(id).trim());
  }

  public async fetchCategories(params?: {
    parentId?: string;
    rootsOnly?: boolean;
    q?: string;
    leafOnly?: boolean;
    limit?: number;
  }): Promise<AllegroCategoryItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.parentId) query.set('parentId', params.parentId);
      if (params?.rootsOnly) query.set('rootsOnly', 'true');
      if (params?.q) query.set('q', params.q);
      if (params?.leafOnly) query.set('leafOnly', 'true');
      if (params?.limit) query.set('limit', String(params.limit));

      const res = await fetch(`/api/allegro/taxonomy/categories?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          // Cache into map
          data.categories.forEach((c: AllegroCategoryItem) => this.categoryMap.set(String(c.id), c));
          return data.categories;
        }
      }
    } catch (err) {
      console.warn('Allegro fetchCategories error:', err);
    }
    return [];
  }

  public async loadAllCategoriesFromBackend(): Promise<AllegroCategoryItem[]> {
    try {
      // First try to load taxonomy stats & roots
      const statsRes = await fetch('/api/allegro/taxonomy/stats').catch(() => null);
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        this.stats = {
          ...this.stats,
          totalCategories: statsData.totalCategories || 22634,
          leafCategories: statsData.leafCategories || 20337,
          rootCategories: statsData.rootCategories || 13,
          lastSyncAt: statsData.lastSyncAt || new Date().toISOString()
        };
      }

      // Fetch primary active/popular categories for fast UI browsing
      const res = await fetch('/api/allegro/taxonomy/categories?limit=500');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          this.setCategoriesData(data.categories);
          try {
            localStorage.setItem(LOCAL_STORAGE_TAXONOMY_KEY, JSON.stringify(data.categories));
            localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(this.stats));
          } catch {}
          return data.categories;
        }
      }
    } catch (err) {
      console.warn('loadAllCategoriesFromBackend error:', err);
    }
    return this.categories;
  }

  /**
   * Ürün başlığından veya bilgilerinden Allegro resmi kategorisini akıllıca eşleştirir.
   * Canlı Allegro API'sini (/sale/matching-categories) veya yerel 22k taksonomi veritabanını kullanır.
   */
  public async matchCategory(product: {
    title: string;
    titleEn?: string;
    titlePl?: string;
    sku?: string;
    ean?: string;
    categoryName?: string;
    description?: string;
  }): Promise<AllegroMatchResult> {
    try {
      const res = await fetch('/api/allegro/taxonomy/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.category) {
          this.categoryMap.set(String(data.category.id), data.category);
          return {
            success: true,
            category: data.category,
            confidence: data.confidence || 0.95,
            source: data.source || 'ALLEGRO_LIVE_API_MATCH',
            fullPath: data.fullPath || data.category.path,
            suggestedCategories: data.suggestedCategories || [],
            parameters: data.parameters || []
          };
        }
      }
    } catch (err) {
      console.warn('Allegro matchCategory network error:', err);
    }

    // Local fallback matching against in-memory categories
    const term = (product.titlePl || product.titleEn || product.title || '').toLowerCase();
    const matched = this.categories.find(c =>
      c.leaf && (
        c.name.toLowerCase().includes(term) ||
        (c.path && c.path.toLowerCase().includes(term))
      )
    );

    if (matched) {
      return {
        success: true,
        category: matched,
        confidence: 0.85,
        source: 'LOCAL_TAXONOMY_MATCH',
        fullPath: matched.path
      };
    }

    return {
      success: false,
      category: null,
      confidence: 0,
      source: 'FALLBACK',
      message: 'Kategori bulunamadı'
    };
  }

  public async fetchParameters(categoryId: string | number): Promise<AllegroCategoryParameter[]> {
    try {
      const res = await fetch(`/api/allegro/category-parameters?categoryId=${encodeURIComponent(String(categoryId))}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.parameters)) {
          return data.parameters;
        }
      }
    } catch {}
    return [];
  }

  public async syncAllCategories(): Promise<{ success: boolean; message: string; count: number }> {
    this.stats.status = 'SYNCING';
    this.notify();

    try {
      const res = await fetch('/api/allegro/taxonomy/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.stats.status = 'SUCCESS';
        this.stats.totalCategories = data.total || 22634;
        this.stats.leafCategories = data.leafCount || 20337;
        this.stats.lastSyncAt = new Date().toISOString();
        this.notify();
        await this.loadAllCategoriesFromBackend();
        return { success: true, message: data.message || 'Başarıyla senkronize edildi', count: data.total || 22634 };
      } else {
        this.stats.status = 'ERROR';
        this.notify();
        return { success: false, message: data.message || 'Senkronizasyon başarısız', count: 0 };
      }
    } catch (err: any) {
      this.stats.status = 'ERROR';
      this.notify();
      return { success: false, message: err?.message || 'Ağ hatası', count: 0 };
    }
  }
}

export const allegroTaxonomySyncService = new AllegroTaxonomySyncService();
