import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Incident, IncidentStatus, SeverityLevel } from '../server/types.ts';

interface IncidentsPageProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, notes?: string) => Promise<void>;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onSelectIncident,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.websiteName.toLowerCase().includes(search.toLowerCase()) ||
      inc.rootCauseSummary.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
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

  const statusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            Active
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Incidents & Outage Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track business-critical interruptions, root causes, occurrence frequency, and recovery timelines
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
            placeholder="Search incident title, website, or root cause..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2.5 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Incident Statuses</option>
            <option value="active">Active Outages</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 bg-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Incidents Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700">No Incidents Found</h3>
            <p className="text-xs text-slate-500 mt-1">Zero outages or critical alerts matching your filter criteria.</p>
          </div>
        ) : (
          filtered.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {severityBadge(inc.severity)}
                  {statusBadge(inc.status)}
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {inc.websiteName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{inc.id}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{inc.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{inc.rootCauseSummary}</p>

                <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-500">
                  <span>
                    First detected:{' '}
                    <strong>{new Date(inc.firstDetectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </span>
                  <span>
                    Consecutive occurrences: <strong>{inc.occurrenceCount}</strong>
                  </span>
                  <span>
                    Affected endpoints: <strong>{inc.affectedPages.length}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(inc);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Investigate Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
