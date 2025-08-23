import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

// Simple signing endpoint for client-side direct uploads to Cloudinary.
// Returns timestamp and signature for the given folder/preset so the client can upload directly
// without sending large multipart bodies through the server runtime.

export async function GET(req: Request) {
  try {
    // Ensure Cloudinary is configured
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ success: false, message: 'Cloudinary not configured' }, { status: 503 });
    }

    // We sign minimal parameters: timestamp and folder. Clients may add public_id or other params if desired.
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, any> = {
      timestamp,
      folder: 'capsera_uploads',
    };

    // cloudinary.utils.api_sign_request is available on the v2 SDK under cloudinary.utils
    // It returns a SHA-1 signature using the API secret configured on the server.
    // @ts-ignore - cloudinary typings sometimes omit utils on the exported object
    const signature = (cloudinary.utils && cloudinary.utils.api_sign_request)
      ? cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET)
      : undefined;

    if (!signature) {
      // Fallback: compute signature manually using crypto (avoid importing extra deps)
      const crypto = await import('crypto');
      const entries = Object.keys(paramsToSign).sort().map(k => `${k}=${paramsToSign[k]}`).join('&');
      const toSign = `${entries}${process.env.CLOUDINARY_API_SECRET}`;
      // Cloudinary expects SHA-1 hex
      const fallback = crypto.createHash('sha1').update(toSign).digest('hex');
      return NextResponse.json({ success: true, signature: fallback, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
    }

    return NextResponse.json({ success: true, signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (error: any) {
    console.error('Error creating upload signature:', error);
    return NextResponse.json({ success: false, message: 'Failed to create signature' }, { status: 500 });
  }
}
