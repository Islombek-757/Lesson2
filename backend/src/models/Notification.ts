import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'new_lesson' | 'quiz_result' | 'announcement' | 'badge' | 'certificate' | 'streak';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['new_lesson', 'quiz_result', 'announcement', 'badge', 'certificate', 'streak'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
