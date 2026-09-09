import { Router } from 'express';
import { getMe, login, register, updatePrivacySettings } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { loginValidator, registerValidator } from '../validators/authValidators';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', protect, getMe);
router.put('/privacy-settings', protect, updatePrivacySettings);

export default router;
