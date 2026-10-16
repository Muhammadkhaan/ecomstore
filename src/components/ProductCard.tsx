import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Clock, Check } from 'lucide-react';
import { Product, CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const curr = CURRENCIES[currency];
  const convertedPrice = product.priceUSD * curr.rate;
  const convertedOriginalPrice = product.originalPriceUSD ? product.originalPriceUSD * curr.rate : null;

  const handleFastAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'M';
    onAddToCart(product, defaultSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#D6D6D6] hover:shadow-laam-sm transition-all duration-laam-base"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Asset Container (Aspect 3:4) */}
      <div
        className="relative aspect-[3/4] w-full bg-[#FAF9F6] overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        {!imageError ? (
          <img
            src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          /* Graceful stylized fallback container */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FAF9F6] to-[#F0EDE6] text-[#525252]">
            <div className="w-12 h-12 rounded-full bg-[#E5E5E5] flex items-center justify-center mb-2">
              <ShoppingBag className="w-6 h-6 text-[#737373]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#141414]">
              {product.designer}
            </span>
            <span className="text-xs text-[#737373] mt-1 line-clamp-2">
              {product.name}
            </span>
          </div>
        )}

        {/* Top Floating Tags */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {product.badge ? (
            <span
              className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm ${
                product.badgeType === 'success'
                  ? 'bg-[#D3F8DF] text-[#087443] border border-[#73E2A3]/50'
                  : product.badgeType === 'alert'
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                  : 'bg-white/95 text-[#141414] border border-[#E5E5E5]'
              }`}
            >
              {product.badge}
            </span>
          ) : (
            <span />
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all ${
              isWishlisted
                ? 'bg-[#B91C1C] text-white shadow-sm'
                : 'bg-white/90 text-[#424242] hover:text-[#B91C1C] hover:bg-white'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Dispatch speed indicator */}
        {product.readyToShip && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 bg-[#141414]/85 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
              <Clock className="w-3 h-3 text-[#73E2A3]" />
              Dispatches in 24h
            </span>
          </div>
        )}

        {/* Quick View Hover Overlay Button */}
        <div className="absolute inset-x-2 bottom-2.5 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-laam-fast z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 bg-white/95 text-[#141414] text-xs font-semibold rounded-lg shadow-laam-sm hover:bg-white flex items-center justify-center gap-1.5 transition-colors border border-[#E5E5E5]"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Quiet Designer Line */}
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wider uppercase text-[#737373]">
            <span>{product.designer}</span>
            <span className="normal-case text-[#087443] font-semibold text-[10px]">
              ★ {product.rating}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="mt-1 text-sm font-semibold font-rubik text-[#141414] hover:text-[#525252] transition-colors cursor-pointer line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Fabric & Occasion */}
          <p className="mt-0.5 text-xs text-[#737373] line-clamp-1">
            {product.fabric}
          </p>
        </div>

        {/* Price & Fast Action Row */}
        <div className="flex items-baseline justify-between pt-2 border-t border-[#E5E5E5]/60">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#141414] tabular-nums">
              {curr.format(convertedPrice)}
            </span>
            {convertedOriginalPrice && (
              <span className="text-xs text-[#737373] line-through tabular-nums">
                {curr.format(convertedOriginalPrice)}
              </span>
            )}
          </div>

          {/* Fast Buy Action */}
          <button
            onClick={handleFastAdd}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              justAdded
                ? 'bg-[#087443] text-white'
                : 'bg-[#141414] text-white hover:bg-[#2b2b2b]'
            }`}
            aria-label="Add to bag"
          >
            {justAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
