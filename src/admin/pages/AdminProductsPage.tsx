import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Edit2, Download, Upload, AlertTriangle, Check, X } from 'lucide-react';

interface AdminProductsPageProps {
  token: string;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ token }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [designer, setDesigner] = useState('LAAM Pret Couture');
  const [category, setCategory] = useState('pret');
  const [price, setPrice] = useState('195');
  const [compareAtPrice, setCompareAtPrice] = useState('250');
  const [costPrice, setCostPrice] = useState('80');
  const [sku, setSku] = useState('');
  const [inventory, setInventory] = useState('45');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Active');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1566737236500-c8ac43014a67');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    fetch(`/api/admin/products?search=${encodeURIComponent(search)}&category=${categoryFilter}&status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter, token]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('An exquisite designer luxury piece hand-crafted with pure raw silk and intricate tilla embroidery.');
    setDesigner('LAAM Pret Couture');
    setCategory('pret');
    setPrice('195');
    setCompareAtPrice('250');
    setCostPrice('80');
    setSku(`LAAM-${Math.floor(1000 + Math.random() * 9000)}`);
    setInventory('50');
    setStatus('Active');
    setImage('https://images.unsplash.com/photo-1566737236500-c8ac43014a67');
    setSeoTitle('');
    setSeoDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setTitle(prod.title || '');
    setDescription(prod.description || '');
    setDesigner(prod.designer || 'LAAM Pret Couture');
    setCategory(prod.category || 'pret');
    setPrice(String(prod.price || 195));
    setCompareAtPrice(String(prod.compareAtPrice || ''));
    setCostPrice(String(prod.costPrice || ''));
    setSku(prod.sku || '');
    setInventory(String(prod.inventory || 50));
    setStatus(prod.status || 'Active');
    setImage(prod.image || '');
    setSeoTitle(prod.seoTitle || '');
    setSeoDescription(prod.seoDescription || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      designer,
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: costPrice ? Number(costPrice) : null,
      sku,
      inventory: Number(inventory),
      status,
      image,
      seoTitle,
      seoDescription
    };

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action: string, newStatus?: string) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm(`Delete ${selectedIds.length} selected products?`)) return;

    try {
      await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, ids: selectedIds, status: newStatus })
      });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/admin/products/export', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Products Management</h1>
          <p className="text-xs text-[#737373]">Create, manage inventory, variants, SEO, and pricing for all luxury items.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] text-[#141414] rounded-xl text-xs font-semibold hover:bg-[#FAF9F6] flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-80">
          <Search className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, SKU..."
            className="w-full text-xs text-[#141414] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="pret">Pret</option>
            <option value="festive">Festive</option>
            <option value="bridal">Bridal</option>
            <option value="kaftan">Kaftan</option>
            <option value="velvet">Velvet</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#141414] text-white rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-lg">
          <span className="font-semibold">{selectedIds.length} products selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkAction('status', 'Active')}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkAction('status', 'Draft')}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Set Draft
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(products.map(p => p.id));
                      else setSelectedIds([]);
                    }}
                    checked={selectedIds.length === products.length && products.length > 0}
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Inventory</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-[#737373]">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-[#737373]">No products match your criteria.</td></tr>
              ) : (
                products.map((prod) => {
                  const isLowStock = prod.inventory < 10;
                  return (
                    <tr key={prod.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(prod.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, prod.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== prod.id));
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={prod.image} alt={prod.title} className="w-10 h-12 object-cover rounded-lg border border-[#E5E5E5]" />
                        <div>
                          <span className="font-bold text-[#141414] block line-clamp-1">{prod.title}</span>
                          <span className="text-[11px] text-[#737373]">{prod.designer}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          prod.status === 'Active' ? 'bg-[#D3F8DF] text-[#087443]' : prod.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {prod.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className={isLowStock ? 'text-red-600 font-bold' : 'text-[#087443]'}>
                            {prod.inventory ?? 50} in stock
                          </span>
                          {isLowStock && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#141414]">${Number(prod.price).toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-[#737373]">{prod.sku}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-neutral-100 transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 text-[#737373] hover:text-[#B91C1C] rounded-lg hover:bg-red-50 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Product Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[90vh]">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm tracking-wide">
                {editingProduct ? 'Edit Product Details' : 'Create New Luxury Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Product Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PD Formal Embellished Silk Kaftan"
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-[#141414]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Designer House</label>
                  <input
                    type="text"
                    value={designer}
                    onChange={(e) => setDesigner(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl bg-white"
                  >
                    <option value="pret">Pret</option>
                    <option value="festive">Festive</option>
                    <option value="bridal">Bridal</option>
                    <option value="kaftan">Kaftan</option>
                    <option value="velvet">Velvet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-bold text-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Compare Price ($)</label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Cost Price ($)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Inventory</label>
                  <input
                    type="number"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-bold text-[#087443]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Image URL</label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-3 space-y-3">
                <h4 className="font-bold text-[#141414]">Search Engine Optimization (SEO)</h4>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">SEO Page Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom title for Google search results"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Brief description for search engines..."
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-md"
                >
                  {editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
