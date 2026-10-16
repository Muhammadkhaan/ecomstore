import React from 'react';
import { X, Check, ArrowRight, Trash2 } from 'lucide-react';
import { Product, CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  currency: CurrencyCode;
  onAddToCart: (product: Product, size: string) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveProduct,
  currency,
  onAddToCart,
}) => {
  if (!isOpen) return null;
  const curr = CURRENCIES[currency];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base tracking-wide">Side-by-Side Luxury Comparison</h3>
            <p className="text-xs text-white/70">Compare fabrics, embellishments, and inclusions across designer pieces</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/15 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-x-auto flex-1 bg-[#FAF9F6]">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-sm font-semibold text-[#424242]">No products selected for comparison.</p>
              <p className="text-xs text-[#737373]">Add items to comparison from collection or product pages.</p>
            </div>
          ) : (
            <div className="min-w-[650px] grid grid-flow-col auto-cols-[minmax(260px,_1fr)] gap-6">
              {comparedProducts.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-sm relative flex flex-col justify-between">
                  <button
                    onClick={() => onRemoveProduct(prod.id)}
                    className="absolute top-4 right-4 p-2 bg-white/95 border border-[#E5E5E5] rounded-full text-[#737373] hover:text-[#B91C1C] hover:border-[#B91C1C] transition-colors shadow-sm"
                    aria-label="Remove from comparison"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-4">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-64 object-cover rounded-xl shadow-sm"
                    />
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#E04F16] uppercase">{prod.designer}</span>
                      <h4 className="font-bold text-sm text-[#141414] mt-1 line-clamp-2">{prod.name}</h4>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-extrabold text-[#141414]">
                          {curr.format(prod.priceUSD * curr.rate)}
                        </span>
                        {prod.originalPriceUSD && (
                          <span className="text-xs text-[#737373] line-through">
                            {curr.format(prod.originalPriceUSD * curr.rate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#E5E5E5] text-xs">
                      <div>
                        <span className="font-semibold text-[#737373] block text-[11px]">Fabric</span>
                        <span className="text-[#141414] font-medium">{prod.fabric}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#737373] block text-[11px]">Occasion</span>
                        <span className="text-[#141414] font-medium">{prod.occasion}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#737373] block text-[11px]">Embellishments</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prod.embellishments.map((emb, idx) => (
                            <span key={idx} className="bg-[#FAF9F6] border border-[#E5E5E5] px-2 py-0.5 rounded text-[10px] text-[#424242]">
                              {emb}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-[#737373] block text-[11px]">Inclusions</span>
                        <span className="text-[#141414] font-medium">{prod.includes}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#737373] block text-[11px]">Dispatch & Stock</span>
                        <span className="text-[#087443] font-semibold">
                          {prod.readyToShip ? 'Ready to Ship (1 Day)' : `Custom Stitch (${prod.dispatchDays} Days)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(prod, prod.sizes[0] || 'M');
                      onClose();
                    }}
                    className="w-full mt-6 py-3 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Add to Bag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
