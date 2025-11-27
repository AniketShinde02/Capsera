import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email.',
    ]
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: [true, 'Please add a password.'],
    minlength: 6,
    select: false,
  },
  role: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    name: {
      type: String,
      required: true,
      enum: ['admin', 'super-admin', 'moderator']
    },
    displayName: {
      type: String,
      required: true
    }
  },
  isAdmin: {
    type: Boolean,
    default: true
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Enhanced password reset support
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
  }
});

// Indexes for efficient queries
// Note: email and username indexes are already defined in the schema above
AdminUserSchema.index({ 'role.name': 1 });
AdminUserSchema.index({ status: 1 });
AdminUserSchema.index({ resetPasswordToken: 1 });
AdminUserSchema.index({ resetPasswordExpires: 1 });

// Method to check if account is locked
AdminUserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
AdminUserSchema.methods.incLoginAttempts = function (): void {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
AdminUserSchema.methods.resetLoginAttempts = function (): void {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLoginAt: new Date() }
  });
};

// Method to check if user can request another password reset today
AdminUserSchema.methods.canRequestPasswordReset = function (): boolean {
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
AdminUserSchema.methods.incrementResetCounter = function (): void {
  this.dailyResetCount += 1;
  this.lastResetRequestDate = new Date();
};

// Method to add a new reset request
AdminUserSchema.methods.addResetRequest = function (token: string, ipAddress: string, userAgent?: string): void {
  this.resetPasswordRequests.push({
    requestedAt: new Date(),
    ipAddress,
    userAgent,
    token,
    used: false
  });
};

// Method to mark a reset token as used
AdminUserSchema.methods.markResetTokenUsed = function (token: string): void {
  const request = this.resetPasswordRequests.find((req: any) => req.token === token);
  if (request) {
    request.used = true;
    request.usedAt = new Date();
  }
};

// Method to clean up old reset requests (older than 24 hours)
AdminUserSchema.methods.cleanupOldResetRequests = function (): void {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  this.resetPasswordRequests = this.resetPasswordRequests.filter((req: any) => req.requestedAt > cutoff);
};

// Method to compare password
AdminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (this.isLocked()) {
    throw new Error('Account is locked due to too many failed login attempts');
  }

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    if (isMatch) {
      this.resetLoginAttempts();
    } else {
      this.incLoginAttempts();
    }
    return isMatch;
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Pre-save middleware to hash password
AdminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update timestamp
AdminUserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Force model recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.AdminUser;
}

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
