import React, { useState, useEffect } from 'react';
import { Code, Plus, Trash2, CheckCircle2, AlertTriangle, Sparkles, Eye, Edit3, X, Check } from 'lucide-react';

interface SchemaItem {
  id: string;
  referenceType: string;
  referenceId: string;
  name: string;
  schemaType: string;
  jsonContent: string;
  isEnabled: boolean;
}

interface SchemaManagerTabProps {
  token: string;
  referenceType: 'product' | 'collection' | 'page' | 'global';
  referenceId: string;
}

const PRESETS: Record<string, any> = {
  Product: {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Luxury Silk Item",
    "image": ["https://images.unsplash.com/photo-1566737236500-c8ac43014a67"],
    "description": "Exquisite handcrafted South Asian luxury wear.",
    "sku": "LAAM-SKU-1001",
    "brand": {
      "@type": "Brand",
      "name": "LAAM Couture"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://laam.pk/products/item",
      "priceCurrency": "USD",
      "price": "195.00",
      "availability": "https://schema.org/InStock"
    }
  },
  BreadcrumbList: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://laam.pk" },
      { "@type": "ListItem", "position": 2, "name": "Catalog", "item": "https://laam.pk/collections" }
    ]
  },
  Organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LAAM Luxury Fashion",
    "url": "https://laam.pk",
    "logo": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67",
    "sameAs": [
      "https://www.facebook.com/laamofficial",
      "https://www.instagram.com/laamofficial"
    ]
  },
  WebSite: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LAAM",
    "url": "https://laam.pk",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://laam.pk/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  WebPage: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Title",
    "description": "Page description"
  },
  Article: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Fashion Trends 2026",
    "image": ["https://images.unsplash.com/photo-1566737236500-c8ac43014a67"],
    "author": { "@type": "Person", "name": "LAAM Editorial" },
    "publisher": { "@type": "Organization", "name": "LAAM" },
    "datePublished": "2026-01-01"
  },
  FAQPage: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the return policy?",
        "acceptedAnswer": { "@type": "Answer", "text": "We offer 7-day easy returns on unworn items." }
      }
    ]
  },
  LocalBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "LAAM Flagship Store",
    "image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67",
    "url": "https://laam.pk",
    "telephone": "+9242111123456",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "MM Alam Road",
      "addressLocality": "Lahore",
      "addressCountry": "PK"
    }
  },
  Custom: {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": "Custom Schema"
  }
};

export const SchemaManagerTab: React.FC<SchemaManagerTabProps> = ({ token, referenceType, referenceId }) => {
  const [schemas, setSchemas] = useState<SchemaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [schemaType, setSchemaType] = useState('Product');
  const [jsonContent, setJsonContent] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSchemas = async () => {
    try {
      const res = await fetch(`/api/admin/schemas?referenceType=${referenceType}&referenceId=${referenceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.schemas) {
        setSchemas(data.schemas);
      }
    } catch (err) {
      console.error('Failed to load schemas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, [referenceType, referenceId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName(`${schemaType} Schema`);
    setSchemaType('Product');
    setJsonContent(JSON.stringify(PRESETS['Product'], null, 2));
    setIsEnabled(true);
    setJsonError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: SchemaItem) => {
    setEditingId(sch.id);
    setName(sch.name);
    setSchemaType(sch.schemaType);
    setJsonContent(sch.jsonContent);
    setIsEnabled(sch.isEnabled);
    setJsonError(null);
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType: string) => {
    setSchemaType(newType);
    setName(`${newType} Schema`);
    if (PRESETS[newType]) {
      setJsonContent(JSON.stringify(PRESETS[newType], null, 2));
    }
    setJsonError(null);
  };

  const handleJsonChange = (val: string) => {
    setJsonContent(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      JSON.parse(jsonContent);
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err.message}`);
      return;
    }

    try {
      const res = await fetch('/api/admin/schemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingId,
          referenceType,
          referenceId,
          name,
          schemaType,
          jsonContent,
          isEnabled
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Schema saved successfully!');
        setIsModalOpen(false);
        fetchSchemas();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(data.error || 'Failed to save schema');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schema markup entry?')) return;
    try {
      const res = await fetch(`/api/admin/schemas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSchemas(schemas.filter(s => s.id !== id));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            JSON-LD Schema Markup Manager
          </h3>
          <p className="text-sm text-neutral-500">
            Configure structured data markup for search engines and AI crawlers for this {referenceType}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Schema Markup
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-neutral-500 text-sm">Loading schemas...</div>
      ) : schemas.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-300 rounded-xl p-12 text-center">
          <Code className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h4 className="font-medium text-neutral-900">No schema markup configured</h4>
          <p className="text-sm text-neutral-500 mt-1 mb-4">Add JSON-LD schemas to enhance search rich results.</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
          >
            <Plus className="w-4 h-4" /> Add First Schema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schemas.map((sch) => (
            <div key={sch.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                    {sch.schemaType}
                  </span>
                  <h4 className="font-semibold text-neutral-900">{sch.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sch.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                    {sch.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(sch)}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                    title="Edit Schema"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sch.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Schema"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-48">
                {sch.jsonContent}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {editingId ? 'Edit Schema Markup' : 'Add Schema Markup'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">Internal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Product Rich Snippet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">Schema Type / Preset</label>
                  <select
                    value={schemaType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Product">Product</option>
                    <option value="BreadcrumbList">BreadcrumbList</option>
                    <option value="Organization">Organization</option>
                    <option value="WebSite">WebSite</option>
                    <option value="WebPage">WebPage</option>
                    <option value="Article">Article</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="LocalBusiness">LocalBusiness</option>
                    <option value="Custom">Custom JSON-LD</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">JSON-LD Code</label>
                  <span className="text-xs text-neutral-500">Must be valid JSON syntax</span>
                </div>
                <textarea
                  rows={10}
                  value={jsonContent}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className={`w-full p-3 font-mono text-xs border rounded-lg bg-neutral-900 text-neutral-100 outline-none focus:ring-2 ${jsonError ? 'border-rose-500 focus:ring-rose-500' : 'border-neutral-700 focus:ring-indigo-500'}`}
                />
                {jsonError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {jsonError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="schemaEnabled"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500"
                />
                <label htmlFor="schemaEnabled" className="text-sm font-medium text-neutral-800">
                  Enable this schema markup on storefront
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(jsonError)}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  Save Schema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
