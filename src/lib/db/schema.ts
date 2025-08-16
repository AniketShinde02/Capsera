import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailSubscription extends Document {
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  createdAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  source: string;
  metadata?: any;
}

const emailSubscriptionSchema = new Schema<IEmailSubscription>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'unsubscribed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  },
  source: {
    type: String,
    default: 'feature-development'
  },
  metadata: {
    type: Schema.Types.Mixed
  }
});

// Create index for faster queries (only if not already exists)
if (!mongoose.models.EmailSubscription) {
  emailSubscriptionSchema.index({ email: 1 });
  emailSubscriptionSchema.index({ status: 1 });
  emailSubscriptionSchema.index({ createdAt: -1 });
}

export const EmailSubscription = mongoose.models.EmailSubscription || 
  mongoose.model<IEmailSubscription>('EmailSubscription', emailSubscriptionSchema);

