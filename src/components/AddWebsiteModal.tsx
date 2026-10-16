import React, { useState } from 'react';
import {
  X,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Tag,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  MousePointerClick
} from 'lucide-react';
import { WebsiteCategory, MonitoringFrequency } from '../server/types.ts';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWebsite: (data: {
    name: string;
    url: string;
    category: WebsiteCategory;
    frequency: MonitoringFrequency;
    timezone: string;
    expectedCtaSelector?: string;
    expectedCtaText?: string;
  }) => Promise<{ error?: string }>;
}

export const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({
  isOpen,
  onClose,
  onAddWebsite,
}) => {
  if (!isOpen) return null;

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WebsiteCategory>('ecommerce');
  const [frequency, setFrequency] = useState<MonitoringFrequency>('5m');
  const [timezone, setTimezone] = useState('America/New_York (UTC-5)');
  const [expectedCtaSelector, setExpectedCtaSelector] = useState('');
  const [expectedCtaText, setExpectedCtaText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live client-side SSRF pre-check feedback
  const getSsrfNotice = (testUrl: string) => {
    if (!testUrl) return null;
    const lower = testUrl.toLowerCase().trim();
    if (
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('169.254') ||
      lower.includes('192.168.') ||
      lower.includes('10.') ||
      lower.includes('.internal') ||
      lower.includes('.local')
    ) {
      return {
        safe: false,
        msg: 'Private/Internal host detected. Will be blocked by SSRF filter.',
      };
    }
    return {
      safe: true,
      msg: 'External target URL passes preliminary SSRF checks.',
    };
  };

  const ssrfFeedback = getSsrfNotice(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please provide a valid website URL.');
      return;
    }

    setLoading(true);
    const res = await onAddWebsite({
      name: name.trim() || '',
      url: url.trim(),
      category,
      frequency,
      timezone,
      expectedCtaSelector: expectedCtaSelector.trim() || undefined,
      expectedCtaText: expectedCtaText.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add Monitored Website</h2>
              <p className="text-xs text-slate-500">Configure continuous change detection and impact monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Failed to add website</span>
                {error}
              </div>
            </div>
          )}

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Website URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or store.acme.com"
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
              />
            </div>
            {/* SSRF Security notice badge */}
            {ssrfFeedback && (
              <div
                className={`mt-1.5 text-[11px] flex items-center gap-1.5 font-medium ${
                  ssrfFeedback.safe ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {ssrfFeedback.safe ? (
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>{ssrfFeedback.msg}</span>
              </div>
            )}
          </div>

          {/* Website Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Friendly Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Primary Storefront"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Category & Frequency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WebsiteCategory)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
              >
                <option value="ecommerce">Ecommerce Storefront</option>
                <option value="saas">SaaS Application</option>
                <option value="lead_gen">Lead Generation & Funnels</option>
                <option value="agency_client">Agency Client Site</option>
                <option value="media">Media & Content Publication</option>
                <option value="other">Other Web Surface</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monitoring Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as MonitoringFrequency)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
              >
                <option value="1m">Every 1 Minute (High Precision)</option>
                <option value="5m">Every 5 Minutes (Recommended)</option>
                <option value="15m">Every 15 Minutes</option>
                <option value="30m">Every 30 Minutes</option>
                <option value="1h">Every 1 Hour</option>
              </select>
            </div>
          </div>

          {/* Conversion Element / Critical CTA Monitoring Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
              Critical Funnel Element & CTA Monitoring (Optional)
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              SiteSentinel continuously verifies this element exists in rendered markup. If missing, it immediately flags a high-priority conversion blocker.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Expected CSS Selector
                </label>
                <input
                  type="text"
                  value={expectedCtaSelector}
                  onChange={(e) => setExpectedCtaSelector(e.target.value)}
                  placeholder="#add-to-cart or .btn-checkout"
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Expected Button Text
                </label>
                <input
                  type="text"
                  value={expectedCtaText}
                  onChange={(e) => setExpectedCtaText(e.target.value)}
                  placeholder="e.g. Add to Cart / Start Free Trial"
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors disabled:opacity-60"
            >
              {loading ? 'Validating Destination...' : 'Add Website & Start Monitoring'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
