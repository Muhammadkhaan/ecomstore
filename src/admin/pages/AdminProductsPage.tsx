import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Edit2,
  Copy,
  Archive,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface AdminProductsPageProps {
  token: string;
  onNavigate: (path: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ token, onNavigate }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteProductTarget, setDeleteProductTarget] = useState<any | null>(null);
  const [viewProductTarget, setViewProductTarget] = useState<any | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/products?search=${encodeURIComponent(search)}&category=${categoryFilter}&status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load products from database');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter, token]);

  // Filter by stock & sort client side
  const filteredProducts = products.filter(p => {
    const inv = Number(p.inventory ?? 50);
    if (stockFilter === 'in-stock' && inv <= 0) return false;
    if (stockFilter === 'low-stock' && (inv <= 0 || inv >= 10)) return false;
    if (stockFilter === 'out-of-stock' && inv > 0) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'inventory-desc') return Number(b.inventory || 0) - Number(a.inventory || 0);
    // newest
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDuplicate = async (prod: any) => {
    try {
      const res = await fetch(`/api/admin/products/${prod.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to duplicate product');
      showSuccess(`Duplicated "${prod.title}" successfully.`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleArchive = async (prod: any) => {
    const newStatus = prod.status === 'Archived' ? 'Active' : 'Archived';
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update product status');
      showSuccess(`Product status changed to ${newStatus}.`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteProductTarget) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteProductTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      showSuccess(`Deleted "${deleteProductTarget.title}" successfully.`);
      setDeleteProductTarget(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBulkAction = async (action: string, newStatus?: string) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, ids: selectedIds, status: newStatus })
      });
      if (!res.ok) throw new Error('Bulk action failed');
      showSuccess(`Bulk action completed successfully for ${selectedIds.length} items.`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/admin/products/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Products Management</h1>
          <p className="text-xs text-[#737373]">Real-time MySQL product inventory, pricing, variants, and storefront publishing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] text-[#141414] rounded-xl text-xs font-semibold hover:bg-[#FAF9F6] flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/products/new')}
            className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Success & Error Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters, Search & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full lg:w-72">
          <Search className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, SKU..."
            className="w-full text-xs text-[#141414] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
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
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] focus:outline-none"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock (&lt;10)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#141414] focus:outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title-asc">Title: A-Z</option>
            <option value="inventory-desc">Inventory: High to Low</option>
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
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkAction('status', 'Draft')}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              Set Draft
            </button>
            <button
              onClick={() => handleBulkAction('status', 'Archived')}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
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
                      if (e.target.checked) setSelectedIds(paginatedProducts.map(p => p.id));
                      else setSelectedIds([]);
                    }}
                    checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Inventory</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#737373]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                      <span>Loading products from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#737373]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-[#737373]/60" />
                      <span className="font-semibold text-sm">No products found matching your search or filters.</span>
                      <button
                        onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); setStockFilter('all'); }}
                        className="mt-2 px-3.5 py-1.5 bg-[#141414] text-white rounded-xl text-xs font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const inv = Number(prod.inventory ?? 50);
                  const isLowStock = inv > 0 && inv < 10;
                  const isOut = inv <= 0;
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
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67'}
                          alt={prod.title}
                          className="w-10 h-12 object-cover rounded-lg border border-[#E5E5E5] shrink-0"
                        />
                        <div>
                          <span className="font-bold text-[#141414] block line-clamp-1">{prod.title}</span>
                          <span className="text-[11px] text-[#737373]">{prod.designer || 'LAAM Pret Couture'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          prod.status === 'Active' ? 'bg-[#D3F8DF] text-[#087443]' : prod.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {prod.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-[#737373]">
                        {prod.category || 'pret'}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className={isOut ? 'text-red-600 font-bold' : isLowStock ? 'text-amber-600 font-bold' : 'text-[#087443]'}>
                            {inv} in stock
                          </span>
                          {isLowStock && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                              Low
                            </span>
                          )}
                          {isOut && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                              Out
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#141414]">${Number(prod.price || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-[#737373]">{prod.sku || 'N/A'}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setViewProductTarget(prod)}
                          className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate(`/admin/products/edit/${prod.id}`)}
                          className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(prod)}
                          className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(prod)}
                          className="p-1.5 text-[#737373] hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          title={prod.status === 'Archived' ? 'Unarchive / Set Active' : 'Archive'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProductTarget(prod)}
                          className="p-1.5 text-[#737373] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Product"
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

        {/* Pagination Footer */}
        {!loading && filteredProducts.length > 0 && (
          <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#737373]">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 bg-white border border-[#E5E5E5] rounded-xl disabled:opacity-40 hover:bg-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#141414]" />
              </button>
              <span className="font-semibold text-[#141414]">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 bg-white border border-[#E5E5E5] rounded-xl disabled:opacity-40 hover:bg-neutral-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#141414]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Product Details Modal */}
      {viewProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[90vh]">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm tracking-wide">Product Overview: {viewProductTarget.title}</h3>
              <button onClick={() => setViewProductTarget(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex gap-4 items-start">
                <img src={viewProductTarget.image} alt="" className="w-24 h-32 object-cover rounded-xl border border-[#E5E5E5] shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#141414] font-serif">{viewProductTarget.title}</h4>
                  <p className="text-[#737373]">{viewProductTarget.description || 'No description provided.'}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div><span className="font-semibold text-[#737373]">Price:</span> ${viewProductTarget.price}</div>
                    <div><span className="font-semibold text-[#737373]">SKU:</span> {viewProductTarget.sku}</div>
                    <div><span className="font-semibold text-[#737373]">Inventory:</span> {viewProductTarget.inventory} in stock</div>
                    <div><span className="font-semibold text-[#737373]">Status:</span> {viewProductTarget.status}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E5E5] flex justify-end gap-3">
              <button
                onClick={() => {
                  const id = viewProductTarget.id;
                  setViewProductTarget(null);
                  onNavigate(`/admin/products/edit/${id}`);
                }}
                className="px-4 py-2 bg-[#141414] text-white font-semibold rounded-xl text-xs hover:bg-[#2b2b2b]"
              >
                Edit Product
              </button>
              <button
                onClick={() => setViewProductTarget(null)}
                className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#737373] font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E5E5E5] p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#141414]">Confirm Product Deletion</h3>
            </div>
            <p className="text-[#737373]">
              Are you sure you want to delete <strong className="text-[#141414]">"{deleteProductTarget.title}"</strong>? This action will permanently remove it from the MySQL database and storefront.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-md"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
