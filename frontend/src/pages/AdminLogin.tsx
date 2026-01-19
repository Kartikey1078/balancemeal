import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await adminLogin(email, pass);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid admin credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#1C1C1C] rounded-[2.5rem] border border-white/10 p-10 shadow-2xl"
      >
        <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
        <p className="text-gray-500 mb-10 text-sm">
          Sign in with your admin credentials.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none"
                placeholder="admin@yourapp.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          {error && <div className="text-sm font-bold text-rose-500">{error}</div>}
          <button
            disabled={loading}
            className="w-full py-5 gold-gradient text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};
