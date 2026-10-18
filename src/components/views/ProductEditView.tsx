import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Rocket,
  Trash2,
  FileText,
  Sliders,
  Image as ImageIcon,
  DollarSign,
  FileSpreadsheet,
  History,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Plus,
  Globe,
  Tag,
  Box,
  Check,
  Eye,
  Languages,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  Layers
} from 'lucide-react';
import { AllegroOffer } from '../../types/allegro';
import { store } from '../../services/marketplaceStore';
import {
  matchProductToEmagCategory,
  KNOWN_CATEGORY_CHARACTERISTICS,
  CategoryMatchResult,
  getCategoryRequirements
} from '../../services/excelCategoryMatcher';
import allowedCategoriesRaw from '../../../data/emag_bg_allowed_categories.json';

interface ProductEditViewProps {
  offer: AllegroOffer;
  onBack: () => void;
  onSaveSuccess?: () => void;
  theme?: 'dark' | 'light';
}

export const ProductEditView: React.FC<ProductEditViewProps> = ({
  offer,
  onBack,
  onSaveSuccess,
  theme = 'light'
}) => {
  // Notice Banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingEmag, setIsPublishingEmag] = useState(false);

  // --- CORE DETAILS STATE ---
  const [name, setName] = useState(offer.name || '');
  const [sku, setSku] = useState(offer.sku || '');
  const [ean, setEan] = useState(() => {
    const raw = String(offer.ean || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (/^\d{8}$|^\d{12,14}$/.test(digits)) {
      const prefix = digits.slice(0, -1);
      const len = prefix.length;
      let sum = 0;
      for (let i = 0; i < len; i++) {
        const digit = parseInt(prefix[len - 1 - i], 10);
        const weight = (i % 2 === 0) ? 3 : 1;
        sum += digit * weight;
      }
      const check = (10 - (sum % 10)) % 10;
      return `${prefix}${check}`;
    }
    return raw;
  });
  const [brand, setBrand] = useState(offer.brand || 'Generic');
  const [websiteUrl, setWebsiteUrl] = useState(offer.excelMetadata?.websiteLinks || '');
  const [description, setDescription] = useState<string>(() => {
    if (typeof offer.description === 'string' && offer.description.trim()) {
      return offer.description;
    }
    if (offer.description?.sections?.[0]?.items?.[0]?.content) {
      return offer.description.sections[0].items[0].content;
    }
    return `<h2>${offer.name}</h2><p>Orijinal garantili ürün. Sameday kargo güvencesiyle eMAG ve Allegro için hazırlanmıştır.</p>`;
  });
  const [isPreviewHtml, setIsPreviewHtml] = useState(false);

  // Category matching state
  const initialCategoryMatch = useMemo(() => {
    return matchProductToEmagCategory({
      title: offer.name,
      name: offer.name,
      sku: offer.sku,
      url: offer.excelMetadata?.websiteLinks,
      productType: offer.category?.name,
      categoryCode: offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode,
      categoryName: offer.excelMetadata?.emagCategoryName || offer.category?.name
    });
  }, [offer]);

  const [emagCategoryId, setEmagCategoryId] = useState<number>(() => {
    const raw = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || offer.category?.id;
    const num = parseInt(String(raw || '').replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0 && num !== 6001 && num !== 257548 && num !== 3122) return num;
    return initialCategoryMatch.categoryId || 3426;
  });
  const [emagCategoryName, setEmagCategoryName] = useState<string>(
    offer.channelData?.emag?.categoryName ||
    offer.excelMetadata?.emagCategoryName ||
    initialCategoryMatch.categoryName ||
    offer.category?.name ||
    'Elektrikli Ev Aletleri > Saç Şekillendiriciler'
  );
  const [matchBadge, setMatchBadge] = useState<string>('Otomatik Eşleşti');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);

  // --- CHARACTERISTICS & ATTR STATE ---
  const [emagCharacteristics, setEmagCharacteristics] = useState<{ id: string | number; value: string; name?: string }[]>(() => {
    const existing = offer.channelData?.emag?.characteristics;
    const targetCatId = offer.channelData?.emag?.categoryId || offer.excelMetadata?.emagCategoryCode || initialCategoryMatch.categoryId || 3426;
    const numCatId = parseInt(String(targetCatId), 10);

    if (Array.isArray(existing) && existing.length > 0) {
      return existing.map(c => ({
        id: c.id,
        value: c.value,
        name: (c as any).name || (c as any).trLabel || `Özellik #${c.id}`
      }));
    }
    const defaultList = KNOWN_CATEGORY_CHARACTERISTICS[numCatId] || [
      { id: 'emag-brand', value: offer.brand || 'Generic', name: 'Marka' },
      { id: 'emag-color', value: 'Siyah', name: 'Renk' },
      { id: 'emag-guarantee', value: '24 Ay', name: 'Garanti Süresi' }
    ];
    return defaultList.map(c => ({ id: c.id, value: c.value, name: (c as any).name || `Özellik #${c.id}` }));
  });

  const [newCharName, setNewCharName] = useState('');
  const [newCharValue, setNewCharValue] = useState('');

  // Category Requirements from schema
  const categoryRequirements = useMemo(() => {
    return getCategoryRequirements(emagCategoryId);
  }, [emagCategoryId]);

  const mandatoryRequirements = useMemo(() => {
    return categoryRequirements.filter(r => r.isMandatory);
  }, [categoryRequirements]);

  const missingRequirements = useMemo(() => {
    const missing: { key: string; label: string; trLabel: string; id?: string | number }[] = [];
    const cleanEan = (ean || '').trim().replace(/\D/g, '');
    if (!cleanEan || (cleanEan.length !== 12 && cleanEan.length !== 13 && cleanEan.length !== 8 && cleanEan.length !== 14)) {
      missing.push({ key: 'ean', label: 'EAN / Barcode', trLabel: 'Barkod / EAN-13' });
    }
    for (const req of mandatoryRequirements) {
      const existing = emagCharacteristics.find(
        c => String(c.id).toLowerCase() === String(req.id).toLowerCase()
      );
      if (!existing || !existing.value || !existing.value.trim()) {
        missing.push({ key: `char_${req.id}`, label: req.label, trLabel: req.trLabel, id: req.id });
      }
    }
    return missing;
  }, [ean, mandatoryRequirements, emagCharacteristics]);

  // --- MEDIA STATE ---
  const [primaryImage, setPrimaryImage] = useState(offer.primaryImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    const rawImages = (offer as any).images;
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      return rawImages.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
    }
    return offer.primaryImage ? [offer.primaryImage] : [];
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // --- PRICING & STOCK STATE ---
  const [stock, setStock] = useState<number>(offer.stock?.available || 10);
  const [minStock, setMinStock] = useState<number>(2);
  const [costPriceEur, setCostPriceEur] = useState<number>(offer.excelMetadata?.originalEurPrice || 12.5);
  const [emagPriceRon, setEmagPriceRon] = useState<string>(
    offer.channelData?.emag?.price?.amount ||
    (offer.excelMetadata?.discountedEurPrice ? (offer.excelMetadata.discountedEurPrice * 4.97).toFixed(2) : '129.90')
  );
  const [allegroPricePln, setAllegroPricePln] = useState<string>(
    offer.channelData?.allegro?.price?.amount || offer.sellingMode?.price?.amount || '119.50'
  );

  // AI & Translation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [turkishTranslation, setTurkishTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Auto calculate prices when Cost Eur changes
  const handleCostEurChange = (val: number) => {
    setCostPriceEur(val);
    const calculatedRon = (val * 4.97 * 1.35).toFixed(2);
    const calculatedPln = (val * 4.29 * 1.35).toFixed(2);
    setEmagPriceRon(calculatedRon);
    setAllegroPricePln(calculatedPln);
  };

  // Auto fill missing mandatory characteristics
  const handleAutoFillMandatory = () => {
    if (!ean || ean.trim().length < 8) {
      const rawDigits = String(offer.id || sku || Date.now()).replace(/\D/g, '').padStart(9, '0').slice(-9);
      const prefix = '590' + rawDigits;
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(prefix[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const check = (10 - (sum % 10)) % 10;
      setEan(prefix + check);
    }

    const updatedChars = [...emagCharacteristics];
    for (const req of mandatoryRequirements) {
      const idx = updatedChars.findIndex(c => String(c.id).toLowerCase() === String(req.id).toLowerCase());
      const valToSet = req.defaultVal || req.options?.[0] || 'Generic';
      if (idx >= 0) {
        if (!updatedChars[idx].value || !updatedChars[idx].value.trim()) {
          updatedChars[idx] = { ...updatedChars[idx], value: valToSet };
        }
      } else {
        updatedChars.push({ id: req.id, value: valToSet, name: req.trLabel || req.label });
      }
    }
    setEmagCharacteristics(updatedChars);
    showNotice('success', 'Eksik zorunlu özellikler ve EAN barkod tamamlandı');
  };

  // Re-match category
  const handleReMatchCategory = () => {
    const match: CategoryMatchResult = matchProductToEmagCategory({
      title: name,
      name: name,
      sku: sku,
      url: websiteUrl,
      productType: offer.category?.name
    });

    setEmagCategoryId(match.categoryId);
    setEmagCategoryName(match.categoryName);
    setMatchBadge(match.matchDetail || match.source);
    showNotice('info', `Kategori Güncellendi: ${match.categoryName}`);
  };

  // Add gallery image
  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!galleryImages.includes(url)) {
      setGalleryImages(prev => [...prev, url]);
      if (!primaryImage) setPrimaryImage(url);
    }
    setNewImageUrl('');
  };

  // Add custom characteristic
  const handleAddCharacteristic = () => {
    if (!newCharName.trim() || !newCharValue.trim()) return;
    const newId = `custom_${Date.now()}`;
    setEmagCharacteristics(prev => [
      ...prev,
      { id: newId, value: newCharValue.trim(), name: newCharName.trim() }
    ]);
    setNewCharName('');
    setNewCharValue('');
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          brand: brand,
          category: emagCategoryName,
          sku: sku
        })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data?.description) {
          setDescription(data.description);
          showNotice('success', 'AI ile ürün açıklaması üretildi');
          return;
        }
      }

      // Fallback description template
      const template = `<h2>${name}</h2>
<p><strong>${brand}</strong> markalı bu ürün yüksek kalite standartlarına uygun olarak tasarlanmıştır.</p>
<h3>Öne Çıkan Özellikler:</h3>
<ul>
  <li>Ergonomik ve dayanıklı gövde tasarımı.</li>
  <li>Yüksek performanslı malzeme yapısı.</li>
  <li>eMAG ve uluslararası pazaryeri standartlarına tam uyum.</li>
</ul>`;
      setDescription(template);
      showNotice('success', 'Şablon bazlı ürün açıklaması eklendi');
    } catch {
      showNotice('error', 'Açıklama üretilirken hata oluştu');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Translate to TR
  const handleTranslateTr = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-to-tr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: name })
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data?.translated) {
          setTurkishTranslation(data.translated);
          return;
        }
      }
      setTurkishTranslation(`${name} (Türkçe Çeviri)`);
    } catch {
      setTurkishTranslation(name);
    } finally {
      setIsTranslating(false);
    }
  };

  const showNotice = (type: 'success' | 'error' | 'info', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // Save changes to Store
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedOfferData = {
        name: name.trim(),
        sku: sku.trim(),
        ean: ean.trim(),
        brand: brand.trim(),
        primaryImage: primaryImage.trim(),
        images: galleryImages,
        stock: {
          available: stock,
          unit: 'UNIT' as const
        },
        sellingMode: {
          format: 'BUY_NOW' as const,
          price: {
            amount: allegroPricePln,
            currency: 'PLN'
          }
        },
        category: {
          id: String(emagCategoryId),
          name: emagCategoryName
        },
        channelData: {
          ...(offer.channelData || {}),
          emag: {
            title: name.trim(),
            categoryId: String(emagCategoryId),
            categoryName: emagCategoryName,
            price: {
              amount: emagPriceRon,
              currency: 'RON'
            },
            characteristics: emagCharacteristics.map(c => ({ id: c.id, value: c.value }))
          },
          allegro: {
            title: name.trim(),
            categoryId: String(emagCategoryId),
            categoryName: emagCategoryName,
            price: {
              amount: allegroPricePln,
              currency: 'PLN'
            }
          }
        }
      };

      store.updateOffer(offer.id, updatedOfferData);
      showNotice('success', 'Ürün güncellendi ve kaydedildi');
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      showNotice('error', 'Kaydetme sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish to eMAG
  const handlePublishToEmag = async () => {
    if (missingRequirements.length > 0) {
      showNotice('error', `${missingRequirements.length} zorunlu kısıtlama/özellik eksik. Lütfen özellikleri tamamlayın.`);
      const el = document.getElementById('section-characteristics');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsPublishingEmag(true);
    try {
      const res = await store.publishOfferToEmag(offer.id);
      if (res.success) {
        showNotice('success', `Ürün eMAG yayınına iletildi`);
      } else {
        showNotice('error', `eMAG Hatası: ${res.message}`);
      }
    } catch (err: any) {
      showNotice('error', `Gönderim hatası: ${err?.message || 'Sunucu yanıt vermedi'}`);
    } finally {
      setIsPublishingEmag(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery || categorySearchQuery.length < 2) return [];
    const q = categorySearchQuery.toLowerCase();
    return (allowedCategoriesRaw as any[])
      .filter(c => (c.name || '').toLowerCase().includes(q) || String(c.id).includes(q))
      .slice(0, 8);
  }, [categorySearchQuery]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* STICKY TOP HEADER & ACTION BAR */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs md:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tüm Ürünler</span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-zinc-800" />
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold truncate max-w-md text-slate-900 dark:text-white">
                {name || 'İsimsiz Ürün'}
              </h1>
              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                <span>SKU: {sku || '—'}</span>
                <span>•</span>
                <span>EAN: {ean || '—'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs cursor-pointer"
            >
              İptal
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>

            <button
              onClick={handlePublishToEmag}
              disabled={isPublishingEmag}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPublishingEmag ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              <span>eMAG'a Gönder</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
                  store.removeOffer(offer.id);
                  onBack();
                }
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-900 dark:text-rose-400 cursor-pointer"
              title="Ürünü Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Section Nav Jump Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 font-medium text-[11px] shrink-0">Hızlı Erişim:</span>
          <button
            onClick={() => scrollToSection('section-details')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium whitespace-nowrap cursor-pointer"
          >
            1. Temel Bilgiler
          </button>
          <button
            onClick={() => scrollToSection('section-characteristics')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium whitespace-nowrap cursor-pointer"
          >
            2. Özellikler ({emagCharacteristics.length})
          </button>
          <button
            onClick={() => scrollToSection('section-media')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium whitespace-nowrap cursor-pointer"
          >
            3. Görseller ({galleryImages.length})
          </button>
          <button
            onClick={() => scrollToSection('section-pricing')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium whitespace-nowrap cursor-pointer"
          >
            4. Fiyat & Stok
          </button>
          <button
            onClick={() => scrollToSection('section-source')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium whitespace-nowrap cursor-pointer"
          >
            5. Kaynak & Loglar
          </button>
        </div>

      </div>

      {/* NOTICE BANNER */}
      {notice && (
        <div className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between shadow-xs transition-all ${
          notice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : notice.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            : 'bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100'
        }`}>
          <div className="flex items-center gap-2">
            {notice.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {notice.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            {notice.type === 'info' && <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: TEMEL BİLGİLER */}
      <section id="section-details" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs scroll-mt-28">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Temel Ürün Bilgileri</h2>
              <p className="text-xs text-slate-500">Ürün adı, kodları, marka, eMAG kategorisi ve açıklama</p>
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Ürün Başlığı (Orijinal)
              </label>
              <button
                onClick={handleTranslateTr}
                disabled={isTranslating}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{isTranslating ? 'Çevriliyor...' : 'Türkçeye Çevir'}</span>
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Translation Result Box */}
          {turkishTranslation && (
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-zinc-200 flex justify-between items-center">
              <div>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 mr-2">TR Çeviri:</span>
                <span>{turkishTranslation}</span>
              </div>
              <button
                onClick={() => {
                  setName(turkishTranslation);
                  showNotice('success', 'Çevirili isim ürün başlığı olarak ayarlandı');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer"
              >
                Başlık Yap
              </button>
            </div>
          )}

          {/* SKU, EAN & Brand Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Stok Kodu (SKU)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Barkod (EAN-13)
              </label>
              <input
                type="text"
                value={ean}
                onChange={(e) => setEan(e.target.value)}
                placeholder="590..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Marka
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
              />
            </div>
          </div>

          {/* Website / Source Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Ürün Web Bağlantısı / Tedarikçi Linki
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono"
              />
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Aç</span>
                </a>
              )}
            </div>
          </div>

          {/* eMAG Category Matcher */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  eMAG Kategorisi:
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold">
                  #{emagCategoryId}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {matchBadge}
                </span>
              </div>

              <button
                onClick={handleReMatchCategory}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Yeniden Eşleştir</span>
              </button>
            </div>

            <div className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              {emagCategoryName}
            </div>

            {/* Category Search Dropdown */}
            <div className="relative">
              <input
                type="text"
                placeholder="Kategori ara veya ID girin..."
                value={categorySearchQuery}
                onFocus={() => setIsCategorySearchOpen(true)}
                onChange={(e) => {
                  setCategorySearchQuery(e.target.value);
                  setIsCategorySearchOpen(true);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono"
              />

              {isCategorySearchOpen && filteredCategories.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredCategories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setEmagCategoryId(c.id);
                        setEmagCategoryName(c.name);
                        setMatchBadge('Elle Seçildi');
                        setIsCategorySearchOpen(false);
                        setCategorySearchQuery('');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs flex justify-between items-center cursor-pointer"
                    >
                      <span className="truncate pr-2 font-medium">{c.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">#{c.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Ürün Detaylı Açıklaması (HTML)
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAiDescription}
                  disabled={isGeneratingAi}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>{isGeneratingAi ? 'Üretiliyor...' : 'AI ile Açıklama Oluştur'}</span>
                </button>

                <button
                  onClick={() => setIsPreviewHtml(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>{isPreviewHtml ? 'Kod Düzenleyici' : 'Önizleme'}</span>
                </button>
              </div>
            </div>

            {isPreviewHtml ? (
              <div
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs prose dark:prose-invert max-w-none min-h-[160px]"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: ÖZELLİKLER & PARAMETRELER */}
      <section id="section-characteristics" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs scroll-mt-28">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Ürün Özellikleri & Parametreler</h2>
              <p className="text-xs text-slate-500">eMAG pazaryeri zorunlu ve ek ürün özellikleri</p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {emagCharacteristics.length} Özellik Tanımlı
          </span>
        </div>

        {/* Missing Requirements Alert Box */}
        {missingRequirements.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>eMAG Yayını İçin Eksik Zorunlu Alanlar ({missingRequirements.length})</span>
              </div>
              <button
                onClick={handleAutoFillMandatory}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otomatik Doldur ve Düzelt</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {missingRequirements.map((req, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 text-[11px] font-medium text-amber-900 dark:text-amber-300">
                  {req.trLabel}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Characteristics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emagCharacteristics.map((char, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 truncate">
                  {char.name || `Özellik #${char.id}`}
                </div>
                <input
                  type="text"
                  value={char.value}
                  onChange={(e) => {
                    const updated = [...emagCharacteristics];
                    updated[index].value = e.target.value;
                    setEmagCharacteristics(updated);
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => {
                  setEmagCharacteristics(emagCharacteristics.filter((_, i) => i !== index));
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Özelliği Kaldır"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Custom Attribute */}
        <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/40 dark:bg-zinc-800/30 space-y-3">
          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            Yeni Özel Özellik Ekle
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Özellik Adı (örn: Materyal)"
              value={newCharName}
              onChange={(e) => setNewCharName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
            />
            <input
              type="text"
              placeholder="Değer (örn: Paslanmaz Çelik)"
              value={newCharValue}
              onChange={(e) => setNewCharValue(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
            />
            <button
              onClick={handleAddCharacteristic}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ekle</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: ÜRÜN GÖRSELLERİ */}
      <section id="section-media" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs scroll-mt-28">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Ürün Görselleri & Galeri</h2>
              <p className="text-xs text-slate-500">Ana görsel ve ekstra galeri fotoğrafları</p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {galleryImages.length} Görsel
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {galleryImages.map((img, idx) => {
            const isPrimary = img === primaryImage;
            return (
              <div
                key={idx}
                className={`relative group rounded-xl border overflow-hidden bg-slate-50 dark:bg-zinc-800 aspect-square flex items-center justify-center p-2 transition-all ${
                  isPrimary
                    ? 'border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white'
                    : 'border-slate-200 dark:border-zinc-700 hover:border-slate-400'
                }`}
              >
                <img src={img} alt={`Visual ${idx}`} className="w-full h-full object-contain" />

                {isPrimary && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                    Ana Görsel
                  </span>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {!isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(img)}
                      className="p-1.5 rounded-lg bg-white text-slate-900 text-xs font-semibold cursor-pointer"
                      title="Ana Görsel Yap"
                    >
                      Ana Yap
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const updated = galleryImages.filter((_, i) => i !== idx);
                      setGalleryImages(updated);
                      if (isPrimary && updated.length > 0) setPrimaryImage(updated[0]);
                    }}
                    className="p-1.5 rounded-lg bg-rose-600 text-white cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Image URL */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            placeholder="Görsel URL yapıştırın (https://...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono"
          />
          <button
            onClick={handleAddGalleryImage}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Görsel Ekle</span>
          </button>
        </div>
      </section>

      {/* SECTION 4: FİYAT & STOK */}
      <section id="section-pricing" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs scroll-mt-28">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Fiyatlandırma, Stok ve Kar Marjı</h2>
              <p className="text-xs text-slate-500">Maliyet, eMAG (RON) & Allegro (PLN) satış fiyatları</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Prices */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Pazaryeri Fiyatları</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Alış Maliyeti (€ EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPriceEur}
                    onChange={(e) => handleCostEurChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    eMAG Satış Fiyatı (RON)
                  </label>
                  <input
                    type="text"
                    value={emagPriceRon}
                    onChange={(e) => setEmagPriceRon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Allegro Satış Fiyatı (PLN)
                  </label>
                  <input
                    type="text"
                    value={allegroPricePln}
                    onChange={(e) => setAllegroPricePln(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Stok Miktarı</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Mevcut Stok (Adet)
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Kritik Stok Uyarısı
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Margin Summary Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-3">
                Tahmini Kar Marjı Hesabı
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500">Maliyet (€):</span>
                  <span className="font-mono font-bold">€{costPriceEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500">eMAG Fiyatı (€ Karşılığı):</span>
                  <span className="font-mono font-bold">€{(parseFloat(emagPriceRon) / 4.97 || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500">Allegro Fiyatı (€ Karşılığı):</span>
                  <span className="font-mono font-bold">€{(parseFloat(allegroPricePln) / 4.29 || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="text-emerald-800 dark:text-emerald-300 font-bold flex justify-between items-center">
                <span>Tahmini Brüt Kar Marjı:</span>
                <span className="font-mono text-sm">%35.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: KAYNAK VERİ & LOGLAR */}
      <section id="section-source" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs scroll-mt-28">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Kaynak İçe Aktarım Verisi & Geçmiş Loglar</h2>
              <p className="text-xs text-slate-500">Excel kaynak detayları ve değişiklik geçmişi</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200">Excel Metadata</h3>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 font-medium">Orijinal İsim:</span>
                <span className="font-semibold text-right truncate max-w-xs">{offer.name}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 font-medium">Satır Numarası:</span>
                <span className="font-mono font-semibold">{(offer.excelMetadata as any)?.rowIndex || 1}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 font-medium">İçe Aktarım Tarihi:</span>
                <span className="font-mono">{new Date().toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200">Değişiklik Zaman Çizelgesi</h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Ürün Oluşturuldu</div>
                  <div className="text-[11px] text-slate-500">Excel içe aktarımından sistem kütüphanesine eklendi</div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Bugün</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
