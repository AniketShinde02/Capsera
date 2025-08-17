import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { identifier } = await request.json();

    // Validate input
    if (!identifier) {
      return NextResponse.json({ error: 'Identifier (email or username) is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find user by email or username
    const user = await db.collection('users').findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if trying to delete admin or super admin
    if (user.role === 'admin' || user.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 400 });
    }

    // Check if trying to delete the current user
    if (user._id.toString() === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Archive user data before deletion (optional)
    const archivedUser = {
      ...user,
      deletedAt: new Date(),
      deletedBy: session.user.email,
      deletionReason: 'Quick delete by admin',
      originalId: user._id
    };

    await db.collection('deletedprofiles').insertOne(archivedUser);

    // Delete user account immediately
    const result = await db.collection('users').deleteOne({ _id: user._id });

    if (result.deletedCount === 1) {
      return NextResponse.json({
        success: true,
        message: 'Tier account deleted successfully',
        deletedUser: {
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    } else {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting quick tier account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
