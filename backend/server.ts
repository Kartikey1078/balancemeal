import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Client, Environment } from 'square';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';

dotenv.config();

/* ======================
   APP SETUP
====================== */
const app = express();
const upload = process.env.VERCEL
  ? multer({ storage: multer.memoryStorage() })
  : multer({ dest: 'uploads/' });

app.use(express.json());
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3005';
app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (!origin || origin === frontendOrigin) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

/* ======================
   CONFIG
====================== */
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET 
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
;

/* ======================
   SQUARE CLIENT
====================== */
const squareEnv = String(process.env.SQUARE_ENV || 'sandbox').toLowerCase();
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: squareEnv === 'production' ? Environment.Production : Environment.Sandbox,
});


/* ======================
   CLOUDINARY
====================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
});

/* ======================
   DATABASE MODELS
====================== */
const MealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    allowSplit: { type: Boolean, default: true },
    week: { type: Number, default: 1 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    isVeg: Boolean,
    image: String,
    description: String,
    available: { type: Boolean, default: true },
    tags: {
      type: [String],   
      default: [],
    },
    baseOptions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    customerName: String,
    email: String,
    items: Array,
    totalPrice: Number,
    subtotal: Number,
    discountAmount: { type: Number, default: 0 },
    couponCode: String,
    couponType: String,
    couponValue: Number,
    status: { type: String, default: 'PLACED' },
    deliveryDetails: Object,
    deliverySchedule: {
      sunday: { type: Number, default: 0 },
      wednesday: { type: Number, default: 0 },
    },
    paymentId: String,
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    resetTokenHash: String,
    resetTokenExpires: Date,
  },
  { timestamps: true }
);

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },
    difficulty: { type: String, required: true },
    servings: { type: Number, required: true },
    ingredients: {
      type: [
        {
          name: String,
          quantity: String,
          unit: String,
        },
      ],
      default: [],
    },
    steps: {
      type: [
        {
          step: Number,
          description: String,
        },
      ],
      default: [],
    },
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    status: { type: String, default: 'Draft' },
    featured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NutritionTagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'amount'], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Meal = mongoose.model('Meal', MealSchema);
const Order = mongoose.model('Order', OrderSchema);
const Recipe = mongoose.model('Recipe', RecipeSchema);
const User = mongoose.model('User', UserSchema);
const Coupon = mongoose.model('Coupon', CouponSchema);
const NutritionTag = mongoose.model('NutritionTag', NutritionTagSchema);

const PLANS = [
  { id: 'plan_5', price: 66, mealLimit: 5, extraPrice: 12.9 },
  { id: 'plan_10', price: 121, mealLimit: 10, extraPrice: 11.9 },
];

const normalizeCouponCode = (code: any) =>
  String(code || '').trim().toUpperCase();

const calculateWeeklyTotal = (items: any[], planId?: string) => {
  const totalMeals = (items || []).reduce((sum, item) => {
    const qty = Number(item?.quantity || 0);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);
  if (!totalMeals) {
    return { totalMeals: 0, subtotal: 0, planUsed: PLANS[0], extraCharges: 0 };
  }
  const selectedPlan = PLANS.find((plan) => plan.id === planId);
  const planUsed = selectedPlan || (totalMeals >= 10 ? PLANS[1] : PLANS[0]);
  const extraCount = Math.max(0, totalMeals - planUsed.mealLimit);
  const extraCharges = extraCount * planUsed.extraPrice;
  const subtotal = planUsed.price + extraCharges;
  return { totalMeals, subtotal, planUsed, extraCharges };
};

const applyCouponToTotal = (subtotal: number, coupon: any) => {
  if (!coupon) {
    return { discountAmount: 0, totalAfterDiscount: subtotal };
  }
  const rawDiscount =
    coupon.type === 'percent'
      ? subtotal * (coupon.value / 100)
      : coupon.value;
  const discountAmount = Math.max(0, Math.min(subtotal, rawDiscount));
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  return { discountAmount, totalAfterDiscount };
};

const buildResetLink = (token: string, email: string) => {
  const base = frontendOrigin || 'http://localhost:3005';
  const encodedEmail = encodeURIComponent(email);
  return `${base}/#/reset-password?token=${token}&email=${encodedEmail}`;
};

const sendRecoveryEmail = async (to: string, link: string) => {
  const subject = 'Reset your VitalEats password';
  const text = `Reset your password using this link: ${link}`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${link}">Click here to reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  if (process.env.EMAIL_WEBHOOK_URL) {
    await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text, html }),
    });
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });
      return;
    } catch (err) {
      console.warn('SMTP email failed, falling back to log', err);
    }
  }

  console.info('Password reset link:', link);
};

