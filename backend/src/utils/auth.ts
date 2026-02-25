import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const signToken = (user: any) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET as string,
    { expiresIn: '7d' }
  );
