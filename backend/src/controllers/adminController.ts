import bcrypt from 'bcryptjs';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';
import { Coupon } from '../models/Coupon.js';
import { Meal } from '../models/Meal.js';
import { NutritionTag } from '../models/NutritionTag.js';
import { Order } from '../models/Order.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/auth.js';
import { normalizeCouponCode } from '../utils/pricing.js';
import { validateRecipePayload } from '../utils/recipeValidation.js';
import { ensureAdminUser } from '../services/adminService.js';

export const adminLogin = async (req: any, res: any) => {
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
};

export const verifyAdmin = async (_req: any, res: any) => {
  return res.json({ ok: true });
};

export const adminUpload = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'vitaleats_menu',
    });

    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch {
    res.status(500).json({ error: 'Image upload failed' });
  }
};

export const adminGetMeals = async (req: any, res: any) => {
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
};

export const adminCreateMeal = async (req: any, res: any) => {
  const meal = new Meal(req.body);
  await meal.save();
  res.status(201).json(meal);
};

export const adminBulkCreateMeals = async (req: any, res: any) => {
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
};

export const adminUpdateMeal = async (req: any, res: any) => {
  const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(meal);
};

export const adminDeleteMeal = async (req: any, res: any) => {
  await Meal.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

export const adminGetRecipes = async (req: any, res: any) => {
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
};

export const adminCreateRecipe = async (req: any, res: any) => {
  const errors = validateRecipePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: errors.join(', ') });
  }
  const recipe = new Recipe(req.body);
  await recipe.save();
  res.status(201).json(recipe);
};

export const adminBulkCreateRecipes = async (req: any, res: any) => {
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
};

export const adminUpdateRecipe = async (req: any, res: any) => {
  const errors = validateRecipePayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: errors.join(', ') });
  }
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(recipe);
};

export const adminDeleteRecipe = async (req: any, res: any) => {
  const recipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, status: 'Draft' },
    { new: true }
  );
  res.json(recipe);
};

export const adminGetNutritionTags = async (_req: any, res: any) => {
  const tags = await NutritionTag.find({}).sort('name');
  res.json(tags);
};

export const adminCreateNutritionTag = async (req: any, res: any) => {
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
};

export const adminUpdateNutritionTag = async (req: any, res: any) => {
  const updates: any = {};
  if (req.body?.name !== undefined) {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    const key = name.toLowerCase();
    const existing = await NutritionTag.findOne({
      key,
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(400).json({ error: 'Tag already exists' });
    }
    updates.name = name;
    updates.key = key;
  }
  if (req.body?.active !== undefined) {
    updates.active = Boolean(req.body.active);
  }
  const updated = await NutritionTag.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  return res.json(updated);
};

export const adminDeleteNutritionTag = async (req: any, res: any) => {
  await NutritionTag.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
};

export const adminGetUsers = async (req: any, res: any) => {
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

  const emails = users.map((u: any) => u.email);
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
    ? enrichedUsers.filter((u: any) =>
        hasOrders === 'true' ? u.hasOrders : !u.hasOrders
      )
    : enrichedUsers;

  res.json({
    users: filteredUsers,
    page,
    limit,
    total: hasOrders ? filteredUsers.length : total,
    totalPages: Math.ceil((hasOrders ? filteredUsers.length : total) / limit),
  });
};

export const adminGetCoupons = async (_req: any, res: any) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ coupons });
};

export const adminCreateCoupon = async (req: any, res: any) => {
  const { code, type, value, active = true, validFrom, validTo, maxUsesPerUser } = req.body;
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
  const coupon: any = new Coupon({
    code: normalized,
    type,
    value: numericValue,
    active: Boolean(active),
  });
  if (validFrom) {
    coupon.validFrom = new Date(validFrom);
  }
  if (validTo) {
    coupon.validTo = new Date(validTo);
  }
  if (maxUsesPerUser !== undefined && maxUsesPerUser !== null) {
    const n = Number(maxUsesPerUser);
    coupon.maxUsesPerUser = Number.isFinite(n) && n > 0 ? n : 0;
  }
  await coupon.save();
  return res.status(201).json(coupon);
};

export const adminUpdateCoupon = async (req: any, res: any) => {
  const { active, type, value, validFrom, validTo, maxUsesPerUser } = req.body;
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
    if ((updates.type || type) === 'percent' && numericValue > 100) {
      return res.status(400).json({ error: 'Percent cannot exceed 100' });
    }
    updates.value = numericValue;
  }
  if (validFrom !== undefined) {
    updates.validFrom = validFrom ? new Date(validFrom) : undefined;
  }
  if (validTo !== undefined) {
    updates.validTo = validTo ? new Date(validTo) : undefined;
  }
  if (maxUsesPerUser !== undefined) {
    const n = Number(maxUsesPerUser);
    updates.maxUsesPerUser = Number.isFinite(n) && n > 0 ? n : 0;
  }
  const updated = await Coupon.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!updated) {
    return res.status(404).json({ error: 'Coupon not found' });
  }
  return res.json(updated);
};

export const adminGetStats = async (_req: any, res: any) => {
  const orders = await Order.find().sort('-createdAt');
  const revenue = orders.reduce(
    (sum: any, order: any) => sum + (order.totalPrice ?? 0),
    0
  );

  res.json({
    totalOrders: orders.length,
    revenue,
    orders,
  });
};

export const adminUpdateOrderStatus = async (req: any, res: any) => {
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
};
