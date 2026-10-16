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

  storePages = [
    { id: 'page-1', title: 'About Laam Luxury', handle: 'about-us', type: 'page', content: 'The premier global destination for authentic South Asian fashion...', status: 'Published' }
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
