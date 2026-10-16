import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onSelectDesigner: (designerName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectDesigner }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 2000);
    }
  };

  const handleDesignerClick = (designer: string) => {
    onSelectDesigner(designer);
    onNavigate('/collections');
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-[#E5E5E5] text-xs text-[#525252]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="text-2xl font-serif font-black tracking-widest text-[#141414] uppercase text-left block"
            >
              LAAM
            </button>
            <p className="text-[#525252] leading-relaxed max-w-sm">
              The premier global destination for authentic South Asian fashion. Bringing together top couture houses, ready-to-ship luxury pret, and bespoke bridal tailoring with express worldwide dispatch.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#141414] mb-2">
                Join the Private Circle
              </span>
              <p className="text-[#737373] text-[11px] mb-2">
                Get early VIP access to festive lawn drops and couture runway edits.
              </p>
              {isSubscribed ? (
                <div className="flex items-center gap-2 p-2.5 bg-[#D3F8DF] text-[#087443] rounded-lg font-medium text-xs">
                  <Check className="w-4 h-4" />
                  <span>Thank you! Your VIP welcome guide is on its way.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-3 py-2 bg-white border border-[#D6D6D6] rounded-lg text-xs focus:outline-none focus:border-[#141414]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#141414] text-white font-semibold rounded-lg hover:bg-[#2b2b2b] transition-colors flex items-center gap-1"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              Collections
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('/collections/pret')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Luxury Pret
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/collections/festive')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Festive Formals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/collections/bridal')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Heirloom Bridal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/collections/ready-to-ship')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Ready to Ship in 24h
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/designers')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Designer Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Designers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              Featured Designers
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleDesignerClick('Zara Shahjahan')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Zara Shahjahan
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleDesignerClick('Faiza Saqlain')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Faiza Saqlain
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleDesignerClick('Faraz Manan')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Faraz Manan
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleDesignerClick('Hussain Rehar')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Hussain Rehar
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleDesignerClick('Asim Jofa')}
                  className="hover:text-[#141414] transition-colors"
                >
                  Asim Jofa
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              Authenticity
            </h4>
            <div className="p-3 bg-white rounded-xl border border-[#E5E5E5] space-y-2">
              <div className="flex items-center gap-2 text-[#087443] font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Brand Authenticity</span>
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Direct partnerships with Pakistan and South Asia’s official design houses. Every garment arrives sealed with original security tags.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-[#737373]">
              Worldwide DHL Express tracking included. Currencies supported: USD, GBP, AED, PKR.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#737373]">
          <div>
            © {new Date().getFullYear()} Laam Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#141414] cursor-pointer">Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-[#141414] cursor-pointer">Terms of Service</span>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('/admin')} className="text-[#E04F16] font-semibold hover:underline">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
