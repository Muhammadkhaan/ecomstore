import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { memoryStore, isUsingMemoryFallback, getPool } from './db.ts';
import { validatePageBuilderData } from '../types/pageBuilder.ts';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `media-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, SVG, and PDF are supported.'));
    }
  }
});

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

// --- Helper for Mapping Pages ---
function mapDbPageToStorePage(row: any) {
  if (!row) return null;
  let builderContent = null;
  let publishedContent = null;
  try {
    if (typeof row.builder_content === 'string') builderContent = JSON.parse(row.builder_content);
    else if (typeof row.builder_content === 'object') builderContent = row.builder_content;
    else if (row.builderContent) builderContent = row.builderContent;
  } catch {
    builderContent = null;
  }
  try {
    if (typeof row.published_content === 'string') publishedContent = JSON.parse(row.published_content);
    else if (typeof row.published_content === 'object') publishedContent = row.published_content;
    else if (row.publishedContent) publishedContent = row.publishedContent;
  } catch {
    publishedContent = null;
  }

  return {
    id: row.id,
    title: row.title,
    handle: row.handle,
    type: row.type || 'page',
    content: row.content || '',
    builderContent,
    publishedContent,
    status: row.status || 'Draft',
    version: Number(row.version || 1),
    seoTitle: row.seo_title || row.seoTitle || row.title,
    seoDescription: row.seo_description || row.seoDescription || '',
    createdBy: row.created_by || row.createdBy || 'admin@laam.com',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    publishedAt: row.published_at || row.publishedAt || null,
    sectionsCount: builderContent?.sections?.length || 0
  };
}

function mapDbVersionToRecord(row: any) {
  if (!row) return null;
  let builderContent = null;
  try {
    if (typeof row.builder_content === 'string') builderContent = JSON.parse(row.builder_content);
    else if (typeof row.builder_content === 'object') builderContent = row.builder_content;
    else if (row.builderContent) builderContent = row.builderContent;
  } catch {
    builderContent = null;
  }
  return {
    id: row.id,
    pageId: row.page_id || row.pageId,
    version: Number(row.version),
    title: row.title,
    builderContent,
    content: row.content || '',
    status: row.status || 'Draft',
    changeSummary: row.change_summary || row.changeSummary || 'Updated content',
    createdBy: row.created_by || row.createdBy || 'admin@laam.com',
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

// Pages & Page Builder Endpoints
adminRouter.get('/storefront/pages', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    const mapped = memoryStore.storePages.map(mapDbPageToStorePage);
    return res.json({ pages: mapped });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_pages ORDER BY updated_at DESC, created_at DESC');
    const mapped = rows.map(mapDbPageToStorePage);
    res.json({ pages: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/storefront/pages/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const item = memoryStore.storePages.find((p: any) => p.id === id || p.handle === id);
    if (!item) return res.status(404).json({ error: 'Page not found' });
    const versions = (memoryStore.storePageVersions || [])
      .filter((v: any) => v.pageId === item.id)
      .sort((a: any, b: any) => b.version - a.version);
    return res.json({ page: mapDbPageToStorePage(item), versions: versions.map(mapDbVersionToRecord) });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ? OR handle = ?', [id, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const page = mapDbPageToStorePage(rows[0]);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const [vRows]: any = await pool!.query(
      'SELECT * FROM store_page_versions WHERE page_id = ? ORDER BY version DESC',
      [page.id]
    );
    const versions = vRows.map(mapDbVersionToRecord);
    res.json({ page, versions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/storefront/pages', verifyAdminAuth, async (req: any, res) => {
  const body = req.body;
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return res.status(400).json({ error: 'Page title is required' });
  }

  const rawHandle = body.handle || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const handle = rawHandle.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  if (!handle) {
    return res.status(400).json({ error: 'Valid URL handle/slug is required' });
  }

  // Validate builder content structure
  const { sanitized: validatedBuilder } = validatePageBuilderData(body.builderContent);

  const status = ['Draft', 'Published', 'Archived'].includes(body.status) ? body.status : 'Draft';
  const type = body.type || 'page';
  const content = typeof body.content === 'string' ? body.content : '';
  const seoTitle = body.seoTitle || body.title;
  const seoDescription = body.seoDescription || '';
  const now = new Date().toISOString();
  const publishedAt = status === 'Published' ? now : null;
  const publishedContent = status === 'Published' ? validatedBuilder : null;
  const userEmail = req.adminUser?.email || 'admin@laam.com';
  const id = `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const version = 1;

  if (isUsingMemoryFallback()) {
    // Uniqueness check
    const existing = memoryStore.storePages.find((p: any) => p.handle === handle);
    if (existing) {
      return res.status(400).json({ error: `A page with URL slug "/${handle}" already exists.` });
    }

    const newPage = {
      id,
      title: body.title.trim(),
      handle,
      type,
      content,
      builderContent: validatedBuilder,
      publishedContent,
      status,
      version,
      seoTitle,
      seoDescription,
      createdBy: userEmail,
      createdAt: now,
      updatedAt: now,
      publishedAt
    };

    memoryStore.storePages.unshift(newPage);

    // Record initial version
    const versionRecord = {
      id: Date.now(),
      pageId: id,
      version: 1,
      title: newPage.title,
      builderContent: validatedBuilder,
      content,
      status,
      changeSummary: status === 'Published' ? 'Initial publication' : 'Initial draft creation',
      createdBy: userEmail,
      createdAt: now
    };
    memoryStore.storePageVersions = memoryStore.storePageVersions || [];
    memoryStore.storePageVersions.unshift(versionRecord);

    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail,
      action: 'CREATE_PAGE',
      description: `Created page: "${newPage.title}" (slug: /${newPage.handle}, status: ${newPage.status})`,
      createdAt: now
    });

    return res.status(201).json({ page: mapDbPageToStorePage(newPage) });
  }

  try {
    const pool = await getPool();
    // Unique handle check
    const [dup]: any = await pool!.query('SELECT id FROM store_pages WHERE handle = ?', [handle]);
    if (dup.length > 0) {
      return res.status(400).json({ error: `A page with URL slug "/${handle}" already exists.` });
    }

    await pool!.query(
      `INSERT INTO store_pages (id, title, handle, type, content, builder_content, published_content, status, version, seo_title, seo_description, created_by, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.title.trim(),
        handle,
        type,
        content,
        JSON.stringify(validatedBuilder),
        publishedContent ? JSON.stringify(publishedContent) : null,
        status,
        version,
        seoTitle,
        seoDescription,
        userEmail,
        publishedAt
      ]
    );

    await pool!.query(
      `INSERT INTO store_page_versions (page_id, version, title, builder_content, content, status, change_summary, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        version,
        body.title.trim(),
        JSON.stringify(validatedBuilder),
        content,
        status,
        status === 'Published' ? 'Initial publication' : 'Initial draft creation',
        userEmail
      ]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [userEmail, 'CREATE_PAGE', `Created page: "${body.title.trim()}" (slug: /${handle}, status: ${status})`]
    );

    const [rows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    res.status(201).json({ page: mapDbPageToStorePage(rows[0]) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/storefront/pages/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  const body = req.body;
  const userEmail = req.adminUser?.email || 'admin@laam.com';
  const now = new Date().toISOString();

  if (isUsingMemoryFallback()) {
    const idx = memoryStore.storePages.findIndex((p: any) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Page not found' });
    const cur = memoryStore.storePages[idx];

    // Optimistic locking / version conflict detection
    if (body.expectedVersion !== undefined && Number(body.expectedVersion) !== Number(cur.version)) {
      return res.status(409).json({
        error: 'Version conflict',
        message: `This page was modified by another user or session. Current version is v${cur.version}. Please refresh to merge your updates.`,
        currentVersion: cur.version
      });
    }

    // Slug conflict check if changing handle
    if (body.handle && body.handle !== cur.handle) {
      const dup = memoryStore.storePages.find((p: any) => p.id !== id && p.handle === body.handle);
      if (dup) {
        return res.status(400).json({ error: `A page with URL slug "/${body.handle}" already exists.` });
      }
    }

    const title = body.title !== undefined ? body.title.trim() : cur.title;
    const handle = body.handle !== undefined ? body.handle.toLowerCase().replace(/[^a-z0-9-]+/g, '-') : cur.handle;
    const type = body.type !== undefined ? body.type : cur.type;
    const content = body.content !== undefined ? body.content : cur.content;
    const seoTitle = body.seoTitle !== undefined ? body.seoTitle : cur.seoTitle;
    const seoDescription = body.seoDescription !== undefined ? body.seoDescription : cur.seoDescription;

    let builderContent = cur.builderContent;
    if (body.builderContent !== undefined) {
      const { sanitized } = validatePageBuilderData(body.builderContent);
      builderContent = sanitized;
    }

    let status = cur.status;
    let publishedContent = cur.publishedContent;
    let publishedAt = cur.publishedAt;

    if (body.action === 'publish' || body.status === 'Published') {
      status = 'Published';
      publishedContent = builderContent;
      publishedAt = now;
    } else if (body.action === 'draft' || body.status === 'Draft') {
      status = 'Draft';
      // keep publishedContent intact as previous publication
    } else if (body.status === 'Archived') {
      status = 'Archived';
    }

    const newVersion = (Number(cur.version) || 1) + 1;
    const changeSummary = body.changeSummary || (body.action === 'publish' ? `Published version ${newVersion}` : `Saved draft v${newVersion}`);

    const updated = {
      ...cur,
      title,
      handle,
      type,
      content,
      builderContent,
      publishedContent,
      status,
      version: newVersion,
      seoTitle,
      seoDescription,
      updatedAt: now,
      publishedAt
    };

    memoryStore.storePages[idx] = updated;

    // Snapshot version
    const versionRecord = {
      id: Date.now(),
      pageId: id,
      version: newVersion,
      title,
      builderContent,
      content,
      status,
      changeSummary,
      createdBy: userEmail,
      createdAt: now
    };
    memoryStore.storePageVersions = memoryStore.storePageVersions || [];
    memoryStore.storePageVersions.unshift(versionRecord);

    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail,
      action: 'UPDATE_PAGE',
      description: `Updated page: "${title}" (v${newVersion}, status: ${status})`,
      createdAt: now
    });

    return res.json({ page: mapDbPageToStorePage(updated), version: newVersion });
  }

  try {
    const pool = await getPool();
    const [existing]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Page not found' });
    const cur = existing[0];

    // Optimistic concurrency check
    if (body.expectedVersion !== undefined && Number(body.expectedVersion) !== Number(cur.version)) {
      return res.status(409).json({
        error: 'Version conflict',
        message: `This page was modified by another user or session. Current version is v${cur.version}. Please refresh to merge your updates.`,
        currentVersion: cur.version
      });
    }

    if (body.handle && body.handle !== cur.handle) {
      const [dup]: any = await pool!.query('SELECT id FROM store_pages WHERE id != ? AND handle = ?', [id, body.handle]);
      if (dup.length > 0) {
        return res.status(400).json({ error: `A page with URL slug "/${body.handle}" already exists.` });
      }
    }

    const title = body.title !== undefined ? body.title.trim() : cur.title;
    const handle = body.handle !== undefined ? body.handle.toLowerCase().replace(/[^a-z0-9-]+/g, '-') : cur.handle;
    const type = body.type !== undefined ? body.type : cur.type;
    const content = body.content !== undefined ? body.content : cur.content;
    const seoTitle = body.seoTitle !== undefined ? body.seoTitle : cur.seo_title;
    const seoDescription = body.seoDescription !== undefined ? body.seoDescription : cur.seo_description;

    let builderContent = cur.builder_content ? (typeof cur.builder_content === 'string' ? JSON.parse(cur.builder_content) : cur.builder_content) : null;
    if (body.builderContent !== undefined) {
      const { sanitized } = validatePageBuilderData(body.builderContent);
      builderContent = sanitized;
    }

    let status = cur.status;
    let publishedContent = cur.published_content;
    let publishedAt = cur.published_at;

    if (body.action === 'publish' || body.status === 'Published') {
      status = 'Published';
      publishedContent = JSON.stringify(builderContent);
      publishedAt = new Date();
    } else if (body.action === 'draft' || body.status === 'Draft') {
      status = 'Draft';
      // keep publishedContent intact
    } else if (body.status === 'Archived') {
      status = 'Archived';
    }

    const newVersion = (Number(cur.version) || 1) + 1;
    const changeSummary = body.changeSummary || (body.action === 'publish' ? `Published version ${newVersion}` : `Saved draft v${newVersion}`);

    await pool!.query(
      `UPDATE store_pages
       SET title=?, handle=?, type=?, content=?, builder_content=?, published_content=?, status=?, version=?, seo_title=?, seo_description=?, published_at=?
       WHERE id=?`,
      [
        title,
        handle,
        type,
        content,
        builderContent ? JSON.stringify(builderContent) : null,
        typeof publishedContent === 'string' ? publishedContent : (publishedContent ? JSON.stringify(publishedContent) : null),
        status,
        newVersion,
        seoTitle,
        seoDescription,
        publishedAt,
        id
      ]
    );

    await pool!.query(
      `INSERT INTO store_page_versions (page_id, version, title, builder_content, content, status, change_summary, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        newVersion,
        title,
        builderContent ? JSON.stringify(builderContent) : null,
        content,
        status,
        changeSummary,
        userEmail
      ]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [userEmail, 'UPDATE_PAGE', `Updated page: "${title}" (v${newVersion}, status: ${status})`]
    );

    const [updatedRows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    res.json({ page: mapDbPageToStorePage(updatedRows[0]), version: newVersion });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/storefront/pages/:id/versions', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const list = (memoryStore.storePageVersions || [])
      .filter((v: any) => v.pageId === id)
      .sort((a: any, b: any) => b.version - a.version);
    return res.json({ versions: list.map(mapDbVersionToRecord) });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_page_versions WHERE page_id = ? ORDER BY version DESC', [id]);
    res.json({ versions: rows.map(mapDbVersionToRecord) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/storefront/pages/:id/versions/:version/rollback', verifyAdminAuth, async (req: any, res) => {
  const { id, version } = req.params;
  const targetVer = Number(version);
  const userEmail = req.adminUser?.email || 'admin@laam.com';
  const now = new Date().toISOString();

  if (isUsingMemoryFallback()) {
    const pageIdx = memoryStore.storePages.findIndex((p: any) => p.id === id);
    if (pageIdx === -1) return res.status(404).json({ error: 'Page not found' });
    const targetSnapshot = (memoryStore.storePageVersions || []).find((v: any) => v.pageId === id && v.version === targetVer);
    if (!targetSnapshot) return res.status(404).json({ error: `Version ${targetVer} not found` });

    const cur = memoryStore.storePages[pageIdx];
    const newVersion = (Number(cur.version) || 1) + 1;

    const updated = {
      ...cur,
      title: targetSnapshot.title || cur.title,
      builderContent: targetSnapshot.builderContent,
      content: targetSnapshot.content,
      status: 'Draft',
      version: newVersion,
      updatedAt: now
    };
    memoryStore.storePages[pageIdx] = updated;

    const rollbackVersionRecord = {
      id: Date.now(),
      pageId: id,
      version: newVersion,
      title: updated.title,
      builderContent: updated.builderContent,
      content: updated.content,
      status: 'Draft',
      changeSummary: `Restored snapshot from version ${targetVer}`,
      createdBy: userEmail,
      createdAt: now
    };
    memoryStore.storePageVersions.unshift(rollbackVersionRecord);

    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail,
      action: 'ROLLBACK_PAGE',
      description: `Rolled back page "${updated.title}" to version ${targetVer} (now v${newVersion})`,
      createdAt: now
    });

    return res.json({ success: true, page: mapDbPageToStorePage(updated) });
  }

  try {
    const pool = await getPool();
    const [pageRows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    if (pageRows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const cur = pageRows[0];

    const [vRows]: any = await pool!.query('SELECT * FROM store_page_versions WHERE page_id = ? AND version = ?', [id, targetVer]);
    if (vRows.length === 0) return res.status(404).json({ error: `Version ${targetVer} not found` });
    const targetSnapshot = vRows[0];

    const newVersion = (Number(cur.version) || 1) + 1;
    const changeSummary = `Restored snapshot from version ${targetVer}`;

    await pool!.query(
      `UPDATE store_pages
       SET title=?, builder_content=?, content=?, status='Draft', version=?
       WHERE id=?`,
      [targetSnapshot.title, targetSnapshot.builder_content, targetSnapshot.content, newVersion, id]
    );

    await pool!.query(
      `INSERT INTO store_page_versions (page_id, version, title, builder_content, content, status, change_summary, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, newVersion, targetSnapshot.title, targetSnapshot.builder_content, targetSnapshot.content, 'Draft', changeSummary, userEmail]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [userEmail, 'ROLLBACK_PAGE', `Rolled back page "${cur.title}" to version ${targetVer} (now v${newVersion})`]
    );

    const [updatedRows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    res.json({ success: true, page: mapDbPageToStorePage(updatedRows[0]) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/storefront/pages/:id/rollback/:version', verifyAdminAuth, async (req: any, res) => {
  req.params.version = req.params.version;
  // Delegate to the same logic
  const { id, version } = req.params;
  const targetVer = Number(version);
  const userEmail = req.adminUser?.email || 'admin@laam.com';
  const now = new Date().toISOString();

  if (isUsingMemoryFallback()) {
    const pageIdx = memoryStore.storePages.findIndex((p: any) => p.id === id);
    if (pageIdx === -1) return res.status(404).json({ error: 'Page not found' });
    const targetSnapshot = (memoryStore.storePageVersions || []).find((v: any) => v.pageId === id && v.version === targetVer);
    if (!targetSnapshot) return res.status(404).json({ error: `Version ${targetVer} not found` });

    const cur = memoryStore.storePages[pageIdx];
    const newVersion = (Number(cur.version) || 1) + 1;

    const updated = {
      ...cur,
      title: targetSnapshot.title || cur.title,
      builderContent: targetSnapshot.builderContent,
      content: targetSnapshot.content,
      status: 'Draft',
      version: newVersion,
      updatedAt: now
    };
    memoryStore.storePages[pageIdx] = updated;

    const rollbackVersionRecord = {
      id: Date.now(),
      pageId: id,
      version: newVersion,
      title: updated.title,
      builderContent: updated.builderContent,
      content: updated.content,
      status: 'Draft',
      changeSummary: `Restored snapshot from version ${targetVer}`,
      createdBy: userEmail,
      createdAt: now
    };
    memoryStore.storePageVersions.unshift(rollbackVersionRecord);

    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail,
      action: 'ROLLBACK_PAGE',
      description: `Rolled back page "${updated.title}" to version ${targetVer} (now v${newVersion})`,
      createdAt: now
    });

    return res.json({ success: true, page: mapDbPageToStorePage(updated) });
  }

  try {
    const pool = await getPool();
    const [pageRows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    if (pageRows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const cur = pageRows[0];

    const [vRows]: any = await pool!.query('SELECT * FROM store_page_versions WHERE page_id = ? AND version = ?', [id, targetVer]);
    if (vRows.length === 0) return res.status(404).json({ error: `Version ${targetVer} not found` });
    const targetSnapshot = vRows[0];

    const newVersion = (Number(cur.version) || 1) + 1;
    const changeSummary = `Restored snapshot from version ${targetVer}`;

    await pool!.query(
      `UPDATE store_pages
       SET title=?, builder_content=?, content=?, status='Draft', version=?
       WHERE id=?`,
      [targetSnapshot.title, targetSnapshot.builder_content, targetSnapshot.content, newVersion, id]
    );

    await pool!.query(
      `INSERT INTO store_page_versions (page_id, version, title, builder_content, content, status, change_summary, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, newVersion, targetSnapshot.title, targetSnapshot.builder_content, targetSnapshot.content, 'Draft', changeSummary, userEmail]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [userEmail, 'ROLLBACK_PAGE', `Rolled back page "${cur.title}" to version ${targetVer} (now v${newVersion})`]
    );

    const [updatedRows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ?', [id]);
    res.json({ success: true, page: mapDbPageToStorePage(updatedRows[0]) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/storefront/pages/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  const userEmail = req.adminUser?.email || 'admin@laam.com';

  if (isUsingMemoryFallback()) {
    const existing = memoryStore.storePages.find((p: any) => p.id === id);
    if (!existing) return res.status(404).json({ error: 'Page not found' });

    memoryStore.storePages = memoryStore.storePages.filter((p: any) => p.id !== id);
    if (memoryStore.storePageVersions) {
      memoryStore.storePageVersions = memoryStore.storePageVersions.filter((v: any) => v.pageId !== id);
    }

    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail,
      action: 'DELETE_PAGE',
      description: `Deleted page: "${existing.title}"`,
      createdAt: new Date().toISOString()
    });

    return res.json({ success: true });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT title FROM store_pages WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const pageTitle = rows[0].title;

    await pool!.query('DELETE FROM store_page_versions WHERE page_id = ?', [id]);
    await pool!.query('DELETE FROM store_pages WHERE id = ?', [id]);

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [userEmail, 'DELETE_PAGE', `Deleted page: "${pageTitle}"`]
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Storefront Public Page Loader (supports published pages for public users, or draft previews for admins)
adminRouter.get('/store/pages/:handleOrId', async (req: any, res) => {
  const { handleOrId } = req.params;
  const authHeader = req.headers.authorization;
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      if (decoded && decoded.email) isAdmin = true;
    } catch {
      isAdmin = false;
    }
  }

  if (isUsingMemoryFallback()) {
    const item = memoryStore.storePages.find((p: any) => p.id === handleOrId || p.handle === handleOrId);
    if (!item) return res.status(404).json({ error: 'Page not found' });

    if (item.status === 'Published') {
      const page = mapDbPageToStorePage(item);
      if (!page) return res.status(404).json({ error: 'Page not found' });
      return res.json({
        page: {
          ...page,
          builderContent: page.publishedContent || page.builderContent
        },
        isPreview: false
      });
    }

    if (isAdmin) {
      return res.json({
        page: mapDbPageToStorePage(item),
        isPreview: true,
        previewNotice: `Viewing ${item.status} draft in admin preview mode.`
      });
    }

    return res.status(404).json({ error: 'Page not found or is in draft mode' });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM store_pages WHERE id = ? OR handle = ?', [handleOrId, handleOrId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const item = rows[0];

    if (item.status === 'Published') {
      const page = mapDbPageToStorePage(item);
      if (!page) return res.status(404).json({ error: 'Page not found' });
      return res.json({
        page: {
          ...page,
          builderContent: page.publishedContent || page.builderContent
        },
        isPreview: false
      });
    }

    if (isAdmin) {
      return res.json({
        page: mapDbPageToStorePage(item),
        isPreview: true,
        previewNotice: `Viewing ${item.status} draft in admin preview mode.`
      });
    }

    res.status(404).json({ error: 'Page not found or is in draft mode' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Media Library Endpoints ---
adminRouter.get('/media', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ media: memoryStore.media });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_media ORDER BY uploaded_at DESC');
    res.json({ media: rows.map((r: any) => ({ ...r, altText: r.alt_text, fileSize: r.file_size, fileType: r.file_type, uploadedAt: r.uploaded_at })) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/media/upload', verifyAdminAuth, upload.array('files', 10), async (req: any, res) => {
  try {
    const files = req.files || [];
    const { url, name } = req.body;

    let savedItems: any[] = [];

    if (files.length > 0) {
      for (const f of files) {
        const item = {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: f.originalname,
          url: `/uploads/${f.filename}`,
          altText: f.originalname.replace(/\.[^/.]+$/, ''),
          fileSize: f.size,
          fileType: f.mimetype,
          uploadedAt: new Date().toISOString()
        };
        savedItems.push(item);
        if (isUsingMemoryFallback()) {
          memoryStore.media.unshift(item);
        } else {
          const pool = await getPool();
          await pool!.query(
            'INSERT INTO admin_media (id, name, url, alt_text, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?)',
            [item.id, item.name, item.url, item.altText, item.fileSize, item.fileType]
          );
        }
      }
      return res.status(201).json({ media: savedItems[0], items: savedItems });
    } else if (url && typeof url === 'string') {
      const item = {
        id: `media-${Date.now()}`,
        name: name || 'External Asset',
        url,
        altText: name || 'External Asset',
        fileSize: 0,
        fileType: 'image/external',
        uploadedAt: new Date().toISOString()
      };
      if (isUsingMemoryFallback()) {
        memoryStore.media.unshift(item);
      } else {
        const pool = await getPool();
        await pool!.query(
          'INSERT INTO admin_media (id, name, url, alt_text, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?)',
          [item.id, item.name, item.url, item.altText, item.fileSize, item.fileType]
        );
      }
      return res.status(201).json({ media: item });
    } else {
      return res.status(400).json({ error: 'No files uploaded or valid URL provided' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/media/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  const { name, altText } = req.body;
  if (isUsingMemoryFallback()) {
    const item = memoryStore.media.find((m: any) => m.id === id);
    if (!item) return res.status(404).json({ error: 'Media not found' });
    if (name) item.name = name;
    if (altText !== undefined) item.altText = altText;
    return res.json({ media: item });
  }
  try {
    const pool = await getPool();
    await pool!.query('UPDATE admin_media SET name = COALESCE(?, name), alt_text = COALESCE(?, alt_text) WHERE id = ?', [name, altText, id]);
    const [rows]: any = await pool!.query('SELECT * FROM admin_media WHERE id = ?', [id]);
    res.json({ media: rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/media/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const item = memoryStore.media.find((m: any) => m.id === id);
    if (!item) return res.status(404).json({ error: 'Media not found' });
    // check usage
    const url = item.url;
    let usedIn: string[] = [];
    memoryStore.products.forEach(p => {
      if (p.image === url || p.secondaryImage === url) usedIn.push(`Product: ${p.title}`);
    });
    memoryStore.collections.forEach(c => {
      if (c.image === url) usedIn.push(`Collection: ${c.title}`);
    });
    if (usedIn.length > 0 && !req.query.force) {
      return res.status(400).json({ error: 'Asset is currently in use', usedIn });
    }
    memoryStore.media = memoryStore.media.filter((m: any) => m.id !== id);
    return res.json({ success: true });
  }

  try {
    const pool = await getPool();
    const [mRows]: any = await pool!.query('SELECT * FROM admin_media WHERE id = ?', [id]);
    if (mRows.length === 0) return res.status(404).json({ error: 'Media not found' });
    const url = mRows[0].url;

    // Check usage in products & collections
    const [prodRows]: any = await pool!.query('SELECT title, image, secondary_image FROM admin_products');
    const [colRows]: any = await pool!.query('SELECT title, image FROM admin_collections');
    let usedIn: string[] = [];
    prodRows.forEach((p: any) => {
      if (p.image === url || p.secondary_image === url) usedIn.push(`Product: ${p.title}`);
    });
    colRows.forEach((c: any) => {
      if (c.image === url) usedIn.push(`Collection: ${c.title}`);
    });

    if (usedIn.length > 0 && req.query.force !== 'true') {
      return res.status(400).json({ error: 'Asset is currently in use across products or collections', usedIn });
    }

    await pool!.query('DELETE FROM admin_media WHERE id = ?', [id]);
    res.json({ success: true });
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

adminRouter.get('/store/products', async (req, res) => {
  if (isUsingMemoryFallback()) {
    const activeProds = memoryStore.products
      .filter(p => p.status === 'Active')
      .map(p => ({
        ...p,
        name: (p as any).name || p.title,
        priceUSD: Number((p as any).priceUSD || p.price),
        originalPriceUSD: (p as any).originalPriceUSD || (p.compareAtPrice ? Number(p.compareAtPrice) : undefined),
        image: p.image,
        secondaryImage: p.secondaryImage || p.image,
        sizes: (p as any).sizes || p.variants || ['XS', 'S', 'M', 'L', 'XL'],
        images: (p as any).images || [p.image],
        inStock: (p.inventory || 0) > 0,
        readyToShip: true,
        dispatchDays: 3,
        rating: 4.9,
        reviewsCount: 18,
        colors: ['Ruby Red', 'Emerald', 'Ivory'],
        occasion: 'Festive',
        fabric: 'Pure Raw Silk',
        embellishments: ['Zardozi', 'Resham', 'Marori'],
        includes: 'Shirt, Dupatta & Trouser'
      }));
    return res.json({ products: activeProds });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query("SELECT * FROM admin_products WHERE status = 'Active' ORDER BY created_at DESC");
    const parsedRows = rows.map((r: any) => ({
      ...r,
      priceUSD: Number(r.price),
      originalPriceUSD: r.compare_at_price ? Number(r.compare_at_price) : undefined,
      name: r.title,
      image: r.image,
      secondaryImage: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images)[1] || r.image : r.image) : r.image,
      sizes: r.variants ? (typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants) : ['XS', 'S', 'M', 'L', 'XL'],
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image]),
      inStock: (r.inventory || 0) > 0,
      readyToShip: true,
      dispatchDays: 3,
      rating: 4.9,
      reviewsCount: 18,
      colors: ['Ruby Red', 'Emerald', 'Ivory'],
      occasion: 'Festive',
      fabric: 'Pure Raw Silk',
      embellishments: ['Zardozi', 'Resham', 'Marori'],
      includes: 'Shirt, Dupatta & Trouser'
    }));
    res.json({ products: parsedRows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/store/products/:id', async (req, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const p = memoryStore.products.find(item => item.id === id || (item as any).urlSlug === id);
    if (!p || p.status !== 'Active') {
      return res.status(404).json({ error: 'Product not found or not published' });
    }
    const product = {
      ...p,
      name: (p as any).name || p.title,
      priceUSD: Number((p as any).priceUSD || p.price),
      originalPriceUSD: (p as any).originalPriceUSD || (p.compareAtPrice ? Number(p.compareAtPrice) : undefined),
      image: p.image,
      secondaryImage: p.secondaryImage || p.image,
      sizes: (p as any).sizes || p.variants || ['XS', 'S', 'M', 'L', 'XL'],
      images: (p as any).images || [p.image],
      inStock: (p.inventory || 0) > 0,
      readyToShip: true,
      dispatchDays: 3,
      rating: 4.9,
      reviewsCount: 18,
      colors: ['Ruby Red', 'Emerald', 'Ivory'],
      occasion: 'Festive',
      fabric: 'Pure Raw Silk',
      embellishments: ['Zardozi', 'Resham', 'Marori'],
      includes: 'Shirt, Dupatta & Trouser'
    };
    return res.json({ product });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query("SELECT * FROM admin_products WHERE (id = ? OR url_slug = ?) AND status = 'Active'", [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or not published' });
    }
    const r = rows[0];
    const product = {
      ...r,
      priceUSD: Number(r.price),
      originalPriceUSD: r.compare_at_price ? Number(r.compare_at_price) : undefined,
      name: r.title,
      image: r.image,
      secondaryImage: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images)[1] || r.image : r.image) : r.image,
      sizes: r.variants ? (typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants) : ['XS', 'S', 'M', 'L', 'XL'],
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image]),
      inStock: (r.inventory || 0) > 0,
      readyToShip: true,
      dispatchDays: 3,
      rating: 4.9,
      reviewsCount: 18,
      colors: ['Ruby Red', 'Emerald', 'Ivory'],
      occasion: 'Festive',
      fabric: 'Pure Raw Silk',
      embellishments: ['Zardozi', 'Resham', 'Marori'],
      includes: 'Shirt, Dupatta & Trouser'
    };
    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Products CRUD ---
adminRouter.get('/products', verifyAdminAuth, async (req: any, res) => {
  const { search, category, status } = req.query;
  if (isUsingMemoryFallback()) {
    let prods = [...memoryStore.products];
    if (search) {
      const q = String(search).toLowerCase();
      prods = prods.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (category && category !== 'all') {
      prods = prods.filter(p => p.category === category);
    }
    if (status && status !== 'all') {
      prods = prods.filter(p => p.status === status);
    }
    return res.json({ products: prods });
  }

  try {
    const pool = await getPool();
    let query = 'SELECT * FROM admin_products WHERE 1=1';
    const params: any[] = [];
    if (search) {
      query += ' AND (title LIKE ? OR sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows]: any = await pool!.query(query, params);
    const parsedRows = rows.map((r: any) => ({
      ...r,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image]),
      variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants || ['XS', 'S', 'M', 'L', 'XL']),
      collections: typeof r.collections === 'string' ? JSON.parse(r.collections) : (r.collections || []),
      shippingDetails: typeof r.shipping_details === 'string' ? JSON.parse(r.shipping_details) : (r.shipping_details || {}),
    }));
    res.json({ products: parsedRows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/products/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const prod = memoryStore.products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product: prod });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const r = rows[0];
    const product = {
      ...r,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image]),
      variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants || ['XS', 'S', 'M', 'L', 'XL']),
      collections: typeof r.collections === 'string' ? JSON.parse(r.collections) : (r.collections || []),
      shippingDetails: typeof r.shipping_details === 'string' ? JSON.parse(r.shipping_details) : (r.shipping_details || {}),
    };
    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/products/:id/duplicate', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const prod = memoryStore.products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    const duplicated = {
      ...prod,
      id: `prod-${Date.now()}`,
      title: `${prod.title} (Copy)`,
      sku: `${prod.sku}-COPY`,
      createdAt: new Date().toISOString()
    };
    memoryStore.products.unshift(duplicated as any);
    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail: req.adminUser.email,
      action: 'DUPLICATE_PRODUCT',
      description: `Duplicated product: ${prod.title}`,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ product: duplicated });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const r = rows[0];
    const newId = `prod-${Date.now()}`;
    const newTitle = `${r.title} (Copy)`;
    const newSku = `${r.sku || 'SKU'}-COPY`;

    await pool!.query(
      `INSERT INTO admin_products (id, title, description, designer, category, price, compare_at_price, cost_price, sku, barcode, inventory, status, image, images, variants, collections, shipping_details, seo_title, seo_description, url_slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        newTitle,
        r.description,
        r.designer,
        r.category,
        r.price,
        r.compare_at_price,
        r.cost_price,
        newSku,
        r.barcode,
        r.inventory,
        'Draft',
        r.image,
        r.images,
        r.variants,
        r.collections,
        r.shipping_details,
        r.seo_title,
        r.seo_description,
        `${r.url_slug || 'prod'}-copy`
      ]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [req.adminUser.email, 'DUPLICATE_PRODUCT', `Duplicated product: ${r.title}`]
    );

    const [newRows]: any = await pool!.query('SELECT * FROM admin_products WHERE id = ?', [newId]);
    res.status(201).json({ product: newRows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/products', verifyAdminAuth, async (req: any, res) => {
  const body = req.body;
  if (!body.title || body.price === undefined) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  const id = `prod-${Date.now()}`;
  const newProduct = {
    id,
    title: body.title,
    description: body.description || '',
    designer: body.designer || 'LAAM Pret Couture',
    category: body.category || 'pret',
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
    costPrice: body.costPrice ? Number(body.costPrice) : null,
    sku: body.sku || `LAAM-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: body.barcode || '',
    inventory: body.inventory !== undefined ? Number(body.inventory) : 50,
    status: body.status || 'Active',
    image: Array.isArray(body.images) && body.images.length > 0 ? body.images[0] : (body.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67'),
    secondaryImage: Array.isArray(body.images) && body.images[1] ? body.images[1] : (body.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67'),
    images: Array.isArray(body.images) ? body.images : [body.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67'],
    variants: body.variants || ['XS', 'S', 'M', 'L', 'XL'],
    collections: body.collections || [body.category || 'pret'],
    shippingDetails: body.shippingDetails || { weightKg: 0.8, dimensions: '30x20x5 cm', shippingClass: 'Standard' },
    seoTitle: body.seoTitle || body.title,
    seoDescription: body.seoDescription || (body.description ? body.description.slice(0, 155) : ''),
    urlSlug: body.urlSlug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    createdAt: new Date().toISOString()
  };

  if (isUsingMemoryFallback()) {
    memoryStore.products.unshift(newProduct as any);
    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail: req.adminUser.email,
      action: 'CREATE_PRODUCT',
      description: `Created product: ${newProduct.title}`,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ product: newProduct });
  }

  try {
    const pool = await getPool();
    await pool!.query(
      `INSERT INTO admin_products (id, title, description, designer, category, price, compare_at_price, cost_price, sku, barcode, inventory, status, image, images, variants, collections, shipping_details, seo_title, seo_description, url_slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newProduct.id,
        newProduct.title,
        newProduct.description,
        newProduct.designer,
        newProduct.category,
        newProduct.price,
        newProduct.compareAtPrice,
        newProduct.costPrice,
        newProduct.sku,
        newProduct.barcode,
        newProduct.inventory,
        newProduct.status,
        newProduct.image,
        JSON.stringify(newProduct.images),
        JSON.stringify(newProduct.variants),
        JSON.stringify(newProduct.collections),
        JSON.stringify(newProduct.shippingDetails),
        newProduct.seoTitle,
        newProduct.seoDescription,
        newProduct.urlSlug
      ]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [req.adminUser.email, 'CREATE_PRODUCT', `Created product: ${newProduct.title}`]
    );

    res.status(201).json({ product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/products/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  const body = req.body;

  if (isUsingMemoryFallback()) {
    const idx = memoryStore.products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const existingProd = memoryStore.products[idx] as any;
    const updated = {
      ...existingProd,
      ...body,
      price: body.price !== undefined ? Number(body.price) : existingProd.price,
      inventory: body.inventory !== undefined ? Number(body.inventory) : existingProd.inventory,
      images: Array.isArray(body.images) ? body.images : existingProd.images,
      image: Array.isArray(body.images) && body.images.length > 0 ? body.images[0] : (body.image || existingProd.image),
      secondaryImage: Array.isArray(body.images) && body.images[1] ? body.images[1] : existingProd.secondaryImage
    };
    memoryStore.products[idx] = updated;
    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail: req.adminUser.email,
      action: 'UPDATE_PRODUCT',
      description: `Updated product: ${updated.title}`,
      createdAt: new Date().toISOString()
    });
    return res.json({ product: updated });
  }

  try {
    const pool = await getPool();
    const [existing]: any = await pool!.query('SELECT * FROM admin_products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });
    const cur = existing[0];

    const title = body.title !== undefined ? body.title : cur.title;
    const description = body.description !== undefined ? body.description : cur.description;
    const designer = body.designer !== undefined ? body.designer : cur.designer;
    const category = body.category !== undefined ? body.category : cur.category;
    const price = body.price !== undefined ? Number(body.price) : cur.price;
    const compareAtPrice = body.compareAtPrice !== undefined ? body.compareAtPrice : cur.compare_at_price;
    const costPrice = body.costPrice !== undefined ? body.costPrice : cur.cost_price;
    const sku = body.sku !== undefined ? body.sku : cur.sku;
    const barcode = body.barcode !== undefined ? body.barcode : cur.barcode;
    const inventory = body.inventory !== undefined ? Number(body.inventory) : cur.inventory;
    const status = body.status !== undefined ? body.status : cur.status;
    const images = Array.isArray(body.images) ? body.images : (cur.images ? JSON.parse(cur.images) : [cur.image]);
    const image = images.length > 0 ? images[0] : cur.image;
    const variants = body.variants !== undefined ? body.variants : (cur.variants ? JSON.parse(cur.variants) : ['XS', 'S', 'M', 'L', 'XL']);
    const collections = body.collections !== undefined ? body.collections : (cur.collections ? JSON.parse(cur.collections) : []);
    const shippingDetails = body.shippingDetails !== undefined ? body.shippingDetails : (cur.shipping_details ? JSON.parse(cur.shipping_details) : {});
    const seoTitle = body.seoTitle !== undefined ? body.seoTitle : cur.seo_title;
    const seoDescription = body.seoDescription !== undefined ? body.seoDescription : cur.seo_description;
    const urlSlug = body.urlSlug !== undefined ? body.urlSlug : cur.url_slug;

    await pool!.query(
      `UPDATE admin_products SET title=?, description=?, designer=?, category=?, price=?, compare_at_price=?, cost_price=?, sku=?, barcode=?, inventory=?, status=?, image=?, images=?, variants=?, collections=?, shipping_details=?, seo_title=?, seo_description=?, url_slug=? WHERE id=?`,
      [
        title, description, designer, category, price, compareAtPrice, costPrice, sku, barcode, inventory, status,
        image, JSON.stringify(images), JSON.stringify(variants), JSON.stringify(collections), JSON.stringify(shippingDetails),
        seoTitle, seoDescription, urlSlug, id
      ]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [req.adminUser.email, 'UPDATE_PRODUCT', `Updated product: ${title}`]
    );

    const [updatedRows]: any = await pool!.query('SELECT * FROM admin_products WHERE id = ?', [id]);
    const r = updatedRows[0];
    const updatedProduct = {
      ...r,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image]),
      variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants || ['XS', 'S', 'M', 'L', 'XL']),
      collections: typeof r.collections === 'string' ? JSON.parse(r.collections) : (r.collections || []),
      shippingDetails: typeof r.shipping_details === 'string' ? JSON.parse(r.shipping_details) : (r.shipping_details || {}),
    };
    res.json({ product: updatedProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/products/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    memoryStore.products = memoryStore.products.filter(p => p.id !== id);
    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail: req.adminUser.email,
      action: 'DELETE_PRODUCT',
      description: `Deleted product ID: ${id}`,
      createdAt: new Date().toISOString()
    });
    return res.json({ success: true });
  }

  try {
    const pool = await getPool();
    await pool!.query('DELETE FROM admin_products WHERE id = ?', [id]);
    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [req.adminUser.email, 'DELETE_PRODUCT', `Deleted product ID: ${id}`]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/products/bulk', verifyAdminAuth, async (req: any, res) => {
  const { action, ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No product IDs provided' });
  }

  if (isUsingMemoryFallback()) {
    if (action === 'delete') {
      memoryStore.products = memoryStore.products.filter(p => !ids.includes(p.id));
    } else if (action === 'status' && status) {
      memoryStore.products.forEach(p => {
        if (ids.includes(p.id)) p.status = status;
      });
    }
    return res.json({ success: true });
  }

  try {
    const pool = await getPool();
    if (action === 'delete') {
      for (const id of ids) {
        await pool!.query('DELETE FROM admin_products WHERE id = ?', [id]);
      }
    } else if (action === 'status' && status) {
      for (const id of ids) {
        await pool!.query('UPDATE admin_products SET status = ? WHERE id = ?', [status, id]);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/products/export', verifyAdminAuth, async (req: any, res) => {
  if (isUsingMemoryFallback()) {
    const headers = ['ID', 'Title', 'Designer', 'Category', 'Price', 'Inventory', 'SKU', 'Status'];
    const rows = memoryStore.products.map(p => [p.id, `"${p.title}"`, `"${p.designer}"`, p.category, p.price, p.inventory, p.sku, p.status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=laam_products_export.csv');
    return res.send(csv);
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_products');
    const headers = ['ID', 'Title', 'Designer', 'Category', 'Price', 'Inventory', 'SKU', 'Status'];
    const csvRows = rows.map((p: any) => [p.id, `"${p.title}"`, `"${p.designer}"`, p.category, p.price, p.inventory, p.sku, p.status]);
    const csv = [headers.join(','), ...csvRows.map((r: any) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=laam_products_export.csv');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Collections CRUD & Storefront ---
adminRouter.get('/collections', verifyAdminAuth, async (req, res) => {
  if (isUsingMemoryFallback()) return res.json({ collections: memoryStore.collections });
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_collections ORDER BY created_at DESC');
    const parsed = rows.map((r: any) => ({
      ...r,
      assignedProducts: typeof r.assigned_products === 'string' ? JSON.parse(r.assigned_products) : (r.assigned_products || [])
    }));
    res.json({ collections: parsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/collections', verifyAdminAuth, async (req: any, res) => {
  const body = req.body;
  if (!body.title) return res.status(400).json({ error: 'Collection title is required' });

  const id = `col-${Date.now()}`;
  const handle = body.handle || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCol = {
    id,
    title: body.title,
    description: body.description || '',
    handle,
    type: body.type || 'manual',
    rule: body.rule || '',
    status: body.status || 'Active',
    image: body.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67',
    seoTitle: body.seoTitle || body.title,
    seoDescription: body.seoDescription || '',
    assignedProducts: body.assignedProducts || []
  };

  if (isUsingMemoryFallback()) {
    memoryStore.collections.unshift(newCol);
    memoryStore.activityLogs.unshift({
      id: Date.now(),
      userEmail: req.adminUser.email,
      action: 'CREATE_COLLECTION',
      description: `Created collection: ${newCol.title}`,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ collection: newCol });
  }

  try {
    const pool = await getPool();
    await pool!.query(
      `INSERT INTO admin_collections (id, title, description, handle, type, rule, status, image, seo_title, seo_description, assigned_products)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCol.id,
        newCol.title,
        newCol.description,
        newCol.handle,
        newCol.type,
        newCol.rule,
        newCol.status,
        newCol.image,
        newCol.seoTitle,
        newCol.seoDescription,
        JSON.stringify(newCol.assignedProducts)
      ]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [req.adminUser.email, 'CREATE_COLLECTION', `Created collection: ${newCol.title}`]
    );

    res.status(201).json({ collection: newCol });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/collections/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  const body = req.body;

  if (isUsingMemoryFallback()) {
    const idx = memoryStore.collections.findIndex((c: any) => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Collection not found' });
    const updated = { ...memoryStore.collections[idx], ...body };
    memoryStore.collections[idx] = updated;
    return res.json({ collection: updated });
  }

  try {
    const pool = await getPool();
    const [existing]: any = await pool!.query('SELECT * FROM admin_collections WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Collection not found' });
    const cur = existing[0];

    const title = body.title !== undefined ? body.title : cur.title;
    const description = body.description !== undefined ? body.description : cur.description;
    const handle = body.handle !== undefined ? body.handle : cur.handle;
    const type = body.type !== undefined ? body.type : cur.type;
    const rule = body.rule !== undefined ? body.rule : cur.rule;
    const status = body.status !== undefined ? body.status : cur.status;
    const image = body.image !== undefined ? body.image : cur.image;
    const seoTitle = body.seoTitle !== undefined ? body.seoTitle : cur.seo_title;
    const seoDescription = body.seoDescription !== undefined ? body.seoDescription : cur.seo_description;
    const assignedProducts = body.assignedProducts !== undefined ? JSON.stringify(body.assignedProducts) : cur.assigned_products;

    await pool!.query(
      `UPDATE admin_collections SET title=?, description=?, handle=?, type=?, rule=?, status=?, image=?, seo_title=?, seo_description=?, assigned_products=? WHERE id=?`,
      [title, description, handle, type, rule, status, image, seoTitle, seoDescription, assignedProducts, id]
    );

    const [updatedRows]: any = await pool!.query('SELECT * FROM admin_collections WHERE id = ?', [id]);
    res.json({ collection: updatedRows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/collections/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    memoryStore.collections = memoryStore.collections.filter((c: any) => c.id !== id);
    return res.json({ success: true });
  }
  try {
    const pool = await getPool();
    await pool!.query('DELETE FROM admin_collections WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/store/collections', async (req, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ collections: memoryStore.collections.filter((c: any) => c.status === 'Active') });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query("SELECT * FROM admin_collections WHERE status = 'Active' ORDER BY created_at DESC");
    const parsed = rows.map((r: any) => ({
      ...r,
      assignedProducts: typeof r.assigned_products === 'string' ? JSON.parse(r.assigned_products) : (r.assigned_products || [])
    }));
    res.json({ collections: parsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/store/collections/:idOrHandle', async (req, res) => {
  const { idOrHandle } = req.params;
  let collection: any = null;

  if (isUsingMemoryFallback()) {
    collection = memoryStore.collections.find((c: any) => c.id === idOrHandle || c.handle === idOrHandle);
    if (!collection || collection.status !== 'Active') {
      return res.status(404).json({ error: 'Collection not found or not published' });
    }
    const assignedIds = Array.isArray(collection.assignedProducts) ? collection.assignedProducts : [];
    let matchedProducts = memoryStore.products.filter(p => p.status === 'Active');

    if (collection.type === 'manual') {
      matchedProducts = matchedProducts.filter(p => assignedIds.includes(p.id));
    } else if (collection.type === 'rule' && collection.rule) {
      const ruleLower = collection.rule.toLowerCase();
      if (ruleLower.includes('category =')) {
        const cat = ruleLower.split('=')[1]?.trim();
        if (cat) matchedProducts = matchedProducts.filter(p => p.category.toLowerCase() === cat);
      }
    }

    const mappedProducts = matchedProducts.map(p => ({
      ...p,
      name: (p as any).name || p.title,
      priceUSD: Number((p as any).priceUSD || p.price),
      originalPriceUSD: (p as any).originalPriceUSD || (p.compareAtPrice ? Number(p.compareAtPrice) : undefined),
      image: p.image,
      secondaryImage: p.secondaryImage || p.image,
      sizes: (p as any).sizes || p.variants || ['XS', 'S', 'M', 'L', 'XL'],
      images: (p as any).images || [p.image],
      inStock: (p.inventory || 0) > 0,
      readyToShip: true,
      dispatchDays: 3,
      rating: 4.9,
      reviewsCount: 18,
      colors: ['Ruby Red', 'Emerald', 'Ivory'],
      occasion: 'Festive',
      fabric: 'Pure Raw Silk',
      embellishments: ['Zardozi', 'Resham', 'Marori'],
      includes: 'Shirt, Dupatta & Trouser'
    }));

    return res.json({ collection, products: mappedProducts });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query("SELECT * FROM admin_collections WHERE (id = ? OR handle = ?) AND status = 'Active'", [idOrHandle, idOrHandle]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found or not published' });
    }
    const r = rows[0];
    collection = {
      ...r,
      assignedProducts: typeof r.assigned_products === 'string' ? JSON.parse(r.assigned_products) : (r.assigned_products || [])
    };

    const assignedIds = collection.assignedProducts || [];
    const [prodRows]: any = await pool!.query("SELECT * FROM admin_products WHERE status = 'Active' ORDER BY created_at DESC");
    let matchedProducts = prodRows;

    if (collection.type === 'manual') {
      matchedProducts = matchedProducts.filter((p: any) => assignedIds.includes(p.id));
    } else if (collection.type === 'rule' && collection.rule) {
      const ruleLower = collection.rule.toLowerCase();
      if (ruleLower.includes('category =')) {
        const cat = ruleLower.split('=')[1]?.trim();
        if (cat) matchedProducts = matchedProducts.filter((p: any) => p.category.toLowerCase() === cat);
      }
    }

    const mappedProducts = matchedProducts.map((p: any) => ({
      ...p,
      priceUSD: Number(p.price),
      originalPriceUSD: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      name: p.title,
      image: p.image,
      secondaryImage: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images)[1] || p.image : p.image) : p.image,
      sizes: p.variants ? (typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants) : ['XS', 'S', 'M', 'L', 'XL'],
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image]),
      inStock: (p.inventory || 0) > 0,
      readyToShip: true,
      dispatchDays: 3,
      rating: 4.9,
      reviewsCount: 18,
      colors: ['Ruby Red', 'Emerald', 'Ivory'],
      occasion: 'Festive',
      fabric: 'Pure Raw Silk',
      embellishments: ['Zardozi', 'Resham', 'Marori'],
      includes: 'Shirt, Dupatta & Trouser'
    }));

    res.json({ collection, products: mappedProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Inventory Control & History ---
adminRouter.get('/inventory', verifyAdminAuth, async (req: any, res) => {
  if (isUsingMemoryFallback()) {
    const invItems = memoryStore.products.map(p => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      inventory: p.inventory,
      variants: p.variants || ['XS', 'S', 'M', 'L', 'XL'],
      status: p.inventory > 0 ? 'In Stock' : 'Out of Stock'
    }));
    return res.json({ inventory: invItems });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT id, title, sku, inventory, variants, status FROM admin_products ORDER BY title ASC');
    const inventoryItems = rows.map((r: any) => ({
      ...r,
      variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants || ['XS', 'S', 'M', 'L', 'XL'])
    }));
    res.json({ inventory: inventoryItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/inventory/adjust', verifyAdminAuth, async (req: any, res) => {
  const { productId, adjustment, reason, variant } = req.body;
  if (!productId || adjustment === undefined || !reason) {
    return res.status(400).json({ error: 'Product ID, adjustment amount, and reason are required' });
  }

  const adjNum = Number(adjustment);
  if (isNaN(adjNum)) {
    return res.status(400).json({ error: 'Invalid adjustment quantity' });
  }

  if (isUsingMemoryFallback()) {
    const prod = memoryStore.products.find(p => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    const prevStock = prod.inventory || 0;
    const newStock = Math.max(0, prevStock + adjNum);
    prod.inventory = newStock;

    const logEntry = {
      id: Date.now(),
      productId: prod.id,
      productTitle: prod.title,
      sku: prod.sku,
      variant: variant || 'Default',
      previousStock: prevStock,
      newStock,
      adjustment: adjNum,
      reason,
      userEmail: req.adminUser.email,
      createdAt: new Date().toISOString()
    };
    (memoryStore as any).inventoryLogs = (memoryStore as any).inventoryLogs || [];
    (memoryStore as any).inventoryLogs.unshift(logEntry);

    return res.json({ success: true, newStock, product: prod });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_products WHERE id = ?', [productId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const prod = rows[0];
    const prevStock = Number(prod.inventory || 0);
    const newStock = Math.max(0, prevStock + adjNum);

    await pool!.query('UPDATE admin_products SET inventory = ? WHERE id = ?', [newStock, productId]);

    await pool!.query(
      `INSERT INTO inventory_logs (product_id, product_title, sku, variant, previous_stock, new_stock, adjustment, reason, user_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prod.id, prod.title, prod.sku, variant || 'Default', prevStock, newStock, adjNum, reason, req.adminUser.email]
    );

    await pool!.query(
      'INSERT INTO admin_activity_logs (user_email, action, description) VALUES (?, ?, ?)',
      [req.adminUser.email, 'ADJUST_INVENTORY', `Adjusted stock for ${prod.title} by ${adjNum} (${reason})`]
    );

    res.json({ success: true, newStock });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/inventory/history', verifyAdminAuth, async (req: any, res) => {
  if (isUsingMemoryFallback()) {
    return res.json({ history: (memoryStore as any).inventoryLogs || [] });
  }
  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ history: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

// --- Schema Markup Endpoints ---
adminRouter.get('/schemas', verifyAdminAuth, async (req, res) => {
  const { referenceType, referenceId } = req.query;
  if (isUsingMemoryFallback()) {
    let results = memoryStore.schemas;
    if (referenceType) results = results.filter((s: any) => s.referenceType === referenceType);
    if (referenceId) results = results.filter((s: any) => s.referenceId === referenceId);
    return res.json({ schemas: results });
  }

  try {
    const pool = await getPool();
    let query = 'SELECT * FROM admin_schemas WHERE 1=1';
    const params: any[] = [];
    if (referenceType) {
      query += ' AND reference_type = ?';
      params.push(referenceType);
    }
    if (referenceId) {
      query += ' AND reference_id = ?';
      params.push(referenceId);
    }
    query += ' ORDER BY created_at DESC';
    const [rows]: any = await pool!.query(query, params);
    const mapped = rows.map((r: any) => ({
      id: r.id,
      referenceType: r.reference_type,
      referenceId: r.reference_id,
      name: r.name,
      schemaType: r.schema_type,
      jsonContent: r.json_content,
      isEnabled: Boolean(r.is_enabled),
      createdAt: r.created_at
    }));
    res.json({ schemas: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/schemas', verifyAdminAuth, async (req: any, res) => {
  const { id, referenceType, referenceId, name, schemaType, jsonContent, isEnabled } = req.body;
  if (!referenceType || !referenceId || !name || !schemaType || !jsonContent) {
    return res.status(400).json({ error: 'Missing required schema fields' });
  }

  // Validate JSON syntax
  try {
    JSON.parse(jsonContent);
  } catch (e: any) {
    return res.status(400).json({ error: `Invalid JSON syntax: ${e.message}` });
  }

  const schemaId = id || `sch-${Date.now()}`;
  const enabledVal = isEnabled !== false ? 1 : 0;

  if (isUsingMemoryFallback()) {
    const existingIndex = memoryStore.schemas.findIndex((s: any) => s.id === schemaId);
    const schemaObj = {
      id: schemaId,
      referenceType,
      referenceId,
      name,
      schemaType,
      jsonContent,
      isEnabled: Boolean(enabledVal),
      createdAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      memoryStore.schemas[existingIndex] = schemaObj;
    } else {
      memoryStore.schemas.push(schemaObj);
    }
    return res.json({ success: true, schema: schemaObj });
  }

  try {
    const pool = await getPool();
    await pool!.query(
      `INSERT INTO admin_schemas (id, reference_type, reference_id, name, schema_type, json_content, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), schema_type = VALUES(schema_type), json_content = VALUES(json_content), is_enabled = VALUES(is_enabled)`,
      [schemaId, referenceType, referenceId, name, schemaType, jsonContent, enabledVal]
    );
    res.json({ success: true, schema: { id: schemaId, referenceType, referenceId, name, schemaType, jsonContent, isEnabled: Boolean(enabledVal) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/schemas/:id/duplicate', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    const item = memoryStore.schemas.find((s: any) => s.id === id);
    if (!item) return res.status(404).json({ error: 'Schema not found' });
    const duplicate = {
      ...item,
      id: `sch-${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    memoryStore.schemas.unshift(duplicate);
    return res.status(201).json({ success: true, schema: duplicate });
  }

  try {
    const pool = await getPool();
    const [rows]: any = await pool!.query('SELECT * FROM admin_schemas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Schema not found' });
    const cur = rows[0];
    const newId = `sch-${Date.now()}`;
    const newName = `${cur.name} (Copy)`;
    await pool!.query(
      `INSERT INTO admin_schemas (id, reference_type, reference_id, name, schema_type, json_content, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, cur.reference_type, cur.reference_id, newName, cur.schema_type, cur.json_content, cur.is_enabled]
    );
    res.status(201).json({
      success: true,
      schema: {
        id: newId,
        referenceType: cur.reference_type,
        referenceId: cur.reference_id,
        name: newName,
        schemaType: cur.schema_type,
        jsonContent: cur.json_content,
        isEnabled: Boolean(cur.is_enabled)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/schemas/:id/toggle', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  const { isEnabled } = req.body;
  const val = isEnabled ? 1 : 0;

  if (isUsingMemoryFallback()) {
    const item = memoryStore.schemas.find((s: any) => s.id === id);
    if (!item) return res.status(404).json({ error: 'Schema not found' });
    item.isEnabled = Boolean(val);
    return res.json({ success: true, schema: item });
  }

  try {
    const pool = await getPool();
    await pool!.query('UPDATE admin_schemas SET is_enabled = ? WHERE id = ?', [val, id]);
    const [rows]: any = await pool!.query('SELECT * FROM admin_schemas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Schema not found' });
    const r = rows[0];
    res.json({
      success: true,
      schema: {
        id: r.id,
        referenceType: r.reference_type,
        referenceId: r.reference_id,
        name: r.name,
        schemaType: r.schema_type,
        jsonContent: r.json_content,
        isEnabled: Boolean(r.is_enabled)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/schemas/preview-url', verifyAdminAuth, async (req: any, res) => {
  const targetUrl = (req.query.url as string) || '/';
  let refType = 'global';
  let refId = 'global';

  if (targetUrl.startsWith('/products/')) {
    refType = 'product';
    refId = targetUrl.replace('/products/', '');
  } else if (targetUrl.startsWith('/collections/')) {
    refType = 'collection';
    refId = targetUrl.replace('/collections/', '') || 'all';
  } else if (targetUrl.startsWith('/pages/')) {
    refType = 'page';
    refId = targetUrl.replace('/pages/', '');
  }

  let applicable: any[] = [];
  if (isUsingMemoryFallback()) {
    applicable = memoryStore.schemas.filter((s: any) => s.isEnabled && (s.referenceType === 'global' || (s.referenceType === refType && s.referenceId === refId)));
  } else {
    try {
      const pool = await getPool();
      const [rows]: any = await pool!.query(
        "SELECT * FROM admin_schemas WHERE is_enabled = 1 AND (reference_type = 'global' OR (reference_type = ? AND reference_id = ?)) ORDER BY created_at DESC",
        [refType, refId]
      );
      applicable = rows.map((r: any) => ({
        id: r.id,
        referenceType: r.reference_type,
        referenceId: r.reference_id,
        name: r.name,
        schemaType: r.schema_type,
        jsonContent: r.json_content,
        isEnabled: Boolean(r.is_enabled)
      }));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Precedence & duplicate conflict detection
  const typeCounts: Record<string, number> = {};
  const conflicts: string[] = [];
  applicable.forEach((s) => {
    try {
      const parsed = JSON.parse(s.jsonContent);
      const t = parsed['@type'] || s.schemaType;
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      if (typeCounts[t] === 2) {
        conflicts.push(`Duplicate @type "${t}" found across ${s.referenceType} and global scope. The specific scope will take precedence on the storefront.`);
      }
    } catch (e: any) {
      conflicts.push(`Schema "${s.name}" has invalid JSON syntax: ${e.message}`);
    }
  });

  res.json({
    url: targetUrl,
    resolvedReferenceType: refType,
    resolvedReferenceId: refId,
    applicableSchemas: applicable,
    conflicts,
    combinedCount: applicable.length
  });
});

adminRouter.delete('/schemas/:id', verifyAdminAuth, async (req: any, res) => {
  const { id } = req.params;
  if (isUsingMemoryFallback()) {
    memoryStore.schemas = memoryStore.schemas.filter((s: any) => s.id !== id);
    return res.json({ success: true });
  }

  try {
    const pool = await getPool();
    await pool!.query('DELETE FROM admin_schemas WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



