import React from 'react';

export const AdminPagesPage: React.FC<{ token: string }> = ({ token }) => {
  const pages = [
    { id: 1, title: 'About Laam Luxury', handle: 'about-us', status: 'Visible' },
    { id: 2, title: 'Global Size Guide', handle: 'size-guide', status: 'Visible' },
    { id: 3, title: 'Shipping & Customs Policy', handle: 'shipping-policy', status: 'Visible' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Online Store Pages</h1>
          <p className="text-xs text-[#737373]">Manage content pages such as About Us, Size Guides, and FAQ.</p>
        </div>
        <button className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold">Add Page</button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Handle</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {pages.map(p => (
              <tr key={p.id} className="hover:bg-[#FAF9F6]">
                <td className="py-3 px-4 font-bold text-[#141414]">{p.title}</td>
                <td className="py-3 px-4 font-mono text-[#737373]">/{p.handle}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] rounded font-semibold text-[10px]">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
