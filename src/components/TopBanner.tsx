import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck } from 'lucide-react';

export const TopBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#087443] text-white text-xs py-2 px-4 border-b border-[#065833] relative z-40 transition-all duration-laam-base">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-medium text-[#D3F8DF]">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Designer Authenticity Guaranteed
          </span>
          <span className="hidden sm:inline text-white/50" aria-hidden="true">·</span>
          <span className="font-normal truncate">
            Complimentary Worldwide DHL Express Delivery on orders above $250
          </span>
          <span className="hidden md:inline text-white/50" aria-hidden="true">·</span>
          <span className="hidden md:inline-flex items-center gap-1 font-semibold text-[#F9DBAF]">
            <Sparkles className="w-3 h-3" />
            Code: LAAM10 for 10% Off
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white p-0.5 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
