import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
} from '../controllers/transactionController';
import {
  createTransactionValidator,
  listTransactionsValidator,
  updateTransactionValidator,
} from '../validators/transactionValidators';
import { idParamValidator } from '../validators/categoryValidators';

const router = Router();
router.use(protect);

router.get('/', listTransactionsValidator, validateRequest, getTransactions);
router.post('/', createTransactionValidator, validateRequest, createTransaction);
router.get('/:id', idParamValidator, validateRequest, getTransaction);
router.put('/:id', updateTransactionValidator, validateRequest, updateTransaction);
router.delete('/:id', idParamValidator, validateRequest, deleteTransaction);

export default router;
