import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Send,
  ShieldAlert
} from 'lucide-react';
import { Incident, IncidentStatus } from '../server/types.ts';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, notes?: string) => Promise<void>;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdateStatus,
}) => {
  if (!incident) return null;

  const [notes, setNotes] = useState(incident.notes || '');
  const [saving, setSaving] = useState(false);

  const severityBadge = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    informational: 'bg-slate-100 text-slate-700 border-slate-200',
  }[incident.severity];

  const statusBadge = {
    active: 'bg-rose-100 text-rose-800',
    acknowledged: 'bg-amber-100 text-amber-800',
    resolved: 'bg-emerald-100 text-emerald-800',
  }[incident.status];

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setSaving(true);
    await onUpdateStatus(incident.id, newStatus, notes);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityBadge}`}>
                {incident.severity}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge}`}>
                {incident.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">#{incident.id}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {incident.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{incident.websiteName}</span>
              <span>•</span>
              <a
                href={incident.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 inline-flex items-center gap-1 hover:underline text-slate-500"
              >
                {incident.websiteUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>Detected {new Date(incident.firstDetectedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Root Cause Card */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Root Cause & Differential Diagnostic
            </h3>
            <p className="text-xs text-rose-950 leading-relaxed font-medium">
              {incident.rootCauseSummary}
            </p>
          </div>

          {/* Affected URLs */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Affected Page Endpoints ({incident.affectedPages.length})
            </h3>
            <div className="space-y-1.5">
              {incident.affectedPages.map((pg, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between"
                >
                  <span className="truncate">{pg}</span>
                  <a
                    href={pg}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex-shrink-0 ml-2"
                  >
                    Open Page
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Event Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              Incident Timeline & Retries
            </h3>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {incident.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-600 ml-2">{event.event}</span>
                    {event.details && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{event.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investigation Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Resolution & Post-Mortem Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about hotfixes, revert rollouts, or communication..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Consecutive Occurrences: <span className="font-bold text-slate-800">{incident.occurrenceCount}</span>
          </div>

          <div className="flex items-center gap-2">
            {incident.status === 'active' && (
              <button
                onClick={() => handleStatusChange('acknowledged')}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                Acknowledge Incident
              </button>
            )}
            {incident.status !== 'resolved' && (
              <button
                onClick={() => handleStatusChange('resolved')}
                disabled={saving}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve Incident
              </button>
            )}
            {incident.status === 'resolved' && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                Resolved on {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleTimeString() : 'Recently'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
