import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'TOGGLE_USER_STATUS',
            'CREATE_ADMIN', 'UPDATE_ADMIN', 'DELETE_ADMIN',
            'SYSTEM_UPDATE', 'EXPORT_DATA', 'VIEW_SENSITIVE_DATA'
        ]
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Some actions might not target a specific ID (e.g., export)
    },
    targetModel: {
        type: String,
        required: false,
        enum: ['User', 'AdminUser', 'System', 'Report']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: '0.0.0.0'
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE'],
        default: 'SUCCESS'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 90 // Auto-delete logs after 90 days
    }
});

// Index for faster queries
AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
