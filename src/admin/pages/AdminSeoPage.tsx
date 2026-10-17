import React, { useState } from 'react';
import { Globe, Search, Code, Check, FileText, ArrowRight } from 'lucide-react';
import { SchemaManagerTab } from '../components/SchemaManagerTab.tsx';

export const AdminSeoPage: React.FC<{ token: string; onNavigate?: (path: string) => void }> = ({ token, onNavigate }) => {
  const [metaTitle, setMetaTitle] = useState('Laam Luxury Fashion — Designer Pret & Festive Formals');
  const [metaDescription, setMetaDescription] = useState('Discover authentic South Asian designer fashion, luxury pret, festive formals, and bridal couture with global express delivery.');
  const [canonicalUrl, setCanonicalUrl] = useState('https://laam.com');
  const [redirects, setRedirects] = useState([
    { from: '/old-collection', to: '/collections', type: '301 Permanent' }
  ]);
  const [saved, setSaved] = useState(false);

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-serif text-[#141414]">Search Engine Optimization (SEO) & Structured Data</h1>
        <p className="text-xs text-[#737373]">Manage global meta tags, canonical URLs, URL redirects, structured JSON-LD schemas, and sitemaps.</p>
      </div>

      <form onSubmit={handleSaveSeo} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4 text-xs shadow-sm">
        <h3 className="font-bold text-sm text-[#141414]">Global Home SEO Settings</h3>
        <div>
          <label className="block text-[#737373] mb-1 font-semibold">Global Meta Title</label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-medium"
          />
        </div>

        <div>
          <label className="block text-[#737373] mb-1 font-semibold">Global Meta Description (Max 160 chars)</label>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#737373] mb-1 font-semibold">Canonical URL</label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="block text-[#737373] mb-1 font-semibold">Robots Directive</label>
            <input
              type="text"
              readOnly
              value="index, follow, max-image-preview:large"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl font-mono text-[#737373]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#141414]">URL Redirects Management</h4>
            <span className="text-[11px] text-[#737373]">Automatic 301 SEO redirects</span>
          </div>
          <div className="space-y-2">
            {redirects.map((r, idx) => (
              <div key={idx} className="p-3 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                <span className="font-mono text-[11px]">{r.from} → {r.to}</span>
                <span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] rounded text-[10px] font-semibold">{r.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
          <h4 className="font-bold text-xs text-[#141414]">Sitemap & Robots.txt Maintenance</h4>
          <div className="flex gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl font-semibold text-[#141414] hover:bg-neutral-100 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#087443]" />
              <span>View sitemap.xml</span>
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl font-semibold text-[#141414] hover:bg-neutral-100 flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>View robots.txt</span>
            </a>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-1.5 text-[#087443] font-semibold">
              <Check className="w-4 h-4" />
              <span>SEO settings successfully updated!</span>
            </div>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b]"
          >
            Save SEO Settings
          </button>
        </div>
      </form>

      {/* Global Schema Markup Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div>
            <h3 className="font-bold text-sm text-[#141414]">Global Store Schema Markup</h3>
            <p className="text-xs text-[#737373]">Configure JSON-LD schemas applied site-wide</p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/admin/seo/schemas')}
              className="px-3.5 py-1.5 bg-[#FAF9F6] border border-[#E5E5E5] text-[#141414] hover:bg-[#141414] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Open Central Schema Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <SchemaManagerTab token={token} referenceType="global" referenceId="global" />
      </div>
    </div>
  );
};
