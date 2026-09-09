import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  acceptRequest,
  getFriends,
  getIncomingRequests,
  rejectRequest,
  removeFriend,
  sendFriendRequest,
} from '../controllers/friendController';
import {
  compareWithFriend,
  getFriendAnalytics,
  getFriendProfile,
  getFriendTransactions,
} from '../controllers/friendDataController';

const router = Router();
router.use(protect);

router.get('/', getFriends);
router.post('/request', sendFriendRequest);
router.get('/requests', getIncomingRequests);
router.put('/request/:id/accept', acceptRequest);
router.put('/request/:id/reject', rejectRequest);
router.delete('/:id', removeFriend);

// Read-only friend data, all privacy-gated on the backend
router.get('/:userId/profile', getFriendProfile);
router.get('/:userId/analytics', getFriendAnalytics);
router.get('/:userId/transactions', getFriendTransactions);
router.get('/:userId/compare', compareWithFriend);

export default router;
