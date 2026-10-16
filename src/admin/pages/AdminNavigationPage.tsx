import React from 'react';

export const AdminNavigationPage: React.FC<{ token: string }> = ({ token }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-serif text-[#141414]">Navigation Menus</h1>
        <p className="text-xs text-[#737373]">Configure header menus, footer links, and collection categories.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
        <h3 className="font-bold text-sm text-[#141414]">Main Menu</h3>
        <div className="space-y-2 text-xs">
          {['All Collections', 'Luxury Pret', 'Festive Formals', 'Bridal Couture', 'Ready to Ship', 'Designers'].map((item, idx) => (
            <div key={idx} className="p-3 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl flex items-center justify-between">
              <span className="font-semibold text-[#141414]">{item}</span>
              <span className="text-[#737373]">Edit Link</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
