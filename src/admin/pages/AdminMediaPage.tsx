import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Copy, CheckCircle2, AlertTriangle, Search, LayoutGrid, List, FileText, ExternalLink } from 'lucide-react';

interface AdminMediaPageProps {
  token: string;
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ token }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [usageWarning, setUsageWarning] = useState<{ usedIn: string[] } | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMediaItems(data.media || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleFileUpload = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadProgress(50);
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadProgress(100);
      await fetchMedia();
      showSuccess(`Successfully uploaded ${files.length} asset(s)!`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string, force = false) => {
    setUsageWarning(null);
    try {
      const res = await fetch(`/api/admin/media/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.usedIn) {
          setUsageWarning({ usedIn: data.usedIn });
          setSelectedItem(mediaItems.find(m => m.id === id));
          return;
        }
        throw new Error(data.error || 'Delete failed');
      }

      setMediaItems(mediaItems.filter(m => m.id !== id));
      setSelectedItem(null);
      showSuccess('Media asset removed successfully.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleUpdateMeta = async (id: string, name: string, altText: string) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, altText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setMediaItems(mediaItems.map(m => m.id === id ? { ...m, name: data.media.name, altText: data.media.alt_text || data.media.altText } : m));
      showSuccess('Media metadata updated.');
      setSelectedItem(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    showSuccess('Asset URL copied to clipboard!');
  };

  const filteredMedia = mediaItems.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.altText && m.altText.toLowerCase().includes(searchQuery.toLowerCase())) ||
    m.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Media Library & CDN</h1>
          <p className="text-xs text-[#737373]">Upload, organize, and manage product photos, campaign banners, and media assets with usage protection.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#E5E5E5] rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        className="bg-white border-2 border-dashed border-[#D1D1D1] hover:border-[#141414] p-8 rounded-3xl text-center transition-all cursor-pointer group shadow-sm relative overflow-hidden"
      >
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files);
            }
          }}
        />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-[#FAF9F6] text-[#141414] rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#141414]">Drag & drop files here, or <span className="text-[#E04F16] underline">browse</span></p>
            <p className="text-xs text-[#737373] mt-1">Supports PNG, JPG, WEBP, GIF, SVG, PDF up to 10MB each.</p>
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#141414] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-[11px] text-[#737373]">Uploading and validating asset...</p>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media by filename, alt text, or URL..."
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
          />
        </div>
        <span className="text-xs text-[#737373] font-semibold">{filteredMedia.length} asset(s) found</span>
      </div>

      {/* Media Display */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[#737373]">Loading media library...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center space-y-3">
          <Image className="w-10 h-10 text-[#A3A3A3] mx-auto" />
          <p className="text-sm font-bold text-[#141414]">No media assets found</p>
          <p className="text-xs text-[#737373]">Upload your first asset above to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm flex flex-col justify-between group">
              <div className="relative aspect-square bg-[#FAF9F6] overflow-hidden">
                <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="p-2 bg-white text-[#141414] rounded-xl hover:bg-neutral-100 shadow"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 bg-white text-[#141414] rounded-xl hover:bg-neutral-100 shadow"
                    title="Edit Details"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 text-xs space-y-1">
                <span className="font-bold text-[#141414] block truncate">{item.name}</span>
                <span className="text-[10px] text-[#737373] font-mono block truncate">{item.url}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E5E5E5] text-[#737373]">
                <th className="p-3.5 font-semibold">Asset</th>
                <th className="p-3.5 font-semibold">Filename</th>
                <th className="p-3.5 font-semibold">Alt Text</th>
                <th className="p-3.5 font-semibold">Uploaded</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredMedia.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F6]/50">
                  <td className="p-3.5 w-16">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] overflow-hidden">
                      <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-[#141414]">{item.name}</td>
                  <td className="p-3.5 text-[#737373]">{item.altText || '—'}</td>
                  <td className="p-3.5 text-[#737373] font-mono">{new Date(item.uploadedAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="p-1.5 border border-[#E5E5E5] rounded-lg hover:bg-neutral-100"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4 text-[#737373]" />
                      </button>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 border border-[#E5E5E5] rounded-lg hover:bg-neutral-100"
                        title="Edit"
                      >
                        <FileText className="w-4 h-4 text-[#737373]" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="text-base font-bold text-[#141414]">Asset Details & Metadata</h3>
              <button onClick={() => { setSelectedItem(null); setUsageWarning(null); }} className="text-[#737373] hover:text-[#141414] font-bold text-lg">×</button>
            </div>

            {usageWarning && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cannot delete: Asset is currently in use!</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {usageWarning.usedIn.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-amber-800">You can force delete this asset, but it may cause broken images on the storefront.</p>
                <button
                  onClick={() => handleDelete(selectedItem.id, true)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-sm mt-2"
                >
                  Force Delete Anyway
                </button>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="aspect-video bg-[#FAF9F6] rounded-2xl border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
                <img src={selectedItem.url} alt={selectedItem.name} className="max-h-full object-contain" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                  const altText = (form.elements.namedItem('altText') as HTMLInputElement).value;
                  handleUpdateMeta(selectedItem.id, name, altText);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Filename</label>
                  <input
                    name="name"
                    defaultValue={selectedItem.name}
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Alt Text (for SEO & Accessibility)</label>
                  <input
                    name="altText"
                    defaultValue={selectedItem.altText || ''}
                    placeholder="Describe image for screen readers..."
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">CDN URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={selectedItem.url}
                      className="flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl font-mono text-neutral-600 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedItem.url)}
                      className="px-4 py-2.5 bg-[#141414] text-white rounded-xl font-semibold hover:bg-[#2b2b2b] shrink-0"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedItem(null); setUsageWarning(null); }}
                    className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#737373] hover:text-[#141414]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#141414] text-white rounded-xl font-semibold hover:bg-[#2b2b2b] shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
