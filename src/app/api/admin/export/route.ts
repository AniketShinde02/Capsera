import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageAdmins } from '@/lib/init-admin';
import { connectToDatabase } from '@/lib/db';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

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

      case 'dashboard-comprehensive':
        // Comprehensive dashboard report
        const totalUsers = await db.collection('users').countDocuments({ isDeleted: { $ne: true } });
        const totalPosts = await db.collection('posts').countDocuments({ isDeleted: { $ne: true } });
        const totalImages = await db.collection('posts').countDocuments({ 
          image: { $exists: true, $ne: null },
          isDeleted: { $ne: true }
        });
        
        reportData = {
          reportType: 'Comprehensive Dashboard Report',
          generatedAt: now.toISOString(),
          overview: {
            totalUsers,
            totalPosts,
            totalImages,
            systemStatus: 'Operational'
          },
          collections: {
            users: await db.collection('users').countDocuments({}),
            adminusers: await db.collection('adminusers').countDocuments({}),
            roles: await db.collection('roles').countDocuments({}),
            posts: await db.collection('posts').countDocuments({}),
            contacts: await db.collection('contacts').countDocuments({}),
            deletedprofiles: await db.collection('deletedprofiles').countDocuments({})
          }
        };
        break;

      case 'analytics-comprehensive':
        // Comprehensive analytics report
        const analyticsUsers = await db.collection('users').countDocuments({ isDeleted: { $ne: true } });
        const analyticsPosts = await db.collection('posts').countDocuments({ isDeleted: { $ne: true } });
        const analyticsImages = await db.collection('posts').countDocuments({ 
          image: { $exists: true, $ne: null },
          isDeleted: { $ne: true }
        });
        
        // Get user growth data
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await db.collection('users').countDocuments({ 
          createdAt: { $gte: oneWeekAgo },
          isDeleted: { $ne: true }
        });
        
        // Get post growth data
        const newPostsThisWeek = await db.collection('posts').countDocuments({ 
          createdAt: { $gte: oneWeekAgo },
          isDeleted: { $ne: true }
        });
        
        reportData = {
          reportType: 'Comprehensive Analytics Report',
          generatedAt: now.toISOString(),
          overview: {
            totalUsers: analyticsUsers,
            totalPosts: analyticsPosts,
            totalImages: analyticsImages,
            newUsersThisWeek,
            newPostsThisWeek,
            userGrowthRate: Math.round((newUsersThisWeek / Math.max(analyticsUsers - newUsersThisWeek, 1)) * 100),
            postGrowthRate: Math.round((newPostsThisWeek / Math.max(analyticsPosts - newPostsThisWeek, 1)) * 100)
          },
          collections: {
            users: await db.collection('users').countDocuments({}),
            adminusers: await db.collection('adminusers').countDocuments({}),
            roles: await db.collection('roles').countDocuments({}),
            posts: await db.collection('posts').countDocuments({}),
            contacts: await db.collection('contacts').countDocuments({}),
            deletedprofiles: await db.collection('deletedprofiles').countDocuments({})
          }
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Handle different export formats
    switch (format.toLowerCase()) {
      case 'csv':
        const csvData = convertToCSV(reportData);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${reportType}-${now.toISOString().split('T')[0]}.csv"`
          }
        });

      case 'excel':
      case 'xlsx':
        const excelData = await convertToExcel(reportData);
        return new NextResponse(excelData, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${reportType}-${now.toISOString().split('T')[0]}.xlsx"`
          }
        });

      case 'pdf':
        try {
          const pdfData = await convertToPDF(reportData);
          return new NextResponse(pdfData, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${reportType}-${now.toISOString().split('T')[0]}.pdf"`
            }
          });
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
          return NextResponse.json(
            { error: 'Failed to generate PDF. Please try again or use a different format.' }, 
            { status: 500 }
          );
        }

      case 'enhanced-json':
        // Enhanced JSON with better formatting and metadata
        const enhancedData = {
          metadata: {
            reportType: reportData.reportType,
            generatedAt: reportData.generatedAt,
            format: 'Enhanced JSON',
            instructions: 'This file can be opened in any text editor or browser. For better viewing, use a JSON viewer extension.',
            totalRecords: getTotalRecords(reportData)
          },
          data: reportData
        };
        
        return new NextResponse(JSON.stringify(enhancedData, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${reportType}-${now.toISOString().split('T')[0]}-enhanced.json"`
          }
        });

      default:
        // Return JSON by default
        return NextResponse.json({ 
          success: true, 
          data: reportData 
        });
    }

  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' }, 
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  // Enhanced CSV conversion with better formatting
  if (data.reportType === 'User Summary Report') {
    return `Report Type,Generated At,Total Users,Regular Users,Admin Users,Active Users,Inactive Users\n"${data.reportType}","${data.generatedAt}",${data.summary.totalUsers},${data.summary.regularUsers},${data.summary.adminUsers},${data.summary.activeUsers},${data.summary.inactiveUsers}`;
  } else if (data.reportType === 'Role Summary Report') {
    let csv = 'Report Type,Generated At,Role Name,Display Name,Total Users,Regular Users,Admin Users,Is System,Is Active\n';
    data.roles.forEach((role: any) => {
      csv += `"${data.reportType}","${data.generatedAt}","${role.roleName}","${role.displayName}",${role.totalUsers},${role.regularUsers},${role.adminUsers},${role.isSystem},${role.isActive}\n`;
    });
    return csv;
  } else if (data.reportType === 'System Status Report') {
    return `Report Type,Generated At,Database,Total Users,Total Admin Users,Total Roles,Total Deleted Profiles,Last Backup,System Load,Uptime\n"${data.reportType}","${data.generatedAt}",${data.systemStats.database},${data.systemStats.collections.users},${data.systemStats.collections.adminusers},${data.systemStats.collections.roles},${data.systemStats.collections.deletedprofiles},"${data.systemStats.lastBackup}",${data.systemStats.systemLoad}%,"${data.systemStats.uptime}"`;
  } else if (data.reportType === 'Comprehensive Dashboard Report') {
    return `Report Type,Generated At,Total Users,Total Posts,Total Images,System Status,Users Collection,Admin Users Collection,Roles Collection,Posts Collection,Contacts Collection,Deleted Profiles Collection\n"${data.reportType}","${data.generatedAt}",${data.overview.totalUsers},${data.overview.totalPosts},${data.overview.totalImages},"${data.overview.systemStatus}",${data.collections.users},${data.collections.adminusers},${data.collections.roles},${data.collections.posts},${data.collections.contacts},${data.collections.deletedprofiles}`;
  } else if (data.reportType === 'Comprehensive Analytics Report') {
    return `Report Type,Generated At,Total Users,Total Posts,Total Images,New Users This Week,New Posts This Week,User Growth Rate,Post Growth Rate,Users Collection,Admin Users Collection,Roles Collection,Posts Collection,Contacts Collection,Deleted Profiles Collection\n"${data.reportType}","${data.generatedAt}",${data.overview.totalUsers},${data.overview.totalPosts},${data.overview.totalImages},${data.overview.newUsersThisWeek},${data.overview.newPostsThisWeek},${data.overview.userGrowthRate}%,${data.overview.postGrowthRate}%,${data.collections.users},${data.collections.adminusers},${data.collections.roles},${data.collections.posts},${data.collections.contacts},${data.collections.deletedprofiles}`;
  }
  
  // Fallback to JSON string
  return JSON.stringify(data, null, 2);
}

