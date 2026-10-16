import React, { useEffect, useState } from 'react';
import { Shield, Clock, Download } from 'lucide-react';

export const AdminActivityLogsPage: React.FC<{ token: string }> = ({ token }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/activity-logs', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(err => console.error(err));
  }, [token]);

  const handleDownloadBackup = () => {
    window.open('/api/admin/backup', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#141414]">Audit Logs & Security Backup</h1>
          <p className="text-xs text-[#737373]">Track administrator activities, role changes, and generate encrypted database backups.</p>
        </div>
        <button
          onClick={handleDownloadBackup}
          className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Database Backup</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] text-[#737373] uppercase font-semibold border-b border-[#E5E5E5]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Admin User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {logs.map((log: any, idx: number) => (
              <tr key={idx} className="hover:bg-[#FAF9F6]">
                <td className="py-3 px-4 font-mono text-[#737373]">{new Date(log.created_at || log.createdAt).toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-[#141414]">{log.user_email || log.userEmail}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E5E5E5] text-[#141414] rounded font-semibold text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#525252]">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
