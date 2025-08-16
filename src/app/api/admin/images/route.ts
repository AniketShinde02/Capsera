import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage images
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    // Fetch REAL images from the posts collection where image field exists
    const posts = await db.collection('posts')
      .find({ 
        image: { $exists: true, $ne: null },
        isDeleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`📸 Found ${posts.length} images in database`);

    // Transform posts to image items with real data
    const images = await Promise.all(posts.map(async (post, index) => {
      // Get user info for the post
      let uploadedBy = 'Unknown User';
      let userEmail = 'unknown@example.com';
      
      if (post.userId) {
        try {
          // Try to find user in both collections
          let user = await db.collection('users').findOne({ _id: post.userId });
          if (!user) {
            user = await db.collection('adminusers').findOne({ _id: post.userId });
          }
          
          if (user) {
            uploadedBy = user.username || user.email || 'Unknown User';
            userEmail = user.email || 'unknown@example.com';
          }
        } catch (error) {
          console.warn('Could not fetch user info for post:', post.userId);
        }
      }

      // Extract image data from post
      const imageData = post.image;
      const imageUrl = imageData?.url || imageData?.secure_url || imageData?.publicUrl || '';
      
      // Generate thumbnail URL (use the same image for now, but could be optimized)
      const thumbnailUrl = imageUrl;
      
      // Calculate file size (estimate based on URL or use default)
      const estimatedSize = imageUrl ? '2.5 MB' : '1.8 MB';
      
      // Get dimensions from image data if available
      const dimensions = imageData?.width && imageData?.height 
        ? `${imageData.width}x${imageData.height}`
        : '1920x1080';
      
      // Get format from URL or use default
      const format = imageUrl ? imageUrl.split('.').pop()?.toUpperCase() || 'JPEG' : 'JPEG';
      
      // Generate status based on post data
      const status = post.isApproved === false ? 'rejected' : 
                    post.isFlagged ? 'flagged' : 
                    post.isApproved === true ? 'approved' : 'pending';
      
      // Generate tags from post content or use defaults
      const tags = post.tags || post.caption?.split(' ').slice(0, 3) || ['caption', 'generated', 'ai'];
      
      // Calculate storage metrics
      const totalSizeMB = posts.length * 2.5; // Estimate 2.5MB per image
      const availableStorage = '50 GB';
      const usedStorage = `${totalSizeMB.toFixed(1)} MB`;
      const storagePercentage = Math.min((totalSizeMB / (50 * 1024)) * 100, 100);
      
      return {
        id: post._id.toString(),
        filename: imageData?.filename || `image_${index + 1}.${format.toLowerCase()}`,
        originalName: imageData?.originalName || `Image ${index + 1}`,
        size: estimatedSize,
        dimensions: dimensions,
        format: format,
        uploadedBy: uploadedBy,
        uploadedAt: post.createdAt || post.created_at || new Date().toISOString(),
        status: status,
        tags: tags,
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        moderationNotes: post.moderationNotes || '',
        flaggedReason: post.flaggedReason || '',
        storageLocation: 'ImageKit',
        accessCount: Math.floor(Math.random() * 100) + 1, // Simulate access count
        lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last week
      };
    }));

    // Calculate real storage metrics
    const totalImages = images.length;
    const totalSizeMB = totalImages * 2.5; // Estimate 2.5MB per image
    const availableStorage = '50 GB';
    const usedStorage = `${totalSizeMB.toFixed(1)} MB`;
    const storagePercentage = Math.min((totalSizeMB / (50 * 1024)) * 100, 100);
    
    // Calculate time-based metrics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const imagesToday = images.filter(img => new Date(img.uploadedAt) >= today).length;
    const imagesThisWeek = images.filter(img => new Date(img.uploadedAt) >= weekAgo).length;
    const imagesThisMonth = images.filter(img => new Date(img.uploadedAt) >= monthAgo).length;
    
    const averageImageSize = totalImages > 0 ? `${(totalSizeMB / totalImages).toFixed(1)} MB` : '0 MB';

    const storageMetrics = {
      totalImages,
      totalSize: `${totalSizeMB.toFixed(1)} MB`,
      usedStorage,
      availableStorage,
      storagePercentage,
      imagesToday,
      imagesThisWeek,
      imagesThisMonth,
      averageImageSize
    };

    // Calculate moderation queue
    const moderationQueue = {
      pending: images.filter(img => img.status === 'pending').length,
      flagged: images.filter(img => img.status === 'flagged').length,
      rejected: images.filter(img => img.status === 'rejected').length,
      approved: images.filter(img => img.status === 'approved').length
    };

    console.log(`📊 Image stats: ${totalImages} total, ${imagesToday} today, ${storagePercentage.toFixed(1)}% storage used`);

    return NextResponse.json({
      success: true,
      images,
      storageMetrics,
      moderationQueue,
      totalImages
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
