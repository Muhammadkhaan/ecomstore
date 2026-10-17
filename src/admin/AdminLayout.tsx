import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Box,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Globe,
  FileText,
  Menu as MenuIcon,
  Image,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Shield,
  Code
} from 'lucide-react';

import { AdminDashboardOverview } from './pages/AdminDashboardOverview.tsx';
import { AdminProductsPage } from './pages/AdminProductsPage.tsx';
import { AdminCollectionsPage } from './pages/AdminCollectionsPage.tsx';
import { AdminInventoryPage } from './pages/AdminInventoryPage.tsx';
import { AdminOrdersPage } from './pages/AdminOrdersPage.tsx';
import { AdminCustomersPage } from './pages/AdminCustomersPage.tsx';
import { AdminDiscountsPage } from './pages/AdminDiscountsPage.tsx';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage.tsx';
import { AdminOnlineStorePage } from './pages/AdminOnlineStorePage.tsx';
import { AdminPagesPage } from './pages/AdminPagesPage.tsx';
import { AdminNavigationPage } from './pages/AdminNavigationPage.tsx';
import { AdminMediaPage } from './pages/AdminMediaPage.tsx';
import { AdminSettingsPage } from './pages/AdminSettingsPage.tsx';
import { AdminSeoPage } from './pages/AdminSeoPage.tsx';
import { AdminSchemaMarkupPage } from './pages/AdminSchemaMarkupPage.tsx';
import { AdminActivityLogsPage } from './pages/AdminActivityLogsPage.tsx';
import { AdminProductFormPage } from './pages/AdminProductFormPage.tsx';
import { AdminPageBuilderPage } from './pages/AdminPageBuilderPage.tsx';

interface AdminLayoutProps {
  token: string;
  adminUser: any;
  onLogout: () => void;
  onReturnStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ token, adminUser, onLogout, onReturnStore }) => {
  const [currentPath, setCurrentPath] = useState('/admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Collections', path: '/admin/collections', icon: Layers },
    { label: 'Inventory', path: '/admin/inventory', icon: Box },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Discounts', path: '/admin/discounts', icon: Tag },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'SEO & Meta', path: '/admin/seo', icon: FileText },
    { label: 'SEO → Schema Markup', path: '/admin/seo/schemas', icon: Code },
    { label: 'Online Store', path: '/admin/online-store', icon: Globe },
    { label: 'Pages', path: '/admin/pages', icon: FileText },
    { label: 'Navigation', path: '/admin/navigation', icon: MenuIcon },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'Audit & Backups', path: '/admin/logs', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const renderCurrentPage = () => {
    if (currentPath === '/admin/products/new') {
      return <AdminProductFormPage token={token} onNavigate={setCurrentPath} />;
    }
    if (currentPath.startsWith('/admin/products/edit/')) {
      const productId = currentPath.replace('/admin/products/edit/', '');
      return <AdminProductFormPage token={token} productId={productId} onNavigate={setCurrentPath} />;
    }

    switch (currentPath) {
      case '/admin':
        return <AdminDashboardOverview token={token} onNavigate={setCurrentPath} />;
      case '/admin/products':
        return <AdminProductsPage token={token} onNavigate={setCurrentPath} />;
      case '/admin/collections':
        return <AdminCollectionsPage token={token} />;
      case '/admin/inventory':
        return <AdminInventoryPage token={token} />;
      case '/admin/orders':
        return <AdminOrdersPage token={token} />;
      case '/admin/customers':
        return <AdminCustomersPage token={token} />;
      case '/admin/discounts':
        return <AdminDiscountsPage token={token} />;
      case '/admin/analytics':
        return <AdminAnalyticsPage token={token} />;
      case '/admin/seo':
        return <AdminSeoPage token={token} onNavigate={setCurrentPath} />;
      case '/admin/seo/schemas':
        return <AdminSchemaMarkupPage token={token} onNavigate={setCurrentPath} />;
      case '/admin/online-store':
        return <AdminOnlineStorePage token={token} />;
      case '/admin/pages':
        return <AdminPagesPage token={token} onNavigate={setCurrentPath} />;
      case '/admin/navigation':
        return <AdminNavigationPage token={token} />;
      case '/admin/media':
        return <AdminMediaPage token={token} />;
      case '/admin/logs':
        return <AdminActivityLogsPage token={token} />;
      case '/admin/settings':
        return <AdminSettingsPage token={token} />;
      default:
        return <AdminDashboardOverview token={token} onNavigate={setCurrentPath} />;
    }
  };

  if (currentPath.startsWith('/admin/pages/builder/')) {
    const pageId = currentPath.replace('/admin/pages/builder/', '');
    return <AdminPageBuilderPage token={token} pageId={pageId} onNavigate={setCurrentPath} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#141414] font-sans flex antialiased">
      {/* Sidebar */}
      <aside className={`w-64 bg-[#1A1A1A] text-white flex flex-col border-r border-[#333] shrink-0 transition-all ${isSidebarOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="p-5 border-b border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E04F16] flex items-center justify-center font-bold text-white text-xs">
              L
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-widest block uppercase">LAAM Admin</span>
              <span className="text-[10px] text-white/60">Shopify-Grade Engine</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setCurrentPath(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E04F16] text-white font-semibold shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#333] space-y-2">
          <button
            onClick={onReturnStore}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-[#737373] hover:text-[#141414] rounded-lg hover:bg-[#FAF9F6] md:hidden"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
              {currentPath === '/admin' ? 'Overview' : currentPath.replace('/admin/', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold text-[11px]">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <span className="font-semibold text-[#141414] hidden sm:inline">{adminUser?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};
