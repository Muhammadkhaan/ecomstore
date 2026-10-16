import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, CreditCard, Banknote, ArrowRight } from 'lucide-react';
import { CartItem, CurrencyCode, OrderDetails } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyCode;
  discountPercentage: number;
  onOrderSuccess: (order: OrderDetails) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  discountPercentage,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: 'Ayesha Khan',
    email: 'ayesha.khan@example.com',
    phone: '+1 (555) 349-2918',
    address: '450 Park Avenue, Apt 14B',
    city: 'New York',
    country: 'United States',
    postalCode: '10022',
  });

  const [shippingMethod, setShippingMethod] = useState<'dhl-express' | 'standard'>('dhl-express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'apple-pay'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  if (!isOpen) return null;

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
      const newOrder: OrderDetails = {
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
        estimatedDelivery: '3–5 Business Days',
        placedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      setConfirmedOrder(newOrder);
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAF9F6]">
          <div>
            <h2 className="text-base font-bold text-[#141414]">
              {confirmedOrder ? 'Order Confirmed' : 'Express Checkout'}
            </h2>
            <p className="text-xs text-[#737373]">
              {confirmedOrder
                ? 'Thank you for shopping authentic designer wear on Laam'
                : '100% Genuine Designer Guarantee with DHL Tracked Delivery'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#737373] hover:text-[#141414] rounded-md transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {confirmedOrder ? (
          /* Confirmation Receipt View */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#D3F8DF] text-[#087443] rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#141414]">
                Order #{confirmedOrder.orderId} Placed Successfully!
              </h3>
              <p className="text-xs text-[#525252] max-w-md mx-auto">
                A confirmation email and WhatsApp receipt have been sent to{' '}
                <strong className="text-[#141414]">{confirmedOrder.customerEmail}</strong>.
              </p>
            </div>

            {/* Tracking Badge */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#087443] text-white rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-[#141414] block">
                    DHL Worldwide Express
                  </span>
                  <span className="text-[#737373] tabular-nums">
                    Tracking: {confirmedOrder.trackingNumber}
                  </span>
                </div>
              </div>
              <span className="bg-[#D3F8DF] text-[#087443] font-semibold px-2.5 py-1 rounded self-start sm:self-auto">
                Estimated Delivery: {confirmedOrder.estimatedDelivery}
              </span>
            </div>

            {/* Items Summary */}
            <div className="border border-[#E5E5E5] rounded-xl overflow-hidden divide-y divide-[#E5E5E5] text-xs">
              <div className="p-3 bg-[#FAF9F6] font-semibold text-[#141414] flex justify-between">
                <span>Garment Items ({confirmedOrder.items.length})</span>
                <span>Subtotal</span>
              </div>
              {confirmedOrder.items.map((i) => (
                <div key={i.id} className="p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      className="w-10 h-12 object-cover rounded bg-[#FAF9F6]"
                    />
                    <div>
                      <span className="text-[10px] text-[#737373] uppercase font-semibold block">
                        {i.product.designer}
                      </span>
                      <span className="font-medium font-rubik text-[#141414] line-clamp-1">
                        {i.product.name}
                      </span>
                      <span className="text-[11px] text-[#525252]">
                        Size: {i.selectedSize} · Qty: {i.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums text-[#141414]">
                    {curr.format(i.product.priceUSD * curr.rate * i.quantity)}
                  </span>
                </div>
              ))}
              <div className="p-3.5 bg-[#FAF9F6] space-y-1">
                <div className="flex justify-between text-xs text-[#525252]">
                  <span>Shipping Fee</span>
                  <span className="tabular-nums font-medium text-[#087443]">
                    {confirmedOrder.shippingFee === 0 ? 'FREE' : curr.format(confirmedOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#141414] pt-1 border-t border-[#E5E5E5]">
                  <span>Total Paid</span>
                  <span className="tabular-nums">{curr.format(confirmedOrder.total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#141414] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Step 1: Customer & Address */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                1. Shipping Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#737373] mb-1">
                    WhatsApp / Phone (For DHL delivery notification)
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#737373] mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414] bg-white"
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

            {/* Step 2: Shipping Method */}
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                2. Shipping Speed
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === 'dhl-express'
                      ? 'border-[#087443] bg-[#D3F8DF]/20'
                      : 'border-[#D6D6D6] hover:border-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'dhl-express'}
                      onChange={() => setShippingMethod('dhl-express')}
                      className="accent-[#087443]"
                    />
                    <div>
                      <span className="font-semibold text-[#141414] block">
                        DHL Express Worldwide
                      </span>
                      <span className="text-[#737373] text-[11px]">3–5 Business Days</span>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums text-[#087443]">
                    {isFreeShipping ? 'FREE' : curr.format(25 * curr.rate)}
                  </span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-[#087443] bg-[#D3F8DF]/20'
                      : 'border-[#D6D6D6] hover:border-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-[#087443]"
                    />
                    <div>
                      <span className="font-semibold text-[#141414] block">
                        Standard Postal Delivery
                      </span>
                      <span className="text-[#737373] text-[11px]">8–12 Business Days</span>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums text-[#141414]">
                    {curr.format(15 * curr.rate)}
                  </span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                3. Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#141414] bg-[#FAF9F6] font-semibold'
                      : 'border-[#D6D6D6] text-[#525252]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#141414]" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple-pay')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    paymentMethod === 'apple-pay'
                      ? 'border-[#141414] bg-[#FAF9F6] font-semibold'
                      : 'border-[#D6D6D6] text-[#525252]'
                  }`}
                >
                  <span className="font-bold">Pay</span>
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#141414] bg-[#FAF9F6] font-semibold'
                      : 'border-[#D6D6D6] text-[#525252]'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-[#087443]" />
                  <span>Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Step 4: Submit Button & Order Total */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#525252]">Total to Pay</span>
                <span className="text-lg font-bold text-[#141414] tabular-nums">
                  {curr.format(totalUSD * curr.rate)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b] transition-all shadow-laam-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Processing Secure Order...</span>
                ) : (
                  <>
                    <span>Place Order • {curr.format(totalUSD * curr.rate)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#737373]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087443]" />
                <span>Protected by 100% Buyer Protection & Designer Guarantee</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
