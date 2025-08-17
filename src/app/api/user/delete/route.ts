import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import DeletedProfile from '@/models/DeletedProfile';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { blockCredentials, getClientIP } from '@/lib/rate-limit';
import { batchArchiveImagesToCloudinary } from '@/lib/cloudinary-archive';
import { sendRequestConfirmationEmail } from '@/lib/mail';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  await dbConnect();

  try {
    const { reason } = await req.json();
    
    // Get request headers for audit purposes
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || getClientIP(req);
    const userAgent = headersList.get('user-agent') || 'unknown';

    const userId = session.user.id;

    // Fetch user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' }, 
        { status: 404 }
      );
    }

    // Fetch all user's posts/captions
    const userPosts = await Post.find({ user: userId });

    // Prepare archived user data (exclude sensitive fields like password)
    const userDataToArchive = {
      email: user.email,
      username: user.username,
      title: user.title,
      bio: user.bio,
      image: user.image,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
    };

    // Prepare posts data for archiving
    const postsDataToArchive = userPosts.map(post => ({
      _id: post._id.toString(),
      caption: post.captions?.[0] || 'No caption',
      image: post.image,
      createdAt: post.createdAt,
    }));

    // Create archived profile record
    const archivedProfile = new DeletedProfile({
      originalUserId: userId,
      userData: userDataToArchive,
      postsData: postsDataToArchive,
      deletionReason: reason,
      deletedBy: userId,
      ipAddress,
      userAgent,
    });

    // Save archived profile
    await archivedProfile.save();

    // 🚀 FAST DELETION: Delete posts and user immediately
    await Post.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    // Return success immediately - user is deleted!
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully. Your data has been archived.',
      archiveId: archivedProfile._id,
    }, { status: 200 });

    // 🚀 ASYNC CLEANUP: Handle time-consuming operations in background
    // Don't wait for these - they won't affect the user experience
    setImmediate(async () => {
      try {
        // Archive images to Cloudinary (async)
        const imageUrls = userPosts
          .map(post => post.image)
          .filter(Boolean) as string[];

        if (imageUrls.length > 0) {
          console.log(`📁 Starting async image archiving for user ${userId}: ${imageUrls.length} images`);
          const archiveResult = await batchArchiveImagesToCloudinary(imageUrls, userId);
          console.log(`📊 Async image archiving complete: ${archiveResult.success} success, ${archiveResult.failed} failed`);
          
          // Update archived profile with archive results
          await DeletedProfile.findByIdAndUpdate(archivedProfile._id, {
            archiveMetadata: {
              totalImages: imageUrls.length,
              successfullyArchived: archiveResult.success,
              failedArchives: archiveResult.failed,
              archiveErrors: archiveResult.errors,
              archivedAt: new Date(),
              archiveProvider: 'Cloudinary',
            },
          });
        }

        // Send confirmation email (async)
        if (user.emailPreferences?.requestConfirmations) {
          try {
            await sendRequestConfirmationEmail({
              name: user.name || user.username || user.email.split('@')[0],
              email: user.email,
              requestType: 'profile_deletion',
              requestId: archivedProfile._id.toString(),
              estimatedTime: 'Immediate',
              nextSteps: [
                'Your account has been successfully deleted',
                'All your data has been archived securely',
                'Your images are being moved to our secure archive system',
                'You can request data recovery within 30 days if needed',
                'Your email has been blocked from re-registration for security'
              ]
            });
            console.log('📧 Async profile deletion confirmation email sent to:', user.email);
          } catch (emailError) {
            console.error('📧 Failed to send async profile deletion confirmation email:', emailError);
          }
        }

        // Block credentials (async)
        await blockCredentials(
          user.email, 
          'account_deletion_abuse', 
          ipAddress, 
          userAgent
        );

        console.log(`🚀 Async cleanup complete for deleted user: ${user.email} (ID: ${userId})`);
      } catch (asyncError) {
        console.error('🚨 Error in async cleanup for user deletion:', asyncError);
        // Don't fail the main deletion - this is just cleanup
      }
    });

    return response;

  } catch (error: any) {
    console.error('Error deleting user account:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to delete account. Please try again later.' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  try {
    const { email, confirmEmail } = await req.json();

    // Verify the user is trying to delete their own account
    if (email !== session.user.email || email !== confirmEmail) {
      return NextResponse.json(
        { success: false, message: 'Email confirmation does not match' }, 
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user data to show preview of what will be deleted
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' }, 
        { status: 404 }
      );
    }

    const userPosts = await Post.find({ user: session.user.id });

    return NextResponse.json({
      success: true,
      preview: {
        accountEmail: user.email,
        username: user.username || 'Not set',
        totalCaptions: userPosts.length,
        totalImages: userPosts.filter(post => post.image).length, // Count posts with images
        accountCreated: user.createdAt,
        lastActivity: userPosts.length > 0 ? userPosts[0].createdAt : user.createdAt,
      },
      message: 'Account deletion preview generated. You can proceed with deletion.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error generating deletion preview:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to generate deletion preview' }, 
      { status: 500 }
    );
  }
}
