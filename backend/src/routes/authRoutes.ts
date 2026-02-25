import { Router } from 'express';
import {
  changePassword,
  forgotPassword,
  login,
  me,
  resetPassword,
  signup,
  verifyEmail,
} from '../controllers/authController.js';
import { userAuth } from '../middleware/userAuth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);
router.get('/me', userAuth, me);
router.post('/change-password', userAuth, changePassword);

export default router;
