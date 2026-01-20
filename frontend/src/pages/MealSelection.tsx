import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Meal } from '../types';
import { MealCardSkeleton } from '../components/skeleton/MealCardSkeleton';

const MealCard = React.lazy(() => import('../components/meals/MealCard').then(module => ({
  default: module.MealCard,
})));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const MealSelection: React.FC = () => {
  const { cart, updateMealQuantity, addMealToCart, pricing } = useApp();
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [baseSelections, setBaseSelections] = useState<Record<string, string>>({});
  const [weekMeals, setWeekMeals] = useState<Meal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const navigate = useNavigate();

  const getWeekOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;
    return Math.floor((dayOfYear - 1) / 7) + 1;
  };

  const activeWeek = useMemo(() => {
    const rotationWeek = ((getWeekOfYear(new Date()) - 1) % 6) + 1;
    return rotationWeek;
  }, []);

  useEffect(() => {
    const loadMeals = async () => {
      setMealsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/meals?week=${activeWeek}`);
        const data = await res.json();
        setWeekMeals(Array.isArray(data) ? data : []);
      } catch {
        setWeekMeals([]);
      } finally {
        setMealsLoading(false);
      }
    };
    loadMeals();
  }, [activeWeek]);

  const filteredMeals = weekMeals.filter((meal) => {
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
          {mealsLoading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <MealCardSkeleton key={`meal-skeleton-${idx}`} />
              ))
            : filteredMeals.map((meal) => {
                const baseOptions = meal.baseOptions || [];
                const cartBaseSelection = cart.find((item) => {
                  const sameMeal = item.meal._id === meal._id || item.meal.id === meal.id;
                  return sameMeal && item.baseOption;
                })?.baseOption;
                const mealKey = meal._id || meal.id || meal.name;
                const selectedBase =
                  baseOptions.length > 0
                    ? baseSelections[mealKey] || cartBaseSelection || baseOptions[0]
                    : undefined;
                const qty = getMealQuantity(mealKey, selectedBase);
                return (
                  <Suspense key={`${mealKey}-${selectedBase || 'default'}`} fallback={<MealCardSkeleton />}>
                    <MealCard
                      meal={meal}
                      baseOptions={baseOptions}
                      selectedBase={selectedBase}
                      quantity={qty}
                      onSelectBase={(option) =>
                        setBaseSelections((prev) => ({
                          ...prev,
                          [mealKey]: option,
                        }))
                      }
                      onAdd={() => addMealToCart(meal, selectedBase)}
                      onIncrement={() => updateMealQuantity(mealKey, 1, selectedBase)}
                      onDecrement={() => updateMealQuantity(mealKey, -1, selectedBase)}
                    />
                  </Suspense>
                );
              })}
        </div>
      </div>

      <div className="fixed bottom-3 sm:bottom-10 left-1/2 -translate-x-1/2 z-[90] w-full max-w-5xl px-3 sm:px-6 pointer-events-none">
        <div className="bg-olive-900/90 backdrop-blur-2xl rounded-[1.25rem] sm:rounded-[3rem] px-4 py-3 sm:p-8 shadow-2xl border border-white/10 flex items-center justify-between gap-3 sm:gap-10 pointer-events-auto">
          <div className="flex items-center gap-3 sm:gap-12">
            <div>
              <p className="hidden sm:block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Allocation</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl sm:text-5xl font-black text-white">{pricing.totalMeals}</span>
                <span className="text-white/20 text-base sm:text-2xl font-black mb-0.5">/</span>
                <span className="text-gold-500 text-base sm:text-2xl font-black mb-0.5">{pricing.planUsed.mealLimit}</span>
              </div>
              <p className="sm:hidden text-[10px] font-black text-white/50 uppercase tracking-widest mt-1">Meals</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Subscription</p>
              <span className="text-lg font-black text-white">{pricing.planUsed.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-10">
            <div className="text-right">
              <p className="hidden sm:block text-[9px] font-black text-white/40 uppercase mb-1">Weekly Commitment</p>
              <div className="text-xl sm:text-5xl font-black text-white tracking-tighter">${pricing.totalPrice.toFixed(2)}</div>
              <p className="sm:hidden text-[10px] font-black text-white/50 uppercase tracking-widest">Weekly</p>
            </div>
            <button
              onClick={() => navigate('/cart')}
              disabled={pricing.totalMeals === 0}
              className={`px-4 sm:px-12 py-3 sm:py-6 rounded-[1rem] sm:rounded-[2rem] font-black text-sm sm:text-xl flex items-center justify-center gap-2 sm:gap-4 transition-all ${
                pricing.totalMeals === 0 ? 'bg-white/5 text-white/20' : 'gold-gradient text-white hover:scale-105'
              }`}
            >
              <span className="hidden sm:inline">Review</span>
              <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
