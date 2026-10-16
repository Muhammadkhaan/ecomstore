import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, ArrowUpRight } from 'lucide-react';

interface AdminDashboardOverviewProps {
  token: string;
  onNavigate: (path: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ token, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="p-8 text-xs text-[#737373]">Loading dashboard analytics...</div>;
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Dashboard Overview</h1>
          <p className="text-xs text-[#737373]">Welcome back. Here is your store performance summary today.</p>
        </div>
        <button
          onClick={() => onNavigate('/admin/products')}
          className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-4 h-4 text-[#087443]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#141414]">${(kpis.totalSales || 0).toLocaleString()}</span>
            <span className="text-xs font-semibold text-[#087443]">{kpis.salesGrowth || '+18%'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#E04F16]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#141414]">{kpis.totalOrders || 0}</span>
            <span className="text-xs text-[#737373]">Fulfilled & Pending</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Active Products</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#141414]">{kpis.totalProducts || 0}</span>
            <span className="text-xs text-[#087443]">In Stock</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#141414]">{kpis.conversionRate || '3.4%'}</span>
            <span className="text-xs font-semibold text-[#087443]">+0.4% this week</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#141414]">Recent Customer Orders</h3>
          <button
            onClick={() => onNavigate('/admin/orders')}
            className="text-xs font-semibold text-[#087443] hover:underline"
          >
            View All Orders →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {(data?.recentOrders || []).map((ord: any) => (
                <tr key={ord.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#141414]">{ord.id}</td>
                  <td className="py-3 px-4 font-medium text-[#141414]">{ord.customer_name || ord.customerName}</td>
                  <td className="py-3 px-4 font-bold text-[#141414]">${Number(ord.total).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] rounded font-semibold text-[10px]">
                      {ord.payment_status || ord.paymentStatus || 'Paid'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      (ord.fulfillment_status || ord.fulfillmentStatus) === 'Fulfilled' ? 'bg-[#D3F8DF] text-[#087443]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.fulfillment_status || ord.fulfillmentStatus || 'Unfulfilled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#737373]">{new Date(ord.created_at || ord.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
