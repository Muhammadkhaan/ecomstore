import {
  User,
  Workspace,
  Website,
  MonitoredPage,
  ContentSnapshot,
  DetectedChange,
  Incident,
  CheckResult,
  NotificationItem,
  AuditLog,
  UserRole,
  SeverityLevel
} from './types.ts';
import { validateUrlForSSRF } from './ssrf.ts';

class DataStore {
  public users: User[] = [];
  public workspaces: Workspace[] = [];
  public websites: Website[] = [];
  public pages: MonitoredPage[] = [];
  public snapshots: ContentSnapshot[] = [];
  public changes: DetectedChange[] = [];
  public incidents: Incident[] = [];
  public checkResults: CheckResult[] = [];
  public notifications: NotificationItem[] = [];
  public auditLogs: AuditLog[] = [];
  public activeWorkspaceId = 'ws-acme';
  public currentUserId = 'usr-sarah';

  // Live Scenario Simulator state
  public simulatorState: {
    scenario: 'healthy' | 'cta_missing' | 'title_changed' | 'server_error' | 'latency_spike';
    targetSiteId: string;
    ctaPresent: boolean;
    pageTitle: string;
    statusCode: number;
    responseTimeMs: number;
    lastTriggeredAt?: string;
  } = {
    scenario: 'healthy',
    targetSiteId: 'site-apex',
    ctaPresent: true,
    pageTitle: 'Apex Storefront — High Performance Modern Apparel',
    statusCode: 200,
    responseTimeMs: 245,
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Current user
    const user: User = {
      id: 'usr-sarah',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@sitesentinel.io',
      role: 'owner',
      timezone: 'America/New_York (UTC-5)',
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-08-15T09:00:00Z',
    };
    this.users.push(user);

    // Primary Workspace
    const workspace: Workspace = {
      id: 'ws-acme',
      name: 'Acme Digital & Commerce',
      ownerId: user.id,
      plan: 'starter',
      members: [
        { userId: user.id, role: 'owner', joinedAt: '2026-08-15T09:00:00Z' },
        { userId: 'usr-alex', role: 'administrator', joinedAt: '2026-08-20T14:30:00Z' },
        { userId: 'usr-elena', role: 'member', joinedAt: '2026-09-01T10:15:00Z' },
        { userId: 'usr-david', role: 'viewer', joinedAt: '2026-09-12T16:00:00Z' },
      ],
      limits: {
        maxWebsites: 10,
        minFrequencyMinutes: 5,
        retentionDays: 30,
        browserChecksEnabled: true,
      },
      createdAt: '2026-08-15T09:00:00Z',
    };
    this.workspaces.push(workspace);

    // Secondary Agency Workspace
    this.workspaces.push({
      id: 'ws-agency',
      name: 'GrowthWave Client Portfolio',
      ownerId: user.id,
      plan: 'agency',
      members: [
        { userId: user.id, role: 'owner', joinedAt: '2026-09-01T08:00:00Z' },
      ],
      limits: {
        maxWebsites: 50,
        minFrequencyMinutes: 1,
        retentionDays: 90,
        browserChecksEnabled: true,
      },
      createdAt: '2026-09-01T08:00:00Z',
    });

    // Monitored Websites for primary workspace
    const site1: Website = {
      id: 'site-apex',
      workspaceId: 'ws-acme',
      name: 'Apex Storefront (Production)',
      url: 'https://shop.apexapparel.io',
      category: 'ecommerce',
      frequency: '5m',
      timezone: 'America/New_York',
      status: 'critical',
      lastStatusCode: 500,
      lastResponseTimeMs: 1420,
      lastCheckAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      lastSuccessfulCheckAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      nextCheckAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
      activeAlertsCount: 2,
      recentChangesCount: 3,
      uptimePercentage: 98.4,
      tlsExpiryDays: 68,
      paused: false,
      expectedCtaSelector: '#add-to-cart-button',
      expectedCtaText: 'Add to Cart',
      createdAt: '2026-08-16T10:00:00Z',
    };

    const site2: Website = {
      id: 'site-cloudsaas',
      workspaceId: 'ws-acme',
      name: 'CloudMetrics SaaS Portal',
      url: 'https://cloudmetrics.dev',
      category: 'saas',
      frequency: '15m',
      timezone: 'America/New_York',
      status: 'warning',
      lastStatusCode: 200,
      lastResponseTimeMs: 410,
      lastCheckAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      lastSuccessfulCheckAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      nextCheckAt: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
      activeAlertsCount: 1,
      recentChangesCount: 2,
      uptimePercentage: 99.8,
      tlsExpiryDays: 142,
      paused: false,
      expectedCtaSelector: '.btn-free-trial',
      expectedCtaText: 'Start Free 14-Day Trial',
      createdAt: '2026-08-22T11:00:00Z',
    };

    const site3: Website = {
      id: 'site-dental',
      workspaceId: 'ws-acme',
      name: 'Beacon Health & Clinical Care',
      url: 'https://beaconhealthpartners.org',
      category: 'lead_gen',
      frequency: '30m',
      timezone: 'America/New_York',
      status: 'healthy',
      lastStatusCode: 200,
      lastResponseTimeMs: 195,
      lastCheckAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      lastSuccessfulCheckAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      nextCheckAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      activeAlertsCount: 0,
      recentChangesCount: 0,
      uptimePercentage: 100.0,
      tlsExpiryDays: 284,
      paused: false,
      expectedCtaSelector: '#book-consultation',
      expectedCtaText: 'Book Appointment',
      createdAt: '2026-09-05T14:00:00Z',
    };

    const site4: Website = {
      id: 'site-blog',
      workspaceId: 'ws-acme',
      name: 'Acme Engineering Blog',
      url: 'https://engineering.acme.corp',
      category: 'media',
      frequency: '1h',
      timezone: 'America/New_York',
      status: 'healthy',
      lastStatusCode: 200,
      lastResponseTimeMs: 165,
      lastCheckAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      lastSuccessfulCheckAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      nextCheckAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      activeAlertsCount: 0,
      recentChangesCount: 1,
      uptimePercentage: 99.9,
      tlsExpiryDays: 310,
      paused: false,
      createdAt: '2026-09-10T12:00:00Z',
    };

    // Agency Workspace website
    const siteAgency: Website = {
      id: 'site-client-lumina',
      workspaceId: 'ws-agency',
      name: 'Lumina Luxury Interiors',
      url: 'https://luminainteriors.com',
      category: 'agency_client',
      frequency: '15m',
      timezone: 'America/Los_Angeles',
      status: 'healthy',
      lastStatusCode: 200,
      lastResponseTimeMs: 230,
      lastCheckAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      lastSuccessfulCheckAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      nextCheckAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      activeAlertsCount: 0,
      recentChangesCount: 0,
      uptimePercentage: 100.0,
      tlsExpiryDays: 180,
      paused: false,
      expectedCtaSelector: '.request-catalog',
      expectedCtaText: 'Request Lookbook',
      createdAt: '2026-09-02T10:00:00Z',
    };

    this.websites.push(site1, site2, site3, site4, siteAgency);

    // Monitored Pages for Apex Storefront
    this.pages.push(
      {
        id: 'pg-apex-home',
        websiteId: site1.id,
        url: 'https://shop.apexapparel.io/',
        path: '/',
        checkTypes: ['availability', 'content', 'metadata', 'cta'],
        lastStatusCode: 500,
        lastResponseTimeMs: 1420,
        lastCheckAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        isPaused: false,
      },
      {
        id: 'pg-apex-checkout',
        websiteId: site1.id,
        url: 'https://shop.apexapparel.io/checkout',
        path: '/checkout',
        checkTypes: ['availability', 'cta'],
        lastStatusCode: 200,
        lastResponseTimeMs: 820,
        lastCheckAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        isPaused: false,
      },
      {
        id: 'pg-apex-hoodie',
        websiteId: site1.id,
        url: 'https://shop.apexapparel.io/products/heavyweight-fleece-hoodie',
        path: '/products/heavyweight-fleece-hoodie',
        checkTypes: ['availability', 'content', 'metadata', 'cta'],
        lastStatusCode: 200,
        lastResponseTimeMs: 310,
        lastCheckAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        isPaused: false,
      }
    );

    // Initial Incidents
    this.incidents.push(
      {
        id: 'inc-1092',
        websiteId: site1.id,
        websiteName: site1.name,
        websiteUrl: site1.url,
        title: 'Persistent 500 Internal Server Error on Homepage',
        severity: 'critical',
        status: 'active',
        affectedPages: ['https://shop.apexapparel.io/'],
        firstDetectedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
        lastObservedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        occurrenceCount: 6,
        rootCauseSummary: 'HTTP status changed from 200 OK to 500 Internal Server Error following upstream backend deployment.',
        timeline: [
          { timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), event: 'First failure detected (HTTP 500, 1820ms response time)' },
          { timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(), event: 'Automated retry confirms HTTP 500 error. Severity escalated to Critical.' },
          { timestamp: new Date(Date.now() - 79 * 60 * 1000).toISOString(), event: 'Deduplicated email alert dispatched to workspace administrator.' },
          { timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), event: 'Error condition persists across consecutive check cycles.' },
        ],
        notes: 'Investigating potential database connection pool exhaustion on ingress proxy.',
      },
      {
        id: 'inc-1088',
        websiteId: site2.id,
        websiteName: site2.name,
        websiteUrl: site2.url,
        title: 'Primary CTA Button "#btn-free-trial" Not Found in DOM',
        severity: 'high',
        status: 'acknowledged',
        affectedPages: ['https://cloudmetrics.dev/pricing'],
        firstDetectedAt: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
        lastObservedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        occurrenceCount: 4,
        rootCauseSummary: 'Expected conversion button missing from DOM baseline snapshot. Potential conversion leak on pricing table.',
        timeline: [
          { timestamp: new Date(Date.now() - 250 * 60 * 1000).toISOString(), event: 'DOM selector .btn-free-trial returned 0 matches in rendered markup.' },
          { timestamp: new Date(Date.now() - 245 * 60 * 1000).toISOString(), event: 'Alert raised with high confidence (94%). Acknowledged by Sarah J.' },
        ],
        notes: 'Design team tested an A/B variation with a new class name. Monitoring rule updated.',
      }
    );

    // Initial Detected Changes
    this.changes.push(
      {
        id: 'chg-401',
        websiteId: site1.id,
        websiteName: site1.name,
        pageUrl: 'https://shop.apexapparel.io/',
        changeCategory: 'status_code',
        severity: 'critical',
        confidence: 99,
        title: 'HTTP Status Changed: 200 OK → 500 Internal Server Error',
        diffSummary: 'Server returned HTTP status 500 instead of expected 200 OK.',
        previousValue: 'HTTP 200 OK (Content-Type: text/html, Content-Length: 48,291 bytes)',
        newValue: 'HTTP 500 Internal Server Error (Content-Type: text/plain, Content-Length: 104 bytes)',
        detectedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
        status: 'open',
        incidentId: 'inc-1092',
        potentialImpact: 'Shoppers cannot load the storefront homepage. High risk of immediate revenue and ad spend loss.',
        suggestedAction: 'Verify application error logs, roll back recent deploy, or restore database connection pool.',
      },
      {
        id: 'chg-398',
        websiteId: site2.id,
        websiteName: site2.name,
        pageUrl: 'https://cloudmetrics.dev/pricing',
        changeCategory: 'cta_missing',
        severity: 'high',
        confidence: 94,
        title: 'Primary CTA Missing: Expected selector ".btn-free-trial"',
        diffSummary: 'Element matching selector ".btn-free-trial" disappeared from DOM.',
        previousValue: '<button class="btn-primary btn-free-trial">Start Free 14-Day Trial</button>',
        newValue: '[Element Not Present in Document]',
        detectedAt: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
        status: 'acknowledged',
        incidentId: 'inc-1088',
        userNotes: 'A/B test changed class to .cta-trial-hero. Need to update selector in page settings.',
        potentialImpact: 'Users arriving on the pricing page have no clickable button to register.',
        suggestedAction: 'Restore the primary button or update the monitored element selector.',
      },
      {
        id: 'chg-392',
        websiteId: site1.id,
        websiteName: site1.name,
        pageUrl: 'https://shop.apexapparel.io/products/heavyweight-fleece-hoodie',
        changeCategory: 'title',
        severity: 'informational',
        confidence: 100,
        title: 'Page Title Modified: Seasonal promo text appended',
        diffSummary: 'Title changed from original baseline to include "Fall Drop" tagline.',
        previousValue: 'Heavyweight Fleece Hoodie — Apex Apparel Store',
        newValue: 'Heavyweight Fleece Hoodie (Fall Drop 2026) — Apex Apparel Store',
        detectedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: 'resolved',
        userNotes: 'Marketing launched Fall 2026 campaign.',
        potentialImpact: 'Normal marketing update. Search engines will index new title in 48–72 hours.',
        suggestedAction: 'Accept new baseline to stop future notifications for this copy update.',
      },
      {
        id: 'chg-389',
        websiteId: site4.id,
        websiteName: site4.name,
        pageUrl: 'https://engineering.acme.corp/posts/distributed-systems-at-scale',
        changeCategory: 'canonical',
        severity: 'medium',
        confidence: 92,
        title: 'Canonical URL Changed: Protocol switched to HTTPS',
        diffSummary: 'Canonical tag protocol switched from http:// to https://.',
        previousValue: '<link rel="canonical" href="http://engineering.acme.corp/distributed-systems">',
        newValue: '<link rel="canonical" href="https://engineering.acme.corp/distributed-systems-at-scale">',
        detectedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        status: 'resolved',
        potentialImpact: 'Search engine bots will consolidate equity to the new canonical URL.',
        suggestedAction: 'Confirm redirect is 301 Permanent and matches sitemap entry.',
      }
    );

    // Initial Notifications
    this.notifications.push(
      {
        id: 'notif-1',
        workspaceId: 'ws-acme',
        title: 'Critical Outage: Apex Storefront',
        message: 'HTTP 500 error detected on homepage. Incident #1092 opened.',
        severity: 'critical',
        read: false,
        createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
        websiteId: site1.id,
      },
      {
        id: 'notif-2',
        workspaceId: 'ws-acme',
        title: 'High Priority: Pricing CTA Missing',
        message: 'Primary trial CTA button missing on CloudMetrics pricing page.',
        severity: 'high',
        read: false,
        createdAt: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
        websiteId: site2.id,
      },
      {
        id: 'notif-3',
        workspaceId: 'ws-acme',
        title: 'Routine Check Completed',
        message: 'Beacon Health & Clinical Care passed all 4 scheduled checks.',
        severity: 'informational',
        read: true,
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        websiteId: site3.id,
      }
    );

    // 24-Hour Check Results for Trends Chart
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 3600 * 1000).toISOString();
      const isApexOutage = i <= 2;
      this.checkResults.push({
        id: `chk-${i}`,
        websiteId: isApexOutage ? site1.id : (i % 2 === 0 ? site2.id : site3.id),
        url: isApexOutage ? site1.url : site2.url,
        statusCode: isApexOutage ? 500 : 200,
        responseTimeMs: isApexOutage ? 1420 : Math.floor(180 + Math.random() * 90),
        success: !isApexOutage,
        errorMessage: isApexOutage ? 'HTTP 500 Internal Server Error' : undefined,
        checkedAt: time,
        changesFoundCount: i === 1 ? 1 : 0,
      });
    }

    // Initial Audit Logs
    this.auditLogs.push(
      {
        id: 'aud-1',
        workspaceId: 'ws-acme',
        userId: user.id,
        userName: user.name,
        action: 'website.create',
        targetType: 'website',
        targetId: site1.id,
        details: 'Added Apex Storefront with 5-minute automated change monitoring and SSRF validation.',
        ipAddress: '198.51.100.24',
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'aud-2',
        workspaceId: 'ws-acme',
        userId: user.id,
        userName: user.name,
        action: 'incident.acknowledge',
        targetType: 'incident',
        targetId: 'inc-1088',
        details: 'Acknowledged CTA button missing alert on CloudMetrics pricing page.',
        ipAddress: '198.51.100.24',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      }
    );
  }

  // --- Workspace & Authorization Queries ---
  public getActiveWorkspace(): Workspace {
    const ws = this.workspaces.find((w) => w.id === this.activeWorkspaceId);
    return ws || this.workspaces[0];
  }

  public getCurrentUser(): User {
    const usr = this.users.find((u) => u.id === this.currentUserId);
    return usr || this.users[0];
  }

  public getWebsitesForWorkspace(wsId = this.activeWorkspaceId): Website[] {
    return this.websites.filter((w) => w.workspaceId === wsId);
  }

  public getIncidentsForWorkspace(wsId = this.activeWorkspaceId): Incident[] {
    const wsSiteIds = new Set(this.getWebsitesForWorkspace(wsId).map((w) => w.id));
    return this.incidents.filter((inc) => wsSiteIds.has(inc.websiteId));
  }

  public getChangesForWorkspace(wsId = this.activeWorkspaceId): DetectedChange[] {
    const wsSiteIds = new Set(this.getWebsitesForWorkspace(wsId).map((w) => w.id));
    return this.changes.filter((chg) => wsSiteIds.has(chg.websiteId));
  }

  public getNotificationsForWorkspace(wsId = this.activeWorkspaceId): NotificationItem[] {
    return this.notifications.filter((n) => n.workspaceId === wsId);
  }

  public getAuditLogsForWorkspace(wsId = this.activeWorkspaceId): AuditLog[] {
    return this.auditLogs.filter((a) => a.workspaceId === wsId);
  }

  // --- Website Management ---
  public addWebsite(data: {
    name: string;
    url: string;
    category: Website['category'];
    frequency: Website['frequency'];
    timezone?: string;
    expectedCtaSelector?: string;
    expectedCtaText?: string;
  }): { website?: Website; error?: string } {
    const validation = validateUrlForSSRF(data.url);
    if (!validation.valid || !validation.normalizedUrl) {
      return { error: validation.error || 'Invalid or insecure URL.' };
    }

    const ws = this.getActiveWorkspace();
    const currentCount = this.getWebsitesForWorkspace(ws.id).length;
    if (currentCount >= ws.limits.maxWebsites) {
      return { error: `Plan limit reached. Max ${ws.limits.maxWebsites} websites allowed on ${ws.plan} plan.` };
    }

    const newSite: Website = {
      id: `site-${Date.now().toString(36)}`,
      workspaceId: ws.id,
      name: data.name.trim() || new URL(validation.normalizedUrl).hostname,
      url: validation.normalizedUrl,
      category: data.category,
      frequency: data.frequency,
      timezone: data.timezone || 'UTC',
      status: 'healthy',
      activeAlertsCount: 0,
      recentChangesCount: 0,
      uptimePercentage: 100,
      tlsExpiryDays: 90,
      paused: false,
      expectedCtaSelector: data.expectedCtaSelector?.trim() || undefined,
      expectedCtaText: data.expectedCtaText?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    this.websites.unshift(newSite);

    // Add default root page
    this.pages.push({
      id: `pg-${Date.now().toString(36)}`,
      websiteId: newSite.id,
      url: newSite.url,
      path: '/',
      checkTypes: ['availability', 'content', 'metadata', 'cta'],
      isPaused: false,
    });

    // Record audit
    const currentUser = this.getCurrentUser();
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      workspaceId: ws.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'website.create',
      targetType: 'website',
      targetId: newSite.id,
      details: `Added "${newSite.name}" (${newSite.url}) with frequency ${newSite.frequency}. SSRF validated.`,
      ipAddress: '198.51.100.24',
      createdAt: new Date().toISOString(),
    });

    return { website: newSite };
  }

  public deleteWebsite(id: string): boolean {
    const idx = this.websites.findIndex((w) => w.id === id && w.workspaceId === this.activeWorkspaceId);
    if (idx === -1) return false;

    const site = this.websites[idx];
    this.websites.splice(idx, 1);

    const currentUser = this.getCurrentUser();
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      workspaceId: this.activeWorkspaceId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'website.delete',
      targetType: 'website',
      targetId: id,
      details: `Deleted website "${site.name}".`,
      ipAddress: '198.51.100.24',
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  public togglePause(id: string): Website | null {
    const site = this.websites.find((w) => w.id === id && w.workspaceId === this.activeWorkspaceId);
    if (!site) return null;

    site.paused = !site.paused;
    site.status = site.paused ? 'paused' : 'healthy';

    const currentUser = this.getCurrentUser();
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      workspaceId: this.activeWorkspaceId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: site.paused ? 'website.pause' : 'website.resume',
      targetType: 'website',
      targetId: id,
      details: `${site.paused ? 'Paused' : 'Resumed'} monitoring for "${site.name}".`,
      ipAddress: '198.51.100.24',
      createdAt: new Date().toISOString(),
    });

    return site;
  }

  // --- Monitoring & Differential Detection Engine ---
  public async executeWebsiteCheck(siteId: string): Promise<{
    website: Website;
    checkResult: CheckResult;
    newChanges: DetectedChange[];
    newIncident?: Incident;
  }> {
    const site = this.websites.find((w) => w.id === siteId);
    if (!site) {
      throw new Error('Website not found');
    }

    const now = new Date();
    const newChanges: DetectedChange[] = [];
    let statusCode = 200;
    let responseTime = 220;
    let title = 'Apex Storefront — High Performance Modern Apparel';
    let ctaFound = true;

    // Check if this is the target simulation site
    if (site.id === this.simulatorState.targetSiteId || site.id === 'site-apex') {
      const scenario = this.simulatorState.scenario;
      if (scenario === 'server_error') {
        statusCode = 500;
        responseTime = 1450;
      } else if (scenario === 'latency_spike') {
        statusCode = 200;
        responseTime = 3800;
      } else if (scenario === 'cta_missing') {
        statusCode = 200;
        responseTime = 260;
        ctaFound = false;
      } else if (scenario === 'title_changed') {
        statusCode = 200;
        responseTime = 230;
        title = '⚡ SALE NOW ON: 70% Off Everything — Apex Apparel Store';
      } else {
        statusCode = 200;
        responseTime = 210;
        ctaFound = true;
      }
    } else {
      // For any other site or external URL, perform real safe HTTP fetch with SSRF verification
      try {
        const start = Date.now();
        const ssrfCheck = validateUrlForSSRF(site.url);
        if (!ssrfCheck.valid) {
          statusCode = 400;
        } else {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          const response = await fetch(site.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'SiteSentinel-ChangeDetector/2.0 (+https://sitesentinel.io/bot)',
            },
          });
          clearTimeout(timeout);
          responseTime = Date.now() - start;
          statusCode = response.status;
          const html = await response.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) {
            title = titleMatch[1].trim();
          }
          if (site.expectedCtaSelector) {
            ctaFound = html.includes(site.expectedCtaSelector.replace(/^[.#]/, ''));
          }
        }
      } catch (err: any) {
        statusCode = 504;
        responseTime = 6000;
      }
    }

    // --- Differential Comparisons against baseline ---
    // 1. Status Code Change
    if (statusCode >= 500) {
      const changeId = `chg-${Date.now()}`;
      const change: DetectedChange = {
        id: changeId,
        websiteId: site.id,
        websiteName: site.name,
        pageUrl: site.url,
        changeCategory: 'status_code',
        severity: 'critical',
        confidence: 99,
        title: `HTTP Status Failure: Expected 200 OK, got ${statusCode}`,
        diffSummary: `Server returned HTTP ${statusCode} during automated change inspection.`,
        previousValue: 'HTTP 200 OK',
        newValue: `HTTP ${statusCode} Error (Response time: ${responseTime}ms)`,
        detectedAt: now.toISOString(),
        status: 'open',
        potentialImpact: 'Severe drop in site availability and lost conversions. Potential revenue leakage.',
        suggestedAction: 'Check application server health, reverse proxy routing, and error logs.',
      };
      newChanges.push(change);
      this.changes.unshift(change);

      // Open incident if not already active
      let incident = this.incidents.find((inc) => inc.websiteId === site.id && inc.status === 'active');
      if (!incident) {
        incident = {
          id: `inc-${Date.now()}`,
          websiteId: site.id,
          websiteName: site.name,
          websiteUrl: site.url,
          title: `Critical Outage: HTTP ${statusCode} on ${site.name}`,
          severity: 'critical',
          status: 'active',
          affectedPages: [site.url],
          firstDetectedAt: now.toISOString(),
          lastObservedAt: now.toISOString(),
          occurrenceCount: 1,
          rootCauseSummary: `HTTP ${statusCode} response returned during scheduled verification cycle.`,
          timeline: [
            { timestamp: now.toISOString(), event: `Incident detected: HTTP ${statusCode} error (${responseTime}ms).` },
          ],
        };
        this.incidents.unshift(incident);
      } else {
        incident.occurrenceCount++;
        incident.lastObservedAt = now.toISOString();
        incident.timeline.unshift({
          timestamp: now.toISOString(),
          event: `Error confirmed: HTTP ${statusCode} persisted.`,
        });
      }
      change.incidentId = incident.id;
      site.status = 'critical';
    } else if (responseTime > 3000) {
      // Latency Spike
      const change: DetectedChange = {
        id: `chg-${Date.now()}`,
        websiteId: site.id,
        websiteName: site.name,
        pageUrl: site.url,
        changeCategory: 'latency_spike',
        severity: 'high',
        confidence: 91,
        title: `Extreme Latency Spike Detected: ${responseTime}ms (Threshold: 1500ms)`,
        diffSummary: `Response time deteriorated from baseline 240ms to ${responseTime}ms.`,
        previousValue: 'Baseline response latency: ~240ms',
        newValue: `Observed latency: ${responseTime}ms (> 3000ms SLA alert)`,
        detectedAt: now.toISOString(),
        status: 'open',
        potentialImpact: 'High bounce rate and degraded Google Core Web Vitals (LCP/TTFB score penalty).',
        suggestedAction: 'Examine server load, CDN cache hit ratio, and slow database queries.',
      };
      newChanges.push(change);
      this.changes.unshift(change);
      site.status = 'warning';
    } else if (!ctaFound && site.expectedCtaSelector) {
      // Missing CTA element
      const change: DetectedChange = {
        id: `chg-${Date.now()}`,
        websiteId: site.id,
        websiteName: site.name,
        pageUrl: site.url,
        changeCategory: 'cta_missing',
        severity: 'high',
        confidence: 96,
        title: `Critical Element Missing: Selector "${site.expectedCtaSelector}" not in DOM`,
        diffSummary: `Primary conversion element "${site.expectedCtaSelector}" (${site.expectedCtaText || 'CTA'}) was removed or renamed in markup.`,
        previousValue: `<button id="${site.expectedCtaSelector.replace('#', '')}">${site.expectedCtaText || 'Add to Cart'}</button>`,
        newValue: '[Element Absent / DOM Query Returned 0 Matches]',
        detectedAt: now.toISOString(),
        status: 'open',
        potentialImpact: 'Immediate customer funnel breakage: visitors cannot proceed to checkout or lead capture.',
        suggestedAction: 'Re-deploy previous frontend template or update monitored element selector.',
      };
      newChanges.push(change);
      this.changes.unshift(change);

      // Create high-severity incident
      const incident: Incident = {
        id: `inc-${Date.now()}`,
        websiteId: site.id,
        websiteName: site.name,
        websiteUrl: site.url,
        title: `Conversion Blocker: Expected CTA "${site.expectedCtaSelector}" Missing`,
        severity: 'high',
        status: 'active',
        affectedPages: [site.url],
        firstDetectedAt: now.toISOString(),
        lastObservedAt: now.toISOString(),
        occurrenceCount: 1,
        rootCauseSummary: `DOM element "${site.expectedCtaSelector}" not detected in HTML payload.`,
        timeline: [
          { timestamp: now.toISOString(), event: `CTA element disappearance detected with 96% confidence.` },
        ],
      };
      this.incidents.unshift(incident);
      change.incidentId = incident.id;
      site.status = 'warning';
    } else if (title.includes('SALE') || (site.id === 'site-apex' && this.simulatorState.scenario === 'title_changed')) {
      // Content / Title Change
      const change: DetectedChange = {
        id: `chg-${Date.now()}`,
        websiteId: site.id,
        websiteName: site.name,
        pageUrl: site.url,
        changeCategory: 'title',
        severity: 'medium',
        confidence: 100,
        title: 'Title Tag Alteration Detected',
        diffSummary: 'Page title changed significantly from baseline.',
        previousValue: 'Apex Storefront — High Performance Modern Apparel',
        newValue: title,
        detectedAt: now.toISOString(),
        status: 'open',
        potentialImpact: 'Search engines will re-index new snippet. CTR in SERP may fluctuate.',
        suggestedAction: 'Verify if change was authorized by marketing or SEO team, then accept as new baseline.',
      };
      newChanges.push(change);
      this.changes.unshift(change);
      site.status = 'healthy';
    } else {
      // Normal healthy check
      site.status = 'healthy';
      // If there were active incidents from old test, auto-resolve or mark verified
      const activeInc = this.incidents.find((inc) => inc.websiteId === site.id && inc.status === 'active');
      if (activeInc && this.simulatorState.scenario === 'healthy') {
        activeInc.status = 'resolved';
        activeInc.resolvedAt = now.toISOString();
        activeInc.timeline.unshift({
          timestamp: now.toISOString(),
          event: 'Website recovered: 200 OK returned and expected DOM elements verified.',
        });
      }
    }

    // Update website check metadata
    site.lastStatusCode = statusCode;
    site.lastResponseTimeMs = responseTime;
    site.lastCheckAt = now.toISOString();
    if (statusCode < 400) {
      site.lastSuccessfulCheckAt = now.toISOString();
    }
    site.nextCheckAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    site.activeAlertsCount = this.incidents.filter((i) => i.websiteId === site.id && i.status !== 'resolved').length;
    site.recentChangesCount = this.changes.filter(
      (c) => c.websiteId === site.id && Date.now() - new Date(c.detectedAt).getTime() < 24 * 3600 * 1000
    ).length;

    // Record check result
    const checkResult: CheckResult = {
      id: `chk-${Date.now()}`,
      websiteId: site.id,
      url: site.url,
      statusCode,
      responseTimeMs: responseTime,
      success: statusCode < 400,
      errorMessage: statusCode >= 400 ? `HTTP ${statusCode} Response` : undefined,
      checkedAt: now.toISOString(),
      changesFoundCount: newChanges.length,
    };
    this.checkResults.unshift(checkResult);

    // Notification if changes found
    if (newChanges.length > 0) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        workspaceId: site.workspaceId,
        title: `Change Alert: ${site.name}`,
        message: `${newChanges.length} significant change(s) detected: ${newChanges[0].title}`,
        severity: newChanges[0].severity,
        read: false,
        createdAt: now.toISOString(),
        websiteId: site.id,
      });
    }

    return {
      website: site,
      checkResult,
      newChanges,
    };
  }

  // --- Change Status Mutation ---
  public updateChangeStatus(changeId: string, status: DetectedChange['status'], notes?: string): DetectedChange | null {
    const chg = this.changes.find((c) => c.id === changeId);
    if (!chg) return null;

    chg.status = status;
    if (notes) chg.userNotes = notes;

    const currentUser = this.getCurrentUser();
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      workspaceId: this.activeWorkspaceId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: `change.${status}`,
      targetType: 'change',
      targetId: changeId,
      details: `Updated detected change "${chg.title}" status to "${status}".`,
      ipAddress: '198.51.100.24',
      createdAt: new Date().toISOString(),
    });

    return chg;
  }

  // --- Incident Workflow Mutation ---
  public updateIncident(incidentId: string, updates: { status?: Incident['status']; notes?: string }): Incident | null {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc) return null;

    if (updates.status) {
      inc.status = updates.status;
      if (updates.status === 'resolved') {
        inc.resolvedAt = new Date().toISOString();
      }
      inc.timeline.unshift({
        timestamp: new Date().toISOString(),
        event: `Incident marked as ${updates.status} by ${this.getCurrentUser().name}.`,
      });
    }
    if (updates.notes !== undefined) {
      inc.notes = updates.notes;
    }

    const currentUser = this.getCurrentUser();
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      workspaceId: this.activeWorkspaceId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: `incident.update`,
      targetType: 'incident',
      targetId: incidentId,
      details: `Updated incident "${inc.title}" (Status: ${inc.status}).`,
      ipAddress: '198.51.100.24',
      createdAt: new Date().toISOString(),
    });

    return inc;
  }

  // --- Simulator Scenario Switcher ---
  public setSimulatorScenario(scenario: 'healthy' | 'cta_missing' | 'title_changed' | 'server_error' | 'latency_spike') {
    this.simulatorState.scenario = scenario;
    this.simulatorState.lastTriggeredAt = new Date().toISOString();
    return this.simulatorState;
  }
}

export const store = new DataStore();
