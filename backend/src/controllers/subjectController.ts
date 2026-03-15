import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Subject from '../models/Subject';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';

const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export const getSubjects = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ order: 1 });

    const subjectsWithCounts = await Promise.all(
      subjects.map(async (s) => {
        const lessonCount = await Lesson.countDocuments({ subject: s._id, isPublished: true });
        return { ...s.toObject(), lessonCount };
      })
    );

    res.json({ success: true, subjects: subjectsWithCounts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug }).populate('createdBy', 'name');
    if (!subject) { res.status(404).json({ error: 'Subject not found' }); return; }

    const topics = await Topic.find({ subject: subject._id, isActive: true }).sort({ order: 1 });
    const lessons = await Lesson.find({ subject: subject._id, isPublished: true })
      .populate('createdBy', 'name')
      .sort({ order: 1 });

    res.json({ success: true, subject, topics, lessons });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, icon, color, coverImage } = req.body;
    const slug = slugify(title);

    const existing = await Subject.findOne({ slug });
    if (existing) { res.status(400).json({ error: 'Subject with this title already exists' }); return; }

    const subject = await Subject.create({
      title, description, icon, color, coverImage, slug, createdBy: req.user!._id
    });

    res.status(201).json({ success: true, subject });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) { res.status(404).json({ error: 'Subject not found' }); return; }
    res.json({ success: true, subject });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, subjectId, order } = req.body;
    const slug = slugify(title);

    const topic = await Topic.create({
      title, description, slug, subject: subjectId, order, createdBy: req.user!._id
    });

    res.status(201).json({ success: true, topic });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
