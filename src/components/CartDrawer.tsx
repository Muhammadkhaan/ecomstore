import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Check } from 'lucide-react';
import { CartItem, CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyCode;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  promoCode: string;
  onApplyPromo: (code: string) => boolean;
  discountPercentage: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  promoCode,
  onApplyPromo,
  discountPercentage,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const curr = CURRENCIES[currency];

  // Calculate Subtotal in USD
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#141414]" />
              <h2 className="text-base font-bold text-[#141414]">
                Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#737373] hover:text-[#141414] hover:bg-[#F9FAFB] transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#FAF9F6] px-4 py-3 border-b border-[#E5E5E5]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-[#141414]">
                {isFreeShipping ? (
                  <span className="text-[#087443] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Unlocked Free Worldwide DHL Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="tabular-nums font-semibold text-[#141414]">{curr.format(amountNeededUSD * curr.rate)}</strong> more for Free Worldwide DHL Shipping
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#737373] tabular-nums font-medium">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#087443] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center text-[#737373]">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141414]">
                    Your shopping bag is empty
                  </h3>
                  <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
                    Explore handcrafted South Asian luxury pret, festive formals, and bridal couture.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#141414] text-white text-xs font-semibold rounded-lg hover:bg-[#2b2b2b] transition-colors"
                >
                  Explore Designer Collections
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.product.priceUSD * curr.rate;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 pb-4 border-b border-[#E5E5E5] last:border-b-0"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 aspect-[3/4] bg-[#FAF9F6] rounded-lg overflow-hidden border border-[#E5E5E5] shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Meta & Controls */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                              {item.product.designer}
                            </span>
                            <h4 className="text-xs font-semibold font-rubik text-[#141414] line-clamp-1">
                              {item.product.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#737373] hover:text-[#B91C1C] p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Size pill */}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] px-2 py-0.5 bg-[#FAF9F6] border border-[#E5E5E5] text-[#424242] rounded font-medium">
                            Size: {item.selectedSize}
                          </span>
                          {item.customMeasurements && (
                            <span className="text-[10px] text-[#087443] font-medium">
                              Tailored
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#D6D6D6] rounded-md bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-[#525252] hover:text-[#141414]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-[#525252] hover:text-[#141414]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#141414] tabular-nums">
                          {curr.format(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Module */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E5E5E5] bg-[#FAF9F6] space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApply} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (try LAAM10)"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D6D6D6] rounded-lg text-xs uppercase focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white border border-[#D6D6D6] hover:border-[#141414] text-xs font-medium text-[#141414] rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoMessage && (
                <p
                  className={`text-[11px] ${
                    promoMessage.isError ? 'text-[#B91C1C]' : 'text-[#087443]'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#525252]">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#141414]">
                    {curr.format(subtotalUSD * curr.rate)}
                  </span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-[#087443] font-medium">
                    <span>Discount ({discountPercentage}%)</span>
                    <span className="tabular-nums">
                      -{curr.format(discountAmountUSD * curr.rate)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#525252]">
                  <span>Worldwide DHL Express</span>
                  <span className="tabular-nums font-medium">
                    {standardShippingUSD === 0 ? (
                      <span className="text-[#087443] font-semibold">FREE</span>
                    ) : (
                      curr.format(standardShippingUSD * curr.rate)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] flex justify-between text-sm font-bold text-[#141414]">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-base">
                    {curr.format(totalUSD * curr.rate)}
                  </span>
                </div>
              </div>

              {/* Primary Checkout CTA (Strictly one primary action) */}
              <button
                onClick={onCheckout}
                className="w-full py-3.5 bg-[#141414] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#2b2b2b] transition-all shadow-laam-md flex items-center justify-center gap-2 duration-laam-fast"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#737373]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087443]" />
                <span>Encrypted 256-Bit Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