/* ======================
   AUTH MIDDLEWARE
====================== */
const adminOnly = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const userAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded?.email) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const signToken = (user: any) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const validateRecipePayload = (payload: any) => {
  const errors: string[] = [];
  const requiredFields = [
    'title',
    'image',
    'category',
    'prepTime',
    'cookTime',
    'difficulty',
    'servings',
  ];
  requiredFields.forEach((field) => {
    if (!payload[field]) errors.push(`${field} is required`);
  });

  const nutrition = payload.nutrition || {};
  ['calories', 'protein', 'carbs', 'fat'].forEach((field) => {
    if (nutrition[field] !== undefined && typeof nutrition[field] !== 'number') {
      errors.push(`${field} must be numeric`);
    }
  });

  const isPublishing = payload.status === 'Published';
  if (isPublishing) {
    if (!Array.isArray(payload.ingredients) || payload.ingredients.length === 0) {
      errors.push('ingredients required to publish');
    }
    if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
      errors.push('steps required to publish');
    }
  }

  return errors;
};

const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return null;
  }
  const existing = await User.findOne({ email: adminEmail });
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  if (!existing) {
    return User.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    });
  }
  if (existing.role !== 'ADMIN') {
    existing.role = 'ADMIN';
  }
  const valid = await bcrypt.compare(adminPassword, existing.passwordHash);
  if (!valid) {
    existing.passwordHash = passwordHash;
  }
  await existing.save();
  return existing;
};


/* ======================
   ROUTES
====================== */

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'Backend running' });
});

// Auth: User Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const normalized = email.toLowerCase();
  const existing = await User.findOne({ email: normalized });
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalized,
    passwordHash,
    role: 'USER',
  });
  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// Auth: User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const valid = await bcrypt.compare(password || '', user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.role === 'ADMIN') {
    return res.status(403).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// Auth: Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase();
  if (!email) {
    return res.status(200).json({ ok: true });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ ok: true });
  }
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.resetTokenHash = tokenHash;
  user.resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60);
  await user.save();
  const link = buildResetLink(token, email);
  await sendRecoveryEmail(email, link);
  return res.status(200).json({ ok: true });
});

// Auth: Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase();
  const token = String(req.body?.token || '');
  const newPassword = String(req.body?.password || '');
  if (!email || !token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ ok: false, error: 'Invalid reset request' });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    email,
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ ok: false, error: 'Invalid or expired token' });
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  return res.status(200).json({ ok: true });
});

