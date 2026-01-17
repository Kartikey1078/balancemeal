
export enum OrderStatus {
  PLACED = 'PLACED',
  RECEIVED = 'RECEIVED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Meal {
  _id?: string; // MongoDB ID
  id: string;   // Frontend ID
  name: string;
  allowSplit?: boolean;
  week?: number;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  isVeg: boolean;
  image: string;
  description: string;
  available: boolean;
  createdAt?: string;
  tags?: string[];
  baseOptions?: string[];
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit?: string;
}

export interface RecipeStep {
  step: number;
  description: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  _id?: string;
  title: string;
  image: string;
  category: string;
  tags: string[];
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition: RecipeNutrition;
  status: 'Draft' | 'Published';
  featured: boolean;
  createdAt?: string;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
  baseOption?: string;
  deliverySplit?: {
    sunday: number;
    wednesday: number;
  };
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  mealLimit: number;
  extraPrice: number;
  badge?: string;
}

export interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  instructions?: string;
}

export interface Order {
  _id?: string;
  id: string;
  customerId: string;
  customerName: string;
  // Add email property to match backend schema and resolve AdminDashboard type error
  email: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  date: string;
  createdAt?: string;
  deliveryDetails: DeliveryDetails;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role?: 'USER' | 'ADMIN';
  token?: string; // JWT Token
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  phone?: string | null;
  city?: string | null;
  zipCode?: string | null;
  lastOrderStatus?: string | null;
  lastOrderItems?: CartItem[];
  lastOrderAt?: string | null;
  hasOrders?: boolean;
}

export interface AppState {
  user: User | null;
  selectedPlan: Plan | null;
  cart: CartItem[];
  isLoggedIn: boolean;
}