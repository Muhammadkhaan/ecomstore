import React, { useState } from 'react';
import { Menu, Save, CheckCircle2 } from 'lucide-react';

interface AdminNavigationPageProps {
  token: string;
}

export const AdminNavigationPage: React.FC<AdminNavigationPageProps> = ({ token }) => {
  const [announcement, setAnnouncement] = useState('Complimentary Worldwide Express DHL Shipping on Orders Over $250 · Use Code: LAAM10 for 10% Off');
  const [menuItems, setMenuItems] = useState([
    { label: 'Pret', link: '/collections/pret' },
    { label: 'Festive', link: '/collections/festive' },
    { label: 'Bridal', link: '/collections/bridal' },
    { label: 'Kaftan', link: '/collections/kaftan' },
    { label: 'Velvet', link: '/collections/velvet' },
  ]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleSave = () => {
    showSuccess('Navigation menus and announcement bar updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Navigation & Menus</h1>
          <p className="text-xs text-[#737373]">Manage header navigation menus, dropdown links, and announcement bar notifications.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Navigation</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Announcement Bar</h2>
        <div>
          <label className="block text-xs font-semibold text-[#737373] mb-1">Top Banner Announcement Text</label>
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs text-[#141414]"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#141414] uppercase tracking-wider">Main Header Navigation Menu</h2>
        <div className="space-y-3">
          {menuItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const updated = [...menuItems];
                  updated[idx].label = e.target.value;
                  setMenuItems(updated);
                }}
                placeholder="Label"
                className="flex-1 px-3.5 py-2 border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#141414]"
              />
              <input
                type="text"
                value={item.link}
                onChange={(e) => {
                  const updated = [...menuItems];
                  updated[idx].link = e.target.value;
                  setMenuItems(updated);
                }}
                placeholder="URL Link"
                className="flex-1 px-3.5 py-2 border border-[#E5E5E5] rounded-xl text-xs font-mono text-[#737373]"
              />
              <button
                onClick={() => setMenuItems(menuItems.filter((_, i) => i !== idx))}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => setMenuItems([...menuItems, { label: 'New Link', link: '/collections' }])}
            className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E5E5] text-[#141414] rounded-xl text-xs font-semibold hover:bg-neutral-100"
          >
            + Add Menu Item
          </button>
        </div>
      </div>
    </div>
  );
};
