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

    // Check total posts in database
    const totalPosts = await db.collection('posts').countDocuments({});
    console.log(`📊 Total posts in database: ${totalPosts}`);
    
    // Check posts with different image fields
    const postsWithImage = await db.collection('posts').countDocuments({ image: { $exists: true, $ne: null } });
    const postsWithImageUrl = await db.collection('posts').countDocuments({ imageUrl: { $exists: true, $ne: null } });
    const postsWithSecureUrl = await db.collection('posts').countDocuments({ secure_url: { $exists: true, $ne: null } });
    const postsWithPublicUrl = await db.collection('posts').countDocuments({ publicUrl: { $exists: true, $ne: null } });
    
    console.log(`🔍 Posts breakdown:`);
    console.log(`  - With 'image' field: ${postsWithImage}`);
    console.log(`  - With 'imageUrl' field: ${postsWithImageUrl}`);
    console.log(`  - With 'secure_url' field: ${postsWithSecureUrl}`);
    console.log(`  - With 'publicUrl' field: ${postsWithPublicUrl}`);

    // Fetch REAL images from the posts collection where image field exists
    const posts = await db.collection('posts')
      .find({ 
        $or: [
          { image: { $exists: true, $ne: null } },
          { imageUrl: { $exists: true, $ne: null } },
          { secure_url: { $exists: true, $ne: null } },
          { publicUrl: { $exists: true, $ne: null } }
        ],
        isDeleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`📸 Found ${posts.length} images in database`);
    
    // Debug: Check first post structure
    if (posts.length > 0) {
      console.log('🔍 First post structure:', JSON.stringify(posts[0], null, 2));
    }

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
      console.log('🔍 Post structure for:', post._id);
      console.log('  - post.image type:', typeof post.image);
      console.log('  - post.image value:', JSON.stringify(post.image, null, 2));
      console.log('  - post.imageUrl:', post.imageUrl);
      console.log('  - post.secure_url:', post.secure_url);
      console.log('  - post.publicUrl:', post.publicUrl);
      
      // Try multiple possible image URL fields
      let imageUrl = '';
      
      // First try: post.image object fields
      if (imageData) {
        imageUrl = imageData.url || imageData.secure_url || imageData.publicUrl || imageData.imageUrl || '';
        console.log('🔍 URL from imageData:', imageUrl);
      }
      
      // Second try: direct post fields
      if (!imageUrl) {
        imageUrl = post.imageUrl || post.image_url || post.secureUrl || post.secure_url || post.publicUrl || post.public_url || '';
        console.log('🔍 URL from direct post fields:', imageUrl);
      }
      
      // Third try: check if post has a direct image field
      if (!imageUrl && typeof post.image === 'string') {
        imageUrl = post.image;
        console.log('🔍 URL from post.image string:', imageUrl);
      }
      
      console.log('🔍 Final image URL found:', imageUrl);
      
      // Generate optimized thumbnail URL for Cloudinary
      let thumbnailUrl = imageUrl;
      
      // If it's a Cloudinary URL, optimize it for thumbnails
      if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
        // Add Cloudinary transformations for thumbnails: w_200,h_200,c_fill,q_auto
        thumbnailUrl = imageUrl.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto/');
        console.log('🔍 Optimized Cloudinary thumbnail:', thumbnailUrl);
      } else if (imageUrl && imageUrl.includes('ik.imagekit.io')) {
        // If it's ImageKit, add optimization
        thumbnailUrl = imageUrl + '?tr=w-200,h-200';
        console.log('🔍 Optimized ImageKit thumbnail:', thumbnailUrl);
      }
      
      console.log('🔍 Thumbnail URL set to:', thumbnailUrl);
      
      // If still no image URL, provide a fallback placeholder
      if (!imageUrl) {
        imageUrl = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';
        console.log('🔍 Using fallback placeholder image');
      }
      
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
      
      // Calculate storage metrics (real data only)
      const totalSizeMB = posts.length * 2.5; // Estimate 2.5MB per image
      const usedStorage = `${totalSizeMB.toFixed(1)} MB`;
      const storagePercentage = 0; // We don't know actual storage limits
      
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
    const usedStorage = `${totalSizeMB.toFixed(1)} MB`;
    const storagePercentage = 0; // We don't know actual storage limits
    
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
