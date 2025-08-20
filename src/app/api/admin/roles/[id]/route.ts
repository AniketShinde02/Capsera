import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { db } = await connectToDatabase();

    // Get role by ID using direct MongoDB
    const role = await db.collection('roles').findOne({ _id: new ObjectId(id) });
    
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Count users for this role using direct MongoDB
    const regularUserCount = await db.collection('users').countDocuments({ 
      'role.name': role.name,
      isDeleted: { $ne: true }
    });
    
    const adminUserCount = await db.collection('adminusers').countDocuments({ 
      'role.name': role.name,
      status: 'active'
    });
    
    const totalUserCount = regularUserCount + adminUserCount;

    const transformedRole = {
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

    return NextResponse.json({ 
      success: true, 
      role: transformedRole 
    });

  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { displayName, description, permissions, isActive } = body;

    const { db } = await connectToDatabase();

    // Check if role exists and is not a system role
    const existingRole = await db.collection('roles').findOne({ _id: new ObjectId(id) });
    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'Cannot modify system roles' }, { status: 403 });
    }

    // Validate permissions structure if provided
    if (permissions !== undefined) {
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
    }

    // Update role using direct MongoDB
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();
    updateData.updatedBy = session.user.id;

    const result = await db.collection('roles').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get the updated role
    const updatedRole = await db.collection('roles').findOne({ _id: new ObjectId(id) });

    if (!updatedRole) {
      return NextResponse.json({ error: 'Role not found after update' }, { status: 404 });
    }

    console.log('✅ Role updated successfully:', updatedRole);

    return NextResponse.json({ 
      success: true, 
      message: 'Role updated successfully',
      role: {
        _id: updatedRole._id.toString(),
        name: updatedRole.name,
        displayName: updatedRole.displayName,
        description: updatedRole.description,
        permissions: updatedRole.permissions,
        isActive: updatedRole.isActive,
        isSystem: updatedRole.isSystem,
        updatedAt: updatedRole.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { db } = await connectToDatabase();

    // Check if role exists and is not a system role
    const existingRole = await db.collection('roles').findOne({ _id: new ObjectId(id) });
    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 403 });
    }

    // Check if any users are using this role
    const regularUserCount = await db.collection('users').countDocuments({ 
      'role.name': existingRole.name,
      isDeleted: { $ne: true }
    });
    
    const adminUserCount = await db.collection('adminusers').countDocuments({ 
      'role.name': existingRole.name,
      status: 'active' });
    
    if (regularUserCount > 0 || adminUserCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role that is assigned to users' 
      }, { status: 409 });
    }

    // Delete role using direct MongoDB
    const result = await db.collection('roles').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    console.log('✅ Role deleted successfully:', existingRole);

    return NextResponse.json({ 
      success: true, 
      message: 'Role deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' }, 
      { status: 500 }
    );
  }
}
