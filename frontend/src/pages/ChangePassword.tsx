import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChangePassword: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const token = user?.token ?? (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').token; } catch { return null; } })();
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Failed to change password.');
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 olive-gradient rounded-2xl flex items-center justify-center text-white">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-olive-800 tracking-tight">Change Password</h1>
        </div>

        {success ? (
          <div className="space-y-6">
            <p className="text-sm font-bold text-emerald-600">Password updated successfully.</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full olive-gradient text-white py-4 rounded-2xl font-black"
            >
              Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
