import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';
import { cloudinary } from '@/lib/cloudinary';

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

    // 1. Fetch ALL images from Cloudinary (capsera_uploads and capsera_archives)
    console.log('☁️ Fetching images from Cloudinary...');

    // Search for all images in both folders including subfolders
    // Using wildcard to match all resources within these folders
    const cloudinaryResult = await cloudinary.search
      .expression('resource_type:image AND (folder:capsera_uploads* OR folder:capsera_archives*)')
      .sort_by('created_at', 'desc')
      .max_results(500) // Cloudinary max is 500 per request
      .with_field('context')
      .with_field('tags')
      .execute();

    const cloudResources = cloudinaryResult.resources || [];
    console.log(`☁️ Cloudinary Search Results:`);
    console.log(`   - Total found: ${cloudResources.length}`);
    console.log(`   - Total available: ${cloudinaryResult.total_count}`);
    console.log(`   - Next cursor: ${cloudinaryResult.next_cursor ? 'Yes (more results available)' : 'No'}`);

    if (cloudResources.length === 0) {
      console.warn('⚠️ No images found in Cloudinary! Check folder names and upload configuration.');
    }

    // 2. Fetch ALL posts from MongoDB to map metadata
    const posts = await db.collection('posts')
      .find({
        $or: [
          { image: { $exists: true, $ne: null } },
          { imageUrl: { $exists: true, $ne: null } },
          { secure_url: { $exists: true, $ne: null } },
          { publicUrl: { $exists: true, $ne: null } }
        ]
      })
      .toArray();

    // Create a lookup map for fast access by public_id or URL
    const postMap = new Map();

    posts.forEach(post => {
      // Extract public_id from post if available
      let publicId = post.publicId || post.public_id || post.image?.publicId || post.image?.public_id;

      // If no publicId, try to extract from URL
      if (!publicId) {
        const url = post.imageUrl || post.image?.url || post.image?.secure_url || post.secure_url;
        if (url) {
          const match = url.match(/\/upload\/(?:v\d+\/)?([^\/]+(?:\/[^\/]+)*?)(?:\.\w+)?$/);
          if (match) publicId = match[1];
        }
      }

      if (publicId) {
        postMap.set(publicId, post);
      }
    });

    console.log(`📚 Mapped ${postMap.size} posts from database`);

    // 3. Merge Data: Create Image Items
    const images = await Promise.all(cloudResources.map(async (resource: any) => {
      const publicId = resource.public_id;
      const post = postMap.get(publicId);

      // Default values (if not in DB)
      let uploadedBy = 'Anonymous / Unlinked';
      let status = 'pending';
      let tags = ['cloudinary', 'orphan'];
      let moderationNotes = '';
      let flaggedReason = '';
      let uploadedAt = resource.created_at;
      let id = publicId; // Use public_id as ID if no DB ID

      // If found in DB, override with DB data
      if (post) {
        id = post._id.toString();
        uploadedAt = post.createdAt || post.created_at || resource.created_at;

        // Status logic (prioritize 'status' field)
        status = post.status || post.moderationStatus || (
          post.isApproved === false ? 'rejected' :
            post.isFlagged ? 'flagged' :
              post.isApproved === true ? 'approved' : 'pending'
        );

        tags = post.tags || post.caption?.split(' ').slice(0, 3) || ['caption', 'generated', 'ai'];
        moderationNotes = post.moderationNotes || '';
        flaggedReason = post.flaggedReason || '';

        // Fetch user info if available
        if (post.userId) {
          try {
            const user = await db.collection('users').findOne({ _id: post.userId });
            if (user) {
              uploadedBy = user.username || user.email || 'Unknown User';
            }
          } catch (e) {
            // Ignore user fetch error
          }
        }
      }

      // Generate URLs - detect if private or public
      // Cloudinary resources have a 'type' field: 'upload' (public) or 'private'
      const resourceType = resource.type || 'upload'; // Default to 'upload' (public)
      const isPrivate = resourceType === 'private';

      let signedImageUrl = resource.secure_url; // Fallback to direct URL
      let thumbnailUrl = resource.secure_url;

      try {
        if (isPrivate) {
          // Generate signed URLs for private images
          signedImageUrl = cloudinary.url(publicId, {
            type: 'private',
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600
          });

          thumbnailUrl = cloudinary.url(publicId, {
            type: 'private',
            sign_url: true,
            secure: true,
            transformation: [
              { width: 200, height: 200, crop: 'fill' },
              { quality: 'auto' }
            ],
            expires_at: Math.floor(Date.now() / 1000) + 3600
          });
        } else {
          // Generate optimized URLs for public images (no signing needed)
          signedImageUrl = cloudinary.url(publicId, {
            secure: true,
            fetch_format: 'auto',
            quality: 'auto'
          });

          thumbnailUrl = cloudinary.url(publicId, {
            secure: true,
            transformation: [
              { width: 200, height: 200, crop: 'fill' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
        }
      } catch (urlError) {
        console.error(`❌ Failed to generate URL for ${publicId}:`, urlError);
        // Keep fallback URLs (resource.secure_url)
      }

      return {
        id: id,
        filename: `${publicId.split('/').pop()}.${resource.format}`,
        originalName: resource.filename || publicId.split('/').pop(),
        size: `${(resource.bytes / 1024 / 1024).toFixed(2)} MB`,
        dimensions: `${resource.width}x${resource.height}`,
        format: resource.format.toUpperCase(),
        uploadedBy: uploadedBy,
        uploadedAt: uploadedAt,
        status: status,
        tags: tags,
        url: signedImageUrl,
        thumbnailUrl: thumbnailUrl,
        moderationNotes: moderationNotes,
        flaggedReason: flaggedReason,
        storageLocation: post ? 'Cloudinary (Linked)' : 'Cloudinary (Orphan)',
        accessCount: 0,
        lastAccessed: new Date().toISOString()
      };
    }));

    // Sort images: Pending first, then by date
    const statusPriority = { 'pending': 0, 'flagged': 1, 'approved': 2, 'rejected': 3 };

    images.sort((a, b) => {
      // First, sort by status priority
      const priorityA = statusPriority[a.status as keyof typeof statusPriority] ?? 99;
      const priorityB = statusPriority[b.status as keyof typeof statusPriority] ?? 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If status is same, sort by date (newest first)
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    // Calculate Metrics
    const totalImages = images.length;
    const totalSizeBytes = cloudResources.reduce((acc: number, res: any) => acc + res.bytes, 0);
    const totalSizeMB = totalSizeBytes / 1024 / 1024;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const imagesToday = images.filter(img => new Date(img.uploadedAt) >= today).length;
    const imagesThisWeek = images.filter(img => new Date(img.uploadedAt) >= weekAgo).length;
    const imagesThisMonth = images.filter(img => new Date(img.uploadedAt) >= monthAgo).length;

    const storageMetrics = {
      totalImages,
      totalSize: `${totalSizeMB.toFixed(1)} MB`,
      usedStorage: `${totalSizeMB.toFixed(1)} MB`,
      availableStorage: '25 GB', // Placeholder
      storagePercentage: 0,
      imagesToday,
      imagesThisWeek,
      imagesThisMonth,
      averageImageSize: totalImages > 0 ? `${(totalSizeMB / totalImages).toFixed(1)} MB` : '0 MB'
    };

    const moderationQueue = {
      pending: images.filter(img => img.status === 'pending').length,
      flagged: images.filter(img => img.status === 'flagged').length,
      rejected: images.filter(img => img.status === 'rejected').length,
      approved: images.filter(img => img.status === 'approved').length
    };

    console.log(`✅ Returning ${totalImages} images to client`);

    return NextResponse.json({
      success: true,
      images,
      storageMetrics,
      moderationQueue,
      totalImages
    });

  } catch (error) {
    console.error('❌ Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
