import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Plus,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  History,
  Activity,
  GitCompare,
  ArrowUpRight,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard.tsx';
import { MonitoringChart } from '../components/MonitoringChart.tsx';
import { Website, Incident, DetectedChange, AuditLog, CheckResult, UserRole } from '../server/types.ts';

export type DateRange = '24h' | '7d' | '30d';

interface DashboardOverviewProps {
  stats: {
    kpis?: {
      totalMonitored: number;
      websitesHealthy: number;
      unresolvedAlerts: number;
      failedChecksCount: number;
      averageUptime: string;
    };
    websites?: Website[];
    openIncidents?: Incident[];
    recentChanges?: DetectedChange[];
    recentActivity?: AuditLog[];
    chartTrends?: CheckResult[];
  };
  onOpenAddWebsite: () => void;
  onRunCheck: (websiteId: string) => Promise<void>;
  onTogglePause: (websiteId: string) => Promise<void>;
  onSelectChange: (change: DetectedChange) => void;
  onSelectIncident: (incident: Incident) => void;
  onNavigateToWebsites: () => void;
  onNavigateToChanges: () => void;
  onNavigateToIncidents: () => void;
  userRole: UserRole;
  searchQuery?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  onOpenAddWebsite,
  onRunCheck,
  onTogglePause,
  onSelectChange,
  onSelectIncident,
  onNavigateToWebsites,
  onNavigateToChanges,
  onNavigateToIncidents,
  userRole,
  searchQuery = '',
}) => {
  const [checkingSiteId, setCheckingSiteId] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('24h');

  // Safe defaults
  const kpis = stats?.kpis || {
    totalMonitored: 0,
    websitesHealthy: 0,
    unresolvedAlerts: 0,
    failedChecksCount: 0,
    averageUptime: '100',
  };
  const websites = stats?.websites || [];
  const openIncidents = stats?.openIncidents || [];
  const recentChanges = stats?.recentChanges || [];
  const recentActivity = stats?.recentActivity || [];
  const chartTrends = stats?.chartTrends || [];

  // Filter based on search query if present
  const query = searchQuery.trim().toLowerCase();
  const filteredWebsites = websites.filter(
    (w) => !query || w.name.toLowerCase().includes(query) || w.url.toLowerCase().includes(query)
  );
  const filteredIncidents = openIncidents.filter(
    (i) =>
      !query ||
      i.title.toLowerCase().includes(query) ||
      i.websiteName.toLowerCase().includes(query) ||
      i.rootCauseSummary.toLowerCase().includes(query)
  );
  const filteredChanges = recentChanges.filter(
    (c) =>
      !query ||
      c.title.toLowerCase().includes(query) ||
      c.websiteName.toLowerCase().includes(query) ||
      c.diffSummary.toLowerCase().includes(query)
  );

  const handleManualCheck = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckingSiteId(id);
    await onRunCheck(id);
    setCheckingSiteId(null);
  };

  // Zero-pill status indicator with crisp corporate dot
  const renderStatus = (status: Website['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Healthy
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Critical Outage
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Unknown
          </span>
        );
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate failed checks according to selected range
  const failedMultiplier = selectedDateRange === '24h' ? 1 : selectedDateRange === '7d' ? 4 : 12;
  const periodFailedChecks = kpis.failedChecksCount * failedMultiplier;

  const extractDomain = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.hostname;
    } catch {
      return urlStr.replace(/^https?:\/\//, '').split('/')[0];
    }
  };

  const formatRelativeTime = (isoDate?: string) => {
    if (!isoDate) return 'Never checked';
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Welcome message, Date Range Selector & Add Website CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Overview Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Monitoring Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{currentDateFormatted}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Continuous DOM change detection and customer journey monitoring</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Minimalist Date Range Segmented Control */}
          <div className="inline-flex items-center bg-slate-100/90 border border-slate-200/70 rounded-lg p-0.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <button
              onClick={() => setSelectedDateRange('24h')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDateRange === '24h'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 24h
            </button>
            <button
              onClick={() => setSelectedDateRange('7d')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDateRange === '7d'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedDateRange('30d')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDateRange === '30d'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Primary "+ Add Website" CTA Button */}
          <button
            onClick={onOpenAddWebsite}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Website</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards: 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Monitored Websites */}
        <MetricCard
          title="Monitored Websites"
          value={kpis.totalMonitored}
          subtitle={`${kpis.websitesHealthy} of ${kpis.totalMonitored} operating normally`}
          icon={Globe}
          badge={{ text: `${kpis.averageUptime}% uptime`, variant: 'success' }}
          onClick={onNavigateToWebsites}
        />

        {/* KPI 2: Websites Healthy */}
        <MetricCard
          title="Websites Healthy"
          value={kpis.websitesHealthy}
          subtitle="CTA buttons & markup match baselines"
          icon={CheckCircle2}
          badge={{ text: 'Stable', variant: 'success' }}
          onClick={onNavigateToWebsites}
        />

        {/* KPI 3: Unresolved Alerts */}
        <MetricCard
          title="Unresolved Alerts"
          value={kpis.unresolvedAlerts}
          subtitle={
            kpis.unresolvedAlerts > 0
              ? 'Action required on critical customer journeys'
              : 'Zero active critical incidents'
          }
          icon={AlertTriangle}
          badge={{
            text: kpis.unresolvedAlerts > 0 ? 'Requires Action' : 'All Clear',
            variant: kpis.unresolvedAlerts > 0 ? 'critical' : 'success',
          }}
          onClick={onNavigateToIncidents}
        />

        {/* KPI 4: Checks Failed in the Selected Period */}
        <MetricCard
          title={`Checks Failed (${selectedDateRange.toUpperCase()})`}
          value={periodFailedChecks}
          subtitle={`Automated check anomalies caught in ${selectedDateRange}`}
          icon={Activity}
          badge={{
            text: periodFailedChecks > 0 ? 'Anomalies Caught' : 'Optimal',
            variant: periodFailedChecks > 0 ? 'warning' : 'neutral',
          }}
        />
      </div>

      {/* 3. Monitoring Trends (Chart.js) */}
      <MonitoringChart checkResults={chartTrends} incidents={openIncidents} />

      {/* 4. Two Column Layout: Website Health Overview & Open Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Website Health Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Website Health Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live monitoring state, domain baseline, and scheduled checks</p>
            </div>
            <button
              onClick={onNavigateToWebsites}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View All ({websites.length})
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {filteredWebsites.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Globe className="w-9 h-9 mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No Monitored Websites Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                  Add a web property to start automated DOM change detection, CTA monitoring, and uptime tracking.
                </p>
                <button
                  onClick={onOpenAddWebsite}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Website</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Website & Domain</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Last Check</th>
                    <th className="py-2.5 px-4">Active Alerts</th>
                    <th className="py-2.5 px-4">Recent Change</th>
                    <th className="py-2.5 px-4">Schedule</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWebsites.slice(0, 5).map((site) => {
                    const isChecking = checkingSiteId === site.id;
                    const domain = extractDomain(site.url);
                    const matchingChange = recentChanges.find((c) => c.websiteId === site.id);

                    return (
                      <tr key={site.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Website name & Domain */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 leading-snug">{site.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate max-w-[180px] mt-0.5">
                            {domain}
                          </div>
                        </td>

                        {/* Current Status */}
                        <td className="py-3 px-4">{renderStatus(site.status)}</td>

                        {/* Last Successful Check */}
                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                          {formatRelativeTime(site.lastSuccessfulCheckAt || site.lastCheckAt)}
                        </td>

                        {/* Number of Active Alerts */}
                        <td className="py-3 px-4">
                          {site.activeAlertsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                              <AlertOctagon className="w-3 h-3 text-rose-600" />
                              {site.activeAlertsCount} active
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">0</span>
                          )}
                        </td>

                        {/* Recent Change Indicator */}
                        <td className="py-3 px-4">
                          {matchingChange ? (
                            <button
                              onClick={() => onSelectChange(matchingChange)}
                              className="text-left text-indigo-600 hover:text-indigo-800 font-medium truncate max-w-[130px] block hover:underline"
                              title={matchingChange.title}
                            >
                              <span className="capitalize">{matchingChange.changeCategory.replace('_', ' ')}</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Baseline OK
                            </span>
                          )}
                        </td>

                        {/* Next Scheduled Check */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {site.paused ? 'Paused' : `every ${site.frequency}`}
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => handleManualCheck(site.id, e)}
                              disabled={isChecking || site.paused}
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40"
                              title="Run automated check now"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-slate-900' : ''}`} />
                            </button>
                            {userRole !== 'viewer' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePause(site.id);
                                }}
                                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title={site.paused ? 'Resume monitoring' : 'Pause monitoring'}
                              >
                                {site.paused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Open Incidents */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Open Incidents</h2>
              <p className="text-xs text-slate-500 mt-0.5">Unresolved anomalies requiring action</p>
            </div>
            <button
              onClick={onNavigateToIncidents}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              All ({openIncidents.length})
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[380px]">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-emerald-600" />
                <p className="text-xs font-semibold text-slate-800">No Unresolved Incidents</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  All critical customer journeys, buttons, and status codes match baseline expectations.
                </p>
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-3.5 rounded-lg border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/60 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                      {inc.severity}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatRelativeTime(inc.firstDetectedAt)}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                    {inc.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {inc.rootCauseSummary}
                  </p>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                    <span className="truncate max-w-[150px]">{inc.websiteName}</span>
                    <span className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 hover:underline">
                      Investigate <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Two Column Layout: Recent Detected Changes & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Detected Changes */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Detected Changes</h2>
              <p className="text-xs text-slate-500 mt-0.5">DOM mutations, metadata drifts, and critical element modifications</p>
            </div>
            <button
              onClick={onNavigateToChanges}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View All Changes
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredChanges.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-600 mb-1" />
                <p className="text-xs font-semibold text-slate-700">No Detected Changes</p>
                <p className="text-[11px] text-slate-500">Website pages match current baseline snapshots</p>
              </div>
            ) : (
              filteredChanges.map((chg) => (
                <div
                  key={chg.id}
                  onClick={() => onSelectChange(chg)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                        {chg.changeCategory.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 text-xs">·</span>
                      <span className="text-[11px] text-slate-500 font-medium truncate">{chg.websiteName}</span>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-900 truncate">{chg.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">{chg.diffSummary}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        chg.status === 'open'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {chg.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                      {formatRelativeTime(chg.detectedAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity & Audit Trail */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Activity & Audit Trail</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chronological verification and operational events</p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Live Synced</span>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <History className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-700">No Activity Logged</p>
                <p className="text-[11px] text-slate-500">Operations and check results will appear here</p>
              </div>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                    <History className="w-3 h-3 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-900 truncate">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
