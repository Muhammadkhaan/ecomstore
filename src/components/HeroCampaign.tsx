import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProductCategory } from '../types.ts';

interface HeroCampaignProps {
  onExplore: (category: ProductCategory) => void;
}

export const HeroCampaign: React.FC<HeroCampaignProps> = ({ onExplore }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] to-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quiet metadata line */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#087443]">
              <span className="flex items-center gap-1.5 bg-[#D3F8DF] text-[#087443] px-2.5 py-1 rounded">
                <Sparkles className="w-3.5 h-3.5" />
                Festive Couture 2026
              </span>
              <span className="text-[#737373]" aria-hidden="true">·</span>
              <span className="text-[#737373]">New Designer Arrivals</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#141414] leading-[1.15] text-balance font-serif">
              The Finest South Asian Luxury Pret & Bridal Couture.
            </h1>

            <p className="text-base sm:text-lg text-[#525252] max-w-xl leading-relaxed">
              Discover authentic collections from premier designers including Zara Shahjahan, Faiza Saqlain, Faraz Manan, and Asim Jofa. Hand-embellished silk kalidars, heirloom bridal lehengas, and ready-to-ship luxury formals.
            </p>

            {/* Quick Proof Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-[#424242]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087443]" />
                <span className="font-medium">100% Original Labels</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087443]" />
                <span className="font-medium">Made to Measure Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087443]" />
                <span className="font-medium">DHL Express 3–5 Days</span>
              </div>
            </div>

            {/* Single Primary Action */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onExplore('pret')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#2b2b2b] transition-all shadow-laam-md duration-laam-fast group"
              >
                <span>Shop Festive & Pret</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onExplore('bridal')}
                className="inline-flex items-center justify-center px-5 py-3.5 border border-[#D6D6D6] text-[#141414] text-sm font-medium rounded-lg hover:border-[#141414] hover:bg-white transition-colors duration-laam-fast"
              >
                View Bridal Couture
              </button>
            </div>
          </div>

          {/* Right Column: Visual Campaign Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-[#E5E5E5] shadow-laam-md bg-[#FAF9F6]">
              {/* Campaign Image with Fallback */}
              <div className="aspect-[4/5] relative overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
                  alt="Laam Festive Couture Collection Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG card if external image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Ambient Scrim & Editorial Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-semibold tracking-widest uppercase bg-[#087443] text-white px-2.5 py-1 rounded">
                    Curated Spotlight
                  </span>
                  <p className="mt-2 text-lg font-serif font-bold text-white leading-snug">
                    Raw Silk & Hand-Embroidered Zari
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    Spring Festive Lookbook · Limited Artisan Edition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
