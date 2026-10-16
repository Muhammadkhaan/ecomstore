import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Plus,
  Search,
  ChevronDown,
  Building2,
  Shield,
  Zap,
  Check
} from 'lucide-react';
import { User, Workspace, UserRole } from '../server/types.ts';

interface HeaderProps {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  onSwitchWorkspace: (workspaceId: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenAddWebsite: () => void;
  onToggleMobileSidebar: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  workspace,
  workspaces,
  onSwitchWorkspace,
  onSwitchRole,
  onOpenAddWebsite,
  onToggleMobileSidebar,
  unreadCount,
  onOpenNotifications,
  searchQuery,
  onSearchChange,
  onOpenSimulator,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'owner', label: 'Owner', desc: 'Full workspace control & billing' },
    { role: 'administrator', label: 'Administrator', desc: 'Manage sites & checks' },
    { role: 'member', label: 'Member', desc: 'Run checks & view diffs' },
    { role: 'viewer', label: 'Read-only Viewer', desc: 'Inspect reports & alerts only' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle + Workspace Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[150px]">
                {workspace?.name || 'Acme Digital & Commerce'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{workspace?.plan || 'Starter'} Plan</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Workspace
                </span>
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSwitchWorkspace(ws.id);
                    setWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="truncate">
                    <p className={`text-xs font-medium truncate ${ws.id === workspace?.id ? 'text-indigo-600 font-semibold' : 'text-slate-800'}`}>
                      {ws.name}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase">{ws.plan} · {ws.limits.maxWebsites} sites max</p>
                  </div>
                  {ws.id === workspace?.id && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search websites, alerts, detected changes..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Simulator Button + RBAC Role Selector + Notifications + Add Website */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Scenario Simulator Quick-Test Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Simulate website change scenarios (CTA missing, 500 error, title change)"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden lg:inline">Simulator</span>
        </button>

        {/* RBAC Role Selector */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            title="Simulate Role-Based Access Control"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline capitalize">{user?.role || 'owner'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test RBAC Role
                </span>
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    onSwitchRole(r.role);
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className={`text-xs font-medium ${user?.role === r.role ? 'text-indigo-600 font-semibold' : 'text-slate-800'}`}>
                      {r.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{r.desc}</p>
                  </div>
                  {user?.role === r.role && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Primary "+ Add Website" CTA */}
        <button
          onClick={onOpenAddWebsite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Website</span>
        </button>
      </div>
    </header>
  );
};
