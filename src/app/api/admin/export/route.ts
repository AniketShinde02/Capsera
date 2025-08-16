import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageAdmins } from '@/lib/init-admin';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage admins
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { reportType, dateRange, format = 'json' } = body;

    const { db } = await connectToDatabase();

    let reportData: any = {};
    const now = new Date();

    switch (reportType) {
      case 'user-summary':
        // User summary report
        const totalRegularUsers = await db.collection('users').countDocuments({ isDeleted: { $ne: true } });
        const totalAdminUsers = await db.collection('adminusers').countDocuments({ status: 'active' });
        const activeUsers = await db.collection('users').countDocuments({ isActive: true, isDeleted: { $ne: true } });
        
        reportData = {
          reportType: 'User Summary Report',
          generatedAt: now.toISOString(),
          summary: {
            totalUsers: totalRegularUsers + totalAdminUsers,
            regularUsers: totalRegularUsers,
            adminUsers: totalAdminUsers,
            activeUsers,
            inactiveUsers: totalRegularUsers - activeUsers
          }
        };
        break;

      case 'role-summary':
        // Role summary report
        const roles = await db.collection('roles').find({}).toArray();
        const roleData = await Promise.all(roles.map(async (role) => {
          const regularUserCount = await db.collection('users').countDocuments({ 
            'role.name': role.name,
            isDeleted: { $ne: true }
          });
          const adminUserCount = await db.collection('adminusers').countDocuments({ 
            'role.name': role.name,
            status: 'active'
          });
          return {
            roleName: role.name,
            displayName: role.displayName,
            totalUsers: regularUserCount + adminUserCount,
            regularUsers: regularUserCount,
            adminUsers: adminUserCount,
            isSystem: role.isSystem,
            isActive: role.isActive
          };
        }));
        
        reportData = {
          reportType: 'Role Summary Report',
          generatedAt: now.toISOString(),
          roles: roleData
        };
        break;

      case 'system-status':
        // System status report
        const systemStats = {
          database: 'Connected',
          collections: {
            users: await db.collection('users').countDocuments({}),
            adminusers: await db.collection('adminusers').countDocuments({}),
            roles: await db.collection('roles').countDocuments({}),
            deletedprofiles: await db.collection('deletedprofiles').countDocuments({})
          },
          lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Mock data
          systemLoad: Math.floor(Math.random() * 100), // Mock data
          uptime: '24 hours' // Mock data
        };
        
        reportData = {
          reportType: 'System Status Report',
          generatedAt: now.toISOString(),
          systemStats
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(reportData);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-${now.toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON by default
    return NextResponse.json({ 
      success: true, 
      data: reportData 
    });

  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' }, 
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - can be enhanced based on data structure
  if (data.reportType === 'User Summary Report') {
    return `Report Type,Generated At,Total Users,Regular Users,Admin Users,Active Users,Inactive Users\n${data.reportType},${data.generatedAt},${data.summary.totalUsers},${data.summary.regularUsers},${data.summary.adminUsers},${data.summary.activeUsers},${data.summary.inactiveUsers}`;
  } else if (data.reportType === 'Role Summary Report') {
    let csv = 'Report Type,Generated At,Role Name,Display Name,Total Users,Regular Users,Admin Users,Is System,Is Active\n';
    data.roles.forEach((role: any) => {
      csv += `${data.reportType},${data.generatedAt},${role.roleName},${role.displayName},${role.totalUsers},${role.regularUsers},${role.adminUsers},${role.isSystem},${role.isActive}\n`;
    });
    return csv;
  } else if (data.reportType === 'System Status Report') {
    return `Report Type,Generated At,Database,Total Users,Total Admin Users,Total Roles,Total Deleted Profiles,Last Backup,System Load,Uptime\n${data.reportType},${data.generatedAt},${data.systemStats.database},${data.systemStats.collections.users},${data.systemStats.collections.adminusers},${data.systemStats.collections.roles},${data.systemStats.collections.deletedprofiles},${data.systemStats.lastBackup},${data.systemStats.systemLoad}%,${data.systemStats.uptime}`;
  }
  
  return JSON.stringify(data, null, 2);
}
