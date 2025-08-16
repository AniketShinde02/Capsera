import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    console.log('🧪 Testing admin system...');
    
    // Test database connection
    const { db } = await connectToDatabase();
    console.log('✅ Database connected');
    
    // Check users collection
    const usersCollection = db.collection('users');
    const adminCount = await usersCollection.countDocuments({ 'role.name': 'admin' });
    const totalUsers = await usersCollection.countDocuments();
    
    console.log('📊 Database stats:', { adminCount, totalUsers });
    
    // Get admin users
    const adminUsers = await usersCollection.find({ 'role.name': 'admin' }).toArray();
    const adminEmails = adminUsers.map(user => ({ 
      id: user._id, 
      email: user.email, 
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }));
    
    return NextResponse.json({
      success: true,
      message: 'Admin system test completed',
      database: {
        connected: true,
        adminCount,
        totalUsers
      },
      adminUsers: adminEmails
    });
    
  } catch (error) {
    console.error('❌ Admin system test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Admin system test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
