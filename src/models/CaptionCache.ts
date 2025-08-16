import mongoose, { Schema, Document } from 'mongoose';

export interface ICaptionCache extends Document {
  imageHash: string;           // Unique hash of the image content
  prompt: string;              // The exact prompt used
  captions: string[];          // Generated captions
  mood: string;                // Selected mood
  userId?: string;             // User who first generated this
  usageCount: number;          // How many times this cache was used
  lastUsed: Date;              // Last time this cache was accessed
  createdAt: Date;             // When this cache was first created
  expiresAt: Date;             // When this cache expires (optional)
}

const CaptionCacheSchema = new Schema<ICaptionCache>({
  imageHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  prompt: {
    type: String,
    required: true,
    index: true
  },
  captions: [{
    type: String,
    required: true
  }],
  mood: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: false,
    index: true
  },
  usageCount: {
    type: Number,
    default: 1
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
CaptionCacheSchema.index({ imageHash: 1, prompt: 1, mood: 1 });

// TTL index for automatic cleanup (optional - cache expires after 30 days)
CaptionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to increment usage count
CaptionCacheSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Static method to find cache entry
CaptionCacheSchema.statics.findCache = function(imageHash: string, prompt: string, mood: string) {
  return this.findOne({ imageHash, prompt, mood });
};

// Static method to create or update cache
CaptionCacheSchema.statics.createOrUpdateCache = function(cacheData: Partial<ICaptionCache>) {
  return this.findOneAndUpdate(
    { imageHash: cacheData.imageHash, prompt: cacheData.prompt, mood: cacheData.mood },
    {
      ...cacheData,
      $inc: { usageCount: 1 },
      lastUsed: new Date()
    },
    { upsert: true, new: true }
  );
};

// Static method to get cache statistics
CaptionCacheSchema.statics.getCacheStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalUsage: { $sum: '$usageCount' },
        averageUsage: { $avg: '$usageCount' },
        oldestEntry: { $min: '$createdAt' },
        newestEntry: { $max: '$createdAt' }
      }
    }
  ]);
};

// Static method to clean old cache entries
CaptionCacheSchema.statics.cleanOldCache = function(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    usageCount: { $lt: 2 } // Only delete entries used less than 2 times
  });
};

export default mongoose.models.CaptionCache || mongoose.model<ICaptionCache>('CaptionCache', CaptionCacheSchema);
