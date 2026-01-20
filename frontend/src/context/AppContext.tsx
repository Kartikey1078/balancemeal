import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Plan, Meal, CartItem, DeliveryDetails, Order, OrderStatus, Recipe, AdminUser, Coupon } from '../types.ts';
import { PLANS } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AppContextType {
  user: User | null;
  adminUser: User | null;
  selectedPlan: Plan | null;
  cart: CartItem[];
  orders: Order[];
  myOrders: Order[];
  deliveryDetails: DeliveryDetails | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  recipesLoading: boolean;
  adminMealsLoading: boolean;
  adminRecipesLoading: boolean;
  meals: Meal[];
  recipes: Recipe[];
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  adminLogout: () => void;
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
  clearCart: () => void;
  placeOrder: (
    paymentToken: string,
    amountOverride?: number,
    deliveryOverride?: DeliveryDetails | null,
    couponCode?: string | null
  ) => Promise<{ ok: boolean; order?: Order }>;
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
    coupons: Coupon[];
    allOrders: Order[];
    addMeal: (mealData: Partial<Meal>, imageFile?: File) => Promise<void>;
    updateMeal: (mealId: string, mealData: Partial<Meal>, imageFile?: File) => Promise<void>;
    deleteMeal: (mealId: string) => Promise<void>;
    toggleMealAvailability: (mealId: string) => Promise<void>;
    fetchMealsByWeek: (week: number, page?: number, limit?: number) => Promise<{
      meals: Meal[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>;
    addRecipe: (recipeData: Partial<Recipe>, imageFile?: File) => Promise<void>;
    updateRecipe: (recipeId: string, recipeData: Partial<Recipe>, imageFile?: File) => Promise<void>;
    deleteRecipe: (recipeId: string) => Promise<void>;
    fetchRecipes: (page?: number, limit?: number, search?: string) => Promise<{
      recipes: Recipe[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    refreshData: () => Promise<void>;
    addCoupon: (couponData: { code: string; type: 'percent' | 'amount'; value: number; active?: boolean }) => Promise<{ ok: boolean; error?: string }>;
    updateCoupon: (couponId: string, updates: Partial<Pick<Coupon, 'active' | 'type' | 'value'>>) => Promise<void>;
    fetchCoupons: () => Promise<void>;
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
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('adminUser');
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
  const [adminMeals, setAdminMeals] = useState<Meal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [adminRecipes, setAdminRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(() =>
    readStorage<DeliveryDetails | null>('deliveryDetails', null)
  );
  const [loading, setLoading] = useState(false);
  const [adminMealsLoading, setAdminMealsLoading] = useState(false);
  const [adminRecipesLoading, setAdminRecipesLoading] = useState(false);

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
    setRecipesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recipes`);
      const data = await res.json();
      setRecipes(data);
    } catch (e) {
      console.error('Fetch recipes failed');
    } finally {
      setRecipesLoading(false);
    }
  };

  const isAdmin = adminUser?.role === 'ADMIN';
  const isLoggedIn = !!user;

  useEffect(() => {
    const token = user?.token;
    if (!token) return;
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          logout();
          return;
        }
        const data = await res.json();
        const verifiedUser = data.user;
        if (!verifiedUser?.id || !verifiedUser?.email) {
          logout();
          return;
        }
        const nextUser = {
          ...user,
          id: verifiedUser.id,
          name: verifiedUser.name,
          email: verifiedUser.email,
          role: verifiedUser.role,
          isAdmin: verifiedUser.role === 'ADMIN',
        };
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
      } catch {
        logout();
      }
    };
    verifySession();
  }, [user?.token]);

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
      setAdminUser(null);
      localStorage.removeItem('adminUser');
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
      setAdminUser(null);
      localStorage.removeItem('adminUser');
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
      setAdminUser(nextUser);
      localStorage.setItem('adminUser', JSON.stringify(nextUser));
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

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
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
    deliveryOverride?: DeliveryDetails | null,
    couponCode?: string | null
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
          couponCode,
          planId: pricing.planUsed.id,
          customerEmail: user?.email,
          deliveryDetails: finalDelivery,
          items: cart
        }),
      });
      const data = await res.json();
    if (data.success) {
      setOrders(prev => [data.order, ...prev]);
      setMyOrders(prev => [data.order, ...prev]);
      setLoading(false);
      return { ok: true, order: data.order };
    }
      throw new Error(data.error);
    } catch (e) {
      setLoading(false);
    return { ok: false };
    }
  };

  // ADMIN ACTIONS
  const adminAddMeal = async (mealData: Partial<Meal>, imageFile?: File) => {
    setLoading(true);
    if (!adminUser?.token) {
      setLoading(false);
      return;
    }
    let imageUrl = mealData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminUser?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`${API_BASE_URL}/admin/meals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify({ ...mealData, image: imageUrl })
    });
    const newMeal = await res.json();
    setMeals(prev => [newMeal, ...prev]);
    setAdminMeals(prev => [newMeal, ...prev]);
    setLoading(false);
  };

  const adminUpdateMeal = async (id: string, mealData: Partial<Meal>, imageFile?: File) => {
    setLoading(true);
    if (!adminUser?.token) {
      setLoading(false);
      return;
    }
    let imageUrl = mealData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminUser?.token}` },
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
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify(payload)
    });
    const updated = await res.json();
    setMeals(prev => prev.map(m => m._id === id ? updated : m));
    setAdminMeals(prev => prev.map(m => m._id === id ? updated : m));
    setLoading(false);
  };

  const adminDeleteMeal = async (id: string) => {
    if (!adminUser?.token) return;
    await fetch(`${API_BASE_URL}/admin/meals/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminUser?.token}` }
    });
    setMeals(prev => prev.filter(m => m._id !== id));
    setAdminMeals(prev => prev.filter(m => m._id !== id));
  };

  const adminToggleMeal = async (id: string) => {
    if (!adminUser?.token) return;
    const meal = meals.find(m => m._id === id);
    const res = await fetch(`${API_BASE_URL}/admin/meals/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify({ available: !meal?.available })
    });
    const updated = await res.json();
    setMeals(prev => prev.map(m => m._id === id ? updated : m));
    setAdminMeals(prev => prev.map(m => m._id === id ? updated : m));
  };

  const adminFetchMealsByWeek = async (week: number, page = 1, limit = 12) => {
    if (!adminUser?.token) {
      return { meals: [], page, limit, total: 0, totalPages: 1 };
    }
    setAdminMealsLoading(true);
    try {
      const params = new URLSearchParams({
        week: String(week),
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`${API_BASE_URL}/admin/meals?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${adminUser?.token}` }
      });
      const data = await res.json();
      setAdminMeals(data.meals || []);
      return {
        meals: data.meals || [],
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      };
    } finally {
      setAdminMealsLoading(false);
    }
  };

  const adminAddRecipe = async (recipeData: Partial<Recipe>, imageFile?: File) => {
    setLoading(true);
    if (!adminUser?.token) {
      setLoading(false);
      return;
    }
    let imageUrl = recipeData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminUser?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`${API_BASE_URL}/admin/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify({ ...recipeData, image: imageUrl })
    });
    const newRecipe = await res.json();
    setRecipes(prev => [newRecipe, ...prev]);
    setAdminRecipes(prev => [newRecipe, ...prev]);
    setLoading(false);
  };

  const adminUpdateRecipe = async (id: string, recipeData: Partial<Recipe>, imageFile?: File) => {
    setLoading(true);
    if (!adminUser?.token) {
      setLoading(false);
      return;
    }
    let imageUrl = recipeData.image;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminUser?.token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch(`${API_BASE_URL}/admin/recipes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify({ ...recipeData, image: imageUrl })
    });
    const updated = await res.json();
    setRecipes(prev => prev.map(r => r._id === id ? updated : r));
    setAdminRecipes(prev => prev.map(r => r._id === id ? updated : r));
    setLoading(false);
  };

  const adminDeleteRecipe = async (id: string) => {
    if (!adminUser?.token) return;
    const res = await fetch(`${API_BASE_URL}/admin/recipes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminUser?.token}` }
    });
    if (res.ok) {
      setRecipes(prev => prev.filter(r => r._id !== id));
      setAdminRecipes(prev => prev.filter(r => r._id !== id));
      return;
    }
    await res.json();
  };

  const adminFetchRecipes = async (page = 1, limit = 12, search = '') => {
    if (!adminUser?.token) {
      return { recipes: [], page, limit, total: 0, totalPages: 1 };
    }
    setAdminRecipesLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE_URL}/admin/recipes?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${adminUser?.token}` }
      });
      const data = await res.json();
      setAdminRecipes(data.recipes || []);
      return {
        recipes: data.recipes || [],
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      };
    } finally {
      setAdminRecipesLoading(false);
    }
  };

  const adminRefresh = async () => {
    if (!adminUser?.token) return;
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminUser?.token}` }
    });
    const data = await res.json();
    setOrders(data.orders);
  };

  const adminFetchCoupons = async () => {
    if (!adminUser?.token) return;
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      headers: { 'Authorization': `Bearer ${adminUser?.token}` }
    });
    const data = await res.json();
    setCoupons(data.coupons || []);
  };

  const adminAddCoupon = async (couponData: { code: string; type: 'percent' | 'amount'; value: number; active?: boolean }) => {
    if (!adminUser?.token) {
      return { ok: false, error: 'Not authorized' };
    }
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify(couponData)
    });
    const created = await res.json();
    if (res.ok) {
      setCoupons(prev => [created, ...prev]);
      return { ok: true };
    }
    return { ok: false, error: created?.error || 'Failed to create coupon' };
  };

  const adminUpdateCoupon = async (
    couponId: string,
    updates: Partial<Pick<Coupon, 'active' | 'type' | 'value'>>
  ) => {
    if (!adminUser?.token) return;
    const res = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
      },
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    if (res.ok) {
      setCoupons(prev => prev.map(c => (c._id === couponId ? updated : c)));
    }
  };

  // adminFetchRecipes replaced with paginated version above

  const adminFetchUsers = async (
    page = 1,
    limit = 10,
    search = '',
    role = '',
    hasOrders = ''
  ) => {
    if (!adminUser?.token) {
      return { users: [], page, limit, total: 0, totalPages: 1 };
    }
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (hasOrders) params.set('hasOrders', hasOrders);
    const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${adminUser?.token}` }
    });
    const data = await res.json();
    setAdminUsers(data.users || []);
    return data;
  };

  const adminUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!adminUser?.token) return;
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUser?.token}`
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
      user, selectedPlan, cart, orders, deliveryDetails, isLoggedIn, isAdmin, loading, meals, recipes, recipesLoading, adminMealsLoading, adminRecipesLoading,
      adminUser,
      login, signup, adminLogin, logout, selectPlan: setSelectedPlan, addMealToCart, 
      adminLogout,
      removeMealFromCart: (id, baseOption) => updateMealQuantity(id, -100, baseOption), 
      updateMealQuantity,
      updateDeliveryDetails: setDeliveryDetails,
      clearCart,
      updateCartItemSplit,
      placeOrder,
      pricing,
      adminData: {
        meals: adminMeals,
        recipes: adminRecipes,
        users: adminUsers,
        coupons,
        allOrders: orders,
        addMeal: adminAddMeal,
        updateMeal: adminUpdateMeal,
        deleteMeal: adminDeleteMeal,
        toggleMealAvailability: adminToggleMeal,
        fetchMealsByWeek: adminFetchMealsByWeek,
        addRecipe: adminAddRecipe,
        updateRecipe: adminUpdateRecipe,
        deleteRecipe: adminDeleteRecipe,
        fetchRecipes: adminFetchRecipes,
        updateOrderStatus: adminUpdateOrderStatus,
        refreshData: async () => {
          await adminRefresh();
          await adminFetchRecipes();
          await adminFetchCoupons();
        },
        addCoupon: adminAddCoupon,
        updateCoupon: adminUpdateCoupon,
        fetchCoupons: adminFetchCoupons,
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
