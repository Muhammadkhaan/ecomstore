import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Globe,
  GitCompare,
  AlertTriangle,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Workspace } from '../server/types.ts';

export type NavTab = 'dashboard' | 'websites' | 'changes' | 'incidents' | 'inspector' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  workspace: Workspace | null;
  openChangesCount: number;
  activeIncidentsCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapsed,
  workspace,
  openChangesCount,
  activeIncidentsCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'websites' as NavTab,
      label: 'Websites',
      icon: Globe,
    },
    {
      id: 'changes' as NavTab,
      label: 'Detected Changes',
      icon: GitCompare,
      badge: openChangesCount > 0 ? openChangesCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'incidents' as NavTab,
      label: 'Incidents & Alerts',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      id: 'inspector' as NavTab,
      label: 'Live URL Inspector',
      icon: Radio,
    },
    {
      id: 'settings' as NavTab,
      label: 'Workspace & Audit',
      icon: Settings,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#111827] text-slate-300 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-indigo-100" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-product font-semibold text-white tracking-tight text-[17px] block leading-tight">
                SiteSentinel
              </span>
              <p className="text-[11px] text-slate-400 truncate">Website Change Impact Detector</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapsed}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspace Plan & Live Status info */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Plan: {workspace?.plan.toUpperCase() || 'STARTER'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Engine
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium truncate mb-1.5">
            {workspace?.name || 'Acme Digital & Commerce'}
          </p>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>SSRF Guard: Active</span>
            <span className="text-indigo-400">1m-15m Intervals</span>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px]">Core Protection Engine</span>
            </div>
            <span className="text-[10px] text-slate-400">v2.0</span>
          </>
        ) : (
          <div className="mx-auto">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
};