async function convertToExcel(data: any): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  
  if (data.reportType === 'User Summary Report') {
    const worksheet = XLSX.utils.json_to_sheet([{
      'Report Type': data.reportType,
      'Generated At': data.generatedAt,
      'Total Users': data.summary.totalUsers,
      'Regular Users': data.summary.regularUsers,
      'Admin Users': data.summary.adminUsers,
      'Active Users': data.summary.activeUsers,
      'Inactive Users': data.summary.inactiveUsers
    }]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Summary');
  } else if (data.reportType === 'Role Summary Report') {
    const worksheet = XLSX.utils.json_to_sheet(data.roles.map((role: any) => ({
      'Role Name': role.roleName,
      'Display Name': role.displayName,
      'Total Users': role.totalUsers,
      'Regular Users': role.regularUsers,
      'Admin Users': role.adminUsers,
      'Is System': role.isSystem ? 'Yes' : 'No',
      'Is Active': role.isActive ? 'Yes' : 'No'
    })));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Role Summary');
  } else if (data.reportType === 'System Status Report') {
    const worksheet = XLSX.utils.json_to_sheet([{
      'Report Type': data.reportType,
      'Generated At': data.generatedAt,
      'Database': data.systemStats.database,
      'Total Users': data.systemStats.collections.users,
      'Total Admin Users': data.systemStats.collections.adminusers,
      'Total Roles': data.systemStats.collections.roles,
      'Total Deleted Profiles': data.systemStats.collections.deletedprofiles,
      'Last Backup': data.systemStats.lastBackup,
      'System Load': `${data.systemStats.systemLoad}%`,
      'Uptime': data.systemStats.uptime
    }]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'System Status');
  } else if (data.reportType === 'Comprehensive Dashboard Report') {
    const worksheet = XLSX.utils.json_to_sheet([{
      'Report Type': data.reportType,
      'Generated At': data.generatedAt,
      'Total Users': data.overview.totalUsers,
      'Total Posts': data.overview.totalPosts,
      'Total Images': data.overview.totalImages,
      'System Status': data.overview.systemStatus,
      'Users Collection': data.collections.users,
      'Admin Users Collection': data.collections.adminusers,
      'Roles Collection': data.collections.roles,
      'Posts Collection': data.collections.posts,
      'Contacts Collection': data.collections.contacts,
      'Deleted Profiles Collection': data.collections.deletedprofiles
    }]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard Overview');
  } else if (data.reportType === 'Comprehensive Analytics Report') {
    const worksheet = XLSX.utils.json_to_sheet([{
      'Report Type': data.reportType,
      'Generated At': data.generatedAt,
      'Total Users': data.overview.totalUsers,
      'Total Posts': data.overview.totalPosts,
      'Total Images': data.overview.totalImages,
      'New Users This Week': data.overview.newUsersThisWeek,
      'New Posts This Week': data.overview.newPostsThisWeek,
      'User Growth Rate': `${data.overview.userGrowthRate}%`,
      'Post Growth Rate': `${data.overview.postGrowthRate}%`,
      'Users Collection': data.collections.users,
      'Admin Users Collection': data.collections.adminusers,
      'Roles Collection': data.collections.roles,
      'Posts Collection': data.collections.posts,
      'Contacts Collection': data.collections.contacts,
      'Deleted Profiles Collection': data.collections.deletedprofiles
    }]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics Overview');
  }
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

async function convertToPDF(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Validate required data
      if (!data || !data.reportType) {
        throw new Error('Invalid report data provided');
      }

      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add header
      doc.fontSize(20).text('CAPSERA ADMIN REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(data.reportType || 'Unknown Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date(data.generatedAt || Date.now()).toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);
      
      // Add content based on report type
      if (data.reportType === 'User Summary Report') {
        doc.fontSize(16).text('USER SUMMARY', { underline: true });
        doc.moveDown();
        const summary = data.summary || {};
        doc.fontSize(12).text(`Total Users: ${summary.totalUsers || 0}`);
        doc.text(`Regular Users: ${summary.regularUsers || 0}`);
        doc.text(`Admin Users: ${summary.adminUsers || 0}`);
        doc.text(`Active Users: ${summary.activeUsers || 0}`);
        doc.text(`Inactive Users: ${summary.inactiveUsers || 0}`);
      } else if (data.reportType === 'Role Summary Report') {
        doc.fontSize(16).text('ROLE SUMMARY', { underline: true });
        doc.moveDown();
        const roles = data.roles || [];
        if (roles.length === 0) {
          doc.fontSize(12).text('No roles found');
        } else {
          roles.forEach((role: any, index: number) => {
            doc.fontSize(12).text(`Role ${index + 1}: ${role.roleName || 'Unknown'}`);
            doc.fontSize(10).text(`Display Name: ${role.displayName || 'N/A'}`);
            doc.text(`Total Users: ${role.totalUsers || 0}`);
            doc.text(`Regular Users: ${role.regularUsers || 0}`);
            doc.text(`Admin Users: ${role.adminUsers || 0}`);
            doc.text(`System Role: ${role.isSystem ? 'Yes' : 'No'}`);
            doc.text(`Active: ${role.isActive ? 'Yes' : 'No'}`);
            if (index < roles.length - 1) doc.moveDown();
          });
        }
      } else if (data.reportType === 'System Status Report') {
        doc.fontSize(16).text('SYSTEM STATUS', { underline: true });
        doc.moveDown();
        const systemStats = data.systemStats || {};
        const collections = systemStats.collections || {};
        doc.fontSize(12).text(`Database: ${systemStats.database || 'Unknown'}`);
        doc.text(`Total Users: ${collections.users || 0}`);
        doc.text(`Total Admin Users: ${collections.adminusers || 0}`);
        doc.text(`Total Roles: ${collections.roles || 0}`);
        doc.text(`Total Deleted Profiles: ${collections.deletedprofiles || 0}`);
        doc.text(`Last Backup: ${systemStats.lastBackup || 'Never'}`);
        doc.text(`System Load: ${systemStats.systemLoad || 0}%`);
        doc.text(`Uptime: ${systemStats.uptime || 'Unknown'}`);
      } else if (data.reportType === 'Comprehensive Dashboard Report') {
        doc.fontSize(16).text('DASHBOARD OVERVIEW', { underline: true });
        doc.moveDown();
        const overview = data.overview || {};
        const collections = data.collections || {};
        doc.fontSize(12).text(`Total Users: ${overview.totalUsers || 0}`);
        doc.text(`Total Posts: ${overview.totalPosts || 0}`);
        doc.text(`Total Images: ${overview.totalImages || 0}`);
        doc.text(`System Status: ${overview.systemStatus || 'Unknown'}`);
        doc.moveDown();
        doc.fontSize(14).text('COLLECTION STATISTICS', { underline: true });
        doc.fontSize(12).text(`Users Collection: ${collections.users || 0}`);
        doc.text(`Admin Users Collection: ${collections.adminusers || 0}`);
        doc.text(`Roles Collection: ${collections.roles || 0}`);
        doc.text(`Posts Collection: ${collections.posts || 0}`);
        doc.text(`Contacts Collection: ${collections.contacts || 0}`);
        doc.text(`Deleted Profiles Collection: ${collections.deletedprofiles || 0}`);
      } else if (data.reportType === 'Comprehensive Analytics Report') {
        doc.fontSize(16).text('ANALYTICS OVERVIEW', { underline: true });
        doc.moveDown();
        const overview = data.overview || {};
        const collections = data.collections || {};
        doc.fontSize(12).text(`Total Users: ${overview.totalUsers || 0}`);
        doc.text(`Total Posts: ${overview.totalPosts || 0}`);
        doc.text(`Total Images: ${overview.totalImages || 0}`);
        doc.text(`New Users This Week: ${overview.newUsersThisWeek || 0}`);
        doc.text(`New Posts This Week: ${overview.newPostsThisWeek || 0}`);
        doc.text(`User Growth Rate: ${overview.userGrowthRate || 0}%`);
        doc.text(`Post Growth Rate: ${overview.postGrowthRate || 0}%`);
        doc.moveDown();
        doc.fontSize(14).text('COLLECTION STATISTICS', { underline: true });
        doc.fontSize(12).text(`Users Collection: ${collections.users || 0}`);
        doc.text(`Admin Users Collection: ${collections.adminusers || 0}`);
        doc.text(`Roles Collection: ${collections.roles || 0}`);
        doc.text(`Posts Collection: ${collections.posts || 0}`);
        doc.text(`Contacts Collection: ${collections.contacts || 0}`);
        doc.text(`Deleted Profiles Collection: ${collections.deletedprofiles || 0}`);
      } else {
        // Generic report for unknown types
        doc.fontSize(16).text('REPORT DATA', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text('Report Type: ' + (data.reportType || 'Unknown'));
        doc.text('Generated: ' + new Date(data.generatedAt || Date.now()).toLocaleString());
        doc.moveDown();
        doc.fontSize(10).text('Raw Data:');
        doc.text(JSON.stringify(data, null, 2));
      }
      
      // Add footer
      doc.moveDown(3);
      doc.fontSize(8).text('Capsera Admin System - Generated Report', { align: 'center' });
      
      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

function formatForPDF(data: any): string {
  let content = `REPORT: ${data.reportType}\n`;
  content += `Generated: ${data.generatedAt}\n`;
  content += `\n${'='.repeat(50)}\n\n`;
  
  if (data.reportType === 'User Summary Report') {
    content += `USER SUMMARY\n\n`;
    content += `Total Users: ${data.summary.totalUsers}\n`;
    content += `Regular Users: ${data.summary.regularUsers}\n`;
    content += `Admin Users: ${data.summary.adminUsers}\n`;
    content += `Active Users: ${data.summary.activeUsers}\n`;
    content += `Inactive Users: ${data.summary.inactiveUsers}\n`;
  } else if (data.reportType === 'Role Summary Report') {
    content += `ROLE SUMMARY\n\n`;
    data.roles.forEach((role: any) => {
      content += `Role: ${role.roleName}\n`;
      content += `Display Name: ${role.displayName}\n`;
      content += `Total Users: ${role.totalUsers}\n`;
      content += `Regular Users: ${role.regularUsers}\n`;
      content += `Admin Users: ${role.adminUsers}\n`;
      content += `System Role: ${role.isSystem ? 'Yes' : 'No'}\n`;
      content += `Active: ${role.isActive ? 'Yes' : 'No'}\n`;
      content += `\n${'-'.repeat(30)}\n\n`;
    });
  } else if (data.reportType === 'Comprehensive Dashboard Report') {
    content += `DASHBOARD OVERVIEW\n\n`;
    content += `Total Users: ${data.overview.totalUsers}\n`;
    content += `Total Posts: ${data.overview.totalPosts}\n`;
    content += `Total Images: ${data.overview.totalImages}\n`;
    content += `System Status: ${data.overview.systemStatus}\n\n`;
    content += `COLLECTION STATISTICS\n`;
    content += `Users Collection: ${data.collections.users}\n`;
    content += `Admin Users Collection: ${data.collections.adminusers}\n`;
    content += `Roles Collection: ${data.collections.roles}\n`;
    content += `Posts Collection: ${data.collections.posts}\n`;
    content += `Contacts Collection: ${data.collections.contacts}\n`;
    content += `Deleted Profiles Collection: ${data.collections.deletedprofiles}\n`;
  } else if (data.reportType === 'Comprehensive Analytics Report') {
    content += `ANALYTICS OVERVIEW\n\n`;
    content += `Total Users: ${data.overview.totalUsers}\n`;
    content += `Total Posts: ${data.overview.totalPosts}\n`;
    content += `Total Images: ${data.overview.totalImages}\n`;
    content += `New Users This Week: ${data.overview.newUsersThisWeek}\n`;
    content += `New Posts This Week: ${data.overview.newPostsThisWeek}\n`;
    content += `User Growth Rate: ${data.overview.userGrowthRate}%\n`;
    content += `Post Growth Rate: ${data.overview.postGrowthRate}%\n\n`;
    content += `COLLECTION STATISTICS\n`;
    content += `Users Collection: ${data.collections.users}\n`;
    content += `Admin Users Collection: ${data.collections.adminusers}\n`;
    content += `Roles Collection: ${data.collections.roles}\n`;
    content += `Posts Collection: ${data.collections.posts}\n`;
    content += `Contacts Collection: ${data.collections.contacts}\n`;
    content += `Deleted Profiles Collection: ${data.collections.deletedprofiles}\n`;
  }
  
  return content;
}

function getTotalRecords(data: any): number {
  if (data.roles) return data.roles.length;
  if (data.summary) return 1;
  if (data.systemStats) return 1;
  if (data.overview) return 1;
  return 0;
}
