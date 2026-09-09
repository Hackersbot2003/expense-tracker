import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import accountRoutes from './accountRoutes';
import transactionRoutes from './transactionRoutes';
import budgetRoutes from './budgetRoutes';
import analyticsRoutes from './analyticsRoutes';
import friendRoutes from './friendRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'ExpenseFlow API is running', version: '1.0.0' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/friends', friendRoutes);
router.use('/users', userRoutes);

export default router;
