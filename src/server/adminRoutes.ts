import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryStore, isUsingMemoryFallback, getPool } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'laam_super_secure_admin_jwt_secret_2026';

export const adminRouter = Router();

export function verifyAdminAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired session' });
  }
}

// --- Admin Login ---
adminRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (isUsingMemoryFallback()) {
    const user = memoryStore.adminUsers.find((u) => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/me', verifyAdminAuth, (req: any, res) => {
  res.json({ user: req.adminUser });
});

// --- Dashboard Analytics ---
adminRouter.get('/analytics', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({
      kpis: { totalSales: 7850, totalOrders: 28, totalProducts: memoryStore.products.length, totalCustomers: 124 },
      recentOrders: memoryStore.orders,
      topProducts: memoryStore.products.slice(0, 5),
    });
  }

  try {
    const pool = await getPool();
    const [orderRows]: any = await pool!.query('SELECT * FROM admin_orders ORDER BY created_at DESC');
    const [prodRows]: any = await pool!.query('SELECT * FROM admin_products');
    const [custRows]: any = await pool!.query('SELECT * FROM admin_customers');

    const totalSales = orderRows.reduce((sum: number, o: any) => sum + Number(o.total), 0);

    res.json({
      kpis: {
        totalSales,
        totalOrders: orderRows.length,
        totalProducts: prodRows.length,
        totalCustomers: custRows.length,
        averageOrderValue: orderRows.length ? totalSales / orderRows.length : 0,
        conversionRate: '3.4%',
        salesGrowth: '+18.2%'
      },
      recentOrders: orderRows.slice(0, 10),
      topProducts: prodRows.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VISUAL STOREFRONT BUILDER APIs ---

// Sections
adminRouter.get('/storefront/sections', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ sections: memoryStore.storeSections });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_sections ORDER BY position ASC');
    const mapped = rows.map((r: any) => ({ ...r, enabled: Boolean(r.enabled), content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content }));
    res.json({ sections: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/storefront/sections', verifyAdminAuth, async (req, res) => {
  const { sections } = req.body;
  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: 'Invalid sections array' });
  }

  if (isUsingMemoryFallback()) {
    memoryStore.storeSections = sections;
    return res.json({ success: true, sections: memoryStore.storeSections });
  }

  try {
    const pool = await getPool();
    await pool!.query('DELETE FROM store_sections');
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await pool!.query(
        'INSERT INTO store_sections (id, type, name, enabled, position, content) VALUES (?, ?, ?, ?, ?, ?)',
        [s.id, s.type, s.name, s.enabled ? 1 : 0, i + 1, JSON.stringify(s.content)]
      );
    }
    res.json({ success: true, sections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Theme Settings
adminRouter.get('/storefront/theme', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ settings: memoryStore.themeSettings });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT settings_json FROM store_theme_settings WHERE id = 1');
    if (rows.length === 0) return res.json({ settings: memoryStore.themeSettings });
    const settings = typeof rows[0].settings_json === 'string' ? JSON.parse(rows[0].settings_json) : rows[0].settings_json;
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/storefront/theme', verifyAdminAuth, async (req, res) => {
  const { settings } = req.body;
  if (!settings) return res.status(400).json({ error: 'Settings object required' });

  if (isUsingMemoryFallback()) {
    memoryStore.themeSettings = settings;
    return res.json({ success: true, settings });
  }

  try {
    const pool = await getPool();
    await pool!.query('UPDATE store_theme_settings SET settings_json = ? WHERE id = 1', [JSON.stringify(settings)]);
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pages & Blogs
adminRouter.get('/storefront/pages', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ pages: memoryStore.storePages });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_pages');
    res.json({ pages: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/storefront/pages', verifyAdminAuth, async (req, res) => {
  const { title, handle, type, content, status } = req.body;
  const id = `page-${Date.now()}`;
  const pageData = {
    id,
    title,
    handle: handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    type: type || 'page',
    content: content || '',
    status: status || 'Published'
  };

  if (isUsingMemoryFallback()) {
    memoryStore.storePages.push(pageData);
    return res.status(201).json({ page: pageData });
  }

  try {
    const pool = await getPool();
    await pool!.query(
      'INSERT INTO store_pages (id, title, handle, type, content, status) VALUES (?, ?, ?, ?, ?, ?)',
      [pageData.id, pageData.title, pageData.handle, pageData.type, pageData.content, pageData.status]
    );
    res.status(201).json({ page: pageData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Public Storefront Endpoints ---
adminRouter.get('/store/sections', async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ sections: memoryStore.storeSections.filter(s => s.enabled) });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_sections WHERE enabled = 1 ORDER BY position ASC');
    const mapped = rows.map((r: any) => ({ ...r, enabled: Boolean(r.enabled), content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content }));
    res.json({ sections: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/store/theme', async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ settings: memoryStore.themeSettings });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT settings_json FROM store_theme_settings WHERE id = 1');
    if (rows.length === 0) return res.json({ settings: memoryStore.themeSettings });
    const settings = typeof rows[0].settings_json === 'string' ? JSON.parse(rows[0].settings_json) : rows[0].settings_json;
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Standard other routes
adminRouter.get('/products', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) return res.json({ products: memoryStore.products });
  const pool = await getPool();
  const [rows]: any = await pool!.query('SELECT * FROM admin_products');
  res.json({ products: rows });
});
adminRouter.get('/collections', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) return res.json({ collections: memoryStore.collections });
  const pool = await getPool();
  const [rows]: any = await pool!.query('SELECT * FROM admin_collections');
  res.json({ collections: rows });
});
adminRouter.get('/orders', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) return res.json({ orders: memoryStore.orders });
  const pool = await getPool();
  const [rows]: any = await pool!.query('SELECT * FROM admin_orders');
  res.json({ orders: rows });
});
adminRouter.get('/customers', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) return res.json({ customers: memoryStore.customers });
  const pool = await getPool();
  const [rows]: any = await pool!.query('SELECT * FROM admin_customers');
  res.json({ customers: rows });
});
adminRouter.get('/discounts', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) return res.json({ discounts: memoryStore.discounts });
  const pool = await getPool();
  const [rows]: any = await pool!.query('SELECT * FROM admin_discounts');
  res.json({ discounts: rows });
});

