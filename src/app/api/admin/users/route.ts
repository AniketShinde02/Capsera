import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can access admin dashboard
    const canAccess = await canManageAdmins(session.user.id);
    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Fetch users from both User and AdminUser collections
    const regularUsers = await User.find({}).select('email username role createdAt lastLogin isActive').lean();
    const adminUsers = await AdminUser.find({}).select('email username role createdAt lastLoginAt isActive status').lean();

    // Transform regular users
    const transformedRegularUsers = regularUsers.map((user: any) => ({
      _id: user._id?.toString?.() ?? '',
      email: user.email,
      username: user.username || user.name || '',
      role: user.role || { name: 'user', displayName: 'User' },
      createdAt: user.createdAt || user.created_at || null,
      lastLogin: user.lastLogin || user.last_login,
      isActive: user.isActive !== false,
      type: 'user'
    }));

    // Transform admin users
    const transformedAdminUsers = adminUsers.map((user: any) => ({
      _id: user._id?.toString?.() ?? '',
      email: user.email,
      username: user.username || user.name || '',
      role: user.role || { name: 'admin', displayName: 'Administrator' },
      createdAt: user.createdAt || user.created_at || null,
      lastLogin: user.lastLoginAt,
      isActive: user.status === 'active',
      type: 'admin'
    }));

    // Combine and sort by creation date
    const allUsers = [...transformedRegularUsers, ...transformedAdminUsers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      users: allUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
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
    const { email, username, password, role, isAdmin = false } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    const existingAdmin = await db.collection('adminusers').findOne({ email });
    
    if (existingUser || existingAdmin) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create base user object
    const baseUser = {
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      role: role || { name: 'user', displayName: 'User' },
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      createdBy: session.user.id
    };

    // Insert into appropriate collection
    const collection = isAdmin ? 'adminusers' : 'users';
    let newUser;
    
    if (isAdmin) {
      newUser = {
        ...baseUser,
        status: 'active',
        isAdmin: true
      };
    } else {
      newUser = baseUser;
    }

    const result = await db.collection(collection).insertOne(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ 
      success: true, 
      user: { ...userWithoutPassword, _id: result.insertedId.toString() }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' }, 
      { status: 500 }
    );
  }
}
