import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Loader2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Checkout: React.FC = () => {
  const { cart, pricing, updateDeliveryDetails, placeOrder, loading: globalLoading } = useApp();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [squareError, setSquareError] = useState('');
  const cardRef = useRef<any>(null);
  const locationPrefill = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('locationPrefill');
      return raw ? (JSON.parse(raw) as { city?: string; zipCode?: string }) : {};
    } catch {
      return {};
    }
  }, []);
  const phonePrefill = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('phonePrefill');
      return raw ? (JSON.parse(raw) as { phone?: string }) : {};
    } catch {
      return {};
    }
  }, []);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: phonePrefill.phone || '',
    address: '',
    city: locationPrefill.city || '',
    zipCode: locationPrefill.zipCode || '',
    instructions: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    let mounted = true;
    let initInFlight = false;
    let initDone = false;
    const appId = import.meta.env.VITE_SQUARE_APP_ID as string | undefined;
    const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID as string | undefined;
    const squareEnv = (import.meta.env.VITE_SQUARE_ENV || 'sandbox').toLowerCase();
    const squareScriptSrc =
      squareEnv === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js';
    if (!appId || !locationId) {
      setSquareError('Square is not configured');
      return;
    }

    const initSquare = async () => {
      try {
        if (!mounted || initInFlight || initDone) return;
        initInFlight = true;
        if (!('Square' in window)) {
          const existingScript = document.querySelector<HTMLScriptElement>(
            `script[src="${squareScriptSrc}"]`
          );
          const loadScript = () =>
            new Promise<void>((resolve, reject) => {
              if (existingScript?.dataset.loaded === 'true') {
                resolve();
                return;
              }
              if (!existingScript) {
                const script = document.createElement('script');
                script.src = squareScriptSrc;
                script.async = true;
                script.onload = () => {
                  script.dataset.loaded = 'true';
                  resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Square'));
                document.body.appendChild(script);
                return;
              }
              existingScript.addEventListener('load', () => resolve(), { once: true });
              existingScript.addEventListener('error', () => reject(new Error('Failed to load Square')), { once: true });
            });
          await loadScript();
        }
        if (cardRef.current) {
          initInFlight = false;
          initDone = true;
          return;
        }

        const container = document.getElementById('card-container');
        if (container) {
          container.innerHTML = '';
        }

        const payments = await (window as any).Square.payments(appId, locationId);
        const card = await payments.card();
        await card.attach('#card-container');
        cardRef.current = card;
        if (mounted) setSquareReady(true);
        initDone = true;
        initInFlight = false;
      } catch {
        initInFlight = false;
        if (mounted) setSquareError('Square failed to initialize');
      }
    };

    initSquare();
    return () => {
      mounted = false;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
      setSquareReady(false);
      const container = document.getElementById('card-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percent' | 'amount'; value: number } | null>(null);
  const [couponSummary, setCouponSummary] = useState<{ discountAmount: number; totalAfterDiscount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Invalid phone';
    if (!formData.address) newErrors.address = 'Required';
    if (!formData.city) newErrors.city = 'Required';
    if (!formData.zipCode) newErrors.zipCode = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLocalLoading(true);
    updateDeliveryDetails(formData);
    
    // Logic for Square:
    // 1. Initialize Square Web Payments SDK
    // 2. card.tokenize() -> returns token
    // 3. send token to placeOrder(token)
    
    if (!cardRef.current) {
      setSquareError('Payment form not ready');
      setLocalLoading(false);
      return;
    }

    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        setSquareError(result.errors?.[0]?.message || 'Card tokenization failed');
        setLocalLoading(false);
        return;
      }
      const resultOrder = await placeOrder(
        result.token,
        totalAfterDiscount,
        formData,
        appliedCoupon?.code || null
      );
      if (resultOrder.ok) {
        navigate('/success', { state: { order: resultOrder.order } });
      }
    } catch {
      setSquareError('Payment failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = localLoading || globalLoading;
  const isFormComplete =
    !!formData.fullName &&
    !!formData.email &&
    /\S+@\S+\.\S+/.test(formData.email) &&
    !!formData.phone &&
    formData.phone.length >= 10 &&
    !!formData.address &&
    !!formData.city &&
    !!formData.zipCode;
  const discountAmount = couponSummary?.discountAmount ?? 0;
  const totalAfterDiscount = couponSummary?.totalAfterDiscount ?? pricing.totalPrice;

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          if (!res.ok) throw new Error('Location lookup failed');
          const data = await res.json();
          const address = data.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            '';
          const zipCode = address.postcode || '';
          sessionStorage.setItem(
            'locationPrefill',
            JSON.stringify({ city, zipCode })
          );
          setFormData((prev) => ({
            ...prev,
            city: prev.city || city,
            zipCode: prev.zipCode || zipCode,
          }));
        } catch {
          setLocationError('Unable to fetch city/pincode');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationError('Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleApplyCoupon = async () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon(null);
      setCouponSummary(null);
      setCouponError('Enter a coupon code');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized, items: cart, planId: pricing.planUsed?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data?.valid) {
        setAppliedCoupon(null);
        setCouponSummary(null);
        setCouponError(data?.error || 'Invalid coupon');
        return;
      }
      setAppliedCoupon({ code: data.code, type: data.type, value: data.value });
      setCouponSummary({
        discountAmount: data.discountAmount,
        totalAfterDiscount: data.totalAfterDiscount,
      });
      setCouponError('');
    } catch {
      setAppliedCoupon(null);
      setCouponSummary(null);
      setCouponError('Unable to validate coupon');
    }
  };

  return (
    <div className="py-40 bg-[#fdfcfb] min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-20">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-olive-800 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <h1 className="text-5xl font-black text-olive-800 tracking-tighter">Finalize Subscription</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-7 space-y-16">
            <section>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 olive-gradient rounded-2xl flex items-center justify-center text-white font-black shadow-lg">01</div>
                <h2 className="text-2xl font-black text-olive-800 tracking-tight">Delivery Infrastructure</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locating}
                  className="px-6 py-3 rounded-2xl bg-olive-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-colors disabled:opacity-60"
                >
                  {locating ? 'Locating...' : 'Use My Location'}
                </button>
                {locationError && (
                  <span className="text-xs font-bold text-rose-500">{locationError}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recipient Identity</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={`w-full bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-100'} rounded-2xl px-6 py-5 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all`} placeholder="Full Name" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Communications (Email)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold focus:outline-none" placeholder="name@vital.com" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Direct Line (Phone)</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold focus:outline-none" placeholder="(555) 000-0000" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Primary Residence</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold focus:outline-none" placeholder="123 Gourmet Way" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className={`w-full bg-gray-50 border ${errors.city ? 'border-red-500' : 'border-gray-100'} rounded-2xl px-6 py-5 font-bold focus:outline-none`}
                    placeholder="Your City"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pin Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={e => setFormData({...formData, zipCode: e.target.value})}
                    className={`w-full bg-gray-50 border ${errors.zipCode ? 'border-red-500' : 'border-gray-100'} rounded-2xl px-6 py-5 font-bold focus:outline-none`}
                    placeholder="e.g. 560001"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 olive-gradient rounded-2xl flex items-center justify-center text-white font-black shadow-lg">02</div>
                <h2 className="text-2xl font-black text-olive-800 tracking-tight">Secure Payment Integration</h2>
              </div>
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="bg-charcoal p-8 flex justify-between items-center text-white">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gold-500" />
                    <span className="font-black text-xs uppercase tracking-widest">Square Secure Terminal</span>
                  </div>
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="">
                  <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl overflow-hidden">
                    <div id="card-container" className="w-full max-w-full" />
                  </div>
                  {squareError && (
                    <div className="text-sm font-bold text-rose-500">
                      {squareError}
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-olive-50 rounded-2xl text-olive-800 text-xs font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    Encrypted transactions powered by Square PCI-DSS compliance.
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl sticky top-40 overflow-hidden">
              <div className="bg-charcoal text-white px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gold-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Vault Summary</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-10">
              <div className="space-y-6 mb-12 pb-12 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Base Subscription</span>
                  <span className="text-olive-800 font-black">${pricing.basePrice.toFixed(2)}</span>
                </div>
                {pricing.extraCharges > 0 && (
                  <div className="flex justify-between items-center text-gold-600">
                    <span className="font-bold text-sm uppercase tracking-widest">Supplemental Units</span>
                    <span className="font-black">+${pricing.extraCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Express Delivery</span>
                  <span className="text-emerald-500 font-black uppercase tracking-widest text-xs">Priority Comp'd</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-gold-600">
                    <span className="font-bold text-sm uppercase tracking-widest">
                      Coupon {appliedCoupon.code}
                    </span>
                    <span className="font-black">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="mb-10">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Apply Coupon
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value);
                      if (appliedCoupon || couponSummary) {
                        setAppliedCoupon(null);
                        setCouponSummary(null);
                      }
                      if (couponError) setCouponError('');
                    }}
                    placeholder="BALANCED10"
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="w-full sm:w-auto px-6 py-4 bg-olive-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-3 text-xs font-bold text-rose-500">{couponError}</p>
                )}
                {appliedCoupon && !couponError && (
                  <p className="mt-3 text-xs font-bold text-emerald-500">
                    Coupon applied
                  </p>
                )}
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Weekly Commitment</span>
                  <span className="text-4xl sm:text-5xl font-black text-olive-800 tracking-tighter">${totalAfterDiscount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={loading || !squareReady || !isFormComplete}
                className="w-full olive-gradient text-white py-8 rounded-[2rem] font-black text-2xl hover:shadow-[0_20px_60px_rgba(45,58,45,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-8 h-8 animate-spin" /> Authorizing...</>
                ) : (
                  `Execute Order`
                )}
              </button>
              <p className="text-center mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> High-Encryption Connection Secure
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
