import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, username, tier } = await request.json();

    // Validate input
    if (!email || !username || !tier) {
      return NextResponse.json({ error: 'Email, username, and tier are required' }, { status: 400 });
    }

    // Validate tier
    const validTiers = ['moderator', 'content_editor', 'support_agent', 'analyst'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 });
    }

    // Generate secure password
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with tier role
    const newUser = {
      email,
      username,
      password: hashedPassword,
      role: tier,
      isActive: true,
      createdAt: new Date(),
      emailVerified: new Date(), // Auto-verify for tier accounts
      tier: {
        name: tier,
        assignedAt: new Date(),
        assignedBy: session.user.email
      }
    };

    const result = await db.collection('users').insertOne(newUser);

    if (result.insertedId) {
      // Send welcome email with credentials (optional)
      // You can integrate with your email service here
      
      return NextResponse.json({
        success: true,
        message: 'Tier account created successfully',
        user: {
          id: result.insertedId,
          email,
          username,
          tier,
          password // Return plain password for admin to share
        }
      });
    } else {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating quick tier account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
