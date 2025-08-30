import mongoose, { Schema, Document } from 'mongoose';

// Discord-specific caption interface
export interface IDiscordCaption extends Document {
  id: string;                    // Auto-generated string ID
  imageId: string;               // Unique image processing ID (same for AI and Cloudinary)
  discordUserId: string;         // Discord user ID (string)
  discordUsername: string;       // Discord username
  imageUrl: string;              // Discord image URL
  cloudinaryUrl: string;         // Cloudinary secure URL
  cloudinaryPublicId: string;    // Cloudinary public ID
  cloudinaryFolder: string;      // Cloudinary folder path
  imageName: string;             // Original image filename
  mood: string;                  // Selected mood
  captions: string[];            // Generated captions
  guildId?: string;              // Discord server ID
  channelId?: string;            // Discord channel ID
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}

// Discord caption schema
const DiscordCaptionSchema = new Schema<IDiscordCaption>({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `discord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  imageId: {
    type: String,
    required: true,
    unique: true
  },
  discordUserId: {
    type: String,
    required: true
  },
  discordUsername: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  cloudinaryFolder: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true
  },
  captions: [{
    type: String,
    required: true
  }],
  guildId: {
    type: String,
    required: false
  },
  channelId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries (defined here to avoid duplicate index warnings)
DiscordCaptionSchema.index({ discordUserId: 1, createdAt: -1 });
DiscordCaptionSchema.index({ mood: 1, createdAt: -1 });
DiscordCaptionSchema.index({ guildId: 1, createdAt: -1 });

// Pre-save middleware to update timestamp
DiscordCaptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find user's captions
DiscordCaptionSchema.statics.findByDiscordUserId = function(discordUserId: string) {
  return this.find({ discordUserId }).sort({ createdAt: -1 });
};

// Static method to find captions by mood
DiscordCaptionSchema.statics.findByMood = function(mood: string) {
  return this.find({ mood }).sort({ createdAt: -1 });
};

// Static method to get user statistics
DiscordCaptionSchema.statics.getUserStats = function(discordUserId: string) {
  return this.aggregate([
    { $match: { discordUserId } },
    {
      $group: {
        _id: null,
        totalCaptions: { $sum: 1 },
        totalImages: { $sum: 1 },
        uniqueMoods: { $addToSet: '$mood' },
        lastUsed: { $max: '$createdAt' }
      }
    }
  ]);
};

// Export model
export const DiscordCaption = mongoose.model<IDiscordCaption>('DiscordCaption', DiscordCaptionSchema);

// Export default for easy import
export default DiscordCaption;
