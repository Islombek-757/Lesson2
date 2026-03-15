import { Router } from 'express';
import { chatWithAI, summarizeLesson, generateQuestions, explainTopic } from '../controllers/aiController';
import { protect } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many AI requests, please wait a moment.' }
});

const router = Router();

router.use(protect);
router.use(aiLimiter);
router.post('/chat', chatWithAI);
router.post('/summarize', summarizeLesson);
router.post('/generate-questions', generateQuestions);
router.post('/explain', explainTopic);

export default router;
