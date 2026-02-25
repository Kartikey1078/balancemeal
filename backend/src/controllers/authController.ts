import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { signToken } from '../utils/auth.js';
import {
  buildResetLink,
  buildVerifyLink,
  sendRecoveryEmail,
  sendVerificationEmail,
} from '../utils/email.js';

export const signup = async (req: any, res: any) => {
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
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');
  const user = await User.create({
    name,
    email: normalized,
    passwordHash,
    role: 'USER',
    emailVerified: false,
    verifyTokenHash,
    verifyTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });
  const verifyLink = buildVerifyLink(verifyToken, normalized);
  await sendVerificationEmail(normalized, verifyLink);
  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req: any, res: any) => {
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
  const hasOrders = !!(await Order.exists({
    $or: [{ email: user.email }, { 'deliveryDetails.email': user.email }],
  }));
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    hasOrders,
  });
};

export const forgotPassword = async (req: any, res: any) => {
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
  const hasEmailConfig = !!(
    process.env.RESEND_API_KEY ||
    process.env.EMAIL_WEBHOOK_URL ||
    process.env.SMTP_HOST
  );
  return res.status(200).json(
    hasEmailConfig ? { ok: true } : { ok: true, resetLink: link }
  );
};

export const resetPassword = async (req: any, res: any) => {
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
};

export const verifyEmail = async (req: any, res: any) => {
  const email = String(req.body?.email || req.query?.email || '').toLowerCase();
  const token = String(req.body?.token || req.query?.token || '');
  if (!email || !token) {
    return res.status(400).json({ ok: false, error: 'Invalid verification link' });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    email,
    verifyTokenHash: tokenHash,
    verifyTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ ok: false, error: 'Invalid or expired verification link' });
  }
  user.emailVerified = true;
  user.verifyTokenHash = undefined;
  user.verifyTokenExpires = undefined;
  await user.save();
  return res.status(200).json({ ok: true });
};

export const changePassword = async (req: any, res: any) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ ok: false, error: 'Current password and new password (min 8 characters) required' });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ ok: false, error: 'Current password is incorrect' });
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.status(200).json({ ok: true });
};

export const me = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await User.findById(userId).select('name email role emailVerified');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: (user as any).emailVerified,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Failed to verify user' });
  }
};
