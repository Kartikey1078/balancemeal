import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const frontendOrigin =
  process.env.FRONTEND_ORIGIN || 'http://localhost:3005';
export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
