import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Check,
  Ban,
  Clock
} from 'lucide-react';
import { DetectedChange, SeverityLevel, ChangeStatus } from '../server/types.ts';

interface DiffViewerModalProps {
  change: DetectedChange | null;
  onClose: () => void;
  onUpdateStatus: (changeId: string, status: ChangeStatus, notes?: string) => void;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  change,
  onClose,
  onUpdateStatus,
}) => {
  if (!change) return null;

  const [notes, setNotes] = useState(change.userNotes || '');
  const [activeView, setActiveView] = useState<'split' | 'unified'>('split');
  const [saving, setSaving] = useState(false);

  const severityBadge = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    informational: 'bg-slate-100 text-slate-700 border-slate-200',
  }[change.severity];

  const handleAction = async (status: ChangeStatus) => {
    setSaving(true);
    await onUpdateStatus(change.id, status, notes);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityBadge}`}>
                {change.severity} Severity
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Confidence: {change.confidence}%
              </span>
              <span className="text-[11px] font-medium text-slate-400 capitalize">
                Category: {change.changeCategory.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{change.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 truncate">
              <span className="font-semibold text-slate-700">{change.websiteName}</span>
              <span>•</span>
              <a
                href={change.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 inline-flex items-center gap-1 truncate text-slate-500 hover:underline"
              >
                {change.pageUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(change.detectedAt).toLocaleString()}
              </span>
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
          {/* Summary Banner */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900">
            <span className="font-semibold block mb-0.5 text-indigo-950">Detected Differential Summary</span>
            {change.diffSummary}
          </div>

          {/* Visual Diff Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                Visual Diff Inspector
              </h3>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setActiveView('split')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeView === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveView('unified')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeView === 'unified' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Unified
                </button>
              </div>
            </div>

            {activeView === 'split' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {/* Previous Value Baseline */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-200/60 text-rose-800 font-sans font-semibold text-[11px]">
                    <span>Previous State (Baseline)</span>
                    <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded text-rose-700">Removed</span>
                  </div>
                  <pre className="text-rose-950 whitespace-pre-wrap break-all leading-relaxed select-text font-mono text-xs">
                    {change.previousValue}
                  </pre>
                </div>

                {/* New Value Observed */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/60 text-emerald-800 font-sans font-semibold text-[11px]">
                    <span>Observed New State</span>
                    <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700">Current</span>
                  </div>
                  <pre className="text-emerald-950 whitespace-pre-wrap break-all leading-relaxed select-text font-mono text-xs">
                    {change.newValue}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-100 overflow-x-auto space-y-1">
                <div className="text-slate-500 font-sans text-[11px] pb-2 border-b border-slate-800 mb-2">
                  Unified Diff View
                </div>
                <div className="text-rose-400 bg-rose-950/40 px-2 py-1 rounded">
                  <span className="text-rose-500 mr-2 font-bold">-</span>
                  {change.previousValue}
                </div>
                <div className="text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded">
                  <span className="text-emerald-500 mr-2 font-bold">+</span>
                  {change.newValue}
                </div>
              </div>
            )}
          </div>

          {/* AI / Impact Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Potential Business & Conversion Impact
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">{change.potentialImpact}</p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Recommended Remediation Action
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed">{change.suggestedAction}</p>
            </div>
          </div>

          {/* User Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Team Investigation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record investigation notes, deploy ticket ID, or root cause explanation..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Status: <span className="font-semibold text-slate-800 capitalize">{change.status}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => handleAction('dismissed')}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              <Ban className="w-3.5 h-3.5" />
              Dismiss
            </button>
            <button
              onClick={() => handleAction('acknowledged')}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Acknowledge
            </button>
            <button
              onClick={() => handleAction('resolved')}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept as New Baseline & Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
