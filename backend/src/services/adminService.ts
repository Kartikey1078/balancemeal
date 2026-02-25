import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const ensureAdminUser = async () => {
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
