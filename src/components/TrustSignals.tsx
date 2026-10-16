import React from 'react';
import { ShieldCheck, Globe, Scissors, Headphones } from 'lucide-react';
import { TRUST_FEATURES } from '../data/products.ts';

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#087443]" />,
  Globe: <Globe className="w-5 h-5 text-[#087443]" />,
  Scissors: <Scissors className="w-5 h-5 text-[#087443]" />,
  Headphones: <Headphones className="w-5 h-5 text-[#087443]" />,
};

export const TrustSignals: React.FC = () => {
  return (
    <section className="bg-white border-b border-[#E5E5E5] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="flex items-start gap-3.5 p-3.5 rounded-lg border border-transparent hover:border-[#E5E5E5] hover:bg-[#F9FAFB] transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-[#D3F8DF] shrink-0 border border-[#73E2A3]/40">
                {iconMap[feat.icon] || <ShieldCheck className="w-5 h-5 text-[#087443]" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#141414] leading-snug">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#525252] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
