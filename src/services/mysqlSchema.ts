import { MySQLConnectionConfig } from '../types/database';

export function getFullMySQLSchemaSQL(prefix: string = 'jiguli_'): string {
  return `-- =========================================================
-- Jiguli E-Ticaret & Pazaryeri Entegrasyon Sistemi
-- MySQL 5.7+ / 8.0+ / MariaDB / Cloud Database Şeması
-- Karakter Seti: utf8mb4_unicode_ci
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- 1. SİSTEM & VERİTABANI YAPILANDIRMA TABLOSU
CREATE TABLE IF NOT EXISTS \`${prefix}db_config\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`config_key\` VARCHAR(100) NOT NULL UNIQUE,
  \`config_value\` LONGTEXT NOT NULL,
  \`description\` VARCHAR(255) NULL,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. KULLANICILAR & YETKİLENDİRME TABLOSU
CREATE TABLE IF NOT EXISTS \`${prefix}users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(80) NOT NULL UNIQUE,
  \`email\` VARCHAR(190) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`full_name\` VARCHAR(120) NOT NULL,
  \`role\` VARCHAR(50) DEFAULT 'admin',
  \`avatar\` VARCHAR(10) DEFAULT 'AD',
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`last_login_at\` DATETIME NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_username\` (\`username\`),
  INDEX \`idx_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PAZARYERİ & API KİMLİK BİLGİLERİ (API CREDENTIALS)
CREATE TABLE IF NOT EXISTS \`${prefix}api_credentials\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`platform_id\` VARCHAR(50) NOT NULL,
  \`account_name\` VARCHAR(100) NOT NULL,
  \`client_id\` VARCHAR(255) NULL,
  \`client_secret\` TEXT NULL,
  \`api_key\` TEXT NULL,
  \`api_code\` VARCHAR(100) NULL,
  \`access_token\` LONGTEXT NULL,
  \`refresh_token\` LONGTEXT NULL,
  \`token_expires_at\` BIGINT DEFAULT 0,
  \`environment\` VARCHAR(30) DEFAULT 'production',
  \`country\` VARCHAR(10) DEFAULT 'pl',
  \`status\` VARCHAR(30) DEFAULT 'connected',
  \`extra_config_json\` LONGTEXT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`uk_platform_acc\` (\`platform_id\`, \`account_name\`),
  INDEX \`idx_platform\` (\`platform_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. KATEGORİLER TABLOSU
CREATE TABLE IF NOT EXISTS \`${prefix}categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`category_code\` VARCHAR(100) NOT NULL UNIQUE,
  \`name\` VARCHAR(255) NOT NULL,
  \`parent_code\` VARCHAR(100) NULL,
  \`allegro_id\` VARCHAR(100) NULL,
  \`emag_id\` VARCHAR(100) NULL,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ÜRÜNLER ANA TABLOSU (PRODUCTS MASTER)
CREATE TABLE IF NOT EXISTS \`${prefix}products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`sku\` VARCHAR(100) NOT NULL UNIQUE,
  \`ean\` VARCHAR(30) NULL,
  \`title_tr\` VARCHAR(255) NOT NULL,
  \`title_pl\` VARCHAR(255) NULL,
  \`title_en\` VARCHAR(255) NULL,
  \`brand\` VARCHAR(100) DEFAULT 'OmniTech',
  \`model\` VARCHAR(100) NULL,
  \`category_code\` VARCHAR(100) NULL,
  \`category_name\` VARCHAR(200) NULL,
  \`cost_usd\` DECIMAL(10,2) DEFAULT 0.00,
  \`cost_try\` DECIMAL(10,2) DEFAULT 0.00,
  \`cost_eur\` DECIMAL(10,2) DEFAULT 0.00,
  \`stock_quantity\` INT DEFAULT 0,
  \`primary_image\` TEXT NULL,
  \`gallery_images_json\` LONGTEXT NULL,
  \`specifications_json\` LONGTEXT NULL,
  \`features_json\` LONGTEXT NULL,
  \`description_html\` LONGTEXT NULL,
  \`source_platform\` VARCHAR(50) DEFAULT 'manual',
  \`source_url\` TEXT NULL,
  \`status\` VARCHAR(30) DEFAULT 'ACTIVE',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_sku\` (\`sku\`),
  INDEX \`idx_ean\` (\`ean\`),
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PAZARYERİ TEKLİFLERİ TABLOSU (MARKETPLACE OFFERS)
CREATE TABLE IF NOT EXISTS \`${prefix}offers\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`product_id\` INT NULL,
  \`platform_id\` VARCHAR(50) NOT NULL,
  \`marketplace_offer_id\` VARCHAR(100) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`sku\` VARCHAR(100) NOT NULL,
  \`ean\` VARCHAR(30) NULL,
  \`category_id\` VARCHAR(100) NULL,
  \`category_name\` VARCHAR(200) NULL,
  \`price_amount\` DECIMAL(10,2) NOT NULL,
  \`price_currency\` VARCHAR(10) NOT NULL DEFAULT 'PLN',
  \`stock_available\` INT NOT NULL DEFAULT 0,
  \`publication_status\` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  \`smart_eligible\` TINYINT(1) DEFAULT 0,
  \`primary_image\` TEXT NULL,
  \`sync_allegro\` VARCHAR(30) DEFAULT 'unlinked',
  \`sync_emag\` VARCHAR(30) DEFAULT 'unlinked',
  \`sync_baselinker\` VARCHAR(30) DEFAULT 'unlinked',
  \`raw_payload_json\` LONGTEXT NULL,
  \`last_synced_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_offer_platform\` (\`platform_id\`),
  INDEX \`idx_offer_sku\` (\`sku\`),
  INDEX \`idx_offer_status\` (\`publication_status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. SİPARİŞLER TABLOSU (ORDERS MASTER)
CREATE TABLE IF NOT EXISTS \`${prefix}orders\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`platform_id\` VARCHAR(50) NOT NULL,
  \`marketplace_order_id\` VARCHAR(100) NOT NULL,
  \`buyer_id\` VARCHAR(100) NULL,
  \`buyer_name\` VARCHAR(150) NOT NULL,
  \`buyer_email\` VARCHAR(190) NULL,
  \`buyer_phone\` VARCHAR(50) NULL,
  \`shipping_first_name\` VARCHAR(100) NULL,
  \`shipping_last_name\` VARCHAR(100) NULL,
  \`shipping_street\` VARCHAR(255) NULL,
  \`shipping_city\` VARCHAR(100) NULL,
  \`shipping_zip\` VARCHAR(20) NULL,
  \`shipping_country\` VARCHAR(10) DEFAULT 'PL',
  \`shipping_method\` VARCHAR(100) NULL,
  \`shipping_carrier\` VARCHAR(100) NULL,
  \`shipping_cost\` DECIMAL(10,2) DEFAULT 0.00,
  \`payment_status\` VARCHAR(50) DEFAULT 'PAID',
  \`payment_type\` VARCHAR(50) DEFAULT 'ONLINE',
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'PLN',
  \`fulfillment_status\` VARCHAR(50) DEFAULT 'NEW',
  \`tracking_number\` VARCHAR(150) NULL,
  \`invoice_required\` TINYINT(1) DEFAULT 0,
  \`message_to_seller\` TEXT NULL,
  \`order_date\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_orders_platform\` (\`platform_id\`),
  INDEX \`idx_orders_fulfillment\` (\`fulfillment_status\`),
  INDEX \`idx_orders_date\` (\`order_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SİPARİŞ KALEMLERİ TABLOSU (ORDER ITEMS)
CREATE TABLE IF NOT EXISTS \`${prefix}order_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` VARCHAR(100) NOT NULL,
  \`offer_id\` VARCHAR(100) NULL,
  \`sku\` VARCHAR(100) NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`unit_price\` DECIMAL(10,2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'PLN',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_item_order\` (\`order_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. REPRICER & BUYBOX OTOMASYON KURALLARI
CREATE TABLE IF NOT EXISTS \`${prefix}repricer_rules\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`name\` VARCHAR(200) NOT NULL,
  \`platform_id\` VARCHAR(50) DEFAULT 'allegro',
  \`offer_id\` VARCHAR(100) NULL,
  \`sku\` VARCHAR(100) NULL,
  \`target_position\` VARCHAR(50) DEFAULT 'buybox',
  \`min_price\` DECIMAL(10,2) NOT NULL,
  \`max_price\` DECIMAL(10,2) NOT NULL,
  \`current_price\` DECIMAL(10,2) NOT NULL,
  \`currency\` VARCHAR(10) DEFAULT 'PLN',
  \`competitor_price\` DECIMAL(10,2) NULL,
  \`competitor_name\` VARCHAR(100) NULL,
  \`step_amount\` DECIMAL(10,2) DEFAULT 0.10,
  \`status\` VARCHAR(30) DEFAULT 'active',
  \`auto_apply\` TINYINT(1) DEFAULT 1,
  \`last_calculated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. İŞ AKIŞI & OTOMASYON KURALLARI
CREATE TABLE IF NOT EXISTS \`${prefix}automations\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`name\` VARCHAR(200) NOT NULL,
  \`description\` TEXT NULL,
  \`trigger_event\` VARCHAR(100) NOT NULL,
  \`action_type\` VARCHAR(100) NOT NULL,
  \`conditions_json\` LONGTEXT NULL,
  \`actions_json\` LONGTEXT NULL,
  \`is_enabled\` TINYINT(1) DEFAULT 1,
  \`execution_count\` INT DEFAULT 0,
  \`last_run_at\` DATETIME NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. MÜŞTERİ DESTEK, MESAJ & İADE TALEP TABLOSU
CREATE TABLE IF NOT EXISTS \`${prefix}customer_tickets\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`platform_id\` VARCHAR(50) NOT NULL,
  \`order_id\` VARCHAR(100) NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`customer_email\` VARCHAR(190) NULL,
  \`subject\` VARCHAR(255) NOT NULL,
  \`topic\` VARCHAR(100) DEFAULT 'shipping',
  \`status\` VARCHAR(50) DEFAULT 'UNREAD',
  \`messages_json\` LONGTEXT NOT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ENTEGRASYON VE SENKRONİZASYON LOGLARI
CREATE TABLE IF NOT EXISTS \`${prefix}sync_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`platform_id\` VARCHAR(50) NOT NULL,
  \`action_type\` VARCHAR(100) NOT NULL,
  \`status\` VARCHAR(30) NOT NULL,
  \`status_code\` INT DEFAULT 200,
  \`message\` TEXT NOT NULL,
  \`request_data\` LONGTEXT NULL,
  \`response_data\` LONGTEXT NULL,
  \`duration_ms\` INT DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_sync_platform\` (\`platform_id\`),
  INDEX \`idx_sync_created\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. eMAG KATEGORİ ŞEMASI & ZORUNLU/SEÇMELİ KARAKTERİSTİKLER (EMAG CATEGORY SCHEMA)
CREATE TABLE IF NOT EXISTS \`${prefix}emag_category_schema\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`category_id\` INT NOT NULL UNIQUE,
  \`name\` VARCHAR(255) NOT NULL,
  \`tr_name\` VARCHAR(255) NULL,
  \`parent_id\` INT NULL,
  \`is_allowed\` TINYINT(1) DEFAULT 1,
  \`is_leaf\` TINYINT(1) DEFAULT 1,
  \`characteristics_json\` LONGTEXT NOT NULL,
  \`mandatory_characteristics_json\` LONGTEXT NULL,
  \`optional_characteristics_json\` LONGTEXT NULL,
  \`raw_api_payload_json\` LONGTEXT NULL,
  \`synced_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_emag_cat_id\` (\`category_id\`),
  INDEX \`idx_emag_is_leaf\` (\`is_leaf\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. eMAG KATEGORİLERİ TABLOSU (EMAG CATEGORIES)
CREATE TABLE IF NOT EXISTS \`${prefix}emag_categories\` (
  \`id\` BIGINT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`parent_id\` BIGINT NULL,
  \`is_allowed\` BOOLEAN DEFAULT TRUE,
  \`full_path\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_emag_cat_parent\` (\`parent_id\`),
  INDEX \`idx_emag_cat_allowed\` (\`is_allowed\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. eMAG KATEGORİ ÖZELLİKLERİ TABLOSU (EMAG CHARACTERISTICS)
CREATE TABLE IF NOT EXISTS \`${prefix}emag_characteristics\` (
  \`id\` BIGINT PRIMARY KEY,
  \`category_id\` BIGINT NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`is_mandatory\` BOOLEAN DEFAULT FALSE,
  \`display_type\` INT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_emag_char_cat\` (\`category_id\`),
  INDEX \`idx_emag_char_mandatory\` (\`is_mandatory\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. eMAG ÖZELLİK SEÇENEK DEĞERLERİ (EMAG CHARACTERISTIC VALUES)
CREATE TABLE IF NOT EXISTS \`${prefix}emag_characteristic_values\` (
  \`id\` BIGINT PRIMARY KEY,
  \`characteristic_id\` BIGINT NOT NULL,
  \`value_name\` VARCHAR(255) NOT NULL,
  INDEX \`idx_emag_val_char\` (\`characteristic_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. ÜRÜN TİPİ & KATEGORİ EŞLEŞTİRME TABLOSU (PRODUCT CATEGORY MAPPINGS)
CREATE TABLE IF NOT EXISTS \`${prefix}product_category_mappings\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`source_type_or_keyword\` VARCHAR(255) UNIQUE NOT NULL,
  \`emag_category_id\` BIGINT NOT NULL,
  \`category_name\` VARCHAR(255) NULL,
  \`auto_matched_by\` VARCHAR(50) DEFAULT 'manual',
  \`confidence_score\` FLOAT DEFAULT 1.0,
  \`is_verified\` BOOLEAN DEFAULT TRUE,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_mapping_kw\` (\`source_type_or_keyword\`),
  INDEX \`idx_mapping_cat\` (\`emag_category_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;
}

export function getMySQLSeedDataSQL(prefix: string = 'jiguli_'): string {
  return `-- =========================================================
-- Jiguli Başlangıç Verileri (Seed Data)
-- Yönetici Kullanıcısı, API Şablonları & Örnek Kayıtlar
-- =========================================================

-- 1. Varsayılan Admin Kullanıcısı (Şifre: demo)
INSERT INTO \`${prefix}users\` (\`id\`, \`username\`, \`email\`, \`password_hash\`, \`full_name\`, \`role\`, \`avatar\`, \`is_active\`)
VALUES (1, 'demo', 'admin@jiguli.pro', '$2a$10$demohash', 'E-Ticaret Yöneticisi', 'superadmin', 'AD', 1)
ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`);

