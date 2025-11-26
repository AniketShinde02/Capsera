import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';
import { ObjectId } from 'mongodb';

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

    // Check if user can manage admins
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const { id: userId } = await params;

    // Check if user exists in either collection
    let user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    let isAdminUser = false;

    if (!user) {
      user = await db.collection('adminusers').findOne({ _id: new ObjectId(userId) });
      isAdminUser = true;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if trying to delete super admin
    if (user.isSuperAdmin) {
      return NextResponse.json({ error: 'Cannot delete super admin user' }, { status: 400 });
    }

    // Check if trying to delete the current user
    if (user._id.toString() === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Soft delete - move to deletedprofiles collection
    const deletedProfile = {
      ...user,
      deletedAt: new Date(),
      deletedBy: session.user.email,
      originalId: user._id,
      userType: isAdminUser ? 'admin' : 'user'
    };

    // Insert into deletedprofiles collection
    await db.collection('deletedprofiles').insertOne(deletedProfile);

    // Remove from appropriate collection
    const collection = isAdminUser ? 'adminusers' : 'users';
    const result = await db.collection(collection).deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 1) {
      // Log admin action
      const { logAdminAction } = await import('@/lib/audit-logger');
      await logAdminAction(
        request,
        'DELETE_USER',
        userId,
        isAdminUser ? 'AdminUser' : 'User',
        {
          deletedBy: session.user.email,
          userEmail: user.email,
          userRole: user.role
        }
      );

      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    console.log('🔄 PATCH /api/admin/users/[id] - Updating user:', userId);

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

    const { db } = await connectToDatabase();
    const updates = await request.json();

    console.log('📊 Update data received:', updates);

    // Check if user exists in either collection
    let user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    let isAdminUser = false;

    if (!user) {
      user = await db.collection('adminusers').findOne({ _id: new ObjectId(userId) });
      isAdminUser = true;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if trying to modify super admin
    if (user.isSuperAdmin && session.user.id !== userId) {
      return NextResponse.json({ error: 'Cannot modify super admin user' }, { status: 400 });
    }

    // Validate updates - only allow certain fields to be updated
    const allowedUpdates: any = {};

    if (updates.isActive !== undefined) {
      // Both collections use status field, but with different enum values
      if (isAdminUser) {
        allowedUpdates.status = updates.isActive ? 'active' : 'suspended';
      } else {
        allowedUpdates.status = updates.isActive ? 'active' : 'suspended';
      }
    }

    if (updates.role) {
      // Handle role updates - can be string or object
      let roleName = updates.role;
      if (typeof updates.role === 'object' && updates.role.name) {
        roleName = updates.role.name;
      }

      // Check if role exists in roles collection
      const role = await db.collection('roles').findOne({ name: roleName.toLowerCase() });
      if (role) {
        // Use role from roles collection
        allowedUpdates.role = {
          name: role.name,
          displayName: role.displayName
        };
      } else {
        // Create simple role object for basic roles
        allowedUpdates.role = {
          name: roleName.toLowerCase(),
          displayName: roleName.charAt(0).toUpperCase() + roleName.slice(1)
        };
      }
    }

    if (updates.username !== undefined) {
      allowedUpdates.username = updates.username;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Update user in appropriate collection
    const collection = isAdminUser ? 'adminusers' : 'users';
    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(userId) },
      { $set: allowedUpdates }
    );

    if (result.modifiedCount === 1) {
      console.log('✅ User updated successfully:', { userId, allowedUpdates });

      // Log admin action
      const { logAdminAction } = await import('@/lib/audit-logger');
      await logAdminAction(
        request,
        'UPDATE_USER',
        userId,
        isAdminUser ? 'AdminUser' : 'User',
        {
          updates: allowedUpdates,
          updatedBy: session.user.email
        }
      );

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        updates: allowedUpdates
      });
    } else {
      console.error('❌ Failed to update user - no documents modified:', { userId, allowedUpdates });
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
