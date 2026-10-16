import React, { useState, useEffect } from 'react';
import { TopBanner } from './components/TopBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { DesignSystemInspector } from './components/DesignSystemInspector.tsx';
import { AiStylistModal } from './components/AiStylistModal.tsx';
import { FitQuizModal } from './components/FitQuizModal.tsx';
import { ProductComparisonModal } from './components/ProductComparisonModal.tsx';
import { AdminLayout } from './admin/AdminLayout.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { CollectionPage } from './pages/CollectionPage.tsx';
import { ProductPage } from './pages/ProductPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { DesignersPage } from './pages/DesignersPage.tsx';

import { Product, CurrencyCode, CartItem, OrderDetails, ProductCategory } from './types.ts';
import { PRODUCTS, CURRENCIES } from './data/products.ts';
import { Sparkles, Bot, Ruler } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [wishlist, setWishlist] = useState<string[]>(['laam-001', 'laam-003']);
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart-1',
      product: PRODUCTS[0],
      selectedSize: 'M',
      quantity: 1,
    }
  ]);

  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('laam_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(JSON.parse(localStorage.getItem('laam_admin_user') || 'null'));

  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAiStylistOpen, setIsAiStylistOpen] = useState<boolean>(false);
  const [isFitQuizOpen, setIsFitQuizOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([PRODUCTS[0].id, PRODUCTS[1].id]);

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string>('all');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  // Wishlist handler
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your Laam Wishlist');
        return [...prev, productId];
      }
    });
  };

  // Promo code handler
  const handleApplyPromo = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'LAAM10' || clean === 'EID2026') {
      setPromoCode(clean);
      setDiscountPercentage(10);
      showToast('Promo code applied: 10% Off');
      return true;
    } else {
      showToast('Invalid promo code (Try LAAM10)', 'error');
      return false;
    }
  };

  // Cart handlers
  const handleAddToCart = (
    product: Product,
    size: string,
    quantity: number = 1,
    customMeasurements?: any
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product,
            selectedSize: size,
            customMeasurements,
            quantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
    showToast(`Added ${product.name} (${size}) to cart`);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currConfig = CURRENCIES[currency];
  const cartSubtotalUSD = cart.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
  const cartSubtotal = cartSubtotalUSD * currConfig.rate;

  // Router dispatcher
  const renderPage = () => {
    if (currentPath === '/') {
      return (
        <HomePage
          currency={currency}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={(prod, size) => handleAddToCart(prod, size, 1)}
          onNavigate={setCurrentPath}
        />
      );
    }

    if (currentPath === '/collections' || currentPath.startsWith('/collections/')) {
      let initialCat: ProductCategory = 'all';
      if (currentPath.includes('/pret')) initialCat = 'pret';
      else if (currentPath.includes('/festive')) initialCat = 'festive';
      else if (currentPath.includes('/bridal')) initialCat = 'bridal';
      else if (currentPath.includes('/ready-to-ship')) initialCat = 'ready-to-ship';

      return (
        <CollectionPage
          initialCategory={initialCat}
          currency={currency}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={(prod, size) => handleAddToCart(prod, size, 1)}
          onNavigate={setCurrentPath}
        />
      );
    }

    if (currentPath.startsWith('/products/')) {
      const productId = currentPath.replace('/products/', '');
      const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
      return (
        <ProductPage
          productId={product.id}
          currency={currency}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={(prod, size, qty, meas) => handleAddToCart(prod, size, qty || 1, meas)}
          onNavigate={setCurrentPath}
        />
      );
    }

    if (currentPath === '/cart') {
      return (
        <CartPage
          items={cart}
          currency={currency}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          promoCode={promoCode}
          onApplyPromo={handleApplyPromo}
          discountPercentage={discountPercentage}
          onNavigate={setCurrentPath}
        />
      );
    }

    if (currentPath === '/checkout') {
      return (
        <CheckoutPage
          items={cart}
          currency={currency}
          discountPercentage={discountPercentage}
          onOrderSuccess={(order: OrderDetails) => {
            setCart([]);
            showToast(`Order #${order.orderId} placed successfully!`);
            setCurrentPath('/');
          }}
          onNavigate={setCurrentPath}
        />
      );
    }

    if (currentPath === '/designers') {
      return (
        <DesignersPage
          onNavigate={setCurrentPath}
          onSelectDesigner={(designerName) => {
            setSelectedDesignerFilter(designerName);
            setCurrentPath('/collections');
          }}
        />
      );
    }

    return (
      <HomePage
        currency={currency}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onQuickView={(p) => setQuickViewProduct(p)}
        onAddToCart={(prod, size) => handleAddToCart(prod, size, 1)}
        onNavigate={setCurrentPath}
      />
    );
  };

  const comparedProductsList = PRODUCTS.filter((p) => comparedProductIds.includes(p.id));

  if (currentPath.startsWith('/admin')) {
    if (!adminToken) {
      return (
        <AdminLogin
          onLoginSuccess={(token, user) => {
            setAdminToken(token);
            setAdminUser(user);
            setCurrentPath('/admin');
          }}
          onReturnStore={() => setCurrentPath('/')}
        />
      );
    }
    return (
      <AdminLayout
        token={adminToken}
        adminUser={adminUser}
        onLogout={() => {
          localStorage.removeItem('laam_admin_token');
          localStorage.removeItem('laam_admin_user');
          setAdminToken(null);
          setAdminUser(null);
          setCurrentPath('/admin');
        }}
        onReturnStore={() => setCurrentPath('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#141414] font-sans antialiased selection:bg-[#E04F16]/20 selection:text-[#E04F16]">
      {/* Top Announcement Bar */}
      <TopBanner />

      {/* Navigation Header */}
      <Navbar
        currentPath={currentPath}
        onNavigate={setCurrentPath}
        currency={currency}
        onSelectCurrency={setCurrency}
        wishlistCount={wishlist.length}
        cartCount={cartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setCurrentPath('/collections')}
        searchQuery=""
        onSearchChange={() => {}}
      />

      {/* Main Page Content */}
      <main className="min-h-[70vh]">{renderPage()}</main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentPath}
        onSelectDesigner={(designerName) => {
          setSelectedDesignerFilter(designerName);
          setCurrentPath('/collections');
        }}
      />

      {/* Floating Action Buttons: AI Concierge & Size Finder */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => setIsAiStylistOpen(true)}
          className="bg-[#141414] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 hover:bg-[#2b2b2b] transition-transform hover:scale-105 border border-white/20 text-xs font-semibold"
          aria-label="AI Concierge & Stylist"
        >
          <Bot className="w-4 h-4 text-[#E04F16]" />
          <span>Laam AI Concierge</span>
        </button>
        <button
          onClick={() => setIsFitQuizOpen(true)}
          className="bg-white text-[#141414] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-[#FAF9F6] transition-transform hover:scale-105 border border-[#E5E5E5] text-xs font-semibold"
          aria-label="Size & Fit Finder"
        >
          <Ruler className="w-4 h-4 text-[#087443]" />
          <span>Size & Fit Finder</span>
        </button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentPath('/checkout');
        }}
        promoCode={promoCode}
        onApplyPromo={handleApplyPromo}
        discountPercentage={discountPercentage}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          currency={currency}
          isWishlisted={wishlist.includes(quickViewProduct.id)}
          onClose={() => setQuickViewProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={(prod, size, qty, meas) => {
            handleAddToCart(prod, size, qty, meas);
            setQuickViewProduct(null);
          }}
        />
      )}

      {/* AI Stylist Modal */}
      <AiStylistModal
        isOpen={isAiStylistOpen}
        onClose={() => setIsAiStylistOpen(false)}
        currency={currency}
        onSelectProduct={(prod) => setCurrentPath(`/products/${prod.id}`)}
      />

      {/* Fit Quiz Modal */}
      <FitQuizModal
        isOpen={isFitQuizOpen}
        onClose={() => setIsFitQuizOpen(false)}
        onSelectSize={(sz) => {
          showToast(`Applied recommended size: ${sz}`);
        }}
      />

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        comparedProducts={comparedProductsList}
        onRemoveProduct={(id) => setComparedProductIds(prev => prev.filter(x => x !== id))}
        currency={currency}
        onAddToCart={(prod, size) => handleAddToCart(prod, size, 1)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141414] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-white/10">
          <Sparkles className="w-4 h-4 text-[#E04F16] shrink-0" />
          <span className="text-xs font-medium tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Design System Inspector / AI Studio floating helper */}
      <DesignSystemInspector />
    </div>
  );
}

