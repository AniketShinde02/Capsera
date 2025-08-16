import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: [
      'users', 'roles', 'posts', 'captions', 'data-recovery', 
      'archived-profiles', 'dashboard', 'system', 'analytics'
    ]
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage']
  }]
});

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [PermissionSchema],
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Update timestamp on save
RoleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
