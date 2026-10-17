import React, { useState, useEffect, useMemo } from 'react';
import {
  Code,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Trash2,
  Edit2,
  Eye,
  ExternalLink,
  RefreshCw,
  Check,
  X,
  FileCode,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SchemaItem {
  id: string;
  referenceType: 'global' | 'product' | 'collection' | 'page';
  referenceId: string;
  name: string;
  schemaType: string;
  jsonContent: string;
  isEnabled: boolean;
  createdAt?: string;
}

interface AdminSchemaMarkupPageProps {
  token: string;
  onNavigate?: (path: string) => void;
}

const PRESETS: Record<string, any> = {
  Product: {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Luxury Silk Ensemble",
    "image": ["https://images.unsplash.com/photo-1566737236500-c8ac43014a67"],
    "description": "Exquisite handcrafted South Asian luxury raw silk wear with authentic zardozi embroidery.",
    "sku": "LAAM-SKU-1001",
    "brand": {
      "@type": "Brand",
      "name": "LAAM Luxury"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://laam.pk/products/item",
      "priceCurrency": "USD",
      "price": "195.00",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  },
  BreadcrumbList: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://laam.pk" },
      { "@type": "ListItem", "position": 2, "name": "Collections", "item": "https://laam.pk/collections" },
      { "@type": "ListItem", "position": 3, "name": "Luxury Pret", "item": "https://laam.pk/collections/pret" }
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
    "name": "About LAAM Luxury",
    "description": "The premier global platform for South Asian couture and pret fashion."
  },
  Article: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Winter Couture & Festive Edit 2026 Trends",
    "image": ["https://images.unsplash.com/photo-1566737236500-c8ac43014a67"],
    "author": { "@type": "Person", "name": "LAAM Editorial Board" },
    "publisher": { "@type": "Organization", "name": "LAAM" },
    "datePublished": "2026-01-15"
  },
  FAQPage: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the delivery time for Ready to Ship items?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ready to Ship items are dispatched within 24 hours and delivered worldwide in 3-5 business days via DHL Express."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer custom stitching measurements?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our master couturiers tailor custom measurements for bust, waist, hips, and shirt length."
        }
      }
    ]
  },
  LocalBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "LAAM Flagship Atelier",
    "image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67",
    "url": "https://laam.pk",
    "telephone": "+92-42-111-123-456",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "MM Alam Road, Gulberg III",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "postalCode": "54000",
      "addressCountry": "PK"
    }
  },
  Custom: {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": "Custom Schema Markup"
  }
};

