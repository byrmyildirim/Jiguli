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

export const ALLEGRO_TAXONOMY: AllegroTaxonomyCategory[] = [
  // 1. ANAKARTLAR / MOTHERBOARDS / PŁYTY GŁÓWNE
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
      { id: '225693', name: 'Kod producenta', trName: 'Üretici Kodu / Model', enName: 'Manufacturer Code', required: true, type: 'STRING', defaultValue: 'B450 AM4' },
      { id: '225694', name: 'EAN', trName: 'Barkod (EAN / GTIN)', enName: 'EAN/GTIN Barcode', required: true, type: 'STRING' },
      { id: '4228_socket', name: 'Gniazdo procesora', trName: 'İşlemci Soketi', enName: 'CPU Socket', required: true, type: 'DICTIONARY', options: ['Socket AM4', 'Socket AM5', 'LGA 1700', 'LGA 1200', 'LGA 1151', 'Socket TR4', 'LGA 2066'], defaultValue: 'Socket AM4' },
      { id: '4228_chipset', name: 'Chipset', trName: 'Yonga Seti (Chipset)', enName: 'Chipset', required: true, type: 'DICTIONARY', options: ['AMD B450', 'AMD B550', 'AMD X570', 'AMD A520', 'AMD X670', 'Intel B760', 'Intel Z790', 'Intel H610', 'Intel B660', 'Intel Z690'], defaultValue: 'AMD B450' },
      { id: '4228_format', name: 'Format płyty', trName: 'Anakart Boyutu (Form Faktör)', enName: 'Form Factor', required: true, type: 'DICTIONARY', options: ['Micro ATX', 'ATX', 'Mini ITX', 'Extended ATX'], defaultValue: 'Micro ATX' },
      { id: '4228_ramtype', name: 'Typ pamięci RAM', trName: 'Bellek Türü (RAM Tipi)', enName: 'RAM Memory Type', required: true, type: 'DICTIONARY', options: ['DDR4', 'DDR5', 'DDR3'], defaultValue: 'DDR4' },
      { id: '4228_slots', name: 'Liczba slotów pamięci RAM', trName: 'RAM Slot Sayısı', enName: 'RAM Slots Count', required: true, type: 'DICTIONARY', options: ['2', '4', '8'], defaultValue: '2' },
      { id: '4228_m2', name: 'Liczba złączy M.2', trName: 'M.2 NVMe Yuva Sayısı', enName: 'M.2 NVMe Slots', required: false, type: 'DICTIONARY', options: ['1', '2', '3', 'Brak'], defaultValue: '1' }
    ]
  },

  // 2. İŞLEMCİLER / PROCESSORS / PROCESORY
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
      { id: '225693', name: 'Kod producenta', trName: 'Model / Parça Numarası', enName: 'Part Number', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod (EAN/GTIN)', enName: 'EAN', required: true, type: 'STRING' },
      { id: '4227_socket', name: 'Typ gniazda procesora', trName: 'Soket Tipi', enName: 'Socket Type', required: true, type: 'DICTIONARY', options: ['Socket AM4', 'Socket AM5', 'LGA 1700', 'LGA 1200', 'LGA 1151'], defaultValue: 'Socket AM4' },
      { id: '4227_cores', name: 'Liczba rdzeni', trName: 'Çekirdek Sayısı', enName: 'Number of Cores', required: true, type: 'DICTIONARY', options: ['4', '6', '8', '12', '16', '24'], defaultValue: '6' }
    ]
  },

  // 3. EKRAN KARTLARI / GRAPHICS CARDS / KARTY GRAFICZNE
  {
    id: '260018',
    namePl: 'Karty graficzne',
    nameTr: 'Ekran Kartları (GPU)',
    nameEn: 'Graphics Cards / GPUs',
    path: 'Elektronika > Komputery > Podzespoły komputerowe > Karty graficzne',
    keywords: ['ekran kartı', 'gpu', 'graphics card', 'karta graficzna', 'rtx', 'gtx', 'radeon', 'nvidia', 'amd'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Üretici Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '260018_chip', name: 'Chipset', trName: 'Grafik Yongası', enName: 'Chipset', required: true, type: 'STRING', defaultValue: 'RTX 4060' },
      { id: '260018_vram', name: 'Pamięć RAM', trName: 'VRAM Bellek', enName: 'VRAM Capacity', required: true, type: 'DICTIONARY', options: ['8 GB', '12 GB', '16 GB', '24 GB', '6 GB', '4 GB'], defaultValue: '8 GB' }
    ]
  },

  // 4. SSD & NVMe / SOLID STATE DRIVES / DYSKI SSD
  {
    id: '257745',
    namePl: 'Dyski SSD i NVMe',
    nameTr: 'SSD ve NVMe M.2 Depolama',
    nameEn: 'SSD & NVMe Storage',
    path: 'Elektronika > Komputery > Dyski i pamięci przenośne > Dyski SSD',
    keywords: ['ssd', 'nvme', 'm2', 'm.2', 'depolama', 'dysk', 'solid state drive', '512gb', '1tb', '2tb'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '257745_cap', name: 'Pojemność dysku', trName: 'Kapasite', enName: 'Capacity', required: true, type: 'DICTIONARY', options: ['1 TB', '512 GB', '2 TB', '256 GB', '4 TB'], defaultValue: '1 TB' },
      { id: '257745_format', name: 'Format dysku', trName: 'Format / Arayüz', enName: 'Form Factor', required: true, type: 'DICTIONARY', options: ['M.2', '2.5 cala SATA', 'PCI-e'], defaultValue: 'M.2' }
    ]
  },

  // 5. AKILLI SAATLER / SMARTWATCHES / SMARTWATCHE
  {
    id: '257548',
    namePl: 'Smartwatche i opaski sportowe',
    nameTr: 'Akıllı Saatler ve Bileklikler',
    nameEn: 'Smartwatches & Smart Bands',
    path: 'Elektronika > Smartwatche i akcesoria > Smartwatche',
    keywords: ['akıllı saat', 'smartwatch', 'zegarek', 'saat', 'opaska', 'smartband', 'apple watch', 'samsung'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Używany', 'Powystawowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING', defaultValue: 'Generic' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod (EAN)', enName: 'EAN', required: true, type: 'STRING' },
      { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: true, type: 'DICTIONARY', options: ['Czarny', 'Srebrny', 'Złoty', 'Szary', 'Niebieski'], defaultValue: 'Czarny' },
      { id: '2027', name: 'Kompatybilność systemowa', trName: 'İşletim Sistemi Uyumu', enName: 'OS Compatibility', required: true, type: 'DICTIONARY', options: ['Android & iOS', 'Tylko Android', 'Tylko iOS'], defaultValue: 'Android & iOS' }
    ]
  },

  // 6. BLUETOOTH KULAKLIK TWS / WIRELESS EARPHONES / SŁUCHAWKI BEZPRZEWODOWE
  {
    id: '66887',
    namePl: 'Słuchawki bezprzewodowe TWS',
    nameTr: 'Kablosuz Bluetooth Kulaklıklar (TWS)',
    nameEn: 'Wireless Bluetooth Earphones (TWS)',
    path: 'Elektronika > Sprzęt audio > Słuchawki > Bezprzewodowe',
    keywords: ['kulaklık', 'headphone', 'earphone', 'tws', 'sluchawki', 'bluetooth', 'airpods', 'anc'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Powystawowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '891', name: 'Rodzaj transmisji', trName: 'Bağlantı Türü', enName: 'Transmission Type', required: true, type: 'DICTIONARY', options: ['Bluetooth 5.3', 'Bluetooth 5.2', 'Radiowa 2.4GHz'], defaultValue: 'Bluetooth 5.3' },
      { id: '892', name: 'Konstrukcja słuchawek', trName: 'Tasarım Türü', enName: 'Design', required: true, type: 'DICTIONARY', options: ['Dokanałowe (Kulak İçi)', 'Douszne', 'Nauszne (Kulak Üstü)'], defaultValue: 'Dokanałowe (Kulak İçi)' }
    ]
  },

  // 7. USB KABLO & ŞARJ / CABLES & CHARGERS / KABLE I ŁADOWARKI
  {
    id: '124921',
    namePl: 'Kable USB-C i ładowarki',
    nameTr: 'USB-C Kablolar ve Hızlı Şarj Cihazları',
    nameEn: 'USB-C Cables & Fast Chargers',
    path: 'Elektronika > Akcesoria telefoniczne > Kable i adaptery',
    keywords: ['kablo', 'şarj', 'usb', 'usbc', 'type c', 'cable', 'charger', 'ladowarka', 'kabel', 'fast charge'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '561', name: 'Złącze', trName: 'Bağlantı Ucu', enName: 'Connector Type', required: true, type: 'DICTIONARY', options: ['USB-C do USB-C', 'USB-A do USB-C', 'USB-C do Lightning'], defaultValue: 'USB-C do USB-C' },
      { id: '562', name: 'Maksymalny prąd / Moc', trName: 'Maksimum Güç', enName: 'Max Power', required: true, type: 'DICTIONARY', options: ['65W - 100W PD', '30W PD', '15W / 3A'], defaultValue: '65W - 100W PD' }
    ]
  },

  // 8. LED AYDINLATMA / LED LIGHTING / OŚWIETLENIE LED
  {
    id: '12800',
    namePl: 'Taśmy LED i Oświetlenie Smart',
    nameTr: 'Şerit LED Aydınlatma ve Akıllı Işık Sistemleri',
    nameEn: 'LED Strips & Smart Lighting',
    path: 'Elektronika > Oświetlenie LED > Taśmy LED & Smart',
    keywords: ['led', 'şerit led', 'tasma led', 'rgb', 'tuya', 'zigbee', 'lighting', 'akıllı ışık', 'aydınlatma'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model', enName: 'Model', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '12801', name: 'Barwa światła', trName: 'Işık Rengi', enName: 'Light Color', required: true, type: 'DICTIONARY', options: ['RGB + CCT (Multicolor)', 'RGB (Multicolor)', 'Biały neutralny (4000K)', 'Biały ciepły (3000K)'], defaultValue: 'RGB + CCT (Multicolor)' },
      { id: '12802', name: 'Długość taśmy', trName: 'Şerit Uzunluğu', enName: 'Strip Length', required: true, type: 'DICTIONARY', options: ['5m', '2m', '10m', '3m'], defaultValue: '5m' }
    ]
  },

  // 9. DİZÜSTÜ BİLGİSAYARLAR / LAPTOPS / LAPTOPY
  {
    id: '491',
    namePl: 'Laptopy i notebooki',
    nameTr: 'Dizüstü Bilgisayarlar (Laptop / Notebook)',
    nameEn: 'Laptops & Notebooks',
    path: 'Elektronika > Komputery > Laptopy',
    keywords: ['laptop', 'dizüstü', 'notebook', 'komputer', 'lenovo', 'asus', 'dell', 'hp', 'macbook'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Powystawowy', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '491_ram', name: 'Wielkość pamięci RAM', trName: 'RAM Kapasitesi', enName: 'RAM Memory', required: true, type: 'DICTIONARY', options: ['16 GB', '32 GB', '8 GB', '64 GB'], defaultValue: '16 GB' },
      { id: '491_screen', name: 'Przekątna ekranu', trName: 'Ekran Boyutu', enName: 'Screen Size', required: true, type: 'DICTIONARY', options: ['15.6 cala', '16 cali', '14 cali', '17.3 cala'], defaultValue: '15.6 cala' }
    ]
  },

  // 10. AKILLI TELEFONLAR / SMARTPHONES / SMARTFONY
  {
    id: '165',
    namePl: 'Smartfony i telefony komórkowe',
    nameTr: 'Akıllı Telefonlar (Cep Telefonu)',
    nameEn: 'Smartphones & Mobile Phones',
    path: 'Elektronika > Telefony i Akcesoria > Smartfony',
    keywords: ['telefon', 'akıllı telefon', 'smartphone', 'smartfon', 'iphone', 'samsung', 'xiaomi', 'cep telefonu'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy', 'Odnowiony (Refurbished)', 'Używany'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '165_rom', name: 'Wbudowana pamięć', trName: 'Dahili Hafıza', enName: 'Internal Storage', required: true, type: 'DICTIONARY', options: ['128 GB', '256 GB', '512 GB', '64 GB', '1 TB'], defaultValue: '256 GB' }
    ]
  },

  // 11. ERKEK TİŞÖRT & GİYİM / T-SHIRTS / T-SHIRTY MĘSKIE
  {
    id: '1454',
    namePl: 'T-shirty męskie',
    nameTr: 'Erkek Tişört ve Günlük Giyim',
    nameEn: "Men's T-Shirts & Apparel",
    path: 'Moda > Odzież męska > T-shirty',
    keywords: ['tişört', 'tshirt', 't-shirt', 'koszulka', 'erkek tişört', 'giyim', 'moda', 'tekstil'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '11324', name: 'Rozmiar', trName: 'Beden', enName: 'Size', required: true, type: 'DICTIONARY', options: ['M', 'L', 'XL', 'S', 'XXL', 'Oversize'], defaultValue: 'L' },
      { id: '2026', name: 'Kolor', trName: 'Renk', enName: 'Color', required: true, type: 'DICTIONARY', options: ['Czarny', 'Biały', 'Granatowy', 'Szary'], defaultValue: 'Czarny' },
      { id: '11325', name: 'Materiał dominujący', trName: 'Kumaş Türü', enName: 'Material', required: true, type: 'DICTIONARY', options: ['100% Bawełna (Pamuk)', 'Bawełna z elastanem', 'Poliester'], defaultValue: '100% Bawełna (Pamuk)' }
    ]
  },

  // 12. EV TEKSTİLİ / BEDDING / POŚCIEL
  {
    id: '3690',
    namePl: 'Pościel i komplety pościeli',
    nameTr: 'Nevresim Takımı ve Ev Tekstili',
    nameEn: 'Bedding Sets & Home Textiles',
    path: 'Dom i Ogród > Wyposażenie > Tekstylia domowe > Pościel',
    keywords: ['nevresim', 'yorgan', 'yastık', 'posciel', 'tekstylia', 'ev tekstili', 'bedding', 'pamuk'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '3691', name: 'Rodzaj', trName: 'Tür', enName: 'Type', required: true, type: 'DICTIONARY', options: ['komplet pościeli', 'poszwa na kołdrę', 'poszewka na poduszkę'], defaultValue: 'komplet pościeli' },
      { id: '3693', name: 'Materiał', trName: 'Kumaş', enName: 'Material', required: true, type: 'DICTIONARY', options: ['bawełna', 'satyna bawełniana', 'mikrofibra'], defaultValue: 'satyna bawełniana' }
    ]
  },

  // 13. MUTFAK & KAHVE MAKİNELERİ / COFFEE MACHINES / EKSPRESY DO KAWY
  {
    id: '67414',
    namePl: 'Ekspresy ciśnieniowe do kawy',
    nameTr: 'Basınçlı Kahve Makineleri ve Mutfak Aletleri',
    nameEn: 'Espresso & Coffee Machines',
    path: 'Dom i Ogród > Kuchnia > Ekspresy ciśnieniowe',
    keywords: ['kahve makinesi', 'espresso', 'kahve', 'ekspres', 'kawa', 'mutfak', 'agd', 'coffee machine'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '344', name: 'Ciśnienie', trName: 'Basınç (Bar)', enName: 'Pressure', required: true, type: 'DICTIONARY', options: ['15 bar', '19 bar', '20 bar'], defaultValue: '15 bar' }
    ]
  },

  // 14. EL ALETLERİ & MATKAP / POWER TOOLS / ELEKTRONARZĘDZIA
  {
    id: '1531',
    namePl: 'Wkrętarki i wiertarki akumulatorowe',
    nameTr: 'Şarjlı Vidalama ve Matkaplar',
    nameEn: 'Cordless Drills & Power Tools',
    path: 'Dom i Ogród > Narzędzia > Elektronarzędzia > Wkrętarki',
    keywords: ['matkap', 'vidalama', 'şarjlı matkap', 'drill', 'wkretarka', 'narzedzia', 'el aletleri', 'power tools'],
    parameters: [
      { id: '213', name: 'Stan', trName: 'Ürün Durumu', enName: 'Condition', required: true, type: 'DICTIONARY', options: ['Nowy'], defaultValue: 'Nowy' },
      { id: '11323', name: 'Marka', trName: 'Marka', enName: 'Brand', required: true, type: 'STRING' },
      { id: '225693', name: 'Kod producenta', trName: 'Model Kodu', enName: 'Model Code', required: true, type: 'STRING' },
      { id: '225694', name: 'EAN', trName: 'Barkod', enName: 'EAN', required: true, type: 'STRING' },
      { id: '1531_volt', name: 'Napięcie zasilania', trName: 'Batarya Voltajı', enName: 'Voltage', required: true, type: 'DICTIONARY', options: ['18 V', '12 V', '20 V', '24 V'], defaultValue: '18 V' }
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
  return ALLEGRO_TAXONOMY.find(c => c.id === String(id).trim());
}

/**
 * Ürün başlığından akıllı kategori eşleme
 */
export function matchAllegroCategoryFromTitle(title: string): AllegroTaxonomyCategory {
  const t = (title || '').toLowerCase();

  // Anakartlar
  if (t.includes('płyta') || t.includes('anakart') || t.includes('motherboard') || t.includes('b450') || t.includes('b550') || t.includes('am4') || t.includes('am5')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '4228')!;
  }
  // İşlemciler
  if (t.includes('procesor') || t.includes('işlemci') || t.includes('cpu') || t.includes('ryzen') || t.includes('intel core')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '4227')!;
  }
  // Ekran kartı
  if (t.includes('karta graficzna') || t.includes('ekran kartı') || t.includes('gpu') || t.includes('rtx') || t.includes('radeon')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '260018')!;
  }
  // SSD
  if (t.includes('ssd') || t.includes('nvme') || t.includes('m.2') || t.includes('dysk')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '257745')!;
  }
  // Akıllı Saat
  if (t.includes('smartwatch') || t.includes('akıllı saat') || t.includes('zegarek') || t.includes('opaska') || t.includes('smartband')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '257548')!;
  }
  // Kulaklık
  if (t.includes('słuchawki') || t.includes('kulaklık') || t.includes('earbuds') || t.includes('earphones') || t.includes('tws')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '66887')!;
  }
  // Şarj / Kablo
  if (t.includes('kabel') || t.includes('kablo') || t.includes('ładowarka') || t.includes('şarj') || t.includes('charger')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '124921')!;
  }
  // LED
  if (t.includes('led') || t.includes('taśma') || t.includes('şerit')) {
    return ALLEGRO_TAXONOMY.find(c => c.id === '12800')!;
  }

  // Varsayılan: Płyty główne veya ilk geçerli kategori
  return ALLEGRO_TAXONOMY[0];
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
    // 2. Anakart Parametreleri
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
    } else if (param.id === '4228_slots') {
      result[param.id] = '2';
    } else if (param.id === '4228_m2') {
      result[param.id] = t.includes('M.2') || t.includes('NVME') ? '1' : 'Brak';
    } else {
      if (param.defaultValue) {
        result[param.id] = param.defaultValue;
      }
    }
  });

  return result;
}
