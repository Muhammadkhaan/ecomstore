import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Eye, Printer, Truck, CheckCircle2, X } from 'lucide-react';

interface AdminOrdersPageProps {
  token: string;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ token }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`/api/admin/orders?search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [search, token]);

  const handleUpdateStatus = async (orderId: string, fulfillmentStatus: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fulfillmentStatus })
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, fulfillmentStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Orders Management</h1>
          <p className="text-xs text-[#737373]">Manage customer orders, DHL express shipments, refunds, and printable invoices.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-[#737373]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders by ID, customer name, email..."
          className="w-full text-xs text-[#141414] focus:outline-none"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Tracking / Shipping</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-[#737373]">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-[#737373]">No orders found.</td></tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#141414]">{ord.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#141414] block">{ord.customer_name || ord.customerName}</span>
                      <span className="text-[11px] text-[#737373]">{ord.email}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#141414]">${Number(ord.total).toFixed(2)}</td>
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
                    <td className="py-3 px-4 font-mono text-[11px] text-[#737373]">
                      {ord.tracking_number || ord.trackingNumber || 'DHL Pending'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsInvoiceOpen(true);
                        }}
                        className="p-1.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg text-[#737373] hover:text-[#141414]"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[90vh]">
            <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm tracking-wide">Order Details: {selectedOrder.id}</h3>
                <p className="text-xs text-white/70">Placed on {new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-2 gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E5E5]">
                <div>
                  <span className="font-bold text-[#737373] uppercase block text-[10px] mb-1">Customer Details</span>
                  <p className="font-bold text-[#141414]">{selectedOrder.customer_name || selectedOrder.customerName}</p>
                  <p className="text-[#525252]">{selectedOrder.email}</p>
                  <p className="text-[#525252]">{selectedOrder.phone || 'No phone'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#737373] uppercase block text-[10px] mb-1">Shipping Address</span>
                  <p className="text-[#141414]">{selectedOrder.shipping_address || selectedOrder.shippingAddress}</p>
                  <p className="text-[#525252]">{selectedOrder.shipping_city || selectedOrder.shippingCity}, {selectedOrder.shipping_country || selectedOrder.shippingCountry}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#141414] mb-2 uppercase tracking-wider">Ordered Items</h4>
                <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] border-b border-[#E5E5E5] text-[#737373]">
                      <tr>
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3">Qty</th>
                        <th className="py-2 px-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : (selectedOrder.items || [])).map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-[#141414]">{item.title || item.name}</td>
                          <td className="py-2 px-3">{item.size || 'M'}</td>
                          <td className="py-2 px-3">{item.quantity || 1}</td>
                          <td className="py-2 px-3 text-right font-bold">${Number(item.price || item.product?.priceUSD || 195).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E5E5]">
                <div>
                  <span className="font-semibold text-[#737373] block">Fulfillment Status</span>
                  <span className="font-bold text-[#087443]">{selectedOrder.fulfillment_status || selectedOrder.fulfillmentStatus}</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Fulfilled')}
                    className="px-3 py-1.5 bg-[#087443] text-white rounded-lg font-semibold hover:opacity-90"
                  >
                    Mark Fulfilled
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(selectedOrder);
                      setIsInvoiceOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#141414] text-white rounded-lg font-semibold hover:bg-[#2b2b2b]"
                  >
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {isInvoiceOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl p-8 space-y-6 text-xs text-[#141414] relative">
            <div className="flex justify-between items-start border-b border-[#E5E5E5] pb-6">
              <div>
                <h2 className="text-2xl font-serif font-extrabold uppercase tracking-widest">LAAM</h2>
                <p className="text-[11px] text-[#737373] mt-1">Global Luxury Designer E-Commerce Portal</p>
                <p className="text-[11px] text-[#737373]">concierge@laam.com · www.laam.com</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-base">INVOICE #{selectedOrder.id}</h3>
                <p className="text-[#737373]">Date: {new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleDateString()}</p>
                <p className="text-[#087443] font-semibold mt-1">Payment: Verified & Paid</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="font-bold text-[#737373] uppercase block text-[10px] mb-1">Billed To:</span>
                <p className="font-bold text-sm">{selectedOrder.customer_name || selectedOrder.customerName}</p>
                <p>{selectedOrder.email}</p>
                <p>{selectedOrder.shipping_address || selectedOrder.shippingAddress}</p>
                <p>{selectedOrder.shipping_city || selectedOrder.shippingCity}, {selectedOrder.shipping_country || selectedOrder.shippingCountry}</p>
              </div>
              <div>
                <span className="font-bold text-[#737373] uppercase block text-[10px] mb-1">Shipping & Tracking:</span>
                <p className="font-semibold">DHL Express Global Courier</p>
                <p className="font-mono">Tracking: {selectedOrder.tracking_number || selectedOrder.trackingNumber || 'DHL-984321'}</p>
              </div>
            </div>

            <table className="w-full border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
              <thead className="bg-[#FAF9F6] font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-left">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Size</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : (selectedOrder.items || [])).map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-medium">{item.title || item.name}</td>
                    <td className="py-2.5 px-3 text-center">{item.size || 'M'}</td>
                    <td className="py-2.5 px-3 text-center">{item.quantity || 1}</td>
                    <td className="py-2.5 px-3 text-right font-bold">${Number(item.price || 195).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-[#737373]"><span>Subtotal:</span><span>${Number(selectedOrder.total).toFixed(2)}</span></div>
                <div className="flex justify-between text-[#737373]"><span>DHL Express Shipping:</span><span>$0.00</span></div>
                <div className="flex justify-between font-extrabold text-sm text-[#141414] pt-2 border-t"><span>Total Paid:</span><span>${Number(selectedOrder.total).toFixed(2)}</span></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[#E5E5E5] print:hidden">
              <button
                onClick={() => setIsInvoiceOpen(false)}
                className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-[#737373] font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#141414] text-white rounded-xl font-semibold hover:bg-[#2b2b2b]"
              >
                Print / Download PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
