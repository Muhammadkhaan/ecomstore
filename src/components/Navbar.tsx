import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, ChevronDown, Check } from 'lucide-react';
import { CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../data/products.ts';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  wishlistCount: number;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  currency,
  onSelectCurrency,
  wishlistCount,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const navLinks = [
    { label: 'All Collections', path: '/collections' },
    { label: 'Luxury Pret', path: '/collections/pret' },
    { label: 'Festive Formals', path: '/collections/festive' },
    { label: 'Bridal Couture', path: '/collections/bridal' },
    { label: 'Ready to Ship', path: '/collections/ready-to-ship' },
    { label: 'Designers', path: '/designers' },
  ];

  const currentCurrency = CURRENCIES[currency];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('/collections');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16 md:h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#141414] hover:text-[#424242] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('/')}
            className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#141414] uppercase shrink-0 transition-opacity hover:opacity-85 text-left font-serif"
          >
            LAAM
          </button>

          {/* Zone 2: 4–6 single-line clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-[#424242]">
            {navLinks.map((item) => {
              const isActive =
                item.path === '/collections'
                  ? currentPath === '/collections'
                  : currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`relative py-2 whitespace-nowrap transition-colors duration-laam-fast hover:text-[#141414] ${
                    isActive ? 'text-[#141414] font-semibold' : 'text-[#525252]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#141414]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Search, Currency & Cart actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Live Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div
                className={`flex items-center transition-all duration-laam-base ${
                  isSearchExpanded
                    ? 'w-48 sm:w-60 border border-[#D6D6D6] bg-white rounded-lg px-2.5 py-1'
                    : 'w-auto'
                }`}
              >
                <Search
                  className="w-4 h-4 text-[#737373] cursor-pointer shrink-0"
                  onClick={() => {
                    setIsSearchExpanded(!isSearchExpanded);
                    if (!isSearchExpanded && !currentPath.includes('/collections')) {
                      onNavigate('/collections');
                    }
                  }}
                />
                {isSearchExpanded ? (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search silk, bridal..."
                    className="ml-2 w-full text-xs text-[#141414] focus:outline-none bg-transparent"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(true);
                      if (!currentPath.includes('/collections')) {
                        onNavigate('/collections');
                      }
                    }}
                    className="hidden sm:inline-block ml-1 text-xs text-[#737373] hover:text-[#141414]"
                  >
                    Search
                  </button>
                )}
                {isSearchExpanded && searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="text-[#737373] hover:text-[#141414] text-xs px-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] text-[#141414] hover:border-[#D6D6D6] transition-colors bg-white shadow-laam-sm"
                aria-label="Select currency"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-[#E5E5E5] rounded-lg shadow-laam-md py-1 z-50">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => {
                        onSelectCurrency(cur);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-[#141414] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <span className={cur === currency ? 'font-semibold' : ''}>
                        {CURRENCIES[cur].label}
                      </span>
                      {cur === currency && <Check className="w-3.5 h-3.5 text-[#087443]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#424242] hover:text-[#141414] transition-colors rounded-lg hover:bg-[#FAF9F6]"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#B91C1C] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#141414] text-white text-xs font-medium rounded-lg hover:bg-[#2b2b2b] transition-colors shadow-laam-sm"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="font-semibold bg-white/20 px-1.5 py-0.5 rounded text-[11px] tabular-nums">
                {cartCount}
              </span>
              {cartCount > 0 && (
                <span className="hidden md:inline text-white/80 border-l border-white/20 pl-2 text-[11px] tabular-nums font-medium">
                  {currentCurrency.format(cartTotal * currentCurrency.rate)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E5E5] bg-white px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2.5 px-3 rounded-md text-sm font-medium ${
                currentPath.startsWith(item.path)
                  ? 'bg-[#FAF9F6] text-[#141414] font-semibold'
                  : 'text-[#525252] hover:bg-[#FAF9F6]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate('/cart');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2.5 px-3 rounded-md text-sm font-semibold text-[#087443] hover:bg-[#FAF9F6]"
          >
            View Full Shopping Bag ({cartCount})
          </button>
        </div>
      )}
    </header>
  );
};
