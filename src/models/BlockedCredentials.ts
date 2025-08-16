import mongoose, { Schema, Document } from 'mongoose';

// Blocked credentials to prevent abuse
export interface IBlockedCredentials extends Document {
  email: string;
  blockedUntil: Date;
  attempts: number;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlockedCredentialsSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  blockedUntil: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    required: true,
    default: 1,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'abuse_prevention',
      'account_deletion_abuse',
      'rate_limit_violation',
      'suspicious_activity',
      'manual_block'
    ],
    default: 'abuse_prevention',
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
BlockedCredentialsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// TTL index to automatically delete expired entries
BlockedCredentialsSchema.index({ blockedUntil: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries
BlockedCredentialsSchema.index({ email: 1, blockedUntil: 1 });

export default mongoose.models.BlockedCredentials || mongoose.model<IBlockedCredentials>('BlockedCredentials', BlockedCredentialsSchema);
