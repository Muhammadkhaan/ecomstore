import React, { useEffect, useState } from 'react';
import { Plus, Layers, Edit2, Trash2, Globe, Sparkles, X, CheckCircle2, AlertTriangle, Search, Package, Code, Image as ImageIcon } from 'lucide-react';
import { SchemaManagerTab } from '../components/SchemaManagerTab.tsx';
import { MediaPickerModal } from '../components/MediaPickerModal.tsx';

interface AdminCollectionsPageProps {
  token: string;
}

export const AdminCollectionsPage: React.FC<AdminCollectionsPageProps> = ({ token }) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'schema'>('details');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [handle, setHandle] = useState('');
  const [type, setType] = useState<'manual' | 'rule'>('manual');
  const [rule, setRule] = useState('category = festive');
  const [status, setStatus] = useState('Active');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1566737236500-c8ac43014a67');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [assignedProducts, setAssignedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const fetchCollections = () => {
    setLoading(true);
    fetch('/api/admin/collections', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setCollections(data.collections || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchProducts = () => {
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, [token]);

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setTitle('');
    setDescription('');
    setHandle('');
    setType('manual');
    setRule('category = festive');
    setStatus('Active');
    setImage('https://images.unsplash.com/photo-1566737236500-c8ac43014a67');
    setSeoTitle('');
    setSeoDescription('');
    setAssignedProducts([]);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: any) => {
    setEditingCollection(col);
    setTitle(col.title || '');
    setDescription(col.description || '');
    setHandle(col.handle || '');
    setType(col.type || 'manual');
    setRule(col.rule || '');
    setStatus(col.status || 'Active');
    setImage(col.image || '');
    setSeoTitle(col.seoTitle || '');
    setSeoDescription(col.seoDescription || '');
    setAssignedProducts(Array.isArray(col.assignedProducts) ? col.assignedProducts : []);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleToggleProduct = (prodId: string) => {
    if (assignedProducts.includes(prodId)) {
      setAssignedProducts(assignedProducts.filter(id => id !== prodId));
    } else {
      setAssignedProducts([...assignedProducts, prodId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      handle,
      type,
      rule: type === 'rule' ? rule : '',
      status,
      image,
      seoTitle,
      seoDescription,
      assignedProducts
    };

    const url = editingCollection ? `/api/admin/collections/${editingCollection.id}` : '/api/admin/collections';
    const method = editingCollection ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save collection');
      setIsModalOpen(false);
      showSuccess(editingCollection ? 'Collection updated successfully!' : 'Collection created successfully!');
      fetchCollections();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete collection');
      showSuccess('Collection deleted successfully.');
      fetchCollections();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProductsToAssign = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Collections & Curations</h1>
          <p className="text-xs text-[#737373]">Manage manual and automated rule-based collections published on the storefront with assigned products.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Collection</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-[#737373] text-xs">Loading collections from database...</div>
      ) : collections.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E5E5E5] text-center text-[#737373] text-xs space-y-2">
          <Layers className="w-8 h-8 mx-auto text-[#737373]/50" />
          <p className="font-semibold">No collections created yet.</p>
          <button onClick={handleOpenCreate} className="px-4 py-2 bg-[#141414] text-white rounded-xl font-semibold">
            Create First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => {
            const countAssigned = Array.isArray(col.assignedProducts) ? col.assignedProducts.length : 0;
            return (
              <div key={col.id} className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="space-y-3 p-4">
                  <img src={col.image} alt={col.title} className="w-full h-48 object-cover rounded-xl border border-[#E5E5E5]" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#E04F16]">
                        {col.type === 'rule' ? 'Automated Rule' : `${countAssigned} Assigned Product${countAssigned === 1 ? '' : 's'}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        col.status === 'Active' ? 'bg-[#D3F8DF] text-[#087443]' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {col.status || 'Active'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#141414] mt-1 font-serif">{col.title}</h3>
                    <p className="text-xs text-[#737373] mt-1 line-clamp-2">{col.description || 'No description provided.'}</p>
                    {col.type === 'rule' && (
                      <div className="text-[11px] text-[#737373] mt-2 bg-[#FAF9F6] p-2 rounded-lg border font-mono">
                        Rule: {col.rule}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#737373]">/{col.handle || 'collection'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      className="p-1.5 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-white transition-colors"
                      title="Edit Collection"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="p-1.5 text-[#737373] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[90vh]">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm tracking-wide">
                {editingCollection ? `Edit Collection: ${editingCollection.title}` : 'Create New Collection'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#E5E5E5] bg-[#FAF9F6] px-6">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373] hover:text-[#141414]'
                }`}
              >
                Collection Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'products' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373] hover:text-[#141414]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Assigned Products ({assignedProducts.length})</span>
              </button>
              {editingCollection && (
                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'schema' ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#737373] hover:text-[#141414]'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Schema Markup</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 flex flex-col">
              <div className="p-6 space-y-4 text-xs flex-1">
                {activeTab === 'details' && (
                  <>
                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">Collection Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Winter Wedding Velvet Edit"
                        className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#737373] mb-1 font-semibold">Description</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Curated luxury fashion description..."
                        className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-[#141414]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Collection Type</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                        >
                          <option value="manual">Manual Selection</option>
                          <option value="rule">Automated Rule-Based</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl bg-white font-medium"
                        >
                          <option value="Active">Active (Published on Store)</option>
                          <option value="Draft">Draft (Hidden from Store)</option>
                        </select>
                      </div>
                    </div>

                    {type === 'rule' && (
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Condition Rule</label>
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => setRule(e.target.value)}
                          placeholder="e.g. category = festive"
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-mono"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">URL Handle / Slug</label>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="e.g. winter-wedding"
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#737373] font-semibold">Cover Image URL</label>
                          <button
                            type="button"
                            onClick={() => setIsMediaPickerOpen(true)}
                            className="text-[#E04F16] hover:underline flex items-center gap-1 font-semibold text-xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Select from Media Library
                          </button>
                        </div>
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#E5E5E5] pt-3 space-y-3">
                      <h4 className="font-bold text-[#141414]">SEO Settings</h4>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">SEO Title</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">SEO Meta Description</label>
                        <textarea
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                      <strong>Storefront Publication Rule:</strong> Only products with status <span className="font-semibold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">Active</span> will be visible on the public collection storefront. Draft and archived products remain hidden automatically.
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products by title or SKU to assign..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 border border-[#E5E5E5] rounded-xl text-xs"
                      />
                    </div>

                    <div className="border border-[#E5E5E5] rounded-xl divide-y divide-[#E5E5E5] max-h-72 overflow-y-auto">
                      {filteredProductsToAssign.length === 0 ? (
                        <div className="p-4 text-center text-[#737373]">No products match search.</div>
                      ) : (
                        filteredProductsToAssign.map(p => {
                          const isAssigned = assignedProducts.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleToggleProduct(p.id)}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                isAssigned ? 'bg-[#FAF9F6]' : 'hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image || (Array.isArray(p.images) && p.images[0]) || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67'}
                                  alt={p.title}
                                  className="w-10 h-10 object-cover rounded-lg border border-[#E5E5E5]"
                                />
                                <div>
                                  <div className="font-semibold text-[#141414]">{p.title}</div>
                                  <div className="text-[10px] text-[#737373] flex items-center gap-2 mt-0.5">
                                    <span>${p.price}</span>
                                    <span>•</span>
                                    <span>SKU: {p.sku || 'N/A'}</span>
                                    <span>•</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      p.status === 'Active' ? 'bg-[#D3F8DF] text-[#087443]' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {p.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => {}}
                                className="w-4 h-4 rounded border-[#E5E5E5]"
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="text-[11px] text-[#737373] text-right">
                      {assignedProducts.length} product(s) selected for this collection.
                    </div>
                  </div>
                )}

                {activeTab === 'schema' && editingCollection && (
                  <div>
                    <SchemaManagerTab
                      token={token}
                      referenceType="collection"
                      referenceId={editingCollection.id}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 bg-[#FAF9F6] border-t border-[#E5E5E5] shrink-0">
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
                  {editingCollection ? 'Update Collection' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        token={token}
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setImage(url)}
      />
    </div>
  );
};
