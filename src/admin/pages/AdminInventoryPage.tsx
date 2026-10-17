import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, AlertTriangle, CheckCircle2, Sliders, History, Search, ArrowUpDown, X } from 'lucide-react';

interface AdminInventoryPageProps {
  token: string;
}

export const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({ token }) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Adjustment Modal
  const [adjustProduct, setAdjustProduct] = useState<any | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState('10');
  const [adjustmentReason, setAdjustmentReason] = useState('Restock Shipment');
  const [selectedVariant, setSelectedVariant] = useState('M');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/inventory', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/admin/inventory/history', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([invData, histData]) => {
        setInventory(invData.inventory || []);
        setHistory(histData.history || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleOpenAdjust = (prod: any) => {
    setAdjustProduct(prod);
    setAdjustmentQty('10');
    setAdjustmentReason('Restock Shipment');
    setSelectedVariant(prod.variants?.[0] || 'Default');
    setErrorMessage(null);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;
    setErrorMessage(null);

    const qty = Number(adjustmentQty);
    if (isNaN(qty)) {
      setErrorMessage('Please enter a valid numeric quantity.');
      return;
    }

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: adjustProduct.id,
          adjustment: qty,
          reason: adjustmentReason,
          variant: selectedVariant
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust inventory');

      showSuccess(`Successfully adjusted stock for "${adjustProduct.title}" by ${qty >= 0 ? `+${qty}` : qty}`);
      setAdjustProduct(null);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const inv = Number(item.inventory ?? 50);
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.sku?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (stockFilter === 'in-stock' && inv <= 0) return false;
    if (stockFilter === 'low-stock' && (inv <= 0 || inv >= 10)) return false;
    if (stockFilter === 'out-of-stock' && inv > 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Inventory Control & Stock Logs</h1>
          <p className="text-xs text-[#737373]">Track stock quantities by SKU and variant, execute adjustments with audit reasons.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#E5E5E5] text-xs">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${activeTab === 'stock' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'}`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${activeTab === 'history' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:text-[#141414]'}`}
          >
            Audit History ({history.length})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {activeTab === 'stock' ? (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-80">
              <Search className="w-4 h-4 text-[#737373] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory by title or SKU..."
                className="w-full text-xs text-[#141414] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] focus:outline-none"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (&lt;10)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
                  <tr>
                    <th className="py-3 px-4">Product Title</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Variants</th>
                    <th className="py-3 px-4">Available Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-[#737373]">Loading inventory...</td></tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-[#737373]">No inventory records match your criteria.</td></tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const inv = Number(item.inventory ?? 50);
                      const isLow = inv > 0 && inv < 10;
                      const isOut = inv <= 0;
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#141414]">{item.title}</td>
                          <td className="py-3 px-4 text-[#737373] font-mono">{item.sku || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(item.variants || ['XS', 'S', 'M', 'L', 'XL']).slice(0, 3).map((v: string) => (
                                <span key={v} className="px-1.5 py-0.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded text-[10px] font-semibold">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-extrabold">
                            <span className={isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-[#087443]'}>
                              {inv} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                              isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-[#D3F8DF] text-[#087443]'
                            }`}>
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="px-3 py-1.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] shadow-sm transition-colors"
                            >
                              Adjust Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#FAF9F6] border-b border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#737373]">
            <span>Recent Stock Adjustments & Audit Logs</span>
            <span>Showing last {history.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU / Variant</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Staff / Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-[#737373]">No inventory adjustments recorded yet.</td></tr>
                ) : (
                  history.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4 text-[#737373]">{new Date(log.createdAt || Date.now()).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-[#141414]">{log.productTitle}</td>
                      <td className="py-3 px-4 font-mono text-[#737373]">{log.sku} ({log.variant || 'Default'})</td>
                      <td className="py-3 px-4 font-extrabold">
                        <span className={Number(log.adjustment) > 0 ? 'text-[#087443]' : 'text-red-600'}>
                          {Number(log.adjustment) > 0 ? `+${log.adjustment}` : log.adjustment} (New: {log.newStock})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{log.reason}</td>
                      <td className="py-3 px-4 text-[#737373] font-mono">{log.userEmail || 'admin@laam.com'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm tracking-wide">Adjust Inventory: {adjustProduct.title}</h3>
              <button onClick={() => setAdjustProduct(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E5E5E5] flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#737373] block">Current Stock:</span>
                  <span className="font-bold text-sm text-[#141414]">{adjustProduct.inventory ?? 50} units</span>
                </div>
                <div>
                  <span className="text-[#737373] block">SKU:</span>
                  <span className="font-mono font-bold text-[#141414]">{adjustProduct.sku}</span>
                </div>
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Select Variant / Size</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                >
                  {(adjustProduct.variants || ['XS', 'S', 'M', 'L', 'XL']).map((v: string) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Quantity Adjustment (+ to add, - to subtract)</label>
                <input
                  type="number"
                  required
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  placeholder="e.g. 15 or -5"
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-bold text-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Adjustment Reason / Audit Note</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                >
                  <option value="Restock Shipment">Restock Shipment</option>
                  <option value="Inventory Correction">Inventory Correction</option>
                  <option value="Damaged / Defective">Damaged / Defective</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Manual Sale Adjustment">Manual Sale Adjustment</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
