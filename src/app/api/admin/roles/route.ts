import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';
import Role from '@/models/Role';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';

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

    await dbConnect();

    // Get all roles from the roles collection using Mongoose
    const roles = await Role.find({}).lean();
    
    console.log('Raw roles from database:', JSON.stringify(roles, null, 2));

    // Transform the data and count users for each role
    const transformedRoles = await Promise.all(roles.map(async (role) => {
      // Count users from both collections for this role
      const regularUserCount = await User.countDocuments({ 
        'role.name': role.name,
        isDeleted: { $ne: true }
      });
      
      const adminUserCount = await AdminUser.countDocuments({ 
        'role.name': role.name,
        status: 'active'
      });
      
      const totalUserCount = regularUserCount + adminUserCount;

      return {
        _id: role._id.toString(),
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

    // Check if user can manage roles
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, displayName, description, permissions, isActive = true } = body;

    // Validate required fields
    if (!name || !displayName) {
      return NextResponse.json({ error: 'Name and display name are required' }, { status: 400 });
    }

    // Validate permissions structure
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json({ error: 'At least one permission is required' }, { status: 400 });
    }

    // Validate each permission has correct structure
    for (const permission of permissions) {
      if (!permission.resource || !Array.isArray(permission.actions) || permission.actions.length === 0) {
        return NextResponse.json({ 
          error: 'Each permission must have a resource and at least one action' 
        }, { status: 400 });
      }
    }

    await dbConnect();

    // Check if role name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 409 });
    }

    // Create new role using Mongoose model
    const newRole = new Role({
      name,
      displayName,
      description: description || `Role: ${displayName}`,
      permissions: permissions || [],
      isActive,
      isSystem: false,
      createdBy: session.user.id
    });

    const savedRole = await newRole.save();
    console.log('✅ Role created successfully:', savedRole);

    return NextResponse.json({ 
      success: true, 
      role: {
        _id: savedRole._id.toString(),
        name: savedRole.name,
        displayName: savedRole.displayName,
        description: savedRole.description,
        permissions: savedRole.permissions,
        isActive: savedRole.isActive,
        isSystem: savedRole.isSystem,
        createdAt: savedRole.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' }, 
      { status: 500 }
    );
  }
}
