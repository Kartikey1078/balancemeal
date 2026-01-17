import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Flame, Bookmark, ShoppingBag } from 'lucide-react';
import { Recipe } from '../types';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneDismissedAt, setPhoneDismissedAt] = useState<number | null>(() => {
    const raw = sessionStorage.getItem('phonePromptDismissedAt');
    return raw ? Number(raw) : null;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch {
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (showPhonePrompt) return;
    const hasPrefill = !!sessionStorage.getItem('phonePrefill');
    if (hasPrefill) return;
    if (phoneDismissedAt) {
      const elapsed = Date.now() - phoneDismissedAt;
      const remaining = Math.max(0, 15000 - elapsed);
      const timer = window.setTimeout(() => {
        setShowPhonePrompt(true);
      }, remaining);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setShowPhonePrompt(true);
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [phoneDismissedAt, showPhonePrompt]);

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

  const content = (() => {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#fdfcfb] pt-32 px-6">Loading...</div>
      );
    }
    if (!recipe) {
      return (
        <div className="min-h-screen bg-[#fdfcfb] pt-32 px-6">
          <div className="max-w-3xl mx-auto text-gray-500">
            Recipe not found.
          </div>
        </div>
      );
    }

    const totalTime = recipe.prepTime + recipe.cookTime;

    return (
      <div className="min-h-screen bg-[#fdfcfb] pt-32 pb-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <Link to="/recipes" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-olive-800">
              Back to Recipes
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl">
              <img src={recipe.image} className="w-full h-[420px] object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-olive-50 text-olive-700 border-olive-100">
                  {recipe.category}
                </span>
                {(recipe.tags || []).map((tag) => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl font-black text-olive-800 tracking-tighter">
                {recipe.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {totalTime} min
                </span>
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gold-500" /> {recipe.nutrition?.calories ?? 0} kcal
                </span>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button className="olive-gradient text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest">
                  Add to Meal Plan
                </button>
                <button className="bg-white border border-olive-100 text-olive-800 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Save Recipe
                </button>
                {/* <button className="bg-white border border-olive-100 text-olive-800 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Add Ingredients
                </button> */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-xl font-black text-olive-800 mb-6">Ingredients</h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, index) => (
                    <li key={`${ing.name}-${index}`} className="flex items-center justify-between text-gray-600">
                      <span>{ing.name}</span>
                      <span className="font-bold text-gray-400">
                        {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-black text-olive-800 mb-6">Cooking Instructions</h2>
                <ol className="space-y-4">
                  {recipe.steps.map((step) => (
                    <li key={step.step} className="bg-white border border-gray-100 rounded-2xl p-5 text-gray-600">
                      <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Step {step.step}
                      </div>
                      {step.description}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Prep Time</span>
                    <span className="font-bold">{recipe.prepTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cook Time</span>
                    <span className="font-bold">{recipe.cookTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty</span>
                    <span className="font-bold">{recipe.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servings</span>
                    <span className="font-bold">{recipe.servings}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Nutrition</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="bg-olive-50 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calories</div>
                    <div className="text-lg font-black text-olive-800">{recipe.nutrition?.calories ?? 0}</div>
                  </div>
                  <div className="bg-olive-50 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Protein</div>
                    <div className="text-lg font-black text-olive-800">{recipe.nutrition?.protein ?? 0}g</div>
                  </div>
                  <div className="bg-olive-50 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carbs</div>
                    <div className="text-lg font-black text-olive-800">{recipe.nutrition?.carbs ?? 0}g</div>
                  </div>
                  <div className="bg-olive-50 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fat</div>
                    <div className="text-lg font-black text-olive-800">{recipe.nutrition?.fat ?? 0}g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <>
      {content}
      {showPhonePrompt && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleSkipPhone}
          ></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-10">
            <h3 className="text-2xl font-black text-olive-800 tracking-tight mb-3">
              Add your phone number
            </h3>
            <p className="text-gray-500 mb-8">
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
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold focus:outline-none"
            />
            {phoneError && (
              <div className="mt-4 text-sm font-bold text-rose-500">
                {phoneError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={handleSavePhone}
                className="flex-1 olive-gradient text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_12px_30px_rgba(45,58,45,0.25)] transition-all"
              >
                Save Number
              </button>
              <button
                type="button"
                onClick={handleSkipPhone}
                className="flex-1 bg-white border border-gray-200 text-olive-800 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
