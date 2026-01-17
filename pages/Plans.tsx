
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANS } from '../constants';
import { Plan } from '../types';

export const Plans: React.FC = () => {
  const { selectPlan } = useApp();
  const navigate = useNavigate();

  const handleSelect = (plan: Plan) => {
    selectPlan(plan);
    navigate('/meals');
  };

  return (
    <div className="py-40 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-50 text-gold-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm border border-gold-100">
            <Zap className="w-4 h-4 fill-current" />
            Simple Subscription
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-olive-800 tracking-tighter mb-10">
            Invest in your longevity.
          </h1>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-medium">
            Clear, transparent, and built to scale with your week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto relative">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-[3rem] p-12 border-2 transition-all duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.06)] hover:-translate-y-2 flex flex-col group ${
                plan.badge ? 'border-gold-500 ring-8 ring-gold-500/5' : 'border-gray-100'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-12 -translate-y-1/2 gold-gradient text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-3xl font-black text-olive-800 tracking-tight">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-olive-800 tracking-tighter">${plan.price}</span>
                  <span className="text-gray-400 font-black uppercase text-xs tracking-widest">/ week</span>
                </div>
                <p className="text-lg text-gray-500 mt-6 font-medium">Includes <span className="text-olive-800 font-extrabold">{plan.mealLimit} gourmet meals</span> per week.</p>
              </div>

              <div className="space-y-6 mb-16 flex-1">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-olive-800 group-hover/item:bg-olive-800 group-hover/item:text-white transition-all">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-600">Dynamic weekly menu rotation</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-olive-800 group-hover/item:bg-olive-800 group-hover/item:text-white transition-all">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-600">Priority weekend delivery</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-8 h-8 bg-gold-50 rounded-xl flex items-center justify-center text-gold-600 transition-all">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <span className="font-bold text-gray-900 underline decoration-gold-500/30 underline-offset-4">
                    Extra meals: <span className="font-black text-gold-600">${plan.extraPrice}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-olive-800 group-hover/item:bg-olive-800 group-hover/item:text-white transition-all">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-600">Seamless billing & skip logic</span>
                </div>
              </div>

              <button 
                onClick={() => handleSelect(plan)}
                className={`w-full py-7 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl group ${
                  plan.badge 
                    ? 'gold-gradient text-white shadow-gold-500/30 hover:shadow-gold-500/40' 
                    : 'bg-olive-800 text-white shadow-olive-800/10 hover:bg-charcoal'
                }`}
              >
                Choose {plan.name} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-32 max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-olive-50 rounded-3xl flex items-center justify-center text-olive-800 shrink-0">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-black text-olive-800 tracking-tight mb-2">The Vital Guarantee</h4>
              <p className="text-gray-500 font-medium leading-relaxed">Cancel, skip, or modify your subscription with zero penalties. We believe in our product, so we never lock you in.</p>
            </div>
            <a href="#" className="font-black text-gold-600 border-b-2 border-gold-500/30 pb-1 shrink-0 hover:text-gold-500 transition-colors">Read our policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};
