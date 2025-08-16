import mongoose, { Schema, Document } from 'mongoose';

// Rate limit tracking for users and IPs
export interface IRateLimit extends Document {
  key: string; // user:userId or ip:ipAddress
  count: number;
  resetTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  resetTime: {
    type: Date,
    required: true,
    // Removed index: true to avoid duplicate with schema.index() below
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
RateLimitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// TTL index to automatically delete expired entries
RateLimitSchema.index({ resetTime: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);