export const AdminSchemaMarkupPage: React.FC<AdminSchemaMarkupPageProps> = ({ token, onNavigate }) => {
  const [schemas, setSchemas] = useState<SchemaItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'product' | 'collection' | 'page'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modal Create/Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [schemaType, setSchemaType] = useState('Product');
  const [referenceType, setReferenceType] = useState<'global' | 'product' | 'collection' | 'page'>('global');
  const [referenceId, setReferenceId] = useState('global');
  const [targetSearch, setTargetSearch] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Inspector / Preview URL states
  const [inspectorUrl, setInspectorUrl] = useState('/');
  const [inspectorResult, setInspectorResult] = useState<any | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [showInspectorModal, setShowInspectorModal] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resSchemas, resProds, resCols, resPages] = await Promise.all([
        fetch('/api/admin/schemas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/collections', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/storefront/pages', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resSchemas.ok) {
        const data = await resSchemas.json();
        setSchemas(data.schemas || []);
      }
      if (resProds.ok) {
        const data = await resProds.json();
        setProducts(data.products || []);
      }
      if (resCols.ok) {
        const data = await resCols.json();
        setCollections(data.collections || []);
      }
      if (resPages.ok) {
        const data = await resPages.json();
        setPages(data.pages || []);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Syntax validation
  const validateJson = (code: string) => {
    try {
      JSON.parse(code);
      setJsonError(null);
      return true;
    } catch (err: any) {
      setJsonError(err.message);
      return false;
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSchemaType('Product');
    setReferenceType('global');
    setReferenceId('global');
    setTargetSearch('');
    setJsonContent(JSON.stringify(PRESETS['Organization'], null, 2));
    setIsEnabled(true);
    setJsonError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SchemaItem) => {
    setEditingId(s.id);
    setName(s.name);
    setSchemaType(s.schemaType);
    setReferenceType(s.referenceType);
    setReferenceId(s.referenceId);
    setTargetSearch('');
    setJsonContent(s.jsonContent);
    setIsEnabled(s.isEnabled);
    setJsonError(null);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (type: string) => {
    setSchemaType(type);
    if (PRESETS[type]) {
      setJsonContent(JSON.stringify(PRESETS[type], null, 2));
      validateJson(JSON.stringify(PRESETS[type], null, 2));
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/schemas/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isEnabled: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to toggle schema status');
      setSchemas(schemas.map(s => s.id === id ? { ...s, isEnabled: !currentStatus } : s));
      showToast(`Schema ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/schemas/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate schema');
      setSchemas([data.schema, ...schemas]);
      showToast('Schema duplicated successfully!');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schema entry? This will permanently remove it from the database.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/schemas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete schema');
      setSchemas(schemas.filter(s => s.id !== id));
      showToast('Schema deleted successfully.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateJson(jsonContent)) {
      showToast('Please fix JSON syntax errors before saving', 'error');
      return;
    }

    if (!name.trim()) {
      showToast('Schema name is required', 'error');
      return;
    }

    const payload = {
      id: editingId || undefined,
      referenceType,
      referenceId: referenceType === 'global' ? 'global' : referenceId,
      name,
      schemaType,
      jsonContent,
      isEnabled
    };

    try {
      const res = await fetch('/api/admin/schemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save schema');

      showToast(editingId ? 'Schema updated successfully!' : 'Schema created successfully!');
      setIsModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Inspect URL
  const handleInspectUrl = async () => {
    setInspecting(true);
    try {
      const res = await fetch(`/api/admin/schemas/preview-url?url=${encodeURIComponent(inspectorUrl)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInspectorResult(data);
      setShowInspectorModal(true);
    } catch (err: any) {
      showToast('Failed to inspect URL', 'error');
    } finally {
      setInspecting(false);
    }
  };

  // Content resolution lookup
  const getContentTitle = (type: string, id: string) => {
    if (type === 'global') return 'Entire Website (Global)';
    if (type === 'product') {
      const p = products.find(item => item.id === id);
      return p ? `Product: ${p.title}` : `Product ID: ${id}`;
    }
    if (type === 'collection') {
      const c = collections.find(item => item.id === id || item.handle === id);
      return c ? `Collection: ${c.title}` : `Collection ID: ${id}`;
    }
    if (type === 'page') {
      const pg = pages.find(item => item.id === id || item.handle === id);
      return pg ? `Page: ${pg.title}` : `Page ID: ${id}`;
    }
    return `${type} / ${id}`;
  };

  const handleNavigateToEditor = (type: string, id: string) => {
    if (!onNavigate) return;
    if (type === 'product') {
      onNavigate(`/admin/products/edit/${id}`);
    } else if (type === 'collection') {
      onNavigate('/admin/collections');
    } else if (type === 'page') {
      onNavigate('/admin/pages');
    } else {
      onNavigate('/admin/seo');
    }
  };

  // Filtered schemas
  const filteredSchemas = useMemo(() => {
    return schemas.filter(s => {
      if (scopeFilter !== 'all' && s.referenceType !== scopeFilter) return false;
      if (statusFilter === 'enabled' && !s.isEnabled) return false;
      if (statusFilter === 'disabled' && s.isEnabled) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesType = s.schemaType.toLowerCase().includes(q);
        const matchesContent = s.jsonContent.toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesContent) return false;
      }
      return true;
    });
  }, [schemas, scopeFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-md fixed bottom-6 right-6 z-50 ${
          toastType === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toastType === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-[#141414]">Central Schema Markup Manager</h1>
            <span className="px-2 py-0.5 bg-[#E04F16]/10 text-[#E04F16] text-[10px] font-bold rounded-full uppercase tracking-wider">
              SEO JSON-LD
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Manage, validate, and preview structured data across the entire website, products, collections, and pages.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowInspectorModal(true)}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] text-[#141414] rounded-xl text-xs font-semibold hover:bg-[#FAF9F6] flex items-center gap-2 shadow-sm transition-colors"
          >
            <Eye className="w-4 h-4 text-[#087443]" />
            <span>Test URL Schemas</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schema Entry</span>
          </button>
        </div>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
          <span className="text-[11px] text-[#737373] font-semibold block">Total Configured</span>
          <span className="text-2xl font-bold text-[#141414] mt-1 block">{schemas.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
          <span className="text-[11px] text-emerald-700 font-semibold block">Active on Storefront</span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">
            {schemas.filter(s => s.isEnabled).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
          <span className="text-[11px] text-blue-700 font-semibold block">Product Level</span>
          <span className="text-2xl font-bold text-blue-800 mt-1 block">
            {schemas.filter(s => s.referenceType === 'product').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
          <span className="text-[11px] text-purple-700 font-semibold block">Global & Collections</span>
          <span className="text-2xl font-bold text-purple-800 mt-1 block">
            {schemas.filter(s => s.referenceType === 'global' || s.referenceType === 'collection').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemas by name, type, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 border border-[#E5E5E5] rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-1 rounded-xl border border-[#E5E5E5]">
            <span className="text-[11px] font-semibold text-[#737373] px-2">Scope:</span>
            {(['all', 'global', 'product', 'collection', 'page'] as const).map(sc => (
              <button
                key={sc}
                onClick={() => setScopeFilter(sc)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] capitalize transition-colors ${
                  scopeFilter === sc ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-[#E5E5E5] rounded-xl bg-white font-medium text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Schemas Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
              <tr>
                <th className="py-3 px-4">Schema Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Scope & Content Entity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">JSON-LD Summary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-[#737373]">Loading schemas from database...</td></tr>
              ) : filteredSchemas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#737373] space-y-2">
                    <Code className="w-8 h-8 mx-auto text-[#737373]/50" />
                    <p className="font-semibold">No schema markup entries found matching criteria.</p>
                    <button
                      onClick={handleOpenCreate}
                      className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold"
                    >
                      Add First Schema
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSchemas.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#141414]">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#E04F16] shrink-0" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-mono text-[11px] text-[#141414]">
                        {s.schemaType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          s.referenceType === 'global' ? 'bg-purple-100 text-purple-800' :
                          s.referenceType === 'product' ? 'bg-blue-100 text-blue-800' :
                          s.referenceType === 'collection' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.referenceType}
                        </span>
                        <div className="text-[11px] text-[#525252] flex items-center gap-1.5">
                          <span className="truncate max-w-[200px]">{getContentTitle(s.referenceType, s.referenceId)}</span>
                          {s.referenceType !== 'global' && (
                            <button
                              onClick={() => handleNavigateToEditor(s.referenceType, s.referenceId)}
                              className="text-[#E04F16] hover:underline flex items-center gap-0.5 shrink-0"
                              title="Navigate directly to associated content editor"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(s.id, s.isEnabled)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          s.isEnabled ? 'bg-[#D3F8DF] text-[#087443] hover:bg-emerald-200' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                      >
                        {s.isEnabled ? 'Active (Live)' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-[#737373] max-w-[220px] truncate">
                      {s.jsonContent.slice(0, 80)}...
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Edit Schema"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(s.id)}
                        className="p-1.5 text-[#737373] hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Duplicate as new starting template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-[#737373] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Schema"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* URL Inspector & Precedence Reviewer Modal */}
      {showInspectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[85vh]">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#E04F16]" />
                <h3 className="font-bold text-sm tracking-wide">Test URL Schema Output & Conflict Resolution</h3>
              </div>
              <button onClick={() => setShowInspectorModal(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <p className="text-[#737373]">
                Enter any public storefront URL to inspect all active schemas that will be rendered, test precedence, and identify duplicate types.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inspectorUrl}
                  onChange={(e) => setInspectorUrl(e.target.value)}
                  placeholder="e.g. / or /products/pd-formal-26-265-pret-kaftan-collection or /collections/pret"
                  className="flex-1 px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-mono text-xs"
                />
                <button
                  onClick={handleInspectUrl}
                  disabled={inspecting}
                  className="px-4 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b] shrink-0"
                >
                  {inspecting ? 'Analyzing...' : 'Inspect Page'}
                </button>
              </div>

              {inspectorResult && (
                <div className="space-y-4 pt-3 border-t border-[#E5E5E5]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#141414]">Resolved Scope:</span>{' '}
                      <span className="font-mono bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E5E5E5]">
                        {inspectorResult.resolvedReferenceType} ({inspectorResult.resolvedReferenceId})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#737373]">
                      {inspectorResult.combinedCount} Schema(s) Applicable
                    </span>
                  </div>

                  {/* Conflict detection notice */}
                  {inspectorResult.conflicts && inspectorResult.conflicts.length > 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Precedence & Duplicate Warnings:</span>
                      </div>
                      {inspectorResult.conflicts.map((c: string, idx: number) => (
                        <div key={idx} className="text-amber-800 pl-6 text-[11px]">
                          • {c}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero duplicate conflicts detected. Schemas will render cleanly into storefront &lt;head&gt;.</span>
                    </div>
                  )}

                  {/* Applicable schemas list */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#141414]">Combined Render Output:</h4>
                    {inspectorResult.applicableSchemas.map((s: any) => (
                      <div key={s.id} className="p-3 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#141414]">{s.name} ({s.schemaType})</span>
                          <span className="text-[10px] uppercase font-bold text-[#E04F16]">{s.referenceType}</span>
                        </div>
                        <pre className="p-2.5 bg-[#141414] text-white rounded-lg font-mono text-[10px] overflow-x-auto max-h-36">
                          {s.jsonContent}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Schema Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[90vh]">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#E04F16]" />
                <h3 className="font-bold text-sm tracking-wide">
                  {editingId ? `Edit Schema: ${name}` : 'Create Structured Data (JSON-LD)'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 flex flex-col">
              <div className="p-6 space-y-4 text-xs flex-1">
                {/* Presets bar */}
                <div>
                  <span className="block text-[#737373] mb-1 font-semibold">Start with an editable Schema Preset:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(PRESETS).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleApplyPreset(t)}
                        className={`px-2.5 py-1 border rounded-lg font-semibold transition-colors ${
                          schemaType === t ? 'bg-[#141414] text-white border-[#141414]' : 'bg-[#FAF9F6] border-[#E5E5E5] text-[#525252] hover:bg-neutral-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">Internal Schema Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Primary Organization Schema"
                      className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">Schema Type (e.g. Product, BreadcrumbList)</label>
                    <input
                      type="text"
                      required
                      value={schemaType}
                      onChange={(e) => setSchemaType(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Scope selector */}
                <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl space-y-3">
                  <h4 className="font-bold text-[#141414]">Schema Assignment & Scope</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">Scope Target</label>
                      <select
                        value={referenceType}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setReferenceType(val);
                          if (val === 'global') setReferenceId('global');
                          else if (val === 'product' && products.length > 0) setReferenceId(products[0].id);
                          else if (val === 'collection' && collections.length > 0) setReferenceId(collections[0].id);
                          else if (val === 'page' && pages.length > 0) setReferenceId(pages[0].id);
                        }}
                        className="w-full px-3.5 py-2 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                      >
                        <option value="global">Entire Website (Global)</option>
                        <option value="product">Specific Product</option>
                        <option value="collection">Specific Collection</option>
                        <option value="page">Specific Website Page</option>
                      </select>
                    </div>

                    {referenceType !== 'global' && (
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">
                          Select {referenceType === 'product' ? 'Product' : referenceType === 'collection' ? 'Collection' : 'Page'} Record
                        </label>
                        {referenceType === 'product' && (
                          <select
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                            className="w-full px-3.5 py-2 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.title} (${p.price})
                              </option>
                            ))}
                          </select>
                        )}
                        {referenceType === 'collection' && (
                          <select
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                            className="w-full px-3.5 py-2 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                          >
                            {collections.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.title} (/{c.handle})
                              </option>
                            ))}
                          </select>
                        )}
                        {referenceType === 'page' && (
                          <select
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                            className="w-full px-3.5 py-2 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                          >
                            {pages.map(pg => (
                              <option key={pg.id} value={pg.id}>
                                {pg.title} (/{pg.handle})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw JSON Code Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#737373] font-semibold">JSON-LD Code (Syntax Validated)</label>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(JSON.parse(jsonContent), null, 2);
                          setJsonContent(formatted);
                          setJsonError(null);
                        } catch (err: any) {
                          setJsonError(err.message);
                        }
                      }}
                      className="text-[11px] text-[#087443] hover:underline font-semibold"
                    >
                      Format JSON
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={jsonContent}
                    onChange={(e) => {
                      setJsonContent(e.target.value);
                      validateJson(e.target.value);
                    }}
                    className={`w-full p-4 border rounded-xl font-mono text-xs bg-[#141414] text-emerald-400 ${
                      jsonError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#E5E5E5]'
                    }`}
                  />
                  {jsonError ? (
                    <div className="mt-1.5 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-[11px] font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Invalid JSON syntax: {jsonError}</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Valid JSON-LD structure</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableCheck"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5E5E5]"
                  />
                  <label htmlFor="enableCheck" className="font-semibold text-[#141414] cursor-pointer">
                    Enable this schema immediately on the storefront
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 bg-[#FAF9F6] border-t border-[#E5E5E5] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(jsonError)}
                  className="px-6 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-md disabled:opacity-50"
                >
                  {editingId ? 'Update Schema' : 'Save Schema Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
