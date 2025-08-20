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

    const { emails, operation } = await request.json();

    // Validate input
    if (!emails || !operation) {
      return NextResponse.json({ error: 'Emails and operation are required' }, { status: 400 });
    }

    // Validate operation
    const validOperations = ['create', 'delete', 'upgrade'];
    if (!validOperations.includes(operation)) {
      return NextResponse.json({ error: 'Invalid operation specified' }, { status: 400 });
    }

    // Parse emails
    const emailList = emails.split('\n')
      .map((email: string) => email.trim())
      .filter((email: string) => email && email.includes('@'));

    if (emailList.length === 0) {
      return NextResponse.json({ error: 'No valid emails provided' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const results = {
      total: emailList.length,
      success: 0,
      failed: 0,
      details: [] as any[]
    };

    // Process each email
    for (const email of emailList) {
      try {
        if (operation === 'create') {
          // Generate username from email
          const username = email.split('@')[0] + Math.random().toString(36).slice(-3);
          const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(password, 12);

          // Check if user exists
          const existingUser = await db.collection('users').findOne({ email });
          if (existingUser) {
            results.details.push({ email, status: 'skipped', reason: 'User already exists' });
            continue;
          }

          // Create user with default tier
          const newUser = {
            email,
            username,
            password: hashedPassword,
            role: 'moderator', // Default tier
            isActive: true,
            createdAt: new Date(),
            emailVerified: new Date(),
            tier: {
              name: 'moderator',
              assignedAt: new Date(),
              assignedBy: session.user.email
            }
          };

          await db.collection('users').insertOne(newUser);
          results.success++;
          results.details.push({ 
            email, 
            status: 'created', 
            username, 
            password,
            role: 'moderator'
          });

        } else if (operation === 'delete') {
          // Find and delete user
          const user = await db.collection('users').findOne({ email });
          if (!user) {
            results.details.push({ email, status: 'skipped', reason: 'User not found' });
            continue;
          }

          // Check if trying to delete admin
          if (user.role === 'admin' || user.role === 'super_admin') {
            results.details.push({ email, status: 'skipped', reason: 'Cannot delete admin' });
            continue;
          }

          // Archive before deletion
          const archivedUser = {
            ...user,
            deletedAt: new Date(),
            deletedBy: session.user.email,
            deletionReason: 'Bulk delete by admin',
            originalId: user._id
          };

          await db.collection('deletedprofiles').insertOne(archivedUser);
          await db.collection('users').deleteOne({ _id: user._id });

          results.success++;
          results.details.push({ email, status: 'deleted', username: user.username });

        } else if (operation === 'upgrade') {
          // Upgrade user to admin
          const user = await db.collection('users').findOne({ email });
          if (!user) {
            results.details.push({ email, status: 'skipped', reason: 'User not found' });
            continue;
          }

          // Update user role
          await db.collection('users').updateOne(
            { _id: user._id },
            { 
              $set: { 
                role: 'admin',
                'tier.name': 'admin',
                'tier.assignedAt': new Date(),
                'tier.assignedBy': session.user.email
              } 
            }
          );

          results.success++;
          results.details.push({ email, status: 'upgraded', username: user.username, newRole: 'admin' });
        }

      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.details.push({ email, status: 'failed', reason: errorMessage });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${operation} operation completed: ${results.success} success, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Error executing bulk tier operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
