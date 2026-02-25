import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    emailVerified: { type: Boolean, default: false },
    verifyTokenHash: String,
    verifyTokenExpires: Date,
    resetTokenHash: String,
    resetTokenExpires: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
