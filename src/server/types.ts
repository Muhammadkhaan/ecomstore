export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type IncidentStatus = 'active' | 'acknowledged' | 'resolved';
export type ChangeStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';
export type UserRole = 'owner' | 'administrator' | 'member' | 'viewer';
export type WebsiteCategory = 'ecommerce' | 'saas' | 'lead_gen' | 'agency_client' | 'media' | 'other';
export type MonitoringFrequency = '1m' | '5m' | '15m' | '30m' | '1h';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  timezone: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'starter' | 'agency';
  members: {
    userId: string;
    role: UserRole;
    joinedAt: string;
  }[];
  limits: {
    maxWebsites: number;
    minFrequencyMinutes: number;
    retentionDays: number;
    browserChecksEnabled: boolean;
  };
  createdAt: string;
}

export interface Website {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  category: WebsiteCategory;
  frequency: MonitoringFrequency;
  timezone: string;
  status: 'healthy' | 'warning' | 'critical' | 'paused';
  lastStatusCode?: number;
  lastResponseTimeMs?: number;
  lastCheckAt?: string;
  lastSuccessfulCheckAt?: string;
  nextCheckAt?: string;
  activeAlertsCount: number;
  recentChangesCount: number;
  uptimePercentage: number;
  tlsExpiryDays?: number;
  paused: boolean;
  expectedCtaSelector?: string;
  expectedCtaText?: string;
  createdAt: string;
}

export interface MonitoredPage {
  id: string;
  websiteId: string;
  url: string;
  path: string;
  checkTypes: ('availability' | 'content' | 'metadata' | 'links' | 'cta')[];
  lastBaselineHash?: string;
  lastStatusCode?: number;
  lastResponseTimeMs?: number;
  lastCheckAt?: string;
  isPaused: boolean;
}

export interface ContentSnapshot {
  id: string;
  websiteId: string;
  pageId: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  title: string;
  metaDescription: string;
  h1: string;
  canonicalUrl: string;
  robotsDirective: string;
  contentHash: string;
  normalizedTextSnippet: string;
  hasExpectedCta: boolean;
  capturedAt: string;
}

export interface DetectedChange {
  id: string;
  websiteId: string;
  websiteName: string;
  pageUrl: string;
  changeCategory: 'title' | 'meta_description' | 'h1' | 'canonical' | 'content_text' | 'broken_link' | 'cta_missing' | 'status_code' | 'latency_spike';
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  title: string;
  diffSummary: string;
  previousValue: string;
  newValue: string;
  detectedAt: string;
  status: ChangeStatus;
  incidentId?: string;
  userNotes?: string;
  potentialImpact: string;
  suggestedAction: string;
}

export interface Incident {
  id: string;
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  affectedPages: string[];
  firstDetectedAt: string;
  lastObservedAt: string;
  resolvedAt?: string;
  occurrenceCount: number;
  rootCauseSummary: string;
  timeline: {
    timestamp: string;
    event: string;
    details?: string;
  }[];
  notes?: string;
}

export interface CheckResult {
  id: string;
  websiteId: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  success: boolean;
  errorMessage?: string;
  checkedAt: string;
  changesFoundCount: number;
}

export interface NotificationItem {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  read: boolean;
  createdAt: string;
  relatedUrl?: string;
  websiteId?: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
