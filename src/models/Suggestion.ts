
import mongoose from 'mongoose';

const SuggestionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title.'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description.'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    category: {
        type: String,
        enum: ['feature', 'bug', 'improvement', 'other'],
        default: 'feature',
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'planned', 'completed', 'declined'],
        default: 'pending',
    },
    adminReply: {
        type: String,
        trim: true,
    },
    repliedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export interface ISuggestion extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: 'feature' | 'bug' | 'improvement' | 'other';
    status: 'pending' | 'reviewed' | 'planned' | 'completed' | 'declined';
    adminReply?: string;
    repliedAt?: Date;
    createdAt: Date;
}

const Suggestion = (mongoose.models.Suggestion as mongoose.Model<ISuggestion>) || mongoose.model<ISuggestion>('Suggestion', SuggestionSchema);

export default Suggestion;
