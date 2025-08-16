import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import AdminUser from '@/models/AdminUser';

// Track used tokens in database for persistence across server restarts
async function isTokenUsed(token: string) {
  try {
    const { db } = await connectToDatabase();
    const usedTokensCollection = db.collection('used_tokens');
    
    const usedToken = await usedTokensCollection.findOne({ token });
    return !!usedToken;
  } catch (error) {
    console.error('Error checking token usage:', error);
    return false;
  }
}

async function markTokenAsUsed(token: string) {
  try {
    const { db } = await connectToDatabase();
    const usedTokensCollection = db.collection('used_tokens');
    
    await usedTokensCollection.insertOne({
      token,
      usedAt: new Date(),
      usedFor: 'admin-setup'
    });
    
    console.log('✅ Token marked as used:', token);
  } catch (error) {
    console.error('Error marking token as used:', error);
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if admin system is initialized
    const { db } = await connectToDatabase();
    const rolesCollection = db.collection('roles');
    
    // Check admin_users collection specifically for admin users
    const adminExists = await AdminUser.countDocuments({ isAdmin: true }) > 0;
    const rolesExist = await rolesCollection.countDocuments() > 0;
    
    // Get admin email if exists
    let adminEmail = null;
    if (adminExists) {
      const adminUser = await AdminUser.findOne({ isAdmin: true }).select('email');
      adminEmail = adminUser?.email;
    }
    
    return NextResponse.json({
      initialized: rolesExist,
      existingAdmin: adminExists,
      adminEmail: adminEmail,
      message: adminExists 
        ? 'Admin system is ready and initialized' 
        : 'Admin system needs to be initialized'
    });
  } catch (error) {
    console.error('Setup status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, token, email, password, username } = await request.json();
    
    // JWT verification for production setup
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production';
    
    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required' },
        { status: 400 }
      );
    }

    // Only verify JWT for actions that need it
    let decoded: any = null;
    if (action === 'verify-token' || action === 'create-admin') {
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Token is required for this action' },
          { status: 400 }
        );
      }

      try {
        // Verify JWT token
        console.log('🔐 Attempting JWT verification with token length:', token.length);
        decoded = verify(token, JWT_SECRET) as any;
        
        console.log('✅ JWT decoded successfully:', {
          type: decoded.type,
          purpose: decoded.purpose,
          exp: decoded.exp,
          jti: decoded.jti
        });
        
        // Check token type and purpose
        if (decoded.type !== 'admin-setup' || decoded.purpose !== 'initial-admin-creation') {
          console.log('❌ Invalid token type or purpose:', { type: decoded.type, purpose: decoded.purpose });
          return NextResponse.json(
            { success: false, message: 'Invalid token type or purpose' },
            { status: 401 }
          );
        }
        
        // Check if token has expired
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          console.log('❌ Token expired:', { 
            tokenExp: decoded.exp, 
            currentTime: Math.floor(Date.now() / 1000),
            expiresAt: new Date(decoded.exp * 1000)
          });
          return NextResponse.json(
            { success: false, message: 'Setup token has expired. Generate a new one.' },
            { status: 401 }
          );
        }
        
        console.log('✅ JWT token verified successfully:', { 
          type: decoded.type, 
          purpose: decoded.purpose, 
          expiresAt: new Date(decoded.exp * 1000) 
        });
        
        // Check if JWT token has already been used (by JTI)
        if (await isTokenUsed(decoded.jti)) {
          console.log('❌ Token already used:', decoded.jti);
          return NextResponse.json(
            { success: false, message: 'Setup token has already been used. Generate a new token.' },
            { status: 400 }
          );
        }
        
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        console.error('Token that failed:', token.substring(0, 50) + '...');
        return NextResponse.json(
          { success: false, message: 'Invalid or malformed setup token' },
          { status: 500 }
        );
      }
    }
    
    // Handle different actions
    switch (action) {
      case 'verify-token':
        // Check admin_users collection specifically
        const adminExists = await AdminUser.countDocuments({ isAdmin: true }) > 0;
        
        return NextResponse.json({ success: true, adminExists: adminExists, message: 'Token verified successfully' });
        
      case 'initialize':
        return await handleInitialize();
        
      case 'create-admin':
        // Mark JWT token as used for admin creation
        if (decoded) {
          await markTokenAsUsed(decoded.jti);
        }
        return await handleCreateAdmin(email, password, username);
        
      case 'reset':
        return await handleReset();
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Setup action failed:', error);
    return NextResponse.json(
      { success: false, message: 'Setup action failed' },
      { status: 500 }
    );
  }
}

