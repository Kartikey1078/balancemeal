import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Nutrition Punch',
    desc: 'Balanced macros with high micronutrient density for everyday energy.',
    highlight: 'Best for busy professionals',
    price: '$10.99',
    meals: '5+ meals/week',
  },
  {
    name: 'Lean & Clean',
    desc: 'Higher protein, lighter carbs, and calorie-smart portions.',
    highlight: 'Best for weight goals',
    price: '$12.99',
    meals: '6+ meals/week',
  },
  {
    name: 'Performance Plus',
    desc: 'Hearty portions, extra protein, and athlete-grade recovery meals.',
    highlight: 'Best for gym routines',
    price: '$14.99',
    meals: '7+ meals/week',
  },
];

export const NutritiousMealPlans: React.FC = () => {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#026255]/10 text-[#026255] text-xs font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4 text-[#ff7733]" />
              Our Nutritious Meal Plans
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-olive-800 tracking-tight">
              Our Nutritious Meal Plans
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl">
              Choose a plan designed around your lifestyle. Every plate is portioned,
              macro-balanced, and chef-finished for consistency.
            </p>
          </div>
          <Link
            to="/plans"
            className="text-sm font-black uppercase tracking-widest text-olive-800 flex items-center gap-2 hover:text-gold-500"
          >
            Compare all plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[2.5rem] border border-gray-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 p-8 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gold-400/10 blur-[40px]" />
                <div className="absolute -bottom-24 -left-10 w-48 h-48 rounded-full bg-olive-800/10 blur-[60px]" />
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff7733]">
                {plan.highlight}
              </div>
              <h3 className="mt-4 text-2xl font-black text-olive-800">{plan.name}</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">{plan.desc}</p>
              <div className="mt-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Starting at
                  </p>
                  <p className="text-2xl font-black text-olive-800">{plan.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Plan Size
                  </p>
                  <p className="text-lg font-black text-olive-800">{plan.meals}</p>
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
