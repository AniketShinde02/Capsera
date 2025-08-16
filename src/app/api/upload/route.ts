import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Vercel API configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};

// Helper function to retry Cloudinary upload
async function uploadWithRetry(uploadParams: any, maxRetries = 3): Promise<any> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Cloudinary upload attempt ${attempt}/${maxRetries}`);
      const response = await cloudinary.uploader.upload(uploadParams.file, {
        folder: 'capsera_uploads',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });
      console.log(`✅ Cloudinary upload successful on attempt ${attempt}`);
      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Cloudinary upload attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, don't wait
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

export async function POST(req: Request) {
  try {
    // Check content length first
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        message: 'File too large. Please upload an image smaller than 10MB.' 
      }, { status: 413 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large. Please upload an image smaller than 10MB.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;

    // Sanitized logging - don't expose full URLs
    console.log(`📤 Starting Cloudinary upload for file: ${uniqueFileName} (${Math.round(file.size / 1024)}KB)`);

    const uploadParams = {
      file: `data:${file.type};base64,${buffer.toString('base64')}`,
      fileName: uniqueFileName,
    };

    // Use retry logic for Cloudinary upload
    const response = await uploadWithRetry(uploadParams, 3);

    // Sanitized success logging
    console.log(`✅ Cloudinary upload completed successfully for: ${uniqueFileName}`);
    return NextResponse.json({ 
      success: true, 
      url: response.secure_url,
      publicId: response.public_id 
    }, { status: 200 });

  } catch (error: any) {
    console.error('💥 Upload Error:', error.message);
    
    // Provide more helpful error messages
    let errorMessage = 'Upload failed. Please try again.';
    let statusCode = 500;
    
    if (error.message?.includes('cloudinary') || error.message?.includes('CLOUDINARY')) {
      errorMessage = 'Cloudinary service temporarily unavailable. Please try again in a moment.';
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try with a smaller image.';
    } else if (error.message?.includes('too large') || error.message?.includes('413')) {
      errorMessage = 'File too large. Please upload an image smaller than 10MB.';
      statusCode = 413;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}
