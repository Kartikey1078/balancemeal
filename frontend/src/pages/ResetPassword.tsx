import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get('token') || '';
  const emailFromUrl = params.get('email') || '';
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Reset failed. Try again.');
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 olive-gradient rounded-2xl flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-olive-800 tracking-tight">Reset Password</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Enter your email and choose a new password.
        </p>

        {success ? (
          <div className="text-center space-y-6">
            <p className="text-sm font-bold text-emerald-600">
              Password updated successfully.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full olive-gradient text-white py-4 rounded-2xl font-black"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none"
                placeholder="name@vital.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full olive-gradient text-white py-4 rounded-2xl font-black disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
