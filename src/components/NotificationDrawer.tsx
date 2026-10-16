import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../server/types.ts';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectWebsite?: (websiteId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectWebsite,
}) => {
  if (!isOpen) return null;

  const severityIcon = {
    critical: <AlertOctagon className="w-4 h-4 text-rose-600" />,
    high: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    medium: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
    low: <Info className="w-4 h-4 text-blue-600" />,
    informational: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                <p className="text-[11px] text-slate-500">Live alerts and check activity</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onMarkAllRead}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 text-xs font-medium flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="text-[11px]">Mark all read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) onMarkRead(notif.id);
                    if (notif.websiteId && onSelectWebsite) {
                      onSelectWebsite(notif.websiteId);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-white border-slate-200/70 opacity-75 hover:opacity-100'
                      : 'bg-indigo-50/40 border-indigo-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 mt-0.5">{severityIcon[notif.severity]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">{notif.title}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
