import mongoose, { Schema, Document } from 'mongoose';

// API Key management for Gemini keys
export interface IApiKey extends Document {
  keyIndex: number; // 1, 2, 3, 4
  keyValue: string; // The actual API key
  isActive: boolean;
  requestCount: number;
  dailyRequestCount: number;
  lastUsed: Date;
  lastReset: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema: Schema = new Schema({
  keyIndex: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 4
  },
  keyValue: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  requestCount: {
    type: Number,
    required: true,
    default: 0,
  },
  dailyRequestCount: {
    type: Number,
    required: true,
    default: 0,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  lastReset: {
    type: Date,
    default: Date.now,
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
ApiKeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
ApiKeySchema.index({ isActive: 1 });

export default mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
