
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email.',
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password.'],
    minlength: 6,
    select: false, // Important to not expose password by default
  },
  // Store hashes of previously used passwords to prevent reuse
  passwordHistory: {
    type: [String],
    default: [],
    select: false,
  },
  username: {
    type: String,
    default: null,
    trim: true,
  },
  title: {
    type: String,
    default: null,
    trim: true,
  },
  bio: {
    type: String,
    default: null,
    trim: true,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  // Enhanced password reset support with security measures
  resetPasswordToken: {
    type: String,
    default: null,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  // Track reset requests to prevent abuse
  resetPasswordRequests: [{
    requestedAt: {
      type: Date,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    }
  }],
  // Daily reset request counter (resets at midnight)
  dailyResetCount: {
    type: Number,
    default: 0,
  },
  lastResetRequestDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Role-based access control
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },
  // Admin-specific fields
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Super admin field - highest level access
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  // Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false
  },
  // Last login tracking
  lastLoginAt: {
    type: Date,
    default: null
  },
  // Track when user was last seen (for online status)
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Account status
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  // Email preferences and promotional email settings
  emailPreferences: {
    promotional: {
      type: Boolean,
      default: true
    },
    welcome: {
      type: Boolean,
      default: true
    },
    requestConfirmations: {
      type: Boolean,
      default: true
    }
  },
  // Promotional email tracking
  promotionalEmailSentAt: {
    type: Date,
    default: null
  },
  lastPromotionalEmailDate: {
    type: Date,
    default: null
  },
  promotionalEmailCount: {
    type: Number,
    default: 0
  },
  // Unsubscribe token for promotional emails
  unsubscribeToken: {
    type: String,
    default: null,
    select: false
  },
  // Track when user was created for welcome email
  welcomeEmailSent: {
    type: Boolean,
    default: false
  }
});

// Index for efficient reset token lookups
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ resetPasswordExpires: 1 });
// Note: email index is already defined in the schema above
UserSchema.index({ 'resetPasswordRequests.requestedAt': 1 });

// Method to check if user can request another password reset today
UserSchema.methods.canRequestPasswordReset = function(): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If it's a new day, reset the counter
  if (!this.lastResetRequestDate || this.lastResetRequestDate < today) {
    this.dailyResetCount = 0;
    this.lastResetRequestDate = today;
    return true;
  }
  
  // Maximum 3 reset requests per day
  return this.dailyResetCount < 3;
};

// Method to increment daily reset counter
UserSchema.methods.incrementResetCounter = function(): void {
  this.dailyResetCount += 1;
  this.lastResetRequestDate = new Date();
};

// Method to add a new reset request
UserSchema.methods.addResetRequest = function(token: string, ipAddress: string, userAgent?: string): void {
  this.resetPasswordRequests.push({
    requestedAt: new Date(),
    ipAddress,
    userAgent,
    token,
    used: false
  });
};

// Method to mark a reset token as used
UserSchema.methods.markResetTokenUsed = function(token: string): void {
  const request = this.resetPasswordRequests.find((req: any) => req.token === token);
  if (request) {
    request.used = true;
    request.usedAt = new Date();
  }
};

// Method to clean up old reset requests (older than 24 hours)
UserSchema.methods.cleanupOldResetRequests = function(): void {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  this.resetPasswordRequests = this.resetPasswordRequests.filter((req: any) => req.requestedAt > cutoff);
};

// Method to check if promotional email can be sent (every 3 days)
UserSchema.methods.canSendPromotionalEmail = function(): boolean {
  if (!this.emailPreferences.promotional) {
    return false;
  }
  
  if (!this.lastPromotionalEmailDate) {
    return true;
  }
  
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return this.lastPromotionalEmailDate < threeDaysAgo;
};

// Method to mark promotional email as sent
UserSchema.methods.markPromotionalEmailSent = function(): void {
  this.lastPromotionalEmailDate = new Date();
  this.promotionalEmailCount += 1;
  this.promotionalEmailSentAt = new Date();
};

// Method to generate unsubscribe token
UserSchema.methods.generateUnsubscribeToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.unsubscribeToken = token;
  return token;
};

// Method to unsubscribe from promotional emails
UserSchema.methods.unsubscribeFromPromotional = function(): void {
  this.emailPreferences.promotional = false;
  this.unsubscribeToken = null;
};

// Method to check if welcome email should be sent
UserSchema.methods.shouldSendWelcomeEmail = function(): boolean {
  return this.emailPreferences.welcome && !this.welcomeEmailSent;
};

// Method to mark welcome email as sent
UserSchema.methods.markWelcomeEmailSent = function(): void {
  this.welcomeEmailSent = true;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
