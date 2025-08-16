import mongoose, { Schema, Document } from 'mongoose';

export interface IDataRecoveryRequest extends Document {
  userId: string;
  userEmail: string;
  reason: string;
  details: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DataRecoveryRequestSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'accidental_deletion',
      'data_retrieval',
      'legal_requirement',
      'business_need',
      'other'
    ],
  },
  details: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
    index: true,
  },
  adminNotes: {
    type: String,
    maxlength: 500,
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
DataRecoveryRequestSchema.index({ userId: 1, status: 1 });
DataRecoveryRequestSchema.index({ userEmail: 1, status: 1 });
DataRecoveryRequestSchema.index({ status: 1, submittedAt: 1 });
DataRecoveryRequestSchema.index({ submittedAt: 1 });

export default mongoose.models.DataRecoveryRequest || mongoose.model<IDataRecoveryRequest>('DataRecoveryRequest', DataRecoveryRequestSchema);
