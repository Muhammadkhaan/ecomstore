import React from 'react';
import { Image, Upload } from 'lucide-react';
import { PRODUCTS } from '../../data/products.ts';

export const AdminMediaPage: React.FC<{ token: string }> = ({ token }) => {
  const mediaItems = PRODUCTS.slice(0, 8).map((p, idx) => ({
    id: idx,
    name: `editorial-${idx + 1}.jpg`,
    url: p.image,
    size: '2.4 MB'
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Media Library</h1>
          <p className="text-xs text-[#737373]">Manage product high-res editorial imagery and campaign videos.</p>
        </div>
        <button className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-2xl border border-[#E5E5E5] space-y-2 shadow-sm">
            <img src={item.url} alt={item.name} className="w-full h-36 object-cover rounded-xl" />
            <div className="flex items-center justify-between text-[11px] text-[#737373]">
              <span className="truncate font-medium text-[#141414]">{item.name}</span>
              <span>{item.size}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
