import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication using middleware
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Get session for additional checks
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    
    // Check if user can access admin dashboard
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User session not found' }, { status: 401 });
    }
    
    const canAccess = await canManageAdmins(userId);
    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    
    // Fetch users from both User and AdminUser collections using direct MongoDB
    const regularUsers = await db.collection('users').find({}).project({
      email: 1, 
      username: 1, 
      role: 1, 
      createdAt: 1, 
      lastLogin: 1, 
      isActive: 1
    }).toArray();
    
    const adminUsers = await db.collection('adminusers').find({}).project({
      email: 1, 
      username: 1, 
      role: 1, 
      createdAt: 1, 
      lastLoginAt: 1, 
      status: 1
    }).toArray();

    // Transform regular users - handle schema differences
    const transformedRegularUsers = regularUsers.map((user: any) => ({
      _id: user._id?.toString?.() ?? '',
      email: user.email,
      username: user.username || user.name || '',
      role: user.role || { name: 'user', displayName: 'User' },
      createdAt: user.createdAt || user.created_at || null,
      lastLogin: user.lastLoginAt || user.lastLogin || user.last_login,
      isActive: user.status === 'active' || (user.isActive !== false && !user.status), // Handle both status and isActive
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
    console.log('🔄 POST /api/admin/users - Creating new user');
    
    // Check admin authentication using middleware
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Get session for additional checks
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    
    // Check if user can manage admins
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 401 });
    }
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, username, password, role, isAdmin = false } = body;

    console.log('📊 User creation data:', { email, username, role, isAdmin });

    // Validate required fields
    if (!email || !password) {
      console.error('❌ Missing required fields:', { email: !!email, password: !!password });
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

    // Handle role assignment
    let userRole = { name: 'user', displayName: 'User' }; // Default role
    
    if (role) {
      // Check if role exists in roles collection
      const roleDoc = await db.collection('roles').findOne({ name: role.toLowerCase() });
      if (roleDoc) {
        userRole = {
          name: roleDoc.name,
          displayName: roleDoc.displayName
        };
      } else {
        // Create simple role object for basic roles
        userRole = {
          name: role.toLowerCase(),
          displayName: role.charAt(0).toUpperCase() + role.slice(1)
        };
      }
    }

    // Create base user object - match User model schema
    const baseUser = {
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      role: userRole, // Will be handled properly based on collection
      status: 'active', // Use status instead of isActive
      emailVerified: null, // Use emailVerified instead of isVerified
      createdAt: new Date(),
      createdBy: session.user.id
    };

    // Insert into appropriate collection
    const collection = isAdmin ? 'adminusers' : 'users';
    let newUser;
    
    if (isAdmin) {
      // AdminUser collection schema
      newUser = {
        ...baseUser,
        status: 'active',
        isAdmin: true,
        isSuperAdmin: false,
        isVerified: true,
        loginAttempts: 0,
        lockUntil: null,
        updatedAt: new Date()
      };
    } else {
      // Regular users collection schema
      newUser = {
        ...baseUser,
        isAdmin: false,
        isSuperAdmin: false,
        isDeleted: false,
        lastLoginAt: null,
        lastSeen: new Date(),
        emailPreferences: {
          promotional: true,
          welcome: true,
          requestConfirmations: true
        },
        promotionalEmailSentAt: null,
        lastPromotionalEmailDate: null,
        promotionalEmailCount: 0,
        unsubscribeToken: null,
        welcomeEmailSent: false
      };
    }

    const result = await db.collection(collection).insertOne(newUser);
    console.log('✅ User created successfully:', { userId: result.insertedId, collection });

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
