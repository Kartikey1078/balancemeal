import { Router } from 'express';
import {
  adminBulkCreateMeals,
  adminBulkCreateRecipes,
  adminCreateCoupon,
  adminCreateMeal,
  adminCreateNutritionTag,
  adminCreateRecipe,
  adminDeleteMeal,
  adminDeleteNutritionTag,
  adminDeleteRecipe,
  adminGetCoupons,
  adminGetMeals,
  adminGetNutritionTags,
  adminGetRecipes,
  adminGetStats,
  adminGetUsers,
  adminLogin,
  adminUpdateCoupon,
  adminUpdateMeal,
  adminUpdateNutritionTag,
  adminUpdateOrderStatus,
  adminUpdateRecipe,
  adminUpload,
  verifyAdmin,
} from '../controllers/adminController.js';
import { getKitchenReport } from '../controllers/kitchenReportController.js';
import { getOrderReport } from '../controllers/orderReportController.js';
import {
  createMasterRecipe,
  deleteMasterRecipe,
  getMasterRecipes,
  updateMasterRecipe,
} from '../controllers/masterRecipesController.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/login', adminLogin);
router.get('/verify', adminOnly, verifyAdmin);
router.post('/upload', adminOnly, upload.single('image'), adminUpload);

router.get('/meals', adminOnly, adminGetMeals);
router.post('/meals', adminOnly, adminCreateMeal);
router.post('/meals/bulk', adminOnly, adminBulkCreateMeals);
router.patch('/meals/:id', adminOnly, adminUpdateMeal);
router.delete('/meals/:id', adminOnly, adminDeleteMeal);

router.get('/recipes', adminOnly, adminGetRecipes);
router.post('/recipes', adminOnly, adminCreateRecipe);
router.post('/recipes/bulk', adminOnly, adminBulkCreateRecipes);
router.patch('/recipes/:id', adminOnly, adminUpdateRecipe);
router.delete('/recipes/:id', adminOnly, adminDeleteRecipe);

router.get('/nutrition-tags', adminOnly, adminGetNutritionTags);
router.post('/nutrition-tags', adminOnly, adminCreateNutritionTag);
router.patch('/nutrition-tags/:id', adminOnly, adminUpdateNutritionTag);
router.delete('/nutrition-tags/:id', adminOnly, adminDeleteNutritionTag);

router.get('/users', adminOnly, adminGetUsers);

router.get('/coupons', adminOnly, adminGetCoupons);
router.post('/coupons', adminOnly, adminCreateCoupon);
router.patch('/coupons/:id', adminOnly, adminUpdateCoupon);

router.get('/stats', adminOnly, adminGetStats);
router.patch('/orders/:id', adminOnly, adminUpdateOrderStatus);
router.get('/kitchen-report', adminOnly, getKitchenReport);
router.get('/order-report', adminOnly, getOrderReport);
router.get('/master-recipes', adminOnly, getMasterRecipes);
router.post('/master-recipes', adminOnly, createMasterRecipe);
router.patch('/master-recipes/:id', adminOnly, updateMasterRecipe);
router.delete('/master-recipes/:id', adminOnly, deleteMasterRecipe);

export default router;
