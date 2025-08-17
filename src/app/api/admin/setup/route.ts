import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import AdminUser from '@/models/AdminUser';
import { otpDbService } from '@/lib/otp-db-service';

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
    
    // Check admin_users collection specifically for admin users using direct database connection
    const adminUsersCollection = db.collection('adminusers');
    const adminExists = await adminUsersCollection.countDocuments({ isAdmin: true }) > 0;
    const rolesExist = await rolesCollection.countDocuments() > 0;
    
    // Get admin email if exists
    let adminEmail = null;
    if (adminExists) {
      const adminUser = await adminUsersCollection.findOne({ isAdmin: true }, { projection: { email: 1 } });
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
    const { action, token, email, password, username, pin } = await request.json();
    
    // JWT verification for production setup
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production';
    
    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required' },
        { status: 400 }
      );
    }

    // PIN verification for setup access
    let pinVerified = false;
    if (action === 'verify-pin') {
      if (!pin) {
        return NextResponse.json(
          { success: false, message: 'PIN is required for this action' },
          { status: 400 }
        );
      }

      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required for PIN verification' },
          { status: 400 }
        );
      }

      try {
        // Check if system lock is enabled
        const { db } = await connectToDatabase();
        const lockDoc = await db.collection('systemsettings').findOne({ 
          key: 'system_lock_pin' 
        });

        if (!lockDoc || !lockDoc.isActive) {
          return NextResponse.json(
            { success: false, message: 'System lock not configured. Please set up PIN protection first.' },
            { status: 400 }
          );
        }

        // Verify the PIN against the stored hashed PIN
        const isValid = await bcrypt.compare(pin, lockDoc.value);
        
        if (!isValid) {
          return NextResponse.json(
            { success: false, message: 'Invalid PIN' },
            { status: 400 }
          );
        }

        pinVerified = true;
        console.log('✅ PIN verified successfully for:', email);
        
        return NextResponse.json({
          success: true,
          message: 'PIN verified successfully'
        });
        
      } catch (pinError) {
        console.error('PIN verification failed:', pinError);
        return NextResponse.json(
          { success: false, message: 'PIN verification failed' },
          { status: 500 }
        );
      }
    }

    // Only verify OTP for actions that need it
    let otpVerified = false;
    if (action === 'verify-token') {
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'OTP is required for this action' },
          { status: 400 }
        );
      }

      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required for OTP verification' },
          { status: 400 }
        );
      }

      // Check if PIN was verified first (for security)
      if (token && token.length === 6 && /^\d{6}$/.test(token)) {
        // This might be a PIN token, check if it's valid
        try {
          const { db } = await connectToDatabase();
          const tempPinDoc = await db.collection('temp_pins').findOne({ 
            email: email.toLowerCase(),
            pin: token,
            expiresAt: { $gt: new Date() } // Not expired
          });

          if (tempPinDoc) {
            // This is a valid PIN, mark it as used and proceed
            await db.collection('temp_pins').deleteOne({ _id: tempPinDoc._id });
            pinVerified = true;
            console.log('✅ PIN verified via token for:', email);
          }
        } catch (error) {
          console.error('PIN check failed:', error);
        }
      }

      try {
        // Verify OTP - Check both unverified and verified OTPs
        console.log('🔐 Attempting OTP verification for email:', email);
        
        // First try to verify as unverified OTP
        let otpResult = await otpDbService.verifyOTP(email, token);
        
        // If that fails, check if OTP is already verified
        if (!otpResult.success) {
          console.log('🔍 OTP not found as unverified, checking if already verified...');
          otpResult = await otpDbService.checkVerifiedOTP(email, token);
        }
        
        if (!otpResult.success && !pinVerified) {
          console.log('❌ OTP verification failed:', otpResult.message);
          return NextResponse.json(
            { success: false, message: otpResult.message },
            { status: 400 }
          );
        }
        
        otpVerified = true;
        console.log('✅ OTP verified successfully for:', email);
        
      } catch (otpError) {
        console.error('OTP verification failed:', otpError);
        if (!pinVerified) {
          return NextResponse.json(
            { success: false, message: 'Invalid or expired OTP' },
            { status: 500 }
          );
        }
      }
    }
    
          // For admin actions, check if user has been verified before (OTP or existing admin)
      if (action === 'create-admin' || action === 'debug-admin') {
        // Check if admin already exists for this email
        const { db } = await connectToDatabase();
        const adminUsersCollection = db.collection('adminusers');
        const existingAdmin = await adminUsersCollection.findOne({ 
          email: email.toLowerCase(),
          isAdmin: true 
        });
        
        if (existingAdmin) {
          console.log('✅ Admin already exists for:', email);
          otpVerified = true; // Allow access since admin exists
        } else if (token === 'EXISTING_ADMIN') {
          // Special case: Frontend indicates admin exists but we need to verify
          console.log('🔍 Frontend indicates existing admin, verifying...');
          const adminExists = await adminUsersCollection.findOne({ 
            email: email.toLowerCase(),
            isAdmin: true 
          });
          
          if (adminExists) {
            console.log('✅ Admin verified to exist for:', email);
            otpVerified = true;
          } else {
            return NextResponse.json(
              { success: false, message: 'No admin found for this email. Please verify OTP first.' },
              { status: 400 }
            );
          }
        } else {
          // SIMPLE LOGIC: If OTP was verified for ANY email, you're trusted
          // Check if there's a verified OTP in the system (any email)
          try {
            console.log('🔍 Checking if user is trusted via OTP verification...');
            
            // Check if this token was used to verify OTP for ANY email
            const otpCollection = db.collection('otps');
            const verifiedOTP = await otpCollection.findOne({ 
              otp: token,
              verified: true,
              expiresAt: { $gt: new Date() } // Not expired
            });
            
            if (verifiedOTP) {
              console.log('✅ User is trusted via verified OTP, allowing admin creation');
              otpVerified = true;
            } else {
              // Fallback: try to verify OTP for this specific email
              let otpResult = await otpDbService.verifyOTP(email, token);
              if (!otpResult.success) {
                otpResult = await otpDbService.checkVerifiedOTP(email, token);
              }
              
              if (!otpResult.success) {
                return NextResponse.json(
                  { success: false, message: 'OTP verification required. Please verify OTP first.' },
                  { status: 400 }
                );
              }
              
              otpVerified = true;
            }
          } catch (otpError) {
            return NextResponse.json(
              { success: false, message: 'OTP verification failed' },
              { status: 500 }
            );
          }
        }
      }
    
    // Handle different actions
    switch (action) {
      case 'verify-token':
        // Check admin_users collection specifically using direct database connection
        const { db } = await connectToDatabase();
        const adminUsersCollection = db.collection('adminusers');
        const adminExists = await adminUsersCollection.countDocuments({ isAdmin: true }) > 0;
        
        return NextResponse.json({ success: true, adminExists: adminExists, message: 'OTP verified successfully' });
        
      case 'initialize':
        return await handleInitialize();
        
      case 'create-admin':
        // OTP is already verified and consumed, proceed with admin creation
        if (!otpVerified) {
          return NextResponse.json(
            { success: false, message: 'OTP verification required' },
            { status: 400 }
          );
        }
        return await handleCreateAdmin(email, password, username);
        
      case 'debug-admin':
        return await handleDebugAdmin(email);
        
      case 'test-db':
        return await handleTestDatabase();
        
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
    
    // Check if admin already exists in AdminUser collection using direct database connection
    const adminUsersCollection = db.collection('adminusers');
    const existingAdmin = await adminUsersCollection.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('❌ Admin already exists in AdminUser collection:', existingAdmin.email);
      return NextResponse.json(
        { success: false, message: 'Admin user already exists' },
        { status: 400 }
      );
    }
    
    // Check if email already exists in AdminUser collection
    const existingAdminUser = await adminUsersCollection.findOne({ email: email.toLowerCase() });
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
    
    // Create admin user using direct database connection
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const adminUserData = {
      email: email.toLowerCase(),
      username: username || email.split('@')[0],
      password: hashedPassword,
      role: {
        _id: adminRole._id,
        name: adminRole.name,
        displayName: adminRole.displayName
      },
      isAdmin: true,
      isVerified: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Saving admin user to AdminUser collection:', { email: adminUserData.email, role: adminUserData.role });
    
    const result = await adminUsersCollection.insertOne(adminUserData);
    
    console.log('✅ Admin user created successfully in AdminUser collection:', result.insertedId);
    
    // Consume the OTP after successful admin creation
    try {
      await otpDbService.consumeOTP(email);
      console.log('✅ OTP consumed successfully after admin creation');
    } catch (otpError) {
      console.warn('⚠️ Warning: Failed to consume OTP after admin creation:', otpError);
      // Don't fail the admin creation if OTP consumption fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminUser: {
        id: result.insertedId,
        email: adminUserData.email,
        username: adminUserData.username,
        role: adminUserData.role
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

async function handleDebugAdmin(email: string) {
  try {
    await connectToDatabase();
    const { db } = await connectToDatabase();
    const adminUsersCollection = db.collection('adminusers');
    
    console.log('🔍 Debug: Looking for admin user with email:', email);
    
    // Find admin user
    const adminUser = await adminUsersCollection.findOne({ 
      email: email.toLowerCase(),
      isAdmin: true 
    });
    
    if (!adminUser) {
      console.log('❌ Debug: No admin user found');
      return NextResponse.json({
        success: false,
        exists: false,
        message: 'No admin user found with this email'
      });
    }
    
    console.log('✅ Debug: Admin user found:', {
      id: adminUser._id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
      status: adminUser.status,
      isAdmin: adminUser.isAdmin,
      hasPassword: !!adminUser.password
    });
    
    return NextResponse.json({
      success: true,
      exists: true,
      id: adminUser._id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role?.name || 'unknown',
      status: adminUser.status || 'unknown',
      isAdmin: adminUser.isAdmin,
      hasPassword: !!adminUser.password,
      message: 'Admin user found and details retrieved'
    });
    
  } catch (error) {
    console.error('❌ Admin debug failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        exists: false,
        message: `Debug failed: ${error}` 
      },
      { status: 500 }
    );
  }
}

async function handleTestDatabase() {
  try {
    console.log('🧪 Testing database connection...');
    const startTime = Date.now();
    
    const { db } = await connectToDatabase();
    
    const endTime = Date.now();
    const connectionTime = endTime - startTime;
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    
    // Test admin users collection specifically
    const adminUsersCollection = db.collection('adminusers');
    const adminCount = await adminUsersCollection.countDocuments();
    
    // Test OTP collection
    const otpCollection = db.collection('otps');
    const otpCount = await otpCollection.countDocuments();
    
    // Test a simple find operation to check for parsing issues
    const sampleAdmin = await adminUsersCollection.findOne({}, { projection: { email: 1, username: 1, role: 1 } });
    
    console.log('✅ Database connection test successful');
    
    return NextResponse.json({
      success: true,
      connectionTime: `${connectionTime}ms`,
      collections: collections.length,
      adminUsersCount: adminCount,
      otpCount: otpCount,
      sampleAdmin: sampleAdmin ? {
        id: sampleAdmin._id,
        email: sampleAdmin.email,
        username: sampleAdmin.username,
        role: sampleAdmin.role
      } : null,
      message: 'Database connection test successful'
    });
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Database test failed: ${error}` 
      },
      { status: 500 }
    );
  }
}

async function handleReset() {
  try {
    await connectToDatabase();
    const { db } = await connectToDatabase();
    const adminUsersCollection = db.collection('adminusers');
    
    // Delete all admin users from AdminUser collection
    const result = await adminUsersCollection.deleteMany({ isAdmin: true });
    
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
