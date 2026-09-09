import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/categoryController';
import {
  createCategoryValidator,
  idParamValidator,
  updateCategoryValidator,
} from '../validators/categoryValidators';

const router = Router();
router.use(protect);

router.get('/', getCategories);
router.post('/', createCategoryValidator, validateRequest, createCategory);
router.put('/:id', updateCategoryValidator, validateRequest, updateCategory);
router.delete('/:id', idParamValidator, validateRequest, deleteCategory);

export default router;
