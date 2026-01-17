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
const upload = multer({ dest: 'uploads/' });

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
const JWT_SECRET = process.env.JWT_SECRET || 'vital_eats_2024_secure_key';

/* ======================
   SQUARE CLIENT
====================== */
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: Environment.Sandbox, // or Production
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

const Meal = mongoose.model('Meal', MealSchema);
const Order = mongoose.model('Order', OrderSchema);
const Recipe = mongoose.model('Recipe', RecipeSchema);
const User = mongoose.model('User', UserSchema);

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

// Public: Get Meals
app.get('/api/meals', async (_, res) => {
  try {
    const meals = await Meal.find({ available: true });
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

// Admin: Create Meal
app.post('/api/admin/meals', adminOnly, async (req, res) => {
  const meal = new Meal(req.body);
  await meal.save();
  res.status(201).json(meal);
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

// Admin: Recipes
app.get('/api/admin/recipes', adminOnly, async (_, res) => {
  const recipes = await Recipe.find({ isDeleted: false }).sort('-createdAt');
  res.json(recipes);
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
    if (!latestOrderByEmail.has(order.email)) {
      latestOrderByEmail.set(order.email, order);
    }
    if (!allOrdersByEmail.has(order.email)) {
      allOrdersByEmail.set(order.email, []);
    }
    allOrdersByEmail.get(order.email)!.push(order);
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
  const { sourceId, amount, deliveryDetails, items, customerEmail, deliverySchedule } = req.body;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const currency = process.env.SQUARE_CURRENCY || 'CAD';

  try {
    if (!sourceId) {
      return res.status(400).json({ success: false, error: 'Missing sourceId' });
    }
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    if (!deliveryDetails?.fullName || !deliveryDetails?.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing delivery details',
      });
    }
    const orderEmail = customerEmail || deliveryDetails.email;

    const payment = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      ...(locationId ? { locationId } : {}),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency,
      },
    });

    const order = new Order({
      customerName: deliveryDetails.fullName,
      email: orderEmail,
      items,
      totalPrice: amount,
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
app.get('/api/admin/stats', adminOnly, async (_, res) => {
  const orders = await Order.find().sort('-createdAt');
  const revenue = orders.reduce(
    (sum, order) => sum + order.totalPrice,
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
      app.listen(PORT, () =>
        console.log(`🚀 Backend running on http://localhost:${PORT}`)
      );
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err);
  });
