import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { store } from './src/server/store.ts';
import { validateUrlForSSRF } from './src/server/ssrf.ts';
import { adminRouter } from './src/server/adminRoutes.ts';
import { initDatabase, memoryStore, isUsingMemoryFallback, getPool } from './src/server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Initialize Database
  await initDatabase();

  // Mount Admin API
  app.use('/api/admin', adminRouter);


  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Laam E-Commerce Engine',
      version: '2.0.0',
      time: new Date().toISOString(),
    });
  });

  // Public Schema Markup Endpoint
  app.get('/api/schemas/public', async (req, res) => {
    const { referenceType, referenceId } = req.query;
    if (isUsingMemoryFallback()) {
      let results = memoryStore.schemas.filter((s: any) => s.isEnabled);
      if (referenceType) results = results.filter((s: any) => s.referenceType === referenceType || s.referenceType === 'global');
      if (referenceId) results = results.filter((s: any) => s.referenceId === referenceId || s.referenceId === 'global');
      return res.json({ schemas: results });
    }
    try {
      const pool = await getPool();
      let query = 'SELECT * FROM admin_schemas WHERE is_enabled = 1';
      const params: any[] = [];
      if (referenceType) {
        query += ' AND (reference_type = ? OR reference_type = "global")';
        params.push(referenceType);
      }
      if (referenceId) {
        query += ' AND (reference_id = ? OR reference_id = "global")';
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
        isEnabled: Boolean(r.is_enabled)
      }));
      res.json({ schemas: mapped });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://laam.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://laam.com/collections</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://laam.com/collections/pret</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://laam.com/collections/festive</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://laam.com/designers</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`);
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://laam.com/sitemap.xml`);
  });

  // --- Auth & Workspace ---
  app.get('/api/auth/me', (req, res) => {
    const user = store.getCurrentUser();
    const workspace = store.getActiveWorkspace();
    res.json({
      user,
      workspace,
      workspaces: store.workspaces,
    });
  });

  // Switch role for RBAC testing
  app.post('/api/auth/role', (req, res) => {
    const { role } = req.body;
    const user = store.getCurrentUser();
    if (['owner', 'administrator', 'member', 'viewer'].includes(role)) {
      user.role = role;
    }
    res.json({ user });
  });

  // Switch active workspace
  app.post('/api/workspaces/switch', (req, res) => {
    const { workspaceId } = req.body;
    const ws = store.workspaces.find((w) => w.id === workspaceId);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    store.activeWorkspaceId = ws.id;
    res.json({ workspace: ws });
  });

  // --- Dashboard Stats ---
  app.get('/api/dashboard/stats', (req, res) => {
    const ws = store.getActiveWorkspace();
    const websites = store.getWebsitesForWorkspace(ws.id);
    const incidents = store.getIncidentsForWorkspace(ws.id);
    const changes = store.getChangesForWorkspace(ws.id);
    const auditLogs = store.getAuditLogsForWorkspace(ws.id);

    const totalMonitored = websites.length;
    const websitesHealthy = websites.filter((w) => w.status === 'healthy').length;
    const unresolvedAlerts = incidents.filter((i) => i.status !== 'resolved').length;
    
    // Checks in last 24h
    const recentChecks = store.checkResults.filter((c) => {
      const site = websites.find((w) => w.id === c.websiteId);
      return !!site;
    });
    const failedChecksCount = recentChecks.filter((c) => !c.success).length;

    res.json({
      kpis: {
        totalMonitored,
        websitesHealthy,
        unresolvedAlerts,
        failedChecksCount,
        averageUptime: websites.length ? (websites.reduce((acc, w) => acc + w.uptimePercentage, 0) / websites.length).toFixed(1) : '100',
      },
      websites,
      openIncidents: incidents.filter((i) => i.status !== 'resolved'),
      recentChanges: changes.slice(0, 6),
      recentActivity: auditLogs.slice(0, 10),
      chartTrends: store.checkResults.slice(0, 24).reverse(),
      simulatorState: store.simulatorState,
    });
  });

  // --- Website Management ---
  app.get('/api/websites', (req, res) => {
    const websites = store.getWebsitesForWorkspace();
    res.json({ websites });
  });

  app.post('/api/websites', (req, res) => {
    const user = store.getCurrentUser();
    if (user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers do not have permission to add websites.' });
    }

    const { name, url, category, frequency, timezone, expectedCtaSelector, expectedCtaText } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Website URL is required.' });
    }

    const result = store.addWebsite({
      name: name || '',
      url,
      category: category || 'ecommerce',
      frequency: frequency || '15m',
      timezone: timezone || 'UTC',
      expectedCtaSelector,
      expectedCtaText,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ website: result.website });
  });

  app.post('/api/websites/:id/check', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await store.executeWebsiteCheck(id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Check execution failed' });
    }
  });

  app.post('/api/websites/:id/toggle-pause', (req, res) => {
    const user = store.getCurrentUser();
    if (user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot modify website status.' });
    }
    const updated = store.togglePause(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json({ website: updated });
  });

  app.delete('/api/websites/:id', (req, res) => {
    const user = store.getCurrentUser();
    if (user.role === 'viewer' || user.role === 'member') {
      return res.status(403).json({ error: 'Only owners or administrators can delete websites.' });
    }
    const success = store.deleteWebsite(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json({ success: true });
  });

  // --- Detected Changes ---
  app.get('/api/changes', (req, res) => {
    const changes = store.getChangesForWorkspace();
    res.json({ changes });
  });

  app.patch('/api/changes/:id', (req, res) => {
    const { status, notes } = req.body;
    const updated = store.updateChangeStatus(req.params.id, status, notes);
    if (!updated) {
      return res.status(404).json({ error: 'Change not found' });
    }
    res.json({ change: updated });
  });

  // --- Incidents ---
  app.get('/api/incidents', (req, res) => {
    const incidents = store.getIncidentsForWorkspace();
    res.json({ incidents });
  });

  app.patch('/api/incidents/:id', (req, res) => {
    const { status, notes } = req.body;
    const updated = store.updateIncident(req.params.id, { status, notes });
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ incident: updated });
  });

  // --- Notifications ---
  app.get('/api/notifications', (req, res) => {
    const notifications = store.getNotificationsForWorkspace();
    res.json({ notifications });
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    const notif = store.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    const wsNotifs = store.getNotificationsForWorkspace();
    wsNotifs.forEach((n) => (n.read = true));
    res.json({ success: true });
  });

  // --- Audit Logs ---
  app.get('/api/audit-logs', (req, res) => {
    const logs = store.getAuditLogsForWorkspace();
    res.json({ logs });
  });

  // --- Scenario Simulator Controls ---
  app.post('/api/simulator/scenario', (req, res) => {
    const { scenario } = req.body;
    if (!['healthy', 'cta_missing', 'title_changed', 'server_error', 'latency_spike'].includes(scenario)) {
      return res.status(400).json({ error: 'Invalid scenario name' });
    }
    const state = store.setSimulatorScenario(scenario);
    res.json({ state });
  });

  // --- Live On-Demand URL Inspector with SSRF Protection ---
  app.post('/api/live-check', async (req, res) => {
    const { url, expectedCtaSelector } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    const ssrfCheck = validateUrlForSSRF(url);
    if (!ssrfCheck.valid) {
      return res.status(400).json({
        error: ssrfCheck.error || 'Blocked by SSRF Security Filter',
        securityBlocked: true,
      });
    }

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(ssrfCheck.normalizedUrl!, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SiteSentinel-Inspector/2.0 (+https://sitesentinel.io/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);
      const responseTimeMs = Date.now() - startTime;
      const html = await response.text();

      // Extract basic DOM elements
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
      const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);

      let ctaFound = undefined;
      if (expectedCtaSelector) {
        const cleanSelector = expectedCtaSelector.replace(/^[.#]/, '');
        ctaFound = html.includes(cleanSelector) || html.includes(`id="${cleanSelector}"`) || html.includes(`class="${cleanSelector}"`);
      }

      res.json({
        url: ssrfCheck.normalizedUrl,
        statusCode: response.status,
        statusText: response.statusText,
        responseTimeMs,
        title: titleMatch ? titleMatch[1].trim() : '(No <title> found)',
        h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '(No <h1> tag found)',
        metaDescription: metaDescMatch ? metaDescMatch[1].trim() : '(No meta description tag)',
        canonicalUrl: canonicalMatch ? canonicalMatch[1].trim() : '(Not configured)',
        robotsDirective: robotsMatch ? robotsMatch[1].trim() : 'index, follow (default)',
        contentLengthBytes: Buffer.byteLength(html, 'utf8'),
        ctaFound,
        expectedCtaSelector,
        headers: {
          server: response.headers.get('server') || 'Unknown',
          contentType: response.headers.get('content-type') || 'text/html',
        },
      });
    } catch (err: any) {
      res.status(502).json({
        error: `Failed to connect to ${ssrfCheck.normalizedUrl}: ${err.message || 'Connection timeout / Unreachable'}`,
        networkError: true,
      });
    }
  });

  // Mount Vite middleware in dev or static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SiteSentinel Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
