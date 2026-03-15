import { Router } from 'express';
import { getStudentDashboard, getTeacherAnalytics, getStudentProgress } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/student', protect, getStudentDashboard);
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/student/:studentId', protect, authorize('teacher', 'admin'), getStudentProgress);

export default router;
