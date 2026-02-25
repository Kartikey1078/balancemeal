import React, { useMemo, useState } from "react";

type Ingredient = {
  name: string;
  baseQuantity: number;
  unit: string;
};

const BASE_SERVINGS = 4;
const RECIPE_NAME = "Master Recipe";

const INGREDIENTS: Ingredient[] = [
  { name: "Quinoa", baseQuantity: 200, unit: "g" },
  { name: "Chickpeas", baseQuantity: 250, unit: "g" },
  { name: "Tomato Puree", baseQuantity: 150, unit: "ml" },
  { name: "Spinach", baseQuantity: 120, unit: "g" },
  { name: "Olive Oil", baseQuantity: 2, unit: "tbsp" },
  { name: "Salt", baseQuantity: 1.5, unit: "tsp" },
];

export const MasterRecipe: React.FC = () => {
  const [desiredServings, setDesiredServings] = useState(BASE_SERVINGS);

  const multiplier = useMemo(() => {
    if (!BASE_SERVINGS) return 1;
    return Number(desiredServings) / BASE_SERVINGS;
  }, [desiredServings]);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="bg-[#1C1C1C] p-8 rounded-[2rem] border border-white/5">
          <h1 className="text-3xl font-black tracking-tight mb-6">
            Master Recipe Page
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                Recipe Name
              </p>
              <p className="text-lg font-bold text-white">{RECIPE_NAME}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                Base Servings
              </p>
              <p className="text-lg font-bold text-white">{BASE_SERVINGS}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                Desired Servings
              </label>
              <input
                type="number"
                min={1}
                value={desiredServings}
                onChange={(e) => setDesiredServings(Number(e.target.value || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                Multiplier
              </p>
              <p className="text-lg font-black text-gold-500">
                {(Number.isFinite(multiplier) ? multiplier : 1).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400">
            Formula: Multiplier = Desired Servings ÷ Base Servings
          </div>
        </div>

        <div className="bg-[#1C1C1C] p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black tracking-tight">Ingredients</h2>
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest">
              Adjusted Quantity = Base Quantity × Multiplier
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="py-3 pr-4 border-b border-white/10">
                    Ingredient Name
                  </th>
                  <th className="py-3 px-4 border-b border-white/10 border-l border-white/10">
                    Base Quantity
                  </th>
                  <th className="py-3 px-4 border-b border-white/10 border-l border-white/10">
                    Unit
                  </th>
                  <th className="py-3 px-4 border-b border-white/10 border-l border-white/10">
                    Multiplier
                  </th>
                  <th className="py-3 pl-4 border-b border-white/10 border-l border-white/10 text-right">
                    Adjusted Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {INGREDIENTS.map((ingredient) => {
                  const adjusted = ingredient.baseQuantity * multiplier;
                  return (
                    <tr key={ingredient.name}>
                      <td className="py-4 pr-4 text-white font-bold border-b border-white/10">
                        {ingredient.name}
                      </td>
                      <td className="py-4 px-4 text-gray-300 border-b border-white/10 border-l border-white/10">
                        {ingredient.baseQuantity}
                      </td>
                      <td className="py-4 px-4 text-gray-300 border-b border-white/10 border-l border-white/10">
                        {ingredient.unit}
                      </td>
                      <td className="py-4 px-4 text-gray-300 border-b border-white/10 border-l border-white/10">
                        {multiplier.toFixed(2)}
                      </td>
                      <td className="py-4 pl-4 text-right text-white font-black border-b border-white/10 border-l border-white/10">
                        {Number.isFinite(adjusted)
                          ? adjusted.toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
