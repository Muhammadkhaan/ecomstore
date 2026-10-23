import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Check, Search, X, Link2, FileText, ArrowUpDown } from 'lucide-react';

interface MediaPickerModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText?: string, item?: any) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ token, isOpen, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'images' | 'svg'>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [customAltText, setCustomAltText] = useState('');

  // External URL tab state
  const [externalUrl, setExternalUrl] = useState('');
  const [externalAltText, setExternalAltText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.media) {
        setMediaItems(data.media);
      }
    } catch (err: any) {
      console.error('Failed to load media in picker modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedItem(null);
      setCustomAltText('');
      setErrorMessage(null);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSelectAsset = (item: any) => {
    setSelectedItem(item);
    setCustomAltText(item.altText || item.name || '');
  };

  const handleConfirmSelection = () => {
    if (!selectedItem) return;
    onSelect(selectedItem.url, customAltText, selectedItem);
    onClose();
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErrorMessage(null);
    setUploadProgress(25);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadProgress(70);
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadProgress(100);
      await fetchMedia();

      // Immediately select uploaded file
      const uploaded = data.media;
      if (uploaded) {
        onSelect(uploaded.url, uploaded.altText || uploaded.name, uploaded);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmExternalUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;
    onSelect(externalUrl.trim(), externalAltText.trim() || undefined);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filtered = mediaItems.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase())) ||
      m.url.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (typeFilter === 'images') return m.fileType?.startsWith('image/') && m.fileType !== 'image/svg+xml';
    if (typeFilter === 'svg') return m.fileType === 'image/svg+xml';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#E5E5E5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[#141414] font-serif">Select Media Asset</h3>
            <div className="flex items-center bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === 'library' ? 'bg-[#141414] text-white shadow-xs' : 'text-[#737373] hover:text-[#141414]'
                }`}
              >
                Media Library
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === 'upload' ? 'bg-[#141414] text-white shadow-xs' : 'text-[#737373] hover:text-[#141414]'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === 'url' ? 'bg-[#141414] text-white shadow-xs' : 'text-[#737373] hover:text-[#141414]'
                }`}
              >
                External URL
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-[#737373] hover:text-[#141414] font-bold text-lg p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'library' ? (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by filename or alt text..."
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div className="flex items-center bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-0.5 text-[11px]">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      typeFilter === 'all' ? 'bg-[#141414] text-white' : 'text-[#737373]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTypeFilter('images')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      typeFilter === 'images' ? 'bg-[#141414] text-white' : 'text-[#737373]'
                    }`}
                  >
                    Photos
                  </button>
                  <button
                    onClick={() => setTypeFilter('svg')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      typeFilter === 'svg' ? 'bg-[#141414] text-white' : 'text-[#737373]'
                    }`}
                  >
                    SVG
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-[#737373]">Loading media assets...</div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center space-y-2 border-2 border-dashed border-[#E5E5E5] rounded-2xl">
                  <ImageIcon className="w-8 h-8 text-[#A3A3A3] mx-auto" />
                  <p className="text-xs font-bold text-[#141414]">No assets found</p>
                  <p className="text-[11px] text-[#737373]">Try searching something else or upload a new file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filtered.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectAsset(item)}
                        className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col group relative ${
                          isSelected
                            ? 'border-[#141414] ring-2 ring-[#141414]/20 shadow-sm'
                            : 'border-[#E5E5E5] hover:border-neutral-400'
                        }`}
                      >
                        <div className="aspect-square bg-[#FAF9F6] relative overflow-hidden flex items-center justify-center">
                          {item.fileType === 'application/pdf' ? (
                            <FileText className="w-8 h-8 text-red-500" />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#141414] text-white rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.dimensions && (
                            <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                              {item.dimensions}
                            </span>
                          )}
                        </div>
                        <div className="p-2 text-[11px] font-semibold text-[#141414] truncate">
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Asset Inspection & Alt Text Tuning */}
              {selectedItem && (
                <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-fade-in text-xs">
                  <div className="w-16 h-16 rounded-xl border border-[#E5E5E5] overflow-hidden bg-white shrink-0">
                    <img src={selectedItem.url} alt={selectedItem.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#141414] truncate block max-w-xs">{selectedItem.name}</span>
                      <span className="text-[10px] text-[#737373] font-mono">
                        {selectedItem.dimensions ? `${selectedItem.dimensions} • ` : ''}
                        {formatFileSize(selectedItem.fileSize)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#737373] uppercase mb-0.5">
                        Element Alt Text (for SEO & Screen Readers)
                      </label>
                      <input
                        type="text"
                        value={customAltText}
                        onChange={(e) => setCustomAltText(e.target.value)}
                        placeholder="Describe the image..."
                        className="w-full px-3 py-1.5 border border-[#E5E5E5] rounded-lg text-xs bg-white text-[#141414] focus:outline-none focus:border-[#141414]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleUploadFiles(e.dataTransfer.files);
                }
              }}
              className="border-2 border-dashed border-[#D1D1D1] hover:border-[#141414] rounded-3xl p-12 text-center space-y-4 bg-[#FAF9F6] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUploadFiles(e.target.files);
                  }
                }}
              />
              <div className="w-12 h-12 bg-white text-[#141414] rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#141414]">Drag & drop files here, or click to browse</p>
                <p className="text-xs text-[#737373]">PNG, JPG, WEBP, GIF, SVG up to 10MB each</p>
              </div>
              {uploading ? (
                <div className="max-w-xs mx-auto space-y-1">
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#141414] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-[11px] text-[#737373]">Uploading and saving to media library...</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="px-5 py-2.5 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-sm pointer-events-none"
                >
                  Choose From Computer
                </button>
              )}
            </div>
          ) : (
            /* EXTERNAL URL TAB */
            <form onSubmit={handleConfirmExternalUrl} className="space-y-4 max-w-lg mx-auto py-4 text-xs">
              <div>
                <label className="block text-[#141414] font-semibold mb-1">Direct Image URL</label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                  required
                />
              </div>

              {externalUrl && (
                <div className="aspect-video bg-[#FAF9F6] rounded-xl border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
                  <img
                    src={externalUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-[#141414] font-semibold mb-1">Alt Text (Recommended for SEO)</label>
                <input
                  type="text"
                  value={externalAltText}
                  onChange={(e) => setExternalAltText(e.target.value)}
                  placeholder="Describe image..."
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414] focus:outline-none focus:border-[#141414]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!externalUrl.trim()}
                  className="w-full py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-sm disabled:opacity-50"
                >
                  Use External Image
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E5E5] bg-[#FAF9F6] shrink-0 text-xs">
          <span className="text-[#737373]">
            {activeTab === 'library' && selectedItem ? `Selected: ${selectedItem.name}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E5E5] bg-white rounded-xl font-semibold text-[#737373] hover:text-[#141414]"
            >
              Cancel
            </button>
            {activeTab === 'library' && (
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedItem}
                className="px-5 py-2 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b] disabled:opacity-50 shadow-sm transition-colors"
              >
                Insert Selected Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
