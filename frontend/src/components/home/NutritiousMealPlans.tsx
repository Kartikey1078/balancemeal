import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLANS } from '../../constants';

export const NutritiousMealPlans: React.FC = () => {
  return (
    <section className="py-28 bg-[#F6FBFA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#026255]/10 text-[#026255] text-xs font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4 text-[#ff7733]" />
              Our Nutritious Meal Plans
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-[#053b34] tracking-tight">
              Our Nutritious Meal Plans
            </h2>
            <p className="mt-4 text-lg text-[#4b625f] max-w-2xl">
              Choose a plan designed around your lifestyle. Every plate is portioned,
              macro-balanced, and chef-finished for consistency.
            </p>
          </div>
          <Link
            to="/plans"
            className="text-sm font-black uppercase tracking-widest text-[#026255] flex items-center gap-2 hover:text-[#ff7733]"
          >
            Compare all plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-[2.5rem] border border-white/60 bg-white shadow-[0_20px_60px_rgba(2,98,85,0.08)] hover:shadow-[0_30px_80px_rgba(2,98,85,0.14)] transition-all duration-500 p-8 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#ff7733]/15 blur-[40px]" />
                <div className="absolute -bottom-24 -left-10 w-48 h-48 rounded-full bg-[#026255]/15 blur-[60px]" />
              </div>
              <div className="flex items-center justify-between">
                {plan.badge ? (
                  <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#ff7733]/15 text-[#ff7733]">
                    {plan.badge}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#026255]/10 text-[#026255]">
                    Balanced Plan
                  </div>
                )}
                <div className="text-[10px] font-black uppercase tracking-widest text-[#4b625f]">
                  {plan.mealLimit} meals / week
                </div>
              </div>
              <h3 className="mt-6 text-3xl font-black text-[#053b34]">{plan.name}</h3>
              <p className="mt-3 text-[#4b625f] leading-relaxed">
                Portion-controlled meals tailored to your plan size.
              </p>
              <div className="mt-8 flex items-center justify-between rounded-2xl bg-[#026255]/5 px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7b918d]">
                    Starting at
                  </p>
                  <p className="text-3xl font-black text-[#053b34]">${plan.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7b918d]">
                    Plan Size
                  </p>
                  <p className="text-lg font-black text-[#053b34]">{plan.mealLimit} meals</p>
                </div>
              </div>
              <Link
                to="/plans"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl text-white py-4 font-black text-sm uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all bg-[linear-gradient(135deg,#026255_0%,#0d8a77_100%)]"
              >
                View Plan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
