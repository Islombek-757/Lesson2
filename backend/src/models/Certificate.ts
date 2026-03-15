import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  user: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  title: string;
  description: string;
  issuedAt: Date;
  certificateId: string;
  score: number;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String },
    issuedAt: { type: Date, default: Date.now },
    certificateId: { type: String, required: true, unique: true },
    score: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
