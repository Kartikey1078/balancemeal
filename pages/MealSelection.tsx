
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Flame, ChevronRight, ShoppingCart, Leaf, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MealSelection: React.FC = () => {
  const { cart, updateMealQuantity, addMealToCart, pricing, meals } = useApp();
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [baseSelections, setBaseSelections] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const getWeekOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;
    return Math.floor((dayOfYear - 1) / 7) + 1;
  };

  const availableWeeks = useMemo(() => {
    const weekSet = new Set<number>();
    meals.forEach((meal) => weekSet.add(meal.week ?? 1));
    return Array.from(weekSet).sort((a, b) => a - b);
  }, [meals]);

  const activeWeek = useMemo(() => {
    const rotationWeek = ((getWeekOfYear(new Date()) - 1) % 6) + 1;
    if (availableWeeks.length === 0) return rotationWeek;
    const candidates = [
      ...Array.from({ length: 6 }, (_, i) => ((rotationWeek - 1 + i) % 6) + 1),
    ];
    const nextWeek = candidates.find((week) => availableWeeks.includes(week));
    return nextWeek ?? rotationWeek;
  }, [availableWeeks]);

  const filteredMeals = meals.filter((meal) => {
    const week = meal.week ?? 1;
    if (week !== activeWeek) return false;
    if (filter === 'veg') return meal.isVeg;
    if (filter === 'non-veg') return !meal.isVeg;
    return true;
  });

  const getMealQuantity = (id: string, baseOption?: string) =>
    cart.find(m => {
      const sameMeal = m.meal._id === id || m.meal.id === id;
      const sameBase = (m.baseOption || '') === (baseOption || '');
      return sameMeal && sameBase;
    })?.quantity || 0;

  return (
    <div className="min-h-screen bg-[#fdfcfb] pt-32 pb-60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-7xl font-black text-olive-800 tracking-tighter mb-6">Curate your week.</h1>
            <p className="text-xl text-gray-400 font-medium">Chef-prepped assets for the high-performance individual.</p>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-olive-600">
              Week {activeWeek} menu
            </p>
          </div>
          <div className="flex bg-white p-2 rounded-3xl border border-gray-100 shadow-xl overflow-x-auto no-scrollbar">
            {(['all', 'veg', 'non-veg'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'gold-gradient text-white shadow-xl' : 'text-gray-400 hover:text-olive-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          {filteredMeals.map((meal) => {
            const baseOptions = meal.baseOptions || [];
            const cartBaseSelection = cart.find((item) => {
              const sameMeal = item.meal._id === meal._id || item.meal.id === meal.id;
              return sameMeal && item.baseOption;
            })?.baseOption;
            const selectedBase =
              baseOptions.length > 0
                ? baseSelections[meal._id!] || cartBaseSelection || baseOptions[0]
                : undefined;
            const mealKey = meal._id || meal.id || meal.name;
            const qty = getMealQuantity(mealKey, selectedBase);
            return (
              <div
                key={`${mealKey}-${selectedBase || 'default'}`}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col group w-full max-w-[420px] mx-auto md:max-w-none"
              >
                <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-black/50 backdrop-blur text-white flex items-center gap-2">
                    {meal.isVeg ? <Leaf className="w-3 h-3" /> : <Wind className="w-3 h-3" />}
                    {meal.isVeg ? 'Plant' : 'Protein'}
                  </div>
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-[10px] font-black text-olive-800 flex items-center gap-2 shadow-xl">
                    <Flame className="w-4 h-4 text-gold-500" /> {meal.calories}
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-black text-olive-800 tracking-tight mb-4 break-words">{meal.name}</h3>
                  {/* <p className="text-gray-400 text-sm italic mb-10 line-clamp-2">"{meal.description}"</p> */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5 mb-4">
                    {[
                      { label: 'Calories', value: meal.calories },
                      { label: 'Protein', value: meal.protein },
                      { label: 'Fat', value: meal.fat },
                      { label: 'Carbs', value: meal.carbs },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-olive-50 border border-olive-100/60 rounded-md px-1.5 py-1.5 text-center"
                      >
                        <div className="text-[6px] font-black text-olive-500 uppercase tracking-[0.16em]">
                          {item.label}
                        </div>
                        <div className="mt-0.5 text-[13px] font-black text-olive-800 leading-tight">
                          {item.value ?? '--'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {baseOptions.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Choose Base
                        </label>
                        <span className="text-[10px] font-black text-olive-700 uppercase tracking-widest">
                          {selectedBase}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {baseOptions.map((option) => {
                          const selected = option === selectedBase;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setBaseSelections((prev) => ({
                                  ...prev,
                                  [meal._id!]: option,
                                }))
                              }
                              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                selected
                                  ? 'bg-olive-800 text-white border-olive-800 shadow-lg'
                                  : 'bg-olive-50 text-olive-700 border-olive-100 hover:bg-olive-100'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-[11px] text-gray-400 font-medium">
                        Pick a base to customize this meal.
                      </p>
                    </div>
                  )}

                  {qty > 0 ? (
                    <div className="flex items-center justify-between bg-olive-50 rounded-[1.5rem] p-2 border border-olive-100/50">
                      <button onClick={() => updateMealQuantity(mealKey, -1, selectedBase)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-olive-800 shadow-sm"><Minus /></button>
                      <span className="font-black text-olive-800">{qty}</span>
                      <button onClick={() => updateMealQuantity(mealKey, 1, selectedBase)} className="w-12 h-12 flex items-center justify-center olive-gradient rounded-2xl text-white shadow-lg"><Plus /></button>
                    </div>
                  ) : (
                    <button onClick={() => addMealToCart(meal, selectedBase)} className="w-full py-5 rounded-[1.5rem] font-black text-sm uppercase bg-olive-800 text-white hover:bg-gold-500 shadow-xl transition-all">
                      Add Asset{selectedBase ? ` · ${selectedBase}` : ''}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 z-[90] w-full max-w-5xl px-3 sm:px-6 pointer-events-none">
        <div className="bg-olive-900/90 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-10 pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-12 w-full lg:w-auto">
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Allocation</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl sm:text-5xl font-black text-white">{pricing.totalMeals}</span>
                <span className="text-white/20 text-lg sm:text-2xl font-black mb-1">/</span>
                <span className="text-gold-500 text-lg sm:text-2xl font-black mb-1">{pricing.planUsed.mealLimit}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Subscription</p>
              <span className="text-lg font-black text-white">{pricing.planUsed.name}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-16 w-full lg:w-auto">
            <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="text-[9px] font-black text-white/40 uppercase mb-1">Weekly Commitment</p>
              <div className="text-2xl sm:text-5xl font-black text-white tracking-tighter">${pricing.totalPrice.toFixed(2)}</div>
            </div>
            <button
              onClick={() => navigate('/cart')}
              disabled={pricing.totalMeals === 0}
              className={`w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-xl flex items-center justify-center gap-3 sm:gap-4 transition-all ${
                pricing.totalMeals === 0 ? 'bg-white/5 text-white/20' : 'gold-gradient text-white hover:scale-105'
              }`}
            >
              Review <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
