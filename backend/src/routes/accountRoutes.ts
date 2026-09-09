import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from '../controllers/accountController';
import {
  createAccountValidator,
  updateAccountValidator,
} from '../validators/accountValidators';
import { idParamValidator } from '../validators/categoryValidators';

const router = Router();
router.use(protect);

router.get('/', getAccounts);
router.post('/', createAccountValidator, validateRequest, createAccount);
router.put('/:id', updateAccountValidator, validateRequest, updateAccount);
router.delete('/:id', idParamValidator, validateRequest, deleteAccount);

export default router;
