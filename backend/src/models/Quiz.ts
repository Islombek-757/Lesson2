import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface IQuiz extends Document {
  title: string;
  lesson: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  questions: IQuestion[];
  timeLimit: number; // seconds
  passingScore: number; // percentage
  maxAttempts: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  points: { type: Number, default: 10 }
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    questions: [QuestionSchema],
    timeLimit: { type: Number, default: 600 }, // 10 minutes default
    passingScore: { type: Number, default: 70 },
    maxAttempts: { type: Number, default: 3 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    xpReward: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
