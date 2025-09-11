import { NextRequest, NextResponse } from 'next/server';
import { unsplashTestProvider } from '@/lib/test-image-provider';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keyword = searchParams.get('keyword')?.trim() || 'nature';
    const count = Math.min(10, Math.max(1, Number.parseInt(searchParams.get('count') ?? '1', 10) || 1));
    const type = (searchParams.get('type') || 'single').toLowerCase();
    // Validate type parameter
    const validTypes = ['single', 'multiple', 'caption', 'file'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type parameter. Use: single, multiple, caption, or file'
      }, { status: 400 });
    }

    console.log(`🖼️ Test image request: keyword=${keyword}, count=${count}, type=${type}`);

    switch (type) {
      case 'single':
        const singleImage = await unsplashTestProvider.getTestImageByKeyword(keyword);
        return NextResponse.json({
          success: true,
          data: singleImage
        });

      case 'multiple':
        const multipleImages = await unsplashTestProvider.getMultipleTestImages(count);
        return NextResponse.json({
          success: true,
          data: multipleImages,
          count: multipleImages.length
        });

      case 'caption':
        const captionData = await unsplashTestProvider.getTestImageForCaptionGeneration();
        return NextResponse.json({
          success: true,
          data: captionData
        });

      case 'file':
        // This would require server-side file creation, which is complex
        // For now, return the image URL and let the client handle it
        const imageData = await unsplashTestProvider.getTestImageByKeyword(keyword);
        return NextResponse.json({
          success: true,
          data: {
            url: imageData.url,
            publicId: imageData.publicId,
            attribution: imageData.attribution,
            instructions: 'Use this URL to create a File object on the client side'
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter. Use: single, multiple, caption, or file'
        }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error('❌ Test image API error:', error);
    
    // Don't leak internal error details in production
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test image',
        ...(process.env.NODE_ENV === 'development' ? { message: msg } : {})
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 });
    }
    
    const { keyword = 'nature', count = 1, type = 'single' } = body;
    
    // Validate parameters
    const validTypes = ['single', 'multiple', 'caption'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type parameter. Use: single, multiple, or caption'
      }, { status: 400 });
    }
    
    const safeCount = Math.min(Math.max(parseInt(String(count)) || 1, 1), 10); // Between 1-10

    console.log(`🖼️ Test image POST request: keyword=${keyword}, count=${safeCount}, type=${type}`);

    // Same logic as GET but with POST body
    switch (type) {
      case 'single':
        const singleImage = await unsplashTestProvider.getTestImageByKeyword(keyword);
        return NextResponse.json({
          success: true,
          data: singleImage
        });

      case 'multiple':
        const multipleImages = await unsplashTestProvider.getMultipleTestImages(safeCount);
        return NextResponse.json({
          success: true,
          data: multipleImages,
          count: multipleImages.length
        });

      case 'caption':
        const captionData = await unsplashTestProvider.getTestImageForCaptionGeneration();
        return NextResponse.json({
          success: true,
          data: captionData
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter. Use: single, multiple, or caption'
        }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error('❌ Test image API error:', error);
    
    // Don't leak internal error details in production
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test image',
        ...(process.env.NODE_ENV === 'development' ? { message: msg } : {})
      },
      { status: 500 }
    );
  }
}
