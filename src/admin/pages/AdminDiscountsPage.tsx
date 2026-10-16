import React, { useEffect, useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';

export const AdminDiscountsPage: React.FC<{ token: string }> = ({ token }) => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('Percentage');
  const [value, setValue] = useState('10');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [minOrderValue, setMinOrderValue] = useState('100');

  const fetchDiscounts = () => {
    fetch('/api/admin/discounts', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setDiscounts(data.discounts || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDiscounts();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, type, value: Number(value), expiryDate, minOrderValue: Number(minOrderValue) })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCode('');
        fetchDiscounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Discounts & Coupon Codes</h1>
          <p className="text-xs text-[#737373]">Create percentage or fixed-amount discounts with expiry dates and minimum order limits.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discount Code</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Discount Value</th>
              <th className="py-3 px-4">Min. Order</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Usage</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {discounts.map((d) => (
              <tr key={d.id} className="hover:bg-[#FAF9F6]">
                <td className="py-3 px-4 font-bold text-[#141414] font-mono">{d.code}</td>
                <td className="py-3 px-4">{d.type}</td>
                <td className="py-3 px-4 font-extrabold text-[#087443]">
                  {d.type === 'Percentage' ? `${d.value}% Off` : `$${d.value} Off`}
                </td>
                <td className="py-3 px-4">${Number(d.minOrderValue || 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-[#737373]">{d.expiryDate || '2026-12-31'}</td>
                <td className="py-3 px-4 font-semibold">{d.usageCount || 0} times</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] rounded font-semibold text-[10px]">
                    {d.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#141414]">Create Discount Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#737373]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Discount Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. EID2026"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-mono uppercase font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl bg-white"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Min. Order Value ($)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b]"
                >
                  Save Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
