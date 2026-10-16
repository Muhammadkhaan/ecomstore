import React, { useState } from 'react';
import { ChevronRight, ArrowRight, Sparkles, ShieldCheck, Award } from 'lucide-react';
import { PRODUCTS } from '../data/products.ts';

interface DesignersPageProps {
  onNavigate: (path: string) => void;
  onSelectDesigner: (designerName: string) => void;
}

export const DesignersPage: React.FC<DesignersPageProps> = ({
  onNavigate,
  onSelectDesigner,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  const designerProfiles = [
    {
      name: 'Zara Shahjahan',
      letter: 'Z',
      city: 'Lahore, Pakistan',
      origin: 'Est. 2004',
      aesthetic: 'Timeless Handcrafted Silks & Vintage Florals',
      description: 'Renowned for celebrating nostalgic subcontinental heritage. Zara Shahjahan combines pure unadulterated raw silks, organza dupattas with marori needlework, and delicate Gota patti borders.',
      signaturePieces: 'Zahra Embroidered Raw Silk Kalidar, Gota Handworked Organza',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Faiza Saqlain',
      letter: 'F',
      city: 'Lahore, Pakistan',
      origin: 'Est. 2012',
      aesthetic: 'Royal Heirloom Velvet & 24-Kali Peshwas',
      description: 'Celebrated for royal heirloom bridalwear and opulent micro-velvets. Signature techniques include antique dabka, French knots, and intricate Persian miniature motifs.',
      signaturePieces: 'Nur Jahan Velvet Embroidered Peshwas, Shehrbano Pishwas',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Faraz Manan',
      letter: 'F',
      city: 'Dubai / Lahore',
      origin: 'Est. 2003',
      aesthetic: 'Global Architectural Haute Couture & Atelier Bridals',
      description: 'South Asia’s leading international couturier. Known for subtle European color palettes, crystal embellishments, silver zardozi, and dramatic trailing silhouettes.',
      signaturePieces: 'Gul-e-Khandan Bridal Handcrafted Trailing Lehenga',
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Hussain Rehar',
      letter: 'H',
      city: 'Lahore, Pakistan',
      origin: 'Est. 2017',
      aesthetic: 'Avant-Garde Contemporary Structural Silhouettes',
      description: 'A revolutionary force in modern South Asian fashion, known for structural cuts, graphic color contrasts, and innovative tilla cord embroideries.',
      signaturePieces: 'Mirza Embroidered Organza Angrakha, Culotte Sets',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Asim Jofa',
      letter: 'A',
      city: 'Karachi, Pakistan',
      origin: 'Est. 2009',
      aesthetic: 'Jewelry-Inspired Zari Jaal & Chiffon Shararas',
      description: 'Carrying forward a legacy of certified gemologists, Asim Jofa’s festive ensembles sparkle with heavy metallic zari, foil mirror accents, and luxurious crinkle chiffon.',
      signaturePieces: 'Sultana Chiffon Zari Sharara Suit, Festive Net Formals',
      image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sana Safinaz',
      letter: 'S',
      city: 'Karachi, Pakistan',
      origin: 'Est. 1989',
      aesthetic: 'High-Fashion Banarsi Brocade & Silk Slips',
      description: 'The pioneering duo that defined Pakistani luxury pret. Renowned for sharp modern tailoring, woven brocades, and graceful silhouettes designed for the contemporary woman.',
      signaturePieces: 'Mahnoor Brocade Long Jacket & Silk Slip Ensemble',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Maria.B',
      letter: 'M',
      city: 'Lahore, Pakistan',
      origin: 'Est. 1999',
      aesthetic: 'Katan Silk Formals & Kiran Lace Detailing',
      description: 'One of the largest fashion powerhouses in Pakistan, delivering exquisite wedding formals, pure katan silks, and artisanal Kiran lace detailing.',
      signaturePieces: 'Shehrbano Silk Pishwas & Shimmer Tissue Dupatta',
      image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Crimson',
      letter: 'C',
      city: 'Lahore, Pakistan',
      origin: 'Est. 2014',
      aesthetic: 'Schiffli Cutwork Lawn & Hand-Printed Silk',
      description: 'Celebrated for breathtaking unstitched luxury lawn and pret. Features schiffli laser cutwork, botanical prints on medium silk, and intricate organza borders.',
      signaturePieces: 'Bahar-e-Nau Embroidered Swiss Lawn Luxury Formals',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const letters = ['ALL', 'A', 'C', 'F', 'H', 'M', 'S', 'Z'];

  const filteredDesigners = selectedLetter === 'ALL'
    ? designerProfiles
    : designerProfiles.filter((d) => d.letter === selectedLetter);

  const handleDesignerClick = (designerName: string) => {
    onSelectDesigner(designerName);
    onNavigate('/collections');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#737373]">
        <button onClick={() => onNavigate('/')} className="hover:text-[#141414]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#D6D6D6]" />
        <span className="text-[#141414] font-medium">Designers</span>
      </nav>

      {/* Editorial Header */}
      <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 sm:p-10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087443]">
          <Award className="w-4 h-4 text-[#087443]" />
          <span>Official Atelier Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#141414]">
          The Designers of Laam
        </h1>
        <p className="text-xs sm:text-sm text-[#525252] max-w-2xl leading-relaxed">
          Direct partnerships with South Asia’s foremost fashion institutions. Every collection showcased on Laam is verified authentic, directly procured from designer workshops, and tagged with original security seals.
        </p>
      </div>

      {/* A–Z Index Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E5E5] text-xs">
        <span className="font-semibold text-[#141414] mr-2">Filter by Letter:</span>
        {letters.map((ltr) => (
          <button
            key={ltr}
            onClick={() => setSelectedLetter(ltr)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedLetter === ltr
                ? 'bg-[#141414] text-white'
                : 'text-[#525252] hover:bg-[#FAF9F6]'
            }`}
          >
            {ltr}
          </button>
        ))}
      </div>

      {/* Designer Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredDesigners.map((designer) => {
          const availableCount = PRODUCTS.filter((p) => p.designer === designer.name).length;
          return (
            <div
              key={designer.name}
              className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:border-[#141414] transition-all duration-laam-base shadow-laam-sm flex flex-col justify-between group"
            >
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#087443]">
                      {designer.origin} · {designer.city}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141414] mt-0.5">
                      {designer.name}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FAF9F6] border border-[#E5E5E5] text-[11px] font-medium text-[#424242] rounded">
                    {availableCount} {availableCount === 1 ? 'Design' : 'Designs'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[#087443] font-semibold">
                    {designer.aesthetic}
                  </div>
                  <p className="text-[#525252] leading-relaxed">
                    {designer.description}
                  </p>
                </div>

                <div className="text-[11px] text-[#737373] pt-2 border-t border-[#E5E5E5]">
                  <strong className="text-[#141414]">Signatures: </strong>
                  {designer.signaturePieces}
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 sm:px-8 py-4 bg-[#FAF9F6] border-t border-[#E5E5E5] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-[#087443]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Retailer</span>
                </div>
                <button
                  onClick={() => handleDesignerClick(designer.name)}
                  className="text-xs font-bold text-[#141414] hover:text-[#087443] flex items-center gap-1.5 group-hover:translate-x-1 transition-all"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
