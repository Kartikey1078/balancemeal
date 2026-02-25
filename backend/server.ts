import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT, frontendOrigin } from './src/config/env.js';
import { ensureAdminUser } from './src/services/adminService.js';
import adminRoutes from './src/routes/adminRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import mealsRoutes from './src/routes/mealsRoutes.js';
import recipesRoutes from './src/routes/recipesRoutes.js';
import nutritionTagsRoutes from './src/routes/nutritionTagsRoutes.js';
import couponsRoutes from './src/routes/couponsRoutes.js';
import paymentsRoutes from './src/routes/paymentsRoutes.js';
import ordersRoutes from './src/routes/ordersRoutes.js';

dotenv.config();

/* ======================
   APP SETUP
====================== */
const app = express();

app.use(express.json());
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
   ROUTES
====================== */

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'Backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/nutrition-tags', nutritionTagsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/orders', ordersRoutes);

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