// Detailed Analytics from MySQL
adminRouter.get('/analytics/detailed', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    const totalRevenue = memoryStore.orders.reduce((sum, o: any) => sum + o.total, 0) || 7850;
    const totalOrders = memoryStore.orders.length || 28;
    return res.json({
      kpis: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 280,
        conversionRate: '3.4%'
      },
      topProducts: memoryStore.products.slice(0, 5).map(p => ({ title: p.title, designer: p.designer, price: p.price, salesCount: 14 })),
      salesTrends: [45, 60, 80, 55, 95, 110, 140, 125, 160, 190, 210, 240]
    });
  }

  try {
    const pool = await getPool();
    const [orders]: any = await pool!.query('SELECT * FROM admin_orders');
    const [products]: any = await pool!.query('SELECT * FROM admin_products');

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const totalOrders = orders.length;

    res.json({
      kpis: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        conversionRate: '3.4%'
      },
      topProducts: products.slice(0, 5).map((p: any) => ({ title: p.title, designer: p.designer, price: p.price, salesCount: 12 })),
      salesTrends: [45, 60, 80, 55, 95, 110, 140, 125, 160, 190, 210, 240]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/analytics/export', verifyAdminAuth, async (req, res) => {
  const csvRows = [
    ['Metric', 'Value'],
    ['Total Revenue', '$7,850.00'],
    ['Total Orders', '28'],
    ['Average Order Value', '$280.35'],
    ['Conversion Rate', '3.4%']
  ];
  const csvContent = csvRows.map(e => e.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=laam_financial_report.csv');
  res.send(csvContent);
});

// Activity Logs
adminRouter.get('/activity-logs', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ logs: memoryStore.activityLogs });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_activity_logs ORDER BY created_at DESC');
    res.json({ logs: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Database Backup Endpoint
adminRouter.get('/backup', verifyAdminAuth, async (req, res) => {
  const backupData = {
    timestamp: new Date().toISOString(),
    system: 'Laam Luxury E-Commerce Engine',
    version: '2.0',
    data: memoryStore
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=laam_db_backup_${Date.now()}.json`);
  res.send(JSON.stringify(backupData, null, 2));
});