async function handleInitialize() {
  try {
    await connectToDatabase();
    
    // Initialize basic admin system
    const { db } = await connectToDatabase();
    const rolesCollection = db.collection('roles');
    
    // Check if admin role exists, create if not
    let adminRole = await rolesCollection.findOne({ name: 'admin' });
    if (!adminRole) {
      const newRole = {
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administrator with full access',
        permissions: [
          { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'posts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'captions', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'data-recovery', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'archived-profiles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'system', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ],
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const roleResult = await rolesCollection.insertOne(newRole);
      adminRole = { ...newRole, _id: roleResult.insertedId };
      console.log('✅ Admin role created:', adminRole._id);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin system initialized successfully. Default roles and permissions created.'
    });
  } catch (error) {
    console.error('System initialization failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize admin system' },
      { status: 500 }
    );
  }
}

async function handleCreateAdmin(email: string, password: string, username?: string) {
  try {
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log('🔐 Creating admin user:', { email, username });
    
    await connectToDatabase();
    const { db } = await connectToDatabase();
    const rolesCollection = db.collection('roles');
    
    // Check if admin already exists in AdminUser collection
    const existingAdmin = await AdminUser.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('❌ Admin already exists in AdminUser collection:', existingAdmin.email);
      return NextResponse.json(
        { success: false, message: 'Admin user already exists' },
        { status: 400 }
      );
    }
    
    // Check if email already exists in AdminUser collection
    const existingAdminUser = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existingAdminUser) {
      console.log('❌ Admin with email already exists:', existingAdminUser.email);
      return NextResponse.json(
        { success: false, message: 'Admin with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create or get admin role
    let adminRole: any = await rolesCollection.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('📝 Creating admin role...');
      const newRole = {
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administrator with full access',
        permissions: [
          { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'posts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'captions', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'data-recovery', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'archived-profiles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'system', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ],
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const roleResult = await rolesCollection.insertOne(newRole);
      adminRole = { ...newRole, _id: roleResult.insertedId };
      console.log('✅ Admin role created:', adminRole._id);
    } else {
      console.log('✅ Admin role found:', adminRole._id);
    }
    
    // Create admin user using AdminUser model
    const adminUser = new AdminUser({
      email: email.toLowerCase(),
      username: username || email.split('@')[0],
      password: password, // Will be hashed by pre-save middleware
      role: {
        _id: adminRole._id,
        name: adminRole.name,
        displayName: adminRole.displayName
      },
      isAdmin: true,
      isVerified: true,
      status: 'active'
    });
    
    console.log('📝 Saving admin user to AdminUser collection:', { email: adminUser.email, role: adminUser.role });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully in AdminUser collection:', adminUser._id);
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminUser: {
        id: adminUser._id,
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role
      }
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleReset() {
  try {
    await connectToDatabase();
    
    // Delete all admin users from AdminUser collection
    const result = await AdminUser.deleteMany({ isAdmin: true });
    
    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: `Admin system reset successfully. ${result.deletedCount} admin user(s) removed from AdminUser collection. A new setup token will be required.`
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to reset admin system' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin system reset failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset admin system' },
      { status: 500 }
    );
  }
}
