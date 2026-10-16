import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Clock, Star, Flame } from 'lucide-react';
import { HeroCampaign } from '../components/HeroCampaign.tsx';
import { TrustSignals } from '../components/TrustSignals.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { Product, CurrencyCode } from '../types.ts';
import { PRODUCTS } from '../data/products.ts';

interface HomePageProps {
  currency: CurrencyCode;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currency,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onNavigate,
}) => {
  // Direct requested Laam products
  const laamRequestedIds = [
    'sahrosh-embroiderd-3pcs',
    'nimal-emb-3pcs',
    'pastel-bloom-0',
    'powder-blue-plain-modal-hijab',
    'grey-suit-aln501b',
    'allure-0',
  ];

  const requestedProducts = PRODUCTS.filter((p) => laamRequestedIds.includes(p.id));
  const readyToShipItems = PRODUCTS.filter((p) => p.readyToShip).slice(0, 4);
  const festiveItems = PRODUCTS.filter((p) => p.category === 'festive' || p.category === 'bridal').slice(0, 4);

  return (
    <div className="space-y-12 pb-12">
      {/* Editorial Hero */}
      <HeroCampaign
        onExplore={(cat) => {
          if (cat === 'all') onNavigate('/collections');
          else onNavigate(`/collections/${cat}`);
        }}
      />

      {/* Trust Signals */}
      <TrustSignals />

      {/* Primary Showcase: Requested Products on Laam */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E04F16]">
              <Flame className="w-3.5 h-3.5 fill-[#E04F16]" />
              <span>Laam Official Direct Arrivals</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#141414] mt-1">
              Trending Pret, Festive Suits & Modal Hijabs
            </h2>
            <p className="text-xs text-[#737373] mt-1">
              Featuring Sahrosh Embroidered 3pcs, Nimal Linen, Pastel Bloom, Powder Blue Modal Hijab, Grey Suit ALN501B, and Allure-0.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/collections')}
            className="text-xs font-semibold text-[#141414] hover:text-[#087443] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {requestedProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              isWishlisted={wishlist.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={(p) => onNavigate(`/products/${p.id}`)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Section 1: Ready to Ship 24h Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#087443]">
              <Clock className="w-3.5 h-3.5" />
              <span>Instant Dispatch Guaranteed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#141414] mt-1">
              Ready to Ship in 24 Hours
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/collections/ready-to-ship')}
            className="text-xs font-semibold text-[#141414] hover:text-[#087443] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Ready to Ship</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {readyToShipItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              isWishlisted={wishlist.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Featured Designer Campaign Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-[#141414] text-white p-8 md:p-12 border border-[#424242]">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-[11px] font-semibold tracking-widest uppercase bg-[#087443] text-white px-2.5 py-1 rounded">
              Designer Spotlight
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Master Craftsmanship from Pakistan’s Premier Couture Houses
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Explore timeless hand-embellished pishwas, Banarsi brocades, and modern luxury pret curated directly from Zara Shahjahan, Faiza Saqlain, Faraz Manan, and Hussain Rehar.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/designers')}
                className="px-6 py-3 bg-white text-[#141414] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#FAF9F6] transition-colors"
              >
                Explore Designer Directory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Festive & Bridal Couture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B91C1C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wedding & Festive Season</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#141414] mt-1">
              Festive Formals & Heirloom Bridal
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/collections/festive')}
            className="text-xs font-semibold text-[#141414] hover:text-[#087443] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Explore Festive Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {festiveItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              isWishlisted={wishlist.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
