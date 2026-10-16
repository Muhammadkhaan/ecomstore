import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Website, WebsiteCategory, UserRole } from '../server/types.ts';

interface WebsitesPageProps {
  websites: Website[];
  onOpenAddWebsite: () => void;
  onRunCheck: (websiteId: string) => Promise<void>;
  onTogglePause: (websiteId: string) => Promise<void>;
  onDeleteWebsite: (websiteId: string) => Promise<void>;
  userRole: UserRole;
  onSelectWebsiteForDetails?: (website: Website) => void;
}

export const WebsitesPage: React.FC<WebsitesPageProps> = ({
  websites,
  onOpenAddWebsite,
  onRunCheck,
  onTogglePause,
  onDeleteWebsite,
  userRole,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [checkingSiteId, setCheckingSiteId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = websites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.url.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || site.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleManualCheck = async (id: string) => {
    setCheckingSiteId(id);
    await onRunCheck(id);
    setCheckingSiteId(null);
  };

  const handleDelete = async (id: string) => {
    await onDeleteWebsite(id);
    setDeleteConfirmId(null);
  };

  const statusBadge = (status: Website['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Healthy
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping-subtle" />
            Critical Outage
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Paused
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Monitored Websites
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your monitored web properties, inspect DOM baselines, and configure element rules
          </p>
        </div>

        <button
          onClick={onOpenAddWebsite}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Website</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or domain..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2.5 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="ecommerce">Ecommerce</option>
            <option value="saas">SaaS</option>
            <option value="lead_gen">Lead Generation</option>
            <option value="agency_client">Agency Client</option>
            <option value="media">Media</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Websites Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((site) => {
          const isChecking = checkingSiteId === site.id;
          return (
            <div
              key={site.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header with status badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {site.category.replace('_', ' ')}
                  </span>
                  {statusBadge(site.status)}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{site.name}</h3>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5 truncate hover:underline"
                >
                  {site.url}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>

                {/* Expected CTA rule indicator */}
                {site.expectedCtaSelector && (
                  <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                    <span className="text-slate-500 font-medium block">Monitored Critical CTA:</span>
                    <span className="font-mono text-indigo-700 font-semibold">{site.expectedCtaSelector}</span>
                    {site.expectedCtaText && (
                      <span className="text-slate-500 ml-1">("{site.expectedCtaText}")</span>
                    )}
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Response Time</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {site.lastResponseTimeMs ? `${site.lastResponseTimeMs}ms` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Uptime SLA</span>
                    <span className="font-semibold text-emerald-600">{site.uptimePercentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Check Frequency</span>
                    <span className="font-semibold text-slate-700">{site.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">TLS Cert Expiry</span>
                    <span className="font-semibold text-slate-700">
                      {site.tlsExpiryDays ? `${site.tlsExpiryDays} days` : 'Valid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Last checked: {site.lastCheckAt ? new Date(site.lastCheckAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleManualCheck(site.id)}
                    disabled={isChecking || site.paused}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    title="Run Check Now"
                  >
                    <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>

                  {userRole !== 'viewer' && (
                    <button
                      onClick={() => onTogglePause(site.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title={site.paused ? 'Resume Monitoring' : 'Pause Monitoring'}
                    >
                      {site.paused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
                    </button>
                  )}

                  {(userRole === 'owner' || userRole === 'administrator') && (
                    <button
                      onClick={() => setDeleteConfirmId(site.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Website"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to stop monitoring and remove this website from your workspace? Historical check logs will be purged.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Delete Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
