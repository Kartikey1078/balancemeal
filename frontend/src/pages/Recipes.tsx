import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { RecipeSkeleton } from '../components/skeleton/RecipeSkeleton';

export const Recipes: React.FC = () => {
  const { recipes, recipesLoading } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(recipes.map((r) => r.category)))],
    [recipes]
  );

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return recipes;
    return recipes.filter((r) => r.category === selectedCategory);
  }, [recipes, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fdfcfb] pt-32 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-olive-800 tracking-tighter">
              Recipe Library
            </h1>
            <p className="text-gray-500 mt-4">
              Explore chef-designed recipes with clear nutrition data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedCategory === cat
                    ? 'bg-olive-800 text-white border-olive-800'
                    : 'bg-white text-olive-800 border-olive-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {recipesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, idx) => (
              <RecipeSkeleton key={`recipe-skeleton-${idx}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400 text-sm">No recipes available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filtered.map((recipe) => (
              <Link
                key={recipe._id}
                to={`/recipes/${recipe._id}`}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={recipe.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                  />
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-[10px] font-black text-olive-800 flex items-center gap-2 shadow-xl">
                    <Flame className="w-4 h-4 text-gold-500" />
                    {recipe.nutrition?.calories ?? 0} kcal
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-black text-olive-800">
                      {recipe.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border bg-olive-50 text-olive-700 border-olive-100">
                      {recipe.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3 mb-4">
                    <Clock className="w-4 h-4" /> {recipe.prepTime + recipe.cookTime} min
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(recipe.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border bg-white text-gray-400 border-gray-100"
                      >
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
