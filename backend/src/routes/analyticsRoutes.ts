import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getCategoryExpenses,
  getDailySpendingHandler,
  getDashboard,
  getInsights,
  getMonthlyTrendHandler,
} from '../controllers/analyticsController';

const router = Router();
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/category-expenses', getCategoryExpenses);
router.get('/monthly-trend', getMonthlyTrendHandler);
router.get('/daily-spending', getDailySpendingHandler);
router.get('/insights', getInsights);

export default router;
