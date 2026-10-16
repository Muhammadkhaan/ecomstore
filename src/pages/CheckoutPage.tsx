import React, { useState } from 'react';
import {
  CheckCircle,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { CartItem, CurrencyCode, OrderDetails } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface CheckoutPageProps {
  items: CartItem[];
  currency: CurrencyCode;
  discountPercentage: number;
  onOrderSuccess: (order: OrderDetails) => void;
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  currency,
  discountPercentage,
  onOrderSuccess,
  onNavigate,
}) => {
  const [formData, setFormData] = useState({
    name: 'Farah Ahmed',
    email: 'farah.ahmed@example.com',
    phone: '+1 (555) 789-2140',
    address: '880 Fifth Avenue, Suite 12',
    city: 'New York',
    country: 'United States',
    postalCode: '10021',
  });

  const [shippingMethod, setShippingMethod] = useState<'dhl-express' | 'standard'>('dhl-express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'apple-pay'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const curr = CURRENCIES[currency];

  const subtotalUSD = items.reduce(
    (sum, item) => sum + item.product.priceUSD * item.quantity,
    0
  );
  const isFreeShipping = subtotalUSD >= 250;
  const shippingFeeUSD = shippingMethod === 'dhl-express' ? (isFreeShipping ? 0 : 25) : 15;
  const discountUSD = (subtotalUSD * discountPercentage) / 100;
  const totalUSD = Math.max(0, subtotalUSD - discountUSD + shippingFeeUSD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `LAAM-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `DHL-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const order: OrderDetails = {
        orderId,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingCountry: formData.country,
        shippingMethod,
        paymentMethod,
        items,
        subtotal: subtotalUSD * curr.rate,
        shippingFee: shippingFeeUSD * curr.rate,
        discount: discountUSD * curr.rate,
        total: totalUSD * curr.rate,
        currency,
        trackingNumber,
        estimatedDelivery: '3–5 Business Days via DHL Express',
        placedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      setConfirmedOrder(order);
      setIsSubmitting(false);
      onOrderSuccess(order);
    }, 1200);
  };

  const copyTracking = () => {
    if (confirmedOrder) {
      navigator.clipboard?.writeText(confirmedOrder.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="p-8 bg-white border border-[#E5E5E5] rounded-2xl shadow-laam-sm text-center space-y-4">
          <div className="w-16 h-16 bg-[#D3F8DF] text-[#087443] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#087443]">
            Payment Verified & Dispatched to Atelier
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
            Order #{confirmedOrder.orderId} Confirmed
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] max-w-md mx-auto leading-relaxed">
            Thank you, {confirmedOrder.customerName}. Your luxury designer pieces are being packaged with designer authenticity tags.
          </p>

          {/* Tracking Card */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs max-w-lg mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 bg-[#087443] text-white rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-[#141414] block">DHL Worldwide Express</span>
                <span className="text-[#737373] font-mono text-[11px]">
                  {confirmedOrder.trackingNumber}
                </span>
              </div>
            </div>
            <button
              onClick={copyTracking}
              className="px-3 py-1.5 bg-white border border-[#D6D6D6] hover:border-[#141414] text-xs font-medium rounded-lg flex items-center gap-1.5"
            >
              {copiedTracking ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#087443]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Copy Tracking</span>
                </>
              )}
            </button>
          </div>

          {/* Order Breakdown */}
          <div className="border border-[#E5E5E5] rounded-xl overflow-hidden divide-y divide-[#E5E5E5] text-xs text-left max-w-lg mx-auto mt-6">
            <div className="p-3 bg-[#FAF9F6] font-bold text-[#141414] flex justify-between">
              <span>Ordered Outfits ({confirmedOrder.items.length})</span>
              <span>Total</span>
            </div>
            {confirmedOrder.items.map((i) => (
              <div key={i.id} className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={i.product.image} alt={i.product.name} className="w-10 h-14 object-cover rounded bg-[#FAF9F6]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#737373] block">{i.product.designer}</span>
                    <span className="font-medium font-rubik text-[#141414]">{i.product.name}</span>
                    <span className="text-[11px] text-[#525252] block">Size: {i.selectedSize} · Qty: {i.quantity}</span>
                  </div>
                </div>
                <span className="font-bold tabular-nums text-[#141414]">
                  {curr.format(i.product.priceUSD * curr.rate * i.quantity)}
                </span>
              </div>
            ))}
            <div className="p-3.5 bg-[#FAF9F6] space-y-1">
              <div className="flex justify-between text-[#525252]">
                <span>Shipping</span>
                <span className="text-[#087443] font-semibold">
                  {confirmedOrder.shippingFee === 0 ? 'FREE' : curr.format(confirmedOrder.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#141414] pt-1 border-t border-[#E5E5E5]">
                <span>Total Amount Paid</span>
                <span className="tabular-nums">{curr.format(confirmedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-3 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#737373]">
        <button onClick={() => onNavigate('/')} className="hover:text-[#141414]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <button onClick={() => onNavigate('/cart')} className="hover:text-[#141414]">
          Shopping Bag
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <span className="text-[#141414] font-medium">Checkout</span>
      </nav>

      <div className="border-b border-[#E5E5E5] pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
          Express International Checkout
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          100% Genuine Designer Garment Protection with DHL Doorstep Delivery
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checkout Steps Form (8 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
          {/* Step 1: Customer Contact & Address */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              1. Contact & Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-[#737373] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#737373] mb-1">Email for Receipt & Tracking</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#737373] mb-1">
                  Mobile / WhatsApp (For DHL SMS Tracking alerts)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#737373] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#737373] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#737373] mb-1">Destination Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Speed */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              2. Delivery Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'dhl-express'
                    ? 'border-[#087443] bg-[#D3F8DF]/20'
                    : 'border-[#D6D6D6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingSpeed"
                    checked={shippingMethod === 'dhl-express'}
                    onChange={() => setShippingMethod('dhl-express')}
                    className="accent-[#087443]"
                  />
                  <div>
                    <span className="font-bold text-[#141414] block">DHL Express Worldwide</span>
                    <span className="text-[#737373] text-[11px]">3–5 Business Days · Tracked Doorstep</span>
                  </div>
                </div>
                <span className="font-bold tabular-nums text-[#087443]">
                  {isFreeShipping ? 'FREE' : curr.format(25 * curr.rate)}
                </span>
              </label>

              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'standard'
                    ? 'border-[#087443] bg-[#D3F8DF]/20'
                    : 'border-[#D6D6D6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingSpeed"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-[#087443]"
                  />
                  <div>
                    <span className="font-bold text-[#141414] block">Standard Postal Delivery</span>
                    <span className="text-[#737373] text-[11px]">8–12 Business Days</span>
                  </div>
                </div>
                <span className="font-bold tabular-nums text-[#141414]">
                  {curr.format(15 * curr.rate)}
                </span>
              </label>
            </div>
          </div>

          {/* Step 3: Payment Options */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              3. Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#141414] bg-[#FAF9F6] font-bold text-[#141414]'
                    : 'border-[#D6D6D6] text-[#525252]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#141414]" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple-pay')}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'apple-pay'
                    ? 'border-[#141414] bg-[#FAF9F6] font-bold text-[#141414]'
                    : 'border-[#D6D6D6] text-[#525252]'
                }`}
              >
                <span className="font-bold">Pay</span>
                <span>Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#141414] bg-[#FAF9F6] font-bold text-[#141414]'
                    : 'border-[#D6D6D6] text-[#525252]'
                }`}
              >
                <Banknote className="w-4 h-4 text-[#087443]" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="col-span-2">
                  <label className="block text-[11px] text-[#737373] mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4000 1234 5678 9010"
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">Expiry Date</label>
                  <input
                    type="text"
                    defaultValue="09/28"
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">CVC Code</label>
                  <input
                    type="password"
                    defaultValue="892"
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg font-mono text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Place Order CTA */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b] transition-all shadow-laam-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Securing Order with Designer Atelier...</span>
              ) : (
                <>
                  <span>Place Order • {curr.format(totalUSD * curr.rate)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#737373]">
              <ShieldCheck className="w-4 h-4 text-[#087443]" />
              <span>Full Money Back & Designer Authenticity Guarantee</span>
            </div>
          </div>
        </form>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              Summary ({items.length} items)
            </h2>

            <div className="divide-y divide-[#E5E5E5] max-h-72 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={i.product.image} alt={i.product.name} className="w-10 h-14 object-cover rounded bg-white" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#737373] block">{i.product.designer}</span>
                      <span className="font-semibold font-rubik text-[#141414] line-clamp-1">{i.product.name}</span>
                      <span className="text-[#525252] text-[11px]">Size: {i.selectedSize} · Qty: {i.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold tabular-nums text-[#141414]">
                    {curr.format(i.product.priceUSD * curr.rate * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-[#E5E5E5]">
              <div className="flex justify-between text-[#525252]">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold text-[#141414]">{curr.format(subtotalUSD * curr.rate)}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-[#087443] font-semibold">
                  <span>Voucher Discount</span>
                  <span className="tabular-nums">-{curr.format(discountUSD * curr.rate)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#525252]">
                <span>DHL Express Shipping</span>
                <span className="tabular-nums font-semibold text-[#141414]">
                  {shippingFeeUSD === 0 ? <span className="text-[#087443]">FREE</span> : curr.format(shippingFeeUSD * curr.rate)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5E5E5] flex justify-between text-base font-bold text-[#141414]">
                <span>Total</span>
                <span className="tabular-nums">{curr.format(totalUSD * curr.rate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
