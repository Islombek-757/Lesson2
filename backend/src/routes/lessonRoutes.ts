import { Router } from 'express';
import {
  getLessons, getLesson, createLesson, updateLesson, deleteLesson,
  toggleBookmark, markComplete, searchLessons
} from '../controllers/lessonController';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getLessons);
router.get('/search', searchLessons);
router.get('/:slug', protect, getLesson);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), createLesson);
router.put('/:id', protect, authorize('teacher', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLesson);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/complete', protect, markComplete);

export default router;
