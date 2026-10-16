import React, { useEffect, useState } from 'react';
import { Plus, Layers, Filter } from 'lucide-react';

export const AdminCollectionsPage: React.FC<{ token: string }> = ({ token }) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'manual' | 'rule'>('manual');
  const [rule, setRule] = useState('category = festive');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1566737236500-c8ac43014a67');

  const fetchCollections = () => {
    fetch('/api/admin/collections', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCollections(data.collections || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCollections();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, type, rule: type === 'rule' ? rule : '', image })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Collections & Curations</h1>
          <p className="text-xs text-[#737373]">Manage manual and automated rule-based collections for your storefront.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((col) => (
          <div key={col.id} className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm space-y-3 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <img src={col.image} alt={col.title} className="w-full h-40 object-cover rounded-xl" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E04F16]">
                  {col.type === 'rule' ? 'Automated Rule' : 'Manual Selection'}
                </span>
                <h3 className="font-bold text-sm text-[#141414] mt-0.5">{col.title}</h3>
                {col.type === 'rule' && (
                  <p className="text-[11px] text-[#737373] mt-1 bg-[#FAF9F6] p-2 rounded-lg border font-mono">
                    Rule: {col.rule}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs text-[#087443] font-semibold pt-2 border-t border-[#E5E5E5]">
              Status: {col.status || 'Active'}
            </span>
          </div>
        ))}
      </div>

      {/* Create Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-[#E5E5E5]">
            <h3 className="text-base font-bold text-[#141414]">Create Collection</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Collection Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Winter Wedding Velvet Edit"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414]"
                />
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Collection Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl bg-white"
                >
                  <option value="manual">Manual Selection</option>
                  <option value="rule">Automated Rule-Based</option>
                </select>
              </div>

              {type === 'rule' && (
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Condition Rule</label>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => setRule(e.target.value)}
                    placeholder="e.g. category = bridal"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Cover Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                />
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
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
