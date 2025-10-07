import mongoose, { Schema, Document } from 'mongoose';

// Rate limit configuration for different user tiers
export interface IRateLimitConfig extends Document {
  tier: string; // 'anonymous', 'registered', 'pro'
  maxGenerations: number;
  windowHours: number;
  updatedAt: Date;
  updatedBy?: string; // Admin user ID who last updated this config
}

const RateLimitConfigSchema: Schema = new Schema({
  tier: {
    type: String,
    required: true,
    unique: true,
    enum: ['anonymous', 'registered', 'pro']
  },
  maxGenerations: {
    type: Number,
    required: true,
    min: 1,
    default: 10,
  },
  windowHours: {
    type: Number,
    required: true,
    default: 24,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    required: false,
  },
});

// Update the updatedAt field on save
RateLimitConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.RateLimitConfig || mongoose.model<IRateLimitConfig>('RateLimitConfig', RateLimitConfigSchema);