import React, { useEffect, useState } from 'react';
import { Globe, Layout, Plus, Trash2, ArrowUp, ArrowDown, Eye, Save, Check, Smartphone, Monitor, FileText, Settings } from 'lucide-react';

interface AdminOnlineStorePageProps {
  token: string;
}

export const AdminOnlineStorePage: React.FC<AdminOnlineStorePageProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'theme' | 'pages'>('builder');
  const [sections, setSections] = useState<any[]>([]);
  const [themeSettings, setThemeSettings] = useState<any>({
    storeName: 'LAAM Luxury Fashion',
    announcementText: 'Complimentary Worldwide Express DHL Shipping on Orders Over $250 · Use Code: LAAM10 for 10% Off',
    logoText: 'LAAM',
    primaryColor: '#141414',
    accentColor: '#E04F16',
    socialLinks: { instagram: '', facebook: '', whatsapp: '' }
  });
  const [pages, setPages] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Fetch sections
    fetch('/api/admin/storefront/sections', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setSections(data.sections || []))
      .catch(err => console.error(err));

    // Fetch theme
    fetch('/api/admin/storefront/theme', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (data.settings) setThemeSettings(data.settings); })
      .catch(err => console.error(err));

    // Fetch pages
    fetch('/api/admin/storefront/pages', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setPages(data.pages || []))
      .catch(err => console.error(err));
  }, [token]);

  const handleSaveSections = async () => {
    try {
      const res = await fetch('/api/admin/storefront/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sections })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/storefront/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings: themeSettings })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setSections(newSections);
  };

  const handleToggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].enabled = !newSections[index].enabled;
    setSections(newSections);
  };

  const handleDeleteSection = (index: number) => {
    setSections(sections.filter((_, idx) => idx !== index));
  };

  const handleAddSection = (type: string) => {
    const newSec = {
      id: `sec-${Date.now()}`,
      type,
      name: `${type.replace('_', ' ').toUpperCase()} Section`,
      enabled: true,
      position: sections.length + 1,
      content: { heading: 'New Curated Section', subtitle: 'Add details here...' }
    };
    setSections([...sections, newSec]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Visual Storefront Management</h1>
          <p className="text-xs text-[#737373]">Customize homepage sections, header branding, announcement bar, navigation menus, and content pages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] text-[#141414] rounded-xl text-xs font-semibold hover:bg-[#FAF9F6] flex items-center gap-2 shadow-sm"
          >
            <Globe className="w-4 h-4" />
            <span>Preview Live Store</span>
          </button>
          <div className="flex bg-[#E5E5E5] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1.5 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-[#141414]' : 'text-[#737373]'}`}
            >
              <Monitor className="w-3.5 h-3.5 inline mr-1" /> Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1.5 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-[#141414]' : 'text-[#737373]'}`}
            >
              <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E5E5] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('builder')}
          className={`pb-3 mr-8 border-b-2 transition-colors ${activeTab === 'builder' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'}`}
        >
          Homepage Section Builder
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`pb-3 mr-8 border-b-2 transition-colors ${activeTab === 'theme' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'}`}
        >
          Header & Branding
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'pages' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373]'}`}
        >
          Pages, FAQs & Blogs
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#D3F8DF] text-[#087443] rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Changes published successfully to MySQL database and live storefront!</span>
        </div>
      )}

      {/* Tab 1: Homepage Section Builder */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-[#141414]">Active Homepage Sections</h3>
              <p className="text-xs text-[#737373]">Reorder, hide, or add reusable layout blocks.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => { if (e.target.value) { handleAddSection(e.target.value); e.target.value = ''; } }}
                defaultValue=""
                className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#141414]"
              >
                <option value="" disabled>+ Add Section...</option>
                <option value="hero">Hero Banner</option>
                <option value="slider">Image Slider</option>
                <option value="product_grid">Product Grid</option>
                <option value="promo">Promotional Banner</option>
                <option value="text_block">Text & Brand Story</option>
              </select>
              <button
                onClick={handleSaveSections}
                className="px-5 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Publish Changes</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                className={`bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center justify-between shadow-sm transition-all ${
                  !sec.enabled ? 'opacity-50 bg-neutral-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center font-bold text-xs text-[#737373]">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#141414]">{sec.name}</h4>
                    <span className="text-[10px] uppercase font-semibold text-[#E04F16] bg-[#E04F16]/10 px-2 py-0.5 rounded">
                      Type: {sec.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSection(index)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      sec.enabled ? 'bg-[#D3F8DF] text-[#087443]' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {sec.enabled ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => handleMoveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 border border-[#E5E5E5] rounded-lg hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1.5 border border-[#E5E5E5] rounded-lg hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(index)}
                    className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Header & Branding */}
      {activeTab === 'theme' && (
        <form onSubmit={handleSaveTheme} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4 max-w-2xl text-xs shadow-sm">
          <h3 className="font-bold text-sm text-[#141414]">Header, Announcement & Branding</h3>
          <div>
            <label className="block text-[#737373] mb-1 font-semibold">Announcement Bar Text</label>
            <input
              type="text"
              value={themeSettings.announcementText}
              onChange={(e) => setThemeSettings({ ...themeSettings, announcementText: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-[#737373] mb-1 font-semibold">Store Brand Logo Text</label>
            <input
              type="text"
              value={themeSettings.logoText}
              onChange={(e) => setThemeSettings({ ...themeSettings, logoText: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-bold tracking-widest text-[#141414]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Primary Theme Color</label>
              <input
                type="text"
                value={themeSettings.primaryColor}
                onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Accent Color</label>
              <input
                type="text"
                value={themeSettings.accentColor}
                onChange={(e) => setThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b]"
            >
              Save Branding & Theme
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Pages, Blogs & FAQs */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-[#141414]">Website Pages, Policies & Blogs</h3>
              <p className="text-xs text-[#737373]">Manage content pages such as About Us, Size Guides, and FAQ.</p>
            </div>
            <button className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold">
              + Add Page / Blog
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Handle</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-3 px-4 font-bold text-[#141414]">{p.title}</td>
                    <td className="py-3 px-4 font-mono text-[#737373]">/{p.handle}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{p.type}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] rounded font-semibold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
