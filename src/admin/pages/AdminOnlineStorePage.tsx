import React, { useEffect, useState } from 'react';
import { Globe, Plus, Trash2, ArrowUp, ArrowDown, Eye, Smartphone, Monitor, Save, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface AdminOnlineStorePageProps {
  token: string;
}

export const AdminOnlineStorePage: React.FC<AdminOnlineStorePageProps> = ({ token }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const fetchSections = () => {
    setLoading(true);
    fetch('/api/admin/storefront/sections', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setSections(data.sections || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSections();
  }, [token]);

  const handleSaveSections = async () => {
    try {
      const res = await fetch('/api/admin/storefront/sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sections })
      });
      if (!res.ok) throw new Error('Failed to save sections');
      showSuccess('Homepage sections published to MySQL & Storefront successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newSecs = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSecs.length) return;
    const temp = newSecs[index];
    newSecs[index] = newSecs[targetIdx];
    newSecs[targetIdx] = temp;
    setSections(newSecs);
  };

  const handleToggleEnable = (index: number) => {
    const newSecs = [...sections];
    newSecs[index].enabled = !newSecs[index].enabled;
    setSections(newSecs);
  };

  const handleDelete = (index: number) => {
    if (!confirm('Remove this homepage section?')) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleAddSection = (type: string) => {
    const newSec = {
      id: `sec-${Date.now()}`,
      type,
      name: type === 'hero' ? 'New Hero Banner' : type === 'product_grid' ? 'Featured Product Grid' : 'Promotional Banner',
      enabled: true,
      position: sections.length + 1,
      content: {
        title: 'New Editorial Collection',
        subtitle: 'Explore exquisite handcrafted luxury ensembles.',
        buttonText: 'Shop Collection',
        buttonLink: '/collections'
      }
    };
    setSections([...sections, newSec]);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Homepage Visual Builder</h1>
          <p className="text-xs text-[#737373]">Customize homepage sections, hero banners, product grids, and publish live to MySQL.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E5E5E5]">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-[#141414] text-white' : 'text-[#737373]'}`}
              title="Desktop Preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-[#141414] text-white' : 'text-[#737373]'}`}
              title="Mobile Preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSaveSections}
            className="px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section List & Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Active Homepage Sections ({sections.length})</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddSection('hero')}
                  className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-semibold hover:bg-neutral-100"
                >
                  + Add Hero
                </button>
                <button
                  onClick={() => handleAddSection('product_grid')}
                  className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-semibold hover:bg-neutral-100"
                >
                  + Add Grid
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-[#737373] text-xs">Loading homepage sections...</div>
            ) : sections.length === 0 ? (
              <div className="p-8 text-center text-[#737373] text-xs">No sections configured.</div>
            ) : (
              <div className="space-y-3">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className={`p-4 rounded-xl border transition-all ${sec.enabled ? 'bg-white border-[#E5E5E5]' : 'bg-[#FAF9F6] border-dashed border-[#ccc] opacity-75'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <input
                            type="text"
                            value={sec.name}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx].name = e.target.value;
                              setSections(updated);
                            }}
                            className="font-bold text-xs text-[#141414] bg-transparent focus:outline-none focus:border-b border-[#141414]"
                          />
                          <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Type: {sec.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleEnable(idx)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${sec.enabled ? 'bg-[#D3F8DF] text-[#087443]' : 'bg-neutral-200 text-neutral-600'}`}
                        >
                          {sec.enabled ? 'Enabled' : 'Hidden'}
                        </button>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 text-[#737373] hover:text-[#141414] disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 text-[#737373] hover:text-[#141414] disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-1 text-[#737373] hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section Content Fields */}
                    <div className="mt-3 pt-3 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Heading Title</label>
                        <input
                          type="text"
                          value={sec.content?.title || ''}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[idx].content.title = e.target.value;
                            setSections(updated);
                          }}
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-[#141414]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Subtitle / Text</label>
                        <input
                          type="text"
                          value={sec.content?.subtitle || ''}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[idx].content.subtitle = e.target.value;
                            setSections(updated);
                          }}
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-[#141414]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Live Storefront Preview</h2>
            <p className="text-xs text-[#737373]">Real-time preview of published layout changes.</p>

            <div className={`mx-auto bg-white border-8 border-[#141414] rounded-2xl overflow-hidden shadow-xl transition-all ${previewMode === 'mobile' ? 'max-w-xs' : 'w-full'}`}>
              <div className="bg-[#1A1A1A] text-white p-3 text-center text-[10px] font-mono tracking-widest uppercase">
                laam.com (Live Preview)
              </div>
              <div className="p-4 space-y-4 bg-[#FAF9F6] min-h-[400px]">
                {sections.filter(s => s.enabled).map((sec, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-xs space-y-2">
                    <span className="text-[9px] uppercase font-bold text-[#E04F16]">{sec.name}</span>
                    <h3 className="font-serif font-bold text-xs text-[#141414]">{sec.content?.title || 'Section Title'}</h3>
                    <p className="text-[10px] text-[#737373]">{sec.content?.subtitle || 'Subtitle text...'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
