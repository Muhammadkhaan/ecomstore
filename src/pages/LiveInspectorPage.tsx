import React, { useState } from 'react';
import {
  Radio,
  Play,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Clock,
  Code,
  Tag,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export const LiveInspectorPage: React.FC = () => {
  const [testUrl, setTestUrl] = useState('https://news.ycombinator.com');
  const [ctaSelector, setCtaSelector] = useState('.hnname');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePresets = [
    { label: 'Hacker News (.hnname)', url: 'https://news.ycombinator.com', cta: '.hnname' },
    { label: 'Example.com (h1 header)', url: 'https://example.com', cta: 'h1' },
    { label: 'SSRF Attack Test (127.0.0.1)', url: 'http://127.0.0.1:8080/admin', cta: '#admin' },
    { label: 'SSRF Metadata Test (169.254.169.254)', url: 'http://169.254.169.254/latest/meta-data', cta: '' },
  ];

  const handleRunInspector = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/live-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: testUrl.trim(),
          expectedCtaSelector: ctaSelector.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Check failed');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to inspection endpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Live URL Inspector & SSRF Sandbox
            </h1>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Engine Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Test any public URL on-demand, audit DOM metadata, verify critical CTA elements, and test SSRF guard rails
          </p>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Try Presets:</span>
        {samplePresets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setTestUrl(p.url);
              setCtaSelector(p.cta);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors whitespace-nowrap font-mono shadow-2xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Sandbox Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleRunInspector} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target URL for Live Inspection
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Element / CTA Selector (Optional)
              </label>
              <input
                type="text"
                value={ctaSelector}
                onChange={(e) => setCtaSelector(e.target.value)}
                placeholder="#add-to-cart or .btn-primary"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Automated SSRF validation & RFC 1918 range blocking enforced on every request
            </span>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-60"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Inspecting Remote Page...' : 'Inspect URL Live'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Request Blocked or Failed
            </h3>
            <p className="text-xs text-rose-800 mt-0.5 font-mono">{error}</p>
            <p className="text-[11px] text-rose-700 mt-1">
              If this was an SSRF test (e.g. 127.0.0.1 or cloud metadata), SiteSentinel successfully defended the host infrastructure.
            </p>
          </div>
        </div>
      )}

      {/* Success Inspection Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">HTTP Status</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">
                {result.statusCode} {result.statusText}
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latency</span>
              <span className="text-lg font-bold text-indigo-600 font-mono">{result.responseTimeMs}ms</span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payload Size</span>
              <span className="text-lg font-bold text-slate-800 font-mono">
                {(result.contentLengthBytes / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Element</span>
              {result.ctaFound === undefined ? (
                <span className="text-xs text-slate-400">Not Checked</span>
              ) : result.ctaFound ? (
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4" /> Detected
                </span>
              ) : (
                <span className="text-sm font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <XCircle className="w-4 h-4" /> Missing
                </span>
              )}
            </div>
          </div>

          {/* Extracted DOM Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Extracted Page Elements & Baseline Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Page Title (&lt;title&gt;)
                </span>
                <span className="font-semibold text-slate-900 font-mono">{result.title}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Primary Heading (&lt;h1&gt;)
                </span>
                <span className="font-semibold text-slate-900 font-mono">{result.h1}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Meta Description
                </span>
                <span className="text-slate-700 leading-relaxed">{result.metaDescription}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                    Canonical Tag
                  </span>
                  <span className="text-slate-800 font-mono text-[11px]">{result.canonicalUrl}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                    Robots Directives
                  </span>
                  <span className="text-slate-800 font-mono text-[11px]">{result.robotsDirective}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
