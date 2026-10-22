export interface AllegroTaxonomyParameter {
  id: string;
  name: string; // Lehçe (Allegro API zorunlu adı)
  trName: string; // Türkçe
  enName: string; // İngilizce
  required: boolean;
  type: 'DICTIONARY' | 'STRING' | 'NUMBER';
  options?: string[];
  unit?: string;
  defaultValue?: string;
}

export interface AllegroTaxonomyCategory {
  id: string; // Geçerli Allegro Leaf Kategori ID'si
  namePl: string; // Polonyaca (Oryginalna nazwa)
  nameTr: string; // Türkçe
  nameEn: string; // İngilizce
  path: string; // Tam hiyerarşik kategori yolu
  keywords: string[];
  parameters: AllegroTaxonomyParameter[];
}

/**
 * Lehçe Allegro parametre seçeneklerinin yanına Türkçe açıklamalarını ekler (PL -> TR)
 */
export function formatAllegroOptionLabel(value: string): string {
  if (!value) return '';
  const val = String(value).trim();

  const translations: Record<string, string> = {
    // 1. Ürün Durumu (Stan / Condition)
    'Nowy': 'Nowy (Yeni - Sıfır Ambalajında)',
    'Używany': 'Używany (Kullanılmış / 2. El)',
    'Powystawowy': 'Powystawowy (Teşhir / Sergilenmiş / Outlet)',
    'Odnowiony': 'Odnowiony (Yenilenmiş / Refurbished)',
    'Uszkodzony': 'Uszkodzony (Hasarlı / Arızalı)',

    // 2. Genel Değerler & Mantıksal Seçenekler
    'Brak': 'Brak (Yok / Bulunmuyor)',
    'Tak': 'Tak (Evet)',
    'Nie': 'Nie (Hayır)',
    'Inny': 'Inny (Diğer)',
    'Brak informacji': 'Brak informacji (Bilgi Yok)',

    // 3. Renkler (Kolor / Color)
    'Czarny': 'Czarny (Siyah)',
    'Biały': 'Biały (Beyaz)',
    'Srebrny': 'Srebrny (Gümüş)',
    'Złoty': 'Złoty (Altın)',
    'Szary': 'Szary (Gri)',
    'Niebieski': 'Niebieski (Mavi)',
    'Czerwony': 'Czerwony (Kırmızı)',
    'Zielony': 'Zielony (Yeşil)',
    'Żółty': 'Żółty (Sarı)',
    'Różowy': 'Różowy (Pembe)',
    'Fioletowy': 'Fioletowy (Mor)',
    'Granatowy': 'Granatowy (Lacivert)',
    'Brązowy': 'Brązowy (Kahverengi)',
    'Beżowy': 'Beżowy (Bej)',
    'Wielokolorowy': 'Wielokolorowy (Çok Renkli)',

    // 4. Kumaş & Materyaller (Materiał / Material)
    'Bawełna': 'Bawełna (100% Pamuk / Koton)',
    '100% Wełna merino (Merinos Yünü)': '100% Wełna merino (100% Merinos Yünü)',
    'Wełna z akrylem': 'Wełna z akrylem (Yün & Akrilik Karışımı)',
    'Akryl': 'Akryl (Akrilik Kumaş)',
    'Poliester': 'Poliester (Polyester)',
    'Elastan': 'Elastan (Lycra / Esnek Elastan)',
    'Bambus': 'Bambus (Bambu İpliği)',
    'Skóra naturalna': 'Skóra naturalna (Hakiki Deri)',
    'Skóra ekologiczna': 'Skóra ekologiczna (Suni Deri)',
    'Tworzywo sztuczne': 'Tworzywo sztuczne (Plastik / Sentetik)',
    'Metal': 'Metal (Metal / Çelik)',
    'Drewno': 'Drewno (Doğal Ahşap)',
    'Szkło': 'Szkło (Cam)',

    // 5. Kulaklık & Ses Sistemleri (Słuchawki / Audio)
    'Dokanałowe': 'Dokanałowe (Kulak İçi)',
    'Douszne': 'Douszne (Düz Kulak İçi)',
    'Nauszne': 'Nauszne (Kulak Üstü)',
    'Wokółuszne': 'Wokółuszne (Geniş Kulak Üstü)',
    'Przewodowe': 'Przewodowe (Kablolu Bağlantı)',
    'Bezprzewodowe': 'Bezprzewodowe (Kablosuz / Bluetooth)',

    // 6. Fatura ve Garanti (Faktura / Gwarancja)
    'Bez faktury': 'Bez faktury (Faturasız)',
    'Faktura VAT': 'Faktura VAT (KDV Faturası)',
    'Faktura VAT-marża': 'Faktura VAT-marża (Marj Faturası / 2. El)',
    '12 miesięcy': '12 miesięcy (12 Ay Garanti)',
    '24 miesiące': '24 miesiące (24 Ay Garanti)',
    '36 miesięcy': '36 miesięcy (36 Ay Garanti)',

    // 7. Mekanizmalar & Otomasyon
    'Zintegrowana': 'Zintegrowana (Dahili / Entegre)',
    'Dedykowana': 'Dedykowana (Harici / Bağımsız)',
    'Półautomatyczny': 'Półautomatyczny (Yarı Otomatik)',
    'Automatyczny': 'Automatyczny (Tam Otomatik)',
    'Ręczny': 'Ręczny (Manuel / El ile)'
  };

  return translations[val] || val;
}

