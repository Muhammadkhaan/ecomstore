import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Search,
  LayoutGrid,
  List,
  FileText,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Plus,
  Check,
  X,
  Link2,
  Calendar,
  Layers,
  Eye,
  Info
} from 'lucide-react';

interface AdminMediaPageProps {
  token: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  altText: string;
  fileSize: number;
  fileType: string;
  dimensions?: string | null;
  uploadedAt: string;
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ token }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Details Modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingAltText, setEditingAltText] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [usageWarning, setUsageWarning] = useState<{ usedIn: string[] } | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // External URL Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importName, setImportName] = useState('');
  const [importAltText, setImportAltText] = useState('');
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMediaItems(data.media || []);
      } else {
        throw new Error(data.error || 'Failed to fetch media assets');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  // When selectedItem changes, initialize edit form fields
  useEffect(() => {
    if (selectedItem) {
      setEditingName(selectedItem.name);
      setEditingAltText(selectedItem.altText || '');
      setUsageWarning(null);
    }
  }, [selectedItem]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    // Validate size and format
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedMimes.includes(file.type)) {
        setErrorMessage(`File "${file.name}" has an unsupported format. Supported formats: JPG, PNG, WEBP, GIF, SVG, PDF.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds the 10MB size limit (${formatFileSize(file.size)}).`);
        return;
      }
    }

    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadProgress(65);
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadProgress(100);
      await fetchMedia();
      showSuccess(`Successfully uploaded ${files.length} asset(s) to Media Library.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setIsDragOver(false);
    }
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    setImporting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url: importUrl,
          name: importName || 'Imported Asset',
          altText: importAltText || importName || 'Imported Asset'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'URL import failed');

      await fetchMedia();
      showSuccess('External asset imported successfully.');
      setIsImportModalOpen(false);
      setImportUrl('');
      setImportName('');
      setImportAltText('');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setImporting(false);
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
          return;
        }
        throw new Error(data.error || 'Delete failed');
      }

      setMediaItems(prev => prev.filter(m => m.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSelectedItem(null);
      showSuccess('Media asset removed successfully.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleBulkDelete = async (force = false) => {
    if (selectedIds.size === 0) return;
    if (!force && !window.confirm(`Are you sure you want to delete ${selectedIds.size} selected asset(s)?`)) {
      return;
    }

    setBulkDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          force
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk delete failed');

      if (data.blockedItems && data.blockedItems.length > 0) {
        setErrorMessage(
          `${data.blockedItems.length} asset(s) were blocked from deletion because they are in active use on the storefront.`
        );
      }

      await fetchMedia();
      setSelectedIds(new Set());
      showSuccess(`Deleted ${data.deletedCount} asset(s) successfully.`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSavingMeta(true);
    try {
      const res = await fetch(`/api/admin/media/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingName,
          altText: editingAltText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setMediaItems(prev =>
        prev.map(m =>
          m.id === selectedItem.id
            ? { ...m, name: data.media.name, altText: data.media.altText || data.media.alt_text }
            : m
        )
      );
      setSelectedItem(prev =>
        prev
          ? { ...prev, name: data.media.name, altText: data.media.altText || data.media.alt_text }
          : null
      );
      showSuccess('Asset metadata and SEO alt text updated.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    showSuccess('Asset URL copied to clipboard!');
  };

  const toggleSelectId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map(m => m.id)));
    }
  };

  // Filter and sort media items
  const filteredMedia = mediaItems
    .filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.altText && m.altText.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.url.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (typeFilter === 'all') return true;
      if (typeFilter === 'images') {
        return m.fileType?.startsWith('image/') && m.fileType !== 'image/svg+xml';
      }
      if (typeFilter === 'svg') return m.fileType === 'image/svg+xml';
      if (typeFilter === 'pdf') return m.fileType === 'application/pdf';
      if (typeFilter === 'external') return m.fileType === 'image/external' || m.url.startsWith('http');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'size_desc') {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      if (sortBy === 'size_asc') {
        return (a.fileSize || 0) - (b.fileSize || 0);
      }
      // default: newest
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414] tracking-tight">Media Library & CDN</h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Store, inspect, organize, and optimize photos, banners, and digital assets with automatic dimensions & usage protection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] text-xs font-semibold text-[#141414] rounded-xl hover:bg-[#FAF9F6] shadow-sm flex items-center gap-2 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-[#737373]" />
            <span>Import via URL</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Images</span>
          </button>
          <div className="flex items-center bg-white border border-[#E5E5E5] rounded-xl p-1 shadow-sm ml-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 font-bold p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white border-2 border-dashed p-8 rounded-3xl text-center transition-all cursor-pointer group shadow-sm relative overflow-hidden ${
          isDragOver ? 'border-[#E04F16] bg-orange-50/20 ring-4 ring-[#E04F16]/10' : 'border-[#D1D1D1] hover:border-[#141414]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files);
            }
          }}
        />
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-12 h-12 bg-[#FAF9F6] text-[#141414] rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Upload className="w-6 h-6 text-[#141414]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#141414]">
              Drag & drop files here, or <span className="text-[#E04F16] underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-[#737373] mt-1">
              Supports JPEG, PNG, WEBP, GIF, SVG, and PDF up to 10MB each. Dimensions automatically calculated.
            </p>
          </div>
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#141414] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#737373] font-medium">Validating file signature and uploading asset...</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter, Search & Bulk Actions Bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by filename, alt text, or URL..."
              className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filters */}
            <div className="flex items-center bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'images', label: 'Images' },
                { id: 'svg', label: 'SVG' },
                { id: 'pdf', label: 'PDF' },
                { id: 'external', label: 'External' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    typeFilter === tab.id ? 'bg-[#141414] text-white shadow-xs' : 'text-[#737373] hover:text-[#141414]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#737373]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#141414] focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Size (Largest)</option>
                <option value="size_asc">Size (Smallest)</option>
              </select>
            </div>

            <span className="text-xs text-[#737373] font-semibold px-2">
              {filteredMedia.length} {filteredMedia.length === 1 ? 'asset' : 'assets'}
            </span>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-[#141414] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-fade-in text-xs">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredMedia.length && filteredMedia.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-[#E04F16] cursor-pointer"
              />
              <span className="font-semibold">
                {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Deselect
              </button>
              <button
                onClick={() => handleBulkDelete(false)}
                disabled={bulkDeleting}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid / List Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#737373] font-medium">Loading media assets...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#A3A3A3]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#141414]">No media assets found</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            {searchQuery || typeFilter !== 'all'
              ? 'No assets match your search or filter criteria. Try clearing filters.'
              : 'Your media library is empty. Upload your first product photos or hero banners above.'}
          </p>
          {(searchQuery || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E5E5] text-xs font-semibold text-[#141414] rounded-xl hover:bg-neutral-100"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isPdf = item.fileType === 'application/pdf';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group bg-white rounded-2xl border-2 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative ${
                  isSelected ? 'border-[#141414] ring-2 ring-[#141414]/20' : 'border-[#E5E5E5] hover:border-[#141414]'
                }`}
              >
                {/* Checkbox overlay */}
                <div
                  onClick={(e) => toggleSelectId(item.id, e)}
                  className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-opacity ${
                    isSelected ? 'bg-[#141414] text-white opacity-100' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                </div>

                {/* Aspect-Square Preview */}
                <div className="relative aspect-square bg-[#FAF9F6] overflow-hidden flex items-center justify-center">
                  {isPdf ? (
                    <div className="text-center p-4">
                      <FileText className="w-10 h-10 text-red-500 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-[#737373] uppercase">PDF Document</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.altText || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {/* Dimensions & Format Badge */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.dimensions && (
                      <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                        {item.dimensions}
                      </span>
                    )}
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase ml-auto">
                      {item.fileType?.split('/')[1] || 'img'}
                    </span>
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item.url);
                      }}
                      className="p-2 bg-white text-[#141414] rounded-xl hover:bg-neutral-100 shadow transition-transform hover:scale-110"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="p-2 bg-white text-[#141414] rounded-xl hover:bg-neutral-100 shadow transition-transform hover:scale-110"
                      title="View & Edit Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${item.name}"?`)) {
                          handleDelete(item.id);
                        }
                      }}
                      className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow transition-transform hover:scale-110"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="p-2.5 text-xs space-y-0.5 bg-white border-t border-[#E5E5E5]">
                  <span className="font-bold text-[#141414] block truncate text-[11px]" title={item.name}>
                    {item.name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-[#737373]">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span className="font-mono">{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E5E5E5] text-[#737373]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredMedia.length && filteredMedia.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-[#E04F16] cursor-pointer"
                  />
                </th>
                <th className="p-3 font-semibold">Asset Preview</th>
                <th className="p-3 font-semibold">Filename</th>
                <th className="p-3 font-semibold">Alt Text (SEO)</th>
                <th className="p-3 font-semibold">Dimensions</th>
                <th className="p-3 font-semibold">File Size</th>
                <th className="p-3 font-semibold">Uploaded</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`hover:bg-[#FAF9F6]/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-50/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center" onClick={(e) => toggleSelectId(item.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-[#E04F16] cursor-pointer"
                      />
                    </td>
                    <td className="p-3 w-16">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
                        {item.fileType === 'application/pdf' ? (
                          <FileText className="w-6 h-6 text-red-500" />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.altText || item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-[#141414]">
                      <span className="block truncate max-w-xs">{item.name}</span>
                      <span className="text-[10px] text-[#737373] font-mono block truncate max-w-xs">{item.url}</span>
                    </td>
                    <td className="p-3 text-[#737373]">
                      <span className="block truncate max-w-xs">{item.altText || '—'}</span>
                    </td>
                    <td className="p-3 font-mono text-[#737373] text-[11px]">{item.dimensions || '—'}</td>
                    <td className="p-3 text-[#737373] text-[11px]">{formatFileSize(item.fileSize)}</td>
                    <td className="p-3 text-[#737373] font-mono text-[11px]">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyUrl(item.url)}
                          className="p-1.5 border border-[#E5E5E5] rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#737373]" />
                        </button>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 border border-[#E5E5E5] rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Edit Details"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#737373]" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${item.name}"?`)) {
                              handleDelete(item.id);
                            }
                          }}
                          className="p-1.5 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Details & Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-[#E5E5E5] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#E04F16]" />
                <h3 className="text-base font-bold text-[#141414]">Asset Inspector & Metadata</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setUsageWarning(null);
                }}
                className="text-[#737373] hover:text-[#141414] font-bold text-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Usage Warning If Delete Blocked */}
              {usageWarning && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Cannot delete: Asset is currently referenced across active content!</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    The following products, collections, or custom pages are actively referencing this image:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 font-semibold text-amber-950">
                    {usageWarning.usedIn.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => handleDelete(selectedItem.id, true)}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-sm text-xs"
                    >
                      Force Delete Anyway (May break storefront visuals)
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview Box */}
              <div className="aspect-video bg-[#FAF9F6] rounded-2xl border border-[#E5E5E5] overflow-hidden flex items-center justify-center relative group">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.name}
                  className="max-h-full max-w-full object-contain"
                />
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/75 backdrop-blur-xs text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Size</span>
                </a>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E5E5E5] text-xs">
                <div>
                  <span className="block text-[#737373] text-[10px] font-semibold uppercase">Dimensions</span>
                  <span className="font-mono font-bold text-[#141414]">{selectedItem.dimensions || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[#737373] text-[10px] font-semibold uppercase">File Size</span>
                  <span className="font-semibold text-[#141414]">{formatFileSize(selectedItem.fileSize)}</span>
                </div>
                <div>
                  <span className="block text-[#737373] text-[10px] font-semibold uppercase">MIME Type</span>
                  <span className="font-mono text-[11px] text-[#141414] truncate block">{selectedItem.fileType || 'image'}</span>
                </div>
                <div>
                  <span className="block text-[#737373] text-[10px] font-semibold uppercase">Uploaded Date</span>
                  <span className="font-mono text-[11px] text-[#141414]">
                    {new Date(selectedItem.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Editable Fields Form */}
              <form onSubmit={handleUpdateMeta} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#141414] font-semibold mb-1">Asset Filename</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#141414] font-semibold">
                      Alt Text <span className="text-[#737373] font-normal">(Crucial for SEO & Accessibility)</span>
                    </label>
                    <span className="text-[10px] text-[#737373]">Used in schema.org & image tags</span>
                  </div>
                  <input
                    type="text"
                    value={editingAltText}
                    onChange={(e) => setEditingAltText(e.target.value)}
                    placeholder="Describe this product or model for search crawlers & screen readers..."
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                  />
                </div>

                <div>
                  <label className="block text-[#141414] font-semibold mb-1">Persistent CDN / Server URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={selectedItem.url}
                      className="flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl font-mono text-neutral-600 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedItem.url)}
                      className="px-4 py-2.5 bg-[#141414] text-white rounded-xl font-semibold hover:bg-[#2b2b2b] shrink-0 transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${selectedItem.name}" permanently?`)) {
                        handleDelete(selectedItem.id);
                      }
                    }}
                    className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl font-semibold transition-colors"
                  >
                    Delete Asset
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(null);
                        setUsageWarning(null);
                      }}
                      className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#737373] hover:text-[#141414] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingMeta}
                      className="px-5 py-2.5 bg-[#141414] text-white rounded-xl font-semibold hover:bg-[#2b2b2b] shadow-sm transition-colors disabled:opacity-50"
                    >
                      {isSavingMeta ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import External URL Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#E04F16]" />
                <h3 className="text-base font-bold text-[#141414]">Import Asset via URL</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-[#737373] hover:text-[#141414] font-bold text-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportUrl} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#141414] font-semibold mb-1">Image URL (HTTP/HTTPS)</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                  required
                />
              </div>

              {importUrl && (
                <div className="aspect-video bg-[#FAF9F6] rounded-xl border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
                  <img
                    src={importUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-[#141414] font-semibold mb-1">Asset Name</label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="e.g. Royal Pret Campaign Banner"
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#141414] font-semibold mb-1">Alt Text</label>
                <input
                  type="text"
                  value={importAltText}
                  onChange={(e) => setImportAltText(e.target.value)}
                  placeholder="Describe image for SEO..."
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#737373] hover:text-[#141414]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2.5 bg-[#141414] text-white rounded-xl font-semibold hover:bg-[#2b2b2b] shadow-sm disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Add to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
