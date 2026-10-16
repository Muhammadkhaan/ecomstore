import React, { useState } from 'react';
import {
  ChevronRight,
  Heart,
  ShieldCheck,
  Truck,
  Scissors,
  Star,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  Ruler,
  X,
  Share2,
  Play
} from 'lucide-react';
import { Product, CurrencyCode, CustomMeasurements } from '../types.ts';
import { CURRENCIES, PRODUCTS } from '../data/products.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductPageProps {
  productId: string;
  currency: CurrencyCode;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (
    product: Product,
    selectedSize: string,
    quantity: number,
    measurements?: CustomMeasurements
  ) => void;
  onNavigate: (path: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  productId,
  currency,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
}) => {
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

  const [activeImage, setActiveImage] = useState(product.image);
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video'>('image');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isCustomStitchOpen, setIsCustomStitchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    bust: 36,
    waist: 30,
    hips: 40,
    length: 44,
    unit: 'inches',
  });

  const [activeTab, setActiveTab] = useState<'fabric' | 'shipping' | 'care'>('fabric');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      name: 'Dr. Fatima R.',
      location: 'London, UK',
      rating: 5,
      date: 'Oct 2, 2026',
      comment: 'Breathtaking embroidery and pristine stitching! Delivered to London via DHL in just 4 days. Exactly like the couture runway images.',
    },
    {
      id: 'rev-2',
      name: 'Samira M.',
      location: 'Toronto, Canada',
      rating: 5,
      date: 'Sep 28, 2026',
      comment: 'The custom measurements were spot on. Pure raw silk drape feels royal. Highly recommend Laam for peace of mind.',
    },
  ]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const curr = CURRENCIES[currency];
  const convertedPrice = product.priceUSD * curr.rate;
  const convertedOriginalPrice = product.originalPriceUSD ? product.originalPriceUSD * curr.rate : null;
  const isWishlisted = wishlist.includes(product.id);

  // Related products
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    onAddToCart(
      product,
      selectedSize,
      quantity,
      selectedSize.toLowerCase().includes('custom') ? measurements : undefined
    );
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    onAddToCart(
      product,
      selectedSize,
      quantity,
      selectedSize.toLowerCase().includes('custom') ? measurements : undefined
    );
    onNavigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;

    setReviews([
      {
        id: `rev-${Date.now()}`,
        name: newReviewAuthor,
        location: 'Verified Customer',
        rating: newReviewRating,
        date: 'Just now',
        comment: newReviewText,
      },
      ...reviews,
    ]);
    setNewReviewAuthor('');
    setNewReviewText('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#737373]">
        <button onClick={() => onNavigate('/')} className="hover:text-[#141414] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <button
          onClick={() => onNavigate(`/collections/${product.category}`)}
          className="hover:text-[#141414] capitalize transition-colors"
        >
          {product.category.replace('-', ' ')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <span className="text-[#141414] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Vertical Thumbnails */}
          <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {[product.image, product.secondaryImage].filter(Boolean).map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveImage(img); setActiveMediaType('image'); }}
                className={`w-16 h-20 sm:w-20 sm:h-28 rounded-lg overflow-hidden border-2 transition-all ${
                  activeMediaType === 'image' && activeImage === img
                    ? 'border-[#141414] shadow-laam-sm'
                    : 'border-[#E5E5E5] opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
            {product.videoUrl && (
              <button
                onClick={() => setActiveMediaType('video')}
                className={`w-16 h-20 sm:w-20 sm:h-28 rounded-lg overflow-hidden border-2 transition-all relative bg-neutral-900 flex items-center justify-center ${
                  activeMediaType === 'video'
                    ? 'border-[#141414] shadow-laam-sm'
                    : 'border-[#E5E5E5] opacity-75 hover:opacity-100'
                }`}
              >
                <video src={product.videoUrl} className="w-full h-full object-cover opacity-60" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                  <Play className="w-5 h-5 fill-white" />
                </div>
              </button>
            )}
          </div>

          {/* Main Stage Image / Video */}
          <div className="flex-1 relative aspect-[3/4] bg-[#FAF9F6] rounded-2xl overflow-hidden border border-[#E5E5E5] shadow-laam-sm group">
            {activeMediaType === 'video' && product.videoUrl ? (
              <video
                src={product.videoUrl}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            )}

            {/* Tag Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <span className="text-xs font-semibold uppercase px-3 py-1 rounded bg-[#D3F8DF] text-[#087443] border border-[#73E2A3] shadow-sm">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all shadow-laam-sm ${
                isWishlisted
                  ? 'bg-[#B91C1C] text-white'
                  : 'bg-white/90 text-[#424242] hover:text-[#B91C1C] hover:bg-white'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Purchase Module (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="space-y-3">
            {/* Designer & Reviews */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#737373]">
                {product.designer}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#141414]">
                <div className="flex text-amber-400">
                  {'★★★★★'}
                </div>
                <span className="font-semibold">{product.rating}</span>
                <span className="text-[#737373]">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-rubik font-bold text-[#141414] leading-tight">
              {product.name}
            </h1>

            {/* Price Line */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-bold text-[#141414] tabular-nums">
                {curr.format(convertedPrice)}
              </span>
              {convertedOriginalPrice && (
                <span className="text-base text-[#737373] line-through tabular-nums">
                  {curr.format(convertedOriginalPrice)}
                </span>
              )}
              {product.originalPriceUSD && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C]">
                  Save {Math.round(((product.originalPriceUSD - product.priceUSD) / product.originalPriceUSD) * 100)}%
                </span>
              )}
            </div>

            <p className="text-xs text-[#737373]">
              Taxes included. Duties calculated at checkout based on destination country.
            </p>
          </div>

          {/* Delivery & Authenticity Cards */}
          <div className="p-3.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#141414] font-medium">
              <Truck className="w-4 h-4 text-[#087443] shrink-0" />
              <span>
                {product.readyToShip
                  ? 'Ready to Ship: Dispatches within 24 hours via DHL Express'
                  : `Made to Order: Expertly hand-tailored in ${product.dispatchDays} days`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#087443] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Genuine Designer Label with Original Security Seals</span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141414]">Select Size:</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[#087443] hover:underline flex items-center gap-1 font-medium"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Chart & Guide</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setSelectedSize(sz);
                    if (sz.toLowerCase().includes('custom')) {
                      setIsCustomStitchOpen(true);
                    }
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    selectedSize === sz
                      ? 'border-[#141414] bg-[#141414] text-white shadow-laam-sm'
                      : 'border-[#D6D6D6] text-[#424242] hover:border-[#141414] bg-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tailoring Drawer Form */}
          {isCustomStitchOpen && (
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#D6D6D6] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#141414]">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-[#087443]" />
                  Custom Made-to-Measure Specifications
                </span>
                <button
                  onClick={() => setIsCustomStitchOpen(false)}
                  className="text-[#737373] hover:text-[#141414]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Bust (in)</label>
                  <input
                    type="number"
                    value={measurements.bust}
                    onChange={(e) => setMeasurements({ ...measurements, bust: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Waist (in)</label>
                  <input
                    type="number"
                    value={measurements.waist}
                    onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Hips (in)</label>
                  <input
                    type="number"
                    value={measurements.hips}
                    onChange={(e) => setMeasurements({ ...measurements, hips: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Length (in)</label>
                  <input
                    type="number"
                    value={measurements.length}
                    onChange={(e) => setMeasurements({ ...measurements, length: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white border border-[#D6D6D6] rounded text-center font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Primary Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-[#D6D6D6] rounded-lg bg-white h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 text-[#525252] hover:text-[#141414]"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-xs font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 text-[#525252] hover:text-[#141414]"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Buy Action */}
              <button
                onClick={handleAdd}
                disabled={addedSuccess}
                className={`flex-1 h-12 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-laam-md ${
                  addedSuccess
                    ? 'bg-[#087443] text-white'
                    : 'bg-[#141414] text-white hover:bg-[#2b2b2b]'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag • {curr.format(convertedPrice * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Fast Express Buy Button */}
            <button
              onClick={handleBuyNow}
              className="w-full h-12 bg-white text-[#141414] border border-[#141414] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#FAF9F6] transition-colors"
            >
              Instant Express Checkout
            </button>
          </div>

          {/* Collapsible Details Tabs */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-3">
            <div className="flex border-b border-[#E5E5E5] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('fabric')}
                className={`pb-2.5 mr-6 border-b-2 transition-colors ${
                  activeTab === 'fabric'
                    ? 'border-[#141414] text-[#141414]'
                    : 'border-transparent text-[#737373]'
                }`}
              >
                Fabric & Embellishment
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2.5 mr-6 border-b-2 transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-[#141414] text-[#141414]'
                    : 'border-transparent text-[#737373]'
                }`}
              >
                Shipping & Returns
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'care'
                    ? 'border-[#141414] text-[#141414]'
                    : 'border-transparent text-[#737373]'
                }`}
              >
                Dry Clean & Care
              </button>
            </div>

            <div className="text-xs text-[#525252] leading-relaxed">
              {activeTab === 'fabric' && (
                <div className="space-y-2">
                  <p>{product.description}</p>
                  <div>
                    <strong className="text-[#141414]">Includes: </strong> {product.includes}
                  </div>
                  <div>
                    <strong className="text-[#141414]">Craftsmanship: </strong>
                    {product.embellishments.join(', ')}
                  </div>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-1.5">
                  <p>
                    • Delivered worldwide via tracked DHL Express in 3–5 business days.
                  </p>
                  <p>• Free international express shipping on orders over $250.</p>
                  <p>
                    • Full designer authenticity tag guarantee. Easy return and exchange policy on all pret outfits.
                  </p>
                </div>
              )}
              {activeTab === 'care' && (
                <div className="space-y-1.5">
                  <p>• Strictly dry clean only for embellished silks, velvet, and organza.</p>
                  <p>• Do not spray perfumes directly on antique gold tilla and zardozi threadwork.</p>
                  <p>• Store folded in a breathable cotton garment bag provided by Laam.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <section className="border-t border-[#E5E5E5] pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141414]">
              Verified Customer Reviews
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#525252]">
              <span className="text-amber-500 font-bold">★★★★★ 4.9 out of 5.0</span>
              <span>· Based on {reviews.length} authentic international purchases</span>
            </div>
          </div>
        </div>

        {/* Existing Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#141414] block">{rev.name}</span>
                  <span className="text-[11px] text-[#737373]">{rev.location} · {rev.date}</span>
                </div>
                <div className="text-amber-400">{'★'.repeat(rev.rating)}</div>
              </div>
              <p className="text-[#424242] leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>

        {/* Write a Review Box */}
        <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-[#141414] uppercase tracking-wider">
            Share Your Experience
          </h3>
          {reviewSubmitted ? (
            <div className="p-3 bg-[#D3F8DF] text-[#087443] rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Thank you! Your verified review has been published.</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Maryam K."
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#737373] mb-1">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414] bg-white"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-[#737373] mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share details about the fabric, embroidery, and fit..."
                  className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg focus:outline-none focus:border-[#141414]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#141414] text-white font-semibold rounded-lg hover:bg-[#2b2b2b] transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Outfits Section */}
      <section className="border-t border-[#E5E5E5] pt-12 space-y-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141414]">
          Complete the Look & Related Curations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              currency={currency}
              isWishlisted={wishlist.includes(p.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={(prod) => onNavigate(`/product/${prod.id}`)}
              onAddToCart={(prod, sz) => onAddToCart(prod, sz, 1)}
            />
          ))}
        </div>
      </section>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="text-base font-bold text-[#141414] flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#087443]" />
                Laam Designer Size Chart (Inches)
              </h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="p-1 text-[#737373]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full border border-[#E5E5E5] divide-y divide-[#E5E5E5] text-center">
                <thead className="bg-[#FAF9F6] font-semibold text-[#141414]">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hips</th>
                    <th className="py-2.5 px-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-[#525252]">
                  <tr><td className="py-2 px-3 text-left font-bold text-[#141414]">XS</td><td>34</td><td>28</td><td>38</td><td>42</td></tr>
                  <tr><td className="py-2 px-3 text-left font-bold text-[#141414]">S</td><td>36</td><td>30</td><td>40</td><td>43</td></tr>
                  <tr><td className="py-2 px-3 text-left font-bold text-[#141414]">M</td><td>38</td><td>32</td><td>42</td><td>44</td></tr>
                  <tr><td className="py-2 px-3 text-left font-bold text-[#141414]">L</td><td>41</td><td>35</td><td>45</td><td>45</td></tr>
                  <tr><td className="py-2 px-3 text-left font-bold text-[#141414]">XL</td><td>44</td><td>38</td><td>48</td><td>46</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#737373]">
              Need a personalized fit? Choose "Custom Stitch" during checkout for bespoke master tailoring according to your exact body measurements.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="px-4 py-2 bg-[#141414] text-white text-xs font-semibold rounded-lg"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
