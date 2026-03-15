import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import QuizResult from '../models/QuizResult';
import User from '../models/User';
import Notification from '../models/Notification';

export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, lesson } = req.query;
    const query: any = { isPublished: true };
    if (subject) query.subject = subject;
    if (lesson) query.lesson = lesson;

    const quizzes = await Quiz.find(query)
      .populate('subject', 'title icon color')
      .populate('lesson', 'title slug')
      .select('-questions.correctAnswer -questions.explanation');

    res.json({ success: true, quizzes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('subject', 'title icon color')
      .populate('lesson', 'title slug');

    if (!quiz || !quiz.isPublished) { res.status(404).json({ error: 'Quiz not found' }); return; }

    // Strip correct answers for students
    const safeQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(({ correctAnswer: _ca, ...q }) => q)
    };

    res.json({ success: true, quiz: safeQuiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return; }

    // Check attempt limit
    const attemptCount = await QuizResult.countDocuments({
      user: req.user!._id,
      quiz: quiz._id
    });

    if (attemptCount >= quiz.maxAttempts) {
      res.status(400).json({ error: `Maximum ${quiz.maxAttempts} attempts reached` });
      return;
    }

    // Calculate score
    let earnedPoints = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    quiz.questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    let xpEarned = 0;
    if (passed) {
      xpEarned = quiz.xpReward;
      const user = await User.findById(req.user!._id);
      if (user) {
        user.xp += xpEarned;
        user.level = Math.floor(user.xp / 500) + 1;
        await user.save();
      }
    }

    const result = await QuizResult.create({
      user: req.user!._id,
      quiz: quiz._id,
      lesson: quiz.lesson,
      answers,
      score: percentage,
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      timeTaken: timeTaken || 0,
      xpEarned,
      feedback: passed
        ? `Excellent! You scored ${percentage}% and passed the quiz!`
        : `You scored ${percentage}%. The passing score is ${quiz.passingScore}%. Keep practicing!`
    });

    // Send notification
    await Notification.create({
      user: req.user!._id,
      type: 'quiz_result',
      title: passed ? '🎉 Quiz Passed!' : '📊 Quiz Completed',
      message: `You scored ${percentage}% on "${quiz.title}". ${passed ? `You earned ${xpEarned} XP!` : 'Keep trying!'}`,
      link: `/quiz/${quiz._id}/result`
    });

    // Return quiz with answers for review
    const reviewData = quiz.questions.map((q, idx) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: answers[idx],
      isCorrect: answers[idx] === q.correctAnswer,
      explanation: q.explanation,
      points: q.points
    }));

    res.json({
      success: true,
      result: {
        ...result.toObject(),
        review: reviewData
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, lesson, subject, questions, timeLimit, passingScore, maxAttempts, xpReward } = req.body;

    const quiz = await Quiz.create({
      title, lesson, subject, questions, timeLimit,
      passingScore, maxAttempts, xpReward,
      createdBy: req.user!._id,
      isPublished: true
    });

    res.status(201).json({ success: true, quiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return; }
    res.json({ success: true, quiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const results = await QuizResult.find({ quiz: quizId })
      .populate('user', 'name avatar level')
      .sort({ percentage: -1, timeTaken: 1 })
      .limit(20);

    res.json({ success: true, leaderboard: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGlobalLeaderboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: 'student', isActive: true })
      .sort({ xp: -1 })
      .limit(20)
      .select('name avatar xp level streak badges');

    res.json({ success: true, leaderboard: users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await QuizResult.find({ user: req.user!._id })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
