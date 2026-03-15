import { Router } from 'express';
import {
  getSubjects, getSubject, createSubject, updateSubject, deleteSubject, createTopic
} from '../controllers/subjectController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getSubjects);
router.get('/:slug', getSubject);
router.post('/', protect, authorize('teacher', 'admin'), createSubject);
router.put('/:id', protect, authorize('teacher', 'admin'), updateSubject);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteSubject);
router.post('/topics', protect, authorize('teacher', 'admin'), createTopic);

export default router;
