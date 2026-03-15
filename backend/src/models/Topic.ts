import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  title: string;
  slug: string;
  description: string;
  subject: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

TopicSchema.index({ subject: 1, slug: 1 }, { unique: true });

export default mongoose.model<ITopic>('Topic', TopicSchema);
