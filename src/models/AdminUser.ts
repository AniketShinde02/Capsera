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
    ],
    index: true, // Remove duplicate index definition below
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true, // Remove duplicate index definition below
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
  }
});

// Indexes for efficient queries
// Note: email and username indexes are already defined in the schema above
AdminUserSchema.index({ 'role.name': 1 });
AdminUserSchema.index({ status: 1 });

// Method to check if account is locked
AdminUserSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
AdminUserSchema.methods.incLoginAttempts = function(): void {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
AdminUserSchema.methods.resetLoginAttempts = function(): void {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLoginAt: new Date() }
  });
};

// Method to compare password
AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
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
AdminUserSchema.pre('save', async function(next) {
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
AdminUserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