// Auth: Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail || adminEmail !== (email || '').toLowerCase()) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const admin = await ensureAdminUser();
  if (!admin || admin.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const valid = await bcrypt.compare(password || '', admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const token = signToken(admin);
  res.json({
    token,
    user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// Auth: Current User (verify token + role)
app.get('/api/auth/me', userAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await User.findById(userId).select('name email role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Auth: Verify Admin Token
app.get('/api/admin/verify', adminOnly, async (_req, res) => {
  return res.json({ ok: true });
});

// Public: Get Meals (optionally by week)
app.get('/api/meals', async (req, res) => {
  try {
    const weekParam = Number(req.query.week);
    const filters: any = { available: true };
    if (Number.isFinite(weekParam) && weekParam > 0) {
      filters.week = weekParam;
    }
    const meals = await Meal.find(filters);
    res.json(meals);
  } catch {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Public: Get Recipes
app.get('/api/recipes', async (_, res) => {
  try {
    const recipes = await Recipe.find({
      status: 'Published',
      isDeleted: false,
    }).sort('-createdAt');
    res.json(recipes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Public: Get Nutrition Tags
app.get('/api/nutrition-tags', async (_, res) => {
  try {
    const tags = await NutritionTag.find({ active: true }).sort('name');
    res.json(tags);
  } catch {
    res.status(500).json({ error: 'Failed to fetch nutrition tags' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      status: 'Published',
      isDeleted: false,
    });
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Public: Validate Coupon
app.post('/api/coupons/validate', async (req, res) => {
  const { code, items, planId } = req.body;
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return res.status(400).json({ valid: false, error: 'Enter a coupon code' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ valid: false, error: 'Cart is empty' });
  }
  const coupon = await Coupon.findOne({ code: normalized, active: true });
  if (!coupon) {
    return res.status(404).json({ valid: false, error: 'Invalid coupon' });
  }
  const { subtotal } = calculateWeeklyTotal(items, planId);
  const { discountAmount, totalAfterDiscount } = applyCouponToTotal(subtotal, coupon);
  return res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    totalAfterDiscount,
  });
});

// Admin: Upload Image
app.post(
  '/api/admin/upload',
  adminOnly,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'vitaleats_menu',
      });

      fs.unlinkSync(req.file.path); // cleanup temp file

      res.json({ url: result.secure_url });
    } catch {
      res.status(500).json({ error: 'Image upload failed' });
    }
  }
);

// Admin: Get Meals (paginated by week)
app.get('/api/admin/meals', adminOnly, async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const weekParam = Number(req.query.week);

  const filters: any = {};
  if (Number.isFinite(weekParam) && weekParam > 0) {
    filters.week = weekParam;
  }

  const total = await Meal.countDocuments(filters);
  const meals = await Meal.find(filters)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    meals,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

// Admin: Create Meal
app.post('/api/admin/meals', adminOnly, async (req, res) => {
  const meal = new Meal(req.body);
  await meal.save();
  res.status(201).json(meal);
});

// Admin: Bulk create meals
app.post('/api/admin/meals/bulk', adminOnly, async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : req.body?.meals;
  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({ error: 'meals array is required' });
  }

  const created: any[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < payload.length; i += 1) {
    const item = payload[i];
    try {
      const meal = new Meal(item);
      await meal.save();
      created.push(meal);
    } catch (err: any) {
      errors.push({ index: i, error: err?.message || 'Failed to create meal' });
    }
  }

  if (created.length === 0) {
    return res.status(400).json({ error: 'No meals created', errors });
  }
  res.status(201).json({ createdCount: created.length, errors, meals: created });
});

// Admin: Update Meal
app.patch('/api/admin/meals/:id', adminOnly, async (req, res) => {
  const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(meal);
});

// Admin: Delete Meal
app.delete('/api/admin/meals/:id', adminOnly, async (req, res) => {
  await Meal.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Admin: Recipes (paginated)
app.get('/api/admin/recipes', adminOnly, async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const search = String(req.query.search || '').trim().toLowerCase();

  const filters: any = { isDeleted: false };
  if (search) {
    filters.title = { $regex: search, $options: 'i' };
  }

  const total = await Recipe.countDocuments(filters);
  const recipes = await Recipe.find(filters)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    recipes,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

app.post('/api/admin/recipes', adminOnly, async (req, res) => {
  const errors = validateRecipePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: errors.join(', ') });
  }
  const recipe = new Recipe(req.body);
  await recipe.save();
  res.status(201).json(recipe);
});

// Admin: Bulk create recipes
app.post('/api/admin/recipes/bulk', adminOnly, async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : req.body?.recipes;
  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({ error: 'recipes array is required' });
  }

  const created: any[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < payload.length; i += 1) {
    const item = payload[i];
    const validationErrors = validateRecipePayload(item);
    if (validationErrors.length) {
      errors.push({ index: i, error: validationErrors.join(', ') });
      continue;
    }
    const recipe = new Recipe(item);
    await recipe.save();
    created.push(recipe);
  }

  if (created.length === 0) {
    return res.status(400).json({ error: 'No recipes created', errors });
  }
  res.status(201).json({ createdCount: created.length, errors, recipes: created });
});

app.patch('/api/admin/recipes/:id', adminOnly, async (req, res) => {
  const errors = validateRecipePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: errors.join(', ') });
  }
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(recipe);
});

app.delete('/api/admin/recipes/:id', adminOnly, async (req, res) => {
  const recipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, status: 'Draft' },
    { new: true }
  );
  res.json(recipe);
});

// Admin: Nutrition Tags (CRUD)
app.get('/api/admin/nutrition-tags', adminOnly, async (_req, res) => {
  const tags = await NutritionTag.find({}).sort('name');
  res.json(tags);
});

app.post('/api/admin/nutrition-tags', adminOnly, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Tag name is required' });
  }
  const key = name.toLowerCase();
  const existing = await NutritionTag.findOne({ key });
  if (existing) {
    return res.status(400).json({ error: 'Tag already exists' });
  }
  const created = await NutritionTag.create({
    name,
    key,
    active: req.body?.active ?? true,
  });
  return res.status(201).json(created);
});

