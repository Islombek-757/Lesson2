import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Lesson from '../models/Lesson';
import User from '../models/User';
import Notification from '../models/Notification';

const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now();

export const getLessons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topic, difficulty, search, page = 1, limit = 12 } = req.query;
    const query: any = { isPublished: true };

    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search as string };

    const skip = (Number(page) - 1) * Number(limit);
    const [lessons, total] = await Promise.all([
      Lesson.find(query)
        .populate('subject', 'title slug icon color')
        .populate('topic', 'title')
        .populate('createdBy', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lesson.countDocuments(query)
    ]);

    res.json({
      success: true,
      lessons,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug, isPublished: true })
      .populate('subject', 'title slug icon color')
      .populate('topic', 'title slug')
      .populate('createdBy', 'name avatar bio');

    if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }

    // Increment views
    await Lesson.findByIdAndUpdate(lesson._id, { $inc: { views: 1 } });

    // Check if user bookmarked
    let isBookmarked = false;
    if (req.user) {
      isBookmarked = req.user.bookmarkedLessons.some(
        (id) => id.toString() === lesson._id.toString()
      );
    }

    res.json({ success: true, lesson, isBookmarked });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, content, subject, topic, videoUrl, tags, difficulty, duration, xpReward } = req.body;
    const slug = slugify(title);

    const lesson = await Lesson.create({
      title, description, content, subject, topic, videoUrl,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      difficulty, duration, xpReward, slug, createdBy: req.user!._id,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    // Notify all students about new lesson
    const students = await User.find({ role: 'student', isActive: true }).select('_id');
    const notifications = students.map((s) => ({
      user: s._id,
      type: 'new_lesson' as const,
      title: '📚 New Lesson Available!',
      message: `A new lesson "${title}" has been published. Check it out!`,
      link: `/lessons/${slug}`
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, lesson });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }

    if (lesson.createdBy.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' }); return;
    }

    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, lesson: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.id;
    const user = await User.findById(req.user!._id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const idx = user.bookmarkedLessons.findIndex((id) => id.toString() === lessonId);
    if (idx > -1) {
      user.bookmarkedLessons.splice(idx, 1);
      await user.save();
      res.json({ success: true, bookmarked: false });
    } else {
      user.bookmarkedLessons.push(new (require('mongoose').Types.ObjectId)(lessonId));
      await user.save();
      res.json({ success: true, bookmarked: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.id;
    const user = await User.findById(req.user!._id);
    const lesson = await Lesson.findById(lessonId);

    if (!user || !lesson) { res.status(404).json({ error: 'Not found' }); return; }

    const alreadyCompleted = user.completedLessons.some((id) => id.toString() === lessonId);
    if (!alreadyCompleted) {
      user.completedLessons.push(new (require('mongoose').Types.ObjectId)(lessonId));
      user.xp += lesson.xpReward;
      user.level = Math.floor(user.xp / 500) + 1;
      await user.save();
    }

    res.json({ success: true, xpEarned: alreadyCompleted ? 0 : lesson.xpReward, totalXp: user.xp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchLessons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q) { res.json({ success: true, results: [] }); return; }

    const lessons = await Lesson.find({
      isPublished: true,
      $or: [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } }
      ]
    })
      .populate('subject', 'title icon color')
      .limit(10)
      .select('title slug description thumbnail difficulty duration');

    res.json({ success: true, results: lessons });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
