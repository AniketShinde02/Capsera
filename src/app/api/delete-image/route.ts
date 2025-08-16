import { NextResponse } from 'next/server';
import { archiveCloudinaryImage, extractCloudinaryPublicId } from '@/lib/cloudinary';

export async function DELETE(req: Request) {
  try {
    const { imageUrl, userId } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ 
        success: false, 
        message: 'Image URL is required' 
      }, { status: 400 });
    }

    console.log(`📁 Archiving image instead of deleting: ${imageUrl}`);

    // Extract public ID from Cloudinary URL
    const publicId = extractCloudinaryPublicId(imageUrl);
    if (!publicId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Could not extract image ID from URL' 
      }, { status: 400 });
    }

    // Archive the image instead of deleting it
    const archiveResult = await archiveCloudinaryImage(publicId, userId);

    if (archiveResult.success) {
      console.log(`✅ Image archived successfully: ${archiveResult.archivedId}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Image moved to archive successfully',
        archivedId: archiveResult.archivedId,
        note: 'Image is safely archived and can be restored if needed'
      }, { status: 200 });
    } else {
      console.error(`❌ Failed to archive image: ${archiveResult.error}`);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to archive image',
        error: archiveResult.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('💥 Archive Image Error:', error.message);
    
    let errorMessage = 'Failed to archive image. Please try again.';
    let statusCode = 500;
    
    if (error.message?.includes('not found')) {
      errorMessage = 'Image not found or already archived.';
      statusCode = 404;
    } else if (error.message?.includes('unauthorized')) {
      errorMessage = 'Unauthorized to archive this image.';
      statusCode = 403;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}
