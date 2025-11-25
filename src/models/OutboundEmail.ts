import mongoose, { Schema, Document } from 'mongoose';

export interface OutboundEmail extends Document {
    to: string;
    subject: string;
    html: string;
    provider: string; // 'brevo' | 'octopus' | 'smtp'
    status: 'queued' | 'sent' | 'failed';
    error?: string;
    createdAt: Date;
    updatedAt: Date;
    retryCount: number;
}

const OutboundEmailSchema = new Schema<OutboundEmail>({
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    provider: { type: String, required: true },
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.OutboundEmail || mongoose.model<OutboundEmail>('OutboundEmail', OutboundEmailSchema);
