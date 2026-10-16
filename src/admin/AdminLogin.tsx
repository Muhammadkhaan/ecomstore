import React, { useState } from 'react';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onReturnStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onReturnStore }) => {
  const [email, setEmail] = useState('admin@laam.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('laam_admin_token', data.token);
      localStorage.setItem('laam_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-2xl font-serif font-extrabold tracking-widest text-[#141414] uppercase">
            LAAM
          </span>
          <h1 className="text-lg font-bold text-[#141414]">Store Admin Dashboard</h1>
          <p className="text-xs text-[#737373]">Sign in to manage your luxury e-commerce portal</p>
        </div>

        {error && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#424242] mb-1">Admin Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-[#737373]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
                placeholder="admin@laam.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#424242] mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-[#737373]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign in to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E5E5] text-center">
          <button
            onClick={onReturnStore}
            className="text-xs text-[#737373] hover:text-[#141414] font-medium transition-colors"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
