import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Code,
  Layers,
  History,
  RotateCcw,
  AlertCircle,
  Eye,
  Sparkles,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { SchemaManagerTab } from '../components/SchemaManagerTab.tsx';
import { PageBuilderData, validatePageBuilderData } from '../../types/pageBuilder.ts';

interface AdminPagesPageProps {
  token: string;
  onNavigate?: (path: string) => void;
}

const DEFAULT_SAMPLE_BUILDER_CONTENT: PageBuilderData = {
  schemaVersion: 1,
  sections: [
    {
      id: 'sec-hero-1',
      type: 'hero',
      title: 'Hero Showcase',
      disabled: false,
      settings: {
        heading: 'Handcrafted Festive Couture',
        subheading: 'Curated royal velvets, delicate zardozi, and pure silk pret wear.',
        alignment: 'center',
        buttonText: 'Shop New Arrivals',
        buttonLink: '/collections'
      }
    },
    {
      id: 'sec-rich-1',
      type: 'rich_text',
      title: 'Editorial Highlight',
      disabled: false,
      settings: {
        title: 'Artisanal Craftsmanship',
        content: 'Each garment is crafted with meticulous attention to detail by master artisans.',
        layout: 'centered'
      }
    }
  ],
  globalStyles: {
    maxWidth: '1280px',
    paddingY: '48px',
    backgroundColor: '#FAF9F6'
  }
};

