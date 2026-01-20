import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight, Play, Award, Zap, Heart, Sparkles, MapPin, Phone } from 'lucide-react';
import { NutritiousMealPlans } from '../components/home/NutritiousMealPlans';
import { HowItWorks } from '../components/home/HowItWorks';
import { BalancedDiet } from '../components/home/BalancedDiet';
import { QueryMapSection } from '../components/home/QueryMapSection';
import { Testimonials } from '../components/home/Testimonials';

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  gradient,
}: {
  icon: any;
  title: string;
  desc: string;
  gradient: string;
}) => (
  <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
    <div className="absolute -top-20 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[40px] bg-[#ff7733]/20" />
    <div className="absolute -bottom-24 -left-16 w-52 h-52 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[50px] bg-[#026255]/20" />
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg ${gradient} group-hover:scale-110 transition-transform duration-500`}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-2xl font-extrabold mb-4 text-olive-800 tracking-tight">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
  </div>
);

export const Home: React.FC = () => {
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [locationDismissedAt, setLocationDismissedAt] = useState<number | null>(() => {
    const raw = sessionStorage.getItem('locationPromptDismissedAt');
    return raw ? Number(raw) : null;
  });
  const [phoneDismissedAt, setPhoneDismissedAt] = useState<number | null>(() => {
    const raw = sessionStorage.getItem('phonePromptDismissedAt');
    return raw ? Number(raw) : null;
  });

  useEffect(() => {
    if (showLocationPrompt) return;
    const hasPrefill = !!sessionStorage.getItem('locationPrefill');
    if (hasPrefill) return;
    if (locationDismissedAt) {
      const elapsed = Date.now() - locationDismissedAt;
      const remaining = Math.max(0, 15000 - elapsed);
      const timer = window.setTimeout(() => {
        setShowLocationPrompt(true);
      }, remaining);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setShowLocationPrompt(true);
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [locationDismissedAt, showLocationPrompt]);

  useEffect(() => {
    if (showLocationPrompt || showPhonePrompt) return;
    const hasPrefill = !!sessionStorage.getItem('phonePrefill');
    if (hasPrefill) return;
    if (phoneDismissedAt) {
      const elapsed = Date.now() - phoneDismissedAt;
      const remaining = Math.max(0, 10000 - elapsed);
      const timer = window.setTimeout(() => {
        setShowPhonePrompt(true);
      }, remaining);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setShowPhonePrompt(true);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [phoneDismissedAt, showLocationPrompt, showPhonePrompt]);


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
          setShowLocationPrompt(false);
          const phoneDismissed =
            sessionStorage.getItem('phonePromptDismissedAt') !== null;
          const phonePrefill = !!sessionStorage.getItem('phonePrefill');
          if (!phoneDismissed && !phonePrefill) {
            setShowPhonePrompt(true);
          }
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

  const handleDismissPrompt = () => {
    const now = Date.now();
    sessionStorage.setItem('locationPromptDismissedAt', String(now));
    setLocationDismissedAt(now);
    setShowLocationPrompt(false);
    const phoneDismissed =
      sessionStorage.getItem('phonePromptDismissedAt') !== null;
    const phonePrefill = !!sessionStorage.getItem('phonePrefill');
    if (!phoneDismissed && !phonePrefill) {
      setShowPhonePrompt(true);
    }
  };

  const handleSavePhone = () => {
    const normalized = phoneInput.trim();
    if (!normalized) {
      setPhoneError('Enter a phone number or skip');
      return;
    }
    sessionStorage.setItem('phonePrefill', JSON.stringify({ phone: normalized }));
    sessionStorage.removeItem('phonePromptDismissedAt');
    setShowPhonePrompt(false);
  };

  const handleSkipPhone = () => {
    const now = Date.now();
    sessionStorage.setItem('phonePromptDismissedAt', String(now));
    setPhoneDismissedAt(now);
    setShowPhonePrompt(false);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[120%] -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ff7733]/15 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-0 left-[-5%] w-[40%] h-[40%] bg-[#026255]/15 blur-[140px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#026255]/10 text-[#026255] rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#ff7733]" />
                The Future of Fine Nutrition
              </div>
              <h1 className="text-6xl lg:text-8xl font-black leading-[1.05] mb-10 text-olive-800 tracking-tighter">
                Gourmet health. <br />
                <span className="text-[#ff7733] underline decoration-[#026255]/20 underline-offset-[10px]">Zero friction.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-500 mb-12 leading-relaxed">
                Experience chef-curated meals that mirror high-end dining, delivered with the convenience of a modern SaaS.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/plans" className="text-white px-10 py-6 rounded-[2rem] font-bold text-xl transition-all flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(2,98,85,0.25)] hover:shadow-[0_24px_60px_rgba(2,98,85,0.35)] bg-[linear-gradient(135deg,#026255_0%,#0d8a77_100%)]">
                  Start Your Journey <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/meals" className="bg-white text-[#026255] border-2 border-[#026255]/10 px-10 py-6 rounded-[2rem] font-bold text-xl hover:bg-[#026255]/5 transition-all flex items-center justify-center gap-3">
                  <Play className="w-5 h-5 fill-[#026255]" /> Explore Menu
                </Link>
              </div>

              <div className="mt-16 flex items-center gap-10">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg" alt="User" />
                  ))}
                  <div className="w-14 h-14 rounded-2xl bg-gold-500 border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">+4k</div>
                </div>
                <div>
                <div className="flex text-[#ff7733] mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trustpilot 4.9/5</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-[4rem] rotate-6 scale-95 opacity-10 group-hover:rotate-3 transition-transform duration-700 bg-[linear-gradient(135deg,#026255_0%,#ff7733_100%)]"></div>
              <div className="relative rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-8 border-white group-hover:-translate-y-4 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-[700px] object-cover" 
                  alt="Fine dining" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-olive-900/40 to-transparent"></div>
              </div>
              
              {/* Floating KPI */}
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 flex items-center gap-6 animate-float">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#ff7733]/30 bg-[linear-gradient(135deg,#ff7733_0%,#ff9b66_100%)]">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Chef Standard</p>
                  <p className="text-2xl font-extrabold text-olive-800 leading-none">Michelin Grade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-[#F9FBF9]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end mb-24">
            <div className="lg:col-span-2">
              <h2 className="text-4xl lg:text-6xl font-black text-olive-800 tracking-tighter mb-8 leading-tight">
                Crafted for those who <br /> demand the best.
              </h2>
              <p className="text-xl text-gray-500 max-w-xl">We treat nutrition like high-performance software: efficient, reliable, and constantly improving.</p>
            </div>
            <div className="flex lg:justify-end">
              <Link to="/plans" className="text-lg font-extrabold text-olive-800 hover:text-gold-500 flex items-center gap-2 group">
                Compare all features <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={Zap} 
              title="Hyper-Efficiency" 
              desc="Save 15+ hours per week on cooking and meal prep. Optimized for your busy lifestyle." 
              gradient="bg-[linear-gradient(135deg,#026255_0%,#0d8a77_100%)]"
            />
            <FeatureCard 
              icon={Heart} 
              title="Whole Nutrition" 
              desc="Precisely calculated macros and micros for sustained energy and metabolic health." 
              gradient="bg-[linear-gradient(135deg,#ff7733_0%,#ff9b66_100%)]"
            />
            <FeatureCard 
              icon={Check} 
              title="Absolute Choice" 
              desc="Our 100% dynamic rotation ensures you never eat the same meal twice in a month." 
              gradient="bg-[linear-gradient(135deg,#0f4c81_0%,#38bdf8_100%)]"
            />
          </div>
        </div>
      </section>

      <NutritiousMealPlans />
      <HowItWorks />
      <BalancedDiet />
      <QueryMapSection />
      <Testimonials />

      {/* Final Call */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="olive-gradient rounded-[4rem] p-16 lg:p-32 relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400 blur-[100px]"></div>
            </div>
            
            <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter mb-12 relative z-10">
              Your health is <br /> non-negotiable.
            </h2>
            <p className="text-xl lg:text-3xl text-olive-100/70 mb-16 max-w-2xl mx-auto relative z-10 font-medium">
              Join the club of top-tier professionals who outsource their nutrition to VitalEats.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <Link to="/plans" className="px-14 py-6 bg-white text-olive-800 rounded-3xl font-black text-xl hover:scale-105 transition-transform shadow-2xl">
                Select Your Plan
              </Link>
              <Link to="/meals" className="px-14 py-6 border-2 border-white/20 text-white rounded-3xl font-black text-xl hover:bg-white/10 transition-all">
                View Weekly Menu
              </Link>
            </div>
          </div>
        </div>
      </section>
      {showLocationPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismissPrompt}
          ></div>
          <div className="relative z-10 w-full max-w-sm bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-7 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#ff7733]/20 blur-[30px]" />
            <div className="absolute -bottom-16 -left-12 w-32 h-32 rounded-full bg-[#026255]/20 blur-[30px]" />
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#026255]/10 text-[#026255] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-olive-800 tracking-tight">
                Use your location?
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              We’ll auto-fill your city and pin code for faster checkout.
            </p>
            {locationError && (
              <div className="mb-4 text-xs font-black text-rose-500">
                {locationError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="flex-1 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-60 bg-[linear-gradient(135deg,#026255_0%,#0d8a77_100%)] hover:shadow-[0_10px_24px_rgba(2,98,85,0.25)]"
              >
                {locating ? 'Locating...' : 'Allow Location'}
              </button>
              <button
                type="button"
                onClick={handleDismissPrompt}
                className="flex-1 bg-white border border-gray-200 text-olive-800 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
      {showPhonePrompt && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleSkipPhone}
          ></div>
          <div className="relative z-10 w-full max-w-sm bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-7 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#026255]/20 blur-[30px]" />
            <div className="absolute -bottom-16 -left-12 w-32 h-32 rounded-full bg-[#ff7733]/20 blur-[30px]" />
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#ff7733]/10 text-[#ff7733] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-olive-800 tracking-tight">
                Add your phone number
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Optional, but helps with delivery updates at checkout.
            </p>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => {
                setPhoneInput(e.target.value);
                setPhoneError('');
              }}
              placeholder="(555) 000-0000"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
            />
            {phoneError && (
              <div className="mt-3 text-xs font-black text-rose-500">
                {phoneError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={handleSavePhone}
                className="flex-1 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-[linear-gradient(135deg,#026255_0%,#0d8a77_100%)] hover:shadow-[0_10px_24px_rgba(2,98,85,0.25)]"
              >
                Save Number
              </button>
              <button
                type="button"
                onClick={handleSkipPhone}
                className="flex-1 bg-white border border-gray-200 text-olive-800 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
