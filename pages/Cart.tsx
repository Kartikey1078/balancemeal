
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ChevronLeft, ArrowRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Cart: React.FC = () => {
  const {
    cart,
    updateMealQuantity,
    removeMealFromCart,
    pricing,
    updateCartItemSplit,
  } = useApp();
  const navigate = useNavigate();
  const splitValid = cart.every((item) => {
    if (item.meal.allowSplit === false) return true;
    const split = item.deliverySplit || { sunday: item.quantity, wednesday: 0 };
    return split.sunday + split.wednesday === item.quantity;
  });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-12 rounded-[2rem] shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-10">Choose some delicious meals to get started with your subscription.</p>
          <Link to="/meals" className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg block">
            Browse Weekly Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <button onClick={() => navigate('/meals')} className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold mb-10 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Meals
        </button>

        <h1 className="text-3xl font-bold mb-12">Review Your Selections</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const mealKey = item.meal._id || item.meal.id || item.meal.name;
              return (
              <div key={`${mealKey}-${item.baseOption || 'default'}`} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                <img src={item.meal.image} className="w-24 h-24 rounded-xl object-cover" alt={item.meal.name} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.meal.name}</h3>
                  <p className="text-sm text-gray-400">{item.meal.calories} calories • {item.meal.isVeg ? 'Vegetarian' : 'Non-Veg'}</p>
                  {item.baseOption && (
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">
                      Base: {item.baseOption}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateMealQuantity(mealKey, -1, item.baseOption)}
                        className="p-1 px-3 hover:bg-gray-100 transition-colors text-gray-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateMealQuantity(mealKey, 1, item.baseOption)}
                        className="p-1 px-3 hover:bg-gray-100 transition-colors text-gray-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {item.meal.allowSplit !== false && (
                    <>
                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Sunday
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={item.quantity}
                            value={item.deliverySplit?.sunday ?? item.quantity}
                            onChange={(e) =>
                              updateCartItemSplit(
                              mealKey,
                                {
                                  sunday: Number(e.target.value),
                                  wednesday: item.deliverySplit?.wednesday ?? 0,
                                },
                                item.baseOption
                              )
                            }
                            className="w-20 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Wednesday
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={item.quantity}
                            value={item.deliverySplit?.wednesday ?? 0}
                            onChange={(e) =>
                              updateCartItemSplit(
                              mealKey,
                                {
                                  sunday: item.deliverySplit?.sunday ?? item.quantity,
                                  wednesday: Number(e.target.value),
                                },
                                item.baseOption
                              )
                            }
                            className="w-20 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none"
                          />
                        </div>
                      </div>
                      {(item.deliverySplit?.sunday ?? item.quantity) +
                        (item.deliverySplit?.wednesday ?? 0) !==
                        item.quantity && (
                        <div className="mt-3 text-xs font-bold text-rose-500">
                          Split must equal {item.quantity}.
                        </div>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => removeMealFromCart(mealKey, item.baseOption)}
                  className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-32">
              <h2 className="text-xl font-bold mb-8">Order Summary</h2>
              <div className="space-y-4 pb-8 border-b border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Selected Meals</span>
                  <span className="font-bold text-gray-900">{pricing.totalMeals}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Base Plan ({pricing.planUsed.name})</span>
                  <span className="font-bold text-gray-900">${pricing.basePrice.toFixed(2)}</span>
                </div>
                {pricing.extraCharges > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Extra Meals Charges</span>
                    <span>+${pricing.extraCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
              </div>
              {!splitValid && (
                <div className="pt-6 pb-6 border-b border-gray-100">
                  <div className="text-xs font-bold text-rose-500">
                    Please allocate Sunday/Wed splits for all meals.
                  </div>
                </div>
              )}
              <div className="pt-8 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 font-bold">Total Price</span>
                  <span className="text-4xl font-bold text-gray-900">${pricing.totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">Charged weekly. Cancel anytime.</p>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                disabled={!splitValid}
                className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
