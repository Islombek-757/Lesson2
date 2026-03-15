import { Router } from 'express';
import {
  getQuizzes, getQuiz, submitQuiz, createQuiz, updateQuiz, deleteQuiz,
  getLeaderboard, getGlobalLeaderboard, getMyResults
} from '../controllers/quizController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getQuizzes);
router.get('/leaderboard', protect, getGlobalLeaderboard);
router.get('/my-results', protect, getMyResults);
router.get('/:id', protect, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:quizId/leaderboard', protect, getLeaderboard);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

export default router;