app.patch('/api/admin/nutrition-tags/:id', adminOnly, async (req, res) => {
  const updates: any = {};
  if (req.body?.name !== undefined) {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    const key = name.toLowerCase();
    const existing = await NutritionTag.findOne({ key, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ error: 'Tag already exists' });
    }
    updates.name = name;
    updates.key = key;
  }
  if (req.body?.active !== undefined) {
    updates.active = Boolean(req.body.active);
  }
  const updated = await NutritionTag.findByIdAndUpdate(req.params.id, updates, { new: true });
  return res.json(updated);
});

app.delete('/api/admin/nutrition-tags/:id', adminOnly, async (req, res) => {
  await NutritionTag.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

// Admin: Users (pagination + search)
app.get('/api/admin/users', adminOnly, async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const search = String(req.query.search || '').trim().toLowerCase();
  const role = String(req.query.role || '').trim();
  const hasOrders = String(req.query.hasOrders || '').trim();

  const filters: any = {};
  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) {
    filters.role = role;
  }

  const total = await User.countDocuments(filters);
  const users = await User.find(filters)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .select('name email role createdAt');

  const emails = users.map((u) => u.email);
  const orders = await Order.find({ email: { $in: emails } })
    .sort('-createdAt')
    .select('email status items deliveryDetails createdAt');
  const latestOrderByEmail = new Map<string, any>();
  const allOrdersByEmail = new Map<string, any[]>();
  for (const order of orders) {
    const orderEmail = order.email || order.deliveryDetails?.email;
    if (!orderEmail) continue;
    if (!latestOrderByEmail.has(orderEmail)) {
      latestOrderByEmail.set(orderEmail, order);
    }
    if (!allOrdersByEmail.has(orderEmail)) {
      allOrdersByEmail.set(orderEmail, []);
    }
    allOrdersByEmail.get(orderEmail)!.push(order);
  }

  const enrichedUsers = users.map((user: any) => {
    const order = latestOrderByEmail.get(user.email);
    return {
      ...user.toObject(),
      phone: order?.deliveryDetails?.phone || null,
      city: order?.deliveryDetails?.city || null,
      zipCode: order?.deliveryDetails?.zipCode || null,
      lastOrderStatus: order?.status || null,
      lastOrderItems: order?.items || [],
      lastOrderAt: order?.createdAt || null,
      hasOrders: (allOrdersByEmail.get(user.email) || []).length > 0,
    };
  });

  const filteredUsers = hasOrders
    ? enrichedUsers.filter((u) => (hasOrders === 'true' ? u.hasOrders : !u.hasOrders))
    : enrichedUsers;

  res.json({
    users: filteredUsers,
    page,
    limit,
    total: hasOrders ? filteredUsers.length : total,
    totalPages: Math.ceil((hasOrders ? filteredUsers.length : total) / limit),
  });
});

