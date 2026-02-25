import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setError('Invalid verification link.');
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        );
        const data = await res.json().catch(() => ({}));
        if (mounted) {
          if (res.ok && data?.ok) {
            setStatus('success');
          } else {
            setStatus('error');
            setError(data?.error || 'Verification failed.');
          }
        }
      } catch {
        if (mounted) {
          setStatus('error');
          setError('Verification failed.');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token, email]);

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 olive-gradient rounded-2xl flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-olive-800 tracking-tight">Verify Email</h1>
        </div>

        {status === 'loading' && (
          <p className="text-gray-500">Verifying your email...</p>
        )}
        {status === 'success' && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-emerald-600">Your email has been verified.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full olive-gradient text-white py-4 rounded-2xl font-black"
            >
              Sign In
            </button>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-rose-500">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full olive-gradient text-white py-4 rounded-2xl font-black"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
