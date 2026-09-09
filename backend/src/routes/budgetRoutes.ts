import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createBudget, deleteBudget, getBudgets, updateBudget } from '../controllers/budgetController';
import { createBudgetValidator, updateBudgetValidator } from '../validators/budgetValidators';
import { idParamValidator } from '../validators/categoryValidators';

const router = Router();
router.use(protect);

router.get('/', getBudgets);
router.post('/', createBudgetValidator, validateRequest, createBudget);
router.put('/:id', updateBudgetValidator, validateRequest, updateBudget);
router.delete('/:id', idParamValidator, validateRequest, deleteBudget);

export default router;
