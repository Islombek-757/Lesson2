import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query: any = { isActive: true };
    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(query)
    ]);

    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, bio, avatar, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, avatar, isActive },
      { new: true }
    ).select('-password');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (_req: AuthRequest, res: Response): Promise<void> => {
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
