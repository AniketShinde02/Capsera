import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageAdmins } from '@/lib/init-admin';
import { connectToDatabase } from '@/lib/db';
import AutoUserManager from '@/lib/auto-user-manager';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage roles
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    // Get all roles from the roles collection using direct MongoDB
    const roles = await db.collection('roles').find({}).toArray();
    
    console.log('Raw roles from database:', JSON.stringify(roles, null, 2));

    // Transform the data and count users for each role
    const transformedRoles = await Promise.all(roles.map(async (role) => {
      // Count users from both collections for this role
      const regularUserCount = await db.collection('users').countDocuments({ 
        'role.name': role.name,
        isDeleted: { $ne: true }
      });
      
      const adminUserCount = await db.collection('adminusers').countDocuments({ 
        'role.name': role.name,
        status: 'active'
      });
      
      const totalUserCount = regularUserCount + adminUserCount;

      return {
        _id: (role._id as any).toString(),
        name: role.name,
        displayName: role.displayName || role.name,
        description: role.description || `Role: ${role.name}`,
        permissions: role.permissions || [],
        userCount: totalUserCount,
        isSystem: role.isSystem || false,
        isActive: role.isActive !== false,
        createdAt: role.createdAt || role.created_at || new Date().toISOString()
      };
    }));
    
    console.log('Transformed roles with user counts:', JSON.stringify(transformedRoles, null, 2));

    return NextResponse.json({ 
      success: true, 
      roles: transformedRoles 
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' }, 
      { status: 500 }
    );
  }
}

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
    const { 
      name, 
      displayName, 
      description, 
      permissions, 
      isSystem = false,
      isActive = true,
      // New fields for auto user creation
      autoCreateUsers = false,
      usersToCreate = [],
      sendEmailNotifications = true
    } = body;

    // Validate required fields
    if (!name || !displayName || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, displayName, permissions' 
      }, { status: 400 });
    }

    // Validate permissions structure
    for (const permission of permissions) {
      if (!permission.resource || !Array.isArray(permission.actions) || permission.actions.length === 0) {
        return NextResponse.json({ 
          error: 'Each permission must have a resource and at least one action' 
        }, { status: 400 });
      }
    }

    const { db } = await connectToDatabase();

    // Check if role already exists
    const existingRole = await db.collection('roles').findOne({ name: name.toLowerCase() });
    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 409 });
    }

    // Create role
    const roleData = {
      name: name.toLowerCase(),
      displayName,
      description,
      permissions,
      isSystem,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id,
      assignedUsers: 0
    };

    const result = await db.collection('roles').insertOne(roleData);
    
    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }

    const createdRole = {
      ...roleData,
      _id: result.insertedId
    };

    // Auto create users if requested
    let userCreationResults: any = null;
    if (autoCreateUsers && usersToCreate && usersToCreate.length > 0) {
      try {
        const autoUserManager = new AutoUserManager();
        
        // Prepare user data with the new role
        const usersWithRole = usersToCreate.map((user: any) => ({
          ...user,
          roleName: name.toLowerCase()
        }));

        userCreationResults = await autoUserManager.createBulkUsersWithRole({
          users: usersWithRole,
          roleName: name.toLowerCase(),
          adminEmail: session.user.email || 'admin@capsera.com'
        });

        // Update role with assigned users count
        await db.collection('roles').updateOne(
          { _id: result.insertedId },
          { $set: { assignedUsers: userCreationResults.success } }
        );

        // Send email notifications if enabled
        if (sendEmailNotifications && userCreationResults.success > 0) {
          // Send role creation notification to admin
          await autoUserManager.testEmailService().then(async (emailWorking) => {
            if (emailWorking) {
              await autoUserManager['emailService'].sendRoleCreationNotification(
                session.user.email || 'admin@capsera.com',
                {
                  name: createdRole.name,
                  displayName: createdRole.displayName,
                  description: createdRole.description,
                  permissions: permissions.map((p: any) => `${p.resource}: ${p.actions.join(', ')}`),
                  assignedUsers: userCreationResults.success
                }
              );
            }
          });
        }
      } catch (error) {
        console.error('❌ Error in auto user creation:', error);
        // Don't fail the role creation if user creation fails
        userCreationResults = {
          total: usersToCreate.length,
          success: 0,
          failed: usersToCreate.length,
          results: usersToCreate.map((user: any) => ({
            success: false,
            email: user.email,
            error: 'Auto user creation failed'
          }))
        };
      }
    }

    // Always send role creation notification to admin (even without auto user creation)
    if (sendEmailNotifications) {
      try {
        const autoUserManager = new AutoUserManager();
        const emailWorking = await autoUserManager.testEmailService();
        
        if (emailWorking) {
          await autoUserManager['emailService'].sendRoleCreationNotification(
            session.user.email || 'admin@capsera.com',
            {
              name: createdRole.name,
              displayName: createdRole.displayName,
              description: createdRole.description,
              permissions: permissions.map((p: any) => `${p.resource}: ${p.actions.join(', ')}`),
              assignedUsers: autoCreateUsers ? (userCreationResults?.success || 0) : 0
            }
          );
          console.log('✅ Role creation notification email sent to admin');
        } else {
          console.log('⚠️ Email service not working, skipping notification');
        }
      } catch (error) {
        console.error('❌ Failed to send role creation notification:', error);
        // Don't fail the role creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      role: createdRole,
      autoUserCreation: userCreationResults ? {
        enabled: autoCreateUsers,
        results: userCreationResults
      } : null
    });

  } catch (error) {
    console.error('❌ Error creating role:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
