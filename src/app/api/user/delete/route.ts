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

    // Start a database transaction
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

    // 📁 Archive images to Cloudinary before deleting posts
    const imageUrls = userPosts
      .map(post => post.image)
      .filter(Boolean) as string[]; // Filter out undefined/null values

    let archiveResult: { success: number; failed: number; archivedUrls: string[]; errors: Array<{ url: string; error: string }> } = { 
      success: 0, 
      failed: 0, 
      archivedUrls: [], 
      errors: [] 
    };
    
    if (imageUrls.length > 0) {
      console.log(`📁 Starting image archiving for user ${userId}: ${imageUrls.length} images`);
      archiveResult = await batchArchiveImagesToCloudinary(imageUrls, userId);
      console.log(`📊 Image archiving complete: ${archiveResult.success} success, ${archiveResult.failed} failed`);
    }

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

    // Prepare posts data for archiving with archived image URLs
    const postsDataToArchive = userPosts.map(post => {
      const originalImageUrl = post.image;
      const archivedImageUrl = archiveResult.archivedUrls.find((url: string) => 
        url.includes(post._id.toString()) || url.includes(post.image?.split('/').pop() || '')
      );

      return {
        _id: post._id.toString(),
        caption: post.captions?.[0] || 'No caption', // Handle the new captions array structure
        image: originalImageUrl,
        archivedImageUrl: archivedImageUrl || undefined,
        createdAt: post.createdAt,
      };
    });

    // Create archived profile record with archive metadata
    const archivedProfile = new DeletedProfile({
      originalUserId: userId,
      userData: userDataToArchive,
      postsData: postsDataToArchive,
      deletionReason: reason,
      deletedBy: userId,
      ipAddress,
      userAgent,
      archiveMetadata: {
        totalImages: imageUrls.length,
        successfullyArchived: archiveResult.success,
        failedArchives: archiveResult.failed,
        archiveErrors: archiveResult.errors,
        archivedAt: new Date(),
        archiveProvider: 'Cloudinary',
      },
    });

    await archivedProfile.save();

    // Send confirmation email to user if enabled (before deletion)
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
            'All your data has been archived securely to Cloudinary',
            'Your images have been moved to our secure archive system',
            'You can request data recovery within 30 days if needed',
            'Your email has been blocked from re-registration for security'
          ]
        });
        console.log('📧 Profile deletion confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('📧 Failed to send profile deletion confirmation email:', emailError);
        // Don't fail the deletion if email fails
      }
    }

    // Delete all user's posts (images are already archived)
    await Post.deleteMany({ user: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // 🚫 Block credentials to prevent immediate re-registration abuse
    await blockCredentials(
      user.email, 
      'account_deletion_abuse', 
      ipAddress, 
      userAgent
    );

    // Log the deletion for administrative purposes
    console.log(`User account deleted: ${user.email} (ID: ${userId}) at ${new Date().toISOString()}`);
    console.log(`📁 Images archived: ${archiveResult.success}/${imageUrls.length} to Cloudinary archive folder`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. Your data and images have been archived to Cloudinary according to our data retention policy.',
      archiveId: archivedProfile._id,
      imagesArchived: {
        total: imageUrls.length,
        successful: archiveResult.success,
        failed: archiveResult.failed,
      },
    }, { status: 200 });

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
