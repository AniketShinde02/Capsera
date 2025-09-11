import { NextRequest, NextResponse } from 'next/server';
import { unsplashTestProvider } from '@/lib/test-image-provider';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || 'nature';
    const count = parseInt(searchParams.get('count') || '1');
    const type = searchParams.get('type') || 'single';

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

  } catch (error: any) {
    console.error('❌ Test image API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test image',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, count = 1, type = 'single' } = body;

    console.log(`🖼️ Test image POST request: keyword=${keyword}, count=${count}, type=${type}`);

    // Same logic as GET but with POST body
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

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter. Use: single, multiple, or caption'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Test image API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test image',
      message: error.message
    }, { status: 500 });
  }
}