/* ======================
   PAYMENTS (SQUARE)
====================== */
app.post('/api/payments/process', async (req, res) => {
  const { sourceId, amount, deliveryDetails, items, customerEmail, deliverySchedule, couponCode, planId } = req.body;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const currency = process.env.SQUARE_CURRENCY || 'CAD';

  try {
    if (!sourceId) {
      return res.status(400).json({ success: false, error: 'Missing sourceId' });
    }
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing items' });
    }
    if (!deliveryDetails?.fullName || !deliveryDetails?.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing delivery details',
      });
    }
    const orderEmail = customerEmail || deliveryDetails.email;
    const normalizedCoupon = normalizeCouponCode(couponCode);
    const coupon = normalizedCoupon
      ? await Coupon.findOne({ code: normalizedCoupon, active: true })
      : null;
    const { subtotal } = calculateWeeklyTotal(items, planId);
    const { discountAmount, totalAfterDiscount } = applyCouponToTotal(subtotal, coupon);
    const computedAmount = Number(totalAfterDiscount.toFixed(2));
    if (Math.abs(computedAmount - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Invalid weekly commitment amount',
      });
    }

    const payment = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      ...(locationId ? { locationId } : {}),
      amountMoney: {
        amount: BigInt(Math.round(computedAmount * 100)),
        currency,
      },
    });

    const order = new Order({
      customerName: deliveryDetails.fullName,
      email: orderEmail,
      items,
      totalPrice: computedAmount,
      subtotal,
      discountAmount,
      couponCode: coupon?.code,
      couponType: coupon?.type,
      couponValue: coupon?.value,
      status: 'PLACED',
      deliveryDetails,
      deliverySchedule,
      paymentId: payment.result.payment?.id,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (err: any) {
    const squareErrors = err?.result?.errors;
    const errorMessage = Array.isArray(squareErrors) && squareErrors.length > 0
      ? squareErrors.map((e: any) => e.detail || e.code).join('; ')
      : err.message || 'Payment failed';
    const status = err?.statusCode || 500;
    res.status(status).json({
      success: false,
      error: errorMessage,
      errors: squareErrors || undefined,
    });
  }
});

/* ======================
   ADMIN DASHBOARD
====================== */
app.get('/api/admin/coupons', adminOnly, async (_req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ coupons });
});

app.post('/api/admin/coupons', adminOnly, async (req, res) => {
  const { code, type, value, active = true } = req.body;
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return res.status(400).json({ error: 'Coupon code required' });
  }
  if (!['percent', 'amount'].includes(type)) {
    return res.status(400).json({ error: 'Invalid coupon type' });
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return res.status(400).json({ error: 'Invalid coupon value' });
  }
  if (type === 'percent' && numericValue > 100) {
    return res.status(400).json({ error: 'Percent cannot exceed 100' });
  }
  const existing = await Coupon.findOne({ code: normalized });
  if (existing) {
    return res.status(409).json({ error: 'Coupon code already exists' });
  }
  const coupon = new Coupon({
    code: normalized,
    type,
    value: numericValue,
    active: Boolean(active),
  });
  await coupon.save();
  return res.status(201).json(coupon);
});

app.patch('/api/admin/coupons/:id', adminOnly, async (req, res) => {
  const { active, type, value } = req.body;
  const updates: any = {};
  if (typeof active === 'boolean') updates.active = active;
  if (type) {
    if (!['percent', 'amount'].includes(type)) {
      return res.status(400).json({ error: 'Invalid coupon type' });
    }
    updates.type = type;
  }
  if (value !== undefined) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return res.status(400).json({ error: 'Invalid coupon value' });
    }
    if (updates.type === 'percent' && numericValue > 100) {
      return res.status(400).json({ error: 'Percent cannot exceed 100' });
    }
    updates.value = numericValue;
  }
  const updated = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!updated) {
    return res.status(404).json({ error: 'Coupon not found' });
  }
  return res.json(updated);
});

app.get('/api/admin/stats', adminOnly, async (_, res) => {
  const orders = await Order.find().sort('-createdAt');
  const revenue = orders.reduce(
    (sum, order) => sum + (order.totalPrice ?? 0),
    0
  );

  res.json({
    totalOrders: orders.length,
    revenue,
    orders,
  });
});

// Admin: Update Order Status
app.patch('/api/admin/orders/:id', adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(order);
});

/* ======================
   USER ORDERS
====================== */
app.get('/api/orders/mine', userAuth, async (req: any, res) => {
  const email = req.user?.email;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  const orders = await Order.find({
    $or: [{ email }, { 'deliveryDetails.email': email }],
  }).sort('-createdAt');
  res.json({ orders });
});

/* ======================
   DATABASE CONNECT
====================== */
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitaleats')
  .then(() => {
    ensureAdminUser().finally(() => {
      if (!process.env.VERCEL) {
        app.listen(PORT, () =>
          console.log(`🚀 Backend running on http://localhost:${PORT}`)
        );
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err);
  });

export default app;
