import React, { useState, useEffect } from 'react';
import { Image, Upload, Check, Search, X } from 'lucide-react';

interface MediaPickerModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ token, isOpen, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.media) setMediaItems(data.media);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (data.media) {
        onSelect(data.media.url);
        onClose();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const filtered = mediaItems.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E5E5E5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[#141414]">Select Media Asset</h3>
            <div className="flex items-center bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeTab === 'library' ? 'bg-[#141414] text-white' : 'text-[#737373]'}`}
              >
                Media Library
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeTab === 'upload' ? 'bg-[#141414] text-white' : 'text-[#737373]'}`}
              >
                Upload New
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-[#737373] hover:text-[#141414] font-bold text-lg p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'library' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search uploaded assets..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col group ${selectedUrl === item.url ? 'border-[#141414] ring-2 ring-[#141414]/20' : 'border-[#E5E5E5] hover:border-neutral-400'}`}
                  >
                    <div className="aspect-square bg-[#FAF9F6] relative overflow-hidden">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {selectedUrl === item.url && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#141414] text-white rounded-full flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-[11px] font-bold text-[#141414] truncate">
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#D1D1D1] rounded-3xl p-12 text-center space-y-4 bg-[#FAF9F6]">
              <div className="w-12 h-12 bg-white text-[#141414] rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#141414]">Upload image from your computer</p>
                <p className="text-xs text-[#737373]">PNG, JPG, WEBP, GIF up to 10MB</p>
              </div>
              <label className="inline-block px-6 py-3 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#2b2b2b] cursor-pointer shadow-sm">
                <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                <input type="file" accept="image/*" onChange={handleUploadFiles} className="hidden" disabled={uploading} />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E5E5] bg-[#FAF9F6]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#E5E5E5] bg-white rounded-xl text-xs font-semibold text-[#737373] hover:text-[#141414]"
          >
            Cancel
          </button>
          {activeTab === 'library' && (
            <button
              onClick={() => {
                if (selectedUrl) {
                  onSelect(selectedUrl);
                  onClose();
                }
              }}
              disabled={!selectedUrl}
              className="px-5 py-2.5 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#2b2b2b] disabled:opacity-50 shadow-sm"
            >
              Select Asset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
