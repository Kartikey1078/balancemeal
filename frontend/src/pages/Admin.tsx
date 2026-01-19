import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Utensils,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  Plus,
  MoreVertical,
  Search,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  Trash2,
  Edit3,
  Flame,
  X,
  Camera,
  Upload,
} from "lucide-react";
import { useApp } from "../context/AppContext.tsx";
import { OrderStatus, Meal, Recipe, Coupon } from "../types.ts";

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  trend: string;
}) => (
  <div className="bg-[#1C1C1C] p-8 rounded-[2rem] border border-white/5 shadow-2xl transition-all hover:border-white/10 group">
    <div className="flex justify-between items-start mb-6">
      <div
        className={`p-4 rounded-2xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-500`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="px-3 py-1 bg-white/5 rounded-full text-green-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> {trend}
      </div>
    </div>
    <h3 className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">
      {label}
    </h3>
    <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const TAG_OPTIONS = [
    "Gluten Free",
    "Vegan",
    "High Protein",
    "Balanced Meal",
    "Low Carb",
    "Keto Friendly",
    "Dairy Free",
  ];

  const { adminData, adminLogout } = useApp();
  const ORDER_STATUS_FLOW: OrderStatus[] = [
    OrderStatus.PLACED,
    OrderStatus.RECEIVED,
    OrderStatus.PREPARING,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];
  const [activeTab, setActiveTab] = useState<"dashboard" | "meals" | "orders" | "recipes" | "users" | "coupons">(
    "dashboard"
  );
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<"all" | number>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [recipeImageFile, setRecipeImageFile] = useState<File | null>(null);
  const [baseOptionInput, setBaseOptionInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recipeFileInputRef = useRef<HTMLInputElement>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userOrderFilter, setUserOrderFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState({
    name: "",
    quantity: "",
    unit: "",
  });
  const [stepInput, setStepInput] = useState("");
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent" as "percent" | "amount",
    value: "",
    active: true,
  });
  const [couponError, setCouponError] = useState("");
  const [recipeError, setRecipeError] = useState("");

  useEffect(() => {
    adminData.refreshData();
  }, []);

  useEffect(() => {
    if (activeTab !== "users") return;
    const load = async () => {
      const data = await adminData.fetchUsers(
        userPage,
        userPageSize,
        userSearch,
        userRoleFilter,
        userOrderFilter
      );
      setUserTotalPages(data.totalPages || 1);
    };
    load();
  }, [activeTab, userPage, userPageSize, userSearch, userRoleFilter, userOrderFilter]);

  const emptyMeal: Partial<Meal> = {
    name: "",
    isVeg: false,
    // description: "",
    image: "",
    tags: [],
    baseOptions: [],
    allowSplit: true,
    week: 1,
  };

  const [newMeal, setNewMeal] = useState<Partial<Meal>>(emptyMeal);

  const emptyRecipe: Partial<Recipe> = {
    title: "",
    image: "",
    category: "Breakfast",
    tags: [],
    prepTime: 0,
    cookTime: 0,
    difficulty: "Easy",
    servings: 1,
    ingredients: [],
    steps: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    status: "Draft",
    featured: false,
  };

  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>(emptyRecipe);

  const filteredMeals = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return adminData.meals.filter((m) => {
      const matchesTitle = (m.name || "").toLowerCase().includes(query);
      const matchesWeek =
        selectedWeek === "all" ? true : (m.week ?? 1) === selectedWeek;
      return matchesTitle && matchesWeek;
    });
  }, [adminData.meals, searchQuery, selectedWeek]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return adminData.allOrders.filter((o) => {
      const customerName = (o.customerName || "").toLowerCase();
      const orderId = (o._id || o.id || "").toLowerCase();
      const matchesQuery =
        customerName.includes(query) || orderId.includes(query);
      const matchesStatus =
        orderStatusFilter === "all" ? true : o.status === orderStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [adminData.allOrders, searchQuery, orderStatusFilter]);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return adminData.recipes.filter((r) =>
      (r.title || "").toLowerCase().includes(query)
    );
  }, [adminData.recipes, searchQuery]);

  const dashboardStats = useMemo(() => {
    const orders = adminData.allOrders || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const globalOrders = orders.length;
    const activeSubscriptions = new Set(orders.map((o) => o.email)).size;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const last24h = orders.filter((o) => {
      const createdAt = (o as any).date || (o as any).createdAt;
      if (!createdAt) return false;
      return now - new Date(createdAt).getTime() <= dayMs;
    }).length;
    const prev24h = orders.filter((o) => {
      const createdAt = (o as any).date || (o as any).createdAt;
      if (!createdAt) return false;
      const time = new Date(createdAt).getTime();
      return now - time > dayMs && now - time <= 2 * dayMs;
    }).length;
    const dailyGrowth =
      prev24h === 0 ? (last24h > 0 ? 100 : 0) : ((last24h - prev24h) / prev24h) * 100;

    return {
      totalRevenue,
      globalOrders,
      activeSubscriptions,
      dailyGrowth,
    };
  }, [adminData.allOrders]);

  const resetMealForm = () => {
    setNewMeal(emptyMeal);
    setImageFile(null);
    setBaseOptionInput("");
  };

  const resetRecipeForm = () => {
    setNewRecipe(emptyRecipe);
    setRecipeImageFile(null);
    setIngredientInput({ name: "", quantity: "", unit: "" });
    setStepInput("");
    setRecipeError("");
  };

  const closeMealModal = () => {
    setShowAddMeal(false);
    setEditingMeal(null);
    resetMealForm();
  };

  const closeRecipeModal = () => {
    setShowAddRecipe(false);
    setEditingRecipe(null);
    resetRecipeForm();
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeal) {
      await adminData.updateMeal(editingMeal._id!, newMeal, imageFile || undefined);
    } else {
      await adminData.addMeal(newMeal, imageFile || undefined);
    }
    closeMealModal();
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecipeError("");
    const ingredients = newRecipe.ingredients || [];
    const steps = newRecipe.steps || [];
    if (newRecipe.status === "Published" && ingredients.length === 0) {
      setRecipeError("Ingredients are required to publish.");
      return;
    }
    if (newRecipe.status === "Published" && steps.length === 0) {
      setRecipeError("Steps are required to publish.");
      return;
    }
    if (editingRecipe) {
      await adminData.updateRecipe(editingRecipe._id!, newRecipe, recipeImageFile || undefined);
    } else {
      await adminData.addRecipe(newRecipe, recipeImageFile || undefined);
    }
    closeRecipeModal();
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setNewMeal({
      name: meal.name,
      isVeg: meal.isVeg,
      image: meal.image,
      tags: meal.tags || [],
      baseOptions: meal.baseOptions || [],
      allowSplit: meal.allowSplit ?? true,
      week: meal.week ?? 1,
      calories: meal.calories,
      protein: meal.protein,
      fat: meal.fat,
      carbs: meal.carbs,
      description: meal.description,
    });
    setImageFile(null);
    setBaseOptionInput("");
    setShowAddMeal(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      title: recipe.title,
      image: recipe.image,
      category: recipe.category,
      tags: recipe.tags || [],
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      nutrition: recipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      status: recipe.status,
      featured: recipe.featured,
    });
    setRecipeImageFile(null);
    setIngredientInput({ name: "", quantity: "", unit: "" });
    setStepInput("");
    setShowAddRecipe(true);
  };

  const handleAddIngredient = () => {
    if (!ingredientInput.name || !ingredientInput.quantity) return;
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: [
        ...(prev.ingredients || []),
        {
          name: ingredientInput.name,
          quantity: ingredientInput.quantity,
          unit: ingredientInput.unit,
        },
      ],
    }));
    setIngredientInput({ name: "", quantity: "", unit: "" });
  };

  const handleRemoveIngredient = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddStep = () => {
    const trimmed = stepInput.trim();
    if (!trimmed) return;
    setNewRecipe((prev) => ({
      ...prev,
      steps: [
        ...(prev.steps || []),
        { step: (prev.steps?.length || 0) + 1, description: trimmed },
      ],
    }));
    setStepInput("");
  };

  const handleRemoveStep = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddBaseOption = () => {
    const trimmed = baseOptionInput.trim();
    if (!trimmed) return;
    setNewMeal((prev) => {
      const existing = prev.baseOptions || [];
      if (existing.includes(trimmed)) return prev;
      return { ...prev, baseOptions: [...existing, trimmed] };
    });
    setBaseOptionInput("");
  };

  const handleRemoveBaseOption = (option: string) => {
    setNewMeal((prev) => ({
      ...prev,
      baseOptions: (prev.baseOptions || []).filter((o) => o !== option),
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Revenue"
          value={`$${dashboardStats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-indigo-600"
          trend={`${dashboardStats.dailyGrowth.toFixed(1)}%`}
        />
        <StatCard
          label="Active Subscriptions"
          value={dashboardStats.activeSubscriptions.toString()}
          icon={Activity}
          color="bg-gold-600"
          trend={`${dashboardStats.dailyGrowth.toFixed(1)}%`}
        />
        <StatCard
          label="Global Orders"
          value={dashboardStats.globalOrders.toString()}
          icon={ShoppingBag}
          color="bg-emerald-600"
          trend={`${dashboardStats.dailyGrowth.toFixed(1)}%`}
        />
        <StatCard
          label="Daily Growth"
          value={`${dashboardStats.dailyGrowth.toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-rose-600"
          trend={`${dashboardStats.dailyGrowth.toFixed(1)}%`}
        />
      </div>

      <div className="bg-[#1C1C1C] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black text-xl text-white tracking-tight">
            Recent Orders
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={orderStatusFilter}
              onChange={(e) =>
                setOrderStatusFilter(
                  e.target.value === "all"
                    ? "all"
                    : (e.target.value as OrderStatus)
                )
              }
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none"
            >
              <option value="all">All Status</option>
              {ORDER_STATUS_FLOW.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Recipient</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((o) => {
                const orderKey = o._id || o.id;
                const isExpanded = expandedOrderId === orderKey;
                return (
                  <React.Fragment key={orderKey}>
                    <tr
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : orderKey)
                      }
                    >
                      <td className="px-8 py-6">
                        <div className="font-bold text-white">{o.customerName}</div>
                        <div className="text-xs text-gray-500">{o.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {o.status}
                        </span>
                        <div className="mt-3">
                          <select
                            value={o.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              adminData.updateOrderStatus(
                                o._id || o.id,
                                e.target.value as OrderStatus
                              );
                            }}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 focus:outline-none"
                          >
                            {ORDER_STATUS_FLOW.map((status) => (
                              <option key={status} value={status}>
                                {status.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-white">
                        ${o.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-8 py-6 text-right text-gray-600">
                        <ChevronRight
                          className={`w-5 h-5 ml-auto transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={4} className="px-8 pb-8">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                                Delivery Details
                              </h4>
                              <div className="space-y-2 text-sm text-gray-300">
                                <div>
                                  <span className="text-gray-500">Name:</span>{" "}
                                  {o.deliveryDetails?.fullName || "-"}
                                </div>
                                <div>
                                  <span className="text-gray-500">Email:</span>{" "}
                                  {o.deliveryDetails?.email || "-"}
                                </div>
                                <div>
                                  <span className="text-gray-500">Phone:</span>{" "}
                                  {o.deliveryDetails?.phone || "-"}
                                </div>
                                <div>
                                  <span className="text-gray-500">Address:</span>{" "}
                                  {o.deliveryDetails?.address || "-"}
                                </div>
                                <div>
                                  <span className="text-gray-500">City:</span>{" "}
                                  {o.deliveryDetails?.city || "-"}
                                </div>
                                <div>
                                  <span className="text-gray-500">Pin:</span>{" "}
                                  {o.deliveryDetails?.zipCode || "-"}
                                </div>
                                {o.deliveryDetails?.instructions && (
                                  <div>
                                    <span className="text-gray-500">
                                      Notes:
                                    </span>{" "}
                                    {o.deliveryDetails.instructions}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                                Items
                              </h4>
                              <div className="space-y-3">
                                {o.items?.map((item, idx) => (
                                  <div
                                    key={`${orderKey}-item-${idx}`}
                                    className="flex items-center justify-between text-sm text-gray-300"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-white font-bold">
                                        {item.meal?.name || "Meal"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Base: {item.baseOption || "Default"}
                                      </span>
                                      {item.deliverySplit && (
                                        <span className="text-xs text-gray-500">
                                          Split: Sun {item.deliverySplit.sunday}, Wed {item.deliverySplit.wednesday}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-gray-400 font-black">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                ))}
                                {!o.items?.length && (
                                  <span className="text-xs text-gray-500">
                                    No items found
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMeals = () => (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
          {filteredMeals.length} Assets Online
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) =>
                setSelectedWeek(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
            >
              <option value="all">All Weeks</option>
              {[1, 2, 3, 4, 5, 6].map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditingMeal(null);
              resetMealForm();
              setShowAddMeal(true);
            }}
            className="px-8 py-4 gold-gradient text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl"
          >
            <Plus className="w-5 h-5" /> New Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredMeals.map((meal) => (
          <div
            key={meal._id}
            className="bg-[#1C1C1C] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col group w-full max-w-[420px] mx-auto md:max-w-none"
          >
            <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
              <img
                src={meal.image}
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[1.5s]"
              />
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() => handleEditMeal(meal)}
                  className="p-3 bg-white/10 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adminData.deleteMeal(meal._id!)}
                  className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur px-3 py-2 rounded-xl text-[10px] font-black text-white flex items-center gap-2 shadow-xl">
                <Flame className="w-4 h-4 text-gold-500" /> {meal.calories}
              </div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words">
                  {meal.name}
                </h3>
              </div>
              {/* <p className="text-gray-500 text-sm italic mb-8">
                "{meal.description}"
              </p> */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      meal.available
                        ? "bg-emerald-500 shadow-[0_0_10px_#10B981]"
                        : "bg-rose-500"
                    }`}
                  ></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">
                    {meal.available ? "Online" : "Offline"}
                  </span>
                </div>
                <button
                  onClick={() => adminData.toggleMealAvailability(meal._id!)}
                  className="text-[10px] font-black uppercase text-gold-500 hover:text-white"
                >
                  {meal.available ? "Set Offline" : "Set Online"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddMeal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={closeMealModal}
          ></div>
          <div className="bg-[#1C1C1C] w-full max-w-2xl rounded-[3rem] border border-white/10 p-12 relative z-10 animate-in zoom-in-95 h-[100%] overflow-y-auto">
            <button
              onClick={closeMealModal}
              className="absolute top-10 right-10 text-gray-500 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-8">
              {editingMeal ? "Edit Asset" : "Asset Registration"}
            </h2>

            <form className="space-y-8" onSubmit={handleAddMeal}>
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Asset Title
                  </label>
                  <input
                    required
                    value={newMeal.name}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newMeal.allowSplit ?? true}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, allowSplit: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Allow Split Delivery
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Week
                  </label>
                  <select
                    required
                    value={newMeal.week ?? ""}
                    onChange={(e) =>
                      setNewMeal({
                        ...newMeal,
                        week: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((week) => (
                      <option key={week} value={week}>
                        Week {week}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Calories
                  </label>
                  <input
                    type="number"
                    required
                    value={newMeal.calories ?? ""}
                    onChange={(e) =>
                      setNewMeal({
                        ...newMeal,
                        calories: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Protein
                  </label>
                  <input
                    type="number"
                    required
                    value={newMeal.protein ?? ""}
                    onChange={(e) =>
                      setNewMeal({
                        ...newMeal,
                        protein: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Fat
                  </label>
                  <input
                    type="number"
                    required
                    value={newMeal.fat ?? ""}
                    onChange={(e) =>
                      setNewMeal({
                        ...newMeal,
                        fat: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Carbs
                  </label>
                  <input
                    type="number"
                    required
                    value={newMeal.carbs ?? ""}
                    onChange={(e) =>
                      setNewMeal({
                        ...newMeal,
                        carbs: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Visual Asset (Cloudinary)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                    {imageFile ? (
                      <span className="text-emerald-500 font-bold">
                        {imageFile.name} ready
                      </span>
                    ) : (
                      <>
                        <Upload className="text-gray-500 mb-2" />{" "}
                        <span className="text-xs font-bold text-gray-500">
                          Upload high-res JPG/PNG
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Nutrition Tags
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {TAG_OPTIONS.map((tag) => {
                      const selected = newMeal.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setNewMeal((prev) => ({
                              ...prev,
                              tags: selected
                                ? prev.tags?.filter((t) => t !== tag)
                                : [...(prev.tags || []), tag],
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all ${
                            selected
                              ? "bg-gold-500 text-black border-gold-500 shadow-lg"
                              : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Base Options
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={baseOptionInput}
                      onChange={(e) => setBaseOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddBaseOption();
                        }
                      }}
                      placeholder="e.g. White Bun, Brown Bun"
                      className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddBaseOption}
                      className="px-6 py-5 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/20"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(newMeal.baseOptions || []).length === 0 ? (
                      <span className="text-xs font-bold text-gray-500">
                        No base options added
                      </span>
                    ) : (
                      newMeal.baseOptions?.map((option) => (
                        <span
                          key={option}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide border bg-white/5 text-gray-300 border-white/10"
                        >
                          {option}
                          <button
                            type="button"
                            onClick={() => handleRemoveBaseOption(option)}
                            className="text-gray-500 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>


              </div>
              <button className="w-full py-6 gold-gradient text-white rounded-2xl font-black text-xl">
                {editingMeal ? "Save Changes" : "Publish to Cloud"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecipes = () => (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
          {filteredRecipes.length} Recipes
        </h3>
        <button
          onClick={() => {
            setEditingRecipe(null);
            resetRecipeForm();
            setShowAddRecipe(true);
          }}
          className="px-8 py-4 gold-gradient text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl"
        >
          <Plus className="w-5 h-5" /> New Recipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe._id}
            className="bg-[#1C1C1C] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col group"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={recipe.image}
                className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-[1.5s]"
              />
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() => handleEditRecipe(recipe)}
                  className="p-3 bg-white/10 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adminData.deleteRecipe(recipe._id!)}
                  className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-white">{recipe.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {recipe.category} • {recipe.difficulty}
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                  recipe.status === "Published"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}>
                  {recipe.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(recipe.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border bg-white/5 text-gray-300 border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddRecipe && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={closeRecipeModal}
          ></div>
          <div className="bg-[#1C1C1C] w-full max-w-3xl rounded-[3rem] border border-white/10 p-12 relative z-10 animate-in zoom-in-95 h-[100%] overflow-y-auto">
            <button
              onClick={closeRecipeModal}
              className="absolute top-10 right-10 text-gray-500 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-8">
              {editingRecipe ? "Edit Recipe" : "New Recipe"}
            </h2>

            <form className="space-y-8" onSubmit={handleAddRecipe}>
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Recipe Title
                  </label>
                  <input
                    required
                    value={newRecipe.title}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, title: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Category
                  </label>
                  <select
                    value={newRecipe.category}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, category: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  >
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Difficulty
                  </label>
                  <select
                    value={newRecipe.difficulty}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, difficulty: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  >
                    {["Easy", "Medium", "Hard"].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={newRecipe.prepTime ?? 0}
                    onChange={(e) =>
                      setNewRecipe({
                        ...newRecipe,
                        prepTime: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Cook Time (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={newRecipe.cookTime ?? 0}
                    onChange={(e) =>
                      setNewRecipe({
                        ...newRecipe,
                        cookTime: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Servings
                  </label>
                  <input
                    type="number"
                    required
                    value={newRecipe.servings ?? 1}
                    onChange={(e) =>
                      setNewRecipe({
                        ...newRecipe,
                        servings: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Recipe Image
                  </label>
                  <div
                    onClick={() => recipeFileInputRef.current?.click()}
                    className="w-full py-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <input
                      type="file"
                      ref={recipeFileInputRef}
                      className="hidden"
                      onChange={(e) =>
                        setRecipeImageFile(e.target.files?.[0] || null)
                      }
                    />
                    {recipeImageFile ? (
                      <span className="text-emerald-500 font-bold">
                        {recipeImageFile.name} ready
                      </span>
                    ) : (
                      <>
                        <Upload className="text-gray-500 mb-2" />{" "}
                        <span className="text-xs font-bold text-gray-500">
                          Upload JPG/PNG
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {TAG_OPTIONS.map((tag) => {
                      const selected = newRecipe.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setNewRecipe((prev) => ({
                              ...prev,
                              tags: selected
                                ? prev.tags?.filter((t) => t !== tag)
                                : [...(prev.tags || []), tag],
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all ${
                            selected
                              ? "bg-gold-500 text-black border-gold-500 shadow-lg"
                              : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Ingredients
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      value={ingredientInput.name}
                      onChange={(e) =>
                        setIngredientInput({ ...ingredientInput, name: e.target.value })
                      }
                      placeholder="Ingredient"
                      className="bg-white/5 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none"
                    />
                    <input
                      value={ingredientInput.quantity}
                      onChange={(e) =>
                        setIngredientInput({ ...ingredientInput, quantity: e.target.value })
                      }
                      placeholder="Quantity"
                      className="bg-white/5 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none"
                    />
                    <input
                      value={ingredientInput.unit}
                      onChange={(e) =>
                        setIngredientInput({ ...ingredientInput, unit: e.target.value })
                      }
                      placeholder="Unit (optional)"
                      className="bg-white/5 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="mt-3 px-5 py-3 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/20"
                  >
                    Add Ingredient
                  </button>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(newRecipe.ingredients || []).map((ing, index) => (
                      <span
                        key={`${ing.name}-${index}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide border bg-white/5 text-gray-300 border-white/10"
                      >
                        {ing.name} • {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-gray-500 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Cooking Steps
                  </label>
                  <textarea
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    placeholder="Describe the step..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none min-h-[120px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="mt-3 px-5 py-3 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/20"
                  >
                    Add Step
                  </button>
                  <div className="mt-4 space-y-2">
                    {(newRecipe.steps || []).map((step, index) => (
                      <div
                        key={`${step.step}-${index}`}
                        className="flex items-start justify-between gap-3 bg-white/5 rounded-2xl px-4 py-3"
                      >
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-500 font-black mr-2">Step {step.step}:</span>
                          {step.description}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="text-gray-500 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Nutrition (Per Serving)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { key: "calories", label: "Calories" },
                      { key: "protein", label: "Protein" },
                      { key: "carbs", label: "Carbs" },
                      { key: "fat", label: "Fat" },
                    ].map((item) => (
                      <input
                        key={item.key}
                        type="number"
                        value={(newRecipe.nutrition as any)?.[item.key] ?? 0}
                        onChange={(e) =>
                          setNewRecipe({
                            ...newRecipe,
                            nutrition: {
                              ...(newRecipe.nutrition || {}),
                              [item.key]: Number(e.target.value),
                            },
                          })
                        }
                        placeholder={item.label}
                        className="bg-white/5 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Status
                  </label>
                  <select
                    value={newRecipe.status}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, status: e.target.value as "Draft" | "Published" })
                    }
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none"
                  >
                    {["Draft", "Published"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Featured
                  </label>
                  <input
                    type="checkbox"
                    checked={newRecipe.featured || false}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, featured: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </div>
              </div>
              {recipeError && (
                <div className="text-sm font-black text-rose-500">{recipeError}</div>
              )}
              <button className="w-full py-6 gold-gradient text-white rounded-2xl font-black text-xl">
                {editingRecipe ? "Update Recipe" : "Publish Recipe"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="animate-in fade-in duration-700 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
          User Directory
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
            placeholder="Search name or email"
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
          />
          <select
            value={userRoleFilter}
            onChange={(e) => {
              setUserRoleFilter(e.target.value);
              setUserPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={userOrderFilter}
            onChange={(e) => {
              setUserOrderFilter(e.target.value);
              setUserPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
          >
            <option value="">All Users</option>
            <option value="true">With Orders</option>
            <option value="false">No Orders</option>
          </select>
          <select
            value={userPageSize}
            onChange={(e) => {
              setUserPageSize(Number(e.target.value));
              setUserPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#1C1C1C] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black text-xl text-white tracking-tight">Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">City</th>
                <th className="px-8 py-5">Pin</th>
                <th className="px-8 py-5">Last Order</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adminData.users.map((user) => {
                const isExpanded = expandedUserId === user._id;
                return (
                  <React.Fragment key={user._id}>
                    <tr
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedUserId(isExpanded ? null : user._id)
                      }
                    >
                      <td className="px-8 py-6 font-bold text-white">{user.name}</td>
                      <td className="px-8 py-6 text-gray-400">{user.email}</td>
                      <td className="px-8 py-6 text-gray-400">{user.phone || "-"}</td>
                      <td className="px-8 py-6 text-gray-400">{user.city || "-"}</td>
                      <td className="px-8 py-6 text-gray-400">{user.zipCode || "-"}</td>
                      <td className="px-8 py-6 text-gray-400">
                        {user.lastOrderItems?.length
                          ? `${user.lastOrderItems.length} items`
                          : "-"}
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-white/5 text-gray-300 border border-white/10">
                          {user.lastOrderStatus || "-"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={8} className="px-8 pb-8">
                          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                              Latest Order Items
                            </h4>
                            <div className="space-y-3">
                              {(user.lastOrderItems || []).length === 0 ? (
                                <span className="text-xs text-gray-500">
                                  No orders for this user.
                                </span>
                              ) : (
                                user.lastOrderItems?.map((item, idx) => (
                                  <div
                                    key={`${user._id}-item-${idx}`}
                                    className="flex items-center justify-between text-sm text-gray-300"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-white font-bold">
                                        {item.meal?.name || "Meal"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Base: {item.baseOption || "Default"}
                                      </span>
                                      {item.deliverySplit && (
                                        <span className="text-xs text-gray-500">
                                          Split: Sun {item.deliverySplit.sunday}, Wed {item.deliverySplit.wednesday}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-gray-400 font-black">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {adminData.users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-gray-500 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => setUserPage((p) => Math.max(1, p - 1))}
            disabled={userPage === 1}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Page {userPage} of {userTotalPages}
          </span>
          <button
            onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
            disabled={userPage >= userTotalPages}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const handleCreateCoupon = async () => {
    setCouponError("");
    const normalized = couponForm.code.trim().toUpperCase();
    const numericValue = Number(couponForm.value);
    if (!normalized) {
      setCouponError("Coupon code is required.");
      return;
    }
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setCouponError("Enter a valid coupon value.");
      return;
    }
    if (couponForm.type === "percent" && numericValue > 100) {
      setCouponError("Percent cannot exceed 100.");
      return;
    }
    const result = await adminData.addCoupon({
      code: normalized,
      type: couponForm.type,
      value: numericValue,
      active: couponForm.active,
    });
    if (!result.ok) {
      setCouponError(result.error || "Failed to create coupon.");
      return;
    }
    setCouponForm({
      code: "",
      type: "percent",
      value: "",
      active: true,
    });
  };

  const renderCoupons = () => (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="bg-[#1C1C1C] rounded-[2.5rem] border border-white/5 shadow-2xl p-10">
        <h3 className="font-black text-xl text-white tracking-tight mb-8">Create Coupon</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Coupon Code
            </label>
            <input
              value={couponForm.code}
              onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
              placeholder="VITAL25"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-widest text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Type
            </label>
            <select
              value={couponForm.type}
              onChange={(e) =>
                setCouponForm({ ...couponForm, type: e.target.value as "percent" | "amount" })
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-widest text-white focus:outline-none"
            >
              <option value="percent">Percent</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Value
            </label>
            <input
              type="number"
              min={0}
              value={couponForm.value}
              onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
              placeholder={couponForm.type === "percent" ? "10" : "15"}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-white focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <input
            type="checkbox"
            checked={couponForm.active}
            onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
            className="w-5 h-5"
          />
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            Active Immediately
          </span>
        </div>
        {couponError && (
          <p className="mt-4 text-xs font-black text-rose-500">{couponError}</p>
        )}
        <button
          onClick={handleCreateCoupon}
          className="mt-8 px-8 py-4 gold-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Save Coupon
        </button>
      </div>

      <div className="bg-[#1C1C1C] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-xl text-white tracking-tight">Active Coupons</h3>
          <button
            onClick={() => adminData.fetchCoupons()}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-300 hover:text-white"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6">Code</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {adminData.coupons.map((coupon: Coupon) => (
                <tr key={coupon._id || coupon.code} className="border-t border-white/5 text-sm">
                  <td className="px-8 py-6 font-black text-white">{coupon.code}</td>
                  <td className="px-8 py-6 text-gray-400 uppercase tracking-widest text-xs font-black">
                    {coupon.type}
                  </td>
                  <td className="px-8 py-6 text-gray-300 font-black">
                    {coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        coupon.active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() =>
                        adminData.updateCoupon(coupon._id || "", { active: !coupon.active })
                      }
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-300 hover:text-white"
                    >
                      {coupon.active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
              {adminData.coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-gray-500 text-sm">
                    No coupons configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex text-white font-sans">
      <aside className="w-80 bg-[#0C0C0C] border-r border-white/5 flex flex-col sticky top-0 h-screen py-10 shrink-0">
        <div className="px-10 mb-16 flex items-center gap-3">
          <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-white">
            <Activity />
          </div>
          <span className="text-2xl font-black tracking-tighter">
            Vital<span className="text-gold-500">Console</span>
          </span>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
            { id: "meals", icon: Utensils, label: "Repository" },
            { id: "recipes", icon: Utensils, label: "Recipes" },
            { id: "users", icon: Users, label: "Users" },
            { id: "coupons", icon: DollarSign, label: "Coupons" },
            { id: "orders", icon: ShoppingBag, label: "Transaction Logs" },
          ].map((item: any) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  activeTab === item.id ? "text-gold-500" : "text-current"
                }`}
              />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-6 pt-10 border-t border-white/5">
          <button
            onClick={adminLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-rose-500 hover:bg-rose-500/10"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-16 overflow-y-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">
              Workspace / {activeTab}
            </h2>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              {activeTab === "dashboard"
                ? "Real-time Pulse"
                : activeTab === "meals"
                ? "Master Catalog"
                : activeTab === "recipes"
                ? "Recipe Studio"
                : activeTab === "users"
                ? "User Directory"
                : activeTab === "coupons"
                ? "Coupon Vault"
                : "Audit Trail"}
            </h1>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query database..."
              className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 w-80 text-sm font-bold focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </header>
        {activeTab === "dashboard"
          ? renderDashboard()
          : activeTab === "meals"
          ? renderMeals()
          : activeTab === "recipes"
          ? renderRecipes()
          : activeTab === "users"
          ? renderUsers()
          : activeTab === "coupons"
          ? renderCoupons()
          : renderDashboard()}
      </main>
    </div>
  );
};
