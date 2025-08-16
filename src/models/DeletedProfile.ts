import mongoose, { Schema, Document } from 'mongoose';

export interface IDeletedProfile extends Document {
  originalUserId: string;
  userData: {
    email: string;
    username?: string;
    title?: string;
    bio?: string;
    image?: string;
    createdAt: Date;
    emailVerified?: Date;
  };
  postsData: Array<{
    _id: string;
    caption: string;
    image?: string;
    archivedImageUrl?: string; // New field for archived image URL
    createdAt: Date;
  }>;
  deletionReason?: string;
  deletedAt: Date;
  deletedBy: string; // User ID who initiated the deletion
  ipAddress?: string;
  userAgent?: string;
  archiveMetadata?: {
    totalImages: number;
    successfullyArchived: number;
    failedArchives: number;
    archiveErrors?: Array<{ url: string; error: string }>;
    archivedAt: Date;
  };
}

const DeletedProfileSchema: Schema = new Schema({
  originalUserId: {
    type: String,
    required: true,
    // Remove duplicate index definition below
  },
  userData: {
    email: { type: String, required: true },
    username: String,
    title: String,
    bio: String,
    image: String,
    createdAt: Date,
    emailVerified: Date,
  },
  postsData: [{
    _id: String,
    caption: String,
    image: String,
    archivedImageUrl: String, // New field for archived image URL
    createdAt: Date,
  }],
  deletionReason: {
    type: String,
    maxlength: 500,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  deletedBy: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
  archiveMetadata: {
    totalImages: Number,
    successfullyArchived: Number,
    failedArchives: Number,
    archiveErrors: [{
      url: String,
      error: String,
    }],
    archivedAt: Date,
  },
});

// Add indexes for efficient querying
// Note: originalUserId index is already defined in the schema above
DeletedProfileSchema.index({ deletedAt: 1 });
DeletedProfileSchema.index({ 'userData.email': 1 });

// Add a TTL index to automatically delete archived profiles after a certain period (optional)
// Uncomment the line below if you want to automatically delete archived data after 2 years
// DeletedProfileSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.models.DeletedProfile || mongoose.model<IDeletedProfile>('DeletedProfile', DeletedProfileSchema);
