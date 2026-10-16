import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, MapPin, X } from 'lucide-react';

export const AdminCustomersPage: React.FC<{ token: string }> = ({ token }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const fetchCustomers = () => {
    fetch('/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCustomers(data.customers || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingCustomer)
      });
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Customers Directory</h1>
          <p className="text-xs text-[#737373]">Manage international customer profiles, addresses, and lifetime order value.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-[#737373]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name or email..."
          className="w-full text-xs text-[#141414] focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Email & Phone</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Orders Count</th>
              <th className="py-3 px-4">Lifetime Spent</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAF9F6]">
                <td className="py-3 px-4 font-bold text-[#141414]">{c.name}</td>
                <td className="py-3 px-4">
                  <span className="block text-[#141414]">{c.email}</span>
                  <span className="text-[11px] text-[#737373]">{c.phone || 'No phone'}</span>
                </td>
                <td className="py-3 px-4">{c.city}, {c.country}</td>
                <td className="py-3 px-4 font-semibold">{c.ordersCount || 1} orders</td>
                <td className="py-3 px-4 font-extrabold text-[#087443]">${Number(c.totalSpent || 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setEditingCustomer(c)}
                    className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg font-semibold hover:bg-neutral-100"
                  >
                    Edit Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#141414]">Edit Customer Profile</h3>
              <button onClick={() => setEditingCustomer(null)} className="p-1 text-[#737373]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Customer Name</label>
                <input
                  type="text"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={editingCustomer.city}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-semibold">Country</label>
                  <input
                    type="text"
                    value={editingCustomer.country}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, country: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
