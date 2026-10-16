import React, { useState } from 'react';
import {
  GitCompare,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { DetectedChange, SeverityLevel, ChangeStatus } from '../server/types.ts';

interface ChangesPageProps {
  changes: DetectedChange[];
  onSelectChange: (change: DetectedChange) => void;
  onUpdateStatus: (changeId: string, status: ChangeStatus, notes?: string) => Promise<void>;
}

export const ChangesPage: React.FC<ChangesPageProps> = ({
  changes,
  onSelectChange,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = changes.filter((chg) => {
    const matchesSearch =
      chg.title.toLowerCase().includes(search.toLowerCase()) ||
      chg.websiteName.toLowerCase().includes(search.toLowerCase()) ||
      chg.diffSummary.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || chg.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || chg.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || chg.changeCategory === categoryFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
  });

  const severityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Low
          </span>
        );
      case 'informational':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Info
          </span>
        );
    }
  };

  const statusBadge = (status: ChangeStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            Open
          </span>
        );
      case 'acknowledged':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Acknowledged
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Dismissed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Detected Changes & Visual Diffs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect differential modifications to critical DOM elements, CTA buttons, and SEO metadata
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search change title or differential..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2.5 flex-wrap">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Change Types</option>
            <option value="cta_missing">CTA Missing</option>
            <option value="status_code">Status Code Drift</option>
            <option value="title">Title Tag Changed</option>
            <option value="latency_spike">Latency Spike</option>
            <option value="canonical">Canonical URL</option>
          </select>
        </div>
      </div>

      {/* Changes List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <GitCompare className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-700">No Detected Changes Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try broadening your search or filter settings.</p>
          </div>
        ) : (
          filtered.map((chg) => (
            <div
              key={chg.id}
              onClick={() => onSelectChange(chg)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {severityBadge(chg.severity)}
                  {statusBadge(chg.status)}
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {chg.websiteName}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize">
                    {chg.changeCategory.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{chg.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {chg.diffSummary}
                </p>

                {/* Micro preview snippet */}
                <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span className="truncate max-w-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    - {chg.previousValue.slice(0, 45)}...
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    + {chg.newValue.slice(0, 45)}...
                  </span>
                </div>
              </div>

              {/* Right side metadata & CTA */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(chg.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectChange(chg);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Diff</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