export const AdminPagesPage: React.FC<AdminPagesPageProps> = ({ token, onNavigate }) => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'content' | 'builder' | 'versions' | 'schema'>('content');

  // Form State
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [type, setType] = useState('page');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [builderJsonStr, setBuilderJsonStr] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Versioning state
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number>(1);

  // Feedback State
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  const fetchPages = () => {
    setLoading(true);
    fetch('/api/admin/storefront/pages', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load website pages');
        return res.json();
      })
      .then(data => {
        setPages(data.pages || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  const loadVersions = (pageId: string) => {
    setLoadingVersions(true);
    fetch(`/api/admin/storefront/pages/${pageId}/versions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setVersions(data.versions || []);
        setLoadingVersions(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingVersions(false);
      });
  };

  const handleOpenCreate = () => {
    setEditingPage(null);
    setTitle('');
    setHandle('');
    setType('page');
    setContent('');
    setStatus('Draft');
    setSeoTitle('');
    setSeoDescription('');
    setBuilderJsonStr(JSON.stringify(DEFAULT_SAMPLE_BUILDER_CONTENT, null, 2));
    setJsonError(null);
    setCurrentVersion(1);
    setVersions([]);
    setModalTab('content');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingPage(p);
    setTitle(p.title || '');
    setHandle(p.handle || '');
    setType(p.type || 'page');
    setContent(p.content || '');
    setStatus(p.status || 'Draft');
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setCurrentVersion(p.version || 1);

    const bContent = p.builderContent || DEFAULT_SAMPLE_BUILDER_CONTENT;
    setBuilderJsonStr(JSON.stringify(bContent, null, 2));
    setJsonError(null);

    setModalTab('content');
    setIsModalOpen(true);
    loadVersions(p.id);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(builderJsonStr);
      const validation = validatePageBuilderData(parsed);
      setBuilderJsonStr(JSON.stringify(validation.sanitized, null, 2));
      setJsonError(null);
      showSuccess('Builder JSON successfully formatted & validated!');
    } catch (e: any) {
      setJsonError(`Syntax Error: ${e.message}`);
    }
  };

  const handleSave = async (actionOverride?: 'draft' | 'publish') => {
    setErrorMessage(null);
    if (!title.trim()) {
      showError('Page title is required');
      return;
    }

    // Validate Builder JSON
    let parsedBuilderData = null;
    if (builderJsonStr.trim()) {
      try {
        const raw = JSON.parse(builderJsonStr);
        const { sanitized, error } = validatePageBuilderData(raw);
        if (error) {
          setJsonError(error);
          showError(`Builder Content Error: ${error}`);
          return;
        }
        parsedBuilderData = sanitized;
      } catch (e: any) {
        setJsonError(`Invalid JSON: ${e.message}`);
        showError(`Builder Content JSON syntax error: ${e.message}`);
        return;
      }
    }

    setIsSaving(true);

    const finalStatus = actionOverride === 'publish'
      ? 'Published'
      : (actionOverride === 'draft' ? 'Draft' : status);

    const payload = {
      title: title.trim(),
      handle: handle.trim(),
      type,
      content,
      status: finalStatus,
      action: actionOverride,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      builderContent: parsedBuilderData,
      expectedVersion: editingPage ? currentVersion : undefined,
      changeSummary: editingPage
        ? (actionOverride === 'publish' ? `Published v${currentVersion + 1}` : `Saved draft v${currentVersion + 1}`)
        : (finalStatus === 'Published' ? 'Initial publication' : 'Initial draft')
    };

    const url = editingPage
      ? `/api/admin/storefront/pages/${editingPage.id}`
      : '/api/admin/storefront/pages';
    const method = editingPage ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data.message || 'Version conflict detected. Please refresh to load the latest changes.');
        }
        throw new Error(data.error || 'Failed to save page');
      }

      showSuccess(
        editingPage
          ? `Page updated successfully! (Now v${data.page.version}, ${data.page.status})`
          : `Page created successfully! (${data.page.status}, v1)`
      );

      if (editingPage && data.page) {
        setEditingPage(data.page);
        setCurrentVersion(data.page.version);
        loadVersions(editingPage.id);
      } else {
        setIsModalOpen(false);
      }

      fetchPages();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = async (targetVersion: number) => {
    if (!editingPage) return;
    if (!confirm(`Are you sure you want to restore Version ${targetVersion}? This will create a new draft version based on that snapshot.`)) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/storefront/pages/${editingPage.id}/versions/${targetVersion}/rollback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rollback failed');

      showSuccess(`Restored page from Version ${targetVersion}! Current version is now v${data.page.version}.`);
      setEditingPage(data.page);
      setCurrentVersion(data.page.version);
      setTitle(data.page.title);
      setContent(data.page.content);
      setStatus(data.page.status);
      setBuilderJsonStr(JSON.stringify(data.page.builderContent, null, 2));

      loadVersions(editingPage.id);
      fetchPages();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${pageTitle}"? All builder sections and version history will be removed.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/storefront/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete page');
      showSuccess(`Page "${pageTitle}" deleted successfully.`);
      fetchPages();
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E04F16]" />
            <span>Storefront Pages & Page Builder</span>
          </h1>
          <p className="text-xs text-[#737373]">
            MySQL-backed Page Builder persistence layer with structured section data, draft/published states, and safe version history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPages}
            className="px-3.5 py-2 border border-[#E5E5E5] bg-white rounded-xl text-xs font-semibold hover:bg-[#FAF9F6] text-[#737373] transition-colors"
            title="Refresh from Database"
          >
            Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
              <tr>
                <th className="py-3 px-4">Page Identity</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Structured Content</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#737373]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                      <span>Loading pages from database...</span>
                    </div>
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#737373]">
                    No pages found. Click &quot;New Page&quot; to create your first page.
                  </td>
                </tr>
              ) : (
                pages.map((p) => {
                  const sectionsCount = p.sectionsCount ?? (p.builderContent?.sections?.length || 0);
                  const isPublished = p.status === 'Published';
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#141414]">{p.title}</div>
                        {p.seoTitle && p.seoTitle !== p.title && (
                          <div className="text-[10px] text-[#737373] truncate max-w-xs">{p.seoTitle}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#737373]">
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">/{p.handle}</span>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-[#525252]">{p.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-[#141414]">
                          <Layers className="w-3.5 h-3.5 text-[#E04F16]" />
                          <span>{sectionsCount} {sectionsCount === 1 ? 'section' : 'sections'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-neutral-100 text-[#141414] rounded-md font-mono font-bold text-[10px]">
                          v{p.version || 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${
                            isPublished
                              ? 'bg-[#D3F8DF] text-[#087443]'
                              : p.status === 'Draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-[#087443]' : p.status === 'Draft' ? 'bg-amber-600' : 'bg-neutral-500'}`} />
                          {p.status || 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#737373] text-[11px]">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate(`/admin/pages/builder/${p.id}`)}
                            className="px-2.5 py-1 bg-[#141414] hover:bg-[#2b2b2b] text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm mr-1"
                            title="Open in Visual Page Builder"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#E04F16]" />
                            <span>Visual Builder</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Edit Page"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 text-[#737373] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-[#E04F16]" />
                <div>
                  <h3 className="font-bold text-sm tracking-wide">
                    {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Page'}
                  </h3>
                  {editingPage && (
                    <div className="text-[11px] text-[#A3A3A3] flex items-center gap-2 mt-0.5">
                      <span>ID: {editingPage.id}</span>
                      <span>•</span>
                      <span className="font-mono bg-white/10 px-1.5 py-0.2 rounded">v{currentVersion}</span>
                      <span>•</span>
                      <span>Status: {editingPage.status}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingPage && onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      onNavigate(`/admin/pages/builder/${editingPage.id}`);
                    }}
                    className="px-3 py-1 bg-[#E04F16] hover:bg-[#c23e0c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Open Visual Builder</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#E5E5E5] bg-[#FAF9F6] px-6">
              <button
                type="button"
                onClick={() => setModalTab('content')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'content' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Page Details & SEO</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('builder')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'builder' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Structured Builder Content</span>
              </button>
              {editingPage && (
                <button
                  type="button"
                  onClick={() => setModalTab('versions')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    modalTab === 'versions' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Version History ({versions.length})</span>
                </button>
              )}
              {editingPage && (
                <button
                  type="button"
                  onClick={() => setModalTab('schema')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    modalTab === 'schema' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Schema Markup</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5 text-xs">
              {modalTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">Page Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Bridal Heritage & Bespoke Services"
                      className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414] focus:outline-none focus:border-[#141414]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">URL Handle (Slug) *</label>
                      <div className="flex items-center border border-[#E5E5E5] rounded-xl overflow-hidden px-3 bg-white">
                        <span className="text-[#737373] font-mono text-[11px]">/</span>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="bridal-heritage"
                          className="w-full py-2 px-1 font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">Page Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3.5 py-2 border border-[#E5E5E5] rounded-xl bg-white focus:outline-none"
                      >
                        <option value="page">Standard Page</option>
                        <option value="landing">Landing Page</option>
                        <option value="policy">Policy / Terms</option>
                        <option value="blog">Editorial / Story</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">Publication State</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2 border border-[#E5E5E5] rounded-xl bg-white font-semibold focus:outline-none"
                      >
                        <option value="Draft">Draft (Only Admin Preview)</option>
                        <option value="Published">Published (Live on Storefront)</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-3">
                    <div className="font-semibold text-[#141414] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E04F16]" />
                      <span>Search Engine Optimization (SEO)</span>
                    </div>
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">SEO Title</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Page Title | LAAM Luxury Couture"
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">SEO Meta Description</label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Brief summary displayed in Google search results (150-160 chars recommended)..."
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {/* Fallback Text / HTML Content */}
                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">
                      Fallback Plain / HTML Content (For crawlers and non-builder consumers)
                    </label>
                    <textarea
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write traditional HTML / text content here..."
                      className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'builder' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div>
                      <h4 className="font-bold text-[#141414] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#E04F16]" />
                        <span>Structured Builder Sections Data</span>
                      </h4>
                      <p className="text-[11px] text-[#737373]">
                        Persisted in MySQL as structured JSON with sections, blocks, settings, and styles.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      className="px-3 py-1.5 bg-white border border-[#E5E5E5] hover:bg-neutral-100 rounded-lg text-xs font-semibold text-[#141414] transition-colors self-start sm:self-auto"
                    >
                      Format & Validate JSON
                    </button>
                  </div>

                  {jsonError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  <div>
                    <textarea
                      rows={14}
                      value={builderJsonStr}
                      onChange={(e) => {
                        setBuilderJsonStr(e.target.value);
                        setJsonError(null);
                      }}
                      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl font-mono text-xs bg-[#1E1E1E] text-[#D4D4D4] leading-relaxed focus:outline-none focus:border-[#141414]"
                      placeholder="Paste or edit page builder structured JSON..."
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {modalTab === 'versions' && editingPage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div>
                      <h4 className="font-bold text-[#141414] flex items-center gap-1.5">
                        <History className="w-4 h-4 text-[#087443]" />
                        <span>Page Version History</span>
                      </h4>
                      <p className="text-[11px] text-[#737373]">
                        Every save or publication creates an immutable snapshot in MySQL for safe version handling.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-[#FAF9F6] border border-[#E5E5E5] px-2.5 py-1 rounded-md">
                      Current: v{currentVersion}
                    </span>
                  </div>

                  {loadingVersions ? (
                    <div className="p-8 text-center text-[#737373]">Loading versions...</div>
                  ) : versions.length === 0 ? (
                    <div className="p-8 text-center text-[#737373]">No version snapshots recorded yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {versions.map((ver) => {
                        const isCurrent = ver.version === currentVersion;
                        const vSecCount = ver.builderContent?.sections?.length || 0;
                        return (
                          <div
                            key={ver.id || ver.version}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isCurrent ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-[#E5E5E5] hover:bg-[#FAF9F6]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded text-[#141414]">
                                  v{ver.version}
                                </span>
                                <span className="font-semibold text-[#141414]">{ver.changeSummary || 'Page update'}</span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                    Current Live
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-[#737373] mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(ver.createdAt).toLocaleString()}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {ver.createdBy || 'admin@laam.com'}
                                </span>
                                <span>•</span>
                                <span>{vSecCount} {vSecCount === 1 ? 'section' : 'sections'}</span>
                              </div>
                            </div>

                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleRollback(ver.version)}
                                className="px-3 py-1.5 bg-white border border-[#E5E5E5] hover:bg-neutral-100 text-[#141414] font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-[#E04F16]" />
                                <span>Restore v{ver.version}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'schema' && editingPage && (
                <SchemaManagerTab
                  token={token}
                  referenceType="page"
                  referenceId={editingPage.id}
                />
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="bg-[#FAF9F6] border-t border-[#E5E5E5] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#737373] flex items-center gap-2">
                <span>Version: <strong className="font-mono text-[#141414]">v{currentVersion}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-[#141414]">{status}</strong></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-[#737373] hover:text-[#141414] font-semibold text-xs"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-[#141414] font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('publish')}
                  className="px-5 py-2 bg-[#141414] hover:bg-[#2b2b2b] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md"
                >
                  <span>{editingPage ? 'Publish Changes' : 'Create & Publish'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