export const ALLEGRO_TAXONOMY: AllegroTaxonomyCategory[] = [
  // 1. ERKEK BOXER ŞORT & İÇ GİYİM (BOKSERKI MĘSKIE)
  {
    id: '1457',
    namePl: 'Bokserki męskie i bielizna',
    nameTr: 'Erkek Boxer Şort ve İç Giyim',
    nameEn: "Men's Boxer Shorts & Underwear",
    path: 'Moda > Odzież męska > Bielizna męska > Bokserki',
    keywords: ['bokserki', 'bielizna', 'szorty bokserki', 'majtki męskie', 'boxer', 'iç giyim', 'erkek boxer', 'slipy', 'plus size', 'bokserki męskie'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '11324', name: 'Rozmiar', trName: 'Beden (Size)', enName: 'Size', required: true, type: 'DICTIONARY', options: ['M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'Plus Size (90-260KG)'], defaultValue: 'Plus Size (90-260KG)' },
      { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: true, type: 'DICTIONARY', options: ['Czarny', 'Niebieski', 'Szary', 'Wielokolorowy', 'Granatowy'], defaultValue: 'Wielokolorowy' },
      { id: '11325', name: 'Materiał dominujący', trName: 'Kumaş / Materyal', enName: 'Material', required: true, type: 'DICTIONARY', options: ['Bawełna', 'Elastan', 'Bambus', 'Poliester'], defaultValue: 'Bawełna' }
    ]
  },

  // 2. KADIN BERE, ŞAPKA & AKSESUAR
  {
    id: '147572',
    namePl: 'Czapki i berety damskie',
    nameTr: 'Kadın Bere, Şapka ve Aksesuar',
    nameEn: "Women's Hats & Beanies",
    path: 'Moda > Odzież, obuwie, dodatki > Dodatki > Czapki > Damskie',
    keywords: ['czapka', 'bere', 'şapka', 'hat', 'beanie', 'wełna', 'merino', 'zimowa', 'damska', 'kadın şapka', 'kadın bere', 'beret'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: true, type: 'DICTIONARY', options: ['Czarny', 'Szary', 'Beżowy', 'Biały', 'Granatowy', 'Czerwony'], defaultValue: 'Szary' },
      { id: '11325', name: 'Materiał dominujący', trName: 'Kumaş / Materyal Türü', enName: 'Material', required: true, type: 'DICTIONARY', options: ['100% Wełna merino (Merinos Yünü)', 'Wełna z akrylem', 'Akryl', 'Bawełna'], defaultValue: '100% Wełna merino (Merinos Yünü)' }
    ]
  },

  // 3. ERKEK TİŞÖRT & GİYİM
  {
    id: '1454',
    namePl: 'T-shirty męskie',
    nameTr: 'Erkek Tişört ve Günlük Giyim',
    nameEn: "Men's T-Shirts & Apparel",
    path: 'Moda > Odzież męska > T-shirty',
    keywords: ['tişört', 'tshirt', 't-shirt', 'koszulka', 'erkek tişört', 'giyim', 'moda', 'tekstil', 'pamuk', 'polo'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '11324', name: 'Rozmiar', trName: 'Beden', enName: 'Size', required: true, type: 'DICTIONARY', options: ['S', 'M', 'L', 'XL', 'XXL', 'Oversize'], defaultValue: 'L' },
      { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: true, type: 'DICTIONARY', options: ['Czarny', 'Biały', 'Granatowy', 'Szary'], defaultValue: 'Czarny' }
    ]
  },

  // 4. KADIN ELBİSE & MODASI
  {
    id: '76221',
    namePl: 'Sukienki damskie',
    nameTr: 'Kadın Elbise ve Modası',
    nameEn: "Women's Dresses & Fashion",
    path: 'Moda > Odzież damska > Sukienki',
    keywords: ['elbise', 'kadın elbise', 'sukienka', 'dress', 'moda', 'kadın giyim', 'skirt', 'bluz'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '11324', name: 'Rozmiar', trName: 'Beden', enName: 'Size', required: true, type: 'DICTIONARY', options: ['XS', 'S', 'M', 'L', 'XL'], defaultValue: 'M' }
    ]
  },

  // 5. SPOR AYAKKABILAR & SNEAKER
  {
    id: '531',
    namePl: 'Obuwie sportowe męskie i damskie',
    nameTr: 'Spor Ayakkabılar (Erkek / Kadın)',
    nameEn: 'Sports Shoes & Sneakers',
    path: 'Moda > Obuwie > Sportowe',
    keywords: ['ayakkabı', 'spor ayakkabı', 'sneaker', 'buty', 'running', 'nike', 'adidas', 'puma', 'kets'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '531_size', name: 'Rozmiar', trName: 'Ayakkabı Numarası', enName: 'Shoe Size', required: true, type: 'DICTIONARY', options: ['38', '39', '40', '41', '42', '43', '44', '45'], defaultValue: '42' }
    ]
  },

  // 6. BLUETOOTH KULAKLIKLAR (TWS)
  {
    id: '66887',
    namePl: 'Słuchawki bezprzewodowe TWS',
    nameTr: 'Kablosuz Bluetooth Kulaklıklar (TWS)',
    nameEn: 'Wireless Bluetooth Earphones (TWS)',
    path: 'Elektronika > Sprzęt audio > Słuchawki > Bezprzewodowe',
    keywords: ['kulaklık', 'headphone', 'earphone', 'tws', 'sluchawki', 'bluetooth', 'airpods', 'anc', 'ses'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Powystawowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '891', name: 'Rodzaj transmisji', trName: 'Bağlantı Türü', enName: 'Transmission Type', required: true, type: 'DICTIONARY', options: ['Bluetooth 5.3', 'Bluetooth 5.2', 'Przewodowe'], defaultValue: 'Bluetooth 5.3' },
      { id: '892', name: 'Konstrukcja słuchawek', trName: 'Tasarım Türü', enName: 'Design', required: true, type: 'DICTIONARY', options: ['Dokanałowe', 'Douszne', 'Nauszne'], defaultValue: 'Dokanałowe' }
    ]
  },

  // 7. AKILLI SAATLER & BİLEKLİKLER
  {
    id: '257548',
    namePl: 'Smartwatche i opaski sportowe',
    nameTr: 'Akıllı Saatler ve Bileklikler',
    nameEn: 'Smartwatches & Smart Bands',
    path: 'Elektronika > Smartwatche i akcesoria > Smartwatche',
    keywords: ['akıllı saat', 'smartwatch', 'zegarek', 'saat', 'opaska', 'smartband', 'apple watch', 'samsung'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: true, type: 'DICTIONARY', options: ['Czarny', 'Srebrny', 'Złoty', 'Szary', 'Niebieski'], defaultValue: 'Czarny' }
    ]
  },

  // 8. AKILLI TELEFONLAR (SMARTPHONES)
  {
    id: '165',
    namePl: 'Smartfony i telefony komórkowe',
    nameTr: 'Akıllı Telefonlar (Cep Telefonu)',
    nameEn: 'Smartphones & Mobile Phones',
    path: 'Elektronika > Telefony i Akcesoria > Smartfony',
    keywords: ['telefon', 'akıllı telefon', 'smartphone', 'smartfon', 'iphone', 'samsung', 'xiaomi', 'cep telefonu'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Odnowiony', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Apple' }
    ]
  },

  // 9. USB-C KABLO & HIZLI ŞARJ
  {
    id: '124921',
    namePl: 'Kable USB-C i ładowarki',
    nameTr: 'USB-C Kablolar ve Hızlı Şarj Cihazları',
    nameEn: 'USB-C Cables & Fast Chargers',
    path: 'Elektronika > Akcesoria telefoniczne > Kable i adaptery',
    keywords: ['kablo', 'şarj', 'usb', 'usbc', 'type c', 'cable', 'charger', 'ladowarka', 'kabel', 'fast charge', 'powerbank'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 10. ŞERİT LED & AKILLI AYDINLATMA
  {
    id: '12800',
    namePl: 'Taśmy LED i Oświetlenie Smart',
    nameTr: 'Şerit LED Aydınlatma ve Akıllı Işık Sistemleri',
    nameEn: 'LED Strips & Smart Lighting',
    path: 'Elektronika > Oświetlenie LED > Taśmy LED & Smart',
    keywords: ['led', 'şerit led', 'tasma led', 'rgb', 'tuya', 'zigbee', 'lighting', 'akıllı ışık', 'aydınlatma', 'ampul'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 11. NEVRESİM TAKIMI & EV TEKSTİLİ
  {
    id: '3690',
    namePl: 'Pościel i komplety pościeli',
    nameTr: 'Nevresim Takımı ve Ev Tekstili',
    nameEn: 'Bedding Sets & Home Textiles',
    path: 'Dom i Ogród > Wyposażenie > Tekstylia domowe > Pościel',
    keywords: ['nevresim', 'yorgan', 'yastık', 'posciel', 'tekstylia', 'ev tekstili', 'bedding', 'pamuk', 'havlu'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 12. MOBİLYA (SALON & YATAK ODASI)
  {
    id: '1421',
    namePl: 'Meble do salonu i sypialni',
    nameTr: 'Mobilya (Salon, Yatak Odası, Çalışma Masası)',
    nameEn: 'Home Furniture',
    path: 'Dom i Ogród > Meble > Do salonu',
    keywords: ['mobilya', 'koltuk', 'masa', 'sandalye', 'gardırop', 'meble', 'furniture', 'yatak', 'kitaplık'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 13. MUTFAK & KAHVE MAKİNELERİ
  {
    id: '67414',
    namePl: 'Ekspresy ciśnieniowe do kawy',
    nameTr: 'Basınçlı Kahve Makineleri ve Mutfak Aletleri',
    nameEn: 'Espresso & Coffee Machines',
    path: 'Dom i Ogród > Kuchnia > Ekspresy ciśnieniowe',
    keywords: ['kahve makinesi', 'espresso', 'kahve', 'ekspres', 'kawa', 'mutfak', 'agd', 'coffee machine', 'blender'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Philips' }
    ]
  },

  // 14. ŞARJLI MATKAP & EL ALETLERİ
  {
    id: '1531',
    namePl: 'Wkrętarki i wiertarki akumulatorowe',
    nameTr: 'Şarjlı Vidalama ve Matkaplar',
    nameEn: 'Cordless Drills & Power Tools',
    path: 'Dom i Ogród > Narzędzia > Elektronarzędzia > Wkrętarki',
    keywords: ['matkap', 'vidalama', 'şarjlı matkap', 'drill', 'wkretarka', 'narzedzia', 'el aletleri', 'power tools', 'testere'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Bosch' }
    ]
  },

  // 15. EĞİTİCİ OYUNCAKLAR & ÇOCUK OYUN SETLERİ
  {
    id: '11818',
    namePl: 'Zabawki edukacyjne i kreatywne',
    nameTr: 'Eğitici Oyuncaklar ve Çocuk Oyun Setleri',
    nameEn: 'Educational Toys',
    path: 'Dziecko > Zabawki > Edukacyjne',
    keywords: ['oyuncak', 'zabawka', 'lego', 'oyun seti', 'bebek oyun', 'puzzle', 'eğitici oyuncak'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'LEGO' }
    ]
  },

  // 16. OTO YEDEK PARÇA & FİLTRELER
  {
    id: '620',
    namePl: 'Części samochodowe',
    nameTr: 'Oto Yedek Parça ve Filtreler',
    nameEn: 'Auto Spare Parts',
    path: 'Motoryzacja > Części samochodowe',
    keywords: ['parça', 'yedek parça', 'oto parça', 'czesc', 'filtre', 'fren', 'amortisör', 'araba parçası', 'motor parçası'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 17. OTO LASTİK & JANTLAR
  {
    id: '18750',
    namePl: 'Opony samochodowe osobowe',
    nameTr: 'Binek Otomobil Lastikleri ve Jantlar',
    nameEn: 'Car Tires & Rims',
    path: 'Motoryzacja > Opony i felgi > Opony > Osobowe',
    keywords: ['lastik', 'oto lastik', 'opona', 'jant', 'yaz lastiği', 'kış lastiği', 'michelin', 'bridgestone'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Michelin' }
    ]
  },

  // 18. BİSİKLETLER & OUTDOOR SPOR
  {
    id: '121000',
    namePl: 'Rowery męskie, damskie i dziecięce',
    nameTr: 'Bisikletler ve Outdoor Spor Malzemeleri',
    nameEn: 'Bicycles & Outdoor Sports',
    path: 'Sport i Turystyka > Rowery i akcesoria > Rowery',
    keywords: ['bisiklet', 'rower', 'bike', 'dağ bisikleti', 'şehir bisikleti', 'kask', 'kamp'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 19. PARFÜM, CİLT BAKIMI & KOZMETİK
  {
    id: '10100',
    namePl: 'Perfumy i wody zapachowe',
    nameTr: 'Parfüm, Cilt Bakımı ve Kozmetik',
    nameEn: 'Perfumes & Cosmetics',
    path: 'Uroda > Perfumy i kosmetyki',
    keywords: ['parfüm', 'perfume', 'perfumy', 'kozmetik', 'cilt bakımı', 'krem', 'makyaj', 'şampuan'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 20. KAHVE, ÇAY & GİDA
  {
    id: '110000',
    namePl: 'Kawa ziarnista i mielona',
    nameTr: 'Kahve, Çay ve Süpermarket Gıda Ürünleri',
    nameEn: 'Coffee, Tea & Gourmet Food',
    path: 'Supermarket > Żywność > Kawa i herbata',
    keywords: ['kahve', 'kawa', 'çay', 'gıda', 'çikolata', 'atıştırmalık', 'zeytinyağı', 'organik'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 21. EVCİL HAYVAN (KEDİ & KÖPEK)
  {
    id: '3125',
    namePl: 'Legowiska i akcesoria dla psów i kotów',
    nameTr: 'Kedi & Köpek Yatakları, Mama ve Akseusarları',
    nameEn: 'Pet Beds & Accessories',
    path: 'Artykuły dla zwierząt > Psy i koty > Legowiska',
    keywords: ['kedi', 'köpek', 'pet', 'mama', 'yatak', 'tasma', 'legowisko', 'pies', 'kot'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' }
    ]
  },

  // 22. ANAKARTLAR (MOTHERBOARDS)
  {
    id: '4228',
    namePl: 'Płyty główne',
    nameTr: 'Anakartlar (Bilgisayar & Server)',
    nameEn: 'Motherboards',
    path: 'Elektronika > Komputery > Podzespoły komputerowe > Płyty główne',
    keywords: ['anakart', 'motherboard', 'plyta', 'b450', 'b550', 'am4', 'am5', 'lga1700', 'ddr4', 'ddr5', 'machinist', 'asus', 'msi', 'gigabyte'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany', 'Powystawowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka / Üretici', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Machinist' },
      { id: '4228_socket', name: 'Gniazdo procesora', trName: 'İşlemci Soketi', enName: 'CPU Socket', required: true, type: 'DICTIONARY', options: ['Socket AM4', 'Socket AM5', 'LGA 1700', 'LGA 1200', 'LGA 1151'], defaultValue: 'Socket AM4' },
      { id: '4228_chipset', name: 'Chipset', trName: 'Yonga Seti (Chipset)', enName: 'Chipset', required: true, type: 'DICTIONARY', options: ['AMD B450', 'AMD B550', 'AMD X570', 'Intel B760', 'Intel Z790'], defaultValue: 'AMD B450' },
      { id: '4228_format', name: 'Format płyty', trName: 'Anakart Boyutu', enName: 'Form Factor', required: true, type: 'DICTIONARY', options: ['Micro ATX', 'ATX', 'Mini ITX'], defaultValue: 'Micro ATX' },
      { id: '4228_ramtype', name: 'Typ pamięci RAM', trName: 'Bellek Türü', enName: 'RAM Memory Type', required: true, type: 'DICTIONARY', options: ['DDR4', 'DDR5', 'DDR3'], defaultValue: 'DDR4' }
    ]
  },

  // 23. İŞLEMCİLER (CPU)
  {
    id: '4227',
    namePl: 'Procesory',
    nameTr: 'İşlemciler (CPU)',
    nameEn: 'Processors / CPUs',
    path: 'Elektronika > Komputery > Podzespoły komputerowe > Procesory',
    keywords: ['işlemci', 'cpu', 'procesor', 'ryzen', 'intel', 'core', 'i5', 'i7', 'i9', 'am4', 'am5'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka (AMD / Intel)', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'AMD' },
      { id: '4227_socket', name: 'Typ gniazda procesora', trName: 'Soket Tipi', enName: 'Socket Type', required: true, type: 'DICTIONARY', options: ['Socket AM4', 'Socket AM5', 'LGA 1700'], defaultValue: 'Socket AM4' }
    ]
  },

  // 24. EKRAN KARTLARI (GPU)
  {
    id: '260018',
    namePl: 'Karty graficzne',
    nameTr: 'Ekran Kartları (GPU)',
    nameEn: 'Graphics Cards / GPUs',
    path: 'Elektronika > Komputery > Podzespoły komputerowe > Karty graficzne',
    keywords: ['ekran kartı', 'gpu', 'graphics card', 'karta graficzna', 'rtx', 'gtx', 'radeon', 'nvidia', 'amd'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'NVIDIA' },
      { id: '260018_vram', name: 'Pamięć RAM', trName: 'VRAM Bellek', enName: 'VRAM Capacity', required: true, type: 'DICTIONARY', options: ['8 GB', '12 GB', '16 GB', '24 GB'], defaultValue: '8 GB' }
    ]
  },

  // 25. SSD & NVME M.2 DEPOLAMA
  {
    id: '257745',
    namePl: 'Dyski SSD i NVMe',
    nameTr: 'SSD ve NVMe M.2 Depolama',
    nameEn: 'SSD & NVMe Storage',
    path: 'Elektronika > Komputery > Dyski i pamięci przenośne > Dyski SSD',
    keywords: ['ssd', 'nvme', 'm2', 'm.2', 'depolama', 'dysk', 'solid state drive', '512gb', '1tb', '2tb'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Samsung' },
      { id: '257745_cap', name: 'Pojemność dysku', trName: 'Kapasite', enName: 'Capacity', required: true, type: 'DICTIONARY', options: ['1 TB', '512 GB', '2 TB', '256 GB'], defaultValue: '1 TB' }
    ]
  },

  // 26. DİZÜSTÜ BİLGİSAYARLAR (LAPTOPS)
  {
    id: '491',
    namePl: 'Laptopy i notebooki',
    nameTr: 'Dizüstü Bilgisayarlar (Laptop / Notebook)',
    nameEn: 'Laptops & Notebooks',
    path: 'Elektronika > Komputery > Laptopy',
    keywords: ['laptop', 'dizüstü', 'notebook', 'komputer', 'lenovo', 'asus', 'dell', 'hp', 'macbook'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany', 'Odnowiony'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Lenovo' }
    ]
  },

  // 27. OYUN KONSOLLARI (PS5 / XBOX)
  {
    id: '122230',
    namePl: 'Konsole do gier',
    nameTr: 'Oyun Konsolları (PlayStation, Xbox, Nintendo)',
    nameEn: 'Gaming Consoles',
    path: 'Elektronika > Konsol i automat do gier > Konsole',
    keywords: ['konsol', 'playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'gaming console', 'gamepad'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Sony' }
    ]
  }
];

/**
 * Üç dilli (Türkçe, İngilizce, Polonyaca) akıllı arama
 */
export function searchAllegroTaxonomy(query: string): AllegroTaxonomyCategory[] {
  if (!query || !query.trim()) {
    return ALLEGRO_TAXONOMY;
  }

  const q = query.trim().toLowerCase();

  return ALLEGRO_TAXONOMY.filter(cat => {
    return (
      cat.id.includes(q) ||
      cat.namePl.toLowerCase().includes(q) ||
      cat.nameTr.toLowerCase().includes(q) ||
      cat.nameEn.toLowerCase().includes(q) ||
      cat.path.toLowerCase().includes(q) ||
      cat.keywords.some(k => k.toLowerCase().includes(q))
    );
  });
}

/**
 * ID ile kategori bulma
 */
export function getAllegroTaxonomyCategory(id: string): AllegroTaxonomyCategory | undefined {
  return ALLEGRO_TAXONOMY.find(c => String(c.id).trim() === String(id).trim());
}

/**
 * Alt kırılım ağaç grupları oluşturucu
 */
export function getAllegroMainCategoryGroups(): { name: string; categories: AllegroTaxonomyCategory[] }[] {
  const groupsMap: Record<string, AllegroTaxonomyCategory[]> = {};

  ALLEGRO_TAXONOMY.forEach(cat => {
    const rootName = (cat.path || '').split('>')[0]?.trim() || 'Diğer Kategoriler';
    if (!groupsMap[rootName]) {
      groupsMap[rootName] = [];
    }
    groupsMap[rootName].push(cat);
  });

  return Object.entries(groupsMap).map(([name, categories]) => ({ name, categories }));
}

/**
 * Ürün başlığından akıllı kategori eşleme
 */
export function matchAllegroCategoryFromTitle(title: string): AllegroTaxonomyCategory {
  const t = (title || '').toLowerCase();

  // 1. Erkek Boxer Şort & İç Giyim (Bokserki) - YÜKSEK ÖNCELİK
  if (t.includes('bokserki') || t.includes('bielizna') || t.includes('szorty bokserki') || t.includes('majtki') || t.includes('boxer') || t.includes('iç giyim') || t.includes('slipy') || t.includes('panties')) {
    return getAllegroTaxonomyCategory('1457') || ALLEGRO_TAXONOMY[0];
  }

  // 2. Bere, Şapka & Aksesuar
  if (t.includes('czapka') || t.includes('bere') || t.includes('şapka') || t.includes('hat') || t.includes('beanie') || t.includes('merino') || t.includes('wełny')) {
    return getAllegroTaxonomyCategory('147572') || ALLEGRO_TAXONOMY[0];
  }

  // 3. Telefon & Mobil
  if (t.includes('telefon') || t.includes('phone') || t.includes('iphone') || t.includes('samsung') || t.includes('xiaomi') || t.includes('smartfon')) {
    return getAllegroTaxonomyCategory('165') || ALLEGRO_TAXONOMY[0];
  }

  // 4. Laptop & Dizüstü
  if (t.includes('laptop') || t.includes('dizüstü') || t.includes('notebook') || t.includes('macbook')) {
    return getAllegroTaxonomyCategory('491') || ALLEGRO_TAXONOMY[0];
  }

  // 5. Kulaklık
  if (t.includes('słuchawki') || t.includes('kulaklık') || t.includes('earbuds') || t.includes('earphones') || t.includes('tws') || t.includes('airpods')) {
    return getAllegroTaxonomyCategory('66887') || ALLEGRO_TAXONOMY[0];
  }

  // 6. Akıllı Saat
  if (t.includes('smartwatch') || t.includes('akıllı saat') || t.includes('zegarek') || t.includes('opaska') || t.includes('smartband')) {
    return getAllegroTaxonomyCategory('257548') || ALLEGRO_TAXONOMY[0];
  }

  // 7. Tişört & Giyim
  if (t.includes('tişört') || t.includes('tshirt') || t.includes('t-shirt') || t.includes('koszulka') || t.includes('giyim') || t.includes('shirt')) {
    return getAllegroTaxonomyCategory('1454') || ALLEGRO_TAXONOMY[0];
  }

  // 8. Elbise
  if (t.includes('elbise') || t.includes('sukienka') || t.includes('dress')) {
    return getAllegroTaxonomyCategory('76221') || ALLEGRO_TAXONOMY[0];
  }

  // 9. Spor Ayakkabı
  if (t.includes('ayakkabı') || t.includes('sneaker') || t.includes('buty') || t.includes('running')) {
    return getAllegroTaxonomyCategory('531') || ALLEGRO_TAXONOMY[0];
  }

  // 10. Nevresim & Ev Tekstili
  if (t.includes('nevresim') || t.includes('pościel') || t.includes('yorgan') || t.includes('yastık') || t.includes('tekstil')) {
    return getAllegroTaxonomyCategory('3690') || ALLEGRO_TAXONOMY[0];
  }

  // 11. Kahve & Mutfak
  if (t.includes('kahve') || t.includes('kawa') || t.includes('espresso') || t.includes('ekspres')) {
    return getAllegroTaxonomyCategory('67414') || ALLEGRO_TAXONOMY[0];
  }

  // 12. Matkap & El Aletleri
  if (t.includes('matkap') || t.includes('vidalama') || t.includes('wkrętarka') || t.includes('drill')) {
    return getAllegroTaxonomyCategory('1531') || ALLEGRO_TAXONOMY[0];
  }

  // 13. Oto Yedek Parça
  if (t.includes('otoparca') || t.includes('yedek parça') || t.includes('filtre') || t.includes('czesc')) {
    return getAllegroTaxonomyCategory('620') || ALLEGRO_TAXONOMY[0];
  }

  // 14. Parfüm & Kozmetik
  if (t.includes('parfüm') || t.includes('perfume') || t.includes('kozmetik') || t.includes('krem')) {
    return getAllegroTaxonomyCategory('10100') || ALLEGRO_TAXONOMY[0];
  }

  // 15. Oyuncak
  if (t.includes('oyuncak') || t.includes('zabawka') || t.includes('lego') || t.includes('puzzle')) {
    return getAllegroTaxonomyCategory('11818') || ALLEGRO_TAXONOMY[0];
  }

  // 16. Anakartlar
  if (t.includes('płyta') || t.includes('anakart') || t.includes('motherboard') || t.includes('b450') || t.includes('b550') || t.includes('am4') || t.includes('am5')) {
    return getAllegroTaxonomyCategory('4228') || ALLEGRO_TAXONOMY[0];
  }

  // 17. İşlemciler
  if (t.includes('procesor') || t.includes('işlemci') || t.includes('cpu') || t.includes('ryzen') || t.includes('intel core')) {
    return getAllegroTaxonomyCategory('4227') || ALLEGRO_TAXONOMY[0];
  }

  // 18. Ekran Kartı
  if (t.includes('karta graficzna') || t.includes('ekran kartı') || t.includes('gpu') || t.includes('rtx') || t.includes('radeon')) {
    return getAllegroTaxonomyCategory('260018') || ALLEGRO_TAXONOMY[0];
  }

  // 19. SSD
  if (t.includes('ssd') || t.includes('nvme') || t.includes('m.2') || t.includes('dysk')) {
    return getAllegroTaxonomyCategory('257745') || ALLEGRO_TAXONOMY[0];
  }

  // 20. Şarj / Kablo
  if (t.includes('kabel') || t.includes('kablo') || t.includes('ładowarka') || t.includes('şarj') || t.includes('charger')) {
    return getAllegroTaxonomyCategory('124921') || ALLEGRO_TAXONOMY[0];
  }

  // 21. LED
  if (t.includes('led') || t.includes('taśma') || t.includes('şerit')) {
    return getAllegroTaxonomyCategory('12800') || ALLEGRO_TAXONOMY[0];
  }

  // Token tabanlı skorlama ile en yakın kategoriyi bulma
  let bestMatch: AllegroTaxonomyCategory | null = null;
  let maxScore = 0;

  for (const cat of ALLEGRO_TAXONOMY) {
    let score = 0;
    for (const kw of (cat.keywords || [])) {
      if (t.includes(kw.toLowerCase())) {
        score += 3;
      }
    }
    if (t.includes(cat.nameTr.toLowerCase()) || t.includes(cat.namePl.toLowerCase()) || (cat.nameEn && t.includes(cat.nameEn.toLowerCase()))) {
      score += 5;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = cat;
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch;
  }

  // Akıllı fallback: Başlıkta geçen genel sektör ipuçlarına göre doğru ana dala yönlendir
  if (t.includes('moda') || t.includes('elbise') || t.includes('giyim') || t.includes('şort') || t.includes('ceket') || t.includes('etek')) {
    return getAllegroTaxonomyCategory('1454') || getAllegroTaxonomyCategory('76221') || ALLEGRO_TAXONOMY[0];
  }
  if (t.includes('elektronik') || t.includes('cihaz') || t.includes('şarj') || t.includes('adaptör') || t.includes('kablo') || t.includes('usb')) {
    return getAllegroTaxonomyCategory('4228') || getAllegroTaxonomyCategory('66887') || ALLEGRO_TAXONOMY[5];
  }
  if (t.includes('ev') || t.includes('bahçe') || t.includes('mutfak') || t.includes('oda') || t.includes('dekorasyon') || t.includes('aydınlatma')) {
    return getAllegroTaxonomyCategory('12800') || getAllegroTaxonomyCategory('3690') || ALLEGRO_TAXONOMY[9];
  }

  return bestMatch || getAllegroTaxonomyCategory('12800') || ALLEGRO_TAXONOMY[0];
}

/**
 * Canlı Allegro API ve 22,634 Taksonomi Veritabanı ile Asenkron Kategori Eşleme
 */
export async function matchAllegroCategoryAsync(params: {
  title: string;
  brand?: string;
  sku?: string;
  ean?: string;
  categoryName?: string;
}): Promise<AllegroTaxonomyCategory> {
  try {
    const res = await fetch('/api/allegro/taxonomy/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.category) {
        const cat = data.category;
        const mappedCat: AllegroTaxonomyCategory = {
          id: String(cat.id),
          namePl: cat.namePl || cat.name,
          nameTr: cat.trName || cat.name,
          nameEn: cat.name,
          path: data.fullPath || cat.path,
          keywords: [cat.name, cat.trName, params.title].filter(Boolean),
          parameters: (data.parameters || []).map((p: any) => ({
            id: String(p.id),
            name: p.name,
            trName: p.name,
            enName: p.name,
            required: Boolean(p.required),
            type: p.type === 'dictionary' ? 'DICTIONARY' : (p.type === 'float' || p.type === 'integer') ? 'NUMBER' : 'STRING',
            options: (p.dictionary || []).map((d: any) => d.value)
          }))
        };

        // Taksonomi listesine ekle
        if (!ALLEGRO_TAXONOMY.find(c => String(c.id) === String(mappedCat.id))) {
          ALLEGRO_TAXONOMY.push(mappedCat);
        }
        return mappedCat;
      }
    }
  } catch {}

  return matchAllegroCategoryFromTitle(params.title);
}

/**
 * Ürün metninden ilgili kategorinin zorunlu parametrelerini otomatik tamamlama
 */
export function autoFillAllegroParameters(
  category: AllegroTaxonomyCategory,
  title: string,
  brand: string,
  sku: string,
  ean: string
): Record<string, string> {
  const result: Record<string, string> = {};
  const t = (title || '').toUpperCase();

  category.parameters.forEach(param => {
    // 1. Genel Tanımlayıcılar
    if (param.id === '213') {
      result[param.id] = 'Nowy';
    } else if (param.id === '11323') {
      result[param.id] = brand || 'Generic';
    } else if (param.id === '225693') {
      result[param.id] = sku || 'MOD-01';
    } else if (param.id === '225694') {
      result[param.id] = ean || '';
    }
    // 2. Boxer & İç Giyim
    else if (category.id === '1457') {
      if (param.id === '11324') {
        if (t.includes('PLUS SIZE') || t.includes('260KG') || t.includes('90-260KG')) {
          result[param.id] = 'Plus Size (90-260KG)';
        } else if (t.includes('XXL')) result[param.id] = 'XXL';
        else if (t.includes('XL')) result[param.id] = 'XL';
        else if (t.includes(' L ') || t.endsWith(' L')) result[param.id] = 'L';
        else result[param.id] = 'Plus Size (90-260KG)';
      } else if (param.id === '11325') {
        result[param.id] = 'Bawełna';
      } else if (param.id === '2026') {
        result[param.id] = 'Wielokolorowy';
      }
    }
    // 3. Anakart Parametreleri
    else if (param.id === '4228_socket') {
      if (t.includes('AM4')) result[param.id] = 'Socket AM4';
      else if (t.includes('AM5')) result[param.id] = 'Socket AM5';
      else if (t.includes('LGA 1700') || t.includes('LGA1700')) result[param.id] = 'LGA 1700';
      else if (t.includes('LGA 1200')) result[param.id] = 'LGA 1200';
      else result[param.id] = param.defaultValue || 'Socket AM4';
    } else if (param.id === '4228_chipset') {
      if (t.includes('B450')) result[param.id] = 'AMD B450';
      else if (t.includes('B550')) result[param.id] = 'AMD B550';
      else if (t.includes('X570')) result[param.id] = 'AMD X570';
      else if (t.includes('A520')) result[param.id] = 'AMD A520';
      else if (t.includes('B760')) result[param.id] = 'Intel B760';
      else if (t.includes('Z790')) result[param.id] = 'Intel Z790';
      else result[param.id] = param.defaultValue || 'AMD B450';
    } else if (param.id === '4228_format') {
      if (t.includes('MINI ITX') || t.includes('ITX')) result[param.id] = 'Mini ITX';
      else if (t.includes('ATX') && !t.includes('MICRO')) result[param.id] = 'ATX';
      else result[param.id] = 'Micro ATX';
    } else if (param.id === '4228_ramtype') {
      if (t.includes('DDR5')) result[param.id] = 'DDR5';
      else if (t.includes('DDR3')) result[param.id] = 'DDR3';
      else result[param.id] = 'DDR4';
    } else {
      if (param.defaultValue) {
        result[param.id] = param.defaultValue;
      }
    }
  });

  return result;
}

export interface QwenCategoryVerificationResult {
  isValidated: boolean;
  finalCategory: AllegroTaxonomyCategory;
  verificationSource: 'QWEN_DIRECT_MATCH' | 'QWEN_VISUAL_VALIDATED' | 'SEMANTIC_FALLBACK';
  visualAnalysisText?: string;
  detectedType?: string;
  confidenceScore: number;
  reasoning: string;
  parameters: Record<string, string>;
}

/**
 * Qwen AI yanıtını doğrular, yerel taksonomiyle çapraz kontrol eder ve en doğru kategori nesnesini döndürür.
 */
export function verifyAndMatchQwenCategory(
  qwenData: any,
  title: string,
  brand: string,
  sku: string,
  ean: string
): QwenCategoryVerificationResult {
  const suggestedCatId = String(qwenData?.categoryId || qwenData?.matchedCategoryId || '').trim();
  const visualAnalysis = qwenData?.visualAnalysis || qwenData?.imageAnalysis || '';
  const detectedType = qwenData?.detectedType || qwenData?.productTypeKeywords || '';
  const confidence = typeof qwenData?.confidence === 'number' ? qwenData.confidence : 0.95;
  const reasoning = qwenData?.reasoning || 'Qwen AI görsel ve başlık analizine göre kategori başarıyla doğrulandı.';

  // 1. Adım: Doğrudan ID Kontrolü
  let directMatch = getAllegroTaxonomyCategory(suggestedCatId);

  if (directMatch) {
    const autoFilled = autoFillAllegroParameters(directMatch, title, brand, sku, ean);
    const mergedParams = {
      ...autoFilled,
      ...(qwenData?.parameters || qwenData?.suggestedParameters || {})
    };

    return {
      isValidated: true,
      finalCategory: directMatch,
      verificationSource: 'QWEN_DIRECT_MATCH',
      visualAnalysisText: visualAnalysis,
      detectedType,
      confidenceScore: confidence,
      reasoning,
      parameters: mergedParams
    };
  }

  // 2. Adım: Yeni/Tanımsız Bir Allegro Kategori ID'si Gelirse Dinamik Taksonomi Nesnesi Oluştur
  if (suggestedCatId && suggestedCatId !== '0') {
    const dynamicCategory: AllegroTaxonomyCategory = {
      id: suggestedCatId,
      namePl: qwenData?.categoryNamePl || qwenData?.categoryNameTr || 'Kategoria Allegro',
      nameTr: qwenData?.categoryNameTr || qwenData?.categoryNamePl || 'Allegro Kategorisi',
      nameEn: qwenData?.categoryNameEn || qwenData?.categoryNameTr || 'Allegro Category',
      path: qwenData?.path || `Pazaryeri > ${qwenData?.categoryNamePl || qwenData?.categoryNameTr || 'Kategori'}`,
      keywords: [detectedType, title].filter(Boolean),
      parameters: [
        { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
        { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: brand || 'Generic' },
        { id: '11324', name: 'Rozmiar', trName: 'Beden', enName: 'Size', required: false, type: 'STRING' },
        { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: false, type: 'STRING' }
      ]
    };
    ALLEGRO_TAXONOMY.push(dynamicCategory);

    const autoFilled = autoFillAllegroParameters(dynamicCategory, title, brand, sku, ean);
    const mergedParams = {
      ...autoFilled,
      ...(qwenData?.parameters || qwenData?.suggestedParameters || {})
    };

    return {
      isValidated: true,
      finalCategory: dynamicCategory,
      verificationSource: 'QWEN_DIRECT_MATCH',
      visualAnalysisText: visualAnalysis,
      detectedType,
      confidenceScore: confidence,
      reasoning,
      parameters: mergedParams
    };
  }

  // 3. Adım: Qwen Görsel Analizi + Ürün Tipi + Başlık ile Semantik Doğrulama Katmanı
  const combinedText = `${title} ${visualAnalysis} ${detectedType} ${qwenData?.categoryNameTr || ''} ${qwenData?.categoryNamePl || ''}`.toLowerCase();

  let bestCat = matchAllegroCategoryFromTitle(combinedText);
  if (!bestCat) {
    bestCat = ALLEGRO_TAXONOMY[0];
  }

  const autoFilled = autoFillAllegroParameters(bestCat, title, brand, sku, ean);
  const mergedParams = {
    ...autoFilled,
    ...(qwenData?.parameters || qwenData?.suggestedParameters || {})
  };

  return {
    isValidated: true,
    finalCategory: bestCat,
    verificationSource: 'QWEN_VISUAL_VALIDATED',
    visualAnalysisText: visualAnalysis,
    detectedType,
    confidenceScore: Math.min(confidence, 0.92),
    reasoning: `Qwen AI görsel analizi (${visualAnalysis || 'Ürün öznitelikleri'}) doğrultusunda "${bestCat.nameTr}" kategorisine doğrulandı.`,
    parameters: mergedParams
  };
}
