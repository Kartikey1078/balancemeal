import React from 'react';
import { BarChart3 } from 'lucide-react';

const macros = [
  { name: 'Carbs', range: '45% - 60%', value: 55, color: 'bg-amber-400' },
  { name: 'Protein', range: '15% - 25%', value: 22, color: 'bg-emerald-500' },
  { name: 'Fats', range: '25% - 35%', value: 30, color: 'bg-rose-400' },
];

export const BalancedDiet: React.FC = () => {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#026255]/10 text-[#026255] text-xs font-black uppercase tracking-[0.2em] mb-6">
              <BarChart3 className="w-4 h-4 text-[#ff7733]" />
              Balanced Nutrition
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-olive-800 tracking-tight">
              How a Perfect Balanced Diet Looks Like
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              At Balanced Meal, we offer a variety of fresh Indian and Fusion dishes
              designed as per your body need. Our recipes are meticulously crafted by
              experienced nutrition experts to strike a balance by minimising excessive
              fat and carbs while incorporating additional protein and essential
              micronutrients. Each serving is precisely portioned to align with your
              individual calorie requirements.
            </p>

            <div className="mt-10 space-y-6">
              {macros.map((macro) => (
                <div key={macro.name} className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-olive-800">{macro.name}</p>
                      <p className="text-xs text-gray-500">{macro.range}</p>
                    </div>
                    <span className="text-sm font-black text-olive-800">
                      {macro.value}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full ${macro.color}`} style={{ width: `${macro.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 group">
              <img
                src="https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&q=80&w=900"
                alt="Balanced bowl"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 group">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=900"
                alt="Fresh ingredients"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="col-span-2 rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 group">
              <img
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=1200"
                alt="Indian fusion meals"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
