import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PRODUCTS } from '../data/products.ts';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laam_admin_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;
let useMemoryFallback = false;

// Robust in-memory store supporting RBAC, activity logs, orders, products, collections, customers, discounts, and theme
class MemoryStore {
  adminUsers = [
    {
      id: 1,
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@laam.com',
      passwordHash: bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 10),
      name: 'Laam Super Admin',
      role: 'Owner'
    },
    {
      id: 2,
      email: 'manager@laam.com',
      passwordHash: bcrypt.hashSync('manager123', 10),
      name: 'Store Manager',
      role: 'Manager'
    },
    {
      id: 3,
      email: 'staff@laam.com',
      passwordHash: bcrypt.hashSync('staff123', 10),
      name: 'Fulfillment Staff',
      role: 'Staff'
    }
  ];

  activityLogs = [
    { id: 1, userEmail: 'admin@laam.com', action: 'LOGIN', description: 'Admin logged in successfully', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 2, userEmail: 'admin@laam.com', action: 'UPDATE_PRODUCT', description: 'Updated inventory for PD Formal Kaftan', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 3, userEmail: 'manager@laam.com', action: 'FULFILL_ORDER', description: 'Marked order LAAM-1001 as fulfilled with DHL tracking', createdAt: new Date(Date.now() - 3600000 * 1).toISOString() }
  ];

  products = PRODUCTS.map((p, idx) => ({
    id: p.id,
    title: p.name,
    description: p.description,
    designer: p.designer,
    category: p.category,
    price: p.priceUSD,
    compareAtPrice: p.originalPriceUSD || null,
    costPrice: Math.round(p.priceUSD * 0.4),
    sku: `LAAM-SKU-${1000 + idx}`,
    inventory: 45 + idx * 5,
    status: 'Active' as 'Active' | 'Draft' | 'Archived',
    image: p.image,
    secondaryImage: p.secondaryImage || p.image,
    variants: p.sizes || ['XS', 'S', 'M', 'L', 'XL'],
    collections: [p.category, 'Ready to Ship'],
    seoTitle: `${p.name} | Laam Luxury`,
    seoDescription: p.description.slice(0, 155),
    createdAt: new Date().toISOString()
  }));

  collections = [
    { id: 'col-1', title: 'Luxury Pret Collection', handle: 'luxury-pret', type: 'manual', rule: '', status: 'Active', image: PRODUCTS[0].image },
    { id: 'col-2', title: 'Festive Formals 2026', handle: 'festive-formals', type: 'rule', rule: 'category = festive', status: 'Active', image: PRODUCTS[4].image },
  ];

  media = PRODUCTS.slice(0, 8).map((p, i) => ({
    id: `media-${i + 1}`,
    name: p.name,
    url: p.image,
    altText: p.name,
    fileSize: 245000,
    fileType: 'image/jpeg',
    uploadedAt: new Date(Date.now() - i * 86400000).toISOString()
  }));

  orders = [
    {
      id: 'ord-1001',
      customerName: 'Dr. Fatima R.',
      email: 'fatima@example.com',
      phone: '+44 7700 900077',
      shippingAddress: '221B Baker Street, Marylebone',
      shippingCity: 'London',
      shippingCountry: 'United Kingdom',
      total: 195.00,
      currency: 'USD',
      fulfillmentStatus: 'Fulfilled',
      paymentStatus: 'Paid',
      trackingNumber: 'DHL-EXPRESS-984321',
      shippingMethod: 'DHL Express (3-5 Days)',
      notes: 'Please deliver with signature required.',
      items: [{ title: PRODUCTS[0].name, quantity: 1, price: 195, size: 'M' }],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  customers = [
    {
      id: 'cust-1',
      name: 'Dr. Fatima R.',
      email: 'fatima@example.com',
      phone: '+44 7700 900077',
      address: '221B Baker Street, London',
      city: 'London',
      country: 'United Kingdom',
      ordersCount: 3,
      totalSpent: 720.00
    }
  ];

  discounts = [
    { id: 'disc-1', code: 'LAAM10', type: 'Percentage', value: 10, status: 'Active', usageCount: 42, expiryDate: '2026-12-31', minOrderValue: 100 }
  ];

  storeSections = [
    { id: 'sec-1', type: 'hero', name: 'Main Hero Banner', enabled: true, position: 1, content: { title: 'Eid & Spring Festive Edit 2026', subtitle: 'Explore exquisite pure silk kaftans, handcrafted zardozi, and royal velvet formals.', buttonText: 'Explore Collection', buttonLink: '/collections' } },
    { id: 'sec-2', type: 'product_grid', name: 'Trending Luxury Pret Grid', enabled: true, position: 2, content: { heading: 'Trending This Week', limit: 4 } }
  ];

  themeSettings = {
    storeName: 'LAAM Luxury Fashion',
    announcementText: 'Complimentary Worldwide Express DHL Shipping on Orders Over $250 · Use Code: LAAM10 for 10% Off',
    logoText: 'LAAM',
    primaryColor: '#141414',
    accentColor: '#E04F16'
  };

  storePages: any[] = [
    {
      id: 'page-1',
      title: 'About Laam Luxury',
      handle: 'about-us',
      type: 'page',
      content: 'The premier global destination for authentic South Asian fashion...',
      builderContent: {
        schemaVersion: 1,
        sections: [
          {
            id: 'sec-hero-about',
            type: 'hero',
            title: 'About Hero',
            disabled: false,
            settings: {
              heading: 'About LAAM Luxury Fashion',
              subheading: 'The premier global destination for authentic South Asian couture and pret wear.',
              alignment: 'center',
              minHeight: '380px',
              overlayOpacity: 0.35,
              backgroundImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85'
            }
          },
          {
            id: 'sec-story-about',
            type: 'rich_text',
            title: 'Brand Story',
            disabled: false,
            settings: {
              title: 'Our Heritage & Vision',
              content: 'Founded to bring the richness of South Asian fashion to a worldwide audience, LAAM curates handcrafted collections from world-renowned fashion houses and avant-garde designers.',
              layout: 'narrow'
            }
          }
        ],
        globalStyles: {
          maxWidth: '1280px',
          paddingY: '48px',
          backgroundColor: '#FAF9F6'
        }
      },
      publishedContent: {
        schemaVersion: 1,
        sections: [
          {
            id: 'sec-hero-about',
            type: 'hero',
            title: 'About Hero',
            disabled: false,
            settings: {
              heading: 'About LAAM Luxury Fashion',
              subheading: 'The premier global destination for authentic South Asian couture and pret wear.',
              alignment: 'center',
              minHeight: '380px',
              overlayOpacity: 0.35,
              backgroundImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85'
            }
          },
          {
            id: 'sec-story-about',
            type: 'rich_text',
            title: 'Brand Story',
            disabled: false,
            settings: {
              title: 'Our Heritage & Vision',
              content: 'Founded to bring the richness of South Asian fashion to a worldwide audience, LAAM curates handcrafted collections from world-renowned fashion houses and avant-garde designers.',
              layout: 'narrow'
            }
          }
        ],
        globalStyles: {
          maxWidth: '1280px',
          paddingY: '48px',
          backgroundColor: '#FAF9F6'
        }
      },
      status: 'Published',
      version: 1,
      seoTitle: 'About Us | LAAM Luxury Fashion',
      seoDescription: 'Discover authentic South Asian luxury fashion, hand-beaded bridal couture, and ready-to-ship pret at LAAM.',
      createdBy: 'admin@laam.com',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      publishedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'page-2',
      title: 'Global Size Guide',
      handle: 'size-guide',
      type: 'page',
      content: 'Detailed bust, waist, and hip sizing charts...',
      builderContent: {
        schemaVersion: 1,
        sections: [
          {
            id: 'sec-banner-size',
            type: 'banner',
            title: 'Size Guide Banner',
            disabled: false,
            settings: {
              heading: 'Global Size & Fit Guide',
              subheading: 'Find your perfect silhouette across US, UK, and international luxury fashion standards.'
            }
          },
          {
            id: 'sec-size-table',
            type: 'rich_text',
            title: 'Sizing Measurements',
            disabled: false,
            settings: {
              title: 'Standard Measurements (Inches)',
              content: 'Bust, waist, and hip sizing charts for ready-to-ship and custom stitched ensembles.'
            }
          }
        ]
      },
      publishedContent: {
        schemaVersion: 1,
        sections: [
          {
            id: 'sec-banner-size',
            type: 'banner',
            title: 'Size Guide Banner',
            disabled: false,
            settings: {
              heading: 'Global Size & Fit Guide',
              subheading: 'Find your perfect silhouette across US, UK, and international luxury fashion standards.'
            }
          },
          {
            id: 'sec-size-table',
            type: 'rich_text',
            title: 'Sizing Measurements',
            disabled: false,
            settings: {
              title: 'Standard Measurements (Inches)',
              content: 'Bust, waist, and hip sizing charts for ready-to-ship and custom stitched ensembles.'
            }
          }
        ]
      },
      status: 'Published',
      version: 1,
      seoTitle: 'Global Size Guide | LAAM Luxury Fashion',
      seoDescription: 'Accurate sizing charts and fit guidelines for luxury pret and couture.',
      createdBy: 'admin@laam.com',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      publishedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ];

  storePageVersions: any[] = [
    {
      id: 1,
      pageId: 'page-1',
      version: 1,
      title: 'About Laam Luxury',
      builderContent: {
        schemaVersion: 1,
        sections: [
          {
            id: 'sec-hero-about',
            type: 'hero',
            title: 'About Hero',
            disabled: false,
            settings: {
              heading: 'About LAAM Luxury Fashion',
              subheading: 'The premier global destination for authentic South Asian couture and pret wear.',
              alignment: 'center',
              minHeight: '380px',
              overlayOpacity: 0.35,
              backgroundImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85'
            }
          },
          {
            id: 'sec-story-about',
            type: 'rich_text',
            title: 'Brand Story',
            disabled: false,
            settings: {
              title: 'Our Heritage & Vision',
              content: 'Founded to bring the richness of South Asian fashion to a worldwide audience, LAAM curates handcrafted collections from world-renowned fashion houses and avant-garde designers.',
              layout: 'narrow'
            }
          }
        ]
      },
      content: 'The premier global destination for authentic South Asian fashion...',
      status: 'Published',
      changeSummary: 'Initial publication',
      createdBy: 'admin@laam.com',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 2,
      pageId: 'page-2',
      version: 1,
      title: 'Global Size Guide',
      builderContent: {
        schemaVersion: 1,
        sections: [
          {
            id: 'sec-banner-size',
            type: 'banner',
            title: 'Size Guide Banner',
            disabled: false,
            settings: {
              heading: 'Global Size & Fit Guide',
              subheading: 'Find your perfect silhouette across US, UK, and international luxury fashion standards.'
            }
          }
        ]
      },
      content: 'Detailed bust, waist, and hip sizing charts...',
      status: 'Published',
      changeSummary: 'Initial publication',
      createdBy: 'admin@laam.com',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ];

  schemas = [
    {
      id: 'sch-1',
      referenceType: 'global',
      referenceId: 'global',
      name: 'Organization & Brand Schema',
      schemaType: 'Organization',
      jsonContent: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "LAAM Luxury Fashion",
        "url": "https://laam.pk",
        "logo": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67",
        "sameAs": [
          "https://www.facebook.com/laamofficial",
          "https://www.instagram.com/laamofficial"
        ]
      }, null, 2),
      isEnabled: true,
      createdAt: new Date().toISOString()
    }
  ];
}

export const memoryStore = new MemoryStore();

export async function initDatabase() {
  try {
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await tempConnection.end();

    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Owner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255),
        action VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_collections (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        handle VARCHAR(255),
        type VARCHAR(50) DEFAULT 'manual',
        rule VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        image TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        assigned_products TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_media (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        alt_text VARCHAR(255),
        file_size INT,
        file_type VARCHAR(100),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_schemas (
        id VARCHAR(64) PRIMARY KEY,
        reference_type VARCHAR(50) NOT NULL,
        reference_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        schema_type VARCHAR(100) NOT NULL,
        json_content TEXT NOT NULL,
        is_enabled TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64),
        product_title VARCHAR(255),
        sku VARCHAR(100),
        variant VARCHAR(50),
        previous_stock INT,
        new_stock INT,
        adjustment INT,
        reason VARCHAR(100),
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Store Pages Table with Page Builder structured content
    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_pages (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        handle VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'page',
        content TEXT,
        builder_content LONGTEXT,
        published_content LONGTEXT,
        status VARCHAR(50) DEFAULT 'Draft',
        version INT DEFAULT 1,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_store_pages_handle (handle),
        INDEX idx_store_pages_status (status)
      );
    `);

    // Safe migration: check if columns exist in store_pages and add if missing
    try {
      const [cols]: any = await connection.query(`SHOW COLUMNS FROM store_pages;`);
      const existingCols = cols.map((c: any) => c.Field);
      if (!existingCols.includes('builder_content')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN builder_content LONGTEXT NULL AFTER content;`);
      }
      if (!existingCols.includes('published_content')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN published_content LONGTEXT NULL AFTER builder_content;`);
      }
      if (!existingCols.includes('version')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN version INT DEFAULT 1 AFTER status;`);
      }
      if (!existingCols.includes('seo_title')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN seo_title VARCHAR(255) NULL AFTER version;`);
      }
      if (!existingCols.includes('seo_description')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN seo_description TEXT NULL AFTER seo_title;`);
      }
      if (!existingCols.includes('created_by')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN created_by VARCHAR(255) NULL AFTER seo_description;`);
      }
      if (!existingCols.includes('created_at')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
      }
      if (!existingCols.includes('updated_at')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`);
      }
      if (!existingCols.includes('published_at')) {
        await connection.query(`ALTER TABLE store_pages ADD COLUMN published_at TIMESTAMP NULL DEFAULT NULL;`);
      }
    } catch (migErr: any) {
      console.warn('Note on store_pages column check:', migErr.message);
    }

    // Page Versions History Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_page_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id VARCHAR(64) NOT NULL,
        version INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        builder_content LONGTEXT,
        content TEXT,
        status VARCHAR(50) DEFAULT 'Draft',
        change_summary VARCHAR(255) DEFAULT 'Updated page builder content',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_page_versions_page (page_id),
        UNIQUE KEY uk_page_version (page_id, version)
      );
    `);

    // Seed default store pages in MySQL if empty
    try {
      const [pageRows]: any = await connection.query('SELECT COUNT(*) as count FROM store_pages;');
      if (pageRows[0].count === 0) {
        for (const p of memoryStore.storePages) {
          await connection.query(
            `INSERT INTO store_pages (id, title, handle, type, content, builder_content, published_content, status, version, seo_title, seo_description, created_by, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              p.id,
              p.title,
              p.handle,
              p.type,
              p.content,
              JSON.stringify(p.builderContent),
              JSON.stringify(p.publishedContent),
              p.status,
              p.version,
              p.seoTitle,
              p.seoDescription,
              p.createdBy
            ]
          );

          await connection.query(
            `INSERT INTO store_page_versions (page_id, version, title, builder_content, content, status, change_summary, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.version,
              p.title,
              JSON.stringify(p.builderContent),
              p.content,
              p.status,
              'Initial publication',
              p.createdBy
            ]
          );
        }
      }
    } catch (seedErr: any) {
      console.warn('Note on store_pages seeding:', seedErr.message);
    }

    // Seed default admin users
    const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM admin_users;');
    if (rows[0].count === 0) {
      const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@laam.com';
      const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const hash = await bcrypt.hash(defaultPass, 10);
      await connection.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?);',
        [defaultEmail, hash, 'Laam Super Admin', 'Owner']
      );
      const mgrHash = await bcrypt.hash('manager123', 10);
      await connection.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?);',
        ['manager@laam.com', mgrHash, 'Store Manager', 'Manager']
      );
      const staffHash = await bcrypt.hash('staff123', 10);
      await connection.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?);',
        ['staff@laam.com', staffHash, 'Fulfillment Staff', 'Staff']
      );
    }

    connection.release();
    console.log('MySQL Database initialized with RBAC and Activity Logs!');
  } catch (err: any) {
    useMemoryFallback = true;
    console.warn('MySQL unavailable. Using in-memory fallback for RBAC and Activity Logs.', err.message);
  }
}

export function isUsingMemoryFallback() {
  return useMemoryFallback;
}

export async function getPool() {
  return pool;
}
