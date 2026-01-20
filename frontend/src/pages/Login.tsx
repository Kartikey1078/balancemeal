import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, UserPlus, Leaf, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Login: React.FC = () => {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = isLoginMode
      ? await login(email, pass)
      : await signup(name, email, pass);
    if (success) {
      navigate('/');
    } else {
      setError(isLoginMode ? 'Invalid email or password' : 'Email already exists');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 olive-gradient"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold-500/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/20 animate-float">
            <Leaf className="w-12 h-12 text-gold-500" />
          </div>
          <h2 className="text-6xl font-black tracking-tighter mb-8 leading-tight">
            Elevate your <br /> lifestyle daily.
          </h2>
          <p className="text-xl text-olive-100/60 max-w-sm mx-auto font-medium">
            Join the elite circle of individuals who never compromise on their health or their time.
          </p>
        </div>
        <div className="absolute bottom-10 left-10 text-olive-100/20 font-black text-9xl tracking-tighter pointer-events-none uppercase">Vital</div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-10 md:px-24 py-20 animate-in slide-in-from-right-10 duration-1000">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-16">
            <h1 className="text-5xl font-black text-olive-800 tracking-tighter mb-4">
              {isLoginMode ? 'Sign In' : 'Join Us'}
            </h1>
            <p className="text-lg text-gray-400 font-medium">
              {isLoginMode ? 'Access your gourmet subscription.' : 'Start your journey to better nutrition today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLoginMode && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Full Name</label>
                <div className="relative group">
                  <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-gold-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="E.g. Alexander Pierce"
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gold-500/30 focus:outline-none focus:ring-4 focus:ring-gold-500/5 transition-all text-sm font-bold"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Email Portfolio</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-gold-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@vital.com"
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gold-500/30 focus:outline-none focus:ring-4 focus:ring-gold-500/5 transition-all text-sm font-bold"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Secret Key</label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery((prev) => !prev);
                      setRecoveryMessage('');
                      setRecoveryError('');
                    }}
                    className="text-xs font-black text-gold-500 hover:text-gold-600"
                  >
                    Recovery
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-gold-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gold-500/30 focus:outline-none focus:ring-4 focus:ring-gold-500/5 transition-all text-sm font-bold"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm font-bold text-rose-500">{error}</div>
            )}

            {isLoginMode && showRecovery && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-olive-800">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  <p className="text-xs font-black uppercase tracking-widest">Password Recovery</p>
                </div>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => {
                    setRecoveryEmail(e.target.value);
                    if (recoveryMessage) setRecoveryMessage('');
                    if (recoveryError) setRecoveryError('');
                  }}
                  placeholder="name@vital.com"
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
                />
                {recoveryError && (
                  <p className="text-xs font-bold text-rose-500">{recoveryError}</p>
                )}
                {recoveryMessage && (
                  <p className="text-xs font-bold text-emerald-500">{recoveryMessage}</p>
                )}
                <button
                  type="button"
                  disabled={recoveryLoading}
                  onClick={async () => {
                    setRecoveryLoading(true);
                    setRecoveryError('');
                    setRecoveryMessage('');
                    if (!recoveryEmail) {
                      setRecoveryError('Enter your email address.');
                      setRecoveryLoading(false);
                      return;
                    }
                    try {
                      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: recoveryEmail }),
                      });
                      if (!res.ok) {
                        setRecoveryError('Unable to send recovery email.');
                      } else {
                        setRecoveryMessage('If this email exists, a reset link has been sent.');
                      }
                    } catch {
                      setRecoveryError('Unable to send recovery email.');
                    } finally {
                      setRecoveryLoading(false);
                    }
                  }}
                  className="w-full olive-gradient text-white py-4 rounded-2xl font-black text-sm disabled:opacity-50"
                >
                  {recoveryLoading ? 'Sending...' : 'Send Recovery Email'}
                </button>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full olive-gradient text-white py-6 rounded-2xl font-black text-xl hover:shadow-[0_20px_50px_rgba(45,58,45,0.2)] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <>
                  {isLoginMode ? 'Enter Workspace' : 'Initialize Account'} 
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-10 border-t border-gray-100">
            <p className="text-gray-400 font-bold mb-4">
              {isLoginMode ? "First time here?" : "Already part of the circle?"}
            </p>
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)} 
              className="text-olive-800 font-black text-lg hover:text-gold-500 transition-colors flex items-center gap-2"
            >
              {isLoginMode ? 'Create New Account' : 'Sign In To Portfolio'}
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Admin Access</p>
              <p className="text-xs text-olive-800/60 font-medium">
                Admins sign in via <span className="text-olive-800 font-bold">/admin/login</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