-- 2. Sistem Yapılandırması
INSERT INTO \`${prefix}db_config\` (\`config_key\`, \`config_value\`, \`description\`)
VALUES 
('system_name', 'Jiguli Cross-Border E-Commerce Suite', 'Uygulama Adı'),
('database_version', '1.0.0', 'Veritabanı Sürümü'),
('active_currency', 'PLN', 'Ana Para Birimi'),
('auto_sync_stock', '1', 'Otomatik Stok Senkronizasyonu'),
('auto_sync_orders', '1', 'Otomatik Sipariş Çekme')
ON DUPLICATE KEY UPDATE \`config_value\` = VALUES(\`config_value\`);

-- 3. Pazaryeri API Entegrasyon Şablonları
INSERT INTO \`${prefix}api_credentials\` (\`id\`, \`platform_id\`, \`account_name\`, \`client_id\`, \`client_secret\`, \`environment\`, \`country\`, \`status\`)
VALUES 
(1, 'allegro', 'Allegro Ana Mağaza (Polonya)', '', '', 'production', 'pl', 'ready'),
(2, 'emag', 'eMAG Bulgaristan (BG)', '', '', 'production', 'bg', 'ready'),
(3, 'baselinker', 'BaseLinker Global Hub', '', '', 'production', 'pl', 'ready'),
(4, 'aliexpress', 'AliExpress Dropship & Sourcing', '', '', 'production', 'cn', 'ready')
ON DUPLICATE KEY UPDATE \`account_name\` = VALUES(\`account_name\`);
`;
}
