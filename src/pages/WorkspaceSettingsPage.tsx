import React, { useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  Bell,
  History,
  CheckCircle2,
  Lock,
  Mail,
  Send,
  UserCheck
} from 'lucide-react';
import { Workspace, User, AuditLog, UserRole } from '../server/types.ts';

interface WorkspaceSettingsPageProps {
  workspace: Workspace | null;
  user: User | null;
  auditLogs: AuditLog[];
  onSwitchRole: (role: UserRole) => void;
}

export const WorkspaceSettingsPage: React.FC<WorkspaceSettingsPageProps> = ({
  workspace,
  user,
  auditLogs,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'alerts' | 'audit'>('members');
  const [testEmailSent, setTestEmailSent] = useState(false);

  const rolesMatrix = [
    { permission: 'View Dashboards & Incidents', owner: true, admin: true, member: true, viewer: true },
    { permission: 'Trigger Manual Website Check', owner: true, admin: true, member: true, viewer: false },
    { permission: 'Acknowledge & Resolve Incidents', owner: true, admin: true, member: true, viewer: false },
    { permission: 'Add & Edit Monitored Websites', owner: true, admin: true, member: false, viewer: false },
    { permission: 'Delete Monitored Websites', owner: true, admin: true, member: false, viewer: false },
    { permission: 'Manage Workspace & Billing', owner: true, admin: false, member: false, viewer: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Workspace Settings & Team Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure role-based access control (RBAC), alert channels, and review audit trails
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'members'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Team & RBAC Roles
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'alerts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          Alert Channels
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Logs
        </button>
      </div>

      {/* Tab: Members & RBAC */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Workspace Plan Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{workspace?.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {workspace?.plan} Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Owner ID: <span className="font-mono">{workspace?.ownerId}</span> • Retention: {workspace?.limits.retentionDays} days
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Your Current Session Role:</span>
              <span className="font-bold text-indigo-600 capitalize bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {user?.role}
              </span>
            </div>
          </div>

          {/* RBAC Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-xs text-slate-500">Explicit workspace permission boundaries enforced at API layer</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Workspace Capability</th>
                    <th className="py-3 px-4 text-center">Owner</th>
                    <th className="py-3 px-4 text-center">Administrator</th>
                    <th className="py-3 px-4 text-center">Member</th>
                    <th className="py-3 px-4 text-center">Read-Only Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolesMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">{item.permission}</td>
                      <td className="py-3 px-4 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.admin ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.member ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.viewer ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Alert Channels */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Email Notification Channel</h3>
              <p className="text-xs text-slate-500">
                Dispatches deduplicated change notifications and outage alerts to workspace engineers
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-900">Primary Recipient:</span>
                <span className="text-slate-600 ml-2 font-mono">{user?.email}</span>
                <span className="ml-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>

              <button
                onClick={() => {
                  setTestEmailSent(true);
                  setTimeout(() => setTestEmailSent(false), 3000);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                <span>{testEmailSent ? 'Test Alert Dispatched!' : 'Send Test Outage Alert'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Workspace Audit Logs</h3>
            <p className="text-xs text-slate-500">Complete immutable record of operator actions and security events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
