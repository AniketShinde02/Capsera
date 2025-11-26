import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface LogDetails {
    [key: string]: any;
}

export async function logAdminAction(
    req: NextRequest | null,
    action: string,
    targetId: string | null,
    targetModel: string | null,
    details: LogDetails,
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
) {
    try {
        const session = await getServerSession(authOptions);
        const adminId = session?.user?.id;

        if (!adminId) {
            console.warn('⚠️ Attempted to log admin action without session');
            return;
        }

        const { db } = await connectToDatabase();

        // Get IP and User Agent
        let ipAddress = '0.0.0.0';
        let userAgent = 'Unknown';

        if (req) {
            const forwardedFor = req.headers.get('x-forwarded-for');
            ipAddress = forwardedFor ? forwardedFor.split(',')[0] : '0.0.0.0';
            userAgent = req.headers.get('user-agent') || 'Unknown';
        }

        const logEntry = {
            adminId,
            action,
            targetId,
            targetModel,
            details,
            ipAddress,
            userAgent,
            status,
            createdAt: new Date()
        };

        await db.collection('auditlogs').insertOne(logEntry);
        console.log(`📝 Audit Log: ${action} by ${adminId} - ${status}`);

    } catch (error) {
        console.error('❌ Failed to create audit log:', error);
        // Don't throw error to prevent blocking the main action
    }
}
