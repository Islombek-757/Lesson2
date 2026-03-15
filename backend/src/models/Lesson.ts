import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  subject: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  videoUrl?: string;
  attachments: { name: string; url: string; type: string }[];
  tags: string[];
  thumbnail?: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic' },
    videoUrl: { type: String },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String }
      }
    ],
    tags: [{ type: String }],
    thumbnail: { type: String },
    duration: { type: Number, default: 10 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    xpReward: { type: Number, default: 50 }
  },
  { timestamps: true }
);

LessonSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<ILesson>('Lesson', LessonSchema);
