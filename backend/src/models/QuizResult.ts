import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // seconds
  xpEarned: number;
  feedback: string;
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    answers: [{ type: Number }],
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    earnedPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeTaken: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    feedback: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
