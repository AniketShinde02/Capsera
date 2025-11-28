import { NextRequest } from 'next/server';

export interface ContentSafetyResult {
  isAppropriate: boolean;
  confidence: number;
  categories: {
    adult: number;
    violence: number;
    racy: number;
    medical: number;
    spoof: number;
  };
  flagged: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ContentReport {
  imageUrl: string;
  userId?: string;
  ipAddress: string;
  reason: 'inappropriate' | 'sexual' | 'violent' | 'spam' | 'other';
  description: string;
  timestamp: Date;
}

/**
 * Content Safety Check using Dual-Provider Strategy
 * Primary: Sightengine (95% accuracy, 2000/month)
 * Fallback: Cloudinary AWS Rekognition (25,000/month)
 * This ensures best accuracy with high availability
 */
export async function checkImageContentSafety(
  imageUrl: string,
  apiKey?: string, // Kept for backward compatibility
  publicId?: string // New: Optional publicId for private/signed images
): Promise<ContentSafetyResult> {
  try {
    // Try Sightengine first (best accuracy)
    const sightengineResult = await checkWithSightengine(imageUrl);
    if (sightengineResult) {
      console.log('✅ Using Sightengine moderation (primary provider)');
      return sightengineResult;
    }

    // Fallback to Cloudinary if Sightengine fails or quota exhausted
    console.log('⚠️ Sightengine unavailable, falling back to Cloudinary...');
    const cloudinaryResult = await checkWithCloudinary(imageUrl, publicId);
    if (cloudinaryResult) {
      console.log('✅ Using Cloudinary moderation (fallback provider)');
      return cloudinaryResult;
    }

    // If both fail, use basic checks
    console.warn('⚠️ Both providers failed, using basic content check');
    return performBasicContentCheck(imageUrl);

  } catch (error) {
    console.error('❌ Content moderation failed:', error);
    return performBasicContentCheck(imageUrl);
  }
}

/**
 * Sightengine Content Moderation (Primary Provider)
 * Industry-leading accuracy: 95%+
 * Free tier: 2,000 requests/month
 */
async function checkWithSightengine(imageUrl: string): Promise<ContentSafetyResult | null> {
  try {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_KEY;

    if (!apiUser || !apiSecret) {
      console.warn('⚠️ Sightengine credentials missing');
      return null;
    }

    // Sightengine API endpoint
    const params = new URLSearchParams({
      url: imageUrl,
      models: 'nudity-2.0,wad,offensive,gore,qr-content',
      api_user: apiUser,
      api_secret: apiSecret
    });

    const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('⚠️ Sightengine quota exhausted (429)');
      } else {
        console.error(`Sightengine API error: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();

    // Parse Sightengine response
    const categories = {
      adult: 0,
      violence: 0,
      racy: 0,
      medical: 0,
      spoof: 0
    };

    const flagged: string[] = [];

    // Nudity detection
    if (data.nudity) {
      const nudityScore = Math.round((data.nudity.sexual_activity || 0) * 10);
      const rawScore = Math.round((data.nudity.raw || 0) * 10);
      categories.adult = Math.max(nudityScore, rawScore);
      if (categories.adult >= 7) flagged.push('adult');
    }

    // Weapons, Alcohol, Drugs (WAD)
    if (data.weapon) {
      categories.violence = Math.round((data.weapon || 0) * 10);
      if (categories.violence >= 7) flagged.push('violence');
    }

    // Offensive content
    if (data.offensive) {
      const offensiveScore = Math.round((data.offensive.prob || 0) * 10);
      categories.racy = Math.max(categories.racy, offensiveScore);
      if (offensiveScore >= 7) flagged.push('racy');
    }

    // Gore detection
    if (data.gore) {
      const goreScore = Math.round((data.gore.prob || 0) * 10);
      categories.violence = Math.max(categories.violence, goreScore);
      if (goreScore >= 7 && !flagged.includes('violence')) flagged.push('violence');
    }

    const maxScore = Math.max(
      categories.adult,
      categories.violence,
      categories.racy,
      categories.medical,
      categories.spoof
    );

    const isAppropriate = maxScore < 7;
    const confidence = 0.95; // Sightengine has 95%+ accuracy

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (maxScore >= 8) riskLevel = 'high';
    else if (maxScore >= 5) riskLevel = 'medium';

    return {
      isAppropriate,
      confidence,
      categories,
      flagged,
      riskLevel
    };

  } catch (error) {
    console.error('❌ Sightengine check failed:', error);
    return null;
  }
}

/**
 * Cloudinary Content Moderation (Fallback Provider)
 * Uses AWS Rekognition via Cloudinary
 * Free tier: 25,000 requests/month
 */
async function checkWithCloudinary(imageUrl: string, providedPublicId?: string): Promise<ContentSafetyResult | null> {
  try {
    // Extract Cloudinary public ID from URL or use provided ID
    const publicId = providedPublicId || extractCloudinaryPublicId(imageUrl);

    if (!publicId) {
      console.warn('⚠️ Not a Cloudinary URL and no publicId provided');
      return null;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKeyCloud = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKeyCloud || !apiSecret) {
      console.warn('⚠️ Cloudinary credentials missing');
      return null;
    }

    // Use Cloudinary Moderation API with AWS Rekognition
    const moderationUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${publicId}?moderation_status=true`;

    const auth = Buffer.from(`${apiKeyCloud}:${apiSecret}`).toString('base64');

    const response = await fetch(moderationUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Cloudinary moderation API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const moderation = data.moderation?.[0]; // AWS Rekognition results

    if (!moderation) {
      // No moderation data, assume safe
      return {
        isAppropriate: true,
        confidence: 0.7,
        categories: {
          adult: 0,
          violence: 0,
          racy: 0,
          medical: 0,
          spoof: 0
        },
        flagged: [],
        riskLevel: 'low'
      };
    }

    // Parse AWS Rekognition moderation labels
    const labels = moderation.moderation_labels || [];
    const categories = {
      adult: 0,
      violence: 0,
      racy: 0,
      medical: 0,
      spoof: 0
    };

    const flagged: string[] = [];

    // Map AWS Rekognition labels to our categories
    labels.forEach((label: any) => {
      const name = label.name?.toLowerCase() || '';
      const confidence = label.confidence || 0;
      const score = Math.round(confidence / 10); // Convert 0-100 to 0-10

      if (name.includes('nudity') || name.includes('explicit')) {
        categories.adult = Math.max(categories.adult, score);
        if (score >= 7) flagged.push('adult');
      } else if (name.includes('violence') || name.includes('weapon') || name.includes('blood')) {
        categories.violence = Math.max(categories.violence, score);
        if (score >= 7) flagged.push('violence');
      } else if (name.includes('suggestive') || name.includes('revealing')) {
        categories.racy = Math.max(categories.racy, score);
        if (score >= 7) flagged.push('racy');
      }
    });

    const maxScore = Math.max(
      categories.adult,
      categories.violence,
      categories.racy,
      categories.medical,
      categories.spoof
    );

    const isAppropriate = maxScore < 7;
    const confidence = moderation.confidence ? moderation.confidence / 100 : 0.7;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (maxScore >= 8) riskLevel = 'high';
    else if (maxScore >= 5) riskLevel = 'medium';

    return {
      isAppropriate,
      confidence,
      categories,
      flagged,
      riskLevel
    };

  } catch (error) {
    console.error('❌ Cloudinary moderation failed:', error);
    return null;
  }
}

/**
 * Extract Cloudinary public ID from URL
 */
function extractCloudinaryPublicId(url: string): string | null {
  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
    // Extract: sample
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Fallback content safety check when AI analysis fails
 */
async function performBasicContentCheck(imageUrl: string): Promise<ContentSafetyResult> {
  // Basic heuristic checks
  const url = imageUrl.toLowerCase();
  const suspiciousPatterns = [
    'nsfw', 'adult', 'porn', 'sex', 'nude', 'naked',
    'violence', 'gore', 'blood', 'weapon', 'fight',
    'racy', 'provocative', 'suggestive'
  ];

  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => url.includes(pattern));

  return {
    isAppropriate: !hasSuspiciousPattern,
    confidence: 0.6, // Lower confidence for basic checks
    categories: {
      adult: hasSuspiciousPattern ? 5 : 0,
      violence: hasSuspiciousPattern ? 5 : 0,
      racy: hasSuspiciousPattern ? 5 : 0,
      medical: 0,
      spoof: 0
    },
    flagged: hasSuspiciousPattern ? ['suspicious_url'] : [],
    riskLevel: hasSuspiciousPattern ? 'medium' : 'low'
  };
}

/**
 * Convert image URL to base64 for API calls
 */
async function getImageBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15000) // 15 second timeout for image fetching
    });
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('Failed to process image for content safety check');
  }
}

