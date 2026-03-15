import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  coverImage?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#6366f1' },
    coverImage: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>('Subject', SubjectSchema);
