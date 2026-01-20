import React from 'react';
import { Plus, Minus, Flame, Leaf, Wind } from 'lucide-react';
import { Meal } from '../../types';

type MealCardProps = {
  meal: Meal;
  baseOptions: string[];
  selectedBase?: string;
  quantity: number;
  onSelectBase: (value: string) => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  baseOptions,
  selectedBase,
  quantity,
  onSelectBase,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col group w-full max-w-[420px] mx-auto md:max-w-none">
      <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
        />
        <div className="absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-black/50 backdrop-blur text-white flex items-center gap-2">
          {meal.isVeg ? <Leaf className="w-3 h-3" /> : <Wind className="w-3 h-3" />}
          {meal.isVeg ? 'Plant' : 'Protein'}
        </div>
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-[10px] font-black text-olive-800 flex items-center gap-2 shadow-xl">
          <Flame className="w-4 h-4 text-gold-500" /> {meal.calories}
        </div>
      </div>

      <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col">
        <h3 className="text-xl sm:text-2xl font-black text-olive-800 tracking-tight mb-4 break-words">
          {meal.name}
        </h3>
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
                    onClick={() => onSelectBase(option)}
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

        {quantity > 0 ? (
          <div className="flex items-center justify-between bg-olive-50 rounded-[1.5rem] p-2 border border-olive-100/50">
            <button
              onClick={onDecrement}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-olive-800 shadow-sm"
            >
              <Minus />
            </button>
            <span className="font-black text-olive-800">{quantity}</span>
            <button
              onClick={onIncrement}
              className="w-12 h-12 flex items-center justify-center olive-gradient rounded-2xl text-white shadow-lg"
            >
              <Plus />
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="w-full py-5 rounded-[1.5rem] font-black text-sm uppercase bg-olive-800 text-white hover:bg-gold-500 shadow-xl transition-all"
          >
            Add Asset{selectedBase ? ` · ${selectedBase}` : ''}
          </button>
        )}
      </div>
    </div>
  );
};
