import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  ChevronRight,
  Gift
} from 'lucide-react';
import { CartItem, CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface CartPageProps {
  items: CartItem[];
  currency: CurrencyCode;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  promoCode: string;
  onApplyPromo: (code: string) => boolean;
  discountPercentage: number;
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  promoCode,
  onApplyPromo,
  discountPercentage,
  onNavigate,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [giftNote, setGiftNote] = useState('');
  const [isGiftWrapSelected, setIsGiftWrapSelected] = useState(false);

  const curr = CURRENCIES[currency];

  const subtotalUSD = items.reduce(
    (sum, item) => sum + item.product.priceUSD * item.quantity,
    0
  );
  const freeShippingThresholdUSD = 250;
  const isFreeShipping = subtotalUSD >= freeShippingThresholdUSD;
  const amountNeededUSD = Math.max(0, freeShippingThresholdUSD - subtotalUSD);
  const progressPercent = Math.min(100, Math.round((subtotalUSD / freeShippingThresholdUSD) * 100));

  const standardShippingUSD = isFreeShipping || items.length === 0 ? 0 : 25;
  const discountAmountUSD = (subtotalUSD * discountPercentage) / 100;
  const totalUSD = Math.max(0, subtotalUSD - discountAmountUSD + standardShippingUSD);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = onApplyPromo(promoInput.trim());
    if (success) {
      setPromoMessage({ text: 'Promo code LAAM10 applied (10% off)!', isError: false });
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try LAAM10', isError: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#737373]">
        <button onClick={() => onNavigate('/')} className="hover:text-[#141414]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <span className="text-[#141414] font-medium">Shopping Bag</span>
      </nav>

      <div className="border-b border-[#E5E5E5] pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
          Your Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#FAF9F6] rounded-2xl border border-[#E5E5E5] max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center text-[#737373]">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="text-base font-bold text-[#141414]">
            Your luxury shopping bag is empty
          </h2>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            Discover exquisite handcrafted bridal couture, luxury silk pret, and festive velvet pishwas.
          </p>
          <button
            onClick={() => onNavigate('/collections')}
            className="px-6 py-3 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b] transition-colors"
          >
            Explore Designer Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items Table & Notes (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free shipping meter */}
            <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E5E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#141414]">
                  {isFreeShipping ? (
                    <span className="text-[#087443] flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4" />
                      Congratulations! You unlocked Complimentary Worldwide DHL Express Shipping
                    </span>
                  ) : (
                    <span>
                      Add{' '}
                      <strong className="text-[#141414] tabular-nums font-bold">
                        {curr.format(amountNeededUSD * curr.rate)}
                      </strong>{' '}
                      more for Free Worldwide DHL Express Delivery
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-[#737373]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#087443] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Itemized Table */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden divide-y divide-[#E5E5E5]">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  {/* Product Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      onClick={() => onNavigate(`/product/${item.product.id}`)}
                      className="w-20 h-28 object-cover rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] shrink-0 cursor-pointer hover:opacity-90"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                        {item.product.designer}
                      </span>
                      <h3
                        onClick={() => onNavigate(`/product/${item.product.id}`)}
                        className="text-sm font-semibold font-rubik text-[#141414] hover:underline cursor-pointer line-clamp-1"
                      >
                        {item.product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs pt-1">
                        <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded font-medium text-[#424242]">
                          Size: {item.selectedSize}
                        </span>
                        {item.customMeasurements && (
                          <span className="px-2 py-0.5 bg-[#D3F8DF] text-[#087443] border border-[#73E2A3] rounded font-medium text-[11px]">
                            Custom Measured
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#737373] block pt-1">
                        {item.product.fabric}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E5]">
                    <span className="text-base font-bold text-[#141414] tabular-nums">
                      {curr.format(item.product.priceUSD * curr.rate * item.quantity)}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#D6D6D6] rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1.5 text-[#525252] hover:text-[#141414]"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1.5 text-[#525252] hover:text-[#141414]"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-[#737373] hover:text-[#B91C1C] transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions & Gift Wrap Note */}
            <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#141414]">
                <Gift className="w-4 h-4 text-[#087443]" />
                <span>Complimentary Luxury Signature Gift Packaging</span>
                <input
                  type="checkbox"
                  checked={isGiftWrapSelected}
                  onChange={(e) => setIsGiftWrapSelected(e.target.checked)}
                  className="ml-auto w-4 h-4 accent-[#087443]"
                />
              </label>

              <div>
                <label className="block text-[11px] text-[#737373] mb-1">
                  Custom Tailoring Notes or Gift Message:
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="e.g. Please ensure full-length lining on sleeves and write: Happy Wedding to Ayesha..."
                  className="w-full px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]">
                Order Summary
              </h2>

              {/* Promo form */}
              <form onSubmit={handleApply} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Voucher (try LAAM10)"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D6D6D6] rounded-lg text-xs uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#141414] text-white text-xs font-semibold rounded-lg hover:bg-[#2b2b2b]"
                >
                  Apply
                </button>
              </form>

              {promoMessage && (
                <p className={`text-[11px] ${promoMessage.isError ? 'text-[#B91C1C]' : 'text-[#087443]'}`}>
                  {promoMessage.text}
                </p>
              )}

              {/* Price Details */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#E5E5E5]">
                <div className="flex justify-between text-[#525252]">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold text-[#141414]">
                    {curr.format(subtotalUSD * curr.rate)}
                  </span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-[#087443] font-semibold">
                    <span>Discount ({discountPercentage}%)</span>
                    <span className="tabular-nums">
                      -{curr.format(discountAmountUSD * curr.rate)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#525252]">
                  <span>Worldwide DHL Express</span>
                  <span className="tabular-nums font-semibold text-[#141414]">
                    {standardShippingUSD === 0 ? (
                      <span className="text-[#087443]">FREE</span>
                    ) : (
                      curr.format(standardShippingUSD * curr.rate)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex justify-between text-base font-bold text-[#141414]">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">
                    {curr.format(totalUSD * curr.rate)}
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => onNavigate('/checkout')}
                className="w-full py-4 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b] transition-all shadow-laam-md flex items-center justify-center gap-2 duration-laam-fast"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#737373]">
                <ShieldCheck className="w-4 h-4 text-[#087443]" />
                <span>100% Genuine Designer Assurance & Buyer Protection</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
