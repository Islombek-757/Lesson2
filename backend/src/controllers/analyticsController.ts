import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Lesson from '../models/Lesson';
import QuizResult from '../models/QuizResult';
import Subject from '../models/Subject';

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId)
      .populate('completedLessons', 'title slug thumbnail subject')
      .populate('bookmarkedLessons', 'title slug thumbnail subject difficulty');

    const quizResults = await QuizResult.find({ user: userId })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const totalQuizzes = await QuizResult.countDocuments({ user: userId });
    const passedQuizzes = await QuizResult.countDocuments({ user: userId, passed: true });
    const avgScore =
      totalQuizzes > 0
        ? Math.round(
            (await QuizResult.aggregate([
              { $match: { user: userId } },
              { $group: { _id: null, avg: { $avg: '$percentage' } } }
            ]))[0]?.avg || 0
          )
        : 0;

    // Weekly progress (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyResults = await QuizResult.find({
      user: userId,
      createdAt: { $gte: weekAgo }
    }).select('percentage createdAt');

    // Subject progress
    const completedLessonsBySubject = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$completedLessons' },
      {
        $lookup: {
          from: 'lessons',
          localField: 'completedLessons',
          foreignField: '_id',
          as: 'lesson'
        }
      },
      { $unwind: '$lesson' },
      { $group: { _id: '$lesson.subject', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      dashboard: {
        user,
        stats: {
          lessonsCompleted: user?.completedLessons.length || 0,
          lessonsBookmarked: user?.bookmarkedLessons.length || 0,
          totalQuizzes,
          passedQuizzes,
          avgScore,
          xp: user?.xp || 0,
          level: user?.level || 1,
          streak: user?.streak || 0
        },
        recentResults: quizResults,
        weeklyProgress: weeklyResults,
        subjectProgress: completedLessonsBySubject
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeacherAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalLessons,
      totalSubjects,
      totalQuizResults,
      recentStudents,
      topLessons,
      avgQuizScore
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Lesson.countDocuments({ isPublished: true }),
      Subject.countDocuments({ isActive: true }),
      QuizResult.countDocuments(),
      User.find({ role: 'student', isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email avatar xp level streak createdAt'),
      Lesson.find({ isPublished: true })
        .sort({ views: -1 })
        .limit(5)
        .select('title views likes'),
      QuizResult.aggregate([
        { $group: { _id: null, avg: { $avg: '$percentage' } } }
      ])
    ]);

    const avgScore = Math.round(avgQuizScore[0]?.avg || 0);

    // Monthly quiz activity
    const monthlyActivity = await QuizResult.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$percentage' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Hardest quizzes (lowest score)
    const hardestQuizzes = await QuizResult.aggregate([
      {
        $group: {
          _id: '$quiz',
          avgScore: { $avg: '$percentage' },
          attempts: { $sum: 1 }
        }
      },
      { $sort: { avgScore: 1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      { $unwind: '$quiz' }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: { totalStudents, totalLessons, totalSubjects, totalQuizResults, avgScore },
        recentStudents,
        topLessons,
        monthlyActivity,
        hardestQuizzes
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const user = await User.findById(studentId).populate('completedLessons', 'title subject');
    if (!user) { res.status(404).json({ error: 'Student not found' }); return; }

    const results = await QuizResult.find({ user: studentId })
      .populate('quiz', 'title subject')
      .sort({ createdAt: -1 });

    res.json({ success: true, student: user, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
