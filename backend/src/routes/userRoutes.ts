import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { searchUsers } from '../controllers/friendController';

const router = Router();
router.use(protect);

router.get('/search', searchUsers);

export default router;
