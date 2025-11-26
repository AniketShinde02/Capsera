import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { connectToDatabase } from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
    try {
        const adminError = await verifyAdminAccess(request);
        if (adminError) return adminError;

        const { db } = await connectToDatabase();

        // Fetch latest 50 logs
        const logs = await db.collection('auditlogs')
            .aggregate([
                { $sort: { createdAt: -1 } },
                { $limit: 50 },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'adminId',
                        foreignField: '_id',
                        as: 'adminDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'adminusers',
                        localField: 'adminId',
                        foreignField: '_id',
                        as: 'adminUserDetails'
                    }
                },
                {
                    $project: {
                        action: 1,
                        targetModel: 1,
                        targetId: 1,
                        details: 1,
                        ipAddress: 1,
                        status: 1,
                        createdAt: 1,
                        adminName: {
                            $cond: {
                                if: { $gt: [{ $size: "$adminDetails" }, 0] },
                                then: { $arrayElemAt: ["$adminDetails.username", 0] },
                                else: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$adminUserDetails" }, 0] },
                                        then: { $arrayElemAt: ["$adminUserDetails.username", 0] },
                                        else: "Unknown Admin"
                                    }
                                }
                            }
                        },
                        adminEmail: {
                            $cond: {
                                if: { $gt: [{ $size: "$adminDetails" }, 0] },
                                then: { $arrayElemAt: ["$adminDetails.email", 0] },
                                else: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$adminUserDetails" }, 0] },
                                        then: { $arrayElemAt: ["$adminUserDetails.email", 0] },
                                        else: "Unknown"
                                    }
                                }
                            }
                        }
                    }
                }
            ])
            .toArray();

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
