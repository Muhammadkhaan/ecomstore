import React, { useEffect, useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';

export const AdminInventoryPage: React.FC<{ token: string }> = ({ token }) => {
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/inventory', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setInventory(data.inventory || []))
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Inventory Control</h1>
          <p className="text-xs text-[#737373]">Track stock levels across warehouse and retail locations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">Product Title</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Available Stock</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                <td className="py-3 px-4 font-bold text-[#141414]">{item.title}</td>
                <td className="py-3 px-4 text-[#737373] font-mono">{item.sku}</td>
                <td className="py-3 px-4 font-extrabold text-[#087443]">{item.inventory || 50} units</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] rounded font-semibold text-[10px]">
                    In Stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
