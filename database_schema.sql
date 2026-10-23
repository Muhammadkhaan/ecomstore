-- ========================================================
-- LAAM LUXURY FASHION E-COMMERCE & ADMIN PORTAL
-- Complete MySQL Database Schema & Initial Seed Script
-- Compatible with Hostinger phpMyAdmin (MySQL / MariaDB)
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
setTimezone('+00:00');

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Owner',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_users`
--
-- Default passwords: admin123, manager123, staff123 (Bcrypt hashed)
--

INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `name`, `role`, `created_at`) VALUES
(1, 'admin@laam.com', '$2a$10$X9G7vT4K1L2mN3pQ5rS6t.uV8wX9yZ0a1b2c3d4e5f6g7h8i9j0k1', 'Laam Super Admin', 'Owner', NOW()),
(2, 'manager@laam.com', '$2a$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6a', 'Store Manager', 'Manager', NOW()),
(3, 'staff@laam.com', '$2a$10$Z6Y5X4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1Z', 'Fulfillment Staff', 'Staff', NOW());

-- --------------------------------------------------------

--
-- Table structure for table `admin_products`
--

CREATE TABLE IF NOT EXISTS `admin_products` (
  `id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `designer` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `inventory` int(11) DEFAULT 50,
  `status` varchar(50) DEFAULT 'Active',
  `image` text DEFAULT NULL,
  `secondary_image` text DEFAULT NULL,
  `variants` text DEFAULT NULL,
  `collections` text DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_products`
--

INSERT INTO `admin_products` (`id`, `title`, `description`, `designer`, `category`, `price`, `compare_at_price`, `cost_price`, `sku`, `inventory`, `status`, `image`, `secondary_image`, `variants`, `collections`, `seo_title`, `seo_description`, `created_at`) VALUES
('pd-formal-26-265-pret-kaftan-collection', 'PD Formal \'26 Embellished Silk Kaftan', 'An ethereal flowing silk kaftan from the PD Formal 26 collection featuring intricate tilla embroidery along the neckline, hand-beaded crystals, and graceful draped sleeves for effortless elegance.', 'LAAM Pret Couture', 'kaftan', 195.00, 250.00, 78.00, 'LAAM-SKU-1001', 45, 'Active', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', '[\"XS\",\"S\",\"M\",\"L\",\"XL\",\"Custom Stitch\"]', '[\"kaftan\",\"Ready to Ship\"]', 'PD Formal \'26 Embellished Silk Kaftan | Laam Luxury', 'An ethereal flowing silk kaftan from the PD Formal 26 collection featuring intricate tilla embroidery along the neckline...', NOW()),
('pd-formal-26-270-pret-kaftan-collection', 'PD Formal \'26 Zari Draped Kaftan', 'Exquisite georgette kaftan accented with lustrous gold zari border work and delicate pearl droplets along the drape. Designed for majestic fluid movement and supreme comfort.', 'LAAM Pret Couture', 'kaftan', 210.00, 275.00, 84.00, 'LAAM-SKU-1002', 50, 'Active', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', '[\"XS\",\"S\",\"M\",\"L\",\"XL\"]', '[\"kaftan\",\"Ready to Ship\"]', 'PD Formal \'26 Zari Draped Kaftan | Laam Luxury', 'Exquisite georgette kaftan accented with lustrous gold zari border work and delicate pearl droplets...', NOW()),
('pd-formal-26-207-pret-kaftan-collection', 'PD Formal \'26 Embroidered Chiffon Kaftan', 'Immaculate ivory chiffon kaftan adorned with silver dabka and resham floral vines. A timeless addition to your festive wardrobe with breezy silhouette and exquisite craftsmanship.', 'LAAM Pret Couture', 'kaftan', 185.00, 230.00, 74.00, 'LAAM-SKU-1003', 35, 'Active', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85', '[\"S\",\"M\",\"L\",\"XL\"]', '[\"kaftan\",\"Ready to Ship\"]', 'PD Formal \'26 Embroidered Chiffon Kaftan | Laam Luxury', 'Immaculate ivory chiffon kaftan adorned with silver dabka and resham floral vines...', NOW()),
('pd-velvet-102-pret-velvet-collection', 'PD Velvet Luxury Velvet Kalidar & Shawl', 'Plush micro velvet kalidar set with heavy antique gold zardozi embroidery on the bodice and hem. Comes with a matching embroidered velvet shawl for ultimate winter regal flair.', 'LAAM Pret Couture', 'velvet', 345.00, 420.00, 138.00, 'LAAM-SKU-1004', 20, 'Active', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85', '[\"XS\",\"S\",\"M\",\"L\",\"XL\",\"Custom Stitch\"]', '[\"velvet\",\"Ready to Ship\"]', 'PD Velvet Luxury Velvet Kalidar & Shawl | Laam Luxury', 'Plush micro velvet kalidar set with heavy antique gold zardozi embroidery...', NOW()),
('mehrva', 'Mehrva Handcrafted Raw Silk Ensemble', 'An exquisite handcrafted raw silk ensemble by Mehrva featuring intricate zardozi neckline embroidery, pearl accents, and a matching organza dupatta with heavy four-side borders.', 'Mehrva Couture', 'festive', 285.00, 350.00, 114.00, 'LAAM-SKU-1005', 25, 'Active', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85', '[\"XS\",\"S\",\"M\",\"L\",\"XL\",\"Custom Stitch\"]', '[\"festive\",\"Ready to Ship\"]', 'Mehrva Handcrafted Raw Silk Ensemble | Laam Luxury', 'An exquisite handcrafted raw silk ensemble by Mehrva featuring intricate zardozi neckline embroidery...', NOW()),
('sistrology-kashish-black', 'Sistrology x LAAM Kashish Black Formal Set', 'The exclusive Sistrology x LAAM collaboration piece. A sophisticated black georgette formal set featuring delicate silver thread embroidery and sleek tailored trousers.', 'Sistrology by LAAM', 'pret', 165.00, 210.00, 66.00, 'LAAM-SKU-1006', 60, 'Active', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', '[\"XS\",\"S\",\"M\",\"L\",\"XL\"]', '[\"pret\",\"Ready to Ship\"]', 'Sistrology x LAAM Kashish Black Formal Set | Laam Luxury', 'The exclusive Sistrology x LAAM collaboration piece. A sophisticated black georgette formal set...', NOW());

-- --------------------------------------------------------

--
-- Table structure for table `admin_collections`
--

CREATE TABLE IF NOT EXISTS `admin_collections` (
  `id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `handle` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'manual',
  `rule` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `image` text DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `assigned_products` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_collections`
--

INSERT INTO `admin_collections` (`id`, `title`, `description`, `handle`, `type`, `rule`, `status`, `image`, `assigned_products`) VALUES
('col-1', 'Luxury Pret Collection', 'Handcrafted luxury pretKalidars and tunics.', 'luxury-pret', 'manual', '', 'Active', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85', '[\"pd-formal-26-265-pret-kaftan-collection\",\"sistrology-kashish-black\"]'),
('col-2', 'Festive Formals 2026', 'Luminous micro-velvet and zari chiffon.', 'festive-formals', 'rule', 'category = festive', 'Active', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=85', '[]'),
('col-3', 'Bridal Couture', 'Heirloom hand-embellished bridal couture.', 'bridal-couture', 'manual', '', 'Active', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85', '[\"mehrva\"]');

-- --------------------------------------------------------

--
-- Table structure for table `admin_media`
--

CREATE TABLE IF NOT EXISTS `admin_media` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `dimensions` varchar(50) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `admin_schemas`
--

CREATE TABLE IF NOT EXISTS `admin_schemas` (
  `id` varchar(64) NOT NULL,
  `reference_type` varchar(50) NOT NULL,
  `reference_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `schema_type` varchar(100) NOT NULL,
  `json_content` text NOT NULL,
  `is_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping initial schema for table `admin_schemas`
--

INSERT INTO `admin_schemas` (`id`, `reference_type`, `reference_id`, `name`, `schema_type`, `json_content`, `is_enabled`) VALUES
('sch-1', 'global', 'global', 'Organization & Brand Schema', 'Organization', '{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"LAAM Luxury Fashion\",\n  \"url\": \"https://laam.pk\",\n  \"logo\": \"https://images.unsplash.com/photo-1566737236500-c8ac43014a67\",\n  \"sameAs\": [\n    \"https://www.facebook.com/laamofficial\",\n    \"https://www.instagram.com/laamofficial\"\n  ]\n}', 1);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_logs`
--

CREATE TABLE IF NOT EXISTS `inventory_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` varchar(64) DEFAULT NULL,
  `product_title` varchar(255) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `variant` varchar(50) DEFAULT NULL,
  `previous_stock` int(11) DEFAULT NULL,
  `new_stock` int(11) DEFAULT NULL,
  `adjustment` int(11) DEFAULT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `admin_orders`
--

CREATE TABLE IF NOT EXISTS `admin_orders` (
  `id` varchar(50) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `fulfillment_status` varchar(50) DEFAULT 'Unfulfilled',
  `payment_status` varchar(50) DEFAULT 'Paid',
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `items` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_orders`
--

INSERT INTO `admin_orders` (`id`, `customer_name`, `email`, `phone`, `shipping_address`, `shipping_city`, `shipping_country`, `total`, `currency`, `fulfillment_status`, `payment_status`, `tracking_number`, `shipping_method`, `notes`, `items`, `created_at`) VALUES
('ord-1001', 'Dr. Fatima R.', 'fatima@example.com', '+44 7700 900077', '221B Baker Street, Marylebone', 'London', 'United Kingdom', 195.00, 'USD', 'Fulfilled', 'Paid', 'DHL-EXPRESS-984321', 'DHL Express (3-5 Days)', 'Please deliver with signature required.', '[{\"title\":\"PD Formal \'26 Embellished Silk Kaftan\",\"quantity\":1,\"price\":195,\"size\":\"M\"}]', NOW()),
('ord-1002', 'Samira Malik', 'samira@example.com', '+1 416 555 0199', '742 Evergreen Terrace', 'Toronto', 'Canada', 345.00, 'USD', 'Unfulfilled', 'Paid', 'DHL-EXPRESS-984322', 'DHL Express (3-5 Days)', 'Customer requested gift packaging.', '[{\"title\":\"PD Velvet Luxury Velvet Kalidar & Shawl\",\"quantity\":1,\"price\":345,\"size\":\"L\"}]', NOW());

-- --------------------------------------------------------

--
-- Table structure for table `admin_customers`
--

CREATE TABLE IF NOT EXISTS `admin_customers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `orders_count` int(11) DEFAULT 0,
  `total_spent` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_customers`
--

INSERT INTO `admin_customers` (`id`, `name`, `email`, `phone`, `address`, `city`, `country`, `orders_count`, `total_spent`) VALUES
('cust-1', 'Dr. Fatima R.', 'fatima@example.com', '+44 7700 900077', '221B Baker Street, London', 'London', 'United Kingdom', 3, 720.00),
('cust-2', 'Samira Malik', 'samira@example.com', '+1 416 555 0199', '742 Evergreen Terrace, Toronto', 'Toronto', 'Canada', 2, 510.00);

-- --------------------------------------------------------

--
-- Table structure for table `admin_discounts`
--

CREATE TABLE IF NOT EXISTS `admin_discounts` (
  `id` varchar(50) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `discount_type` varchar(50) DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `expiry_date` varchar(50) DEFAULT NULL,
  `min_order_value` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_discounts`
--

INSERT INTO `admin_discounts` (`id`, `code`, `discount_type`, `value`, `status`, `usage_count`, `expiry_date`, `min_order_value`) VALUES
('disc-1', 'LAAM10', 'Percentage', 10.00, 'Active', 42, '2026-12-31', 100.00),
('disc-2', 'EID2026', 'Percentage', 15.00, 'Active', 128, '2026-06-30', 150.00);

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_logs`
--

CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin_activity_logs`
--

INSERT INTO `admin_activity_logs` (`id`, `user_email`, `action`, `description`, `created_at`) VALUES
(1, 'admin@laam.com', 'LOGIN', 'Admin logged in successfully', NOW()),
(2, 'admin@laam.com', 'UPDATE_PRODUCT', 'Updated inventory for PD Formal Kaftan', NOW());

-- --------------------------------------------------------

--
-- Table structure for table `store_sections`
--

CREATE TABLE IF NOT EXISTS `store_sections` (
  `id` varchar(50) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `position` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `store_sections`
--

INSERT INTO `store_sections` (`id`, `type`, `name`, `enabled`, `position`, `content`) VALUES
('sec-1', 'hero', 'Main Hero Banner', 1, 1, '{\"title\":\"Eid & Spring Festive Edit 2026\",\"subtitle\":\"Explore exquisite pure silk kaftans, handcrafted zardozi, and royal velvet formals.\",\"buttonText\":\"Explore Collection\",\"buttonLink\":\"/collections\"}'),
('sec-2', 'product_grid', 'Trending Luxury Pret Grid', 1, 2, '{\"heading\":\"Trending This Week\",\"limit\":4}');

-- --------------------------------------------------------

--
-- Table structure for table `store_theme_settings`
--

CREATE TABLE IF NOT EXISTS `store_theme_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `settings_json` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `store_theme_settings`
--

INSERT INTO `store_theme_settings` (`id`, `settings_json`) VALUES
(1, '{\"storeName\":\"LAAM Luxury Fashion\",\"announcementText\":\"Complimentary Worldwide Express DHL Shipping on Orders Over $250 · Use Code: LAAM10 for 10% Off\",\"logoText\":\"LAAM\",\"primaryColor\":\"#141414\",\"accentColor\":\"#E04F16\"}');

-- --------------------------------------------------------

--
-- Table structure for table `store_pages`
--

CREATE TABLE IF NOT EXISTS `store_pages` (
  `id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `handle` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'page',
  `content` text DEFAULT NULL,
  `builder_content` longtext DEFAULT NULL,
  `published_content` longtext DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Draft',
  `version` int(11) DEFAULT 1,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_store_pages_handle` (`handle`),
  KEY `idx_store_pages_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `store_page_versions`
--

CREATE TABLE IF NOT EXISTS `store_page_versions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` varchar(64) NOT NULL,
  `version` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `builder_content` longtext DEFAULT NULL,
  `content` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Draft',
  `change_summary` varchar(255) DEFAULT 'Updated page builder content',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_version` (`page_id`,`version`),
  KEY `idx_page_versions_page` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `store_pages`
--

INSERT INTO `store_pages` (`id`, `title`, `handle`, `type`, `content`, `builder_content`, `published_content`, `status`, `version`, `seo_title`, `seo_description`, `created_by`, `published_at`) VALUES
('page-1', 'About Laam Luxury', 'about-us', 'page', 'The premier global destination for authentic South Asian fashion...', '{\"schemaVersion\":1,\"sections\":[{\"id\":\"sec-hero-about\",\"type\":\"hero\",\"title\":\"About Hero\",\"disabled\":false,\"settings\":{\"heading\":\"About LAAM Luxury Fashion\",\"subheading\":\"The premier global destination for authentic South Asian couture and pret wear.\",\"alignment\":\"center\",\"minHeight\":\"380px\",\"overlayOpacity\":0.35,\"backgroundImage\":\"https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85\"}},{\"id\":\"sec-story-about\",\"type\":\"rich_text\",\"title\":\"Brand Story\",\"disabled\":false,\"settings\":{\"title\":\"Our Heritage & Vision\",\"content\":\"Founded to bring the richness of South Asian fashion to a worldwide audience, LAAM curates handcrafted collections from world-renowned fashion houses and avant-garde designers.\",\"layout\":\"narrow\"}}],\"globalStyles\":{\"maxWidth\":\"1280px\",\"paddingY\":\"48px\",\"backgroundColor\":\"#FAF9F6\"}}', '{\"schemaVersion\":1,\"sections\":[{\"id\":\"sec-hero-about\",\"type\":\"hero\",\"title\":\"About Hero\",\"disabled\":false,\"settings\":{\"heading\":\"About LAAM Luxury Fashion\",\"subheading\":\"The premier global destination for authentic South Asian couture and pret wear.\",\"alignment\":\"center\",\"minHeight\":\"380px\",\"overlayOpacity\":0.35,\"backgroundImage\":\"https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85\"}},{\"id\":\"sec-story-about\",\"type\":\"rich_text\",\"title\":\"Brand Story\",\"disabled\":false,\"settings\":{\"title\":\"Our Heritage & Vision\",\"content\":\"Founded to bring the richness of South Asian fashion to a worldwide audience, LAAM curates handcrafted collections from world-renowned fashion houses and avant-garde designers.\",\"layout\":\"narrow\"}}],\"globalStyles\":{\"maxWidth\":\"1280px\",\"paddingY\":\"48px\",\"backgroundColor\":\"#FAF9F6\"}}', 'Published', 1, 'About Us | LAAM Luxury Fashion', 'Discover authentic South Asian luxury fashion, hand-beaded bridal couture, and ready-to-ship pret at LAAM.', 'admin@laam.com', NOW()),
('page-2', 'Global Size Guide', 'size-guide', 'page', 'Detailed bust, waist, and hip sizing charts...', '{\"schemaVersion\":1,\"sections\":[{\"id\":\"sec-banner-size\",\"type\":\"banner\",\"title\":\"Size Guide Banner\",\"disabled\":false,\"settings\":{\"heading\":\"Global Size & Fit Guide\",\"subheading\":\"Find your perfect silhouette across US, UK, and international luxury fashion standards.\"}},{\"id\":\"sec-size-table\",\"type\":\"rich_text\",\"title\":\"Sizing Measurements\",\"disabled\":false,\"settings\":{\"title\":\"Standard Measurements (Inches)\",\"content\":\"Bust, waist, and hip sizing charts for ready-to-ship and custom stitched ensembles.\"}}]}', '{\"schemaVersion\":1,\"sections\":[{\"id\":\"sec-banner-size\",\"type\":\"banner\",\"title\":\"Size Guide Banner\",\"disabled\":false,\"settings\":{\"heading\":\"Global Size & Fit Guide\",\"subheading\":\"Find your perfect silhouette across US, UK, and international luxury fashion standards.\"}},{\"id\":\"sec-size-table\",\"type\":\"rich_text\",\"title\":\"Sizing Measurements\",\"disabled\":false,\"settings\":{\"title\":\"Standard Measurements (Inches)\",\"content\":\"Bust, waist, and hip sizing charts for ready-to-ship and custom stitched ensembles.\"}}]}', 'Published', 1, 'Global Size Guide | LAAM Luxury Fashion', 'Accurate sizing charts and fit guidelines for luxury pret and couture.', 'admin@laam.com', NOW());

INSERT INTO `store_page_versions` (`page_id`, `version`, `title`, `builder_content`, `content`, `status`, `change_summary`, `created_by`, `created_at`) VALUES
('page-1', 1, 'About Laam Luxury', '{\"schemaVersion\":1,\"sections\":[{\"id\":\"sec-hero-about\",\"type\":\"hero\",\"title\":\"About Hero\",\"disabled\":false,\"settings\":{\"heading\":\"About LAAM Luxury Fashion\",\"subheading\":\"The premier global destination for authentic South Asian couture and pret wear.\",\"alignment\":\"center\",\"minHeight\":\"380px\",\"overlayOpacity\":0.35,\"backgroundImage\":\"https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85\"}},{\"id\":\"sec-story-about\",\"type\":\"rich_text\",\"title\":\"Brand Story\",\"disabled\":false,\"settings\":{\"title\":\"Our Heritage & Vision\",\"content\":\"Founded to bring the richness of South Asian fashion to a worldwide audience, LAAM curates handcrafted collections from world-renowned fashion houses and avant-garde designers.\",\"layout\":\"narrow\"}}],\"globalStyles\":{\"maxWidth\":\"1280px\",\"paddingY\":\"48px\",\"backgroundColor\":\"#FAF9F6\"}}', 'The premier global destination for authentic South Asian fashion...', 'Published', 'Initial publication', 'admin@laam.com', NOW()),
('page-2', 1, 'Global Size Guide', '{\"schemaVersion\":1,\"sections\":[{\"id\":\"sec-banner-size\",\"type\":\"banner\",\"title\":\"Size Guide Banner\",\"disabled\":false,\"settings\":{\"heading\":\"Global Size & Fit Guide\",\"subheading\":\"Find your perfect silhouette across US, UK, and international luxury fashion standards.\"}},{\"id\":\"sec-size-table\",\"type\":\"rich_text\",\"title\":\"Sizing Measurements\",\"disabled\":false,\"settings\":{\"title\":\"Standard Measurements (Inches)\",\"content\":\"Bust, waist, and hip sizing charts for ready-to-ship and custom stitched ensembles.\"}}]}', 'Detailed bust, waist, and hip sizing charts...', 'Published', 'Initial publication', 'admin@laam.com', NOW());

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
