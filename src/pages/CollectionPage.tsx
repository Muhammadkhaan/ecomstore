import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  SlidersHorizontal,
  Grid3X3,
  Columns2,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { Product, ProductCategory, CurrencyCode } from '../types.ts';
import { PRODUCTS, CURRENCIES } from '../data/products.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface CollectionPageProps {
  initialCategory?: ProductCategory;
  currency: CurrencyCode;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onNavigate: (path: string) => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  initialCategory = 'all',
  currency,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onNavigate,
}) => {
  const [category, setCategory] = useState<ProductCategory>(initialCategory);
  const [selectedDesigner, setSelectedDesigner] = useState<string>('all');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [readyToShipOnly, setReadyToShipOnly] = useState<boolean>(initialCategory === 'ready-to-ship');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [columnDensity, setColumnDensity] = useState<2 | 4>(4);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const designers = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.designer))), []);
  const fabrics = [
    'Pure Raw Silk',
    'Micro Velvet',
    'French Chantilly Net',
    'Pure Sheer Organza',
    'Crinkle Chiffon',
    'Banarsi Brocade',
    'Swiss Voile Lawn',
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Category
      if (category === 'ready-to-ship' && !item.readyToShip) return false;
      if (category !== 'all' && category !== 'ready-to-ship' && item.category !== category) {
        return false;
      }
      // Designer
      if (selectedDesigner !== 'all' && item.designer !== selectedDesigner) return false;
      // Fabric
      if (selectedFabric !== 'all' && !item.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
        return false;
      }
      // Ready to ship
      if (readyToShipOnly && !item.readyToShip) return false;
      // Max price
      if (item.priceUSD > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
      if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [category, selectedDesigner, selectedFabric, readyToShipOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setCategory('all');
    setSelectedDesigner('all');
    setSelectedFabric('all');
    setReadyToShipOnly(false);
    setMaxPrice(1500);
    setSortBy('featured');
  };

  const curr = CURRENCIES[currency];

  const categoryTitles: Record<ProductCategory, { title: string; desc: string }> = {
    all: {
      title: 'All Designer Collections',
      desc: 'Handcrafted luxury pret, embroidered festive silks, and bespoke bridal ensembles from South Asia’s foremost designers.',
    },
    pret: {
      title: 'Luxury Pret & Contemporary Formals',
      desc: 'Effortlessly tailored pure raw silk kalidars, embroidered organza tunics, and modern festive pant-suits.',
    },
    festive: {
      title: 'Festive Formals & Peshwas',
      desc: 'Luminous micro-velvet, crinkle zari chiffon, and multi-flared pishwas for winter weddings and evening celebrations.',
    },
    bridal: {
      title: 'Heirloom Bridal Couture',
      desc: 'Bespoke hand-crafted lehengas adorned with Swarovski crystals, pure silver zardozi, and antique dabka embroidery.',
    },
    'ready-to-ship': {
      title: 'Ready to Ship in 24 Hours',
      desc: 'Instant dispatch outfits stored in our climate-controlled global logistics hub, delivered via express DHL.',
    },
    kaftan: {
      title: 'Designer Kaftan Collection',
      desc: 'Graceful, flowing pure silk and chiffon kaftans featuring intricate hand embroidery and effortless drape.',
    },
    velvet: {
      title: 'Luxury Velvet Edit',
      desc: 'Plush micro-velvet kalidars and shawls crafted with rich zardozi and antique gold embellishments.',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#737373]">
        <button onClick={() => onNavigate('/')} className="hover:text-[#141414] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <span className="text-[#141414] font-medium capitalize">
          {categoryTitles[category]?.title || 'Collections'}
        </span>
      </nav>

      {/* Category Editorial Banner */}
      <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
          {categoryTitles[category]?.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#525252] max-w-2xl leading-relaxed">
          {categoryTitles[category]?.desc}
        </p>
      </div>

      {/* Main Layout: Sidebar (3 cols) + Product Grid (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Facet Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-[#E5E5E5] sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Faceted Filters
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-[#B91C1C] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#141414]">Collection</h4>
            <div className="space-y-1 text-xs">
              {(['all', 'pret', 'festive', 'bridal', 'ready-to-ship'] as ProductCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center justify-between ${
                    category === cat
                      ? 'bg-[#141414] text-white font-semibold'
                      : 'text-[#525252] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <span className="capitalize">{cat.replace('-', ' ')}</span>
                  {category === cat && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Designer Filter */}
          <div className="space-y-2 pt-3 border-t border-[#E5E5E5]">
            <h4 className="text-xs font-semibold text-[#141414]">Designers</h4>
            <select
              value={selectedDesigner}
              onChange={(e) => setSelectedDesigner(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF9F6] border border-[#D6D6D6] rounded-lg text-xs text-[#141414]"
            >
              <option value="all">All Designers ({designers.length})</option>
              {designers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Fabric Filter */}
          <div className="space-y-2 pt-3 border-t border-[#E5E5E5]">
            <h4 className="text-xs font-semibold text-[#141414]">Fabric Family</h4>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF9F6] border border-[#D6D6D6] rounded-lg text-xs text-[#141414]"
            >
              <option value="all">All Fabrics</option>
              {fabrics.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-3 border-t border-[#E5E5E5]">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#141414]">Max Price:</span>
              <span className="tabular-nums font-bold text-[#141414]">
                {curr.format(maxPrice * curr.rate)}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#087443] cursor-pointer"
            />
          </div>

          {/* Ready to Ship Toggle */}
          <div className="pt-3 border-t border-[#E5E5E5]">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={readyToShipOnly}
                onChange={(e) => setReadyToShipOnly(e.target.checked)}
                className="w-4 h-4 accent-[#087443] rounded"
              />
              <span className="font-medium text-[#141414]">Ready to Ship in 24 Hours</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Filter & Density Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E5E5] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#141414] tabular-nums">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Density Switcher */}
              <div className="hidden sm:flex items-center gap-1 border border-[#D6D6D6] rounded-lg p-0.5 bg-white">
                <button
                  onClick={() => setColumnDensity(4)}
                  className={`p-1.5 rounded transition-colors ${
                    columnDensity === 4 ? 'bg-[#141414] text-white' : 'text-[#737373]'
                  }`}
                  aria-label="4 columns"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setColumnDensity(2)}
                  className={`p-1.5 rounded transition-colors ${
                    columnDensity === 2 ? 'bg-[#141414] text-white' : 'text-[#737373]'
                  }`}
                  aria-label="2 columns"
                >
                  <Columns2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#737373]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1 bg-white border border-[#D6D6D6] rounded-lg text-xs font-medium text-[#141414]"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(category !== 'all' || selectedDesigner !== 'all' || selectedFabric !== 'all' || readyToShipOnly) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#D6D6D6] text-[#141414]">
                  Category: {category}
                  <button onClick={() => setCategory('all')}>
                    <X className="w-3 h-3 text-[#737373] hover:text-[#141414]" />
                  </button>
                </span>
              )}
              {selectedDesigner !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#D6D6D6] text-[#141414]">
                  Designer: {selectedDesigner}
                  <button onClick={() => setSelectedDesigner('all')}>
                    <X className="w-3 h-3 text-[#737373] hover:text-[#141414]" />
                  </button>
                </span>
              )}
              {selectedFabric !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#D6D6D6] text-[#141414]">
                  Fabric: {selectedFabric}
                  <button onClick={() => setSelectedFabric('all')}>
                    <X className="w-3 h-3 text-[#737373] hover:text-[#141414]" />
                  </button>
                </span>
              )}
              {readyToShipOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D3F8DF] text-[#087443] border border-[#73E2A3]">
                  Ready to Ship
                  <button onClick={() => setReadyToShipOnly(false)}>
                    <X className="w-3 h-3 text-[#087443]" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[#FAF9F6] rounded-2xl border border-[#E5E5E5]">
              <p className="text-sm font-semibold text-[#141414]">
                No outfits found matching these specific filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#141414] text-white text-xs font-semibold rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                columnDensity === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  isWishlisted={wishlist.includes(p.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={(prod) => onNavigate(`/product/${prod.id}`)}
                  onAddToCart={(prod, sz) => onAddToCart(prod, sz)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
