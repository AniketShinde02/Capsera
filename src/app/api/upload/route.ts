import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { checkImageContentSafety, reportInappropriateContent, validateImageForProcessing } from '@/lib/content-safety';

// Vercel API configuration - Updated for Vercel limits
export const config = {
  api: {
    bodyParser: {
      // Vercel Pro: 50MB, Hobby: 4.5MB - Use conservative 4MB limit
      sizeLimit: '4mb',
    },
    responseLimit: false,
  },
  // Add runtime configuration for Vercel
  runtime: 'nodejs',
  maxDuration: 30, // 30 seconds max execution time
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
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary configuration missing');
      return NextResponse.json({
        success: false,
        message: 'Image upload service is not configured. Please contact support.'
      }, { status: 503 });
    }

    // Check content length first (be conservative for Vercel limits)
    const contentLength = req.headers.get('content-length');
    // Vercel Hobby: 4.5MB, Pro: 50MB - Use conservative 4MB limit
    const MAX_BYTES = Math.floor(4 * 1024 * 1024); // 4MB
    if (contentLength && parseInt(contentLength) > MAX_BYTES) {
      return NextResponse.json({
        success: false,
        message: 'File too large. Please upload an image smaller than 4MB.'
      }, { status: 413 });
    }

    const formData = await req.formData();
    // Accept either 'file' or 'image' to be backwards compatible with clients
    let file = formData.get('file') as File | null | undefined;
    if (!file) {
      file = formData.get('image') as File | null | undefined;
    }

    // If still no file, try to find the first File/Blob in the form data values
    if (!file) {
      for (const value of formData.values()) {
        if (value instanceof File) {
          file = value as File;
          break;
        }
        // Some clients may send a Blob-like object (check for arrayBuffer support)
        const anyVal: any = value;
        if (anyVal && typeof anyVal.arrayBuffer === 'function') {
          try {
            const blobType = anyVal.type || 'application/octet-stream';
            file = new File([anyVal], `upload-${Date.now()}.jpg`, { type: blobType });
            break;
          } catch (e) {
            // If File constructor is unavailable or fails, continue searching
          }
        }
      }
    }

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Validate file size (max 4MB for Vercel compatibility)
    const MAX_FILE_BYTES = Math.floor(4 * 1024 * 1024); // 4MB
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({
        success: false,
        message: `File too large. Please upload an image smaller than 4MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
        error: 'file_too_large',
        maxSize: '4MB',
        actualSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      }, { status: 413 });
    }

    // Content safety validation
    const validation = validateImageForProcessing(file, file.name);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: validation.error || 'Image validation failed.'
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;

    // Sanitized logging - don't expose full URLs
    console.log(`📤 Starting Cloudinary upload for file: ${uniqueFileName} (${Math.round(file.size / 1024)}KB)`);

    const uploadParams = {
      file: `data:${file.type};base64,${buffer.toString('base64')}`,
      fileName: uniqueFileName,
      type: 'private', // 🔒 Make image private (not accessible via public URL)
    };

    // Use retry logic for Cloudinary upload
    const response = await uploadWithRetry(uploadParams, 3);

    // Content safety check after successful upload
    try {
      console.log(`🔍 Performing content safety check for: ${uniqueFileName}`);

      // 🔐 Generate a temporary SIGNED URL for the safety check service
      // This allows Sightengine to access the private image for analysis
      const signedSafetyUrl = cloudinary.url(response.public_id, {
        type: 'private',
        sign_url: true,
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
      });

      const safetyResult = await checkImageContentSafety(signedSafetyUrl, undefined, response.public_id);

      if (!safetyResult.isAppropriate) {
        console.warn(`⚠️ Inappropriate content detected: ${safetyResult.flagged.join(', ')}`);

        // Report inappropriate content for admin review
        await reportInappropriateContent({
          imageUrl: response.secure_url,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          reason: safetyResult.flagged.includes('adult') ? 'sexual' :
            safetyResult.flagged.includes('violence') ? 'violent' : 'inappropriate',
          description: `Content flagged as ${safetyResult.flagged.join(', ')} with ${safetyResult.confidence} confidence`,
          timestamp: new Date()
        });

        // Return error to user
        return NextResponse.json({
          success: false,
          message: 'This image contains inappropriate content and cannot be processed. Please upload a family-friendly image.',
          error: 'content_violation',
          flagged: safetyResult.flagged
        }, { status: 400 });
      }

      console.log(`✅ Content safety check passed for: ${uniqueFileName}`);
    } catch (safetyError) {
      console.error('❌ Content safety check failed:', safetyError);

      // Strict safety check for ALL environments (Dev & Prod)
      console.error('🚨 Content safety check failed - rejecting upload');
      return NextResponse.json({
        success: false,
        message: 'Content safety verification failed. Please try again or contact support if the issue persists.',
        error: 'safety_check_failed'
      }, { status: 400 });
    }

    // Sanitized success logging
    console.log(`✅ Cloudinary upload completed successfully for: ${uniqueFileName}`);

    // Enhanced response validation
    if (!response.secure_url || !response.public_id) {
      console.error('❌ Cloudinary response missing required fields:', {
        hasSecureUrl: !!response.secure_url,
        hasPublicId: !!response.public_id,
        response: response
      });
      return NextResponse.json({
        success: false,
        message: 'Upload completed but response format is invalid. Please try again.',
        error: 'invalid_response_format'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: response.secure_url,
      public_id: response.public_id, // Ensure consistent naming
      publicId: response.public_id,  // Keep both for compatibility
      secure_url: response.secure_url // Keep both for compatibility
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