/**
 * Report inappropriate content for admin review
 */
export async function reportInappropriateContent(
  report: ContentReport
): Promise<void> {
  try {
    // Save report to database for admin review
    const response = await fetch('/api/admin/moderation/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'image',
        contentId: report.imageUrl,
        reportedBy: report.userId || 'anonymous',
        reportedUser: 'system',
        reason: report.reason,
        description: report.description,
        severity: 'high',
        status: 'pending'
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout for internal API call
    });

    if (!response.ok) {
      console.error('Failed to save content report:', response.status);
    }
  } catch (error) {
    console.error('Error reporting inappropriate content:', error);
  }
}

/**
 * Get content safety guidelines for users
 */
export function getContentSafetyGuidelines(): string[] {
  return [
    "🚫 No nudity, sexual content, or adult material",
    "🚫 No violence, gore, or graphic content",
    "🚫 No hate speech or discriminatory content",
    "🚫 No spam, scams, or misleading content",
    "🚫 No illegal activities or harmful content",
    "✅ Keep content family-friendly and appropriate",
    "✅ Report any violations you encounter",
    "✅ Help maintain a safe community environment"
  ];
}

/**
 * Validate image before processing
 */
export function validateImageForProcessing(
  file: File,
  imageUrl: string
): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Invalid file type. Please upload an image.' };
  }

  // Check for suspicious file names
  const fileName = file.name.toLowerCase();
  const suspiciousNames = ['nsfw', 'adult', 'porn', 'sex', 'nude', 'naked'];
  if (suspiciousNames.some(name => fileName.includes(name))) {
    return { isValid: false, error: 'File name contains inappropriate content.' };
  }

  // Check URL for suspicious patterns
  const url = imageUrl.toLowerCase();
  if (suspiciousNames.some(name => url.includes(name))) {
    return { isValid: false, error: 'Image URL contains inappropriate content.' };
  }

  return { isValid: true };
}

