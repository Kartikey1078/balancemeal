
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Plan, Meal, CartItem, DeliveryDetails, Order, OrderStatus, Recipe, AdminUser } from '../types';
import { PLANS } from '../constants';

const API_BASE_URL = '/api';

interface AppContextType {
  user: User | null;
  selectedPlan: Plan | null;
  cart: CartItem[];
  orders: Order[];
  myOrders: Order[];
  deliveryDetails: DeliveryDetails | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  meals: Meal[];
  recipes: Recipe[];
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  selectPlan: (plan: Plan) => void;
  addMealToCart: (meal: Meal, baseOption?: string) => void;
  removeMealFromCart: (mealId: string, baseOption?: string) => void;
  updateMealQuantity: (mealId: string, delta: number, baseOption?: string) => void;
  updateCartItemSplit: (
    mealId: string,
    split: { sunday: number; wednesday: number },
    baseOption?: string
  ) => void;
  updateDeliveryDetails: (details: DeliveryDetails) => void;
  placeOrder: (
    paymentToken: string,
    amountOverride?: number,
    deliveryOverride?: DeliveryDetails | null
  ) => Promise<boolean>;
  fetchMyOrders: () => Promise<void>;
  pricing: {
    basePrice: number;
    extraCharges: number;
    totalPrice: number;
    planUsed: Plan;
    totalMeals: number;
  };
  adminData: {
    meals: Meal[];
    recipes: Recipe[];
    users: AdminUser[];
    allOrders: Order[];
    addMeal: (mealData: Partial<Meal>, imageFile?: File) => Promise<void>;
    updateMeal: (mealId: string, mealData: Partial<Meal>, imageFile?: File) => Promise<void>;
    deleteMeal: (mealId: string) => Promise<void>;
    toggleMealAvailability: (mealId: string) => Promise<void>;
    addRecipe: (recipeData: Partial<Recipe>, imageFile?: File) => Promise<void>;
    updateRecipe: (recipeId: string, recipeData: Partial<Recipe>, imageFile?: File) => Promise<void>;
    deleteRecipe: (recipeId: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    refreshData: () => Promise<void>;
    fetchUsers: (page?: number, limit?: number, search?: string, role?: string, hasOrders?: string) => Promise<{
      users: AdminUser[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const readStorage = <T,>(key: string, fallback: T) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(() =>
    readStorage<Plan | null>('selectedPlan', null)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>('cart', [])
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(() =>
    readStorage<DeliveryDetails | null>('deliveryDetails', null)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMeals();
    fetchRecipes();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    } else {
      localStorage.removeItem('selectedPlan');
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (deliveryDetails) {
      localStorage.setItem('deliveryDetails', JSON.stringify(deliveryDetails));
    } else {
      localStorage.removeItem('deliveryDetails');
    }
  }, [deliveryDetails]);


  const fetchMeals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/meals`);
      const data = await res.json();
      setMeals(data);
    } catch (e) {
      console.error('Fetch meals failed');
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/recipes`);
      const data = await res.json();
      setRecipes(data);
    } catch (e) {
      console.error('Fetch recipes failed');
    }
  };

  const isAdmin = user?.isAdmin || false;
  const isLoggedIn = !!user;

  const calculatePricing = () => {
    const totalMeals = cart.reduce((sum, item) => sum + item.quantity, 0);
    let planUsed = PLANS[0];
    if (totalMeals >= 10 || (selectedPlan && selectedPlan.id === 'plan_10')) {
      planUsed = PLANS[1];
    }
    const basePrice = planUsed.price;
    const extraCount = Math.max(0, totalMeals - planUsed.mealLimit);
    const extraCharges = extraCount * planUsed.extraPrice;
    const totalPrice = totalMeals === 0 ? 0 : basePrice + extraCharges;
    return { basePrice, extraCharges, totalPrice, planUsed, totalMeals };
  };

  const pricing = calculatePricing();

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return false;
      }
      const nextUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isAdmin: data.user.role === 'ADMIN',
        token: data.token
      };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return false;
      }
      const nextUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isAdmin: data.user.role === 'ADMIN',
        token: data.token
      };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const adminLogin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return false;
      }
      const nextUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isAdmin: data.user.role === 'ADMIN',
        token: data.token
      };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCart([]);
    setSelectedPlan(null);
    setDeliveryDetails(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('deliveryDetails');
  };

  const getMealKey = (meal: Meal) => meal._id || meal.id || meal.name;

  const addMealToCart = (meal: Meal, baseOption?: string) => {
    setCart(prev => {
      const mealKey = getMealKey(meal);
      const existing = prev.find(item => {
        const sameMeal = getMealKey(item.meal) === mealKey;
        const sameBase = (item.baseOption || '') === (baseOption || '');
        return sameMeal && sameBase;
      });
      if (existing) {
        return prev.map(item => {
          const sameMeal = getMealKey(item.meal) === mealKey;
          const sameBase = (item.baseOption || '') === (baseOption || '');
          if (!sameMeal || !sameBase) return item;
          if (meal.allowSplit === false) {
            return { ...item, quantity: item.quantity + 1, deliverySplit: undefined };
          }
          const split = item.deliverySplit || { sunday: item.quantity, wednesday: 0 };
          return {
            ...item,
            quantity: item.quantity + 1,
            deliverySplit: { ...split, sunday: split.sunday + 1 },
          };
        });
      }
      return [
        ...prev,
        {
          meal,
          quantity: 1,
          baseOption,
          deliverySplit: meal.allowSplit === false ? undefined : { sunday: 1, wednesday: 0 },
        },
      ];
    });
  };

  const updateMealQuantity = (mealId: string, delta: number, baseOption?: string) => {
    setCart(prev =>
      prev
        .map(item => {
          const sameMeal = getMealKey(item.meal) === mealId;
          const sameBase = baseOption === undefined ? true : (item.baseOption || '') === (baseOption || '');
          if (!sameMeal || !sameBase) return item;
          const nextQty = Math.max(0, item.quantity + delta);
          const split = item.deliverySplit || { sunday: item.quantity, wednesday: 0 };
          if (nextQty === 0) {
            return { ...item, quantity: 0, deliverySplit: { sunday: 0, wednesday: 0 } };
          }
          if (delta > 0) {
            return {
              ...item,
              quantity: nextQty,
              deliverySplit: { ...split, sunday: split.sunday + 1 },
            };
          }
          const reduceWed = Math.min(split.wednesday, Math.abs(delta));
          const remaining = Math.abs(delta) - reduceWed;
          return {
            ...item,
            quantity: nextQty,
            deliverySplit: {
              sunday: Math.max(0, split.sunday - remaining),
              wednesday: Math.max(0, split.wednesday - reduceWed),
            },
          };
        })
        .filter(item => item.quantity > 0)
    );
  };

  const updateCartItemSplit = (
    mealId: string,
    split: { sunday: number; wednesday: number },
    baseOption?: string
  ) => {
    setCart(prev =>
      prev.map(item => {
        const sameMeal = getMealKey(item.meal) === mealId;
        const sameBase = baseOption === undefined ? true : (item.baseOption || '') === (baseOption || '');
        if (!sameMeal || !sameBase) return item;
        return { ...item, deliverySplit: split };
      })
    );
  };

  const placeOrder = async (
    paymentToken: string,
    amountOverride?: number,
    deliveryOverride?: DeliveryDetails | null
  ) => {
    setLoading(true);
    try {
      const finalAmount = amountOverride ?? pricing.totalPrice;
      const finalDelivery = deliveryOverride ?? deliveryDetails;
      const res = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: paymentToken,
          amount: finalAmount,
          customerEmail: user?.email,
          deliveryDetails: finalDelivery,
          items: cart
        }),
      });
      const data = await res.json();
    if (data.success) {
      setOrders(prev => [data.order, ...prev]);
      setMyOrders(prev => [data.order, ...prev]);
        setCart([]);
        setLoading(false);
        return true;
      }
      throw new Error(data.error);
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  // ADMIN ACTIONS
  const adminAddMeal = async (mealData: Partial<Meal>, imageFile?: File) => {
    setLoading(true);
    let imageUrl = mealData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`${API_BASE_URL}/admin/meals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({ ...mealData, image: imageUrl })
    });
    const newMeal = await res.json();
    setMeals(prev => [newMeal, ...prev]);
    setLoading(false);
  };

  const adminUpdateMeal = async (id: string, mealData: Partial<Meal>, imageFile?: File) => {
    setLoading(true);
    let imageUrl = mealData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const payload = Object.fromEntries(
      Object.entries({ ...mealData, image: imageUrl }).filter(([, value]) => value !== undefined)
    );

    const res = await fetch(`${API_BASE_URL}/admin/meals/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify(payload)
    });
    const updated = await res.json();
    setMeals(prev => prev.map(m => m._id === id ? updated : m));
    setLoading(false);
  };

  const adminDeleteMeal = async (id: string) => {
    await fetch(`${API_BASE_URL}/admin/meals/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });
    setMeals(prev => prev.filter(m => m._id !== id));
  };

  const adminToggleMeal = async (id: string) => {
    const meal = meals.find(m => m._id === id);
    const res = await fetch(`${API_BASE_URL}/admin/meals/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({ available: !meal?.available })
    });
    const updated = await res.json();
    setMeals(prev => prev.map(m => m._id === id ? updated : m));
  };

  const adminAddRecipe = async (recipeData: Partial<Recipe>, imageFile?: File) => {
    setLoading(true);
    let imageUrl = recipeData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`${API_BASE_URL}/admin/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({ ...recipeData, image: imageUrl })
    });
    const newRecipe = await res.json();
    setRecipes(prev => [newRecipe, ...prev]);
    setLoading(false);
  };

  const adminUpdateRecipe = async (id: string, recipeData: Partial<Recipe>, imageFile?: File) => {
    setLoading(true);
    let imageUrl = recipeData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`${API_BASE_URL}/admin/recipes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({ ...recipeData, image: imageUrl })
    });
    const updated = await res.json();
    setRecipes(prev => prev.map(r => r._id === id ? updated : r));
    setLoading(false);
  };

  const adminDeleteRecipe = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/recipes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });
    const updated = await res.json();
    setRecipes(prev => prev.map(r => r._id === id ? updated : r));
  };

  const adminRefresh = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });
    const data = await res.json();
    setOrders(data.orders);
  };

  const adminFetchRecipes = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/recipes`, {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });
    const data = await res.json();
    setRecipes(data);
  };

  const adminFetchUsers = async (
    page = 1,
    limit = 10,
    search = '',
    role = '',
    hasOrders = ''
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (hasOrders) params.set('hasOrders', hasOrders);
    const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });
    const data = await res.json();
    setAdminUsers(data.users || []);
    return data;
  };

  const adminUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({ status })
    });
    const updated = await res.json();
    setOrders(prev => prev.map(o => (o._id === orderId ? updated : o)));
  };

  const fetchMyOrders = async () => {
    if (!user?.token || !user?.email) return;
    const res = await fetch(`${API_BASE_URL}/orders/mine`, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    });
    const data = await res.json();
    setMyOrders(data.orders || []);
  };

  return (
    <AppContext.Provider value={{
      user, selectedPlan, cart, orders, deliveryDetails, isLoggedIn, isAdmin, loading, meals, recipes,
      login, signup, adminLogin, logout, selectPlan: setSelectedPlan, addMealToCart, 
      removeMealFromCart: (id, baseOption) => updateMealQuantity(id, -100, baseOption), 
      updateMealQuantity,
      updateDeliveryDetails: setDeliveryDetails,
      updateCartItemSplit,
      placeOrder,
      pricing,
      adminData: {
        meals,
        recipes,
        users: adminUsers,
        allOrders: orders,
        addMeal: adminAddMeal,
        updateMeal: adminUpdateMeal,
        deleteMeal: adminDeleteMeal,
        toggleMealAvailability: adminToggleMeal,
        addRecipe: adminAddRecipe,
        updateRecipe: adminUpdateRecipe,
        deleteRecipe: adminDeleteRecipe,
        updateOrderStatus: adminUpdateOrderStatus,
        refreshData: async () => {
          await adminRefresh();
          await adminFetchRecipes();
        },
        fetchUsers: adminFetchUsers,
      },
      myOrders,
      fetchMyOrders,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp context missing');
  return context;
};
