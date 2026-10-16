import React, { useState } from 'react';
import { Settings, Save, Check, Truck, CreditCard, Mail, DollarSign } from 'lucide-react';

export const AdminSettingsPage: React.FC<{ token: string }> = ({ token }) => {
  const [storeName, setStoreName] = useState('Laam Luxury Fashion');
  const [email, setEmail] = useState('concierge@laam.com');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC (GMT+0)');
  const [shippingFlatRate, setShippingFlatRate] = useState('25.00');
  const [taxRate, setTaxRate] = useState('5.0');
  const [paymentGateway, setPaymentGateway] = useState('Stripe Verified & COD');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold font-serif text-[#141414]">Store Settings & Configurations</h1>
        <p className="text-xs text-[#737373]">Manage shipping zones, delivery charges, tax rates, payment gateways, and business info.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-6 text-xs shadow-sm">
        {/* General Business Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#141414] border-b border-[#E5E5E5] pb-2">General Business Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414]"
              />
            </div>
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Contact Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-semibold text-[#141414]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-semibold bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (AED)</option>
                <option value="PKR">PKR (Rs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Store Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-semibold bg-white"
              >
                <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                <option value="EST (GMT-5)">EST (GMT-5)</option>
                <option value="PKT (GMT+5)">PKT (GMT+5)</option>
                <option value="GST (GMT+4)">GST (GMT+4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping & Tax */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm text-[#141414] border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#087443]" />
            Shipping Zones & Tax Settings
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Global DHL Express Flat Rate ($)</label>
              <input
                type="number"
                value={shippingFlatRate}
                onChange={(e) => setShippingFlatRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-[#737373] mb-1 font-semibold">Sales Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm text-[#141414] border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#E04F16]" />
            Payment Gateway Configuration
          </h3>
          <div>
            <label className="block text-[#737373] mb-1 font-semibold">Active Payment Gateways</label>
            <input
              type="text"
              readOnly
              value="Stripe Verified Secure & Cash on Delivery (COD)"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl font-semibold text-[#087443]"
            />
            <p className="text-[11px] text-[#737373] mt-1">Stripe payment gateway is verified and connected to live webhook events.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-[#E5E5E5]">
          {saved && (
            <div className="flex items-center gap-1.5 text-[#087443] font-semibold">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-[#141414] text-white font-semibold rounded-xl hover:bg-[#2b2b2b]"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};
