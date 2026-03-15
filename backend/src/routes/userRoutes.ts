import { Router } from 'express';
import { getUsers, getUser, updateUser, getLeaderboard } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/', protect, authorize('teacher', 'admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, authorize('admin'), updateUser);

export default router;
