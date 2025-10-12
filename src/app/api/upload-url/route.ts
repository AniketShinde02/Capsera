import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Security: Only allow http/https URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { message: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Security: Block localhost and private IPs to prevent SSRF
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Block localhost, private IPs, and internal networks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname.includes('.local')
    ) {
      return NextResponse.json(
        { message: 'Access to local or private networks is not allowed' },
        { status: 400 }
      );
    }

    console.log('📥 Uploading image from URL:', url);

    // Upload to Cloudinary using the URL
    const result = await cloudinary.uploader.upload(url, {
      resource_type: 'auto',
      folder: 'capsera/user-uploads',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 1920, height: 1920, crop: 'limit' }
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_bytes: 10 * 1024 * 1024, // 10MB limit
    });

    console.log('✅ URL upload successful:', result.public_id);

    return NextResponse.json({
      message: 'Image uploaded successfully',
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });

  } catch (error) {
    console.error('❌ URL upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid image file')) {
        return NextResponse.json(
          { message: 'The URL does not contain a valid image file' },
          { status: 400 }
        );
      }
      if (error.message.includes('File size too large')) {
        return NextResponse.json(
          { message: 'Image file is too large (max 10MB)' },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid URL')) {
        return NextResponse.json(
          { message: 'Unable to access the provided URL' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to upload image from URL. Please try again.' },
      { status: 500 }
    );
  }
}
