import React, { useState, useEffect } from 'react';
import { X, Heart, ShieldCheck, Truck, Scissors, Star, Check, Minus, Plus } from 'lucide-react';
import { Product, CurrencyCode, CustomMeasurements } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface QuickViewModalProps {
  product: Product | null;
  currency: CurrencyCode;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (
    product: Product,
    selectedSize: string,
    quantity: number,
    measurements?: CustomMeasurements
  ) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  currency,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [isCustomStitchOpen, setIsCustomStitchOpen] = useState<boolean>(false);
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    bust: 36,
    waist: 30,
    hips: 40,
    length: 44,
    unit: 'inches',
  });
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setSelectedSize(product.sizes[0] || 'M');
      setIsCustomStitchOpen(product.sizes[0] === 'Custom Stitch');
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const curr = CURRENCIES[currency];
  const convertedPrice = product.priceUSD * curr.rate;
  const convertedOriginalPrice = product.originalPriceUSD ? product.originalPriceUSD * curr.rate : null;

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    if (size.toLowerCase().includes('custom')) {
      setIsCustomStitchOpen(true);
    } else {
      setIsCustomStitchOpen(false);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(
      product,
      selectedSize,
      quantity,
      selectedSize.toLowerCase().includes('custom') ? measurements : undefined
    );
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-[#424242] hover:text-[#141414] hover:bg-white shadow-laam-sm border border-[#E5E5E5] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Visual Gallery */}
        <div className="md:w-1/2 p-6 bg-[#FAF9F6] border-b md:border-b-0 md:border-r border-[#E5E5E5] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white border border-[#E5E5E5] shadow-sm">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />

              {/* Tag Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded bg-[#D3F8DF] text-[#087443] border border-[#73E2A3]">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-3">
              {[product.image, product.secondaryImage].filter(Boolean).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? 'border-[#141414] shadow-sm'
                      : 'border-[#E5E5E5] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Authenticity Pill Note */}
          <div className="mt-6 flex items-center gap-2 text-xs text-[#087443] bg-[#D3F8DF]/60 p-2.5 rounded-lg border border-[#73E2A3]/50">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#087443]" />
            <span className="font-medium">
              100% Genuine Designer Garment verified directly by Laam
            </span>
          </div>
        </div>

        {/* Right Column: Garment Specs & Purchase Controller */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand & Reviews */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#737373]">
                {product.designer}
              </span>
              <div className="flex items-center gap-1 text-xs text-[#141414]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-[#737373]">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#141414] font-rubik leading-tight">
              {product.name}
            </h2>

            {/* Price Line */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#141414] tabular-nums">
                {curr.format(convertedPrice)}
              </span>
              {convertedOriginalPrice && (
                <span className="text-sm text-[#737373] line-through tabular-nums">
                  {curr.format(convertedOriginalPrice)}
                </span>
              )}
              {product.originalPriceUSD && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C]">
                  Save {Math.round(((product.originalPriceUSD - product.priceUSD) / product.originalPriceUSD) * 100)}%
                </span>
              )}
            </div>

            {/* Delivery Timeline Strip */}
            <div className="flex items-center gap-2 text-xs text-[#525252] bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E5E5]">
              <Truck className="w-4 h-4 text-[#087443] shrink-0" />
              <span>
                {product.readyToShip
                  ? 'Ready to Ship: Dispatches within 24 hours via DHL Express'
                  : `Made to Order: Handcrafted & dispatched in ${product.dispatchDays} days`}
              </span>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#141414]">Select Size</span>
                <button
                  type="button"
                  onClick={() => setIsCustomStitchOpen(!isCustomStitchOpen)}
                  className="text-[#087443] hover:underline flex items-center gap-1 font-medium"
                >
                  <Scissors className="w-3 h-3" />
                  Custom Measurements
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeClick(sz)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedSize === sz
                        ? 'border-[#141414] bg-[#141414] text-white shadow-sm'
                        : 'border-[#D6D6D6] text-[#424242] hover:border-[#141414]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Measurements Accordion Form */}
            {isCustomStitchOpen && (
              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#D6D6D6] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#141414]">
                  <span>Custom Master Tailoring (Inches)</span>
                  <span className="text-[11px] text-[#087443] font-normal">
                    Free with Luxury Pret
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-[#737373] uppercase mb-1">
                      Bust
                    </label>
                    <input
                      type="number"
                      value={measurements.bust}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, bust: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#737373] uppercase mb-1">
                      Waist
                    </label>
                    <input
                      type="number"
                      value={measurements.waist}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, waist: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#737373] uppercase mb-1">
                      Hips
                    </label>
                    <input
                      type="number"
                      value={measurements.hips}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, hips: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#737373] uppercase mb-1">
                      Shirt Length
                    </label>
                    <input
                      type="number"
                      value={measurements.length}
                      onChange={(e) =>
                        setMeasurements({ ...measurements, length: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fabric & Description Details */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5E5] text-xs">
              <p className="text-[#525252] leading-relaxed">
                {product.description}
              </p>
              <div className="text-[#424242]">
                <strong className="text-[#141414]">Includes: </strong>
                {product.includes}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.embellishments.map((emb, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-[#525252] bg-white border border-[#E5E5E5] px-2 py-0.5 rounded"
                  >
                    {emb}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#E5E5E5] flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-[#D6D6D6] rounded-lg bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 text-[#525252] hover:text-[#141414]"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 text-[#525252] hover:text-[#141414]"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-3 rounded-lg border transition-colors ${
                isWishlisted
                  ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C]'
                  : 'border-[#D6D6D6] text-[#424242] hover:text-[#141414]'
              }`}
              aria-label="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B91C1C]' : ''}`} />
            </button>

            {/* Primary Buy CTA */}
            <button
              onClick={handleAddToCart}
              disabled={addedSuccess}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                addedSuccess
                  ? 'bg-[#087443] text-white shadow-laam-sm'
                  : 'bg-[#141414] text-white hover:bg-[#2b2b2b] shadow-laam-md'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <span>Add to Shopping Bag • {curr.format(convertedPrice * quantity)}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
